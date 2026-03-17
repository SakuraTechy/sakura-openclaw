import type { OpenClawConfig } from "../config/config.js";
import { getTailnetHostname } from "../infra/tailscale.js";
import { isIpv6Address, parseCanonicalIpAddress } from "../shared/net/ip.js";

export const TAILSCALE_EXPOSURE_OPTIONS = [
  { value: "off", label: "Off", hint: "无 Tailscale 暴露" },
  {
    value: "serve",
    label: "Serve",
    hint: "Tailnet 私有 HTTPS (Tailscale 设备)",
  },
  {
    value: "funnel",
    label: "Funnel",
    hint: "通过 Tailscale Funnel 的公共 HTTPS (互联网)",
  },
] as const;

export const TAILSCALE_MISSING_BIN_NOTE_LINES = [
  "在 PATH 或 /Applications 中未找到 Tailscale 二进制文件。",
  "请确保已安装 Tailscale：",
  "  https://tailscale.com/download/mac",
  "",
  "您可以继续设置，但 serve/funnel 将在运行时失败。",
] as const;

export const TAILSCALE_DOCS_LINES = [
  "Docs:",
  "https://docs.openclaw.ai/gateway/tailscale",
  "https://docs.openclaw.ai/web",
] as const;

function normalizeTailnetHostForUrl(rawHost: string): string | null {
  const trimmed = rawHost.trim().replace(/\.$/, "");
  if (!trimmed) {
    return null;
  }
  const parsed = parseCanonicalIpAddress(trimmed);
  if (parsed && isIpv6Address(parsed)) {
    return `[${parsed.toString().toLowerCase()}]`;
  }
  return trimmed;
}

export function buildTailnetHttpsOrigin(rawHost: string): string | null {
  const normalizedHost = normalizeTailnetHostForUrl(rawHost);
  if (!normalizedHost) {
    return null;
  }
  try {
    return new URL(`https://${normalizedHost}`).origin;
  } catch {
    return null;
  }
}

export function appendAllowedOrigin(existing: string[] | undefined, origin: string): string[] {
  const current = existing ?? [];
  const normalized = origin.toLowerCase();
  if (current.some((entry) => entry.toLowerCase() === normalized)) {
    return current;
  }
  return [...current, origin];
}

export async function maybeAddTailnetOriginToControlUiAllowedOrigins(params: {
  config: OpenClawConfig;
  tailscaleMode: string;
  tailscaleBin?: string | null;
}): Promise<OpenClawConfig> {
  if (params.tailscaleMode !== "serve" && params.tailscaleMode !== "funnel") {
    return params.config;
  }
  const tsOrigin = await getTailnetHostname(undefined, params.tailscaleBin ?? undefined)
    .then((host) => buildTailnetHttpsOrigin(host))
    .catch(() => null);
  if (!tsOrigin) {
    return params.config;
  }

  const existing = params.config.gateway?.controlUi?.allowedOrigins ?? [];
  const updatedOrigins = appendAllowedOrigin(existing, tsOrigin);
  return {
    ...params.config,
    gateway: {
      ...params.config.gateway,
      controlUi: {
        ...params.config.gateway?.controlUi,
        allowedOrigins: updatedOrigins,
      },
    },
  };
}
