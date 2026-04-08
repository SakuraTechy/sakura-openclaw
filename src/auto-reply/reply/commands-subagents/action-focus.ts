import {
  resolveAcpSessionCwd,
  resolveAcpThreadSessionDetailLines,
} from "../../../acp/runtime/session-identifiers.js";
import { readAcpSessionEntry } from "../../../acp/runtime/session-meta.js";
import { normalizeChatType } from "../../../channels/chat-type.js";
import {
  resolveThreadBindingIntroText,
  resolveThreadBindingThreadName,
} from "../../../channels/thread-bindings-messages.js";
import {
  formatThreadBindingDisabledError,
  formatThreadBindingSpawnDisabledError,
  resolveThreadBindingIdleTimeoutMsForChannel,
  resolveThreadBindingMaxAgeMsForChannel,
  resolveThreadBindingPlacementForCurrentContext,
  resolveThreadBindingSpawnPolicy,
} from "../../../channels/thread-bindings-policy.js";
import { getSessionBindingService } from "../../../infra/outbound/session-binding-service.js";
import type { CommandHandlerResult } from "../commands-types.js";
import { resolveConversationBindingContextFromAcpCommand } from "../conversation-binding-input.js";
import { type SubagentsCommandContext, resolveFocusTargetSession, stopWithText } from "./shared.js";

type FocusBindingContext = {
  channel: string;
  accountId: string;
  conversationId: string;
  parentConversationId?: string;
  placement: "current" | "child";
};

function resolveFocusBindingContext(
  params: SubagentsCommandContext["params"],
): FocusBindingContext | null {
  const bindingContext = resolveConversationBindingContextFromAcpCommand(params);
  if (!bindingContext) {
    return null;
  }
  const chatType = normalizeChatType(params.ctx.ChatType);
  return {
    channel: bindingContext.channel,
    accountId: bindingContext.accountId,
    conversationId: bindingContext.conversationId,
    ...(bindingContext.parentConversationId
      ? { parentConversationId: bindingContext.parentConversationId }
      : {}),
    placement:
      chatType === "direct"
        ? "current"
        : resolveThreadBindingPlacementForCurrentContext({
            channel: bindingContext.channel,
            threadId: bindingContext.threadId || undefined,
          }),
  };
}

export async function handleSubagentsFocusAction(
  ctx: SubagentsCommandContext,
): Promise<CommandHandlerResult> {
  const { params, runs, restTokens } = ctx;
  const token = restTokens.join(" ").trim();
  if (!token) {
    return stopWithText("用法：/focus <子代理标签|会话键|会话ID|会话标签>");
  }

  const bindingContext = resolveFocusBindingContext(params);
  if (!bindingContext) {
    return stopWithText("⚠️ /focus must be run inside a bindable conversation.");
  }

  const bindingService = getSessionBindingService();
  const capabilities = bindingService.getCapabilities({
    channel: bindingContext.channel,
    accountId: bindingContext.accountId,
  });
  if (!capabilities.adapterAvailable || !capabilities.bindSupported) {
    return stopWithText("⚠️ 此账户不支持对话绑定。");
  }

  const focusTarget = await resolveFocusTargetSession({ runs, token });
  if (!focusTarget) {
    return stopWithText(`⚠️ Unable to resolve focus target: ${token}`);
  }

  if (bindingContext.placement === "child") {
    const spawnPolicy = resolveThreadBindingSpawnPolicy({
      cfg: params.cfg,
      channel: bindingContext.channel,
      accountId: bindingContext.accountId,
      kind: "subagent",
    });
    if (!spawnPolicy.enabled) {
      return stopWithText(
        `⚠️ ${formatThreadBindingDisabledError({
          channel: spawnPolicy.channel,
          accountId: spawnPolicy.accountId,
          kind: "subagent",
        })}`,
      );
    }
    if (bindingContext.placement === "child" && !spawnPolicy.spawnEnabled) {
      return stopWithText(
        `⚠️ ${formatThreadBindingSpawnDisabledError({
          channel: spawnPolicy.channel,
          accountId: spawnPolicy.accountId,
          kind: "subagent",
        })}`,
      );
    }
  }

  const senderId = params.command.senderId?.trim() || "";
  const existingBinding = bindingService.resolveByConversation({
    channel: bindingContext.channel,
    accountId: bindingContext.accountId,
    conversationId: bindingContext.conversationId,
    ...(bindingContext.parentConversationId &&
    bindingContext.parentConversationId !== bindingContext.conversationId
      ? { parentConversationId: bindingContext.parentConversationId }
      : {}),
  });
  const boundBy =
    typeof existingBinding?.metadata?.boundBy === "string"
      ? existingBinding.metadata.boundBy.trim()
      : "";
  if (existingBinding && boundBy && boundBy !== "system" && senderId && senderId !== boundBy) {
    return stopWithText(`⚠️ 只有 ${boundBy} 可以重新聚焦此对话。`);
  }

  const label = focusTarget.label || token;
  const accountId = bindingContext.accountId;
  const acpMeta =
    focusTarget.targetKind === "acp"
      ? readAcpSessionEntry({
          cfg: params.cfg,
          sessionKey: focusTarget.targetSessionKey,
        })?.acp
      : undefined;
  if (!capabilities.placements.includes(bindingContext.placement)) {
    return stopWithText("⚠️ 此账户不支持对话绑定。");
  }

  let binding;
  try {
    binding = await bindingService.bind({
      targetSessionKey: focusTarget.targetSessionKey,
      targetKind: focusTarget.targetKind === "acp" ? "session" : "subagent",
      conversation: {
        channel: bindingContext.channel,
        accountId: bindingContext.accountId,
        conversationId: bindingContext.conversationId,
        ...(bindingContext.parentConversationId &&
        bindingContext.parentConversationId !== bindingContext.conversationId
          ? { parentConversationId: bindingContext.parentConversationId }
          : {}),
      },
      placement: bindingContext.placement,
      metadata: {
        threadName: resolveThreadBindingThreadName({
          agentId: focusTarget.agentId,
          label,
        }),
        agentId: focusTarget.agentId,
        label,
        boundBy: senderId || "unknown",
        introText: resolveThreadBindingIntroText({
          agentId: focusTarget.agentId,
          label,
          idleTimeoutMs: resolveThreadBindingIdleTimeoutMsForChannel({
            cfg: params.cfg,
            channel: bindingContext.channel,
            accountId,
          }),
          maxAgeMs: resolveThreadBindingMaxAgeMsForChannel({
            cfg: params.cfg,
            channel: bindingContext.channel,
            accountId,
          }),
          sessionCwd: focusTarget.targetKind === "acp" ? resolveAcpSessionCwd(acpMeta) : undefined,
          sessionDetails:
            focusTarget.targetKind === "acp"
              ? resolveAcpThreadSessionDetailLines({
                  sessionKey: focusTarget.targetSessionKey,
                  meta: acpMeta,
                })
              : [],
        }),
      },
    });
  } catch {
    return stopWithText("⚠️ 无法将此对话绑定到目标会话。");
  }

  const actionText =
    bindingContext.placement === "child"
      ? `创建了子对话 ${binding.conversation.conversationId} 并绑定到 ${binding.targetSessionKey}`
      : `已将此对话绑定到 ${binding.targetSessionKey}`;
  return stopWithText(`✅ ${actionText} (${focusTarget.targetKind}).`);
}
