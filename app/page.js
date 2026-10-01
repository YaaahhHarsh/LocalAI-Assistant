'use client';

import { useEffect, useMemo, useState } from 'react';

const defaultMessages = [
  {
    role: 'assistant',
    content:
      'Hi! I am your local AI assistant. Make sure Ollama is running locally and your model is installed, then ask me anything.',
  },
];

export default function Home() {
  const [messages, setMessages] = useState(defaultMessages);
  const [input, setInput] = useState('');
  const [documents, setDocuments] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('llama3.2');
  const [status, setStatus] = useState('Checking local AI connection...');
  const [isLoading, setIsLoading] = useState(false);
  const [useDocuments, setUseDocuments] = useState(true);

  const activeDocCount = useMemo(
    () => documents.filter((doc) => doc.isActive !== false).length,
    [documents]
  );

  async function loadDocuments() {
    const response = await fetch('/api/documents');
    const data = await response.json();
    setDocuments(data.documents || []);
  }

  async function loadModels() {
    const response = await fetch('/api/models');
    const data = await response.json();

    if (data.models && data.models.length > 0) {
      setModels(data.models);
      setSelectedModel(data.models[0]?.name || 'llama3.2');
      setStatus('Connected to local Ollama.');
      return;
    }

    setStatus('Ollama is not running or no models are installed yet.');
  }

  async function checkHealth() {
    const response = await fetch('/api/health');
    const data = await response.json();

    if (data.ok) {
      setStatus(data.message || 'Local AI ready.');
      await loadModels();
      await loadDocuments();
      return;
    }

    setStatus(
      data.message ||
        'Ollama is not available. Install Ollama and run: ollama pull llama3.2'
    );
    await loadDocuments();
  }

  useEffect(() => {
    checkHealth();
  }, []);

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      await loadDocuments();
      setStatus(`Uploaded ${data.title} to your local knowledge base.`);
    } else {
      setStatus(data.message || 'Upload failed.');
    }

    event.target.value = '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!input.trim()) return;

    const prompt = input.trim();
    setInput('');
    setIsLoading(true);

    const nextMessages = [...messages, { role: 'user', content: prompt }];
    setMessages(nextMessages);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          model: selectedModel,
          useDocuments,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setMessages([
          ...nextMessages,
          {
            role: 'assistant',
            content: data.message || 'The local AI service is unavailable right now.',
          },
        ]);
        setStatus(data.message || 'Local AI could not respond.');
        return;
      }

      setMessages([...nextMessages, { role: 'assistant', content: data.reply }]);
      setStatus('Response generated locally.');
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: 'Something went wrong while calling the local model.',
        },
      ]);
      setStatus('Error while talking to Ollama.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Private AI</p>
          <h1>Local AI Assistant</h1>
        </div>

        <div className="panel">
          <h3>AI status</h3>
          <p>{status}</p>
        </div>

        <div className="panel">
          <h3>Model</h3>
          <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
            {models.length > 0 ? (
              models.map((model) => (
                <option key={model.name} value={model.name}>
                  {model.name}
                </option>
              ))
            ) : (
              <option value="llama3.2">llama3.2</option>
            )}
          </select>
        </div>

        <div className="panel">
          <h3>Knowledge base</h3>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={useDocuments}
              onChange={(e) => setUseDocuments(e.target.checked)}
            />
            Use uploaded documents
          </label>
          <p>{activeDocCount} local files ready</p>
        </div>

        <div className="panel upload-panel">
          <h3>Upload notes</h3>
          <input type="file" accept=".txt,.md,.json" onChange={handleUpload} />
        </div>
      </aside>

      <section className="main-panel">
        <div className="chat-header">
          <div>
            <p className="eyebrow">Local workspace</p>
            <h2>Ask anything</h2>
          </div>
        </div>

        <div className="chat-box">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`message ${message.role}`}>
              <strong>{message.role === 'assistant' ? 'Assistant' : 'You'}</strong>
              <p>{message.content}</p>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <strong>Assistant</strong>
              <p>Thinking locally...</p>
            </div>
          )}
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question or give instructions..."
            rows={4}
          />
          <div className="composer-actions">
            <button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>

        <div className="documents-box panel">
          <h3>Saved documents</h3>
          {documents.length === 0 ? (
            <p>No documents uploaded yet. Add notes to build your local knowledge base.</p>
          ) : (
            <ul>
              {documents.map((doc) => (
                <li key={doc.id}>
                  <span>{doc.title}</span>
                  <small>{new Date(doc.createdAt).toLocaleDateString()}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
