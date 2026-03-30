import {
  DISCORD_DEFAULT_INBOUND_WORKER_TIMEOUT_MS,
  DISCORD_DEFAULT_LISTENER_TIMEOUT_MS,
} from "../../extensions/discord/timeouts.js";
import { MEDIA_AUDIO_FIELD_HELP } from "./media-audio-field-metadata.js";
import { IRC_FIELD_HELP } from "./schema.irc.js";
import { describeTalkSilenceTimeoutDefaults } from "./talk-defaults.js";

export const FIELD_HELP: Record<string, string> = {
  meta: "OpenClaw 自动维护的元数据字段，用于记录此配置文件的写入/版本历史。保持系统管理，除非调试迁移历史，否则避免手动编辑。",
  "meta.lastTouchedVersion": "OpenClaw 写入配置时自动设置。",
  "meta.lastTouchedAt": "上次配置写入的 ISO 时间戳（自动设置）。",
  env: "环境导入和覆盖设置，用于向网关进程提供运行时变量。控制 Shell 环境加载和显式变量注入行为。",
  "env.shellEnv":
    "Shell 环境导入控制，在启动期间从登录 Shell 加载变量。依赖配置文件定义的密钥或 PATH 自定义时保持启用。",
  "env.shellEnv.enabled":
    "启用在启动初始化期间从用户 Shell 配置文件加载环境变量。开发机器保持启用，或在显式环境管理的锁定服务环境中禁用。",
  "env.shellEnv.timeoutMs":
    "Shell 环境解析允许的最大时间（毫秒），超时后应用回退。使用更紧的超时加快启动，或在 Shell 初始化较重时增加。",
  "env.vars":
    "显式键/值环境变量覆盖，合并到 OpenClaw 的运行时进程环境中。用于确定性环境配置，而非仅依赖 Shell 配置文件副作用。",
  wizard:
    "设置向导状态跟踪字段，记录最近一次引导式配置运行详情。保留以便观察和排除跨升级的设置流程故障。",
  "wizard.lastRunAt":
    "设置向导在此主机上最近完成时的 ISO 时间戳。用于在支持和运营审计期间确认配置新近性。",
  "wizard.lastRunVersion":
    "最近一次向导运行时记录的 OpenClaw 版本。诊断跨版本配置行为差异时使用。",
  "wizard.lastRunCommit":
    "开发构建中为最后一次向导执行记录的源代码提交标识符。调试时用于将配置行为与确切源代码状态关联。",
  "wizard.lastRunCommand":
    "为最近向导运行记录的命令调用，保留执行上下文。用于在验证设置回归时重现配置步骤。",
  "wizard.lastRunMode":
    'Wizard execution mode recorded as "local" or "remote" for the most recent setup flow. Use this to understand whether setup targeted direct local runtime or remote gateway topology.',
  diagnostics:
    "用于定向跟踪、遥测导出和调试期间缓存检查的诊断控制。生产环境保持最小化，仅在调查问题时启用更深层信号。",
  "diagnostics.otel":
    "网关组件发出的跟踪、指标和日志的 OpenTelemetry 导出设置。集成集中式可观察性后端和分布式跟踪管道时使用。",
  "diagnostics.cacheTrace":
    "缓存跟踪日志设置，用于观察缓存决策和有效负载上下文。临时启用进行调试，之后禁用以减少敏感日志占用。",
  logging:
    "日志行为控制，包括严重性、输出目标、格式和敏感数据脱敏。保持级别和脱敏足够严格以用于生产环境。",
  "logging.level":
    'Primary log level threshold for runtime logger output: "silent", "fatal", "error", "warn", "info", "debug", or "trace". Keep "info" or "warn" for production, and use debug/trace only during investigation.',
  "logging.file":
    "可选持久化日志输出文件路径。使用托管的可写路径，并将保留/轮换与运维策略对齐。",
  "logging.consoleLevel":
    'Console-specific log threshold: "silent", "fatal", "error", "warn", "info", "debug", or "trace" for terminal output control. Use this to keep local console quieter while retaining richer file logging if needed.',
  "logging.consoleStyle":
    'Console output format style: "pretty", "compact", or "json" based on operator and ingestion needs. Use json for machine parsing pipelines and pretty/compact for human-first terminal workflows.',
  "logging.redactSensitive":
    'Sensitive redaction mode: "off" disables built-in masking, while "tools" redacts sensitive tool/config payload fields. Keep "tools" in shared logs unless you have isolated secure log sinks.',
  "logging.redactPatterns":
    "日志输出中应用的自定义正则表达式脱敏模式。仅在内置脱敏不足以覆盖需求时添加。",
  cli: "CLI 外观和行为设置，控制横幅显示和 CLI 特定的用户界面元素。",
  "cli.banner":
    "CLI 启动横幅控制，用于标题/版本行和标语样式行为。保持横幅启用以快速检查版本/上下文。",
  "cli.banner.taglineMode":
    'Controls tagline style in the CLI startup banner: "random" (default) picks from the rotating tagline pool, "default" always shows the neutral default tagline, and "off" hides tagline text while keeping the banner version line.',
  update:
    "更新通道和启动检查行为，保持 OpenClaw 运行时版本最新。生产环境使用保守通道。",
  "update.channel": 'Update channel for git + npm installs ("stable", "beta", or "dev").',
  "update.checkOnStart": "控制 OpenClaw 是否在启动时自动检查可用更新。",
  "update.auto.enabled": "启用自动更新功能。",
  "update.auto.stableDelayHours":
    "稳定版更新的延迟时间（小时），新版本发布后等待一段时间再更新。",
  "update.auto.stableJitterHours":
    "稳定版更新延迟的随机抖动（小时），避免所有实例同时更新。",
  "update.auto.betaCheckIntervalHours": "Beta 版更新检查间隔（小时）。",
  gateway:
    "网关服务器配置，包括端口、绑定、认证、TLS 和 API 端点。",
  "gateway.port":
    "网关 HTTP/WebSocket 服务器监听的端口号。",
  "gateway.mode":
    'Gateway operation mode: "local" runs channels and agent runtime on this host, while "remote" connects through remote transport. Keep "local" unless you intentionally run a split remote gateway topology.',
  "gateway.bind":
    'Network bind profile: "auto", "lan", "loopback", "custom", or "tailnet" to control interface exposure. Keep "loopback" or "auto" for safest local operation unless external clients must connect.',
  "gateway.customBindHost":
    "自定义绑定主机地址。",
  "gateway.controlUi":
    "控制面板 UI 设置。",
  "gateway.controlUi.enabled":
    "启用或禁用控制面板 Web UI。",
  "gateway.auth":
    "网关认证配置，包括令牌、密码和速率限制。",
  "gateway.auth.mode":
    'Gateway auth mode: "none", "token", "password", or "trusted-proxy" depending on your edge architecture. Use token/password for direct exposure, and trusted-proxy only behind hardened identity-aware proxies.',
  "gateway.auth.allowTailscale":
    "允许 Tailscale 身份作为认证方式。",
  "gateway.auth.rateLimit":
    "网关认证速率限制，防止暴力攻击。",
  "gateway.auth.trustedProxy":
    "可信代理认证模式。",
  "gateway.trustedProxies":
    "可信代理服务器 CIDR 列表。",
  "gateway.allowRealIpFallback":
    "允许 x-real-ip 头作为客户端 IP 回退。",
  "gateway.tools":
    "网关工具暴露策略。",
  "gateway.tools.allow":
    "网关允许暴露的工具列表。",
  "gateway.tools.deny":
    "网关拒绝暴露的工具列表。",
  "gateway.channelHealthCheckMinutes":
    "通道健康检查间隔（分钟）。",
  "gateway.channelStaleEventThresholdMinutes":
    "已连接渠道在健康监控将其视为过期套接字并触发重启前，允许不接收任何事件的分钟数。默认：30。",
  "gateway.channelMaxRestartsPerHour":
    "在一小时滚动窗口内允许的健康监控发起的渠道重启最大次数。达到上限后，将跳过进一步重启直到窗口过期。默认：10。",
  "gateway.tailscale":
    "Tailscale 集成配置。",
  "gateway.tailscale.mode":
    'Tailscale publish mode: "off", "serve", or "funnel" for private or public exposure paths. Use "serve" for tailnet-only access and "funnel" only when public internet reachability is required.',
  "gateway.tailscale.resetOnExit":
    "退出时重置 Tailscale 状态。",
  "gateway.remote":
    "远程网关连接设置。",
  "gateway.remote.transport":
    'Remote connection transport: "direct" uses configured URL connectivity, while "ssh" tunnels through SSH. Use SSH when you need encrypted tunnel semantics without exposing remote ports.',
  "gateway.reload":
    "配置重载设置。",
  "gateway.tls":
    "网关 TLS/HTTPS 配置。",
  "gateway.tls.enabled":
    "启用 TLS 加密。",
  "gateway.tls.autoGenerate":
    "自动生成自签名 TLS 证书。",
  "gateway.tls.certPath":
    "TLS 证书文件路径。",
  "gateway.tls.keyPath":
    "TLS 私钥文件路径。",
  "gateway.tls.caPath":
    "TLS CA 证书文件路径。",
  "gateway.http":
    "网关 HTTP API 设置。",
  "gateway.http.endpoints":
    "HTTP API 端点配置。",
  "gateway.http.securityHeaders":
    "HTTP 安全响应头配置。",
  "gateway.http.securityHeaders.strictTransportSecurity":
    "Strict-Transport-Security 响应头的值。仅在你完全控制的 HTTPS 源上设置；使用 false 显式禁用。",
  "gateway.remote.url": "远程网关 WebSocket URL。",
  "gateway.remote.token":
    "远程网关连接令牌。",
  "gateway.remote.password":
    "远程网关连接密码。",
  "gateway.remote.tlsFingerprint":
    "远程网关的预期 sha256 TLS 指纹（锁定以避免中间人攻击）。",
  "gateway.remote.sshTarget":
    "通过 SSH 访问远程网关（将网关端口隧道到本地）。格式：user@host 或 user@host:port。",
  "gateway.remote.sshIdentity": "可选的 SSH 身份文件路径（传递给 ssh -i）。",
  "talk.provider": 'Active Talk provider id (for example "elevenlabs").',
  "talk.providers":
    "按提供商 ID 索引的特定提供商 Talk 设置。迁移期间，优先使用 talk.providers.<id> 而非旧版顶层字段。",
  "talk.providers.*.voiceId": "提供商默认的 Talk 模式语音 ID。",
  "talk.providers.*.voiceAliases": "可选的提供商语音别名映射，用于 Talk 指令。",
  "talk.providers.*.modelId": "提供商默认的 Talk 模式模型 ID。",
  "talk.providers.*.outputFormat": "提供商默认的 Talk 模式输出格式。",
  "talk.providers.*.apiKey": "提供商的 Talk 模式 API 密钥。", // pragma: allowlist secret
  "talk.voiceId":
    "旧版 ElevenLabs 默认 Talk 模式语音 ID。建议使用 talk.providers.elevenlabs.voiceId。",
  "talk.voiceAliases":
    'Use this legacy ElevenLabs voice alias map (for example {"Clawd":"ElevenLabs 默认语音 ID（Clawd）。"}) only during migration. Prefer talk.providers.elevenlabs.voiceAliases.',
  "talk.modelId":
    "旧版 ElevenLabs Talk 模式模型 ID（默认：eleven_v3）。建议使用 talk.providers.elevenlabs.modelId。",
  "talk.outputFormat":
    "仅在迁移期间使用此旧版 ElevenLabs Talk 模式输出格式（例如 pcm_44100 或 mp3_44100_128）。建议使用 talk.providers.elevenlabs.outputFormat。",
  "talk.apiKey":
    "旧版 ElevenLabs API 密钥。建议使用 talk.providers.elevenlabs.apiKey 或 ELEVENLABS_API_KEY 环境变量。",
  "talk.interruptOnSpeech":
    "如果为 true（默认），在 Talk 模式中用户开始说话时停止助手语音。保持启用以实现对话轮换。",
  "talk.silenceTimeoutMs": `Milliseconds of user silence before Talk mode finalizes and sends the current transcript. Leave unset to keep the platform default pause window (${describeTalkSilenceTimeoutDefaults()}).`,
  acp: "ACP (Agent Communication Protocol) 配置。",
  "acp.enabled":
    "启用 ACP 运行时。",
  "acp.dispatch.enabled":
    "ACP 会话轮次的独立调度门控（默认：true）。设为 false 以保持 ACP 命令可用同时阻止 ACP 轮次执行。",
  "acp.backend":
    "ACP 后端类型。",
  "acp.defaultAgent":
    "ACP 默认代理 ID。",
  "acp.allowedAgents":
    "允许的 ACP 目标代理 ID 列表。",
  "acp.maxConcurrentSessions":
    "最大并发会话数。",
  "acp.stream":
    "ACP 流式传输设置。",
  "acp.stream.coalesceIdleMs":
    "ACP 流式文本在发出块回复前的合并器空闲刷新窗口（毫秒）。",
  "acp.stream.maxChunkChars":
    "分割为多个块回复前 ACP 流式块投影的最大块大小。",
  "acp.stream.repeatSuppression":
    "为 true 时（默认），抑制一轮中重复的 ACP 状态/工具投影行，同时保持原始 ACP 事件不变。",
  "acp.stream.deliveryMode":
    "ACP 投递风格：live 增量投影输出，final_only 缓冲所有投影 ACP 输出直到终端轮次事件。",
  "acp.stream.hiddenBoundarySeparator":
    "当隐藏的 ACP 工具生命周期事件发生时，在下一个可见助手文本前插入的分隔符（none|space|newline|paragraph）。默认：paragraph。",
  "acp.stream.maxOutputChars":
    "截断通知发出前每个 ACP 轮次投影的最大助手输出字符数。",
  "acp.stream.maxSessionUpdateChars":
    "单个 ACP 流会话更新中发送的最大字符数。较大值减少更新频率但增加每条消息的大小。",
  "acp.stream.tagVisibility":
    "ACP 投影的每 sessionUpdate 可见性覆盖（例如 usage_update、available_commands_update）。",
  "acp.runtime.ttlMinutes":
    "ACP 会话工作进程在有资格清理前的空闲运行时 TTL（分钟）。",
  "acp.runtime.installCommand":
    "当 ACP 后端接线缺失时，`/acp install` 和 `/acp doctor` 显示的可选操作员安装/设置命令。",
  "agents.list.*.skills":
    "此代理的可选技能白名单（省略 = 所有技能；空 = 无技能）。",
  "agents.list[].skills":
    "此代理的可选技能白名单（省略 = 所有技能；空 = 无技能）。",
  agents:
    "代理配置，定义 AI 代理的行为、身份、模型和运行时设置。",
  "agents.defaults":
    "代理默认设置，未显式覆盖时使用的基础配置。",
  "agents.list":
    "代理列表，定义一个或多个代理及其配置。",
  "agents.list[].thinkingDefault":
    "可选的每代理默认思考级别。当无每条消息或会话思考覆盖时，覆盖此代理的 agents.defaults.thinkingDefault。",
  "agents.list[].reasoningDefault":
    "可选的每代理默认推理可见性（on|off|stream）。当无每条消息或会话推理覆盖时应用。",
  "agents.list[].fastModeDefault":
    "可选的每代理快速模式默认值。当无每条消息或会话快速模式覆盖时应用。",
  "agents.list[].runtime":
    "此代理的可选运行时描述符。使用 embedded 表示默认 OpenClaw 执行，或 acp 表示外部 ACP 运行时。",
  "agents.list[].runtime.type":
    'Runtime type for this agent: "embedded" (default OpenClaw runtime) or "acp" (ACP harness defaults).',
  "agents.list[].runtime.acp":
    "当 runtime.type=acp 时此代理的 ACP 运行时默认值。绑定级别的 ACP 覆盖仍在每个会话中优先。",
  "agents.list[].runtime.acp.agent":
    "此 OpenClaw 代理使用的可选 ACP 运行时代理 ID（例如 codex、claude）。",
  "agents.list[].runtime.acp.backend":
    "此代理 ACP 会话的可选 ACP 后端覆盖（回退到全局 acp.backend）。",
  "agents.list[].runtime.acp.mode":
    "此代理的可选 ACP 会话模式默认值（persistent 或 oneshot）。",
  "agents.list[].runtime.acp.cwd":
    "此代理 ACP 会话的可选默认工作目录。",
  "agents.list[].identity.avatar":
    "头像图片路径（仅相对于代理工作区）或远程 URL/data URL。",
  "agents.defaults.heartbeat.suppressToolErrorWarnings":
    "在心跳运行期间抑制工具错误警告载荷。",
  "agents.list[].heartbeat.suppressToolErrorWarnings":
    "在心跳运行期间抑制工具错误警告载荷。",
  browser:
    "浏览器自动化配置。",
  "browser.enabled":
    "启用浏览器自动化。",
  "browser.cdpUrl":
    "Chrome DevTools Protocol URL。",
  "browser.color":
    "浏览器配置文件/UI 提示中显示彩色身份提示时使用的默认强调色。使用一致的颜色帮助操作员快速识别活跃的浏览器配置文件上下文。",
  "browser.executablePath":
    "浏览器可执行文件路径。",
  "browser.headless":
    "以无头模式运行浏览器。",
  "browser.noSandbox":
    "禁用浏览器沙箱。",
  "browser.attachOnly":
    "将浏览器模式限制为仅附加行为，不启动本地浏览器进程。当所有浏览器会话由远程 CDP 提供商外部管理时使用。",
  "browser.cdpPortRangeStart":
    "用于自动分配浏览器配置文件端口的起始本地 CDP 端口。当主机级别端口默认值与其他本地服务冲突时增加此值。",
  "browser.defaultProfile":
    "调用者未显式选择配置文件时选择的默认浏览器配置文件名称。使用稳定的低权限配置文件作为默认值以减少意外的跨上下文状态使用。",
  "browser.profiles":
    "用于显式路由到 CDP 端口或 URL（带可选元数据）的命名浏览器配置文件连接映射。保持配置文件名称一致并避免重叠的端点定义。",
  "browser.profiles.*.cdpPort":
    "通过端口连接到浏览器实例时每配置文件的本地 CDP 端口。每个配置文件使用唯一端口以避免连接冲突。",
  "browser.profiles.*.cdpUrl":
    "按配置文件名称用于显式远程浏览器路由的每配置文件 CDP WebSocket URL。当配置文件连接终止于远程主机或隧道时使用。",
  "browser.profiles.*.userDataDir":
    "通过 Chrome DevTools MCP 附加现有会话的每配置文件 Chromium 用户数据目录。当内置自动连接路径会选择错误的浏览器数据目录时，用于主机本地的 Brave、Edge、Chromium 或非默认 Chrome 配置文件。",
  "browser.profiles.*.driver":
    'Per-profile browser driver mode. Use "openclaw" (or legacy "clawd") for CDP-based profiles, or use "existing-session" for host-local Chrome DevTools MCP attachment.',
  "browser.profiles.*.attachOnly":
    "跳过本地浏览器启动仅附加到现有 CDP 端点的每配置文件仅附加覆盖。当一个配置文件由外部管理但其他配置文件在本地启动时有用。",
  "browser.profiles.*.color":
    "仪表盘和浏览器相关 UI 提示中视觉区分的每配置文件强调色。使用不同颜色以实现活跃配置文件的高信号操作员识别。",
  "browser.evaluateEnabled":
    "启用浏览器端 evaluate 辅助器用于支持的运行时脚本评估功能。除非你的工作流需要快照/导航之外的 evaluate 语义，否则保持禁用。",
  "browser.snapshotDefaults":
    "调用者未提供显式快照选项时使用的默认快照捕获配置。调整以实现跨渠道和自动化路径的一致捕获行为。",
  "browser.snapshotDefaults.mode":
    "控制页面内容如何转换供代理使用的默认快照提取模式。选择在可读性、保真度和令牌占用之间平衡的模式。",
  "browser.ssrfPolicy":
    "可能到达内部主机的浏览器/网络获取路径的服务端请求伪造防护设置。在生产中保持限制性默认值，仅开放明确批准的目标。",
  "browser.ssrfPolicy.allowPrivateNetwork":
    "browser.ssrfPolicy.dangerouslyAllowPrivateNetwork 的旧版别名。建议使用带 dangerously 前缀的键以使风险意图明确。",
  "browser.ssrfPolicy.dangerouslyAllowPrivateNetwork":
    "允许从浏览器工具访问私有网络地址范围。受信任网络操作员设置默认启用；禁用以强制执行仅公共的严格解析检查。",
  "browser.ssrfPolicy.allowedHostnames":
    "浏览器/网络请求 SSRF 策略检查的显式主机名白名单例外。保持此列表最小化并定期审查条目以避免过时的广泛访问。",
  "browser.ssrfPolicy.hostnameAllowlist":
    "SSRF 策略消费者用于显式主机例外的旧版/备用主机名白名单字段。使用稳定的精确主机名并避免类似通配符的广泛模式。",
  "browser.remoteCdpTimeoutMs":
    "浏览器附加尝试失败前连接到远程 CDP 端点的超时（毫秒）。对高延迟隧道增加，或降低以更快检测失败。",
  "browser.remoteCdpHandshakeTimeoutMs":
    "针对远程浏览器目标的连接后 CDP 握手就绪检查超时（毫秒）。对慢启动远程浏览器提高，降低以在自动化循环中快速失败。",
  "discovery.mdns.mode":
    'mDNS broadcast mode ("minimal" default, "full" includes cliPath/sshPort, "off" disables mDNS).',
  discovery:
    "发现服务配置。",
  "discovery.wideArea":
    "用于在本地链路范围之外暴露发现信号的广域发现配置组。仅在有意跨站点聚合网关存在的部署中启用。",
  "discovery.wideArea.enabled":
    "当你的环境需要非本地网关发现时启用广域发现信令。除非跨网络发现在运营上是必需的，否则保持禁用。",
  "discovery.wideArea.domain":
    "可选的单播 DNS-SD 域名，用于广域发现（如 openclaw.internal）。仅在需要超出本地 mDNS 范围发布网关发现时使用。",
  "discovery.mdns":
    "本地网络广告和发现行为调优的 mDNS 发现配置组。除非需要额外元数据，否则对常规局域网发现保持最小模式。",
  tools:
    "工具配置，控制代理可用的工具及行为。",
  "tools.allow":
    "显式允许的工具列表。",
  "tools.deny":
    "显式拒绝的工具列表。",
  "tools.web":
    "网页工具配置，包括搜索和获取设置。",
  "tools.exec":
    "执行工具配置，控制代理如何运行命令和脚本。",
  "tools.exec.host":
    "选择 shell 命令的执行主机策略，通常控制本地与委托执行环境。使用满足自动化需求的最安全主机模式。",
  "tools.exec.security":
    "控制命令执行的沙箱/审批预期的执行安全态势选择器。对不受信任的提示保持严格安全模式，仅对受信任的操作员工作流放宽。",
  "tools.exec.ask":
    "执行命令需要人工确认时的审批策略。在共享渠道中使用更严格的询问行为，在私有操作员上下文中使用低摩擦设置。",
  "tools.exec.node":
    "通过连接节点委托命令执行时的节点绑定配置。仅在需要多节点路由时使用显式节点绑定。",
  "tools.agentToAgent":
    "允许代理间工具调用并约束可达目标代理的策略。除非有意启用跨代理编排，否则保持禁用或严格限制范围。",
  "tools.agentToAgent.enabled":
    "启用 agent_to_agent 工具界面，使一个代理可以在运行时调用另一个代理。在简单部署中保持关闭，仅在编排价值超过复杂性时启用。",
  "tools.agentToAgent.allow":
    "启用编排时允许 agent_to_agent 调用的目标代理 ID 白名单。使用显式白名单避免不受控的跨代理调用图。",
  "tools.elevated":
    "特权命令界面的提升工具访问控制，仅应从受信任的发送者可达。除非操作员工作流明确需要提升操作，否则保持禁用。",
  "tools.elevated.enabled":
    "当发送者和策略检查通过时启用提升工具执行路径。在公共/共享渠道中保持禁用，仅在受信任的所有者操作上下文中启用。",
  "tools.elevated.allowFrom":
    "提升工具的发送者允许规则，通常按渠道/提供商身份格式索引。使用窄范围的显式身份，防止非预期用户触发提升命令。",
  "tools.subagents":
    "生成的子代理的工具策略包装器，用于限制或扩展相对于父默认值的工具可用性。使用此项保持委托代理功能范围与任务意图一致。",
  "tools.subagents.tools":
    "应用于生成的子代理运行时的允许/拒绝工具策略，用于每子代理强化。当子代理运行半自主工作流时保持比父范围更窄。",
  "tools.sandbox":
    "沙箱代理执行的工具策略包装器，使沙箱运行可以有不同的功能边界。使用此项在沙箱上下文中强制执行更强的安全性。",
  "tools.sandbox.tools":
    "代理在沙箱执行环境中运行时应用的允许/拒绝工具策略。保持策略最小化，防止沙箱任务升级为不必要的外部操作。",
  web: "Web channel runtime settings for heartbeat and reconnect behavior when operating web-based chat surfaces. Use reconnect values tuned to your network reliability profile and expected uptime needs.",
  "web.enabled":
    "启用 Web 渠道。",
  "web.heartbeatSeconds":
    "Web 渠道连接和活跃性维护的心跳间隔（秒）。使用较短间隔加快检测，或较长间隔减少保活通信。",
  "web.reconnect":
    "Web 渠道传输故障后重连尝试的重连退避策略。保持有界重试和抖动调优以避免雷群重连行为。",
  "web.reconnect.initialMs":
    "断开后首次重试前的初始重连延迟（毫秒）。使用适度延迟快速恢复而不立即重试风暴。",
  "web.reconnect.maxMs":
    "限制重复失败时重试延迟增长的最大重连退避上限（毫秒）。使用合理上限以在长时间中断后保持及时恢复。",
  "web.reconnect.factor":
    "Web 渠道重试循环中重连尝试之间使用的指数退避乘数。保持因子大于 1 并配合抖动调优以实现大规模集群的稳定重连行为。",
  "web.reconnect.jitter":
    "中断事件后应用于重连延迟以使客户端去同步化的随机化因子（0-1）。在多客户端部署中保持非零抖动以减少同步峰值。",
  "web.reconnect.maxAttempts":
    "当前故障序列放弃前的最大重连尝试次数（0 表示不重试）。在自动化敏感环境中使用有限上限进行受控故障处理。",
  canvasHost:
    "Canvas host settings for serving canvas assets and local live-reload behavior used by canvas-enabled workflows. Keep disabled unless canvas-hosted assets are actively used.",
  "canvasHost.enabled":
    "启用画布主机服务器进程和服务画布文件的路由。当画布工作流不活跃时保持禁用以减少暴露的本地服务。",
  "canvasHost.root":
    "Canvas 文件服务的根目录路径。",
  "canvasHost.port":
    "启用画布托管时画布主机 HTTP 服务器使用的 TCP 端口。选择非冲突端口并相应对齐防火墙/代理策略。",
  "canvasHost.liveReload":
    "开发工作流期间为画布资源启用自动实时重载行为。在偏好确定性输出的类生产环境中保持禁用。",
  talk: "语音通话配置。",
  "gateway.auth.token":
    "网关认证令牌。支持直接值或 SecretRef。",
  "gateway.auth.password": "网关认证密码。支持 SecretRef。",
  "agents.defaults.sandbox.browser.network":
    "沙箱浏览器容器的 Docker 网络（默认：openclaw-sandbox-browser）。如需更严格的隔离请避免使用 bridge。",
  "agents.list[].sandbox.browser.network": "沙箱浏览器 Docker 网络的每代理覆盖。",
  "agents.defaults.sandbox.docker.dangerouslyAllowContainerNamespaceJoin":
    "危险的紧急覆盖，允许沙箱 Docker 网络模式 container:<id>。这会加入另一个容器的网络命名空间，绕过容器隔离边界。仅在可信的集成测试场景中使用。",
  "agents.list[].sandbox.docker.dangerouslyAllowContainerNamespaceJoin":
    "沙箱 Docker 网络模式中容器命名空间加入的每代理危险覆盖。",
  "agents.defaults.sandbox.browser.cdpSourceRange":
    "容器边缘 CDP 入口的可选 CIDR 白名单（例如 172.21.0.1/32）。",
  "agents.list[].sandbox.browser.cdpSourceRange":
    "CDP 源 CIDR 白名单的每代理覆盖。",
  "gateway.controlUi.basePath":
    "控制面板 UI 的 URL 基础路径。",
  "gateway.controlUi.root":
    "控制面板 UI 静态文件的根目录。",
  "gateway.controlUi.allowedOrigins":
    "控制面板 UI 允许的 CORS 来源。",
  "gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback":
    "危险开关，为控制面板/WebChat WebSocket 检查启用基于 Host 头的源回退。仅当你的部署有意依赖 Host 头源策略时才受支持；显式的 gateway.controlUi.allowedOrigins 仍是推荐的安全默认值。",
  "gateway.controlUi.allowInsecureAuth":
    "当你必须运行非标准设置时，放宽控制面板的严格浏览器认证检查。除非你信任你的网络和代理路径，否则保持关闭，因为冒充风险更高。",
  "gateway.controlUi.dangerouslyDisableDeviceAuth":
    "禁用控制面板设备身份检查，仅依赖令牌/密码。仅用于受信任网络上的短期调试，然后立即关闭。",
  "gateway.push":
    "网关需要唤醒或通知已配对设备时使用的推送投递设置。在此为官方 iOS 构建配置基于中继的 APNs；直接 APNs 认证仍基于环境变量用于本地/手动构建。",
  "gateway.push.apns":
    "已配对到此网关的 iOS 设备的 APNs 投递设置。对官方/TestFlight 构建使用中继设置。",
  "gateway.push.apns.relay":
    "基于中继的 APNs 发送的外部中继设置。网关使用此中继进行 push.test、唤醒提醒和已配对官方 iOS 构建发布中继注册后的重连唤醒。",
  "gateway.push.apns.relay.baseUrl":
    "官方/TestFlight iOS 构建使用的外部 APNs 中继服务的基础 HTTPS URL。保持与 iOS 构建中内置的中继 URL 一致，确保注册和发送流量命中同一部署。",
  "gateway.push.apns.relay.timeoutMs":
    "网关到 APNs 中继的中继发送请求超时（毫秒，默认：10000）。对较慢的中继或网络增加此值，或降低以更快地失败唤醒尝试。",
  "gateway.http.endpoints.chatCompletions.enabled":
    "启用 OpenAI 兼容的 `POST /v1/chat/completions` 端点（默认：false）。",
  "gateway.http.endpoints.chatCompletions.maxBodyBytes":
    "`/v1/chat/completions` 的最大请求体大小（字节，默认：20MB）。",
  "gateway.http.endpoints.chatCompletions.maxImageParts":
    "从最新用户消息中接受的最大 `image_url` 部分数量（默认：8）。",
  "gateway.http.endpoints.chatCompletions.maxTotalImageBytes":
    "单个请求中所有 `image_url` 部分的最大累计解码字节数（默认：20MB）。",
  "gateway.http.endpoints.chatCompletions.images":
    "OpenAI 兼容 `image_url` 部分的图片获取/验证控制。",
  "gateway.http.endpoints.chatCompletions.images.allowUrl":
    "允许服务端获取 `image_url` 部分的 URL（默认：false；data URI 仍受支持）。设为 `false` 以完全禁用 URL 获取。",
  "gateway.http.endpoints.chatCompletions.images.urlAllowlist":
    "`image_url` URL 获取的可选主机名白名单；支持精确主机名和 `*.example.com` 通配符。空或省略的列表表示无主机名白名单限制。",
  "gateway.http.endpoints.chatCompletions.images.allowedMimes":
    "`image_url` 部分允许的 MIME 类型（不区分大小写的列表）。",
  "gateway.http.endpoints.chatCompletions.images.maxBytes":
    "每个获取/解码的 `image_url` 图片的最大字节数（默认：10MB）。",
  "gateway.http.endpoints.chatCompletions.images.maxRedirects":
    "获取 `image_url` URL 时允许的最大 HTTP 重定向次数（默认：3）。",
  "gateway.http.endpoints.chatCompletions.images.timeoutMs":
    "`image_url` URL 获取的超时（毫秒，默认：10000）。",
  "gateway.reload.mode":
    'Controls how config edits are applied: "off" ignores live edits, "restart" always restarts, "hot" applies in-process, and "hybrid" tries hot then restarts if required. Keep "hybrid" for safest routine updates.',
  "gateway.reload.debounceMs": "配置重载防抖延迟（毫秒）。",
  "gateway.reload.deferralTimeoutMs":
    "在强制 SIGUSR1 重启前等待进行中操作完成的最大时间（毫秒）。默认：300000（5 分钟）。较低的值可能中断活动的子代理 LLM 调用。",
  "gateway.nodes.browser.mode":
    'Node browser routing ("auto" = pick single connected browser node, "manual" = require node param, "off" = disable).',
  "gateway.nodes.browser.node": "将浏览器路由锁定到特定节点 ID 或名称（可选）。",
  "gateway.nodes.allowCommands":
    "在网关默认值之外额外允许的 node.invoke 命令（命令字符串数组）。在此启用危险命令是安全敏感的覆盖，会被 `openclaw security audit` 标记。",
  "gateway.nodes.denyCommands":
    "要阻止的节点命令名称，即使存在于节点声明或默认白名单中（仅精确命令名称匹配，例如 `system.run`；不检查该命令内的 shell 文本）。",
  nodeHost:
    "节点主机配置。",
  "nodeHost.browserProxy":
    "通过节点路由暴露本地浏览器控制的浏览器代理设置组。仅在远程节点工作流需要你的本地浏览器配置文件时启用。",
  "nodeHost.browserProxy.enabled":
    "通过节点代理路由暴露本地浏览器控制服务器，使远程客户端可以使用此主机的浏览器功能。除非远程自动化明确依赖它，否则保持禁用。",
  "nodeHost.browserProxy.allowProfiles":
    "通过节点代理路由暴露的浏览器配置文件名称的可选白名单。留空以保留默认的完整配置文件界面，包括配置文件创建/删除路由。设置后，OpenClaw 强制执行最小权限配置文件访问并通过代理阻止持久配置文件创建/删除。",
  media:
    "媒体处理配置。",
  "media.preserveFilenames":
    "保留上传媒体的原始文件名。",
  "media.ttlHours":
    "媒体文件生存时间（小时）。",
  audio:
    "Global audio ingestion settings used before higher-level tools process speech or media content. Configure this when you need deterministic transcription behavior for voice notes and clips.",
  "audio.transcription":
    "将音频文件转换为文本后交给代理处理的基于命令的转录设置。在此保持简单、确定性的命令路径以使日志中的故障易于诊断。",
  "audio.transcription.command":
    'Executable + args used to transcribe audio (first token must be a safe binary/path), for example `["whisper-cli", "--model", "small", "{input}"]`. Prefer a pinned command so runtime environments behave consistently.',
  "audio.transcription.timeoutSeconds":
    "转录命令完成前中止的最大允许时间。对较长录音增加此值，在延迟敏感的部署中保持紧凑。",
  bindings:
    "绑定配置。",
  "bindings[].type":
    'Binding kind. Use "route" (or omit for legacy route entries) for normal routing, and "acp" for persistent ACP conversation bindings.',
  "bindings[].agentId":
    "当对应的绑定匹配规则满足时接收流量的目标代理 ID。仅使用有效的已配置代理 ID 以使路由不在运行时失败。",
  "bindings[].match":
    "决定绑定何时适用的匹配规则对象，包括渠道和可选的账户/对等约束。保持规则窄以避免意外的跨上下文代理接管。",
  "bindings[].match.channel":
    "此绑定适用的渠道/提供商标识符，如 `telegram`、`discord` 或插件渠道 ID。完全使用已配置的渠道键以使绑定评估可靠工作。",
  "bindings[].match.accountId":
    "多账户渠道设置中的可选账户选择器，使绑定仅适用于一个身份。当路由需要账户范围时使用，否则不设置。",
  "bindings[].match.peer":
    "特定会话的可选对等匹配器，包括对等类型和对等 ID。当只有一个直接/群组/频道目标应固定到某个代理时使用。",
  "bindings[].match.peer.kind":
    'Peer conversation type: "direct", "group", "channel", or legacy "dm" (deprecated alias for direct). Prefer "direct" for new configs and keep kind aligned with channel semantics.',
  "bindings[].match.peer.id":
    "与对等匹配一起使用的会话标识符，如来自提供商的聊天 ID、频道 ID 或群组 ID。保持精确以避免静默的不匹配。",
  "bindings[].match.guildId":
    "多服务器部署中用于绑定评估的可选 Discord 风格公会/服务器 ID 约束。当同一对等标识符可能出现在不同公会时使用。",
  "bindings[].match.teamId":
    "由在团队下限定聊天范围的提供商使用的可选团队/工作区 ID 约束。当你需要将绑定隔离到一个工作区上下文时添加。",
  "bindings[].match.roles":
    "由将角色附加到聊天上下文的提供商使用的可选基于角色的过滤器列表。用于将特权或操作角色流量路由到专用代理。",
  "bindings[].acp":
    "bindings[].type=acp 的可选每绑定 ACP 覆盖。此层为匹配的会话覆盖 agents.list[].runtime.acp 默认值。",
  "bindings[].acp.mode": "此绑定的 ACP 会话模式覆盖（persistent 或 oneshot）。",
  "bindings[].acp.label":
    "此绑定会话中 ACP 状态/诊断的人类友好标签。",
  "bindings[].acp.cwd": "从此绑定创建的 ACP 会话的工作目录覆盖。",
  "bindings[].acp.backend":
    "此绑定的 ACP 后端覆盖（回退到代理运行时 ACP 后端，然后全局 acp.backend）。",
  broadcast:
    "Broadcast routing map for sending the same outbound message to multiple peer IDs per source conversation. Keep this minimal and audited because one source can fan out to many destinations.",
  "broadcast.strategy":
    'Delivery order for broadcast fan-out: "parallel" sends to all targets concurrently, while "sequential" sends one-by-one. Use "parallel" for speed and "sequential" for stricter ordering/backpressure control.',
  "broadcast.*":
    "每源广播目标列表，其中每个键是源对等 ID，值是目标对等 ID 数组。保持列表有意以避免意外的消息放大。",
  "diagnostics.flags":
    'Enable targeted diagnostics logs by flag (e.g. ["telegram.http"]). Supports wildcards like "telegram.*" or "*".',
  "diagnostics.enabled":
    "启用或禁用诊断子系统。",
  "diagnostics.stuckSessionWarnMs":
    "会话被视为卡住并触发警告之前的毫秒阈值。",
  "diagnostics.otel.enabled":
    "启用 OpenTelemetry 遥测数据的收集和导出。",
  "diagnostics.otel.endpoint":
    "OpenTelemetry 收集器端点 URL。",
  "diagnostics.otel.protocol":
    'OTel transport protocol for telemetry export: "http/protobuf" or "grpc" depending on collector support. Use the protocol your observability backend expects to avoid dropped telemetry payloads.',
  "diagnostics.otel.headers":
    "发送到 OpenTelemetry 收集器的自定义头部。",
  "diagnostics.otel.serviceName":
    "注册到 OpenTelemetry 的服务名称。",
  "diagnostics.otel.traces":
    "启用 OpenTelemetry 跟踪数据导出。",
  "diagnostics.otel.metrics":
    "启用 OpenTelemetry 指标数据导出。",
  "diagnostics.otel.logs":
    "启用 OpenTelemetry 日志数据导出。",
  "diagnostics.otel.sampleRate":
    "OpenTelemetry 跟踪采样率（0.0 到 1.0）。",
  "diagnostics.otel.flushIntervalMs":
    "OpenTelemetry 数据刷新间隔（毫秒）。",
  "diagnostics.cacheTrace.enabled":
    "启用缓存跟踪日志记录。",
  "diagnostics.cacheTrace.filePath":
    "缓存跟踪日志的输出文件路径。",
  "diagnostics.cacheTrace.includeMessages":
    "在缓存跟踪中包含消息内容。",
  "diagnostics.cacheTrace.includePrompt": "在缓存跟踪中包含提示内容。",
  "diagnostics.cacheTrace.includeSystem": "在缓存跟踪中包含系统消息。",
  "tools.exec.applyPatch.enabled":
    "实验性。当工具策略允许时，为 OpenAI 模型启用 apply_patch。",
  "tools.exec.applyPatch.workspaceOnly":
    "将 apply_patch 路径限制在工作区目录内（默认：true）。设为 false 允许写入工作区外部（危险）。",
  "tools.exec.applyPatch.allowModels":
    'Optional allowlist of model ids (e.g. "gpt-5.2" or "openai/gpt-5.2").',
  "tools.loopDetection.enabled":
    "启用重复工具调用循环检测和退避安全检查（默认：false）。",
  "tools.loopDetection.historySize": "循环检测的工具历史窗口大小（默认：30）。",
  "tools.loopDetection.warningThreshold":
    "检测器启用时重复模式的警告阈值（默认：10）。",
  "tools.loopDetection.criticalThreshold":
    "检测器启用时重复模式的严重阈值（默认：20）。",
  "tools.loopDetection.globalCircuitBreakerThreshold":
    "全局无进展断路器阈值（默认：30）。",
  "tools.loopDetection.detectors.genericRepeat":
    "启用通用重复相同工具/相同参数循环检测（默认：true）。",
  "tools.loopDetection.detectors.knownPollNoProgress":
    "启用已知轮询工具无进展循环检测（默认：true）。",
  "tools.loopDetection.detectors.pingPong": "启用乒乓循环检测（默认：true）。",
  "tools.exec.notifyOnExit":
    "为 true 时（默认），后台执行会话退出和节点执行生命周期事件会入队系统事件并请求心跳。",
  "tools.exec.notifyOnExitEmptySuccess":
    "为 true 时，输出为空的成功后台执行退出仍会入队完成系统事件（默认：false）。",
  "tools.exec.pathPrepend": "为执行运行（网关/沙箱）预置到 PATH 的目录。",
  "tools.exec.safeBins":
    "允许仅 stdin 的安全二进制文件在没有显式白名单条目的情况下运行。",
  "tools.exec.strictInlineEval":
    "要求对解释器内联求值形式（如 `python -c`、`node -e`、`ruby -e` 或 `osascript -e`）进行显式审批。防止静默白名单复用，并将这些形式的 allow-always 降级为 ask-each-time。",
  "tools.exec.safeBinTrustedDirs":
    "用于安全二进制路径检查的额外显式受信任目录（PATH 条目永远不会被自动信任）。",
  "tools.exec.safeBinProfiles":
    "可选的每二进制安全二进制配置文件（位置限制 + 允许/拒绝标志）。",
  "tools.profile":
    "工具配置文件，预定义一组工具启用/禁用规则。",
  "tools.alsoAllow":
    "在配置文件基础上额外允许的工具。",
  "tools.byProvider":
    "按渠道/提供商 ID 索引的每提供商工具允许/拒绝覆盖，以按界面定制功能。当某个提供商需要比全局工具策略更严格的控制时使用。",
  "agents.list[].tools.profile":
    "当某个代理需要不同的功能基准时，用于工具配置文件选择的每代理覆盖。谨慎使用，以保持各代理间的策略差异有意且可审查。",
  "agents.list[].tools.alsoAllow":
    "在全局和配置文件策略之上的每代理附加工具白名单。保持范围窄以避免专用代理的意外权限扩展。",
  "agents.list[].tools.byProvider":
    "渠道范围功能控制的每代理提供商特定工具策略覆盖。当单个代理需要对某个提供商施加比其他提供商更严格的限制时使用。",
  "tools.exec.approvalRunningNoticeMs":
    "执行审批通过后显示进行中通知前的延迟（毫秒）。增加以减少快速命令的闪烁，或降低以更快获得操作员反馈。",
  "tools.links.enabled":
    "启用自动链接理解预处理，以便在代理推理前对 URL 进行摘要。保持启用以获得更丰富的上下文，当需要严格的最小处理时禁用。",
  "tools.links.maxLinks":
    "链接理解期间每轮展开的最大链接数。使用较低值控制聊天线程中的延迟/成本，当多链接上下文至关重要时使用较高值。",
  "tools.links.timeoutSeconds":
    "跳过未解析链接前的每链接理解超时预算（秒）。保持有界以避免外部站点缓慢或不可达时的长时间停顿。",
  "tools.links.models":
    "链接理解任务的首选模型列表，在支持时按顺序作为回退评估。将轻量级模型放在前面用于常规摘要，仅在需要时使用更重的模型。",
  "tools.links.scope":
    "控制链接理解相对于会话上下文和消息类型何时运行。保持保守范围以避免在链接不可操作的消息上进行不必要的获取。",
  "tools.media.models":
    "当未设置特定模态模型列表时，媒体理解工具使用的共享回退模型列表。保持与可用的多模态提供商对齐以避免运行时回退波动。",
  "tools.media.concurrency":
    "跨图片、音频和视频任务的每轮最大并发媒体理解操作数。在资源受限的部署中降低以防止 CPU/网络饱和。",
  "tools.media.image.enabled":
    "启用图片理解，以便附加或引用的图片可以被解释为文本上下文。如果需要纯文本操作或想避免图片处理成本则禁用。",
  "tools.media.image.maxBytes":
    "策略跳过或截断前接受的最大图片有效载荷大小（字节）。保持限制与你的提供商上限和基础设施带宽相符。",
  "tools.media.image.maxChars":
    "模型响应标准化后图片理解输出返回的最大字符数。使用更紧的限制减少提示膨胀，对细节密集的 OCR 任务使用更大限制。",
  "tools.media.image.prompt":
    "用于图片理解请求的指令模板，以塑造提取风格和细节级别。保持提示确定性以使输出在各轮次和渠道间保持一致。",
  "tools.media.image.timeoutSeconds":
    "每个图片理解请求中止前的超时（秒）。对高分辨率分析增加，对延迟敏感的操作员工作流降低。",
  "tools.media.image.attachments":
    "图片输入的附件处理策略，包括哪些消息附件有资格进行图片分析。在不受信任的渠道中使用限制性设置以减少意外处理。",
  "tools.media.image.models":
    "当你想覆盖共享媒体模型时，专门用于图片理解的有序模型偏好。将最可靠的多模态模型放在前面以减少回退尝试。",
  "tools.media.image.scope":
    "图片理解何时尝试的范围选择器（例如仅显式请求与更广泛的自动检测）。在繁忙渠道中保持窄范围以控制令牌和 API 支出。",
  ...MEDIA_AUDIO_FIELD_HELP,
  "tools.media.video.enabled":
    "启用视频理解，以便视频片段可以被摘要为文本用于下游推理和响应。当处理视频超出策略或对你的部署过于昂贵时禁用。",
  "tools.media.video.maxBytes":
    "策略拒绝或修剪前接受的最大视频有效载荷大小（字节）。根据提供商和基础设施限制调整以避免重复的超时/失败循环。",
  "tools.media.video.maxChars":
    "从视频理解输出保留的最大字符数以控制提示增长。对密集场景描述提高，当偏好简洁摘要时降低。",
  "tools.media.video.prompt":
    "视频理解的指令模板，描述所需的摘要粒度和关注区域。保持稳定以使输出质量在模型/提供商回退间保持可预测。",
  "tools.media.video.timeoutSeconds":
    "每个视频理解请求取消前的超时（秒）。在交互渠道中使用保守值，对离线或批量密集处理使用较长值。",
  "tools.media.video.attachments":
    "视频分析的附件资格策略，定义哪些消息文件可以触发视频处理。在共享渠道中保持明确以防止意外的大型媒体工作负载。",
  "tools.media.video.models":
    "在共享媒体回退应用前，专门用于视频理解的有序模型偏好。优先选择具有强多模态视频支持的模型以最小化降级摘要。",
  "tools.media.video.scope":
    "控制视频理解何时跨传入事件尝试的范围选择器。在嘈杂渠道中缩窄范围，仅在视频解释是工作流核心时扩大。",
  "skills.load.watch":
    "启用文件系统监视技能定义更改以无需完全进程重启即可应用更新。在开发工作流中保持启用，在不可变生产镜像中禁用。",
  "skills.load.watchDebounceMs":
    "重载逻辑运行前合并快速技能文件更改的去抖窗口（毫秒）。增加以减少频繁写入时的重载波动，或降低以更快的编辑反馈。",
  approvals:
    "Approval routing controls for forwarding exec approval requests to chat destinations outside the originating session. Keep this disabled unless operators need explicit out-of-band approval visibility.",
  "approvals.exec":
    "执行审批转发行为分组，包括启用、路由模式、过滤器和显式目标。当审批提示必须到达操作渠道而非仅源线程时在此配置。",
  "approvals.exec.enabled":
    "启用将执行审批请求转发到已配置的投递目标（默认：false）。在低风险设置中保持禁用，仅在人工审批响应者需要渠道可见提示时启用。",
  "approvals.exec.mode":
    'Controls where approval prompts are sent: "session" uses origin chat, "targets" uses configured targets, and "both" sends to both paths. Use "session" as baseline and expand only when operational workflow requires redundancy.',
  "approvals.exec.agentFilter":
    'Optional allowlist of agent IDs eligible for forwarded approvals, for example `["primary", "ops-agent"]`. Use this to limit forwarding blast radius and avoid notifying channels for unrelated agents.',
  "approvals.exec.sessionFilter":
    'Optional session-key filters matched as substring or regex-style patterns, for example `["discord:", "^agent:ops:"]`. Use narrow patterns so only intended approval contexts are forwarded to shared destinations.',
  "approvals.exec.targets":
    "转发模式包含目标时使用的显式投递目标，每个带渠道和目标详情。保持目标列表最小权限并在启用广泛转发前验证每个目标。",
  "approvals.exec.targets[].channel":
    "用于转发审批投递的渠道/提供商 ID，如 discord、slack 或插件渠道 ID。仅使用有效的渠道 ID 以使审批不因未知路由而静默失败。",
  "approvals.exec.targets[].to":
    "目标渠道内的目标标识符（渠道 ID、用户 ID 或线程根，取决于提供商）。验证每个提供商的语义因为目标格式在渠道集成间不同。",
  "approvals.exec.targets[].accountId":
    "审批必须通过特定账户上下文路由时多账户渠道设置的可选账户选择器。仅在目标渠道有多个已配置身份时使用。",
  "approvals.exec.targets[].threadId":
    "支持审批转发的线程投递的渠道的可选线程/话题目标。用于将审批流量控制在操作线程中而非主渠道。",
  "tools.fs.workspaceOnly":
    "将文件系统工具（read/write/edit/apply_patch）限制在工作区目录内（默认：false）。",
  "tools.sessions.visibility":
    'Controls which sessions can be targeted by sessions_list/sessions_history/sessions_send. ("tree" default = current session + spawned subagent sessions; "self" = only current; "agent" = any session in the current agent id; "all" = any session; cross-agent still requires tools.agentToAgent).',
  "tools.message.allowCrossContextSend":
    "旧版覆盖：允许跨所有提供商的跨上下文发送。",
  "tools.message.crossContext.allowWithinProvider":
    "允许发送到同一提供商内的其他渠道（默认：true）。",
  "tools.message.crossContext.allowAcrossProviders":
    "允许跨不同提供商发送（默认：false）。",
  "tools.message.crossContext.marker.enabled":
    "跨上下文发送时添加可见的来源标记（默认：true）。",
  "tools.message.crossContext.marker.prefix":
    'Text prefix for cross-context markers (supports "{channel}").',
  "tools.message.crossContext.marker.suffix":
    'Text suffix for cross-context markers (supports "{channel}").',
  "tools.message.broadcast.enabled": "启用广播操作（默认：true）。",
  "tools.web.search.enabled": "启用网页搜索功能。",
  "tools.web.search.provider":
    "搜索提供商 ID。如省略则从可用 API 密钥自动检测。",
  "tools.web.search.maxResults": "搜索返回的最大结果数。",
  "tools.web.search.timeoutSeconds": "web_search 请求的超时（秒）。",
  "tools.web.search.cacheTtlMinutes": "web_search 结果的缓存 TTL（分钟）。",
  "tools.web.fetch.enabled": "启用 web_fetch 工具（轻量级 HTTP 获取）。",
  "tools.web.fetch.maxChars": "web_fetch 返回的最大字符数（截断）。",
  "tools.web.fetch.maxCharsCap":
    "web_fetch maxChars 的硬性上限（适用于配置和工具调用）。",
  "tools.web.fetch.maxResponseBytes": "Max download size before truncation.",
  "tools.web.fetch.timeoutSeconds": "web_fetch 请求的超时（秒）。",
  "tools.web.fetch.cacheTtlMinutes": "web_fetch 结果的缓存 TTL（分钟）。",
  "tools.web.fetch.maxRedirects": "web_fetch 允许的最大重定向次数（默认：3）。",
  "tools.web.fetch.userAgent": "覆盖 web_fetch 请求的 User-Agent 头。",
  "tools.web.fetch.readability":
    "使用 Readability 从 HTML 中提取主要内容（回退到基本 HTML 清理）。",
  "tools.web.fetch.firecrawl.enabled": "启用 web_fetch 的 Firecrawl 回退（如已配置）。",
  "tools.web.fetch.firecrawl.apiKey": "Firecrawl API 密钥（回退：FIRECRAWL_API_KEY 环境变量）。",
  "tools.web.fetch.firecrawl.baseUrl":
    "Firecrawl 基础 URL（例如 https://api.firecrawl.dev 或自定义端点）。",
  "tools.web.fetch.firecrawl.onlyMainContent":
    "为 true 时，Firecrawl 仅返回主要内容（默认：true）。",
  "tools.web.fetch.firecrawl.maxAgeMs":
    "Firecrawl maxAge（毫秒），用于 API 支持时的缓存结果。",
  "tools.web.fetch.firecrawl.timeoutSeconds": "Firecrawl 请求的超时（秒）。",
  models:
    "模型配置。",
  "models.mode":
    'Controls provider catalog behavior: "merge" keeps built-ins and overlays your custom providers, while "replace" uses only your configured providers. In "merge", matching provider IDs preserve non-empty agent models.json baseUrl values, while apiKey values are preserved only when the provider is not SecretRef-managed in current config/auth-profile context; SecretRef-managed providers refresh apiKey from current source markers, and matching model contextWindow/maxTokens use the higher value between explicit and implicit entries.',
  "models.providers":
    "按提供商 ID 索引的提供商映射，包含连接/认证设置和具体模型定义。使用稳定的提供商键以使来自代理和工具的引用在各环境间保持可移植。",
  "models.providers.*.baseUrl":
    "用于为该提供商条目提供模型请求的提供商端点基础 URL。使用 HTTPS 端点并在需要时通过配置模板保持 URL 特定于环境。",
  "models.providers.*.apiKey":
    "当提供商需要直接密钥认证时用于基于 API 密钥认证的提供商凭证。使用密钥/环境变量替换并避免在已提交的配置文件中存储真实密钥。",
  "models.providers.*.auth":
    'Selects provider auth style: "api-key" for API key auth, "token" for bearer token auth, "oauth" for OAuth credentials, and "aws-sdk" for AWS credential resolution. Match this to your provider requirements.',
  "models.providers.*.api":
    "控制模型调用请求/响应兼容性处理的提供商 API 适配器选择。使用与你的上游提供商协议匹配的适配器以避免功能不匹配。",
  "models.providers.*.injectNumCtxForOpenAICompat":
    "控制 OpenClaw 是否为使用 OpenAI 兼容适配器（`openai-completions`）配置的 Ollama 提供商注入 `options.num_ctx`。默认为 true。仅在你的代理/上游拒绝未知 `options` 载荷字段时设为 false。",
  "models.providers.*.headers":
    "合并到提供商请求中的静态 HTTP 头，用于租户路由、代理认证或自定义网关需求。谨慎使用并将敏感头值保存在密钥中。",
  "models.providers.*.authHeader":
    "为 true 时，凭证通过 HTTP Authorization 头发送，即使有替代认证方式。仅在你的提供商或代理明确要求 Authorization 转发时使用。",
  "models.providers.*.models":
    "提供商的已声明模型列表，包括标识符、元数据和可选的兼容性/成本提示。保持 ID 与提供商目录值完全一致，以确保选择和回退正确解析。",
  "models.bedrockDiscovery":
    "自动 AWS Bedrock 模型发现设置，用于从账户可见性合成提供商模型条目。保持发现范围受限和刷新间隔保守以减少 API 开销。",
  "models.bedrockDiscovery.enabled":
    "启用定期 Bedrock 模型发现和目录刷新。除非积极使用 Bedrock 且 IAM 权限配置正确，否则保持禁用。",
  "models.bedrockDiscovery.region":
    "启用发现时用于 Bedrock 发现调用的 AWS 区域。使用你的 Bedrock 模型已配置的区域以避免空发现结果。",
  "models.bedrockDiscovery.providerFilter":
    "可选的 Bedrock 发现提供商白名单过滤器，仅刷新选定的提供商。用于在多提供商环境中限制发现范围。",
  "models.bedrockDiscovery.refreshInterval":
    "Bedrock 发现轮询的刷新间隔（秒），用于随时间检测新可用模型。在生产环境中使用较长间隔以减少 API 成本和控制面噪声。",
  "models.bedrockDiscovery.defaultContextWindow":
    "当提供商元数据缺少显式限制时应用于已发现模型的回退上下文窗口值。使用现实的默认值以避免超过真实提供商约束的超大提示。",
  "models.bedrockDiscovery.defaultMaxTokens":
    "当提供商元数据缺少显式输出令牌限制时应用于已发现模型的回退最大令牌值。使用保守默认值以减少截断意外和意外令牌消耗。",
  auth: "认证配置。",
  "channels.slack.allowBots":
    "允许机器人发送的消息触发 Slack 回复（默认：false）。",
  "channels.matrix.allowBots":
    'Allow messages from other configured Matrix bot accounts to trigger replies (default: false). Set "mentions" to only accept bot messages that visibly mention this bot.',
  "channels.slack.thread.historyScope":
    'Scope for Slack thread history context ("thread" isolates per thread; "channel" reuses channel history).',
  "channels.slack.thread.inheritParent":
    "如果为 true，Slack 线程会话继承父频道的对话记录（默认：false）。",
  "channels.slack.thread.initialHistoryLimit":
    "启动新线程会话时获取的最大现有 Slack 线程消息数（默认：20，设为 0 禁用）。",
  "channels.mattermost.botToken":
    "来自 Mattermost 系统控制台 -> 集成 -> 机器人账户的机器人令牌。",
  "channels.mattermost.baseUrl":
    "Mattermost 服务器的基础 URL（例如 https://chat.example.com）。",
  "channels.mattermost.chatmode":
    'Reply to channel messages on mention ("oncall"), on trigger chars (">" or "!") ("onchar"), or on every message ("onmessage").',
  "channels.mattermost.oncharPrefixes": 'Trigger prefixes for onchar mode (default: [">", "!"]).',
  "channels.mattermost.requireMention":
    "在频道中响应前要求 @提及（默认：true）。",
  "auth.profiles": "命名认证配置文件（提供商 + 模式 + 可选邮箱）。",
  "auth.order": "每个提供商的有序认证配置文件 ID（用于自动故障转移）。",
  "auth.cooldowns":
    "认证尝试冷却配置。",
  "auth.cooldowns.billingBackoffHours":
    "配置文件因计费/额度不足失败时的基础退避时间（小时，默认：5）。",
  "auth.cooldowns.billingBackoffHoursByProvider":
    "可选的按提供商计费退避时间覆盖（小时）。",
  "auth.cooldowns.billingMaxHours": "计费退避时间上限（小时，默认：24）。",
  "auth.cooldowns.failureWindowHours": "退避计数器的失败窗口（小时，默认：24）。",
  "agents.defaults.workspace":
    "暴露给代理运行时工具的默认工作区路径，用于文件系统上下文和仓库感知行为。从包装器运行时请显式设置，以保持路径解析确定性。",
  "agents.defaults.bootstrapMaxChars":
    "注入系统提示的每个工作区引导文件在截断前的最大字符数（默认：20000）。",
  "agents.defaults.bootstrapTotalMaxChars":
    "所有注入的工作区引导文件的最大总字符数（默认：150000）。",
  "agents.defaults.bootstrapPromptTruncationWarning":
    'Inject agent-visible warning text when bootstrap files are truncated: "off", "once" (default), or "always".',
  "agents.defaults.repoRoot":
    "系统提示运行时行中显示的可选仓库根路径（覆盖自动检测）。",
  "agents.defaults.envelopeTimezone":
    'Timezone for message envelopes ("utc", "local", "user", or an IANA timezone string).',
  "agents.defaults.envelopeTimestamp":
    'Include absolute timestamps in message envelopes ("on" or "off").',
  "agents.defaults.envelopeElapsed": 'Include elapsed time in message envelopes ("on" or "off").',
  "agents.defaults.models": "已配置的模型目录（键为完整的 provider/model ID）。",
  "agents.defaults.memorySearch":
    "对 MEMORY.md 和 memory/*.md 的向量搜索（支持每代理覆盖）。",
  "agents.defaults.memorySearch.enabled":
    "此代理配置文件上记忆搜索索引和检索行为的主开关。保持启用以获得语义回忆，禁用则获得完全无状态的响应。",
  "agents.defaults.memorySearch.sources":
    'Chooses which sources are indexed: "memory" reads MEMORY.md + memory files, and "sessions" includes transcript history. Keep ["memory"] unless you need recall from prior chat transcripts.',
  "agents.defaults.memorySearch.extraPaths":
    "将额外目录或 .md 文件添加到默认记忆文件之外的记忆索引中。当关键参考文档位于仓库其他位置时使用；启用多模态记忆时，这些路径下匹配的图片/音频文件也有资格被索引。",
  "agents.defaults.memorySearch.multimodal":
    'Optional multimodal memory settings for indexing image and audio files from configured extra paths. Keep this off unless your embedding model explicitly supports cross-modal embeddings, and set `memorySearch.fallback` to "none" while it is enabled. Matching files are uploaded to the configured remote embedding provider during indexing.',
  "agents.defaults.memorySearch.multimodal.enabled":
    "从 extraPaths 启用图片/音频记忆索引。目前需要 Gemini embedding-2，保持默认记忆根为纯 Markdown，禁用记忆搜索回退提供商，并将匹配的二进制内容上传到已配置的远程嵌入提供商。",
  "agents.defaults.memorySearch.multimodal.modalities":
    'Selects which multimodal file types are indexed from extraPaths: "image", "audio", or "all". Keep this narrow to avoid indexing large binary corpora unintentionally.',
  "agents.defaults.memorySearch.multimodal.maxFileBytes":
    "设置记忆索引期间跳过前每个多模态文件允许的最大字节数。用于限制上传成本和索引延迟，或提高以容纳短的高质量音频片段。",
  "agents.defaults.memorySearch.experimental.sessionMemory":
    "将会话记录索引到记忆搜索中，使响应可以引用先前的聊天轮次。除非需要记录回忆，否则保持关闭，因为索引成本和存储使用都会增加。",
  "agents.defaults.memorySearch.provider":
    'Selects the embedding backend used to build/query memory vectors: "openai", "gemini", "voyage", "mistral", "ollama", or "local". Keep your most reliable provider here and configure fallback for resilience.',
  "agents.defaults.memorySearch.model":
    "当需要非默认模型时，选定的记忆提供商使用的嵌入模型覆盖。仅在需要超出提供商默认值的显式回忆质量/成本调优时设置。",
  "agents.defaults.memorySearch.outputDimensionality":
    "仅限 Gemini embedding-2：选择内存嵌入的输出向量大小。使用 768、1536 或 3072（默认），更改后需要完全重新索引，因为存储的向量维度必须保持一致。",
  "agents.defaults.memorySearch.remote.baseUrl":
    "覆盖嵌入 API 端点，如 OpenAI 兼容代理或自定义 Gemini 基础 URL。仅在通过自己的网关或供应商端点路由时使用；否则保持提供商默认值。",
  "agents.defaults.memorySearch.remote.apiKey":
    "为记忆索引和查询时嵌入使用的远程嵌入调用提供专用 API 密钥。当记忆嵌入应使用与全局默认值或环境变量不同的凭证时使用。",
  "agents.defaults.memorySearch.remote.headers":
    "添加自定义 HTTP 头到远程嵌入请求，与提供商默认值合并。用于代理认证和租户路由头，保持值最小以避免泄露敏感元数据。",
  "agents.defaults.memorySearch.remote.batch.enabled":
    "在支持时启用提供商批量 API 进行嵌入作业（OpenAI/Gemini），提高大型索引运行的吞吐量。保持启用，除非调试提供商批量失败或运行非常小的工作负载。",
  "agents.defaults.memorySearch.remote.batch.wait":
    "等待批量嵌入作业完全完成后索引操作才完成。保持启用以获得确定性索引状态；仅在接受延迟一致性时禁用。",
  "agents.defaults.memorySearch.remote.batch.concurrency":
    "限制索引期间同时运行的嵌入批量作业数（默认：2）。谨慎增加以加快批量索引，但注意提供商速率限制和队列错误。",
  "agents.defaults.memorySearch.remote.batch.pollIntervalMs":
    "控制系统轮询提供商 API 以获取批量作业状态的频率（毫秒，默认：2000）。使用较长间隔减少 API 通信，或较短间隔加快完成检测。",
  "agents.defaults.memorySearch.remote.batch.timeoutMinutes":
    "设置完整嵌入批量操作的最大等待时间（分钟，默认：60）。对非常大的语料库或较慢的提供商增加，对自动化密集流程降低以快速失败。",
  "agents.defaults.memorySearch.local.modelPath":
    "指定本地记忆搜索的本地嵌入模型源，如 GGUF 文件路径或 `hf:` URI。仅在提供商为 `local` 时使用，并在大型索引重建前验证模型兼容性。",
  "agents.defaults.memorySearch.fallback":
    'Backup provider used when primary embeddings fail: "openai", "gemini", "voyage", "mistral", "ollama", "local", or "none". Set a real fallback for production reliability; use "none" only if you prefer explicit failures.',
  "agents.defaults.memorySearch.store.path":
    "设置每个代理的 SQLite 记忆索引在磁盘上的存储位置。保持默认的 `~/.openclaw/memory/{agentId}.sqlite`，除非需要自定义存储放置或备份策略对齐。",
  "agents.defaults.memorySearch.store.vector.enabled":
    "启用记忆搜索中用于向量相似性查询的 sqlite-vec 扩展（默认：true）。保持启用以获得正常的语义回忆；仅在调试或仅回退操作时禁用。",
  "agents.defaults.memorySearch.store.vector.extensionPath":
    "覆盖自动发现的 sqlite-vec 扩展库路径（`.dylib`、`.so` 或 `.dll`）。当运行时无法自动找到 sqlite-vec 或你锁定已知良好的构建时使用。",
  "agents.defaults.memorySearch.chunking.tokens":
    "在嵌入/索引前分割记忆源时使用的令牌块大小。增加以获得每块更广泛的上下文，或降低以提高精确查找的精度。",
  "agents.defaults.memorySearch.chunking.overlap":
    "相邻记忆块之间的令牌重叠，用于保持分割边界附近的上下文连续性。使用适度的重叠以减少边界遗漏而不过度膨胀索引大小。",
  "agents.defaults.memorySearch.query.maxResults":
    "在下游重排序和提示注入前从搜索返回的最大记忆命中数。提高以获得更广泛的回忆，或降低以获得更紧凑的提示和更快的响应。",
  "agents.defaults.memorySearch.query.minScore":
    "将记忆结果纳入最终回忆输出的最低相关性分数阈值。增加以减少弱/噪声匹配，或降低以获得更宽松的检索。",
  "agents.defaults.memorySearch.query.hybrid.enabled":
    "结合 BM25 关键词匹配和向量相似性，以在混合精确+语义查询上获得更好的回忆。保持启用，除非你正在隔离排序行为以进行故障排除。",
  "agents.defaults.memorySearch.query.hybrid.vectorWeight":
    "控制语义相似性对混合排序影响的强度（0-1）。当释义匹配比精确术语更重要时增加；降低以更严格地强调关键词。",
  "agents.defaults.memorySearch.query.hybrid.textWeight":
    "控制 BM25 关键词相关性对混合排序影响的强度（0-1）。增加以精确术语匹配；降低以让语义匹配排名更高。",
  "agents.defaults.memorySearch.query.hybrid.candidateMultiplier":
    "扩展重排序前的候选池（默认：4）。提高以在噪声语料库上获得更好的回忆，但预期更多计算和稍慢的搜索。",
  "agents.defaults.memorySearch.query.hybrid.mmr.enabled":
    "添加 MMR 重排序以多样化结果并减少单个答案窗口中的近重复片段。当回忆看起来重复时启用；保持关闭以严格按分数排序。",
  "agents.defaults.memorySearch.query.hybrid.mmr.lambda":
    "设置 MMR 相关性与多样性的平衡（0 = 最多样化，1 = 最相关，默认：0.7）。较低的值减少重复；较高的值保持紧密相关但可能重复。",
  "agents.defaults.memorySearch.query.hybrid.temporalDecay.enabled":
    "应用新近度衰减，使较新的记忆在分数接近时可以超过较旧的记忆。当时效性很重要时启用；对永恒的参考知识保持关闭。",
  "agents.defaults.memorySearch.query.hybrid.temporalDecay.halfLifeDays":
    "控制启用时间衰减时旧记忆失去排名的速度（半衰期，天，默认：30）。较低的值更积极地优先考虑最近的上下文。",
  "agents.defaults.memorySearch.cache.enabled":
    "将计算的块嵌入缓存在 SQLite 中，以加快重新索引和增量更新（默认：true）。保持启用，除非调查缓存正确性或最小化磁盘使用。",
  memory: "记忆配置。",
  "memory.backend":
    'Selects the global memory engine: "builtin" uses OpenClaw memory internals, while "qmd" uses the QMD sidecar pipeline. Keep "builtin" unless you intentionally operate QMD.',
  "memory.citations":
    'Controls citation visibility in replies: "auto" shows citations when useful, "on" always shows them, and "off" hides them. Keep "auto" for a balanced signal-to-noise default.',
  "memory.qmd.command":
    "QMD 二进制文件路径。",
  "memory.qmd.mcporter":
    "QMD MCPorter 配置。",
  "memory.qmd.mcporter.enabled":
    "通过 mcporter 守护进程路由 QMD 而非每个请求生成 qmd，减少大型模型的冷启动开销。除非 mcporter 已安装和配置，否则保持禁用。",
  "memory.qmd.mcporter.serverName":
    "命名用于 QMD 调用的 mcporter 服务器目标（默认：qmd）。仅在你的 mcporter 设置为 qmd mcp keep-alive 使用自定义服务器名称时更改。",
  "memory.qmd.mcporter.startDaemon":
    "启用 mcporter 支持的 QMD 模式时自动启动 mcporter 守护进程（默认：true）。除非进程生命周期由你的服务管理器外部管理，否则保持启用。",
  "memory.qmd.searchMode":
    'Selects the QMD retrieval path: "query" uses standard query flow, "search" uses search-oriented retrieval, and "vsearch" emphasizes vector retrieval. Keep default unless tuning relevance quality.',
  "memory.qmd.includeDefaultMemory":
    "自动将默认记忆文件（MEMORY.md 和 memory/**/*.md）索引到 QMD 集合中。除非你希望仅通过显式自定义路径控制索引，否则保持启用。",
  "memory.qmd.paths":
    "QMD 额外搜索路径。",
  "memory.qmd.paths.path":
    "定义 QMD 应扫描的根位置，使用绝对路径或 `~` 相对路径。使用稳定目录以使集合身份不在各环境间漂移。",
  "memory.qmd.paths.pattern":
    "使用 glob 模式过滤每个索引根下的文件，默认 `**/*.md`。当目录包含混合文件类型时使用更窄的模式以减少噪声和索引成本。",
  "memory.qmd.paths.name":
    "为索引路径设置稳定的集合名称而非从文件系统位置推导。当路径在各机器间变化但你希望一致的集合身份时使用。",
  "memory.qmd.sessions.enabled":
    "将会话记录索引到 QMD 中以使回忆可以包含先前的会话内容（实验性，默认：false）。仅在需要记录记忆且接受更大的索引波动时启用。",
  "memory.qmd.sessions.exportDir":
    "覆盖清理后的会话导出在 QMD 索引前写入的位置。当默认状态存储受限或导出必须落在受管卷上时使用。",
  "memory.qmd.sessions.retentionDays":
    "定义导出的会话文件在自动清理前保留多长时间（天，默认：无限）。为存储卫生或合规保留策略设置有限值。",
  "memory.qmd.update.interval":
    "设置 QMD 从源内容刷新索引的频率（持续时间字符串，默认：5m）。较短间隔提高新鲜度但增加后台 CPU 和 I/O。",
  "memory.qmd.update.debounceMs":
    "设置连续 QMD 刷新尝试之间的最小延迟（毫秒，默认：15000）。如果频繁的文件更改导致更新颠簸或不必要的后台负载则增加。",
  "memory.qmd.update.onBoot":
    "在网关启动期间运行一次初始 QMD 更新（默认：true）。保持启用以使回忆从新鲜基线开始；仅在启动速度比即时新鲜度更重要时禁用。",
  "memory.qmd.update.waitForBootSync":
    "阻止启动完成直到初始启动时 QMD 同步完成（默认：false）。当你需要在服务流量前完全最新的回忆时启用，保持关闭以更快启动。",
  "memory.qmd.update.embedInterval":
    "设置 QMD 重新计算嵌入的频率（持续时间字符串，默认：60m；设为 0 禁用定期嵌入）。较低间隔提高新鲜度但增加嵌入工作负载和成本。",
  "memory.qmd.update.commandTimeoutMs":
    "设置 QMD 维护命令（如集合列表/添加）的超时（毫秒，默认：30000）。在较慢磁盘或延迟命令完成的远程文件系统上运行时增加。",
  "memory.qmd.update.updateTimeoutMs":
    "设置每个 `qmd update` 周期的最大运行时间（毫秒，默认：120000）。对较大集合提高；对自动化中更快故障检测降低。",
  "memory.qmd.update.embedTimeoutMs":
    "设置每个 `qmd embed` 周期的最大运行时间（毫秒，默认：120000）。对更重的嵌入工作负载或较慢硬件增加，对紧 SLA 降低以快速失败。",
  "memory.qmd.limits.maxResults":
    "限制每个回忆请求返回到代理循环中的 QMD 命中数（默认：6）。增加以获得更广泛的回忆上下文，或降低以保持提示更紧凑和更快。",
  "memory.qmd.limits.maxSnippetChars":
    "限制从 QMD 命中提取的每结果片段长度（字符，默认：700）。当提示快速膨胀时降低，仅在答案一直遗漏关键细节时提高。",
  "memory.qmd.limits.maxInjectedChars":
    "限制一轮中跨所有命中可注入到的 QMD 文本量。使用较低值控制提示膨胀和延迟；仅在上下文一直被截断时提高。",
  "memory.qmd.limits.timeoutMs":
    "设置每查询 QMD 搜索超时（毫秒，默认：4000）。对较大索引或较慢环境增加，降低以保持请求延迟有界。",
  "memory.qmd.scope":
    "使用 session.sendPolicy 风格规则定义哪些会话/渠道有资格进行 QMD 回忆。除非你有意希望跨聊天记忆共享，否则保持默认的仅直接范围。",
  "agents.defaults.memorySearch.cache.maxEntries":
    "设置 SQLite 中为记忆搜索保留的缓存嵌入的尽力上限。当控制磁盘增长比峰值重新索引速度更重要时使用。",
  "agents.defaults.memorySearch.sync.onSessionStart":
    "在会话开始时触发记忆索引同步，使早期轮次可以看到新鲜的记忆内容。当启动新鲜度比初始轮次延迟更重要时保持启用。",
  "agents.defaults.memorySearch.sync.onSearch":
    "在检测到内容更改后，通过在搜索时调度重新索引来使用懒同步。保持启用以降低空闲开销，或在需要查询前预同步索引时禁用。",
  "agents.defaults.memorySearch.sync.watch":
    "监视记忆文件并从文件更改事件调度索引更新（chokidar）。启用以获得近实时的新鲜度；在非常大的工作区上如果监视变动太嘈杂则禁用。",
  "agents.defaults.memorySearch.sync.watchDebounceMs":
    "合并快速文件监视事件后进行重新索引运行之前的去抖窗口（毫秒）。增加以减少频繁写入文件的变动，或降低以更快获得新鲜度。",
  "agents.defaults.memorySearch.sync.sessions.deltaBytes":
    "至少需要这么多新追加的字节后会话记录更改才触发重新索引（默认：100000）。增加以减少频繁的小型重新索引，或降低以更快获得记录新鲜度。",
  "agents.defaults.memorySearch.sync.sessions.deltaMessages":
    "至少需要这么多追加的记录消息后才触发重新索引（默认：50）。降低以获得近实时的记录回忆，或提高以减少索引变动。",
  "agents.defaults.memorySearch.sync.sessions.postCompactionForce":
    "在压缩触发的记录更新后强制会话记忆搜索重新索引（默认：true）。当压缩摘要必须立即可搜索时保持启用，或禁用以减少写入时的索引压力。",
  ui: "用户界面配置。",
  "ui.seamColor":
    "UI 界面用于强调、徽章和视觉标识的主要强调色。使用在明暗主题中保持可读性的高对比度值。",
  "ui.assistant":
    "助手外观配置。",
  "ui.assistant.name":
    "UI 视图、聊天界面和状态上下文中显示的助手名称。保持稳定以便操作员可靠识别哪个助手人设处于活跃状态。",
  "ui.assistant.avatar":
    "UI 界面中使用的助手头像图片源（URL、路径或 data URI，取决于运行时支持）。使用可信资源和一致的品牌尺寸以获得清晰渲染。",
  plugins:
    "插件配置。",
  "plugins.enabled":
    "在启动和配置重载期间全局启用或禁用插件/扩展加载（默认：true）。仅在部署需要扩展功能时保持启用。",
  "plugins.allow":
    "可选的插件 ID 白名单；设置后仅列出的插件有资格加载。用于在受控环境中强制执行批准的扩展清单。",
  "plugins.deny":
    "可选的插件 ID 黑名单，即使白名单或路径包含也被阻止。使用拒绝规则进行紧急回滚和对风险插件的硬性阻止。",
  "plugins.load":
    "指定发现插件的文件系统路径的插件加载器配置组。保持加载路径明确且经过审查以避免意外的不受信任扩展加载。",
  "plugins.load.paths":
    "加载器在内置默认值之外扫描的额外插件文件或目录。使用专用扩展目录并避免包含不相关可执行内容的广泛路径。",
  "plugins.slots":
    "选择哪些插件拥有排他运行时槽位（如记忆），以使只有一个插件提供该功能。使用显式槽位所有权避免行为冲突的重叠提供商。",
  "plugins.slots.memory":
    'Select the active memory plugin by id, or "none" to disable memory plugins.',
  "plugins.slots.contextEngine":
    "按 ID 选择活跃的上下文引擎插件，使一个插件提供上下文编排行为。",
  "plugins.entries":
    "按插件 ID 索引的每插件设置，包括启用和插件特定的运行时配置载荷。用于范围化的插件调优而不更改全局加载器策略。",
  "plugins.entries.*.enabled":
    "特定条目的每插件启用覆盖，应用在全局插件策略之上（需要重启）。用于在各环境间逐步推出插件。",
  "plugins.entries.*.hooks":
    "核心强制安全门控的每插件类型化 hook 策略控制。用于在不禁用整个插件的情况下约束高影响 hook 类别。",
  "plugins.entries.*.hooks.allowPromptInjection":
    "控制此插件是否可以通过类型化 hooks 修改提示。设为 false 以阻止 `before_prompt_build` 并忽略旧版 `before_agent_start` 的提示修改字段，同时保留旧版 `modelOverride` 和 `providerOverride` 行为。",
  "plugins.entries.*.subagent":
    "模型覆盖信任和白名单的每插件子代理运行时控制。除非插件必须显式引导子代理模型选择，否则不设置。",
  "plugins.entries.*.subagent.allowModelOverride":
    "明确允许此插件在后台子代理运行中请求 provider/model 覆盖。除非插件受信任以引导模型选择，否则保持 false。",
  "plugins.entries.*.subagent.allowedModels":
    'Allowed override targets for trusted plugin subagent runs as canonical "provider/model" refs. Use "*" only when you intentionally allow any model.',
  "plugins.entries.*.apiKey":
    "在条目设置中接受直接密钥配置的插件使用的可选 API 密钥字段。使用密钥/环境变量替换并避免将真实凭证提交到配置文件。",
  "plugins.entries.*.env":
    "仅为该插件运行时上下文注入的每插件环境变量映射。用于将提供商凭证范围限定到一个插件而非共享全局进程环境。",
  "plugins.entries.*.config":
    "由该插件自己的架构和验证规则解释的插件定义配置载荷。仅使用插件文档中的字段以防止被忽略或无效的设置。",
  "plugins.installs":
    "CLI 管理的安装元数据（由 `openclaw plugins update` 用于定位安装源）。",
  "plugins.installs.*.source": 'Install source ("npm", "archive", or "path").',
  "plugins.installs.*.spec": "安装时使用的原始 npm spec（如果源是 npm）。",
  "plugins.installs.*.sourcePath": "安装时使用的原始归档/路径（如有）。",
  "plugins.installs.*.installPath":
    "已解析的安装目录（通常为 ~/.openclaw/extensions/<id>）。",
  "plugins.installs.*.version": "安装时记录的版本（如可用）。",
  "plugins.installs.*.resolvedName": "从获取的工件解析的 npm 包名称。",
  "plugins.installs.*.resolvedVersion":
    "从获取的工件解析的 npm 包版本（对非固定 spec 有用）。",
  "plugins.installs.*.resolvedSpec":
    "从获取的工件解析的精确 npm spec（<name>@<version>）。",
  "plugins.installs.*.integrity":
    "获取工件的已解析 npm dist 完整性哈希（如果 npm 报告）。",
  "plugins.installs.*.shasum":
    "获取工件的已解析 npm dist shasum（如果 npm 报告）。",
  "plugins.installs.*.resolvedAt":
    "此安装记录最后解析 npm 包元数据的 ISO 时间戳。",
  "plugins.installs.*.installedAt": "最后安装/更新的 ISO 时间戳。",
  "plugins.installs.*.marketplaceName":
    "市场支持的插件安装记录的市场显示名称（如可用）。",
  "plugins.installs.*.marketplaceSource":
    "用于解析安装的原始市场源（例如仓库路径或 Git URL）。",
  "plugins.installs.*.marketplacePlugin":
    "源市场内的插件条目名称，用于后续更新。",
  "agents.list.*.identity.avatar":
    "代理头像（工作区相对路径、http(s) URL 或 data URI）。",
  "agents.defaults.model.primary": "主模型（provider/model）。",
  "agents.defaults.model.fallbacks":
    "有序的回退模型（provider/model）。主模型失败时使用。",
  "agents.defaults.imageModel.primary":
    "主模型缺少图片输入时使用的可选图片模型（provider/model）。",
  "agents.defaults.imageModel.fallbacks": "有序的回退图片模型（provider/model）。",
  "agents.defaults.imageGenerationModel.primary":
    "共享图片生成功能使用的可选图片生成模型（provider/model）。",
  "agents.defaults.imageGenerationModel.fallbacks":
    "有序的回退图片生成模型（provider/model）。",
  "agents.defaults.pdfModel.primary":
    "PDF 分析工具的可选 PDF 模型（provider/model）。默认为 imageModel，然后是会话模型。",
  "agents.defaults.pdfModel.fallbacks": "有序的回退 PDF 模型（provider/model）。",
  "agents.defaults.pdfMaxBytesMb":
    "PDF 工具的最大 PDF 文件大小（MB，默认：10）。",
  "agents.defaults.pdfMaxPages":
    "PDF 工具处理的最大 PDF 页数（默认：20）。",
  "agents.defaults.imageMaxDimensionPx":
    "清理记录/工具结果图片载荷时的最大图片边长（像素，默认：1200）。",
  "agents.defaults.cliBackends": "纯文本回退的可选 CLI 后端（claude-cli 等）。",
  "agents.defaults.compaction":
    "上下文接近令牌限制时的压缩调优，包括历史份额、保留头部空间和预压缩记忆刷新行为。当长时间运行的会话需要在紧凑的上下文窗口下保持稳定的连续性时使用。",
  "agents.defaults.compaction.mode":
    'Compaction strategy mode: "default" uses baseline behavior, while "safeguard" applies stricter guardrails to preserve recent context. Keep "default" unless you observe aggressive history loss near limit boundaries.',
  "agents.defaults.compaction.reserveTokens":
    "压缩运行后为回复生成和工具输出保留的令牌头部空间。对详细/工具密集的会话使用更高的保留值，对最大化保留历史更重要时使用较低的保留值。",
  "agents.defaults.compaction.keepRecentTokens":
    "压缩期间从最近对话窗口保留的最小令牌预算。使用较高的值保护即时上下文连续性，较低的值保留更多长尾历史。",
  "agents.defaults.compaction.reserveTokensFloor":
    "Pi 压缩路径中 reserveTokens 的最小下限（0 禁用下限保护）。使用非零下限以避免在波动的令牌估算下过度激进的压缩。",
  "agents.defaults.compaction.maxHistoryShare":
    "压缩后允许保留历史的总上下文预算最大比例（范围 0.1-0.9）。使用较低的份额获得更多生成头部空间，或较高的份额获得更深的历史连续性。",
  "agents.defaults.compaction.identifierPolicy":
    'Identifier-preservation policy for compaction summaries: "strict" prepends built-in opaque-identifier retention guidance (default), "off" disables this prefix, and "custom" uses identifierInstructions. Keep "strict" unless you have a specific compatibility need.',
  "agents.defaults.compaction.identifierInstructions":
    'Custom identifier-preservation instruction text used when identifierPolicy="custom". Keep this explicit and safety-focused so compaction summaries do not rewrite opaque IDs, URLs, hosts, or ports.',
  "agents.defaults.compaction.recentTurnsPreserve":
    "在保护性摘要之外保持原样的最近用户/助手轮次数（默认：3）。提高以保留精确的近期对话上下文，或降低以最大化压缩节省。",
  "agents.defaults.compaction.qualityGuard":
    "保护性压缩摘要的可选质量审计重试设置。除非你明确需要摘要审计和失败检查时的一次性重新生成，否则保持禁用。",
  "agents.defaults.compaction.qualityGuard.enabled":
    "启用保护性压缩的摘要质量审计和重新生成重试。默认：false，因此仅保护模式不会开启重试行为。",
  "agents.defaults.compaction.qualityGuard.maxRetries":
    "保护性摘要质量审计失败后的最大重新生成重试次数。使用较小的值限制额外延迟和令牌成本。",
  "agents.defaults.compaction.postIndexSync":
    'Controls post-compaction session memory reindex mode: "off", "async", or "await" (default: "async"). Use "await" for strongest freshness, "async" for lower compaction latency, and "off" only when session-memory sync is handled elsewhere.',
  "agents.defaults.compaction.postCompactionSections":
    'AGENTS.md H2/H3 section names re-injected after compaction so the agent reruns critical startup guidance. Leave unset to use "Session Startup"/"Red Lines" with legacy fallback to "Every Session"/"Safety"; set to [] to disable reinjection entirely.',
  "agents.defaults.compaction.timeoutSeconds":
    "单次压缩操作中止前允许的最大时间（秒，默认：900）。对需要更多时间摘要的非常大的会话增加此值，或降低以在模型无响应时更快失败。",
  "agents.defaults.compaction.model":
    "仅用于压缩摘要的可选 provider/model 覆盖。当你希望压缩在与会话默认值不同的模型上运行时设置，不设置则继续使用主代理模型。",
  "agents.defaults.compaction.truncateAfterCompaction":
    "启用后，在压缩后重写会话 JSONL 文件以移除已摘要的条目。防止多次压缩循环的长时间运行会话的文件无限增长。默认：false。",
  "agents.defaults.compaction.memoryFlush":
    "在重度压缩前运行代理式记忆写入的预压缩记忆刷新设置。对长会话保持启用，以便在激进裁剪前持久化重要上下文。",
  "agents.defaults.compaction.memoryFlush.enabled":
    "在运行时执行接近令牌限制的更强历史缩减前启用预压缩记忆刷新。保持启用，除非你有意在受限环境中禁用记忆副作用。",
  "agents.defaults.compaction.memoryFlush.softThresholdTokens":
    "触发预压缩记忆刷新执行的到压缩的阈值距离（令牌）。使用更早的阈值获得更安全的持久化，或更紧的阈值降低刷新频率。",
  "agents.defaults.compaction.memoryFlush.forceFlushTranscriptBytes":
    'Forces pre-compaction memory flush when transcript file size reaches this threshold (bytes or strings like "2mb"). Use this to prevent long-session hangs even when token counters are stale; set to 0 to disable.',
  "agents.defaults.compaction.memoryFlush.prompt":
    "生成记忆候选时用于预压缩记忆刷新轮次的用户提示模板。仅在需要超出默认记忆刷新行为的自定义提取指令时使用。",
  "agents.defaults.compaction.memoryFlush.systemPrompt":
    "预压缩记忆刷新轮次的系统提示覆盖，用于控制提取风格和安全约束。谨慎使用，以免自定义指令降低记忆质量或泄露敏感上下文。",
  "agents.defaults.embeddedPi":
    "嵌入式 Pi 运行器强化控制，控制工作区本地 Pi 设置在 OpenClaw 会话中的信任和应用方式。",
  "agents.defaults.embeddedPi.projectSettingsPolicy":
    'How embedded Pi handles workspace-local `.pi/config/settings.json`: "sanitize" (default) strips shellPath/shellCommandPrefix, "ignore" disables project settings entirely, and "trusted" applies project settings as-is.',
  "agents.defaults.humanDelay.mode": 'Delay style for block replies ("off", "natural", "custom").',
  "agents.defaults.humanDelay.minMs": "自定义 humanDelay 的最小延迟（毫秒，默认：800）。",
  "agents.defaults.humanDelay.maxMs": "自定义 humanDelay 的最大延迟（毫秒，默认：2500）。",
  commands:
    "命令配置。",
  "commands.native":
    "向支持命令注册的渠道（Discord、Slack、Telegram）注册原生斜杠/菜单命令。保持启用以提高可发现性，除非你有意运行纯文本命令工作流。",
  "commands.nativeSkills":
    "注册原生技能命令以使用户可以直接从支持的提供商命令菜单调用技能。保持与技能策略对齐以使暴露的命令与操作员期望匹配。",
  "commands.text":
    "除可用的原生命令界面外，启用聊天输入中的文本命令解析。保持启用以兼容不支持原生命令注册的渠道。",
  "commands.bash":
    "允许 bash 聊天命令（`!`；`/bash` 别名）运行主机 shell 命令（默认：false；需要 tools.elevated）。",
  "commands.bashForegroundMs":
    "bash 后台化前等待多长时间（默认：2000；0 立即后台化）。",
  "commands.config": "允许 /config 聊天命令在磁盘上读写配置（默认：false）。",
  "commands.mcp":
    "允许 /mcp 聊天命令管理 mcp.servers 下的 OpenClaw MCP 服务器配置（默认：false）。",
  "commands.plugins":
    "允许 /plugins 聊天命令列出已发现的插件并在配置中切换插件启用状态（默认：false）。",
  "commands.debug": "允许 /debug 聊天命令进行仅运行时覆盖（默认：false）。",
  "commands.restart": "允许 /restart 和网关重启工具操作（默认：true）。",
  "commands.useAccessGroups": "强制执行命令的访问组白名单/策略。",
  "commands.ownerAllowFrom":
    "仅所有者工具/命令的显式所有者白名单。使用渠道原生 ID（可选前缀如 \"whatsapp:+15551234567\"）。'*' 会被忽略。",
  "commands.ownerDisplay":
    "所有者 ID 显示方式。",
  "commands.ownerDisplaySecret":
    "当 ownerDisplay=hash 时用于 HMAC 哈希所有者 ID 的可选密钥。建议使用环境变量替换。",
  "commands.allowFrom":
    "按渠道和发送者为所有者级别命令界面定义提升命令允许规则。使用窄范围的特定于提供商的身份以使特权命令不暴露给广泛的聊天受众。",
  mcp: "Global MCP server definitions managed by OpenClaw. Embedded Pi and other runtime adapters can consume these servers without storing them inside Pi-owned project settings.",
  "mcp.servers":
    "命名的 MCP 服务器定义。OpenClaw 将其存储在自己的配置中，运行时适配器决定在执行时支持哪些传输。",
  session:
    "会话管理配置，控制超时、标签和生命周期。",
  "session.scope":
    'Sets base session grouping strategy: "per-sender" isolates by sender and "global" shares one session per channel context. Keep "per-sender" for safer multi-user behavior unless deliberate shared context is required.',
  "session.dmScope":
    'DM session scoping: "main" keeps continuity, while "per-peer", "per-channel-peer", and "per-account-channel-peer" increase isolation. Use isolated modes for shared inboxes or multi-account deployments.',
  "session.identityLinks":
    "将规范身份映射到提供商前缀的对等 ID 以使等效用户解析到一个私信线程（示例：telegram:123456）。当同一人出现在多个渠道或账户时使用。",
  "session.resetTriggers":
    "列出在入站内容中匹配时强制会话重置的消息触发器。谨慎使用显式重置短语以使上下文不在正常会话中意外丢失。",
  "session.idleMinutes":
    "应用旧版空闲重置窗口（分钟）用于跨不活跃间隙的会话重用行为。仅用于兼容性，建议使用 session.reset/session.resetByType 下的结构化重置策略。",
  "session.reset":
    "定义无类型特定或渠道特定覆盖适用时使用的默认重置策略对象。先设置此项，然后仅在行为必须不同时分层 resetByType 或 resetByChannel。",
  "session.reset.mode":
    'Selects reset strategy: "daily" resets at a configured hour and "idle" resets after inactivity windows. Keep one clear mode per policy to avoid surprising context turnover patterns.',
  "session.reset.atHour":
    "设置每日重置模式的本地小时边界（0-23）以使会话在可预测的时间翻转。与 mode=daily 一起使用并与操作员时区期望对齐以获得人类可读的行为。",
  "session.reset.idleMinutes":
    "设置空闲模式重置前的不活跃窗口，也可作为每日模式的辅助保护。使用较大值保持连续性或较小值获得更新鲜的短期线程。",
  "session.resetByType":
    "当默认值不足时按聊天类型（direct、group、thread）覆盖重置行为。当群组/线程流量需要与私信不同的重置节奏时使用。",
  "session.resetByType.direct":
    "定义私聊的重置策略并取代该类型的基础 session.reset 配置。使用此项作为规范的私信覆盖而非旧版 dm 别名。",
  "session.resetByType.dm":
    "为向后兼容旧配置保留的私信重置行为的已弃用别名。使用 session.resetByType.direct 以使未来的工具和验证保持一致。",
  "session.resetByType.group":
    "定义群组聊天会话的重置策略，其中连续性和噪声模式与私信不同。如果上下文漂移成为问题则使用较短的空闲窗口。",
  "session.resetByType.thread":
    "定义线程范围会话的重置策略，包括聚焦频道线程工作流。当线程会话应比其他聊天类型更快或更慢过期时使用。",
  "session.resetByChannel":
    "提供按提供商/渠道 ID 索引的渠道特定重置覆盖以进行细粒度行为控制。仅在一个渠道需要超出类型级策略的例外重置行为时使用。",
  "session.store":
    "设置用于跨重启持久化会话记录的会话存储文件路径。仅在需要自定义磁盘布局、备份路由或挂载卷存储时使用显式路径。",
  "session.typingIntervalSeconds":
    "控制在支持打字状态的渠道中准备回复时重复打字指示器的间隔。增加以减少频繁更新或减少以获得更活跃的打字反馈。",
  "session.typingMode":
    'Controls typing behavior timing: "never", "instant", "thinking", or "message" based emission points. Keep conservative modes in high-volume channels to avoid unnecessary typing noise.',
  "session.parentForkMaxTokens":
    "线程/会话继承 fork 允许的最大父会话令牌数。如果父级超过此值，OpenClaw 启动新鲜的线程会话而非 fork；设为 0 禁用此保护。",
  "session.mainKey":
    'Overrides the canonical main session key used for continuity when dmScope or routing logic points to "main". Use a stable value only if you intentionally need custom session anchoring.',
  "session.sendPolicy":
    "使用针对渠道、chatType 和键前缀评估的允许/拒绝规则控制跨会话发送权限。用于在复杂环境中围栏会话工具可以投递消息的位置。",
  "session.sendPolicy.default":
    'Sets fallback action when no sendPolicy rule matches: "allow" or "deny". Keep "allow" for simpler setups, or choose "deny" when you require explicit allow rules for every destination.',
  "session.sendPolicy.rules":
    'Ordered allow/deny rules evaluated before the default action, for example `{ action: "deny", match: { channel: "discord" } }`. Put most specific rules first so broad rules do not shadow exceptions.',
  "session.sendPolicy.rules[].action":
    'Defines rule decision as "allow" or "deny" when the corresponding match criteria are satisfied. Use deny-first ordering when enforcing strict boundaries with explicit allow exceptions.',
  "session.sendPolicy.rules[].match":
    "定义可组合渠道、chatType 和键前缀约束的可选规则匹配条件。保持匹配窄以使策略意图保持可读且调试保持直接。",
  "session.sendPolicy.rules[].match.channel":
    "将规则应用匹配到特定渠道/提供商 ID（例如 discord、telegram、slack）。当一个渠道应独立于其他渠道允许或拒绝投递时使用。",
  "session.sendPolicy.rules[].match.chatType":
    "将规则应用匹配到聊天类型（direct、group、thread）以使行为按会话形式变化。当私信和群组目标需要不同的安全边界时使用。",
  "session.sendPolicy.rules[].match.keyPrefix":
    "在策略消费者中内部键标准化步骤后匹配标准化的会话键前缀。用于一般前缀控制，当需要精确全键匹配时优先使用 rawKeyPrefix。",
  "session.sendPolicy.rules[].match.rawKeyPrefix":
    "匹配原始未标准化的会话键前缀以进行精确全键策略定位。当标准化 keyPrefix 太广泛且你需要代理前缀或传输特定精度时使用。",
  "session.agentToAgent":
    "代理间会话交换控制分组，包括回复链的循环预防限制。除非你运行具有严格轮次上限的高级代理间自动化，否则保持默认值。",
  "session.agentToAgent.maxPingPongTurns":
    "代理间交换期间请求者和目标代理之间的最大回复轮次（0-5）。使用较低值硬性限制聊天循环并保持可预测的运行完成。",
  "session.threadBindings":
    "跨支持线程聚焦工作流的提供商的线程绑定会话路由行为共享默认值。在此配置全局默认值，仅在行为不同时按渠道覆盖。",
  "session.threadBindings.enabled":
    "线程绑定会话路由功能和聚焦线程投递行为的全局主开关。对现代线程工作流保持启用，除非你需要全局禁用线程绑定。",
  "session.threadBindings.idleHours":
    "跨提供商/渠道的线程绑定会话的默认不活跃窗口（小时，0 禁用空闲自动解绑）。默认：24。",
  "session.threadBindings.maxAgeHours":
    "跨提供商/渠道的线程绑定会话的可选硬性最大时长（小时，0 禁用硬性上限）。默认：0。",
  "session.maintenance":
    "修剪时长、条目上限和文件轮转行为的自动会话存储维护控制。以 warn 模式开始观察影响，然后在阈值调优后强制执行。",
  "session.maintenance.mode":
    'Determines whether maintenance policies are only reported ("warn") or actively applied ("enforce"). Keep "warn" during rollout and switch to "enforce" after validating safe thresholds.',
  "session.maintenance.pruneAfter":
    "维护期间移除超过此持续时间的条目（例如 `30d` 或 `12h`）。使用此项作为主要的时长保留控制并与数据保留策略对齐。",
  "session.maintenance.pruneDays":
    "为兼容使用天数的旧配置保留的已弃用时长保留字段。使用 session.maintenance.pruneAfter 以使持续时间语法和行为一致。",
  "session.maintenance.maxEntries":
    "限制存储中保留的总会话条目数以防止随时间无限增长。在受限环境中使用较低限制，或在需要更长历史时使用较高限制。",
  "session.maintenance.rotateBytes":
    "当文件大小超过阈值（如 `10mb` 或 `1gb`）时轮转会话存储。用于限制单文件增长并保持备份/恢复操作可管理。",
  "session.maintenance.resetArchiveRetention":
    "重置记录归档（`*.reset.<timestamp>`）的保留期。接受持续时间（例如 `30d`），或 `false` 禁用清理。默认为 pruneAfter 以使重置工件不会永远增长。",
  "session.maintenance.maxDiskBytes":
    "可选的每代理会话目录磁盘预算（例如 `500mb`）。用于限制每个代理的会话存储；超过时 warn 模式报告压力，enforce 模式执行最旧优先清理。",
  "session.maintenance.highWaterBytes":
    "磁盘预算清理后的目标大小（高水位线）。默认为 maxDiskBytes 的 80%；在受限磁盘上显式设置以获得更紧的回收行为。",
  cron: "定时任务配置。",
  "cron.enabled":
    "启用定时任务功能。",
  "cron.store":
    "用于跨重启持久化定时任务的定时任务存储文件路径。仅在需要自定义存储布局、备份或挂载卷时设置显式路径。",
  "cron.maxConcurrentRuns":
    "多个计划同时触发时允许并发执行的最大定时任务数。使用较低值保护重自动化负载下的 CPU/内存，或谨慎提高以获得更高吞吐量。",
  "cron.retry":
    "一次性任务因临时错误（速率限制、过载、网络、服务器错误）失败时覆盖默认重试策略。省略以使用默认值：maxAttempts 3，backoffMs [30000, 60000, 300000]，重试所有临时类型。",
  "cron.retry.maxAttempts":
    "一次性任务在临时错误后永久禁用前的最大重试次数（默认：3）。",
  "cron.retry.backoffMs":
    "每次重试尝试的退避延迟（毫秒，默认：[30000, 60000, 300000]）。使用较短值加快重试。",
  "cron.retry.retryOn":
    "要重试的错误类型：rate_limit、overloaded、network、timeout、server_error。用于限制触发重试的错误；省略以重试所有临时类型。",
  "cron.webhook":
    'Deprecated legacy fallback webhook URL used only for old jobs with `notify=true`. Migrate to per-job delivery using `delivery.mode="webhook"` plus `delivery.to`, and avoid relying on this global field.',
  "cron.webhookToken":
    "使用 Webhook 模式时附加到定时任务 Webhook POST 投递的 Bearer 令牌。优先使用密钥/环境变量替换，并在共享 Webhook 端点可从互联网访问时定期轮换此令牌。",
  "cron.sessionRetention":
    "控制已完成的定时运行会话在清理前保留多长时间（`24h`、`7d`、`1h30m`，或 `false` 禁用清理；默认：`24h`）。对高频计划使用较短保留期以减少存储增长。",
  "cron.runLog":
    "`cron/runs/<jobId>.jsonl` 下每任务定时运行历史文件的清理控制，包括大小和行保留。",
  "cron.runLog.maxBytes":
    "清理重写到最后 keepLines 条目前的每个定时运行日志文件最大字节数（例如 `2mb`，默认 `2000000`）。",
  "cron.runLog.keepLines":
    "文件超过 maxBytes 时保留的尾部运行日志行数（默认 `2000`）。增加以获取更长的取证历史或降低以适应较小磁盘。",
  hooks:
    "钩子配置，在消息处理不同阶段注入自定义行为。",
  "hooks.enabled":
    "启用钩子功能。",
  "hooks.path":
    "网关控制服务器上 hooks 端点使用的 HTTP 路径（例如 `/hooks`）。使用不可猜测的路径并结合令牌验证以实现纵深防御。",
  "hooks.token":
    "hooks 入口在映射运行前检查的共享 Bearer 令牌用于请求认证。将持有者视为 hook 入口界面的完全信任调用者，而非单独的非所有者角色。使用环境变量替换，当 webhook 端点可从互联网访问时定期轮换。",
  "hooks.defaultSessionKey":
    "当请求未通过允许的渠道提供会话键时，hook 投递使用的回退会话键。使用稳定但有范围的键以避免混合不相关的自动化会话。",
  "hooks.allowRequestSessionKey":
    "为 true 时允许调用者在 hook 请求中提供会话键，启用调用者控制的路由。除非受信任的集成者明确需要自定义会话线程，否则保持 false。",
  "hooks.allowedSessionKeyPrefixes":
    "启用调用者提供的键时，入站 hook 请求接受的会话键前缀白名单。使用窄前缀防止任意会话键注入。",
  "hooks.allowedAgentIds":
    "选择执行代理时 hook 映射允许目标的代理 ID 白名单。用于将自动化事件约束到专用服务代理，减少 hook 令牌泄露时的影响范围。",
  "hooks.maxBodyBytes":
    "请求被拒绝前接受的最大 webhook 有效载荷大小（字节）。保持有界以减少滥用风险并保护突发集成下的内存使用。",
  "hooks.presets":
    "加载时应用的命名 hook 预设包，用于种子标准映射和行为默认值。保持预设使用明确以便操作员可以审计哪些自动化处于活跃状态。",
  "hooks.transformsDir":
    "映射 transform.module 路径引用的 hook 转换模块的基础目录。使用受控的仓库目录以使动态导入保持可审查和可预测。",
  "hooks.mappings":
    "匹配入站 hook 请求并选择唤醒或代理操作（带可选投递路由）的有序映射规则。首先使用特定映射以避免广泛模式规则捕获所有内容。",
  "hooks.mappings[].id":
    "hook 映射条目的可选稳定标识符，用于审计、故障排除和定向更新。使用唯一 ID 以便日志和配置差异可以明确引用映射。",
  "hooks.mappings[].match":
    "映射匹配谓词的分组对象，如操作路由应用前的路径和源。保持匹配条件具体以使不相关的 webhook 流量不触发自动化。",
  "hooks.mappings[].match.path":
    "hook 映射的路径匹配条件，通常与入站请求路径比较。用于按 webhook 端点路径族分割自动化行为。",
  "hooks.mappings[].match.source":
    "hook 映射的源匹配条件，通常由受信任的上游元数据或适配器逻辑设置。使用稳定的源标识符以使路由在重试间保持确定性。",
  "hooks.mappings[].action":
    'Mapping action type: "wake" triggers agent wake flow, while "agent" sends directly to agent handling. Use "agent" for immediate execution and "wake" when heartbeat-driven processing is preferred.',
  "hooks.mappings[].wakeMode":
    'Wake scheduling mode: "now" wakes immediately, while "next-heartbeat" defers until the next heartbeat cycle. Use deferred mode for lower-priority automations that can tolerate slight delay.',
  "hooks.mappings[].name":
    "诊断和面向操作员的配置 UI 中使用的人类可读映射显示名称。保持名称简洁且描述性以使路由意图在事件审查期间显而易见。",
  "hooks.mappings[].agentId":
    "操作路由不应使用默认值时映射执行的目标代理 ID。使用专用自动化代理将 webhook 行为与交互式操作员会话隔离。",
  "hooks.mappings[].sessionKey":
    "映射投递消息的显式会话键覆盖以控制线程连续性。使用稳定的有范围键以使重复事件关联而不泄露到不相关的会话。",
  "hooks.mappings[].messageTemplate":
    "将结构化映射输入合成为发送到目标操作路径的最终消息内容的模板。保持模板确定性以使下游解析和行为保持稳定。",
  "hooks.mappings[].textTemplate":
    "不需要或不支持富有效载荷渲染时使用的纯文本回退模板。用于为聊天投递界面提供简洁、一致的摘要字符串。",
  "hooks.mappings[].deliver":
    "控制映射执行结果是否投递回渠道目标还是静默处理。对不应发布面向用户输出的后台自动化禁用投递。",
  "hooks.mappings[].allowUnsafeExternalContent":
    "为 true 时，映射内容可能在生成的消息中包含较少清理的外部有效载荷数据。默认保持 false，仅对经过审查的转换逻辑的受信任源启用。",
  "hooks.mappings[].channel":
    'Delivery channel override for mapping outputs (for example "last", "telegram", "discord", "slack", "signal", "imessage", or "msteams"). Keep channel overrides explicit to avoid accidental cross-channel sends.',
  "hooks.mappings[].to":
    "映射回复应路由到固定目标时所选渠道内的目标标识符。启用生产映射前验证特定于提供商的目标格式。",
  "hooks.mappings[].model":
    "自动化应使用与代理默认值不同的模型时映射触发运行的可选模型覆盖。谨慎使用以使行为在映射执行间保持可预测。",
  "hooks.mappings[].thinking":
    "映射触发运行的可选思考力度覆盖以调整延迟与推理深度。对高流量 hooks 保持低或最小，除非明确需要更深的推理。",
  "hooks.mappings[].timeoutSeconds":
    "超时处理应用前映射操作执行允许的最大运行时间。对高流量 webhook 源使用更紧的限制以防止队列堆积。",
  "hooks.mappings[].transform":
    "映射操作处理前定义模块/导出预处理的转换配置块。仅从经过审查的代码路径使用转换并保持行为确定性以实现可重复的自动化。",
  "hooks.mappings[].transform.module":
    "从 hooks.transformsDir 加载的相对转换模块路径，用于在投递前重写入站有效载荷。保持模块本地、经过审查且无路径遍历模式。",
  "hooks.mappings[].transform.export":
    "从转换模块调用的命名导出；省略时默认为模块默认导出。当一个文件承载多个转换处理器时设置。",
  "hooks.gmail":
    "Gmail 推送集成设置，用于 Pub/Sub 通知和可选的本地回调服务。尽可能将此限制在专用 Gmail 自动化账户。",
  "hooks.gmail.account":
    "此 hook 集成中用于 Gmail watch/订阅操作的 Google 账户标识符。使用专用自动化邮箱账户以隔离操作权限。",
  "hooks.gmail.label":
    "限制触发 hook 事件的带标签消息的可选 Gmail 标签过滤器。保持过滤器窄以避免用不相关的收件箱流量淹没自动化。",
  "hooks.gmail.topic":
    "Gmail watch 用于为此账户发布变更通知的 Google Pub/Sub 主题名称。启用 watch 前确保主题 IAM 授予 Gmail 发布访问权限。",
  "hooks.gmail.subscription":
    "网关消费的用于从已配置主题接收 Gmail 变更通知的 Pub/Sub 订阅。保持订阅所有权清晰以使多个消费者不会意外竞争。",
  "hooks.gmail.hookUrl":
    "Gmail 或中介调用以将通知投递到此 hook 管道的公共回调 URL。使用令牌验证和受限的网络暴露保护此 URL。",
  "hooks.gmail.includeBody":
    "为 true 时，获取并包含电子邮件正文内容用于下游映射/代理处理。除非需要正文文本否则保持 false，因为这会增加有效载荷大小和敏感性。",
  "hooks.gmail.allowUnsafeExternalContent":
    "启用时允许较少清理的外部 Gmail 内容进入处理。保持禁用以获得更安全的默认值，仅对经过控制转换的受信任邮件流启用。",
  "hooks.gmail.serve":
    "直接接收 Gmail 通知而不需要单独入口层的本地回调服务器设置块。仅在此进程应自身终止 webhook 流量时启用。",
  "hooks.gmail.pushToken":
    "处理通知前 Gmail 推送 hook 回调所需的共享密钥令牌。使用环境变量替换，如果回调端点对外暴露则轮换。",
  "hooks.gmail.maxBytes":
    "启用 includeBody 时每个事件处理的最大 Gmail 有效载荷字节数。保持保守限制以减少超大消息处理成本和风险。",
  "hooks.gmail.renewEveryMinutes":
    "Gmail watch 订阅的续订间隔（分钟）以防止过期。设置低于提供商过期窗口并在日志中监控续订失败。",
  "hooks.gmail.serve.bind":
    "直接服务 hooks 时本地 Gmail 回调 HTTP 服务器的绑定地址。除非有意需要外部入口，否则保持仅环回。",
  "hooks.gmail.serve.port":
    "启用服务模式时本地 Gmail 回调 HTTP 服务器的端口。使用专用端口避免与网关/控制接口冲突。",
  "hooks.gmail.serve.path":
    "本地 Gmail 回调服务器上接受推送通知的 HTTP 路径。保持与订阅配置一致以避免丢弃事件。",
  "hooks.gmail.tailscale.mode":
    'Tailscale exposure mode for Gmail callbacks: "off", "serve", or "funnel". Use "serve" for private tailnet delivery and "funnel" only when public internet ingress is required.',
  "hooks.gmail.tailscale":
    "通过 Serve/Funnel 路由发布 Gmail 回调的 Tailscale 暴露配置块。在启用任何公共入口路径前使用私有 tailnet 模式。",
  "hooks.gmail.tailscale.path":
    "启用时 Tailscale Serve/Funnel 为 Gmail 回调转发发布的路径。保持与 Gmail webhook 配置对齐以使请求到达预期的处理器。",
  "hooks.gmail.tailscale.target":
    "Tailscale Serve/Funnel 转发的本地服务目标（例如 http://127.0.0.1:8787）。使用显式环回目标避免模糊路由。",
  "hooks.gmail.model":
    "邮箱自动化应使用专用模型行为时 Gmail 触发运行的可选模型覆盖。保持不设置以继承代理默认值，除非邮箱任务需要专门化。",
  "hooks.gmail.thinking":
    'Thinking effort override for Gmail-driven agent runs: "off", "minimal", "low", "medium", or "high". Keep modest defaults for routine inbox automations to control cost and latency.',
  "hooks.internal":
    "从模块路径加载的内置/自定义事件处理器的内部 hook 运行时设置。用于受信任的进程内自动化并保持处理器加载严格限定范围。",
  "hooks.internal.enabled":
    "启用内部 hook 处理器和内部 hook 运行时中已配置条目的处理。除非有意配置内部 hook 处理器，否则保持禁用。",
  "hooks.internal.handlers":
    "将事件名称映射到模块和可选导出的内部事件处理器列表。保持处理器定义明确以使事件到代码的路由可审计。",
  "hooks.internal.handlers[].event":
    "运行时发出时触发此处理器模块的内部事件名称。使用稳定的事件命名约定以避免处理器间的意外重叠。",
  "hooks.internal.handlers[].module":
    "运行时加载的内部 hook 处理器实现的安全相对模块路径。将模块文件保存在经过审查的目录中并避免动态路径组合。",
  "hooks.internal.handlers[].export":
    "不使用模块默认导出时内部 hook 处理器函数的可选命名导出。当一个模块提供多个处理器入口点时设置。",
  "hooks.internal.entries":
    "用于注册具体运行时处理器和元数据的已配置内部 hook 条目记录。保持条目明确和版本化以使生产行为可审计。",
  "hooks.internal.load":
    "控制处理器模块在启动时从何处发现的内部 hook 加载器设置。使用受约束的加载根以减少意外的模块冲突或遮蔽。",
  "hooks.internal.load.extraDirs":
    "在默认加载路径之外搜索内部 hook 模块的额外目录。保持最小化和受控以减少意外的模块遮蔽。",
  "hooks.internal.installs":
    "内部 hook 模块的安装元数据，包括可重复部署的源和已解析的工件。将此用作运营来源并避免手动漂移编辑。",
  messages:
    "消息处理配置。",
  "messages.messagePrefix":
    "在交给代理运行时之前预置到入站用户消息的前缀文本。谨慎使用作为渠道上下文标记并保持跨会话稳定。",
  "messages.responsePrefix":
    "发送到渠道之前预置到出站助手回复的前缀文本。用于轻量级品牌/上下文标签并避免减少内容密度的长前缀。",
  "messages.groupChat":
    "群聊规则配置。",
  "messages.groupChat.mentionPatterns":
    "用于检测群组聊天中显式提及/触发短语的安全不区分大小写正则模式。使用精确模式减少高流量渠道中的误报；无效或不安全的嵌套重复模式会被忽略。",
  "messages.groupChat.historyLimit":
    "群组会话中每轮加载的最大先前群组消息数作为上下文。使用较高值获得更丰富的连续性，或较低值获得更快更便宜的响应。",
  "messages.queue":
    "用于在处理轮次前缓冲突发的入站消息队列策略。为顺序处理或批处理行为重要的繁忙渠道调优。",
  "messages.queue.mode":
    'Queue behavior mode: "steer", "followup", "collect", "steer-backlog", "steer+backlog", "queue", or "interrupt". Keep conservative modes unless you intentionally need aggressive interruption/backlog semantics.',
  "messages.queue.byChannel":
    "按提供商 ID 索引的每渠道队列模式覆盖（例如 telegram、discord、slack）。当一个渠道的流量模式需要与全局默认值不同的队列行为时使用。",
  "messages.queue.debounceMs":
    "处理缓冲的入站消息前的全局队列去抖窗口（毫秒）。使用较高值合并快速突发，或较低值减少响应延迟。",
  "messages.queue.debounceMsByChannel":
    "按提供商 ID 索引的每渠道队列行为去抖覆盖。用于独立调整具有不同节奏的聊天界面的突发处理。",
  "messages.queue.cap":
    "丢弃策略应用前保留的最大排队入站项数。在嘈杂渠道中保持上限有界以使内存使用保持可预测。",
  "messages.queue.drop":
    'Drop strategy when queue cap is exceeded: "old", "new", or "summarize". Use summarize when preserving intent matters, or old/new when deterministic dropping is preferred.',
  "messages.inbound":
    "队列/轮次处理开始前使用的直接入站去抖设置。为来自同一发送者的特定于提供商的快速消息突发配置。",
  "messages.inbound.byChannel":
    "按提供商 ID 索引的每渠道入站去抖覆盖（毫秒）。当某些提供商比其他提供商更积极地发送消息片段时使用。",
  "messages.removeAckAfterReply":
    "启用时在最终回复投递后移除确认回应。在持久确认回应造成杂乱的渠道中保持启用以获得更清洁的 UX。",
  "messages.tts":
    "消息文字转语音设置。",
  channels:
    "消息渠道配置，包括 Discord、Telegram、Slack 等。",
  "channels.telegram":
    "Telegram 渠道提供商配置，包括认证令牌、重试行为和消息渲染控制。使用此部分为 Telegram 特定 API 语义调整机器人行为。",
  "channels.slack":
    "Slack 渠道提供商配置，用于机器人/应用令牌、流式行为和私信策略控制。保持令牌处理和线程行为明确以避免嘈杂的工作区交互。",
  "channels.discord":
    "Discord 渠道提供商配置，用于机器人认证、重试策略、流式传输、线程绑定和可选的语音功能。除非需要，否则保持特权意图和高级功能禁用。",
  "channels.whatsapp":
    "WhatsApp 渠道提供商配置，用于访问策略和消息批处理行为。使用此部分调整 WhatsApp 聊天的响应速度和私信路由安全。",
  "channels.signal":
    "Signal 渠道提供商配置，包括账户身份和私信策略行为。保持账户映射明确以在多设备设置中保持路由稳定。",
  "channels.imessage":
    "iMessage 渠道提供商配置，用于 CLI 集成和私信访问策略处理。当运行时环境有非标准二进制位置时使用显式 CLI 路径。",
  "channels.bluebubbles":
    "BlueBubbles 渠道提供商配置，用于 Apple 消息桥接集成。在共享部署中保持私信策略与你的可信发送者模型对齐。",
  "channels.msteams":
    "Microsoft Teams 渠道提供商配置和特定于提供商的策略开关。使用此部分将 Teams 行为与其他企业聊天提供商隔离。",
  "channels.mattermost":
    "Mattermost 渠道提供商配置，用于机器人凭证、基础 URL 和消息触发模式。在高流量团队频道中保持提及/触发规则严格。",
  "channels.irc":
    "IRC 渠道提供商配置和经典 IRC 传输工作流的兼容性设置。当将旧式聊天基础设施桥接到 OpenClaw 时使用此部分。",
  "channels.defaults":
    "未设置特定于提供商的设置时应用于所有提供商的默认渠道行为。在按提供商调优前使用此项强制执行一致的基准策略。",
  "channels.defaults.groupPolicy":
    'Default group policy across channels: "open", "disabled", or "allowlist". Keep "allowlist" for safer production setups unless broad group participation is intentional.',
  "channels.defaults.heartbeat":
    "提供商/渠道发出的状态消息的默认心跳可见性设置。全局调整以减少嘈杂的健康状态更新同时保持警报可见。",
  "channels.defaults.heartbeat.showOk":
    "为 true 时在渠道状态输出中显示健康/正常心跳状态条目。在嘈杂环境中保持 false，仅在操作员需要明确的健康确认时启用。",
  "channels.defaults.heartbeat.showAlerts":
    "为 true 时显示降级/错误心跳警报，以便操作员渠道及时发现问题。在生产中保持启用以使损坏的渠道状态可见。",
  "channels.defaults.heartbeat.useIndicator":
    "启用简洁的指示器风格心跳渲染而非冗长的状态文本（在支持的地方）。对有许多活跃渠道的密集仪表盘使用指示器模式。",
  "agents.defaults.heartbeat.directPolicy":
    'Controls whether heartbeat delivery may target direct/DM chats: "allow" (default) permits DM delivery and "block" suppresses direct-target sends.',
  "agents.list.*.heartbeat.directPolicy":
    'Per-agent override for heartbeat direct/DM delivery policy; use "block" for agents that should only send heartbeat alerts to non-DM destinations.',
  "channels.telegram.configWrites":
    "允许 Telegram 响应渠道事件/命令时写入配置（默认：true）。",
  "channels.telegram.botToken":
    "用于认证此账户/提供商配置的 Bot API 请求的 Telegram 机器人令牌。使用密钥/环境变量替换，如疑似泄露则轮换令牌。",
  "channels.telegram.capabilities.inlineButtons":
    "为支持的命令和交互界面启用 Telegram 内联按钮组件。如果你的部署需要纯文本兼容行为则禁用。",
  "channels.telegram.execApprovals":
    "Telegram 原生执行审批路由和审批者授权。仅当 Telegram 应作为所选机器人账户的显式执行审批客户端时启用。",
  "channels.telegram.execApprovals.enabled":
    "为此账户启用 Telegram 执行审批。为 false 或未设置时，Telegram 消息/按钮无法批准执行请求。",
  "channels.telegram.execApprovals.approvers":
    "允许为此机器人账户批准执行请求的 Telegram 用户 ID。使用数字 Telegram 用户 ID；当目标包含 dm 时提示仅发送给这些审批者。",
  "channels.telegram.execApprovals.agentFilter":
    'Optional allowlist of agent IDs eligible for Telegram exec approvals, for example `["main", "ops-agent"]`. Use this to keep approval prompts scoped to the agents you actually operate from Telegram.',
  "channels.telegram.execApprovals.sessionFilter":
    "在使用 Telegram 审批路由前匹配的可选会话键过滤器（子字符串或正则模式）。使用窄模式使 Telegram 审批仅出现在预期会话中。",
  "channels.telegram.execApprovals.target":
    'Controls where Telegram approval prompts are sent: "dm" sends to approver DMs (default), "channel" sends to the originating Telegram chat/topic, and "both" sends to both. Channel delivery exposes the command text to the chat, so only use it in trusted groups/topics.',
  "channels.slack.configWrites":
    "允许 Slack 响应渠道事件/命令时写入配置（默认：true）。",
  "channels.slack.botToken":
    "用于已配置工作区中标准聊天操作的 Slack 机器人令牌。保持此凭证范围受限，如工作区应用权限更改则轮换。",
  "channels.slack.appToken":
    "启用时用于 Socket Mode 连接和事件传输的 Slack 应用级令牌。使用最小权限应用范围并将此令牌存储为密钥。",
  "channels.slack.userToken":
    "用于需要超出机器人权限的用户上下文 API 访问的可选 Slack 用户令牌。谨慎使用并审计范围，因为此令牌可能具有更广泛的权限。",
  "channels.slack.userTokenReadOnly":
    "为 true 时，在可能的情况下将配置的 Slack 用户令牌使用视为只读辅助行为。如果你只需要补充读取而不需要用户上下文写入则保持启用。",
  "channels.slack.capabilities.interactiveReplies":
    "启用代理编写的 Slack 交互式回复指令（`[[slack_buttons: ...]]`、`[[slack_select: ...]]`）。默认：关闭。",
  "channels.mattermost.configWrites":
    "允许 Mattermost 响应渠道事件/命令时写入配置（默认：true）。",
  "channels.discord.configWrites":
    "允许 Discord 响应渠道事件/命令时写入配置（默认：true）。",
  "channels.discord.token":
    "用于此提供商账户的网关和 REST API 认证的 Discord 机器人令牌。将此密钥置于已提交配置之外，泄露后立即轮换。",
  "channels.discord.allowBots":
    'Allow bot-authored messages to trigger Discord replies (default: false). Set "mentions" to only accept bot messages that mention the bot.',
  "channels.discord.proxy":
    "Discord 网关 + API 请求的代理 URL（app-id 查找和白名单解析）。通过 channels.discord.accounts.<id>.proxy 按账户设置。",
  "channels.whatsapp.configWrites":
    "允许 WhatsApp 响应渠道事件/命令时写入配置（默认：true）。",
  "channels.signal.configWrites":
    "允许 Signal 响应渠道事件/命令时写入配置（默认：true）。",
  "channels.signal.account":
    "用于将此渠道配置绑定到特定 Signal 身份的 Signal 账户标识符（电话/号码句柄）。保持与你的已链接设备/会话状态对齐。",
  "channels.imessage.configWrites":
    "允许 iMessage 响应渠道事件/命令时写入配置（默认：true）。",
  "channels.imessage.cliPath":
    "用于发送/接收操作的 iMessage 桥接 CLI 二进制文件的文件系统路径。当二进制文件不在服务运行时环境的 PATH 中时显式设置。",
  "channels.msteams.configWrites":
    "允许 Microsoft Teams 响应渠道事件/命令时写入配置（默认：true）。",
  "channels.modelByChannel":
    "按 提供商 -> 渠道 ID -> 模型覆盖 的映射（值为 provider/model 或别名）。",
  ...IRC_FIELD_HELP,
  "channels.discord.commands.native": 'Override native commands for Discord (bool or "auto").',
  "channels.discord.commands.nativeSkills":
    'Override native skill commands for Discord (bool or "auto").',
  "channels.telegram.commands.native": 'Override native commands for Telegram (bool or "auto").',
  "channels.telegram.commands.nativeSkills":
    'Override native skill commands for Telegram (bool or "auto").',
  "channels.slack.commands.native": 'Override native commands for Slack (bool or "auto").',
  "channels.slack.commands.nativeSkills":
    'Override native skill commands for Slack (bool or "auto").',
  "channels.slack.streaming":
    'Unified Slack stream preview mode: "off" | "partial" | "block" | "progress". Legacy boolean/streamMode keys are auto-mapped.',
  "channels.slack.nativeStreaming":
    "当 channels.slack.streaming 为 partial 时启用原生 Slack 文本流式传输（chat.startStream/chat.appendStream/chat.stopStream）（默认：true）。",
  "channels.slack.streamMode":
    "旧版 Slack 预览模式别名（replace | status_final | append）；自动迁移到 channels.slack.streaming。",
  "channels.telegram.customCommands":
    "额外的 Telegram 机器人菜单命令（与原生合并；冲突忽略）。",
  "messages.suppressToolErrors":
    "为 true 时，抑制向用户显示 ⚠️ 工具错误警告。代理已在上下文中看到错误并可以重试。默认：false。",
  "messages.ackReaction": "用于确认入站消息的表情符号回应（空则禁用）。",
  "messages.ackReactionScope":
    'When to send ack reactions ("group-mentions", "group-all", "direct", "all", "off", "none"). "off"/"none" disables ack reactions entirely.',
  "messages.statusReactions":
    "在代理进展时更新触发消息上表情符号的生命周期状态回应（queued → thinking → tool → done/error）。",
  "messages.statusReactions.enabled":
    "为 Telegram 启用生命周期状态回应。启用时，确认回应变为初始 'queued' 状态并自动经过 thinking、tool、done/error 进展。默认：false。",
  "messages.statusReactions.emojis":
    "覆盖默认状态回应表情符号。键：thinking、compacting、tool、coding、web、done、error、stallSoft、stallHard。必须是有效的 Telegram 回应表情符号。",
  "messages.statusReactions.timing":
    "覆盖默认时序。键：debounceMs (700)、stallSoftMs (25000)、stallHardMs (60000)、doneHoldMs (1500)、errorHoldMs (2500)。",
  "messages.inbound.debounceMs":
    "批处理来自同一发送者的快速入站消息的去抖窗口（毫秒，0 禁用）。",
  "channels.telegram.dmPolicy":
    'Direct message access control ("pairing" recommended). "open" requires channels.telegram.allowFrom=["*"].',
  "channels.telegram.streaming":
    'Unified Telegram stream preview mode: "off" | "partial" | "block" | "progress" (default: "partial"). "progress" maps to "partial" on Telegram. Legacy boolean/streamMode keys are auto-mapped.',
  "channels.discord.streaming":
    'Unified Discord stream preview mode: "off" | "partial" | "block" | "progress". "progress" maps to "partial" on Discord. Legacy boolean/streamMode keys are auto-mapped.',
  "channels.discord.streamMode":
    "旧版 Discord 预览模式别名（off | partial | block）；自动迁移到 channels.discord.streaming。",
  "channels.discord.draftChunk.minChars":
    'Minimum chars before emitting a Discord stream preview update when channels.discord.streaming="block" (default: 200).',
  "channels.discord.draftChunk.maxChars":
    'Target max size for a Discord stream preview chunk when channels.discord.streaming="block" (default: 800; clamped to channels.discord.textChunkLimit).',
  "channels.discord.draftChunk.breakPreference":
    "Discord 草稿块的首选断点（paragraph | newline | sentence）。默认：paragraph。",
  "channels.telegram.retry.attempts":
    "出站 Telegram API 调用的最大重试次数（默认：3）。",
  "channels.telegram.retry.minDelayMs": "Telegram 出站调用的最小重试延迟（毫秒）。",
  "channels.telegram.retry.maxDelayMs":
    "Telegram 出站调用的最大重试延迟上限（毫秒）。",
  "channels.telegram.retry.jitter": "应用于 Telegram 重试延迟的抖动因子（0-1）。",
  "channels.telegram.network.autoSelectFamily":
    "覆盖 Telegram 的 Node autoSelectFamily（true=启用，false=禁用）。",
  "channels.telegram.timeoutSeconds":
    "Telegram API 请求中止前的最大秒数（默认：500，grammY 标准）。",
  "channels.telegram.silentErrorReplies":
    "为 true 时，标记为错误的 Telegram 机器人回复静默发送（无通知声音）。默认：false。",
  "channels.telegram.apiRoot":
    "自定义 Telegram Bot API 根 URL。用于自托管的 Bot API 服务器（https://github.com/tdlib/telegram-bot-api）或 api.telegram.org 被屏蔽地区的反向代理。",
  "channels.telegram.autoTopicLabel":
    "使用 LLM 在第一条消息时自动重命名私信论坛话题。默认：true。设为 false 禁用，或使用对象形式 { enabled: true, prompt: '...' } 自定义提示。",
  "channels.telegram.autoTopicLabel.enabled":
    "是否启用自动话题标签。默认：true。",
  "channels.telegram.autoTopicLabel.prompt":
    "基于 LLM 的话题命名自定义提示。用户消息附加在提示之后。",
  "channels.telegram.threadBindings.enabled":
    "启用 Telegram 会话绑定功能（/focus、/unfocus、/agents 和 /session idle|max-age）。设置时覆盖 session.threadBindings.enabled。",
  "channels.telegram.threadBindings.idleHours":
    "Telegram 绑定会话的不活跃窗口（小时）。设为 0 禁用空闲自动解绑（默认：24）。设置时覆盖 session.threadBindings.idleHours。",
  "channels.telegram.threadBindings.maxAgeHours":
    "Telegram 绑定会话的可选硬性最大时长（小时）。设为 0 禁用硬性上限（默认：0）。设置时覆盖 session.threadBindings.maxAgeHours。",
  "channels.telegram.threadBindings.spawnSubagentSessions":
    "允许带 thread=true 的子代理生成在支持时自动绑定 Telegram 当前会话。",
  "channels.telegram.threadBindings.spawnAcpSessions":
    "允许带 thread=true 的 ACP 生成在支持时自动绑定 Telegram 当前会话。",
  "channels.whatsapp.dmPolicy":
    'Direct message access control ("pairing" recommended). "open" requires channels.whatsapp.allowFrom=["*"].',
  "channels.whatsapp.selfChatMode": "同一手机设置（机器人使用你的个人 WhatsApp 号码）。",
  "channels.whatsapp.debounceMs":
    "批量处理来自同一发送者的快速连续消息的去抖窗口（毫秒，0 禁用）。",
  "channels.signal.dmPolicy":
    'Direct message access control ("pairing" recommended). "open" requires channels.signal.allowFrom=["*"].',
  "channels.imessage.dmPolicy":
    'Direct message access control ("pairing" recommended). "open" requires channels.imessage.allowFrom=["*"].',
  "channels.bluebubbles.dmPolicy":
    'Direct message access control ("pairing" recommended). "open" requires channels.bluebubbles.allowFrom=["*"].',
  "channels.discord.dmPolicy":
    'Direct message access control ("pairing" recommended). "open" requires channels.discord.allowFrom=["*"].',
  "channels.discord.dm.policy":
    'Direct message access control ("pairing" recommended). "open" requires channels.discord.allowFrom=["*"] (legacy: channels.discord.dm.allowFrom).',
  "channels.discord.retry.attempts":
    "出站 Discord API 调用的最大重试次数（默认：3）。",
  "channels.discord.retry.minDelayMs": "Discord 出站调用的最小重试延迟（毫秒）。",
  "channels.discord.retry.maxDelayMs": "Discord 出站调用的最大重试延迟上限（毫秒）。",
  "channels.discord.retry.jitter": "应用于 Discord 重试延迟的抖动因子（0-1）。",
  "channels.discord.maxLinesPerMessage": "每条 Discord 消息的软性最大行数（默认：17）。",
  "channels.discord.inboundWorker.runTimeoutMs": `Optional queued Discord inbound worker timeout in ms. This is separate from Carbon listener timeouts; defaults to ${DISCORD_DEFAULT_INBOUND_WORKER_TIMEOUT_MS} and can be disabled with 0. Set per account via channels.discord.accounts.<id>.inboundWorker.runTimeoutMs.`,
  "channels.discord.eventQueue.listenerTimeout": `Canonical Discord listener timeout control in ms for gateway normalization/enqueue handlers. Default is ${DISCORD_DEFAULT_LISTENER_TIMEOUT_MS} in OpenClaw; set per account via channels.discord.accounts.<id>.eventQueue.listenerTimeout.`,
  "channels.discord.eventQueue.maxQueueSize":
    "可选的 Discord 事件队列容量覆盖（反压前的最大排队事件数）。通过 channels.discord.accounts.<id>.eventQueue.maxQueueSize 按账户设置。",
  "channels.discord.eventQueue.maxConcurrency":
    "可选的 Discord 事件队列并发覆盖（最大并发处理器执行数）。通过 channels.discord.accounts.<id>.eventQueue.maxConcurrency 按账户设置。",
  "channels.discord.threadBindings.enabled":
    "启用 Discord 线程绑定功能（/focus、绑定线程路由/投递和线程绑定子代理会话）。设置时覆盖 session.threadBindings.enabled。",
  "channels.discord.threadBindings.idleHours":
    "Discord 线程绑定会话（/focus 和生成的线程会话）的不活跃窗口（小时）。设为 0 禁用空闲自动解绑（默认：24）。设置时覆盖 session.threadBindings.idleHours。",
  "channels.discord.threadBindings.maxAgeHours":
    "Discord 线程绑定会话的可选硬性最大时长（小时）。设为 0 禁用硬性上限（默认：0）。设置时覆盖 session.threadBindings.maxAgeHours。",
  "channels.discord.threadBindings.spawnSubagentSessions":
    "允许带 thread=true 的子代理生成自动创建和绑定 Discord 线程（默认：false；需选择加入）。设为 true 以启用此账户/渠道的线程绑定子代理生成。",
  "channels.discord.threadBindings.spawnAcpSessions":
    "允许 /acp spawn 为 ACP 会话自动创建和绑定 Discord 线程（默认：false；需选择加入）。设为 true 以启用此账户/渠道的线程绑定 ACP 生成。",
  "channels.discord.ui.components.accentColor":
    "Discord 组件容器的强调色（十六进制）。通过 channels.discord.accounts.<id>.ui.components.accentColor 按账户设置。",
  "channels.discord.voice.enabled":
    "启用 Discord 语音频道会话（默认：true）。省略 channels.discord.voice 以保持此账户的语音支持禁用。",
  "channels.discord.voice.autoJoin":
    "启动时自动加入的语音频道（guildId/channelId 条目列表）。",
  "channels.discord.voice.daveEncryption":
    "切换 Discord 语音加入的 DAVE 端到端加密（默认：true，@discordjs/voice 标准；Discord 可能要求此项）。",
  "channels.discord.voice.decryptionFailureTolerance":
    "DAVE 尝试会话恢复前的连续解密失败次数（传递给 @discordjs/voice；默认：24）。",
  "channels.discord.voice.tts":
    "Discord 语音播放的可选 TTS 覆盖（与 messages.tts 合并）。",
  "channels.discord.intents.presence":
    "启用 Guild Presences 特权意图。还必须在 Discord 开发者门户中启用。允许跟踪用户活动（如 Spotify）。默认：false。",
  "channels.discord.intents.guildMembers":
    "启用 Guild Members 特权意图。还必须在 Discord 开发者门户中启用。默认：false。",
  "channels.discord.pluralkit.enabled":
    "解析 PluralKit 代理消息并将系统成员视为不同的发送者。",
  "channels.discord.pluralkit.token":
    "用于解析私有系统或成员的可选 PluralKit 令牌。",
  "channels.discord.activity": "Discord 在线状态活动文本（默认为自定义状态）。",
  "channels.discord.status": "Discord 在线状态（online、dnd、idle、invisible）。",
  "channels.discord.autoPresence.enabled":
    "基于运行时/模型可用性信号启用自动 Discord 机器人在线状态更新。启用时：healthy=>online，degraded/unknown=>idle，exhausted/unavailable=>dnd。",
  "channels.discord.autoPresence.intervalMs":
    "评估 Discord 自动在线状态的频率（毫秒，默认：30000）。",
  "channels.discord.autoPresence.minUpdateIntervalMs":
    "实际 Discord 在线状态更新调用之间的最小时间（毫秒，默认：15000）。防止在嘈杂的状态变化时刷屏。",
  "channels.discord.autoPresence.healthyText":
    "运行时健康时（online）的可选自定义状态文本。如省略，在设置时回退到静态 channels.discord.activity。",
  "channels.discord.autoPresence.degradedText":
    "运行时/模型可用性降级或未知时（idle）的可选自定义状态文本。",
  "channels.discord.autoPresence.exhaustedText":
    "运行时检测到模型配额耗尽/不可用时（dnd）的可选自定义状态文本。支持 {reason} 模板占位符。",
  "channels.discord.activityType":
    "Discord 在线状态活动类型（0=正在玩，1=正在直播，2=正在听，3=正在看，4=自定义，5=正在竞技）。",
  "channels.discord.activityUrl": "Discord 在线状态直播 URL（activityType=1 时必需）。",
  "channels.slack.dm.policy":
    'Direct message access control ("pairing" recommended). "open" requires channels.slack.allowFrom=["*"] (legacy: channels.slack.dm.allowFrom).',
  "channels.slack.dmPolicy":
    'Direct message access control ("pairing" recommended). "open" requires channels.slack.allowFrom=["*"].',
};
