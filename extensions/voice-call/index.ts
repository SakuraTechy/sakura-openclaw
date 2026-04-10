import { Type } from "@sinclair/typebox";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import { normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import {
  definePluginEntry,
  type GatewayRequestHandlerOptions,
  type OpenClawPluginApi,
} from "./api.js";
import { createVoiceCallRuntime, type VoiceCallRuntime } from "./runtime-entry.js";
import { registerVoiceCallCli } from "./src/cli.js";
import {
  formatVoiceCallLegacyConfigWarnings,
  normalizeVoiceCallLegacyConfigInput,
  parseVoiceCallPluginConfig,
} from "./src/config-compat.js";
import {
  resolveVoiceCallConfig,
  validateProviderConfig,
  type VoiceCallConfig,
} from "./src/config.js";
import type { CoreConfig } from "./src/core-bridge.js";

const voiceCallConfigSchema = {
  parse(value: unknown): VoiceCallConfig {
    const normalized = normalizeVoiceCallLegacyConfigInput(value);
    const enabled = typeof normalized.enabled === "boolean" ? normalized.enabled : true;
    return parseVoiceCallPluginConfig({
      ...normalized,
      enabled,
      provider: normalized.provider ?? (enabled ? "mock" : undefined),
    });
  },
  uiHints: {
    provider: {
      label: "提供商",
      help: "开发/无网络环境使用 twilio, telnyx 或 mock。",
    },
    fromNumber: { label: "主叫号码", placeholder: "+15550001234" },
    toNumber: { label: "默认被叫号码", placeholder: "+15550001234" },
    inboundPolicy: { label: "呼入策略" },
    allowFrom: { label: "呼入白名单" },
    inboundGreeting: { label: "呼入问候语", advanced: true },
    "telnyx.apiKey": { label: "Telnyx API 密钥", sensitive: true },
    "telnyx.connectionId": { label: "Telnyx 连接 ID" },
    "telnyx.publicKey": { label: "Telnyx 公钥", sensitive: true },
    "twilio.accountSid": { label: "Twilio 账户 SID" },
    "twilio.authToken": { label: "Twilio 认证令牌", sensitive: true },
    "outbound.defaultMode": { label: "默认通话模式" },
    "outbound.notifyHangupDelaySec": {
      label: "挂断通知延迟 (秒)",
      advanced: true,
    },
    "serve.port": { label: "Webhook 端口" },
    "serve.bind": { label: "Webhook 绑定" },
    "serve.path": { label: "Webhook 路径" },
    "tailscale.mode": { label: "Tailscale 模式", advanced: true },
    "tailscale.path": { label: "Tailscale 路径", advanced: true },
    "tunnel.provider": { label: "隧道提供商", advanced: true },
    "tunnel.ngrokAuthToken": {
      label: "ngrok 认证令牌",
      sensitive: true,
      advanced: true,
    },
    "tunnel.ngrokDomain": { label: "ngrok 域名", advanced: true },
    "tunnel.allowNgrokFreeTierLoopbackBypass": {
      label: "允许 ngrok 免费层 (回环绕过)",
      advanced: true,
    },
    "streaming.enabled": { label: "启用流式传输", advanced: true },
    "streaming.provider": {
      label: "流式提供商",
      help: "Uses the first registered realtime transcription provider when unset.",
      advanced: true,
    },
    "streaming.providers": { label: "流式提供商配置", advanced: true },
    "streaming.streamPath": { label: "媒体流路径", advanced: true },
    "realtime.enabled": { label: "启用实时语音", advanced: true },
    "realtime.provider": {
      label: "实时语音提供商",
      help: "Uses the first registered realtime voice provider when unset.",
      advanced: true,
    },
    "realtime.streamPath": { label: "实时流路径", advanced: true },
    "realtime.instructions": { label: "实时指令", advanced: true },
    "realtime.providers": { label: "实时提供商配置", advanced: true },
    "tts.provider": {
      label: "TTS 提供商覆盖",
      help: "与 messages.tts 深度合并 (通话忽略 Microsoft)。",
      advanced: true,
    },
    "tts.providers": { label: "TTS 提供商配置", advanced: true },
    publicUrl: { label: "公共 Webhook URL", advanced: true },
    skipSignatureVerification: {
      label: "跳过签名验证",
      advanced: true,
    },
    store: { label: "通话日志存储路径", advanced: true },
    responseModel: {
      label: "响应模型",
      help: "Optional override. Falls back to the runtime default model when unset.",
      advanced: true,
    },
    responseSystemPrompt: { label: "响应系统提示词", advanced: true },
    responseTimeoutMs: { label: "响应超时 (毫秒)", advanced: true },
  },
};

const VoiceCallToolSchema = Type.Union([
  Type.Object({
    action: Type.Literal("initiate_call"),
    to: Type.Optional(Type.String({ description: "通话目标" })),
    message: Type.String({ description: "开场消息" }),
    mode: Type.Optional(Type.Union([Type.Literal("notify"), Type.Literal("conversation")])),
  }),
  Type.Object({
    action: Type.Literal("continue_call"),
    callId: Type.String({ description: "通话 ID" }),
    message: Type.String({ description: "跟进消息" }),
  }),
  Type.Object({
    action: Type.Literal("speak_to_user"),
    callId: Type.String({ description: "通话 ID" }),
    message: Type.String({ description: "要朗读的消息" }),
  }),
  Type.Object({
    action: Type.Literal("end_call"),
    callId: Type.String({ description: "通话 ID" }),
  }),
  Type.Object({
    action: Type.Literal("get_status"),
    callId: Type.String({ description: "通话 ID" }),
  }),
  Type.Object({
    mode: Type.Optional(Type.Union([Type.Literal("call"), Type.Literal("status")])),
    to: Type.Optional(Type.String({ description: "通话目标" })),
    sid: Type.Optional(Type.String({ description: "通话 SID" })),
    message: Type.Optional(Type.String({ description: "可选开场消息" })),
  }),
]);

export default definePluginEntry({
  id: "voice-call",
  name: "语音通话",
  description: "支持 Telnyx/Twilio/Plivo 的语音通话插件",
  configSchema: voiceCallConfigSchema,
  register(api: OpenClawPluginApi) {
    const config = resolveVoiceCallConfig(voiceCallConfigSchema.parse(api.pluginConfig));
    const validation = validateProviderConfig(config);

    if (api.pluginConfig && typeof api.pluginConfig === "object") {
      for (const warning of formatVoiceCallLegacyConfigWarnings({
        value: api.pluginConfig,
        configPathPrefix: "plugins.entries.voice-call.config",
        doctorFixCommand: "openclaw doctor --fix",
      })) {
        api.logger.warn(warning);
      }
    }

    let runtimePromise: Promise<VoiceCallRuntime> | null = null;
    let runtime: VoiceCallRuntime | null = null;

    const ensureRuntime = async () => {
      if (!config.enabled) {
        throw new Error("语音通话在插件配置中已禁用");
      }
      if (!validation.valid) {
        throw new Error(validation.errors.join("; "));
      }
      if (runtime) {
        return runtime;
      }
      if (!runtimePromise) {
        runtimePromise = createVoiceCallRuntime({
          config,
          coreConfig: api.config as CoreConfig,
          fullConfig: api.config,
          agentRuntime: api.runtime.agent,
          ttsRuntime: api.runtime.tts,
          logger: api.logger,
        });
      }
      try {
        runtime = await runtimePromise;
      } catch (err) {
        // Reset so the next call can retry instead of caching the
        // rejected promise forever (which also leaves the port orphaned
        // if the server started before the failure).  See: #32387
        runtimePromise = null;
        throw err;
      }
      return runtime;
    };

    const sendError = (respond: (ok: boolean, payload?: unknown) => void, err: unknown) => {
      respond(false, { error: formatErrorMessage(err) });
    };

    const resolveCallMessageRequest = async (params: GatewayRequestHandlerOptions["params"]) => {
      const callId = normalizeOptionalString(params?.callId) ?? "";
      const message = normalizeOptionalString(params?.message) ?? "";
      if (!callId || !message) {
        return { error: "callId 和消息必填" } as const;
      }
      const rt = await ensureRuntime();
      return { rt, callId, message } as const;
    };
    const initiateCallAndRespond = async (params: {
      rt: VoiceCallRuntime;
      respond: GatewayRequestHandlerOptions["respond"];
      to: string;
      message?: string;
      mode?: "notify" | "conversation";
    }) => {
      const result = await params.rt.manager.initiateCall(params.to, undefined, {
        message: params.message,
        mode: params.mode,
      });
      if (!result.success) {
        params.respond(false, { error: result.error || "发起失败" });
        return;
      }
      params.respond(true, { callId: result.callId, initiated: true });
    };

    const respondToCallMessageAction = async (params: {
      requestParams: GatewayRequestHandlerOptions["params"];
      respond: GatewayRequestHandlerOptions["respond"];
      action: (
        request: Exclude<Awaited<ReturnType<typeof resolveCallMessageRequest>>, { error: string }>,
      ) => Promise<{
        success: boolean;
        error?: string;
        transcript?: string;
      }>;
      failure: string;
      includeTranscript?: boolean;
    }) => {
      const request = await resolveCallMessageRequest(params.requestParams);
      if ("error" in request) {
        params.respond(false, { error: request.error });
        return;
      }
      const result = await params.action(request);
      if (!result.success) {
        params.respond(false, { error: result.error || params.failure });
        return;
      }
      params.respond(
        true,
        params.includeTranscript
          ? { success: true, transcript: result.transcript }
          : { success: true },
      );
    };

    api.registerGatewayMethod(
      "voicecall.initiate",
      async ({ params, respond }: GatewayRequestHandlerOptions) => {
        try {
          const message = normalizeOptionalString(params?.message) ?? "";
          if (!message) {
            respond(false, { error: "消息必填" });
            return;
          }
          const rt = await ensureRuntime();
          const to = normalizeOptionalString(params?.to) ?? rt.config.toNumber;
          if (!to) {
            respond(false, { error: "目标(to)必填" });
            return;
          }
          const mode =
            params?.mode === "notify" || params?.mode === "conversation" ? params.mode : undefined;
          await initiateCallAndRespond({
            rt,
            respond,
            to,
            message,
            mode,
          });
        } catch (err) {
          sendError(respond, err);
        }
      },
    );

    api.registerGatewayMethod(
      "voicecall.continue",
      async ({ params, respond }: GatewayRequestHandlerOptions) => {
        try {
          await respondToCallMessageAction({
            requestParams: params,
            respond,
            action: (request) => request.rt.manager.continueCall(request.callId, request.message),
            failure: "继续失败",
            includeTranscript: true,
          });
        } catch (err) {
          sendError(respond, err);
        }
      },
    );

    api.registerGatewayMethod(
      "voicecall.speak",
      async ({ params, respond }: GatewayRequestHandlerOptions) => {
        try {
          await respondToCallMessageAction({
            requestParams: params,
            respond,
            action: (request) => request.rt.manager.speak(request.callId, request.message),
            failure: "朗读失败",
          });
        } catch (err) {
          sendError(respond, err);
        }
      },
    );

    api.registerGatewayMethod(
      "voicecall.end",
      async ({ params, respond }: GatewayRequestHandlerOptions) => {
        try {
          const callId = normalizeOptionalString(params?.callId) ?? "";
          if (!callId) {
            respond(false, { error: "callId 必填" });
            return;
          }
          const rt = await ensureRuntime();
          const result = await rt.manager.endCall(callId);
          if (!result.success) {
            respond(false, { error: result.error || "挂断失败" });
            return;
          }
          respond(true, { success: true });
        } catch (err) {
          sendError(respond, err);
        }
      },
    );

    api.registerGatewayMethod(
      "voicecall.status",
      async ({ params, respond }: GatewayRequestHandlerOptions) => {
        try {
          const raw =
            normalizeOptionalString(params?.callId) ?? normalizeOptionalString(params?.sid) ?? "";
          if (!raw) {
            respond(false, { error: "callId 必填" });
            return;
          }
          const rt = await ensureRuntime();
          const call = rt.manager.getCall(raw) || rt.manager.getCallByProviderCallId(raw);
          if (!call) {
            respond(true, { found: false });
            return;
          }
          respond(true, { found: true, call });
        } catch (err) {
          sendError(respond, err);
        }
      },
    );

    api.registerGatewayMethod(
      "voicecall.start",
      async ({ params, respond }: GatewayRequestHandlerOptions) => {
        try {
          const to = normalizeOptionalString(params?.to) ?? "";
          const message = normalizeOptionalString(params?.message) ?? "";
          if (!to) {
            respond(false, { error: "目标(to)必填" });
            return;
          }
          const rt = await ensureRuntime();
          await initiateCallAndRespond({
            rt,
            respond,
            to,
            message: message || undefined,
          });
        } catch (err) {
          sendError(respond, err);
        }
      },
    );

    api.registerTool({
      name: "voice_call",
      label: "Voice Call",
      description: "通过语音通话插件拨打电话并进行语音对话。",
      parameters: VoiceCallToolSchema,
      async execute(_toolCallId, params) {
        const json = (payload: unknown) => ({
          content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
          details: payload,
        });

        try {
          const rt = await ensureRuntime();

          if (typeof params?.action === "string") {
            switch (params.action) {
              case "initiate_call": {
                const message = normalizeOptionalString(params.message) ?? "";
                if (!message) {
                  throw new Error("消息必填");
                }
                const to = normalizeOptionalString(params.to) ?? rt.config.toNumber;
                if (!to) {
                  throw new Error("目标(to)必填");
                }
                const result = await rt.manager.initiateCall(to, undefined, {
                  message,
                  mode:
                    params.mode === "notify" || params.mode === "conversation"
                      ? params.mode
                      : undefined,
                });
                if (!result.success) {
                  throw new Error(result.error || "发起失败");
                }
                return json({ callId: result.callId, initiated: true });
              }
              case "continue_call": {
                const callId = normalizeOptionalString(params.callId) ?? "";
                const message = normalizeOptionalString(params.message) ?? "";
                if (!callId || !message) {
                  throw new Error("callId 和消息必填");
                }
                const result = await rt.manager.continueCall(callId, message);
                if (!result.success) {
                  throw new Error(result.error || "继续失败");
                }
                return json({ success: true, transcript: result.transcript });
              }
              case "speak_to_user": {
                const callId = normalizeOptionalString(params.callId) ?? "";
                const message = normalizeOptionalString(params.message) ?? "";
                if (!callId || !message) {
                  throw new Error("callId 和消息必填");
                }
                const result = await rt.manager.speak(callId, message);
                if (!result.success) {
                  throw new Error(result.error || "朗读失败");
                }
                return json({ success: true });
              }
              case "end_call": {
                const callId = normalizeOptionalString(params.callId) ?? "";
                if (!callId) {
                  throw new Error("callId 必填");
                }
                const result = await rt.manager.endCall(callId);
                if (!result.success) {
                  throw new Error(result.error || "挂断失败");
                }
                return json({ success: true });
              }
              case "get_status": {
                const callId = normalizeOptionalString(params.callId) ?? "";
                if (!callId) {
                  throw new Error("callId 必填");
                }
                const call =
                  rt.manager.getCall(callId) || rt.manager.getCallByProviderCallId(callId);
                return json(call ? { found: true, call } : { found: false });
              }
            }
          }

          const mode = params?.mode ?? "call";
          if (mode === "status") {
            const sid = normalizeOptionalString(params.sid) ?? "";
            if (!sid) {
              throw new Error("状态查询需要 sid");
            }
            const call = rt.manager.getCall(sid) || rt.manager.getCallByProviderCallId(sid);
            return json(call ? { found: true, call } : { found: false });
          }

          const to = normalizeOptionalString(params.to) ?? rt.config.toNumber;
          if (!to) {
            throw new Error("呼叫需要目标(to)");
          }
          const result = await rt.manager.initiateCall(to, undefined, {
            message: normalizeOptionalString(params.message),
          });
          if (!result.success) {
            throw new Error(result.error || "发起失败");
          }
          return json({ callId: result.callId, initiated: true });
        } catch (err) {
          return json({
            error: formatErrorMessage(err),
          });
        }
      },
    });

    api.registerCli(
      ({ program }) =>
        registerVoiceCallCli({
          program,
          config,
          ensureRuntime,
          logger: api.logger,
        }),
      { commands: ["voicecall"] },
    );

    api.registerService({
      id: "voicecall",
      start: async () => {
        if (!config.enabled) {
          return;
        }
        try {
          await ensureRuntime();
        } catch (err) {
          api.logger.error(`[voice-call] Failed to start runtime: ${formatErrorMessage(err)}`);
        }
      },
      stop: async () => {
        if (!runtimePromise) {
          return;
        }
        try {
          const rt = await runtimePromise;
          await rt.stop();
        } finally {
          runtimePromise = null;
          runtime = null;
        }
      },
    });
  },
});
