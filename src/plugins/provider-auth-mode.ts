import type { WizardPrompter } from "../wizard/prompts.js";
import type { SecretInputMode } from "./provider-auth-types.js";

export type SecretInputModePromptCopy = {
  modeMessage?: string;
  plaintextLabel?: string;
  plaintextHint?: string;
  refLabel?: string;
  refHint?: string;
};

export async function resolveSecretInputModeForEnvSelection(params: {
  prompter: Pick<WizardPrompter, "select">;
  explicitMode?: SecretInputMode;
  copy?: SecretInputModePromptCopy;
}): Promise<SecretInputMode> {
  if (params.explicitMode) {
    return params.explicitMode;
  }
  if (typeof params.prompter.select !== "function") {
    return "plaintext";
  }
  const selected = await params.prompter.select<SecretInputMode>({
    message: params.copy?.modeMessage ?? "你想如何提供此 API 密钥？",
    initialValue: "plaintext",
    options: [
      {
        value: "plaintext",
        label: params.copy?.plaintextLabel ?? "直接粘贴 API 密钥",
        hint: params.copy?.plaintextHint ?? "将密钥直接存储在 OpenClaw 配置中",
      },
      {
        value: "ref",
        label: params.copy?.refLabel ?? "使用外部密钥提供商",
        hint:
          params.copy?.refHint ??
          "Stores a reference to env or configured external secret providers",
      },
    ],
  });
  return selected === "ref" ? "ref" : "plaintext";
}
