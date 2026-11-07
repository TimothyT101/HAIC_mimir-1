/**
 * Optional server-side AI summarization.
 *
 * This browser module never holds API keys. If VITE_AI_SUMMARY_URL is unset,
 * the UI uses the deterministic planning summary and does not claim AI output.
 *
 * Suggested server shape (do not commit secrets):
 *   POST {VITE_AI_SUMMARY_URL}
 *   body: { community, assessment, acs, summary }
 *   return: { text, citations }
 */

export async function maybeAiSummary(payload) {
  const url = import.meta.env.VITE_AI_SUMMARY_URL;
  if (!url) {
    return { mode: "deterministic", aiGenerated: false, text: null };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Planning summary service failed (${response.status})`);
  }

  const data = await response.json();
  return {
    mode: "ai",
    aiGenerated: true,
    text: data.text,
    citations: data.citations ?? [],
  };
}
