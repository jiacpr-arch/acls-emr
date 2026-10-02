import { resolveLlm, chatCompletion } from './llmChat.js';

/**
 * Classify a Q&A pair into one of the existing chapter ids.
 * Returns { chapterId, reason } where chapterId is null if no chapter fits.
 */
export async function classifyChapter({ question, answer, chapters }) {
  const llm = resolveLlm();
  if (!chapters?.length) return { chapterId: null, reason: 'no chapters configured' };

  const catalog = chapters
    .map(c => `- id="${c.id}" :: ${c.title}`)
    .join('\n');

  const systemPrompt = [
    'You classify ACLS Q&A items into one of the existing chapter ids.',
    'Pick the SINGLE best matching chapter id from the list below.',
    'If absolutely no existing chapter fits, return chapterId="" AND set',
    'suggestedNewChapter to a short Thai title (max 40 chars) for a new chapter',
    'that would fit. Otherwise leave suggestedNewChapter empty.',
    'Reply with strict JSON only:',
    '{"chapterId": "ch1", "reason": "สั้นๆ", "suggestedNewChapter": ""}',
    '',
    'Chapter catalog:',
    catalog,
  ].join('\n');

  const userPrompt = [
    `Question:\n${question}`,
    '',
    `Answer (first 1500 chars):\n${String(answer || '').slice(0, 1500)}`,
  ].join('\n');

  let raw;
  try {
    raw = await chatCompletion(llm, {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0,
      maxTokens: 800, // headroom for <think> output from local reasoning models
      json: true,
    });
  } catch (err) {
    return { chapterId: null, reason: `classify failed: ${err.status ?? err.message}` };
  }
  // Local models don't always honour response_format — take the first {...} block.
  raw = raw.match(/\{[\s\S]*\}/)?.[0] || raw || '{}';
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { chapterId: null, reason: `parse failed: ${raw.slice(0, 200)}` };
  }
  const valid = new Set(chapters.map(c => c.id));
  const chapterId = parsed.chapterId && valid.has(parsed.chapterId) ? parsed.chapterId : null;
  const suggestedNewChapter = chapterId
    ? ''
    : String(parsed.suggestedNewChapter || '').trim().slice(0, 40);
  return {
    chapterId,
    reason: String(parsed.reason || '').slice(0, 500),
    suggestedNewChapter,
  };
}
