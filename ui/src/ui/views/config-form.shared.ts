import type { ConfigUiHint, ConfigUiHints } from "../types.ts";

export type JsonSchema = {
  type?: string | string[];
  title?: string;
  description?: string;
  tags?: string[];
  "x-tags"?: string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema | JsonSchema[];
  additionalProperties?: JsonSchema | boolean;
  enum?: unknown[];
  const?: unknown;
  default?: unknown;
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  allOf?: JsonSchema[];
  nullable?: boolean;
};

export function schemaType(schema: JsonSchema): string | undefined {
  if (!schema) {
    return undefined;
  }
  if (Array.isArray(schema.type)) {
    const filtered = schema.type.filter((t) => t !== "null");
    return filtered[0] ?? schema.type[0];
  }
  return schema.type;
}

export function defaultValue(schema?: JsonSchema): unknown {
  if (!schema) {
    return "";
  }
  if (schema.default !== undefined) {
    return schema.default;
  }
  const type = schemaType(schema);
  switch (type) {
    case "object":
      return {};
    case "array":
      return [];
    case "boolean":
      return false;
    case "number":
    case "integer":
      return 0;
    case "string":
      return "";
    default:
      return "";
  }
}

export function pathKey(path: Array<string | number>): string {
  return path.filter((segment) => typeof segment === "string").join(".");
}

export function hintForPath(path: Array<string | number>, hints: ConfigUiHints) {
  const key = pathKey(path);
  const direct = hints[key];
  if (direct) {
    return direct;
  }
  const segments = key.split(".");
  for (const [hintKey, hint] of Object.entries(hints)) {
    if (!hintKey.includes("*")) {
      continue;
    }
    const hintSegments = hintKey.split(".");
    if (hintSegments.length !== segments.length) {
      continue;
    }
    let match = true;
    for (let i = 0; i < segments.length; i += 1) {
      if (hintSegments[i] !== "*" && hintSegments[i] !== segments[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      return hint;
    }
  }
  return undefined;
}

// 动态标签翻译映射
const LABEL_TRANSLATIONS: Record<string, string> = {
  // 通用标签
  "Enabled": "已启用",
  "Mode": "模式",
  "Path": "路径",
  "Port": "端口",
  "Timeout Ms": "超时 (毫秒)",
  "Timeout Seconds": "超时 (秒)",
  "Max Bytes": "最大字节数",
  "Max Chars": "最大字符数",
  "Max Redirects": "最大重定向次数",
  "Max Pages": "最大页数",
  "Max Pixels": "最大像素",
  "Max Tokens": "最大令牌数",
  "Max Concurrent": "最大并发数",
  "Max Attempts": "最大尝试次数",
  "Max Body Bytes": "最大请求体字节数",
  "Max Text Length": "最大文本长度",
  "Max Attachments": "最大附件数",
  "Min Chars": "最小字符数",
  "Min Text Chars": "最小文本字符数",
  "Debounce Ms": "防抖 (毫秒)",
  "Base Url": "基础 URL",
  "Api Key": "API 密钥",
  "Token": "令牌",
  "Model": "模型",
  "Model Id": "模型 ID",
  "Provider": "提供商",
  "Language": "语言",
  "Language Code": "语言代码",
  "Lang": "语言",
  "Bind": "绑定",
  "Default": "默认值",
  "Level": "级别",
  "Label": "标签",
  "Strategy": "策略",
  "Scope": "范围",
  "Store": "存储",
  "Seed": "种子",
  "Prompt": "提示词",
  "Color": "颜色",
  "Rate": "速率",
  "Speed": "速度",
  "Pitch": "音调",
  "Volume": "音量",
  "Voice": "语音",
  "Voice Id": "语音 ID",
  "Region": "区域",
  "Domain": "域名",
  "User": "用户",
  "Proxy": "代理",
  "Root": "根目录",
  "File": "文件",
  "Factor": "因子",
  "Start": "开始",
  "End": "结束",
  "Cap": "上限",
  "Ttl": "存活时间",
  "Jitter": "抖动",
  "Image": "图像",
  "Topic": "主题",
  "Target": "目标",
  "Account": "账户",
  "Transport": "传输",
  "Driver": "驱动",
  "Network": "网络",
  "Memory": "内存",
  "Memory Swap": "内存交换",
  "Workdir": "工作目录",
  "Cpus": "CPU 数量",
  "Placeholder": "占位符",
  "Subscription": "订阅",
  "To": "目标",
  "Every": "间隔",
  "Thinking": "思考",
  "Thinking Default": "默认思考",
  "Style": "样式",
  "Prefer": "偏好",
  "Drop": "丢弃",
  "Auto": "自动",
  "Wait": "等待",
  "Session": "会话",
  // 章节标题
  "Diagnostics": "诊断",
  "Approvals": "审批",
  "Media": "媒体",
  "NodeHost": "节点主机",
  "Node Host": "节点主机",
  "Browser": "浏览器",
  "Tools": "工具",
  "Web": "网页",
  // 对象标题
  "Auth": "认证",
  "Http": "HTTP",
  "HTTP": "HTTP",
  "Endpoints": "端点",
  "Responses": "响应",
  "Files": "文件",
  "Images": "图像",
  "Pdf": "PDF",
  "PDF": "PDF",
  "Chat Completions": "聊天补全",
  "Control Ui": "控制台 UI",
  "Reload": "重载",
  "Nodes": "节点",
  "Browser Proxy": "浏览器代理",
  "Cache Trace": "缓存追踪",
  "Otel": "OpenTelemetry",
  "OpenTelemetry": "OpenTelemetry",
  "Headers": "请求头",
  "Remote": "远程",
  "Defaults": "默认配置",
  "Exec": "执行",
  "Apply Patch": "应用补丁",
  "Docker": "Docker",
  "Sandbox": "沙箱",
  "Elevated": "提权",
  "Message": "消息",
  "Cross Context": "跨上下文",
  "Marker": "标记",
  "Broadcast": "广播",
  "Links": "链接",
  "Audio": "音频",
  "Video": "视频",
  "Search": "搜索",
  "Perplexity": "Perplexity",
  "Fetch": "获取",
  "Cooldowns": "冷却时间",
  "Profiles": "配置",
  "Model Overrides": "模型覆盖",
  "Human Delay": "人性化延迟",
  "Image Model": "图像模型",
  "Memory Search": "记忆搜索",
  "Local": "本地",
  "Batch": "批处理",
  "Query": "查询",
  "Hybrid": "混合",
  "Cache": "缓存",
  "Chunking": "分块",
  "Sync": "同步",
  "Sessions": "会话",
  "Vector": "向量",
  "Compaction": "压缩",
  "Hard Clear": "硬清除",
  "Soft Trim": "软裁剪",
  "Context Pruning": "上下文修剪",
  "Prune": "修剪",
  "Subagents": "子代理",
  "Inbound": "入站",
  "Outbound": "出站",
  "Tts": "语音合成",
  "TTS": "语音合成",
  "Edge": "Edge",
  "Openai": "OpenAI",
  "OpenAI": "OpenAI",
  "Elevenlabs": "ElevenLabs",
  "ElevenLabs": "ElevenLabs",
  "Deepgram": "Deepgram",
  "Voice Settings": "语音设置",
  "Voice Aliases": "语音别名",
  "Provider Options": "提供商选项",
  "Streaming": "流式传输",
  "Block Streaming Chunk": "块流分块",
  "Block Streaming Coalesce": "块流合并",
  "Stt": "语音转文本",
  "STT": "语音转文本",
  "Transcription": "转录",
  "Dm": "私信",
  "DM": "私信",
  "Reconnect": "重连",
  "Thread": "线程",
  "Group Chat": "群聊",
  "Group": "群组",
  "Tls": "TLS",
  "TLS": "TLS",
  "Tailscale": "Tailscale",
  "Serve": "服务",
  "Tunnel": "隧道",
  "Twilio": "Twilio",
  "Telnyx": "Telnyx",
  "Plivo": "Plivo",
  "Identity Links": "身份链接",
  "Agent To Agent": "代理间",
  "Reset": "重置",
  "Reset By Channel": "按渠道重置",
  "Reset By Type": "按类型重置",
  "Queue": "队列",
  "Shell Env": "Shell 环境",
  "Env": "环境变量",
  "Vars": "变量",
  "Heartbeat": "心跳",
  "Mdns": "mDNS",
  "mDNS": "mDNS",
  "Wide Area": "广域",
  "Load": "加载",
  "Entries": "条目",
  "Installs": "安装",
  "Install": "安装",
  "Active Hours": "活跃时段",
  "Allow From": "允许来源",
  "Send Policy": "发送策略",
  "By Channel": "按渠道",
  "Debounce Ms By Channel": "按渠道防抖",
  "Assistant": "助手",
  "Memory Flush": "内存刷新",
  "Embedding": "嵌入",
  "Experimental": "实验性",
  "Internal": "内部",
  "LLM Task": "LLM 任务",
  "LLM Task Config": "LLM 任务配置",
  "Lobster": "Lobster",
  "Lobster Config": "Lobster 配置",
  "OpenProse": "OpenProse",
  "OpenProse Config": "OpenProse 配置",
  "Memory (Core)": "记忆 (核心)",
  "Memory (Core) Config": "记忆 (核心) 配置",
  "Bedrock Discovery": "Bedrock 发现",
  "Providers": "提供商",
  "Gmail": "Gmail",
  "Webchat": "网页聊天",
  // 字段标签
  "Allow Tailscale": "允许 Tailscale",
  "Allow Host Control": "允许主机控制",
  "Allow Model Id": "允许模型 ID",
  "Allow Normalization": "允许规范化",
  "Allow Provider": "允许提供商",
  "Allow Seed": "允许种子",
  "Allow Text": "允许文本",
  "Allow Unsafe External Content": "允许不安全的外部内容",
  "Allow Url": "允许 URL",
  "Allow Voice": "允许语音",
  "Allow Voice Settings": "允许语音设置",
  "Attach Only": "仅附加",
  "Auto Generate": "自动生成",
  "Auto Start": "自动启动",
  "Auto-Capture": "自动捕获",
  "Auto-Recall": "自动回忆",
  "Detect Language": "检测语言",
  "Enable Streaming": "启用流式传输",
  "Enable LLM Task": "启用 LLM 任务",
  "Enable Lobster": "启用 Lobster",
  "Enable Memory (Core)": "启用记忆 (核心)",
  "Enable No Vnc": "启用 NoVNC",
  "Enable OpenProse": "启用 OpenProse",
  "Enable qwen-portal-auth": "启用 qwen-portal-auth",
  "Skip Signature Verification": "跳过签名验证",
  "Headless": "无头模式",
  "Include Body": "包含请求体",
  "Include Reasoning": "包含推理",
  "Interrupt On Speech": "语音中断",
  "Live Reload": "实时重载",
  "No Sandbox": "无沙箱",
  "Per Session": "每会话",
  "Prefer Brew": "优先 Brew",
  "Preserve Filenames": "保留文件名",
  "Punctuate": "标点",
  "Read Only Root": "只读根目录",
  "Remove Ack After Reply": "回复后移除确认",
  "Reset On Exit": "退出时重置",
  "Save Subtitles": "保存字幕",
  "Skip Bootstrap": "跳过引导",
  "Smart Format": "智能格式",
  "Use Speaker Boost": "使用扬声器增强",
  // 数组标签
  "Agent Filter": "代理过滤器",
  "Allow": "允许列表",
  "Allow Bundled": "允许捆绑",
  "Allowed Mimes": "允许的 MIME 类型",
  "Allowed Models": "允许的模型",
  "Also Allow": "同时允许",
  "Binds": "绑定",
  "Cap Drop": "丢弃权限",
  "Command": "命令",
  "Deny": "拒绝列表",
  "Dns": "DNS",
  "DNS": "DNS",
  "Extra Dirs": "额外目录",
  "Extra Hosts": "额外主机",
  "Handlers": "处理器",
  "Inbound Allowlist": "入站白名单",
  "Mappings": "映射",
  "Mention Patterns": "提及模式",
  "Presets": "预设",
  "Provider Filter": "提供商过滤器",
  "Redact Patterns": "脱敏模式",
  "Reset Triggers": "重置触发器",
  "Rules": "规则",
  "Session Filter": "会话过滤器",
  "Targets": "目标",
  "Tmpfs": "临时文件系统",
  "Trusted Proxies": "可信代理",
  // 其他常见字段
  "Last Run At": "上次运行时间",
  "Last Run Command": "上次运行命令",
  "Last Run Commit": "上次运行提交",
  "Last Run Mode": "上次运行模式",
  "Last Run Version": "上次运行版本",
  "Console Level": "控制台级别",
  "Console Style": "控制台样式",
  "Database Path": "数据库路径",
  "Context Tokens": "上下文令牌数",
  "Default Auth Profile Id": "默认认证配置 ID",
  "Default Call Mode": "默认呼叫模式",
  "Default Context Window": "默认上下文窗口",
  "Default Max Tokens": "默认最大令牌数",
  "Default Model": "默认模型",
  "Default Profile": "默认配置",
  "Default Provider": "默认提供商",
  "Default To Number": "默认目标号码",
  "Embedding Model": "嵌入模型",
  "Executable Path": "可执行路径",
  "From Number": "来源号码",
  "Head Chars": "头部字符数",
  "Heartbeat Seconds": "心跳间隔 (秒)",
  "History Limit": "历史限制",
  "Hook Url": "钩子 URL",
  "Idle Hours": "空闲小时数",
  "Idle Minutes": "空闲分钟数",
  "Idle Ms": "空闲 (毫秒)",
  "Initial Ms": "初始 (毫秒)",
  "Interval Minutes": "间隔分钟数",
  "Keep Last Assistants": "保留最后助手数",
  "Key Path": "密钥路径",
  "Main Key": "主密钥",
  "Max Age Days": "最大天数",
  "Max Concurrent Calls": "最大并发呼叫数",
  "Max Concurrent Runs": "最大并发运行数",
  "Max Duration Seconds": "最大持续时间 (秒)",
  "Max History Share": "最大历史共享",
  "Max Ms": "最大 (毫秒)",
  "Message Prefix": "消息前缀",
  "Min Prunable Tool Chars": "最小可修剪工具字符数",
  "Notify Hangup Delay (sec)": "挂断通知延迟 (秒)",
  "Output Format": "输出格式",
  "Pids Limit": "进程数限制",
  "Poll Interval Ms": "轮询间隔 (毫秒)",
  "Prefs Path": "偏好路径",
  "Redact Sensitive": "脱敏敏感信息",
  "Refresh Interval": "刷新间隔",
  "Renew Every Minutes": "续订间隔 (分钟)",
  "Reserve Tokens Floor": "保留令牌下限",
  "Response Model": "响应模型",
  "Response Prefix": "响应前缀",
  "Response System Prompt": "响应系统提示词",
  "Response Timeout (ms)": "响应超时 (毫秒)",
  "Ring Timeout Ms": "响铃超时 (毫秒)",
  "Session Tools Visibility": "会话工具可见性",
  "Setup Command": "设置命令",
  "Silence Duration Ms": "静音持续 (毫秒)",
  "Silence Timeout Ms": "静音超时 (毫秒)",
  "Similarity Boost": "相似度增强",
  "Soft Threshold Tokens": "软阈值令牌数",
  "Soft Trim Ratio": "软裁剪比例",
  "Stability": "稳定性",
  "Summary Model": "摘要模型",
  "System Prompt": "系统提示词",
  "Tail Chars": "尾部字符数",
  "Time Format": "时间格式",
  "Timeout Minutes": "超时 (分钟)",
  "Timeout Sec": "超时 (秒)",
  "Timezone": "时区",
  "Transcript Timeout Ms": "转录超时 (毫秒)",
  "Transforms Dir": "转换目录",
  "Typing Interval Seconds": "输入间隔 (秒)",
  "Typing Mode": "输入模式",
  "User Timezone": "用户时区",
  "Vad Threshold": "语音活动检测阈值",
  "Verbose Default": "默认详细模式",
  "Workspace Access": "工作空间访问",
  "Workspace Root": "工作空间根目录",
  "Ack Max Chars": "确认最大字符数",
  "Apply Text Normalization": "应用文本规范化",
  "Archive After Minutes": "归档间隔 (分钟)",
  "At Hour": "在小时",
  "Auth Id": "认证 ID",
  "Auth Token": "认证令牌",
  "Auto Start Timeout Ms": "自动启动超时 (毫秒)",
  "Background Ms": "后台 (毫秒)",
  "Block Streaming Break": "块流中断",
  "Block Streaming Default": "块流默认",
  "Break Preference": "断行偏好",
  "Ca Path": "CA 路径",
  "Call Log Store Path": "呼叫日志存储路径",
  "Cdp Port": "CDP 端口",
  "Cdp Url": "CDP URL",
  "CDP URL": "CDP URL",
  "Cert Path": "证书路径",
  "Cleanup Ms": "清理 (毫秒)",
  "Container Prefix": "容器前缀",
  "Discord": "Discord",
  "Elevated Default": "提权默认值",
  "Hard Clear Ratio": "硬清除比例",
  "Imessage": "iMessage",
  "iMessage": "iMessage",
  "Inbound Greeting": "入站问候语",
  "Inbound Policy": "入站策略",
  "Mattermost": "Mattermost",
  "Media Max Mb": "媒体最大 MB",
  "Media Stream Path": "媒体流路径",
  "Model Cache Dir": "模型缓存目录",
  "Msteams": "MS Teams",
  "MS Teams": "MS Teams",
  "Node Manager": "节点管理器",
  "No Vnc Port": "NoVNC 端口",
  "Public Webhook URL": "公共 Webhook URL",
  "Push Token": "推送令牌",
  "Realtime STT Model": "实时语音转文本模型",
  "Seccomp Profile": "Seccomp 配置",
  "Apparmor Profile": "AppArmor 配置",
  "Signal": "Signal",
  "Slack": "Slack",
  "Stt Provider": "语音转文本提供商",
  "Tailscale Mode": "Tailscale 模式",
  "Tailscale Path": "Tailscale 路径",
  "Telegram": "Telegram",
  "TTS Provider Override": "语音合成提供商覆盖",
  "Tunnel Provider": "隧道提供商",
  "Vnc Port": "VNC 端口",
  "Webhook Bind": "Webhook 绑定",
  "Webhook Path": "Webhook 路径",
  "Webhook Port": "Webhook 端口",
  "Whatsapp": "WhatsApp",
  "WhatsApp": "WhatsApp",
  // API 密钥类
  "ElevenLabs API Key": "ElevenLabs API 密钥",
  "ElevenLabs Base URL": "ElevenLabs 基础 URL",
  "ElevenLabs Model ID": "ElevenLabs 模型 ID",
  "ElevenLabs Voice ID": "ElevenLabs 语音 ID",
  "OpenAI API Key": "OpenAI API 密钥",
  "OpenAI Realtime API Key": "OpenAI 实时 API 密钥",
  "OpenAI TTS Model": "OpenAI 语音合成模型",
  "OpenAI TTS Voice": "OpenAI 语音合成声音",
  "Telnyx API Key": "Telnyx API 密钥",
  "Telnyx Connection ID": "Telnyx 连接 ID",
  "Telnyx Public Key": "Telnyx 公钥",
  "Twilio Account SID": "Twilio 账户 SID",
  "Twilio Auth Token": "Twilio 认证令牌",
  "ngrok Auth Token": "ngrok 认证令牌",
  "ngrok Domain": "ngrok 域名",
  "Allow ngrok Free Tier (Loopback Bypass)": "允许 ngrok 免费版 (回环绕过)",
  // 插件相关
  "@openclaw/bluebubbles": "@openclaw/bluebubbles",
  "@openclaw/bluebubbles Config": "@openclaw/bluebubbles 配置",
  "@openclaw/copilot-proxy": "@openclaw/copilot-proxy",
  "@openclaw/copilot-proxy Config": "@openclaw/copilot-proxy 配置",
  "@openclaw/diagnostics-otel": "@openclaw/diagnostics-otel",
  "@openclaw/diagnostics-otel Config": "@openclaw/diagnostics-otel 配置",
  "@openclaw/discord": "@openclaw/discord",
  "@openclaw/discord Config": "@openclaw/discord 配置",
  "@openclaw/google-antigravity-auth": "@openclaw/google-antigravity-auth",
  "@openclaw/google-antigravity-auth Config": "@openclaw/google-antigravity-auth 配置",
  "@openclaw/google-gemini-cli-auth": "@openclaw/google-gemini-cli-auth",
  "@openclaw/google-gemini-cli-auth Config": "@openclaw/google-gemini-cli-auth 配置",
  "@openclaw/googlechat": "@openclaw/googlechat",
  "@openclaw/googlechat Config": "@openclaw/googlechat 配置",
  "@openclaw/imessage": "@openclaw/imessage",
  "@openclaw/imessage Config": "@openclaw/imessage 配置",
  "@openclaw/line": "@openclaw/line",
  "@openclaw/line Config": "@openclaw/line 配置",
  "@openclaw/matrix": "@openclaw/matrix",
  "@openclaw/matrix Config": "@openclaw/matrix 配置",
  "@openclaw/mattermost": "@openclaw/mattermost",
  "@openclaw/mattermost Config": "@openclaw/mattermost 配置",
  "@openclaw/memory-lancedb": "@openclaw/memory-lancedb",
  "@openclaw/memory-lancedb Config": "@openclaw/memory-lancedb 配置",
  "@openclaw/msteams": "@openclaw/msteams",
  "@openclaw/msteams Config": "@openclaw/msteams 配置",
  "@openclaw/nextcloud-talk": "@openclaw/nextcloud-talk",
  "@openclaw/nextcloud-talk Config": "@openclaw/nextcloud-talk 配置",
  "@openclaw/nostr": "@openclaw/nostr",
  "@openclaw/nostr Config": "@openclaw/nostr 配置",
  "@openclaw/signal": "@openclaw/signal",
  "@openclaw/signal Config": "@openclaw/signal 配置",
  "@openclaw/slack": "@openclaw/slack",
  "@openclaw/slack Config": "@openclaw/slack 配置",
  "@openclaw/telegram": "@openclaw/telegram",
  "@openclaw/telegram Config": "@openclaw/telegram 配置",
  "@openclaw/tlon": "@openclaw/tlon",
  "@openclaw/tlon Config": "@openclaw/tlon 配置",
  "@openclaw/twitch": "@openclaw/twitch",
  "@openclaw/twitch Config": "@openclaw/twitch 配置",
  "@openclaw/voice-call": "@openclaw/voice-call",
  "@openclaw/voice-call Config": "@openclaw/voice-call 配置",
  "@openclaw/whatsapp": "@openclaw/whatsapp",
  "@openclaw/whatsapp Config": "@openclaw/whatsapp 配置",
  "@openclaw/zalo": "@openclaw/zalo",
  "@openclaw/zalo Config": "@openclaw/zalo 配置",
  "@openclaw/zalouser": "@openclaw/zalouser",
  "@openclaw/zalouser Config": "@openclaw/zalouser 配置",
  "qwen-portal-auth Config": "qwen-portal-auth 配置",
  // 启用插件
  "Enable @openclaw/bluebubbles": "启用 @openclaw/bluebubbles",
  "Enable @openclaw/copilot-proxy": "启用 @openclaw/copilot-proxy",
  "Enable @openclaw/diagnostics-otel": "启用 @openclaw/diagnostics-otel",
  "Enable @openclaw/discord": "启用 @openclaw/discord",
  "Enable @openclaw/google-antigravity-auth": "启用 @openclaw/google-antigravity-auth",
  "Enable @openclaw/google-gemini-cli-auth": "启用 @openclaw/google-gemini-cli-auth",
  "Enable @openclaw/googlechat": "启用 @openclaw/googlechat",
  "Enable @openclaw/imessage": "启用 @openclaw/imessage",
  "Enable @openclaw/line": "启用 @openclaw/line",
  "Enable @openclaw/matrix": "启用 @openclaw/matrix",
  "Enable @openclaw/mattermost": "启用 @openclaw/mattermost",
  "Enable @openclaw/memory-lancedb": "启用 @openclaw/memory-lancedb",
  "Enable @openclaw/msteams": "启用 @openclaw/msteams",
  "Enable @openclaw/nextcloud-talk": "启用 @openclaw/nextcloud-talk",
  "Enable @openclaw/nostr": "启用 @openclaw/nostr",
  "Enable @openclaw/signal": "启用 @openclaw/signal",
  "Enable @openclaw/slack": "启用 @openclaw/slack",
  "Enable @openclaw/telegram": "启用 @openclaw/telegram",
  "Enable @openclaw/tlon": "启用 @openclaw/tlon",
  "Enable @openclaw/twitch": "启用 @openclaw/twitch",
  "Enable @openclaw/voice-call": "启用 @openclaw/voice-call",
  "Enable @openclaw/whatsapp": "启用 @openclaw/whatsapp",
  "Enable @openclaw/zalo": "启用 @openclaw/zalo",
  "Enable @openclaw/zalouser": "启用 @openclaw/zalouser"
};

export function humanize(raw: string) {
  const titleCase = raw
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .replace(/^./, (m) => m.toUpperCase());
  return LABEL_TRANSLATIONS[titleCase] || titleCase;
}

const SENSITIVE_KEY_WHITELIST_SUFFIXES = [
  "maxtokens",
  "maxoutputtokens",
  "maxinputtokens",
  "maxcompletiontokens",
  "contexttokens",
  "totaltokens",
  "tokencount",
  "tokenlimit",
  "tokenbudget",
  "passwordfile",
] as const;

const SENSITIVE_PATTERNS = [
  /token$/i,
  /password/i,
  /secret/i,
  /api.?key/i,
  /serviceaccount(?:ref)?$/i,
];

const ENV_VAR_PLACEHOLDER_PATTERN = /^\$\{[^}]*\}$/;

export const REDACTED_PLACEHOLDER = "[redacted - click reveal to view]";

function isEnvVarPlaceholder(value: string): boolean {
  return ENV_VAR_PLACEHOLDER_PATTERN.test(value.trim());
}

export function isSensitiveConfigPath(path: string): boolean {
  const lowerPath = path.toLowerCase();
  const whitelisted = SENSITIVE_KEY_WHITELIST_SUFFIXES.some((suffix) => lowerPath.endsWith(suffix));
  return !whitelisted && SENSITIVE_PATTERNS.some((pattern) => pattern.test(path));
}

function isSensitiveLeafValue(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0 && !isEnvVarPlaceholder(value);
  }
  return value !== undefined && value !== null;
}

function isHintSensitive(hint: ConfigUiHint | undefined): boolean {
  return hint?.sensitive ?? false;
}

export function hasSensitiveConfigData(
  value: unknown,
  path: Array<string | number>,
  hints: ConfigUiHints,
): boolean {
  const key = pathKey(path);
  const hint = hintForPath(path, hints);
  const pathIsSensitive = isHintSensitive(hint) || isSensitiveConfigPath(key);

  if (pathIsSensitive && isSensitiveLeafValue(value)) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some((item, index) => hasSensitiveConfigData(item, [...path, index], hints));
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).some(([childKey, childValue]) =>
      hasSensitiveConfigData(childValue, [...path, childKey], hints),
    );
  }

  return false;
}

export function countSensitiveConfigValues(
  value: unknown,
  path: Array<string | number>,
  hints: ConfigUiHints,
): number {
  if (value == null) {
    return 0;
  }

  const key = pathKey(path);
  const hint = hintForPath(path, hints);
  const pathIsSensitive = isHintSensitive(hint) || isSensitiveConfigPath(key);

  if (pathIsSensitive && isSensitiveLeafValue(value)) {
    return 1;
  }

  if (Array.isArray(value)) {
    return value.reduce(
      (count, item, index) => count + countSensitiveConfigValues(item, [...path, index], hints),
      0,
    );
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce(
      (count, [childKey, childValue]) =>
        count + countSensitiveConfigValues(childValue, [...path, childKey], hints),
      0,
    );
  }

  return 0;
}
