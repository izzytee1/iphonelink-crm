const DB_NAME = 'nv-mail-react';
const STORE_NAME = 'mailbox';
const KEY = 'current';

function openDb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { resolve(null); return; }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadMailbox() {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function saveMailbox(mailbox) {
  const db = await openDb();
  if (!db) return false;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(mailbox, KEY);
    tx.oncomplete = () => { db.close(); resolve(true); };
    tx.onerror = () => { const error = tx.error; db.close(); reject(error); };
  });
}
