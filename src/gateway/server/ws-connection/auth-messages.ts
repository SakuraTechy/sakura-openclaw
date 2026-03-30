import { isGatewayCliClient, isWebchatClient } from "../../../utils/message-channel.js";
import type { ResolvedGatewayAuth } from "../../auth.js";
import { GATEWAY_CLIENT_IDS } from "../../protocol/client-info.js";

export type AuthProvidedKind = "token" | "bootstrap-token" | "device-token" | "password" | "none";

export function formatGatewayAuthFailureMessage(params: {
  authMode: ResolvedGatewayAuth["mode"];
  authProvided: AuthProvidedKind;
  reason?: string;
  client?: { id?: string | null; mode?: string | null };
}): string {
  const { authMode, authProvided, reason, client } = params;
  const isCli = isGatewayCliClient(client);
  const isControlUi = client?.id === GATEWAY_CLIENT_IDS.CONTROL_UI;
  const isWebchat = isWebchatClient(client);
  const uiHint = "打开仪表盘 URL 并在控制面板设置中粘贴令牌";
  const tokenHint = isCli
    ? "设置 gateway.remote.token 以匹配 gateway.auth.token"
    : isControlUi || isWebchat
      ? uiHint
      : "提供网关认证令牌";
  const passwordHint = isCli
    ? "设置 gateway.remote.password 以匹配 gateway.auth.password"
    : isControlUi || isWebchat
      ? "在控制面板设置中输入密码"
      : "提供网关认证密码";
  switch (reason) {
    case "token_missing":
      return `未授权：缺少网关令牌（${tokenHint}）`;
    case "token_mismatch":
      return `未授权：网关令牌不匹配（${tokenHint}）`;
    case "token_missing_config":
      return "未授权：网关未配置令牌（请设置 gateway.auth.token）";
    case "password_missing":
      return `未授权：缺少网关密码（${passwordHint}）`;
    case "password_mismatch":
      return `未授权：网关密码不匹配（${passwordHint}）`;
    case "password_missing_config":
      return "未授权：网关未配置密码（请设置 gateway.auth.password）";
    case "bootstrap_token_invalid":
      return "未授权：引导令牌无效或已过期（请扫描新的设置码）";
    case "tailscale_user_missing":
      return "未授权：缺少 Tailscale 身份（请使用 Tailscale Serve 认证或网关令牌/密码）";
    case "tailscale_proxy_missing":
      return "未授权：缺少 Tailscale 代理头（请使用 Tailscale Serve 或网关令牌/密码）";
    case "tailscale_whois_failed":
      return "未授权：Tailscale 身份验证失败（请使用 Tailscale Serve 认证或网关令牌/密码）";
    case "tailscale_user_mismatch":
      return "未授权：Tailscale 身份不匹配（请使用 Tailscale Serve 认证或网关令牌/密码）";
    case "rate_limited":
      return "未授权：认证失败次数过多（请稍后重试）";
    case "device_token_mismatch":
      return "未授权：设备令牌不匹配（请轮换/重新签发设备令牌）";
    default:
      break;
  }

  if (authMode === "token" && authProvided === "none") {
    return `未授权：缺少网关令牌（${tokenHint}）`;
  }
  if (authMode === "token" && authProvided === "device-token") {
    return "未授权：设备令牌被拒绝（请配对/重新配对此设备，或提供网关令牌）";
  }
  if (authProvided === "bootstrap-token") {
    return "未授权：引导令牌无效或已过期（请扫描新的设置码）";
  }
  if (authMode === "password" && authProvided === "none") {
    return `未授权：缺少网关密码（${passwordHint}）`;
  }
  return "未授权";
}
