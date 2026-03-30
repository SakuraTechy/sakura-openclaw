import { formatCliCommand } from "../cli/command-format.js";
import {
  classifySystemdUnavailableDetail,
  type SystemdUnavailableKind,
} from "./systemd-unavailable.js";

type SystemdUnavailableHintOptions = {
  wsl?: boolean;
  kind?: SystemdUnavailableKind | null;
  container?: boolean;
};

export function isSystemdUnavailableDetail(detail?: string): boolean {
  return classifySystemdUnavailableDetail(detail) !== null;
}

function renderSystemdHeadlessServerHints(): string[] {
  return [
    "On a headless server (SSH/no desktop session): run `sudo loginctl enable-linger $(whoami)` to persist your systemd user session across logins.",
    "Also ensure XDG_RUNTIME_DIR is set: `export XDG_RUNTIME_DIR=/run/user/$(id -u)`, then retry.",
  ];
}

export function renderSystemdUnavailableHints(
  options: SystemdUnavailableHintOptions = {},
): string[] {
  if (options.wsl) {
    return [
      "WSL2 需要启用 systemd：编辑 /etc/wsl.conf 添加 [boot]\\nsystemd=true",
      "然后运行：wsl --shutdown（在 PowerShell 中）并重新打开你的发行版。",
      "验证：systemctl --user status",
    ];
  }
  return [
    "systemd 用户服务不可用；请安装/启用 systemd 或在你的进程管理器下运行网关。",
    ...(options.container || options.kind !== "user_bus_unavailable"
      ? []
      : renderSystemdHeadlessServerHints()),
    `如果你在容器中，请在前台运行网关而不是使用 \`${formatCliCommand("openclaw gateway")}\`。`,
  ];
}
