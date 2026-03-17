import { getSessionBindingService } from "../../../infra/outbound/session-binding-service.js";
import type { CommandHandlerResult } from "../commands-types.js";
import {
  type SubagentsCommandContext,
  isDiscordSurface,
  isTelegramSurface,
  resolveChannelAccountId,
  resolveCommandSurfaceChannel,
  resolveTelegramConversationId,
  stopWithText,
} from "./shared.js";

export async function handleSubagentsUnfocusAction(
  ctx: SubagentsCommandContext,
): Promise<CommandHandlerResult> {
  const { params } = ctx;
  const channel = resolveCommandSurfaceChannel(params);
  if (channel !== "discord" && channel !== "telegram") {
    return stopWithText("⚠️ /unfocus 仅在 Discord 和 Telegram 上可用。");
  }

  const accountId = resolveChannelAccountId(params);
  const bindingService = getSessionBindingService();

  const conversationId = (() => {
    if (isDiscordSurface(params)) {
      const threadId = params.ctx.MessageThreadId != null ? String(params.ctx.MessageThreadId) : "";
      return threadId.trim() || undefined;
    }
    if (isTelegramSurface(params)) {
      return resolveTelegramConversationId(params);
    }
    return undefined;
  })();

  if (!conversationId) {
    if (channel === "discord") {
      return stopWithText("⚠️ /unfocus 必须在 Discord 线程中运行。");
    }
    return stopWithText(
      "⚠️ /unfocus on Telegram requires a topic context in groups, or a direct-message conversation.",
    );
  }

  const binding = bindingService.resolveByConversation({
    channel,
    accountId,
    conversationId,
  });
  if (!binding) {
    return stopWithText(
      channel === "discord"
        ? "ℹ️ 此线程当前未聚焦。"
        : "ℹ️ This conversation is not currently focused.",
    );
  }

  const senderId = params.command.senderId?.trim() || "";
  const boundBy =
    typeof binding.metadata?.boundBy === "string" ? binding.metadata.boundBy.trim() : "";
  if (boundBy && boundBy !== "system" && senderId && senderId !== boundBy) {
    return stopWithText(
      channel === "discord"
        ? `⚠️ Only ${boundBy} can unfocus this thread.`
        : `⚠️ Only ${boundBy} can unfocus this conversation.`,
    );
  }

  await bindingService.unbind({
    bindingId: binding.bindingId,
    reason: "manual",
  });
  return stopWithText(
    channel === "discord" ? "✅ 线程已取消聚焦。" : "✅ Conversation unfocused.",
  );
}
