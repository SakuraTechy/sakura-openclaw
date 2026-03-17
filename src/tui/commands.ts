import type { SlashCommand } from "@mariozechner/pi-tui";
import { listChatCommands, listChatCommandsForConfig } from "../auto-reply/commands-registry.js";
import { formatThinkingLevels, listThinkingLevelLabels } from "../auto-reply/thinking.js";
import type { OpenClawConfig } from "../config/types.js";

const VERBOSE_LEVELS = ["on", "off"];
const FAST_LEVELS = ["status", "on", "off"];
const REASONING_LEVELS = ["on", "off"];
const ELEVATED_LEVELS = ["on", "off", "ask", "full"];
const ACTIVATION_LEVELS = ["mention", "always"];
const USAGE_FOOTER_LEVELS = ["off", "tokens", "full"];

export type ParsedCommand = {
  name: string;
  args: string;
};

export type SlashCommandOptions = {
  cfg?: OpenClawConfig;
  provider?: string;
  model?: string;
};

const COMMAND_ALIASES: Record<string, string> = {
  elev: "elevated",
};

function createLevelCompletion(
  levels: string[],
): NonNullable<SlashCommand["getArgumentCompletions"]> {
  return (prefix) =>
    levels
      .filter((value) => value.startsWith(prefix.toLowerCase()))
      .map((value) => ({
        value,
        label: value,
      }));
}

export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.replace(/^\//, "").trim();
  if (!trimmed) {
    return { name: "", args: "" };
  }
  const [name, ...rest] = trimmed.split(/\s+/);
  const normalized = name.toLowerCase();
  return {
    name: COMMAND_ALIASES[normalized] ?? normalized,
    args: rest.join(" ").trim(),
  };
}

export function getSlashCommands(options: SlashCommandOptions = {}): SlashCommand[] {
  const thinkLevels = listThinkingLevelLabels(options.provider, options.model);
  const verboseCompletions = createLevelCompletion(VERBOSE_LEVELS);
  const fastCompletions = createLevelCompletion(FAST_LEVELS);
  const reasoningCompletions = createLevelCompletion(REASONING_LEVELS);
  const usageCompletions = createLevelCompletion(USAGE_FOOTER_LEVELS);
  const elevatedCompletions = createLevelCompletion(ELEVATED_LEVELS);
  const activationCompletions = createLevelCompletion(ACTIVATION_LEVELS);
  const commands: SlashCommand[] = [
    { name: "help", description: "显示斜杠命令帮助" },
    { name: "status", description: "显示网关状态摘要" },
    { name: "agent", description: "切换 Agent（或打开选择器）" },
    { name: "agents", description: "打开 Agent 选择器" },
    { name: "session", description: "切换会话（或打开选择器）" },
    { name: "sessions", description: "打开会话选择器" },
    {
      name: "model",
      description: "设置模型（或打开选择器）",
    },
    { name: "models", description: "打开模型选择器" },
    {
      name: "think",
      description: "设置思考等级",
      getArgumentCompletions: (prefix) =>
        thinkLevels
          .filter((v) => v.startsWith(prefix.toLowerCase()))
          .map((value) => ({ value, label: value })),
    },
    {
      name: "fast",
      description: "Set fast mode on/off",
      getArgumentCompletions: fastCompletions,
    },
    {
      name: "verbose",
      description: "开关详细模式",
      getArgumentCompletions: verboseCompletions,
    },
    {
      name: "reasoning",
      description: "开关思维链显示",
      getArgumentCompletions: reasoningCompletions,
    },
    {
      name: "usage",
      description: "切换每条回复的用量显示",
      getArgumentCompletions: usageCompletions,
    },
    {
      name: "elevated",
      description: "设置提权级别 on/off/ask/full",
      getArgumentCompletions: elevatedCompletions,
    },
    {
      name: "elev",
      description: "/elevated 的别名",
      getArgumentCompletions: elevatedCompletions,
    },
    {
      name: "activation",
      description: "设置群组激活模式",
      getArgumentCompletions: activationCompletions,
    },
    { name: "abort", description: "中止当前运行" },
    { name: "new", description: "重置会话" },
    { name: "reset", description: "重置会话" },
    { name: "settings", description: "打开设置" },
    { name: "exit", description: "退出 TUI" },
    { name: "quit", description: "退出 TUI" },
  ];

  const seen = new Set(commands.map((command) => command.name));
  const gatewayCommands = options.cfg ? listChatCommandsForConfig(options.cfg) : listChatCommands();
  for (const command of gatewayCommands) {
    const aliases = command.textAliases.length > 0 ? command.textAliases : [`/${command.key}`];
    for (const alias of aliases) {
      const name = alias.replace(/^\//, "").trim();
      if (!name || seen.has(name)) {
        continue;
      }
      seen.add(name);
      commands.push({ name, description: command.description });
    }
  }

  return commands;
}

export function helpText(options: SlashCommandOptions = {}): string {
  const thinkLevels = formatThinkingLevels(options.provider, options.model, "|");
  return [
    "斜杠命令列表：",
    "/help",
    "/commands",
    "/status",
    "/agent <id> (or /agents)",
    "/session <key> (or /sessions)",
    "/model <provider/model> (or /models)",
    `/think <${thinkLevels}>`,
    "/fast <status|on|off>",
    "/verbose <on|off>",
    "/reasoning <on|off>",
    "/usage <off|tokens|full>",
    "/elevated <on|off|ask|full>",
    "/elev <on|off|ask|full>",
    "/activation <mention|always>",
    "/new or /reset",
    "/abort",
    "/settings",
    "/exit",
  ].join("\n");
}
