import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const documentsPath = path.join(dataDir, 'documents.json');

async function ensureFile(filePath, defaultValue) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return Response.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
    }

    const rawName = file.name || 'upload.txt';
    const content = await file.text();

    if (!content) {
      return Response.json({ success: false, message: 'The uploaded file is empty.' }, { status: 400 });
    }

    await ensureFile(documentsPath, []);
    const raw = await fs.readFile(documentsPath, 'utf-8');
    const documents = raw ? JSON.parse(raw) : [];

    const item = {
      id: crypto.randomUUID(),
      title: rawName,
      content,
      source: 'upload',
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    const updated = [item, ...documents];
    await fs.writeFile(documentsPath, JSON.stringify(updated, null, 2), 'utf-8');

    return Response.json({ success: true, title: rawName, document: item });
  } catch (error) {
    return Response.json({ success: false, message: 'Unable to process uploaded file.' }, { status: 500 });
  }
}
