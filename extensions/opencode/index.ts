import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { createProviderApiKeyAuthMethod } from "openclaw/plugin-sdk/provider-auth-api-key";
import {
  buildProviderReplayFamilyHooks,
  matchesExactOrPrefix,
} from "openclaw/plugin-sdk/provider-model-shared";
import { applyOpencodeZenConfig, OPENCODE_ZEN_DEFAULT_MODEL } from "./api.js";

const PROVIDER_ID = "opencode";
const MINIMAX_MODERN_MODEL_MATCHERS = ["minimax-m2.7"] as const;
const PASSTHROUGH_GEMINI_REPLAY_HOOKS = buildProviderReplayFamilyHooks({
  family: "passthrough-gemini",
});

function isModernOpencodeModel(modelId: string): boolean {
  const lower = modelId.trim().toLowerCase();
  if (lower.endsWith("-free") || lower === "alpha-glm-4.7") {
    return false;
  }
  return !matchesExactOrPrefix(lower, MINIMAX_MODERN_MODEL_MATCHERS);
}

export default definePluginEntry({
  id: PROVIDER_ID,
  name: "OpenCode Zen Provider",
  description: "Bundled OpenCode Zen provider plugin",
  register(api) {
    api.registerProvider({
      id: PROVIDER_ID,
      label: "OpenCode Zen",
      docsPath: "/providers/models",
      envVars: ["OPENCODE_API_KEY", "OPENCODE_ZEN_API_KEY"],
      auth: [
        createProviderApiKeyAuthMethod({
          providerId: PROVIDER_ID,
          methodId: "api-key",
          label: "OpenCode Zen 目录",
          hint: "Zen + Go 目录共享 API 密钥",
          optionKey: "opencodeZenApiKey",
          flagName: "--opencode-zen-api-key",
          envVar: "OPENCODE_API_KEY",
          promptMessage: "输入 OpenCode API 密钥",
          profileIds: ["opencode:default", "opencode-go:default"],
          defaultModel: OPENCODE_ZEN_DEFAULT_MODEL,
          expectedProviders: ["opencode", "opencode-go"],
          applyConfig: (cfg) => applyOpencodeZenConfig(cfg),
          noteMessage: [
            "OpenCode 使用一个 API 密钥，同时适用于 Zen 和 Go 目录。",
            "Zen 提供对 Claude、GPT、Gemini 等模型的访问。",
            "在此获取 API 密钥: https://opencode.ai/auth",
            "选择 Zen 目录以使用精选的多模型代理。",
          ].join("\n"),
          noteTitle: "OpenCode",
          wizard: {
            choiceId: "opencode-zen",
            choiceLabel: "OpenCode Zen catalog",
            groupId: "opencode",
            groupLabel: "OpenCode",
            groupHint: "Zen + Go 目录共享 API 密钥",
          },
        }),
      ],
      ...PASSTHROUGH_GEMINI_REPLAY_HOOKS,
      isModernModelRef: ({ modelId }) => isModernOpencodeModel(modelId),
    });
  },
});
