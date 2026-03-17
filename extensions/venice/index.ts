import { emptyPluginConfigSchema, type OpenClawPluginApi } from "openclaw/plugin-sdk/core";
import { buildVeniceProvider } from "../../src/agents/models-config.providers.discovery.js";
import { applyVeniceConfig, VENICE_DEFAULT_MODEL_REF } from "../../src/commands/onboard-auth.js";
import { createProviderApiKeyAuthMethod } from "../../src/plugins/provider-api-key-auth.js";

const PROVIDER_ID = "venice";

const venicePlugin = {
  id: PROVIDER_ID,
  name: "Venice Provider",
  description: "Bundled Venice provider plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    api.registerProvider({
      id: PROVIDER_ID,
      label: "Venice",
      docsPath: "/providers/venice",
      envVars: ["VENICE_API_KEY"],
      auth: [
        createProviderApiKeyAuthMethod({
          providerId: PROVIDER_ID,
          methodId: "api-key",
          label: "Venice AI API key",
          hint: "Privacy-focused (uncensored models)",
          optionKey: "veniceApiKey",
          flagName: "--venice-api-key",
          envVar: "VENICE_API_KEY",
          promptMessage: "输入 Venice AI API 密钥",
          defaultModel: VENICE_DEFAULT_MODEL_REF,
          expectedProviders: ["venice"],
          applyConfig: (cfg) => applyVeniceConfig(cfg),
          noteMessage: [
            "Venice AI 提供注重隐私的推理（使用无审查模型）。",
            "在此获取 API 密钥: https://venice.ai/settings/api",
            "支持 'private' (完全私有) 和 'anonymized' (代理) 模式。",
          ].join("\n"),
          noteTitle: "Venice AI",
          wizard: {
            choiceId: "venice-api-key",
            choiceLabel: "Venice AI API key",
            groupId: "venice",
            groupLabel: "Venice AI",
            groupHint: "Privacy-focused (uncensored models)",
          },
        }),
      ],
      catalog: {
        order: "simple",
        run: async (ctx) => {
          const apiKey = ctx.resolveProviderApiKey(PROVIDER_ID).apiKey;
          if (!apiKey) {
            return null;
          }
          return {
            provider: {
              ...(await buildVeniceProvider()),
              apiKey,
            },
          };
        },
      },
    });
  },
};

export default venicePlugin;
