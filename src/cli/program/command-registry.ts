import type { Command } from "commander";
import { getPrimaryCommand, hasHelpOrVersion } from "../argv.js";
import { reparseProgramFromActionArgs } from "./action-reparse.js";
import { removeCommandByName } from "./command-tree.js";
import type { ProgramContext } from "./context.js";
import {
  type CoreCliCommandDescriptor,
  getCoreCliCommandDescriptors,
  getCoreCliCommandsWithSubcommands,
} from "./core-command-descriptors.js";
import { registerSubCliCommands } from "./register.subclis.js";

export { getCoreCliCommandDescriptors, getCoreCliCommandsWithSubcommands };

type CommandRegisterParams = {
  program: Command;
  ctx: ProgramContext;
  argv: string[];
};

export type CommandRegistration = {
  id: string;
  register: (params: CommandRegisterParams) => void;
};

type CoreCliEntry = {
  commands: CoreCliCommandDescriptor[];
  register: (params: CommandRegisterParams) => Promise<void> | void;
};

const shouldRegisterCorePrimaryOnly = (argv: string[]) => {
  if (hasHelpOrVersion(argv)) {
    return false;
  }
  return true;
};

// Note for humans and agents:
// If you update the list of commands, also check whether they have subcommands
// and set the flag accordingly.
const coreEntries: CoreCliEntry[] = [
  {
    commands: [
      {
        name: "setup",
        description: "初始化本地配置和代理工作区",
        hasSubcommands: false,
      },
    ],
    register: async ({ program }) => {
      const mod = await import("./register.setup.js");
      mod.registerSetupCommand(program);
    },
  },
  {
    commands: [
      {
        name: "onboard",
        description: "交互式引导配置网关、工作区和技能",
        hasSubcommands: false,
      },
    ],
    register: async ({ program }) => {
      const mod = await import("./register.onboard.js");
      mod.registerOnboardCommand(program);
    },
  },
  {
    commands: [
      {
        name: "configure",
        description:
          "交互式配置凭证、渠道、网关和代理默认设置",
        hasSubcommands: false,
      },
    ],
    register: async ({ program }) => {
      const mod = await import("./register.configure.js");
      mod.registerConfigureCommand(program);
    },
  },
  {
    commands: [
      {
        name: "config",
        description:
          "非交互式配置工具（get/set/unset/file/validate）。默认：启动引导式设置。",
        hasSubcommands: true,
      },
    ],
    register: async ({ program }) => {
      const mod = await import("../config-cli.js");
      mod.registerConfigCli(program);
    },
  },
  {
    commands: [
      {
        name: "backup",
        description: "创建和验证 OpenClaw 状态的本地备份归档",
        hasSubcommands: true,
      },
    ],
    register: async ({ program }) => {
      const mod = await import("./register.backup.js");
      mod.registerBackupCommand(program);
    },
  },
  {
    commands: [
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
    ],
    register: async ({ program }) => {
      const mod = await import("./register.maintenance.js");
      mod.registerMaintenanceCommands(program);
    },
  },
  {
    commands: [
      {
        name: "message",
        description: "发送、读取和管理消息",
        hasSubcommands: true,
      },
    ],
    register: async ({ program, ctx }) => {
      const mod = await import("./register.message.js");
      mod.registerMessageCommands(program, ctx);
    },
  },
  {
    commands: [
      {
        name: "memory",
        description: "搜索和重建记忆文件索引",
        hasSubcommands: true,
      },
    ],
    register: async ({ program }) => {
      const mod = await import("../memory-cli.js");
      mod.registerMemoryCli(program);
    },
  },
  {
    commands: [
      {
        name: "mcp",
        description: "管理内嵌的 Pi MCP 服务器",
        hasSubcommands: true,
      },
    ],
    register: async ({ program }) => {
      const mod = await import("../mcp-cli.js");
      mod.registerMcpCli(program);
    },
  },
  {
    commands: [
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
    ],
    register: async ({ program, ctx }) => {
      const mod = await import("./register.agent.js");
      mod.registerAgentCommands(program, {
        agentChannelOptions: ctx.agentChannelOptions,
      });
    },
  },
  {
    commands: [
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
    ],
    register: async ({ program }) => {
      const mod = await import("./register.status-health-sessions.js");
      mod.registerStatusHealthSessionsCommands(program);
    },
  },
  {
    commands: [
      {
        name: "browser",
        description: "管理 OpenClaw 专用浏览器（Chrome/Chromium）",
        hasSubcommands: true,
      },
    ],
    register: async ({ program }) => {
      const mod = await import("../browser-cli.js");
      mod.registerBrowserCli(program);
    },
  },
];

export function getCoreCliCommandNames(): string[] {
  return getCoreCliCommandDescriptors().map((command) => command.name);
}

function removeEntryCommands(program: Command, entry: CoreCliEntry) {
  // Some registrars install multiple top-level commands (e.g. status/health/sessions).
  // Remove placeholders/old registrations for all names in the entry before re-registering.
  for (const cmd of entry.commands) {
    removeCommandByName(program, cmd.name);
  }
}

function registerLazyCoreCommand(
  program: Command,
  ctx: ProgramContext,
  entry: CoreCliEntry,
  command: CoreCliCommandDescriptor,
) {
  const placeholder = program.command(command.name).description(command.description);
  placeholder.allowUnknownOption(true);
  placeholder.allowExcessArguments(true);
  placeholder.action(async (...actionArgs) => {
    removeEntryCommands(program, entry);
    await entry.register({ program, ctx, argv: process.argv });
    await reparseProgramFromActionArgs(program, actionArgs);
  });
}

export async function registerCoreCliByName(
  program: Command,
  ctx: ProgramContext,
  name: string,
  argv: string[] = process.argv,
): Promise<boolean> {
  const entry = coreEntries.find((candidate) =>
    candidate.commands.some((cmd) => cmd.name === name),
  );
  if (!entry) {
    return false;
  }

  removeEntryCommands(program, entry);
  await entry.register({ program, ctx, argv });
  return true;
}

export function registerCoreCliCommands(program: Command, ctx: ProgramContext, argv: string[]) {
  const primary = getPrimaryCommand(argv);
  if (primary && shouldRegisterCorePrimaryOnly(argv)) {
    const entry = coreEntries.find((candidate) =>
      candidate.commands.some((cmd) => cmd.name === primary),
    );
    if (entry) {
      const cmd = entry.commands.find((c) => c.name === primary);
      if (cmd) {
        registerLazyCoreCommand(program, ctx, entry, cmd);
      }
      return;
    }
  }

  for (const entry of coreEntries) {
    for (const cmd of entry.commands) {
      registerLazyCoreCommand(program, ctx, entry, cmd);
    }
  }
}

export function registerProgramCommands(
  program: Command,
  ctx: ProgramContext,
  argv: string[] = process.argv,
) {
  registerCoreCliCommands(program, ctx, argv);
  registerSubCliCommands(program, argv);
}
