import { getSessionBindingService } from "../../../infra/outbound/session-binding-service.js";
import type { CommandHandlerResult } from "../commands-types.js";
import { resolveConversationBindingContextFromAcpCommand } from "../conversation-binding-input.js";
import { type SubagentsCommandContext, stopWithText } from "./shared.js";

export async function handleSubagentsUnfocusAction(
  ctx: SubagentsCommandContext,
): Promise<CommandHandlerResult> {
  const { params } = ctx;
  const bindingService = getSessionBindingService();
  const bindingContext = resolveConversationBindingContextFromAcpCommand(params);
  if (!bindingContext) {
    return stopWithText("⚠️ /unfocus 必须在已聚焦的对话中运行。");
  }

  const binding = bindingService.resolveByConversation({
    channel: bindingContext.channel,
    accountId: bindingContext.accountId,
    conversationId: bindingContext.conversationId,
    ...(bindingContext.parentConversationId &&
    bindingContext.parentConversationId !== bindingContext.conversationId
      ? { parentConversationId: bindingContext.parentConversationId }
      : {}),
  });
  if (!binding) {
    return stopWithText("ℹ️ 此对话当前未聚焦。");
  }

  const senderId = params.command.senderId?.trim() || "";
  const boundBy =
    typeof binding.metadata?.boundBy === "string" ? binding.metadata.boundBy.trim() : "";
  if (boundBy && boundBy !== "system" && senderId && senderId !== boundBy) {
    return stopWithText(`⚠️ 只有 ${boundBy} 可以取消聚焦此对话。`);
  }

  await bindingService.unbind({
    bindingId: binding.bindingId,
    reason: "manual",
  });
  return stopWithText("✅ 对话已取消聚焦。");
}
