import { defineSingleProviderPluginEntry } from "openclaw/plugin-sdk/provider-entry";
import { applyXaiModelCompat } from "openclaw/plugin-sdk/provider-tools";
import { normalizeLowercaseStringOrEmpty } from "openclaw/plugin-sdk/text-runtime";
import { applyVeniceConfig, VENICE_DEFAULT_MODEL_REF } from "./onboard.js";
import { buildVeniceProvider } from "./provider-catalog.js";

const PROVIDER_ID = "venice";

function isXaiBackedVeniceModel(modelId: string): boolean {
  return normalizeLowercaseStringOrEmpty(modelId).includes("grok");
}

export default defineSingleProviderPluginEntry({
  id: PROVIDER_ID,
  name: "Venice Provider",
  description: "Bundled Venice provider plugin",
  provider: {
    label: "Venice",
    docsPath: "/providers/venice",
    auth: [
      {
        methodId: "api-key",
        label: "Venice AI API 密钥",
        hint: "隐私优先（无审查模型）",
        optionKey: "veniceApiKey",
        flagName: "--venice-api-key",
        envVar: "VENICE_API_KEY",
        promptMessage: "输入 Venice AI API 密钥",
        defaultModel: VENICE_DEFAULT_MODEL_REF,
        applyConfig: (cfg) => applyVeniceConfig(cfg),
        noteMessage: [
          "Venice AI 提供注重隐私的推理（使用无审查模型）。",
          "在此获取 API 密钥: https://venice.ai/settings/api",
          "支持 'private' (完全私有) 和 'anonymized' (代理) 模式。",
        ].join("\n"),
        noteTitle: "Venice AI",
        wizard: {
          groupLabel: "Venice AI",
        },
      },
    ],
    catalog: {
      buildProvider: buildVeniceProvider,
    },
    normalizeResolvedModel: ({ modelId, model }) =>
      isXaiBackedVeniceModel(modelId) ? applyXaiModelCompat(model) : undefined,
  },
});
