import { promises as fs } from 'fs';
import path from 'path';

const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
const dataDir = path.join(process.cwd(), 'data');
const docsPath = path.join(dataDir, 'documents.json');

async function ensureDocs() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(docsPath);
  } catch {
    await fs.writeFile(docsPath, JSON.stringify([], null, 2), 'utf-8');
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, model = 'llama3.2', useDocuments = true } = body;

    if (!message) {
      return Response.json({ success: false, message: 'Message is required.' }, { status: 400 });
    }

    let contextText = '';
    if (useDocuments) {
      await ensureDocs();
      const raw = await fs.readFile(docsPath, 'utf-8');
      const documents = raw ? JSON.parse(raw) : [];
      contextText = documents
        .map((doc) => `Document: ${doc.title}\n${doc.content}`)
        .join('\n\n');
    }

    const prompt = contextText
      ? `Use this knowledge when answering.\n\n${contextText}\n\nUser question: ${message}`
      : message;

    const response = await fetch(`${ollamaHost}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
    });

    const text = await response.text();
    if (!response.ok) {
      return Response.json({ success: false, message: 'Unable to reach Ollama. Make sure it is running locally.' }, { status: 502 });
    }

    let payload = {};
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { response: text };
    }

    return Response.json({ success: true, reply: payload.response || 'No answer returned from the model.' });
  } catch (error) {
    return Response.json({ success: false, message: 'Something went wrong while connecting to Ollama.' }, { status: 500 });
  }
}
