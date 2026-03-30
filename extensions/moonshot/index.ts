import { defineSingleProviderPluginEntry } from "openclaw/plugin-sdk/provider-entry";
import {
  createMoonshotThinkingWrapper,
  resolveMoonshotThinkingType,
} from "openclaw/plugin-sdk/provider-stream";
import { moonshotMediaUnderstandingProvider } from "./media-understanding-provider.js";
import {
  applyMoonshotConfig,
  applyMoonshotConfigCn,
  MOONSHOT_DEFAULT_MODEL_REF,
} from "./onboard.js";
import { buildMoonshotProvider } from "./provider-catalog.js";
import { createKimiWebSearchProvider } from "./src/kimi-web-search-provider.js";

const PROVIDER_ID = "moonshot";

export default defineSingleProviderPluginEntry({
  id: PROVIDER_ID,
  name: "Moonshot Provider",
  description: "Bundled Moonshot provider plugin",
  provider: {
    label: "Moonshot",
    docsPath: "/providers/moonshot",
    auth: [
      {
        methodId: "api-key",
        label: "Kimi API 密钥（.ai）",
        hint: "Kimi K2.5 + Kimi",
        optionKey: "moonshotApiKey",
        flagName: "--moonshot-api-key",
        envVar: "MOONSHOT_API_KEY",
        promptMessage: "输入 Moonshot API 密钥",
        defaultModel: MOONSHOT_DEFAULT_MODEL_REF,
        applyConfig: (cfg) => applyMoonshotConfig(cfg),
        wizard: {
          groupLabel: "月之暗面 (Kimi K2.5)",
        },
      },
      {
        methodId: "api-key-cn",
        label: "Kimi API 密钥（.cn）",
        hint: "Kimi K2.5 + Kimi",
        optionKey: "moonshotApiKey",
        flagName: "--moonshot-api-key",
        envVar: "MOONSHOT_API_KEY",
        promptMessage: "输入 Moonshot API 密钥（.cn）",
        defaultModel: MOONSHOT_DEFAULT_MODEL_REF,
        applyConfig: (cfg) => applyMoonshotConfigCn(cfg),
        wizard: {
          groupLabel: "月之暗面 (Kimi K2.5)",
        },
      },
    ],
    catalog: {
      buildProvider: buildMoonshotProvider,
      allowExplicitBaseUrl: true,
    },
    wrapStreamFn: (ctx) => {
      const thinkingType = resolveMoonshotThinkingType({
        configuredThinking: ctx.extraParams?.thinking,
        thinkingLevel: ctx.thinkingLevel,
      });
      return createMoonshotThinkingWrapper(ctx.streamFn, thinkingType);
    },
  },
  register(api) {
    api.registerMediaUnderstandingProvider(moonshotMediaUnderstandingProvider);
    api.registerWebSearchProvider(createKimiWebSearchProvider());
  },
});
