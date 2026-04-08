import { resolveChannelDefaultAccountId } from "../channels/plugins/helpers.js";
import { getChannelSetupPlugin } from "../channels/plugins/setup-registry.js";
import type { ChannelSetupPlugin } from "../channels/plugins/setup-wizard-types.js";
import { formatCliCommand } from "../cli/command-format.js";
import type {
  ChannelSetupDmPolicy,
  ChannelSetupWizardAdapter,
} from "../commands/channel-setup/types.js";
import type { ChannelChoice } from "../commands/onboard-types.js";
import type { OpenClawConfig } from "../config/config.js";
import type { DmPolicy } from "../config/types.js";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "../routing/session-key.js";
import { formatDocsLink } from "../terminal/links.js";
import type { WizardPrompter, WizardSelectOption } from "../wizard/prompts.js";

export type ConfiguredChannelAction = "update" | "disable" | "delete" | "skip";

export function formatAccountLabel(accountId: string): string {
  return accountId === DEFAULT_ACCOUNT_ID ? "默认 (主账户)" : accountId;
}

export async function promptConfiguredAction(params: {
  prompter: WizardPrompter;
  label: string;
  supportsDisable: boolean;
  supportsDelete: boolean;
}): Promise<ConfiguredChannelAction> {
  const { prompter, label, supportsDisable, supportsDelete } = params;
  const options: Array<WizardSelectOption<ConfiguredChannelAction>> = [
    {
      value: "update",
      label: "修改设置",
    },
    ...(supportsDisable
      ? [
          {
            value: "disable" as const,
            label: "禁用 (保留配置)",
          },
        ]
      : []),
    ...(supportsDelete
      ? [
          {
            value: "delete" as const,
            label: "删除配置",
          },
        ]
      : []),
    {
      value: "skip",
      label: "跳过 (保持原样)",
    },
  ];
  return await prompter.select({
    message: `${label} 已配置。你想做什么？`,
    options,
    initialValue: "update",
  });
}

export async function promptRemovalAccountId(params: {
  cfg: OpenClawConfig;
  prompter: WizardPrompter;
  label: string;
  channel: ChannelChoice;
  plugin?: ChannelSetupPlugin;
}): Promise<string> {
  const { cfg, prompter, label, channel } = params;
  const plugin = params.plugin ?? getChannelSetupPlugin(channel);
  if (!plugin) {
    return DEFAULT_ACCOUNT_ID;
  }
  const accountIds = plugin.config.listAccountIds(cfg).filter(Boolean);
  const defaultAccountId = resolveChannelDefaultAccountId({ plugin, cfg, accountIds });
  if (accountIds.length <= 1) {
    return defaultAccountId;
  }
  const selected = await prompter.select({
    message: `${label} 账户`,
    options: accountIds.map((accountId) => ({
      value: accountId,
      label: formatAccountLabel(accountId),
    })),
    initialValue: defaultAccountId,
  });
  return normalizeAccountId(selected) ?? defaultAccountId;
}

export async function maybeConfigureDmPolicies(params: {
  cfg: OpenClawConfig;
  selection: ChannelChoice[];
  prompter: WizardPrompter;
  accountIdsByChannel?: Map<ChannelChoice, string>;
  resolveAdapter?: (channel: ChannelChoice) => ChannelSetupWizardAdapter | undefined;
}): Promise<OpenClawConfig> {
  const { selection, prompter, accountIdsByChannel } = params;
  const resolve = params.resolveAdapter ?? (() => undefined);
  const dmPolicies = selection
    .map((channel) => resolve(channel)?.dmPolicy)
    .filter(Boolean) as ChannelSetupDmPolicy[];
  if (dmPolicies.length === 0) {
    return params.cfg;
  }

  const wants = await prompter.confirm({
    message: "现在配置私信访问策略吗？(默认: 配对)",
    initialValue: false,
  });
  if (!wants) {
    return params.cfg;
  }

  let cfg = params.cfg;
  for (const policy of dmPolicies) {
    const accountId = accountIdsByChannel?.get(policy.channel);
    const { policyKey, allowFromKey } = policy.resolveConfigKeys?.(cfg, accountId) ?? {
      policyKey: policy.policyKey,
      allowFromKey: policy.allowFromKey,
    };
    await prompter.note(
      [
        "默认: 配对 (未知私信将获得配对码)。",
        `批准: ${formatCliCommand(`openclaw pairing approve ${policy.channel} <code>`)}`,
        `白名单私信: ${policyKey}="allowlist" + ${allowFromKey} 条目。`,
        `公开私信: ${policyKey}="open" + ${allowFromKey} 包含 "*"。`,
        "Multi-user DMs: run: " +
          formatCliCommand('openclaw config set session.dmScope "per-channel-peer"') +
          ' (or "per-account-channel-peer" for multi-account channels) to isolate sessions.',
        `Docs: ${formatDocsLink("/channels/pairing", "channels/pairing")}`,
      ].join("\n"),
      `${policy.label} DM access`,
    );
    const nextPolicy = (await prompter.select({
      message: `${policy.label} 私信策略`,
      options: [
        { value: "pairing", label: "配对 (推荐)" },
        { value: "allowlist", label: "白名单 (仅特定用户)" },
        { value: "open", label: "开放 (公开入站私信)" },
        { value: "已禁用", label: "禁用 (忽略私信)" },
      ],
    })) as DmPolicy;
    const current = policy.getCurrent(cfg, accountId);
    if (nextPolicy !== current) {
      cfg = policy.setPolicy(cfg, nextPolicy, accountId);
    }
    if (nextPolicy === "allowlist" && policy.promptAllowFrom) {
      cfg = await policy.promptAllowFrom({
        cfg,
        prompter,
        accountId,
      });
    }
  }

  return cfg;
}
