import { html, nothing } from "lit";
import { formatRelativeTimestamp } from "../format.ts";
import type { SignalStatus } from "../types.ts";
import { renderChannelConfigSection } from "./channels.config.ts";
import {
  formatNullableBoolean,
  renderSingleAccountChannelCard,
  resolveChannelConfigured,
} from "./channels.shared.ts";
import type { ChannelsProps } from "./channels.types.ts";

export function renderSignalCard(params: {
  props: ChannelsProps;
  signal?: SignalStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, signal, accountCountLabel } = params;
  const configured = resolveChannelConfigured("signal", props);

  return renderSingleAccountChannelCard({
    title: "Signal",
    subtitle: "signal-cli 状态和渠道配置。",
    accountCountLabel,
    statusRows: [
      { label: "已配置", value: formatNullableBoolean(configured) },
      { label: "运行中", value: signal?.running ? "Yes" : "No" },
      { label: "基础 URL", value: signal?.baseUrl ?? "n/a" },
      {
        label: "上次启动",
        value: signal?.lastStartAt ? formatRelativeTimestamp(signal.lastStartAt) : "n/a",
      },
      {
        label: "上次探测",
        value: signal?.lastProbeAt ? formatRelativeTimestamp(signal.lastProbeAt) : "n/a",
      },
    ],
    lastError: signal?.lastError,
    secondaryCallout: signal?.probe
      ? html`<div class="callout" style="margin-top: 12px;">
          探测 ${signal.probe.ok ? "成功" : "失败"} ·
          ${signal.probe.status ?? ""} ${signal.probe.error ?? ""}
        </div>`
      : nothing,
    configSection: renderChannelConfigSection({ channelId: "signal", props }),
    footer: html`<div class="row" style="margin-top: 12px;">
      <button class="btn" @click=${() => props.onRefresh(true)}>
        Probe
      </button>
    </div>`,
  });
}
