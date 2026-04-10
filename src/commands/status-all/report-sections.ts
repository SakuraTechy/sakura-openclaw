import type { RenderTableOptions, TableColumn } from "../../terminal/table.js";
import { buildStatusChannelsTableRows, statusChannelsTableColumns } from "./channels-table.js";
import {
  buildStatusAgentTableRows,
  buildStatusChannelDetailSections,
  statusAgentsTableColumns,
  statusOverviewTableColumns,
} from "./report-tables.js";
import type { StatusReportSection } from "./text-report.js";

type TableRenderer = (input: RenderTableOptions) => string;

export function buildStatusOverviewSection(params: {
  width: number;
  renderTable: TableRenderer;
  rows: Array<{ Item: string; Value: string }>;
}): StatusReportSection {
  return {
    kind: "table",
    title: "概览",
    width: params.width,
    renderTable: params.renderTable,
    columns: [...statusOverviewTableColumns],
    rows: params.rows,
  };
}

export function buildStatusChannelsSection(params: {
  width: number;
  renderTable: TableRenderer;
  rows: Array<{
    id: string;
    label: string;
    enabled: boolean;
    state: "ok" | "warn" | "off" | "setup";
    detail: string;
  }>;
  channelIssues: Array<{
    channel: string;
    message: string;
  }>;
  ok: (text: string) => string;
  warn: (text: string) => string;
  muted: (text: string) => string;
  accentDim: (text: string) => string;
  formatIssueMessage?: (message: string) => string;
}): StatusReportSection {
  return {
    kind: "table",
    title: "通道",
    width: params.width,
    renderTable: params.renderTable,
    columns: statusChannelsTableColumns.map((column) =>
      column.key === "Detail" ? { ...column, minWidth: 28 } : column,
    ),
    rows: buildStatusChannelsTableRows({
      rows: params.rows,
      channelIssues: params.channelIssues,
      ok: params.ok,
      warn: params.warn,
      muted: params.muted,
      accentDim: params.accentDim,
      formatIssueMessage: params.formatIssueMessage,
    }),
  } as StatusReportSection;
}

export function buildStatusChannelsTableSection(params: {
  width: number;
  renderTable: TableRenderer;
  columns: readonly TableColumn[];
  rows: Array<Record<string, string>>;
}): StatusReportSection {
  return {
    kind: "table",
    title: "通道",
    width: params.width,
    renderTable: params.renderTable,
    columns: [...params.columns],
    rows: params.rows,
  };
}

export function buildStatusChannelDetailsSections(params: {
  details: Array<{
    title: string;
    columns: string[];
    rows: Array<Record<string, string>>;
  }>;
  width: number;
  renderTable: TableRenderer;
  ok: (text: string) => string;
  warn: (text: string) => string;
}): StatusReportSection[] {
  return buildStatusChannelDetailSections({
    details: params.details,
    width: params.width,
    renderTable: params.renderTable,
    ok: params.ok,
    warn: params.warn,
  });
}

export function buildStatusAgentsSection(params: {
  width: number;
  renderTable: TableRenderer;
  agentStatus: {
    agents: Array<{
      id: string;
      name?: string | null;
      bootstrapPending?: boolean | null;
      sessionsCount: number;
      lastActiveAgeMs?: number | null;
      sessionsPath: string;
    }>;
  };
  ok: (text: string) => string;
  warn: (text: string) => string;
}): StatusReportSection {
  return {
    kind: "table",
    title: "Agents",
    width: params.width,
    renderTable: params.renderTable,
    columns: [...statusAgentsTableColumns],
    rows: buildStatusAgentTableRows({
      agentStatus: params.agentStatus,
      ok: params.ok,
      warn: params.warn,
    }),
  };
}

export function buildStatusSessionsSection(params: {
  width: number;
  renderTable: TableRenderer;
  columns: readonly TableColumn[];
  rows: Array<Record<string, string>>;
}): StatusReportSection {
  return {
    kind: "table",
    title: "会话",
    width: params.width,
    renderTable: params.renderTable,
    columns: [...params.columns],
    rows: params.rows,
  };
}

export function buildStatusSystemEventsSection(params: {
  width: number;
  renderTable: TableRenderer;
  rows?: Array<Record<string, string>>;
  trailer?: string | null;
}): StatusReportSection {
  return {
    kind: "table",
    title: "系统事件",
    width: params.width,
    renderTable: params.renderTable,
    columns: [{ key: "Event", header: "Event", flex: true, minWidth: 24 }],
    rows: params.rows ?? [],
    trailer: params.trailer,
    skipIfEmpty: true,
  };
}

export function buildStatusHealthSection(params: {
  width: number;
  renderTable: TableRenderer;
  columns?: readonly TableColumn[];
  rows?: Array<Record<string, string>>;
}): StatusReportSection {
  return {
    kind: "table",
    title: "健康状态",
    width: params.width,
    renderTable: params.renderTable,
    columns: [...(params.columns ?? [])],
    rows: params.rows ?? [],
    skipIfEmpty: true,
  };
}

export function buildStatusUsageSection(params: { usageLines?: string[] }): StatusReportSection {
  return {
    kind: "lines",
    title: "用量统计",
    body: params.usageLines ?? [],
    skipIfEmpty: true,
  };
}
