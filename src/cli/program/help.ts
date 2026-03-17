import type { Command } from "commander";
import { resolveCommitHash } from "../../infra/git-commit.js";
import { formatDocsLink } from "../../terminal/links.js";
import { isRich, theme } from "../../terminal/theme.js";
import { escapeRegExp } from "../../utils.js";
import { hasFlag, hasRootVersionAlias } from "../argv.js";
import { formatCliBannerLine, hasEmittedCliBanner } from "../banner.js";
import { replaceCliName, resolveCliName } from "../cli-name.js";
import { CLI_LOG_LEVEL_VALUES, parseCliLogLevelOption } from "../log-level-option.js";
import type { ProgramContext } from "./context.js";
import { getCoreCliCommandsWithSubcommands } from "./core-command-descriptors.js";
import { getSubCliCommandsWithSubcommands } from "./subcli-descriptors.js";

const CLI_NAME = resolveCliName();
const CLI_NAME_PATTERN = escapeRegExp(CLI_NAME);
const ROOT_COMMANDS_WITH_SUBCOMMANDS = new Set([
  ...getCoreCliCommandsWithSubcommands(),
  ...getSubCliCommandsWithSubcommands(),
]);
const ROOT_COMMANDS_HINT =
  "Hint: commands suffixed with * have subcommands. Run <command> --help for details.";

const EXAMPLES = [
  ["openclaw models --help", "Show detailed help for the models command."],
  [
    "openclaw channels login --verbose",
    "关联个人 WhatsApp Web 并显示二维码和连接日志。",
  ],
  [
    'openclaw message send --target +15555550123 --message "Hi" --json',
    "通过你的 Web 会话发送并打印 JSON 结果。",
  ],
  ["openclaw gateway --port 18789", "在本地运行 WebSocket 网关。"],
  ["openclaw --dev gateway", "在 ws://127.0.0.1:19001 上运行开发网关（隔离状态/配置）。"],
  ["openclaw gateway --force", "终止占用默认网关端口的进程，然后启动网关。"],
  ["openclaw gateway ...", "通过 WebSocket 控制网关。"],
  [
    'openclaw agent --to +15555550123 --message "Run summary" --deliver',
    "通过网关直接与 AI 助手对话；可选发送 WhatsApp 回复。",
  ],
  [
    'openclaw message send --channel telegram --target @mychat --message "Hi"',
    "通过你的 Telegram 机器人发送。",
  ],
] as const;

export function configureProgramHelp(program: Command, ctx: ProgramContext) {
  program
    .name(CLI_NAME)
    .description("")
    .version(ctx.programVersion)
    .option(
      "--dev",
      "开发配置：在 ~/.openclaw-dev 下隔离状态，默认网关端口 19001，并移动派生端口（浏览器/画布）",
    )
    .option(
      "--profile <name>",
      "使用命名配置文件（在 ~/.openclaw-<name> 下隔离状态和配置）",
    )
    .option(
      "--log-level <level>",
      `全局日志级别覆盖，适用于文件和控制台 (${CLI_LOG_LEVEL_VALUES})`,
      parseCliLogLevelOption,
    );

  program.option("--no-color", "禁用 ANSI 颜色", false);
  program.helpOption("-h, --help", "Display help for command");
  program.helpCommand("help [command]", "Display help for command");

  program.configureHelp({
    // sort options and subcommands alphabetically
    sortSubcommands: true,
    sortOptions: true,
    optionTerm: (option) => theme.option(option.flags),
    subcommandTerm: (cmd) => {
      const isRootCommand = cmd.parent === program;
      const hasSubcommands = isRootCommand && ROOT_COMMANDS_WITH_SUBCOMMANDS.has(cmd.name());
      return theme.command(hasSubcommands ? `${cmd.name()} *` : cmd.name());
    },
  });

  const formatHelpOutput = (str: string) => {
    let output = str;
    const isRootHelp = new RegExp(
      `^Usage:\\s+${CLI_NAME_PATTERN}\\s+\\[options\\]\\s+\\[command\\]\\s*$`,
      "m",
    ).test(output);
    if (isRootHelp && /^Commands:/m.test(output)) {
      output = output.replace(/^Commands:/m, `Commands:\n  ${theme.muted(ROOT_COMMANDS_HINT)}`);
    }

    return output
      .replace(/^Usage:/gm, theme.heading("Usage:"))
      .replace(/^Options:/gm, theme.heading("Options:"))
      .replace(/^Commands:/gm, theme.heading("Commands:"));
  };

  program.configureOutput({
    writeOut: (str) => {
      process.stdout.write(formatHelpOutput(str));
    },
    writeErr: (str) => {
      process.stderr.write(formatHelpOutput(str));
    },
    outputError: (str, write) => write(theme.error(str)),
  });

  if (
    hasFlag(process.argv, "-V") ||
    hasFlag(process.argv, "--version") ||
    hasRootVersionAlias(process.argv)
  ) {
    const commit = resolveCommitHash({ moduleUrl: import.meta.url });
    console.log(
      commit ? `OpenClaw ${ctx.programVersion} (${commit})` : `OpenClaw ${ctx.programVersion}`,
    );
    process.exit(0);
  }

  program.addHelpText("beforeAll", () => {
    if (hasEmittedCliBanner()) {
      return "";
    }
    const rich = isRich();
    const line = formatCliBannerLine(ctx.programVersion, { richTty: rich });
    return `\n${line}\n`;
  });

  const fmtExamples = EXAMPLES.map(
    ([cmd, desc]) => `  ${theme.command(replaceCliName(cmd, CLI_NAME))}\n    ${theme.muted(desc)}`,
  ).join("\n");

  program.addHelpText("afterAll", ({ command }) => {
    if (command !== program) {
      return "";
    }
    const docs = formatDocsLink("/cli", "docs.openclaw.ai/cli");
    return `\n${theme.heading("示例：")}\n${fmtExamples}\n\n${theme.muted("文档：")} ${docs}\n${theme.muted("汉化版：")} ${theme.info("https://openclaw.qt.cool/")}\n`;
  });
}
