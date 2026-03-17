import { listChannelPlugins } from "../channels/plugins/index.js";
import type { ChannelId } from "../channels/plugins/types.js";
import { formatCliCommand } from "../cli/command-format.js";
import type { OpenClawConfig, GatewayBindMode } from "../config/config.js";
import type { AgentConfig } from "../config/types.agents.js";
import { hasConfiguredSecretInput } from "../config/types.secrets.js";
import { resolveGatewayAuth } from "../gateway/auth.js";
import { isLoopbackHost, resolveGatewayBindHost } from "../gateway/net.js";
import { resolveDmAllowState } from "../security/dm-policy-shared.js";
import { note } from "../terminal/note.js";
import { resolveDefaultChannelAccountContext } from "./channel-account-context.js";

function collectImplicitHeartbeatDirectPolicyWarnings(cfg: OpenClawConfig): string[] {
  const warnings: string[] = [];

  const maybeWarn = (params: {
    label: string;
    heartbeat: AgentConfig["heartbeat"] | undefined;
    pathHint: string;
  }) => {
    const heartbeat = params.heartbeat;
    if (!heartbeat || heartbeat.target === undefined || heartbeat.target === "none") {
      return;
    }
    if (heartbeat.directPolicy !== undefined) {
      return;
    }
    warnings.push(
      `- ${params.label}: heartbeat delivery is configured while ${params.pathHint} is unset.`,
      '  Heartbeat now allows direct/DM targets by default. Set it explicitly to "allow" or "block" to pin upgrade behavior.',
    );
  };

  maybeWarn({
    label: "Heartbeat defaults",
    heartbeat: cfg.agents?.defaults?.heartbeat,
    pathHint: "agents.defaults.heartbeat.directPolicy",
  });

  for (const agent of cfg.agents?.list ?? []) {
    maybeWarn({
      label: `Heartbeat agent "${agent.id}"`,
      heartbeat: agent.heartbeat,
      pathHint: `heartbeat.directPolicy for agent "${agent.id}"`,
    });
  }

  return warnings;
}

export async function noteSecurityWarnings(cfg: OpenClawConfig) {
  const warnings: string[] = [];
  const auditHint = `- Run: ${formatCliCommand("openclaw security audit --deep")}`;

  if (cfg.approvals?.exec?.enabled === false) {
    warnings.push(
      "- 注意: approvals.exec.enabled=false 仅禁用审批转发。",
      "  主机执行控制仍来自 ~/.openclaw/exec-approvals.json。",
      `  Check local policy with: ${formatCliCommand("openclaw approvals get --gateway")}`,
    );
  }

  warnings.push(...collectImplicitHeartbeatDirectPolicyWarnings(cfg));

  // ===========================================
  // GATEWAY NETWORK EXPOSURE CHECK
  // ===========================================
  // Check for dangerous gateway binding configurations
  // that expose the gateway to network without proper auth

  const gatewayBind = (cfg.gateway?.bind ?? "loopback") as string;
  const customBindHost = cfg.gateway?.customBindHost?.trim();
  const bindModes: GatewayBindMode[] = ["auto", "lan", "loopback", "custom", "tailnet"];
  const bindMode = bindModes.includes(gatewayBind as GatewayBindMode)
    ? (gatewayBind as GatewayBindMode)
    : undefined;
  const resolvedBindHost = bindMode
    ? await resolveGatewayBindHost(bindMode, customBindHost)
    : "0.0.0.0";
  const isExposed = !isLoopbackHost(resolvedBindHost);

  const resolvedAuth = resolveGatewayAuth({
    authConfig: cfg.gateway?.auth,
    env: process.env,
    tailscaleMode: cfg.gateway?.tailscale?.mode ?? "off",
  });
  const authToken = resolvedAuth.token?.trim() ?? "";
  const authPassword = resolvedAuth.password?.trim() ?? "";
  const hasToken =
    authToken.length > 0 ||
    hasConfiguredSecretInput(cfg.gateway?.auth?.token, cfg.secrets?.defaults);
  const hasPassword =
    authPassword.length > 0 ||
    hasConfiguredSecretInput(cfg.gateway?.auth?.password, cfg.secrets?.defaults);
  const hasSharedSecret =
    (resolvedAuth.mode === "token" && hasToken) ||
    (resolvedAuth.mode === "password" && hasPassword);
  const bindDescriptor = `"${gatewayBind}" (${resolvedBindHost})`;
  const saferRemoteAccessLines = [
    "  更安全的远程访问方式: 保持绑定回环地址，使用 Tailscale Serve/Funnel 或 SSH 隧道。",
    "  隧道示例: ssh -N -L 18789:127.0.0.1:18789 user@gateway-host",
    "  Docs: https://docs.openclaw.ai/gateway/remote",
  ];

  if (isExposed) {
    if (!hasSharedSecret) {
      const authFixLines =
        resolvedAuth.mode === "password"
          ? [
              `  Fix: ${formatCliCommand("openclaw configure")} to set a password`,
              `  Or switch to token: ${formatCliCommand("openclaw config set gateway.auth.mode token")}`,
            ]
          : [
              `  Fix: ${formatCliCommand("openclaw doctor --fix")} to generate a token`,
              `  Or set token directly: ${formatCliCommand(
                "openclaw config set gateway.auth.mode token",
              )}`,
            ];
      warnings.push(
        `- 严重警告: 网关绑定到 ${bindDescriptor} 但未设置认证。`,
        `  你网络上的任何人（如果做了端口转发则是互联网上的任何人）都可以完全控制你的 AI 助手。`,
        `  Fix: ${formatCliCommand("openclaw config set gateway.bind loopback")}`,
        ...saferRemoteAccessLines,
        ...authFixLines,
      );
    } else {
      // Auth is configured, but still warn about network exposure
      warnings.push(
        `- WARNING: Gateway bound to ${bindDescriptor} (可被网络访问)。`,
        `  请确保你的认证凭据足够强且未被泄露。`,
        ...saferRemoteAccessLines,
      );
    }
  }

  const warnDmPolicy = async (params: {
    label: string;
    provider: ChannelId;
    accountId: string;
    dmPolicy: string;
    allowFrom?: Array<string | number> | null;
    policyPath?: string;
    allowFromPath: string;
    approveHint: string;
    normalizeEntry?: (raw: string) => string;
  }) => {
    const dmPolicy = params.dmPolicy;
    const policyPath = params.policyPath ?? `${params.allowFromPath}policy`;
    const { hasWildcard, allowCount, isMultiUserDm } = await resolveDmAllowState({
      provider: params.provider,
      accountId: params.accountId,
      allowFrom: params.allowFrom,
      normalizeEntry: params.normalizeEntry,
    });
    const dmScope = cfg.session?.dmScope ?? "main";

    if (dmPolicy === "open") {
      const allowFromPath = `${params.allowFromPath}allowFrom`;
      warnings.push(`- ${params.label} DMs: OPEN (${policyPath}="open"). 任何人都可以向它发私信。`);
      if (!hasWildcard) {
        warnings.push(
          `- ${params.label} DMs: config invalid — "open" requires ${allowFromPath} to include "*".`,
        );
      }
    }

    if (dmPolicy === "disabled") {
      warnings.push(`- ${params.label} DMs: disabled (${policyPath}="disabled").`);
      return;
    }

    if (dmPolicy !== "open" && allowCount === 0) {
      warnings.push(
        `- ${params.label} DMs: locked (${policyPath}="${dmPolicy}") with no allowlist; 未知发送者将被阻止 / get a pairing code.`,
      );
      warnings.push(`  ${params.approveHint}`);
    }

    if (dmScope === "main" && isMultiUserDm) {
      warnings.push(
        `- ${params.label} DMs: multiple senders share the main session; run: ` +
          formatCliCommand('openclaw config set session.dmScope "per-channel-peer"') +
          ' (or "per-account-channel-peer" for multi-account channels) to isolate sessions.',
      );
    }
  };

  for (const plugin of listChannelPlugins()) {
    if (!plugin.security) {
      continue;
    }
    const { defaultAccountId, account, enabled, configured, diagnostics } =
      await resolveDefaultChannelAccountContext(plugin, cfg, {
        mode: "read_only",
        commandName: "doctor",
      });
    for (const diagnostic of diagnostics) {
      warnings.push(`- [secrets] ${diagnostic}`);
    }
    if (!enabled) {
      continue;
    }
    if (!configured) {
      continue;
    }
    const dmPolicy = plugin.security.resolveDmPolicy?.({
      cfg,
      accountId: defaultAccountId,
      account,
    });
    if (dmPolicy) {
      await warnDmPolicy({
        label: plugin.meta.label ?? plugin.id,
        provider: plugin.id,
        accountId: defaultAccountId,
        dmPolicy: dmPolicy.policy,
        allowFrom: dmPolicy.allowFrom,
        policyPath: dmPolicy.policyPath,
        allowFromPath: dmPolicy.allowFromPath,
        approveHint: dmPolicy.approveHint,
        normalizeEntry: dmPolicy.normalizeEntry,
      });
    }
    if (plugin.security.collectWarnings) {
      const extra = await plugin.security.collectWarnings({
        cfg,
        accountId: defaultAccountId,
        account,
      });
      if (extra?.length) {
        warnings.push(...extra);
      }
    }
  }

  const lines = warnings.length > 0 ? warnings : ["- 未检测到频道安全警告。"];
  lines.push(auditHint);
  note(lines.join("\n"), "安全");
}
