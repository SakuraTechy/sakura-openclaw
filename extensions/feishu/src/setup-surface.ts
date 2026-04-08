import {
  buildSingleChannelSecretPromptState,
  DEFAULT_ACCOUNT_ID,
  formatDocsLink,
  hasConfiguredSecretInput,
  mergeAllowFromEntries,
  patchTopLevelChannelConfigSection,
  promptSingleChannelSecretInput,
  splitSetupEntries,
  type ChannelSetupDmPolicy,
  type ChannelSetupWizard,
  type OpenClawConfig,
  type SecretInput,
} from "openclaw/plugin-sdk/setup";
import {
  inspectFeishuCredentials,
  resolveDefaultFeishuAccountId,
  resolveFeishuAccount,
} from "./accounts.js";
import { normalizeString } from "./comment-shared.js";
import { probeFeishu } from "./probe.js";
import type { FeishuAccountConfig, FeishuConfig } from "./types.js";

const channel = "feishu" as const;

type ScopedFeishuConfig = Partial<FeishuConfig> & Partial<FeishuAccountConfig>;

function getScopedFeishuConfig(cfg: OpenClawConfig, accountId: string): ScopedFeishuConfig {
  const feishuCfg = cfg.channels?.feishu as FeishuConfig | undefined;
  if (accountId === DEFAULT_ACCOUNT_ID) {
    return feishuCfg ?? {};
  }
  return feishuCfg?.accounts?.[accountId] ?? {};
}

function patchFeishuConfig(
  cfg: OpenClawConfig,
  accountId: string,
  patch: Record<string, unknown>,
): OpenClawConfig {
  const feishuCfg = cfg.channels?.feishu as FeishuConfig | undefined;
  if (accountId === DEFAULT_ACCOUNT_ID) {
    return patchTopLevelChannelConfigSection({
      cfg,
      channel,
      enabled: true,
      patch,
    });
  }
  const nextAccountPatch = {
    ...(feishuCfg?.accounts?.[accountId] as Record<string, unknown> | undefined),
    enabled: true,
    ...patch,
  };
  return patchTopLevelChannelConfigSection({
    cfg,
    channel,
    enabled: true,
    patch: {
      accounts: {
        ...feishuCfg?.accounts,
        [accountId]: nextAccountPatch,
      },
    },
  });
}

function setFeishuAllowFrom(
  cfg: OpenClawConfig,
  accountId: string,
  allowFrom: string[],
): OpenClawConfig {
  return patchFeishuConfig(cfg, accountId, { allowFrom });
}

function setFeishuGroupPolicy(
  cfg: OpenClawConfig,
  accountId: string,
  groupPolicy: "open" | "allowlist" | "disabled",
): OpenClawConfig {
  return patchFeishuConfig(cfg, accountId, { groupPolicy });
}

function setFeishuGroupAllowFrom(
  cfg: OpenClawConfig,
  accountId: string,
  groupAllowFrom: string[],
): OpenClawConfig {
  return patchFeishuConfig(cfg, accountId, { groupAllowFrom });
}

function isFeishuConfigured(cfg: OpenClawConfig, accountId?: string | null): boolean {
  const feishuCfg = ((cfg.channels?.feishu as FeishuConfig | undefined) ?? {}) as FeishuConfig;
  const resolvedAccountId = normalizeString(accountId) ?? resolveDefaultFeishuAccountId(cfg);

  const isAppIdConfigured = (value: unknown): boolean => {
    const asString = normalizeString(value);
    if (asString) {
      return true;
    }
    if (!value || typeof value !== "object") {
      return false;
    }
    const rec = value as Record<string, unknown>;
    const source = normalizeString(rec.source)?.toLowerCase();
    const id = normalizeString(rec.id);
    if (source === "env" && id) {
      return Boolean(normalizeString(process.env[id]));
    }
    return hasConfiguredSecretInput(value);
  };

  const topLevelConfigured = Boolean(
    isAppIdConfigured(feishuCfg?.appId) && hasConfiguredSecretInput(feishuCfg?.appSecret),
  );

  if (resolvedAccountId === DEFAULT_ACCOUNT_ID) {
    return topLevelConfigured;
  }

  const account = feishuCfg.accounts?.[resolvedAccountId];
  if (!account || typeof account !== "object") {
    return topLevelConfigured;
  }

  const hasOwnAppId = Object.prototype.hasOwnProperty.call(account, "appId");
  const hasOwnAppSecret = Object.prototype.hasOwnProperty.call(account, "appSecret");
  const accountAppIdConfigured = hasOwnAppId
    ? isAppIdConfigured((account as Record<string, unknown>).appId)
    : isAppIdConfigured(feishuCfg?.appId);
  const accountSecretConfigured = hasOwnAppSecret
    ? hasConfiguredSecretInput((account as Record<string, unknown>).appSecret)
    : hasConfiguredSecretInput(feishuCfg?.appSecret);

  return Boolean(accountAppIdConfigured && accountSecretConfigured);
}

async function promptFeishuAllowFrom(params: {
  cfg: OpenClawConfig;
  accountId: string;
  prompter: Parameters<NonNullable<ChannelSetupDmPolicy["promptAllowFrom"]>>[0]["prompter"];
}): Promise<OpenClawConfig> {
  const existingAllowFrom =
    resolveFeishuAccount({
      cfg: params.cfg,
      accountId: params.accountId,
    }).config.allowFrom ?? [];
  await params.prompter.note(
    [
      "通过 open_id 或 user_id 将 Feishu 私信列入白名单。",
      "您可以在 Feishu 管理控制台或通过 API 找到用户的 open_id。",
      "Examples:",
      "- ou_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "- on_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    ].join("\n"),
    "Feishu allowlist",
  );
  const entry = await params.prompter.text({
    message: "Feishu 允许列表 (用户 open_id)",
    placeholder: "ou_xxxxx, ou_yyyyy",
    initialValue:
      existingAllowFrom.length > 0 ? existingAllowFrom.map(String).join(", ") : undefined,
  });
  const mergedAllowFrom = mergeAllowFromEntries(
    existingAllowFrom,
    splitSetupEntries(String(entry)),
  );
  return setFeishuAllowFrom(params.cfg, params.accountId, mergedAllowFrom);
}

async function noteFeishuCredentialHelp(
  prompter: Parameters<NonNullable<ChannelSetupWizard["finalize"]>>[0]["prompter"],
): Promise<void> {
  await prompter.note(
    [
      "1) 访问飞书开放平台 (open.feishu.cn)",
      "2) 创建一个自建应用",
      "3) 从凭证页面获取 App ID 和 App Secret",
      "4) 启用必要权限: im:message, im:chat, contact:user.base:readonly",
      "5) 发布应用或将其添加到测试组",
      "提示: 您也可以设置 FEISHU_APP_ID / FEISHU_APP_SECRET 环境变量。",
      `Docs: ${formatDocsLink("/channels/feishu", "feishu")}`,
    ].join("\n"),
    "飞书凭证",
  );
}

async function promptFeishuAppId(params: {
  prompter: Parameters<NonNullable<ChannelSetupWizard["finalize"]>>[0]["prompter"];
  initialValue?: string;
}): Promise<string> {
  return String(
    await params.prompter.text({
      message: "输入飞书 App ID",
      initialValue: params.initialValue,
      validate: (value) => (value?.trim() ? undefined : "Required"),
    }),
  ).trim();
}

const feishuDmPolicy: ChannelSetupDmPolicy = {
  label: "Feishu",
  channel,
  policyKey: "channels.feishu.dmPolicy",
  allowFromKey: "channels.feishu.allowFrom",
  resolveConfigKeys: (_cfg, accountId) => {
    const resolvedAccountId = accountId ?? resolveDefaultFeishuAccountId(_cfg);
    return resolvedAccountId !== DEFAULT_ACCOUNT_ID
      ? {
          policyKey: `channels.feishu.accounts.${resolvedAccountId}.dmPolicy`,
          allowFromKey: `channels.feishu.accounts.${resolvedAccountId}.allowFrom`,
        }
      : {
          policyKey: "channels.feishu.dmPolicy",
          allowFromKey: "channels.feishu.allowFrom",
        };
  },
  getCurrent: (cfg, accountId) =>
    resolveFeishuAccount({
      cfg,
      accountId: accountId ?? resolveDefaultFeishuAccountId(cfg),
    }).config.dmPolicy ?? "pairing",
  setPolicy: (cfg, policy, accountId) => {
    const resolvedAccountId = accountId ?? resolveDefaultFeishuAccountId(cfg);
    const currentAllowFrom = resolveFeishuAccount({
      cfg,
      accountId: resolvedAccountId,
    }).config.allowFrom;
    return patchFeishuConfig(cfg, resolvedAccountId, {
      dmPolicy: policy,
      ...(policy === "open" ? { allowFrom: mergeAllowFromEntries(currentAllowFrom, ["*"]) } : {}),
    });
  },
  promptAllowFrom: async ({ cfg, accountId, prompter }) =>
    await promptFeishuAllowFrom({
      cfg,
      accountId: accountId ?? resolveDefaultFeishuAccountId(cfg),
      prompter,
    }),
};

export { feishuSetupAdapter } from "./setup-core.js";

export const feishuSetupWizard: ChannelSetupWizard = {
  channel,
  resolveAccountIdForConfigure: ({ accountOverride, defaultAccountId }) =>
    normalizeString(accountOverride) ?? defaultAccountId,
  resolveShouldPromptAccountIds: () => false,
  status: {
    configuredLabel: "configured",
    unconfiguredLabel: "需要应用凭证",
    configuredHint: "configured",
    unconfiguredHint: "needs app creds",
    configuredScore: 2,
    unconfiguredScore: 0,
    resolveConfigured: ({ cfg, accountId }) => isFeishuConfigured(cfg, accountId),
    resolveStatusLines: async ({ cfg, accountId, configured }) => {
      const resolvedCredentials = accountId
        ? (() => {
            const account = resolveFeishuAccount({ cfg, accountId });
            return account.configured && account.appId && account.appSecret
              ? {
                  appId: account.appId,
                  appSecret: account.appSecret,
                  encryptKey: account.encryptKey,
                  verificationToken: account.verificationToken,
                  domain: account.domain,
                }
              : null;
          })()
        : inspectFeishuCredentials(cfg.channels?.feishu as FeishuConfig | undefined);
      let probeResult = null;
      if (configured && resolvedCredentials) {
        try {
          probeResult = await probeFeishu(resolvedCredentials);
        } catch {}
      }
      if (!configured) {
        return ["飞书: 需要应用凭证"];
      }
      if (probeResult?.ok) {
        return [`飞书: 已连接为 ${probeResult.botName ?? probeResult.botOpenId ?? "机器人"}`];
      }
      return ["飞书: 已配置 (连接未验证)"];
    },
  },
  credentials: [],
  finalize: async ({ cfg, accountId, prompter, options }) => {
    const resolvedAccountId = accountId ?? resolveDefaultFeishuAccountId(cfg);
    const resolvedAccount = resolveFeishuAccount({ cfg, accountId: resolvedAccountId });
    const scopedConfig = getScopedFeishuConfig(cfg, resolvedAccountId);
    const resolved =
      resolvedAccount.configured && resolvedAccount.appId && resolvedAccount.appSecret
        ? {
            appId: resolvedAccount.appId,
            appSecret: resolvedAccount.appSecret,
            encryptKey: resolvedAccount.encryptKey,
            verificationToken: resolvedAccount.verificationToken,
            domain: resolvedAccount.domain,
          }
        : null;
    const hasConfigSecret = hasConfiguredSecretInput(scopedConfig.appSecret);
    const hasConfigCreds = Boolean(
      typeof scopedConfig.appId === "string" && scopedConfig.appId.trim() && hasConfigSecret,
    );
    const appSecretPromptState = buildSingleChannelSecretPromptState({
      accountConfigured: Boolean(resolved),
      hasConfigToken: hasConfigSecret,
      allowEnv: !hasConfigCreds && Boolean(process.env.FEISHU_APP_ID?.trim()),
      envValue: process.env.FEISHU_APP_SECRET,
    });

    let next = cfg;
    let appId: string | null = null;
    let appSecret: SecretInput | null = null;
    let appSecretProbeValue: string | null = null;

    if (!resolved) {
      await noteFeishuCredentialHelp(prompter);
    }

    const appSecretResult = await promptSingleChannelSecretInput({
      cfg: next,
      prompter,
      providerHint: "feishu",
      credentialLabel: "App Secret",
      secretInputMode: options?.secretInputMode,
      accountConfigured: appSecretPromptState.accountConfigured,
      canUseEnv: appSecretPromptState.canUseEnv,
      hasConfigToken: appSecretPromptState.hasConfigToken,
      envPrompt: "检测到 FEISHU_APP_ID + FEISHU_APP_SECRET。使用环境变量？",
      keepPrompt: "飞书 App Secret 已配置。保留它？",
      inputPrompt: "输入飞书 App Secret",
      preferredEnvVar: "FEISHU_APP_SECRET",
    });

    if (appSecretResult.action === "use-env") {
      next = patchFeishuConfig(next, resolvedAccountId, {});
    } else if (appSecretResult.action === "set") {
      appSecret = appSecretResult.value;
      appSecretProbeValue = appSecretResult.resolvedValue;
      appId = await promptFeishuAppId({
        prompter,
        initialValue:
          normalizeString(scopedConfig.appId) ?? normalizeString(process.env.FEISHU_APP_ID),
      });
    }

    if (appId && appSecret) {
      next = patchFeishuConfig(next, resolvedAccountId, {
        appId,
        appSecret,
      });

      try {
        const probe = await probeFeishu({
          appId,
          appSecret: appSecretProbeValue ?? undefined,
          domain: resolveFeishuAccount({ cfg: next, accountId: resolvedAccountId }).domain,
        });
        if (probe.ok) {
          await prompter.note(
            `已连接为 ${probe.botName ?? probe.botOpenId ?? "机器人"}`,
            "Feishu connection test",
          );
        } else {
          await prompter.note(
            `连接失败: ${probe.error ?? "未知错误"}`,
            "Feishu connection test",
          );
        }
      } catch (err) {
        await prompter.note(`连接测试失败: ${String(err)}`, "Feishu connection test");
      }
    }

    const currentMode =
      resolveFeishuAccount({ cfg: next, accountId: resolvedAccountId }).config.connectionMode ??
      "websocket";
    const connectionMode = (await prompter.select({
      message: "飞书连接模式",
      options: [
        { value: "websocket", label: "WebSocket (default)" },
        { value: "webhook", label: "Webhook" },
      ],
      initialValue: currentMode,
    })) as "websocket" | "webhook";
    next = patchFeishuConfig(next, resolvedAccountId, { connectionMode });

    if (connectionMode === "webhook") {
      const currentVerificationToken = getScopedFeishuConfig(
        next,
        resolvedAccountId,
      ).verificationToken;
      const verificationTokenResult = await promptSingleChannelSecretInput({
        cfg: next,
        prompter,
        providerHint: "feishu-webhook",
        credentialLabel: "verification token",
        secretInputMode: options?.secretInputMode,
        ...buildSingleChannelSecretPromptState({
          accountConfigured: hasConfiguredSecretInput(currentVerificationToken),
          hasConfigToken: hasConfiguredSecretInput(currentVerificationToken),
          allowEnv: false,
        }),
        envPrompt: "",
        keepPrompt: "飞书验证令牌已配置。保留它？",
        inputPrompt: "输入飞书验证令牌",
        preferredEnvVar: "FEISHU_VERIFICATION_TOKEN",
      });
      if (verificationTokenResult.action === "set") {
        next = patchFeishuConfig(next, resolvedAccountId, {
          verificationToken: verificationTokenResult.value,
        });
      }

      const currentEncryptKey = getScopedFeishuConfig(next, resolvedAccountId).encryptKey;
      const encryptKeyResult = await promptSingleChannelSecretInput({
        cfg: next,
        prompter,
        providerHint: "feishu-webhook",
        credentialLabel: "encrypt key",
        secretInputMode: options?.secretInputMode,
        ...buildSingleChannelSecretPromptState({
          accountConfigured: hasConfiguredSecretInput(currentEncryptKey),
          hasConfigToken: hasConfiguredSecretInput(currentEncryptKey),
          allowEnv: false,
        }),
        envPrompt: "",
        keepPrompt: "飞书加密密钥已配置。保留它？",
        inputPrompt: "输入飞书加密密钥",
        preferredEnvVar: "FEISHU_ENCRYPT_KEY",
      });
      if (encryptKeyResult.action === "set") {
        next = patchFeishuConfig(next, resolvedAccountId, {
          encryptKey: encryptKeyResult.value,
        });
      }

      const currentWebhookPath = getScopedFeishuConfig(next, resolvedAccountId).webhookPath;
      const webhookPath = String(
        await prompter.text({
          message: "飞书 Webhook 路径",
          initialValue: currentWebhookPath ?? "/feishu/events",
          validate: (value) => (String(value ?? "").trim() ? undefined : "Required"),
        }),
      ).trim();
      next = patchFeishuConfig(next, resolvedAccountId, { webhookPath });
    }

    const currentDomain = resolveFeishuAccount({ cfg: next, accountId: resolvedAccountId }).domain;
    const domain = await prompter.select({
      message: "选择哪个飞书域名？",
      options: [
        { value: "feishu", label: "飞书 (feishu.cn) - 中国" },
        { value: "lark", label: "Lark (larksuite.com) - 国际" },
      ],
      initialValue: currentDomain,
    });
    next = patchFeishuConfig(next, resolvedAccountId, {
      domain: domain as "feishu" | "lark",
    });

    const groupPolicy = (await prompter.select({
      message: "群聊策略",
      options: [
        { value: "allowlist", label: "白名单 - 仅在特定群组响应" },
        { value: "open", label: "开放 - 在所有群组响应 (需要提及)" },
        { value: "disabled", label: "禁用 - 不在群组响应" },
      ],
      initialValue:
        resolveFeishuAccount({ cfg: next, accountId: resolvedAccountId }).config.groupPolicy ??
        "allowlist",
    })) as "allowlist" | "open" | "disabled";
    next = setFeishuGroupPolicy(next, resolvedAccountId, groupPolicy);

    if (groupPolicy === "allowlist") {
      const existing =
        resolveFeishuAccount({ cfg: next, accountId: resolvedAccountId }).config.groupAllowFrom ??
        [];
      const entry = await prompter.text({
        message: "群聊白名单 (chat_id)",
        placeholder: "oc_xxxxx, oc_yyyyy",
        initialValue: existing.length > 0 ? existing.map(String).join(", ") : undefined,
      });
      if (entry) {
        const parts = splitSetupEntries(String(entry));
        if (parts.length > 0) {
          next = setFeishuGroupAllowFrom(next, resolvedAccountId, parts);
        }
      }
    }

    return { cfg: next };
  },
  dmPolicy: feishuDmPolicy,
  disable: (cfg) =>
    patchTopLevelChannelConfigSection({
      cfg,
      channel,
      patch: { enabled: false },
    }),
};
