import Anthropic from "@anthropic-ai/sdk";

export type LlmProvider = "openai" | "anthropic" | "mock";

export function resolveProvider(): LlmProvider {
  const configured = process.env.LLM_PROVIDER?.toLowerCase();
  if (configured === "mock") return "mock";
  if (configured === "anthropic" && process.env.ANTHROPIC_API_KEY)
    return "anthropic";
  if (configured === "openai" && process.env.OPENAI_API_KEY) return "openai";
  // Fall back to whichever key is present, else the built-in mock engine.
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "mock";
}

export type LlmRequest = {
  system: string;
  user: string;
  maxTokens?: number;
};

async function completeAnthropic(req: LlmRequest): Promise<string> {
  const client = new Anthropic();
  const model = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";
  const response = await client.messages.create({
    model,
    max_tokens: req.maxTokens ?? 4096,
    system: req.system,
    messages: [{ role: "user", content: req.user }],
  });
  const text = response.content.find((block) => block.type === "text");
  if (!text || text.type !== "text") {
    throw new Error("Anthropic response contained no text block");
  }
  return text.text;
}

async function completeOpenAi(req: LlmRequest): Promise<string> {
  const baseUrl =
    process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: req.maxTokens ?? 4096,
      messages: [
        { role: "system", content: req.system },
        { role: "user", content: req.user },
      ],
    }),
  });
  if (!response.ok) {
    throw new Error(
      `OpenAI-compatible API error ${response.status}: ${await response.text()}`
    );
  }
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== "string") {
    throw new Error("OpenAI-compatible response contained no message content");
  }
  return text;
}

/**
 * Run a completion against the configured provider. The mock provider is
 * handled upstream in the agent engine (it never produces free text), so
 * calling this with provider "mock" is a programming error.
 */
export async function complete(req: LlmRequest): Promise<string> {
  const provider = resolveProvider();
  if (provider === "anthropic") return completeAnthropic(req);
  if (provider === "openai") return completeOpenAi(req);
  throw new Error("complete() called while running in mock mode");
}

/** Extract a JSON object from an LLM response that may be fenced or padded. */
export function extractJson<T>(raw: string): T {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error(`No JSON object found in LLM response: ${raw.slice(0, 200)}`);
  }
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}
