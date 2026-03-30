export type SubCliDescriptor = {
  name: string;
  description: string;
  hasSubcommands: boolean;
};

export const SUB_CLI_DESCRIPTORS = [
  { name: "acp", description: "Agent Control Protocol 工具", hasSubcommands: true },
  {
    name: "gateway",
    description: "运行、检查和查询 WebSocket 网关",
    hasSubcommands: true,
  },
  { name: "daemon", description: "网关服务（旧版别名）", hasSubcommands: true },
  { name: "logs", description: "通过 RPC 跟踪网关文件日志", hasSubcommands: false },
  {
    name: "system",
    description: "系统事件、心跳和在线状态",
    hasSubcommands: true,
  },
  {
    name: "models",
    description: "发现、扫描和配置模型",
    hasSubcommands: true,
  },
  {
    name: "approvals",
    description: "管理执行审批（网关或节点主机）",
    hasSubcommands: true,
  },
  {
    name: "nodes",
    description: "管理网关节点配对和节点命令",
    hasSubcommands: true,
  },
  {
    name: "devices",
    description: "设备配对和令牌管理",
    hasSubcommands: true,
  },
  {
    name: "node",
    description: "运行和管理无头节点主机服务",
    hasSubcommands: true,
  },
  {
    name: "sandbox",
    description: "管理代理隔离的沙箱容器",
    hasSubcommands: true,
  },
  {
    name: "tui",
    description: "打开连接到网关的终端 UI",
    hasSubcommands: false,
  },
  {
    name: "cron",
    description: "通过网关调度器管理定时任务",
    hasSubcommands: true,
  },
  {
    name: "dns",
    description: "广域发现的 DNS 工具（Tailscale + CoreDNS）",
    hasSubcommands: true,
  },
  {
    name: "docs",
    description: "搜索 OpenClaw 在线文档",
    hasSubcommands: false,
  },
  {
    name: "hooks",
    description: "管理内部代理 Hook",
    hasSubcommands: true,
  },
  {
    name: "webhooks",
    description: "Webhook 工具和集成",
    hasSubcommands: true,
  },
  {
    name: "qr",
    description: "生成 iOS 配对二维码/设置码",
    hasSubcommands: false,
  },
  {
    name: "clawbot",
    description: "旧版 clawbot 命令别名",
    hasSubcommands: true,
  },
  {
    name: "pairing",
    description: "安全私信配对（审批入站请求）",
    hasSubcommands: true,
  },
  {
    name: "plugins",
    description: "管理 OpenClaw 插件和扩展",
    hasSubcommands: true,
  },
  {
    name: "channels",
    description: "管理已连接的聊天渠道（Telegram、Discord 等）",
    hasSubcommands: true,
  },
  {
    name: "directory",
    description: "查询支持的聊天渠道的联系人和群组 ID",
    hasSubcommands: true,
  },
  {
    name: "security",
    description: "安全工具和本地配置审计",
    hasSubcommands: true,
  },
  {
    name: "secrets",
    description: "密钥运行时重载控制",
    hasSubcommands: true,
  },
  {
    name: "skills",
    description: "列出和查看可用技能",
    hasSubcommands: true,
  },
  {
    name: "update",
    description: "更新 OpenClaw 并查看更新渠道状态",
    hasSubcommands: true,
  },
  {
    name: "completion",
    description: "生成 Shell 补全脚本",
    hasSubcommands: false,
  },
] as const satisfies ReadonlyArray<SubCliDescriptor>;

export function getSubCliEntries(): ReadonlyArray<SubCliDescriptor> {
  return SUB_CLI_DESCRIPTORS;
}

export function getSubCliCommandsWithSubcommands(): string[] {
  return SUB_CLI_DESCRIPTORS.filter((entry) => entry.hasSubcommands).map((entry) => entry.name);
}
