export type CoreCliCommandDescriptor = {
  name: string;
  description: string;
  hasSubcommands: boolean;
};

export const CORE_CLI_COMMAND_DESCRIPTORS = [
  {
    name: "setup",
    description: "初始化本地配置和代理工作区",
    hasSubcommands: false,
  },
  {
    name: "onboard",
    description: "交互式引导配置网关、工作区和技能",
    hasSubcommands: false,
  },
  {
    name: "configure",
    description: "交互式配置凭证、渠道、网关和代理默认设置",
    hasSubcommands: false,
  },
  {
    name: "config",
    description:
      "非交互式配置工具（get/set/unset/file/validate）。默认：启动引导式设置。",
    hasSubcommands: true,
  },
  {
    name: "backup",
    description: "创建和验证 OpenClaw 状态的本地备份归档",
    hasSubcommands: true,
  },
  {
    name: "doctor",
    description: "网关和渠道的健康检查与快速修复",
    hasSubcommands: false,
  },
  {
    name: "dashboard",
    description: "使用当前令牌打开控制面板",
    hasSubcommands: false,
  },
  {
    name: "reset",
    description: "重置本地配置/状态（保留 CLI）",
    hasSubcommands: false,
  },
  {
    name: "uninstall",
    description: "卸载网关服务和本地数据（保留 CLI）",
    hasSubcommands: false,
  },
  {
    name: "message",
    description: "发送、读取和管理消息",
    hasSubcommands: true,
  },
  {
    name: "memory",
    description: "搜索和重建记忆文件索引",
    hasSubcommands: true,
  },
  {
    name: "agent",
    description: "通过网关运行一次代理",
    hasSubcommands: false,
  },
  {
    name: "agents",
    description: "管理隔离的代理（工作区、认证、路由）",
    hasSubcommands: true,
  },
  {
    name: "status",
    description: "显示渠道健康状态和最近会话接收者",
    hasSubcommands: false,
  },
  {
    name: "health",
    description: "从运行中的网关获取健康状态",
    hasSubcommands: false,
  },
  {
    name: "sessions",
    description: "列出已存储的对话会话",
    hasSubcommands: true,
  },
  {
    name: "browser",
    description: "管理 OpenClaw 专用浏览器（Chrome/Chromium）",
    hasSubcommands: true,
  },
] as const satisfies ReadonlyArray<CoreCliCommandDescriptor>;

export function getCoreCliCommandDescriptors(): ReadonlyArray<CoreCliCommandDescriptor> {
  return CORE_CLI_COMMAND_DESCRIPTORS;
}

export function getCoreCliCommandsWithSubcommands(): string[] {
  return CORE_CLI_COMMAND_DESCRIPTORS.filter((command) => command.hasSubcommands).map(
    (command) => command.name,
  );
}
