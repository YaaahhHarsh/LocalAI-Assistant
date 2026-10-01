const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();

  try {
    return { ok: response.ok, status: response.status, data: JSON.parse(text) };
  } catch {
    return { ok: response.ok, status: response.status, data: { error: text } };
  }
}

export async function GET() {
  const result = await fetchJson(`${ollamaHost}/api/tags`);

  if (!result.ok) {
    return Response.json({
      ok: false,
      message: 'Ollama is not reachable. Start Ollama locally, then run: ollama pull llama3.2',
    });
  }

  const models = result.data?.models || [];
  return Response.json({
    ok: true,
    message: 'Connection successful.',
    models,
  });
}
