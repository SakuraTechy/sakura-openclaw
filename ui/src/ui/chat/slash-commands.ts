import type { IconName } from "../icons.ts";

export type SlashCommandCategory = "session" | "model" | "agents" | "tools";

export type SlashCommandDef = {
  name: string;
  description: string;
  args?: string;
  icon?: IconName;
  category?: SlashCommandCategory;
  /** When true, the command is executed client-side via RPC instead of sent to the agent. */
  executeLocal?: boolean;
  /** Fixed argument choices for inline hints. */
  argOptions?: string[];
  /** Keyboard shortcut hint shown in the menu (display only). */
  shortcut?: string;
};

export const SLASH_COMMANDS: SlashCommandDef[] = [
  // ── Session ──
  {
    name: "new",
    description: "开始新会话",
    icon: "plus",
    category: "session",
    executeLocal: true,
  },
  {
    name: "reset",
    description: "重置当前会话",
    icon: "refresh",
    category: "session",
    executeLocal: true,
  },
  {
    name: "compact",
    description: "压缩会话上下文",
    icon: "loader",
    category: "session",
    executeLocal: true,
  },
  {
    name: "stop",
    description: "停止当前运行",
    icon: "stop",
    category: "session",
    executeLocal: true,
  },
  {
    name: "clear",
    description: "清除聊天历史",
    icon: "trash",
    category: "session",
    executeLocal: true,
  },
  {
    name: "focus",
    description: "切换专注模式",
    icon: "eye",
    category: "session",
    executeLocal: true,
  },

  // ── Model ──
  {
    name: "model",
    description: "显示或设置模型",
    args: "<name>",
    icon: "brain",
    category: "model",
    executeLocal: true,
  },
  {
    name: "think",
    description: "设置思考级别",
    args: "<level>",
    icon: "brain",
    category: "model",
    executeLocal: true,
    argOptions: ["off", "low", "medium", "high"],
  },
  {
    name: "verbose",
    description: "切换详细模式",
    args: "<on|off|full>",
    icon: "terminal",
    category: "model",
    executeLocal: true,
    argOptions: ["on", "off", "full"],
  },
  {
    name: "fast",
    description: "切换快速模式",
    args: "<status|on|off>",
    icon: "zap",
    category: "model",
    executeLocal: true,
    argOptions: ["status", "on", "off"],
  },

  // ── Tools ──
  {
    name: "help",
    description: "显示可用命令",
    icon: "book",
    category: "tools",
    executeLocal: true,
  },
  {
    name: "status",
    description: "显示会话状态",
    icon: "barChart",
    category: "tools",
  },
  {
    name: "export",
    description: "导出会话为 Markdown",
    icon: "download",
    category: "tools",
    executeLocal: true,
  },
  {
    name: "usage",
    description: "显示令牌用量",
    icon: "barChart",
    category: "tools",
    executeLocal: true,
  },

  // ── Agents ──
  {
    name: "agents",
    description: "列出代理",
    icon: "monitor",
    category: "agents",
    executeLocal: true,
  },
  {
    name: "kill",
    description: "终止子代理",
    args: "<id|all>",
    icon: "x",
    category: "agents",
    executeLocal: true,
  },
  {
    name: "skill",
    description: "运行技能",
    args: "<name>",
    icon: "zap",
    category: "tools",
  },
  {
    name: "steer",
    description: "引导子代理",
    args: "<id> <msg>",
    icon: "send",
    category: "agents",
  },
];

const CATEGORY_ORDER: SlashCommandCategory[] = ["session", "model", "tools", "agents"];

export const CATEGORY_LABELS: Record<SlashCommandCategory, string> = {
  session: "会话",
  model: "模型",
  agents: "代理",
  tools: "工具",
};

export function getSlashCommandCompletions(filter: string): SlashCommandDef[] {
  const lower = filter.toLowerCase();
  const commands = lower
    ? SLASH_COMMANDS.filter(
        (cmd) => cmd.name.startsWith(lower) || cmd.description.toLowerCase().includes(lower),
      )
    : SLASH_COMMANDS;
  return commands.toSorted((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.category ?? "session");
    const bi = CATEGORY_ORDER.indexOf(b.category ?? "session");
    if (ai !== bi) {
      return ai - bi;
    }
    // Exact prefix matches first
    if (lower) {
      const aExact = a.name.startsWith(lower) ? 0 : 1;
      const bExact = b.name.startsWith(lower) ? 0 : 1;
      if (aExact !== bExact) {
        return aExact - bExact;
      }
    }
    return 0;
  });
}

export type ParsedSlashCommand = {
  command: SlashCommandDef;
  args: string;
};

/**
 * Parse a message as a slash command. Returns null if it doesn't match.
 * Supports `/command`, `/command args...`, and `/command: args...`.
 */
export function parseSlashCommand(text: string): ParsedSlashCommand | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("/")) {
    return null;
  }

  const body = trimmed.slice(1);
  const firstSeparator = body.search(/[\s:]/u);
  const name = firstSeparator === -1 ? body : body.slice(0, firstSeparator);
  let remainder = firstSeparator === -1 ? "" : body.slice(firstSeparator).trimStart();
  if (remainder.startsWith(":")) {
    remainder = remainder.slice(1).trimStart();
  }
  const args = remainder.trim();

  if (!name) {
    return null;
  }

  const command = SLASH_COMMANDS.find((cmd) => cmd.name === name.toLowerCase());
  if (!command) {
    return null;
  }

  return { command, args };
}
