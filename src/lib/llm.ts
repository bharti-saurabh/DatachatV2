import type { LLMSettings } from "@/types";

interface CallLLMOptions {
  system: string;
  user: string;
  settings: LLMSettings;
  schema?: Record<string, unknown>;
}

export async function callLLM({ system, user, settings }: CallLLMOptions): Promise<string> {
  const res = await fetch(`${settings.endpoint}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${settings.apiKey}` },
    body: JSON.stringify({
      model: settings.model,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`LLM API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content as string;
}

export async function callLLMJSON<T>(opts: CallLLMOptions): Promise<T> {
  const { system, user, settings, schema } = opts;
  const body: Record<string, unknown> = {
    model: settings.model,
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
  };
  if (schema) {
    body.response_format = {
      type: "json_schema",
      json_schema: { name: "response", strict: true, schema },
    };
  } else {
    body.response_format = { type: "json_object" };
  }
  const res = await fetch(`${settings.endpoint}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${settings.apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`LLM API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content) as T;
}
