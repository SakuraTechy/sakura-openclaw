import type { Command } from "commander";
import type { OpenClawConfig } from "../../config/config.js";
import { isTruthyEnvValue } from "../../infra/env.js";
import { getPrimaryCommand, hasHelpOrVersion } from "../argv.js";
import { reparseProgramFromActionArgs } from "./action-reparse.js";
import { removeCommand, removeCommandByName } from "./command-tree.js";
import {
  getSubCliCommandsWithSubcommands,
  getSubCliEntries as getSubCliEntryDescriptors,
  type SubCliDescriptor,
} from "./subcli-descriptors.js";

export { getSubCliCommandsWithSubcommands };

type SubCliRegistrar = (program: Command) => Promise<void> | void;

type SubCliEntry = SubCliDescriptor & {
  register: SubCliRegistrar;
};

const shouldRegisterPrimaryOnly = (argv: string[]) => {
  if (isTruthyEnvValue(process.env.OPENCLAW_DISABLE_LAZY_SUBCOMMANDS)) {
    return false;
  }
  if (hasHelpOrVersion(argv)) {
    return false;
  }
  return true;
};

const shouldEagerRegisterSubcommands = (_argv: string[]) => {
  return isTruthyEnvValue(process.env.OPENCLAW_DISABLE_LAZY_SUBCOMMANDS);
};

export const loadValidatedConfigForPluginRegistration =
  async (): Promise<OpenClawConfig | null> => {
    const mod = await import("../../config/config.js");
    const snapshot = await mod.readConfigFileSnapshot();
    if (!snapshot.valid) {
      return null;
    }
    return mod.loadConfig();
  };

// Note for humans and agents:
// If you update the list of commands, also check whether they have subcommands
// and set the flag accordingly.
const entries: SubCliEntry[] = [
  {
    name: "acp",
    description: "Agent Control Protocol tools",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../acp-cli.js");
      mod.registerAcpCli(program);
    },
  },
  {
    name: "gateway",
    description: "运行、检查和查询 WebSocket 网关",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../gateway-cli.js");
      mod.registerGatewayCli(program);
    },
  },
  {
    name: "daemon",
    description: "Gateway service (legacy alias)",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../daemon-cli.js");
      mod.registerDaemonCli(program);
    },
  },
  {
    name: "logs",
    description: "通过 RPC 查看网关日志",
    hasSubcommands: false,
    register: async (program) => {
      const mod = await import("../logs-cli.js");
      mod.registerLogsCli(program);
    },
  },
  {
    name: "system",
    description: "System events, heartbeat, and presence",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../system-cli.js");
      mod.registerSystemCli(program);
    },
  },
  {
    name: "models",
    description: "发现、扫描和配置模型",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../models-cli.js");
      mod.registerModelsCli(program);
    },
  },
  {
    name: "approvals",
    description: "管理执行审批（网关或节点主机）",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../exec-approvals-cli.js");
      mod.registerExecApprovalsCli(program);
    },
  },
  {
    name: "nodes",
    description: "管理网关节点配对和节点命令",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../nodes-cli.js");
      mod.registerNodesCli(program);
    },
  },
  {
    name: "devices",
    description: "Device pairing + token management",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../devices-cli.js");
      mod.registerDevicesCli(program);
    },
  },
  {
    name: "node",
    description: "运行和管理无头节点主机服务",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../node-cli.js");
      mod.registerNodeCli(program);
    },
  },
  {
    name: "sandbox",
    description: "管理沙箱容器以隔离代理",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../sandbox-cli.js");
      mod.registerSandboxCli(program);
    },
  },
  {
    name: "tui",
    description: "打开连接到网关的终端界面",
    hasSubcommands: false,
    register: async (program) => {
      const mod = await import("../tui-cli.js");
      mod.registerTuiCli(program);
    },
  },
  {
    name: "cron",
    description: "通过网关调度器管理定时任务",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../cron-cli.js");
      mod.registerCronCli(program);
    },
  },
  {
    name: "dns",
    description: "DNS 工具 - 广域发现（Tailscale + CoreDNS）",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../dns-cli.js");
      mod.registerDnsCli(program);
    },
  },
  {
    name: "docs",
    description: "搜索 OpenClaw 在线文档",
    hasSubcommands: false,
    register: async (program) => {
      const mod = await import("../docs-cli.js");
      mod.registerDocsCli(program);
    },
  },
  {
    name: "hooks",
    description: "管理内部代理 Hooks",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../hooks-cli.js");
      mod.registerHooksCli(program);
    },
  },
  {
    name: "webhooks",
    description: "Webhook 工具与集成",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../webhooks-cli.js");
      mod.registerWebhooksCli(program);
    },
  },
  {
    name: "qr",
    description: "生成 iOS 配对二维码/设置码",
    hasSubcommands: false,
    register: async (program) => {
      const mod = await import("../qr-cli.js");
      mod.registerQrCli(program);
    },
  },
  {
    name: "clawbot",
    description: "旧版 clawbot 命令别名",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../clawbot-cli.js");
      mod.registerClawbotCli(program);
    },
  },
  {
    name: "pairing",
    description: "安全私信配对（审批入站请求）",
    hasSubcommands: true,
    register: async (program) => {
      // Initialize plugins before registering pairing CLI.
      // The pairing CLI calls listPairingChannels() at registration time,
      // which requires the plugin registry to be populated with channel plugins.
      const { registerPluginCliCommands } = await import("../../plugins/cli.js");
      const config = await loadValidatedConfigForPluginRegistration();
      if (config) {
        registerPluginCliCommands(program, config);
      }
      const mod = await import("../pairing-cli.js");
      mod.registerPairingCli(program);
    },
  },
  {
    name: "plugins",
    description: "管理 OpenClaw 插件和扩展",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../plugins-cli.js");
      mod.registerPluginsCli(program);
      const { registerPluginCliCommands } = await import("../../plugins/cli.js");
      const config = await loadValidatedConfigForPluginRegistration();
      if (config) {
        registerPluginCliCommands(program, config);
      }
    },
  },
  {
    name: "channels",
    description: "管理已连接的聊天渠道（Telegram、Discord 等）",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../channels-cli.js");
      mod.registerChannelsCli(program);
    },
  },
  {
    name: "directory",
    description: "查询支持渠道的联系人和群组 ID",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../directory-cli.js");
      mod.registerDirectoryCli(program);
    },
  },
  {
    name: "security",
    description: "安全工具和本地配置审计",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../security-cli.js");
      mod.registerSecurityCli(program);
    },
  },
  {
    name: "secrets",
    description: "Secrets runtime reload controls",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../secrets-cli.js");
      mod.registerSecretsCli(program);
    },
  },
  {
    name: "skills",
    description: "列出和检查可用技能",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../skills-cli.js");
      mod.registerSkillsCli(program);
    },
  },
  {
    name: "update",
    description: "更新 OpenClaw 并检查更新渠道状态",
    hasSubcommands: true,
    register: async (program) => {
      const mod = await import("../update-cli.js");
      mod.registerUpdateCli(program);
    },
  },
  {
    name: "completion",
    description: "Generate shell completion script",
    hasSubcommands: false,
    register: async (program) => {
      const mod = await import("../completion-cli.js");
      mod.registerCompletionCli(program);
    },
  },
];

export function getSubCliEntries(): ReadonlyArray<SubCliDescriptor> {
  return getSubCliEntryDescriptors();
}

export async function registerSubCliByName(program: Command, name: string): Promise<boolean> {
  const entry = entries.find((candidate) => candidate.name === name);
  if (!entry) {
    return false;
  }
  removeCommandByName(program, entry.name);
  await entry.register(program);
  return true;
}

function registerLazyCommand(program: Command, entry: SubCliEntry) {
  const placeholder = program.command(entry.name).description(entry.description);
  placeholder.allowUnknownOption(true);
  placeholder.allowExcessArguments(true);
  placeholder.action(async (...actionArgs) => {
    removeCommand(program, placeholder);
    await entry.register(program);
    await reparseProgramFromActionArgs(program, actionArgs);
  });
}

export function registerSubCliCommands(program: Command, argv: string[] = process.argv) {
  if (shouldEagerRegisterSubcommands(argv)) {
    for (const entry of entries) {
      void entry.register(program);
    }
    return;
  }
  const primary = getPrimaryCommand(argv);
  if (primary && shouldRegisterPrimaryOnly(argv)) {
    const entry = entries.find((candidate) => candidate.name === primary);
    if (entry) {
      registerLazyCommand(program, entry);
      return;
    }
  }
  for (const candidate of entries) {
    registerLazyCommand(program, candidate);
  }
}
