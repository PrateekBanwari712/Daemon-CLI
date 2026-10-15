import { fmt, truncate } from "../ui/format.js";
import { startSpinner, stopSpinner } from "../ui/spinner.js";


export type MessageHandlerOptions = {
    verbose?: boolean;
    model?: string;
};

// Define normalized message structures for Gemini stream events
export type GeminiSDKMessage = 
    | { type: "system"; subtype: "init"; model: string; sessionId: string }
    | { type: "assistant"; text?: string; functionCalls?: Array<{ name: string; args: any }> }
    | { type: "tool"; toolName: string; result?: string }
    | { type: "stream_event" }
    | { type: "result"; subtype: "success" | "error"; text?: string; usage?: any; error?: string };

export function normalizeGeminiMessage(message: unknown): GeminiSDKMessage | null {
    if (!message || typeof message !== "object") {
        return null;
    }

    const raw = message as Record<string, any>;
    if (typeof raw.type === "string") {
        return raw as GeminiSDKMessage;
    }

    const textFromParts = Array.isArray(raw.candidates)
        ? raw.candidates
              .flatMap((candidate: any) => candidate?.content?.parts ?? [])
              .filter((part: any) => typeof part?.text === "string")
              .map((part: any) => part.text)
              .join("")
        : "";

    const text = typeof raw.text === "string" ? raw.text : textFromParts || undefined;
    const functionCalls = Array.isArray(raw.functionCalls)
        ? raw.functionCalls.map((call: any) => ({
              name: String(call?.name ?? "unknown"),
              args: call?.args ?? {},
          }))
        : undefined;

    if (typeof text === "string" || functionCalls) {
        return {
            type: "assistant",
            text,
            functionCalls,
        };
    }

    if (raw.usageMetadata) {
        return {
            type: "result",
            subtype: "success",
            text: typeof raw.text === "string" ? raw.text : undefined,
            usage: raw.usageMetadata,
        };
    }

    return null;
}

export function handleMessage(message: unknown, options: MessageHandlerOptions = {}) {
    const { verbose = false } = options;
    const normalized = normalizeGeminiMessage(message);

    if (!normalized) {
        return;
    }

    if (verbose) {
        console.log(fmt.dim(`[${normalized.type}]`));
    }

    switch (normalized.type) {
        case "system": {
            if (normalized.subtype === "init") {
                startSpinner("Thinking...");
                console.log(
                    fmt.system(
                        `Session started · model: ${normalized.model} · id: ${normalized.sessionId.slice(0, 8)}…`
                    )
                );
            }
            break;
        }
        
        case "assistant": {
            if (normalized.text && normalized.text.trim()) {
                console.log(fmt.assistant(normalized.text.trim()));
            }

            if (normalized.functionCalls) {
                for (const call of normalized.functionCalls) {
                    console.log(fmt.tool(`  → ${call.name}`));
                }
            }
            break;
        }

        case "tool": {
            if (normalized.result && normalized.result.trim()) {
                console.log(fmt.toolResult(`  ← ${truncate(normalized.result.trim(), 120)}`));
            }
            break;
        }

        case "stream_event": {
            if (verbose) {
                console.log(fmt.dim("(streaming…)"));
            }
            break;
        }

        case "result": {
            stopSpinner();

            if (normalized.subtype === "success") {
                if (normalized.text?.trim()) {
                    console.log(fmt.success("\n" + normalized.text.trim()));
                }
                const usageInfo = normalized.usage ? ` · tokens: ${normalized.usage.totalTokenCount ?? 'N/A'}` : '';
                console.log(
                    fmt.dim(`Done${usageInfo}`)
                );
            } else {
                console.log(fmt.error(`Stopped: ${normalized.error || "Unknown error"}`));
            }
            break;
        }

        default:
            break;
    }
}