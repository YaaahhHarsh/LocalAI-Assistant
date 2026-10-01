import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const documentsPath = path.join(dataDir, 'documents.json');

async function ensureDataFile(filePath, defaultValue) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
  }
}

async function readDocuments() {
  await ensureDataFile(documentsPath, []);
  const raw = await fs.readFile(documentsPath, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeDocuments(payload) {
  await ensureDataFile(documentsPath, []);
  await fs.writeFile(documentsPath, JSON.stringify(payload, null, 2), 'utf-8');
}

export async function GET() {
  const documents = await readDocuments();
  return Response.json({ documents });
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.title || !body.content) {
      return Response.json({ success: false, message: 'Title and content are required.' }, { status: 400 });
    }

    const documents = await readDocuments();
    const nextDocument = {
      id: crypto.randomUUID(),
      title: body.title,
      content: body.content,
      createdAt: new Date().toISOString(),
      source: body.source || 'manual',
      isActive: true,
    };

    const updatedDocuments = [nextDocument, ...documents];
    await writeDocuments(updatedDocuments);

    return Response.json({ success: true, document: nextDocument });
  } catch (error) {
    return Response.json({ success: false, message: 'Unable to save document.' }, { status: 500 });
  }
}
