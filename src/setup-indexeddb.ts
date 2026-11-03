import dbManager from 'node-indexeddb/dbManager';

export async function setupIndexedDB(): Promise<void> {
  console.log('Loading persistent IndexedDB cache...');

  await dbManager.loadCache();

  await import('node-indexeddb/auto');

  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB failed to initialize');
  }

  console.log('Persistent IndexedDB is ready');
}