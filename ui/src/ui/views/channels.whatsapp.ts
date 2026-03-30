import { html, nothing } from "lit";
import { formatRelativeTimestamp, formatDurationHuman } from "../format.ts";
import type { WhatsAppStatus } from "../types.ts";
import { renderChannelConfigSection } from "./channels.config.ts";
import {
  formatNullableBoolean,
  renderSingleAccountChannelCard,
  resolveChannelConfigured,
} from "./channels.shared.ts";
import type { ChannelsProps } from "./channels.types.ts";

export function renderWhatsAppCard(params: {
  props: ChannelsProps;
  whatsapp?: WhatsAppStatus;
  accountCountLabel: unknown;
}) {
  const { props, whatsapp, accountCountLabel } = params;
  const configured = resolveChannelConfigured("whatsapp", props);

  return renderSingleAccountChannelCard({
    title: "WhatsApp",
    subtitle: "连接 WhatsApp Web 并监控连接健康状态。",
    accountCountLabel,
    statusRows: [
      { label: "已配置", value: formatNullableBoolean(configured) },
      { label: "已链接", value: whatsapp?.linked ? "Yes" : "No" },
      { label: "运行中", value: whatsapp?.running ? "Yes" : "No" },
      { label: "已连接", value: whatsapp?.connected ? "Yes" : "No" },
      {
        label: "最后连接",
        value: whatsapp?.lastConnectedAt
          ? formatRelativeTimestamp(whatsapp.lastConnectedAt)
          : "n/a",
      },
      {
        label: "最后消息",
        value: whatsapp?.lastMessageAt ? formatRelativeTimestamp(whatsapp.lastMessageAt) : "n/a",
      },
      {
        label: "认证时长",
        value: whatsapp?.authAgeMs != null ? formatDurationHuman(whatsapp.authAgeMs) : "n/a",
      },
    ],
    lastError: whatsapp?.lastError,
    extraContent: html`
      ${
        props.whatsappMessage
          ? html`<div class="callout" style="margin-top: 12px;">
              ${props.whatsappMessage}
            </div>`
          : nothing
      }

      ${
        props.whatsappQrDataUrl
          ? html`<div class="qr-wrap">
              <img src=${props.whatsappQrDataUrl} alt="WhatsApp QR" />
            </div>`
          : nothing
      }
    `,
    configSection: renderChannelConfigSection({ channelId: "whatsapp", props }),
    footer: html`<div class="row" style="margin-top: 14px; flex-wrap: wrap;">
      <button
        class="btn primary"
        ?disabled=${props.whatsappBusy}
        @click=${() => props.onWhatsAppStart(false)}
      >
        ${props.whatsappBusy ? "处理中…" : "显示二维码"}
      </button>
      <button
        class="btn"
        ?disabled=${props.whatsappBusy}
        @click=${() => props.onWhatsAppStart(true)}
      >
        重新链接
      </button>
      <button
        class="btn"
        ?disabled=${props.whatsappBusy}
        @click=${() => props.onWhatsAppWait()}
      >
        等待扫描
      </button>
      <button
        class="btn danger"
        ?disabled=${props.whatsappBusy}
        @click=${() => props.onWhatsApp退出登录()}
      >
        退出登录
      </button>
      <button class="btn" @click=${() => props.on刷新(true)}>
        刷新
      </button>
    </div>`,
  });
}
