# Local AI Assistant

A useful local AI workspace for people who want AI assistance without API keys, cloud subscriptions, or privacy concerns.

## What this app does

- Chat with a local AI model using Ollama
- Upload personal notes/documents and ask questions about them
- Store documents locally in the app
- Keep everything in your own environment
- Works without any API keys

## Tech stack

- Next.js
- Local Ollama integration
- Local file-based document storage

## Quick start

1. Install Node.js 18+
2. Install Ollama: https://ollama.com/
3. Pull a model locally:

   ```bash
   ollama pull llama3.2
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

6. Open http://localhost:3000

## Environment

By default, the app connects to:

```bash
http://localhost:11434
```

If your Ollama server runs elsewhere, set:

```bash
OLLAMA_HOST=http://your-machine:11434
```

## Why this is useful

This is a practical AI tool for:

- Students learning locally
- Developers wanting local code assistance
- Professionals summarizing notes and documents
- Anyone who wants AI without paying per request
- Teams needing privacy-first workflows

## Project goal

This is an MVP for a local AI workspace that feels like a personal AI assistant but runs completely on your machine.
