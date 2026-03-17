import { emptyPluginConfigSchema, type OpenClawPluginApi } from "openclaw/plugin-sdk/core";
import { applyOpencodeZenConfig } from "../../src/commands/onboard-auth.config-opencode.js";
import { OPENCODE_ZEN_DEFAULT_MODEL } from "../../src/commands/opencode-zen-model-default.js";
import { createProviderApiKeyAuthMethod } from "../../src/plugins/provider-api-key-auth.js";

const PROVIDER_ID = "opencode";
const MINIMAX_PREFIX = "minimax-m2.5";

function isModernOpencodeModel(modelId: string): boolean {
  const lower = modelId.trim().toLowerCase();
  if (lower.endsWith("-free") || lower === "alpha-glm-4.7") {
    return false;
  }
  return !lower.startsWith(MINIMAX_PREFIX);
}

const opencodePlugin = {
  id: PROVIDER_ID,
  name: "OpenCode Zen Provider",
  description: "Bundled OpenCode Zen provider plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    api.registerProvider({
      id: PROVIDER_ID,
      label: "OpenCode Zen",
      docsPath: "/providers/models",
      envVars: ["OPENCODE_API_KEY", "OPENCODE_ZEN_API_KEY"],
      auth: [
        createProviderApiKeyAuthMethod({
          providerId: PROVIDER_ID,
          methodId: "api-key",
          label: "OpenCode Zen catalog",
          hint: "Shared API key for Zen + Go catalogs",
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
            groupHint: "Shared API key for Zen + Go catalogs",
          },
        }),
      ],
      capabilities: {
        openAiCompatTurnValidation: false,
        geminiThoughtSignatureSanitization: true,
        geminiThoughtSignatureModelHints: ["gemini"],
      },
      isModernModelRef: ({ modelId }) => isModernOpencodeModel(modelId),
    });
  },
};

export default opencodePlugin;
