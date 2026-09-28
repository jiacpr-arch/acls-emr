const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

/**
 * Pick the chat model used by the student-question pipeline (answer + classify).
 *
 * Local AI (preferred) — any OpenAI-compatible server (Ollama, LM Studio, vLLM,
 * LocalAI, llama.cpp server …) reachable from Vercel, e.g. via a tunnel.
 * Set as Vercel Shared Environment Variables (names matched case-insensitively):
 *   AI_BASE_URL  e.g. https://ai.example.com/v1  (required to enable)
 *   AI_MODEL     e.g. qwen2.5:14b                 (required)
 *   AI_API_KEY   sent as Bearer token             (optional)
 * Falls back to DeepSeek (DEEPSEEK_API_KEY) when AI_BASE_URL is unset.
 */
export function resolveLlm() {
  const base = readEnv('AI_BASE_URL');
  if (base) {
    const model = readEnv('AI_MODEL');
    if (!model) throw new Error('AI_MODEL not configured');
    return {
      name: 'Local AI',
      url: `${base.replace(/\/+$/, '')}/chat/completions`,
      key: readEnv('AI_API_KEY') || null,
      model,
    };
  }
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('No AI configured — set AI_BASE_URL or DEEPSEEK_API_KEY');
  return { name: 'DeepSeek', url: DEEPSEEK_URL, key, model: DEEPSEEK_MODEL };
}

// Env var names are case-sensitive; accept any casing (e.g. "Ai_base_url").
function readEnv(name) {
  const key = Object.keys(process.env).find(k => k.toUpperCase() === name);
  return key ? process.env[key]?.trim() : undefined;
}

/**
 * One OpenAI-style chat completion. Returns the assistant text with any
 * <think>…</think> reasoning (emitted by local reasoning models) removed.
 * Throws on HTTP failure; the error carries `.status`.
 */
export async function chatCompletion(llm, { messages, temperature, maxTokens, json = false }) {
  const headers = { 'Content-Type': 'application/json' };
  if (llm.key) headers.Authorization = `Bearer ${llm.key}`;

  const body = { model: llm.model, messages, temperature, max_tokens: maxTokens };
  if (json) body.response_format = { type: 'json_object' };

  const resp = await fetch(llm.url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!resp.ok) {
    const text = await resp.text();
    const err = new Error(`${llm.name} request failed (${resp.status}): ${text.slice(0, 500)}`);
    err.status = resp.status;
    throw err;
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content || '';
  return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}
