import fs from 'fs/promises';
import path from 'path';

const defaultPath = path.join(process.cwd(), 'data', 'memory.json');

const ensureStore = async (storePath) => {
  const dir = path.dirname(storePath);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(storePath);
  } catch {
    await fs.writeFile(storePath, JSON.stringify({ sessions: {} }, null, 2));
  }
};

const readStore = async (storePath) => {
  await ensureStore(storePath);
  const raw = await fs.readFile(storePath, 'utf-8');
  return JSON.parse(raw);
};

const writeStore = async (storePath, data) => {
  await fs.writeFile(storePath, JSON.stringify(data, null, 2));
};

export const getSessionMemory = async (sessionId, limit = 20) => {
  const storePath = process.env.MEMORY_PATH || defaultPath;
  const store = await readStore(storePath);
  const history = store.sessions[sessionId] || [];
  return history.slice(-limit);
};

export const appendSessionMemory = async (sessionId, messages) => {
  const storePath = process.env.MEMORY_PATH || defaultPath;
  const store = await readStore(storePath);
  const history = store.sessions[sessionId] || [];
  const next = [...history, ...messages].slice(-50);
  store.sessions[sessionId] = next;
  await writeStore(storePath, store);
  return next;
};

export const clearSessionMemory = async (sessionId) => {
  const storePath = process.env.MEMORY_PATH || defaultPath;
  const store = await readStore(storePath);
  delete store.sessions[sessionId];
  await writeStore(storePath, store);
};
