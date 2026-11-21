// IndexedDB storage helper for uploaded short videos and explanation videos
// Keeps large binary video blobs out of localStorage's ~5MB limit.

const DB_NAME = 'logincpns_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

function openVideoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('Browser Anda tidak mendukung penyimpanan video lokal (IndexedDB).'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Gagal membuka database video lokal.'));
  });
}

export async function saveVideoBlob(blobId: string, file: Blob): Promise<void> {
  const db = await openVideoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(file, blobId);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error || new Error('Gagal menyimpan file video ke browser.'));
    };
  });
}

export async function getVideoBlob(blobId: string): Promise<Blob | null> {
  try {
    const db = await openVideoDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(blobId);
      req.onsuccess = () => {
        db.close();
        resolve((req.result as Blob | undefined) ?? null);
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });
  } catch {
    return null;
  }
}

export async function deleteVideoBlob(blobId: string): Promise<void> {
  try {
    const db = await openVideoDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(blobId);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    // ignore cleanup failures
  }
}

export async function clearAllVideoBlobs(): Promise<void> {
  try {
    const db = await openVideoDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    // ignore cleanup failures
  }
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '-';
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatVideoDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '00:30';
  const total = Math.round(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function readVideoDurationFromFile(file: File): Promise<string | undefined> {
  return new Promise(resolve => {
    try {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      const cleanup = () => {
        URL.revokeObjectURL(url);
      };
      video.onloadedmetadata = () => {
        const formatted = Number.isFinite(video.duration) && video.duration > 0
          ? formatVideoDuration(video.duration)
          : undefined;
        cleanup();
        resolve(formatted);
      };
      video.onerror = () => {
        cleanup();
        resolve(undefined);
      };
      video.src = url;
    } catch {
      resolve(undefined);
    }
  });
}

export function parseEmbedVideoUrl(rawUrl?: string): {
  kind: 'IFRAME' | 'VIDEO' | 'NONE';
  src: string;
} {
  if (!rawUrl || !rawUrl.trim()) {
    return { kind: 'NONE', src: '' };
  }
  const url = rawUrl.trim();

  // YouTube (standard, youtu.be, shorts, embed)
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
  );
  if (ytMatch?.[1]) {
    return {
      kind: 'IFRAME',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`
    };
  }

  // Google Drive /file/d/{id}/view
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch?.[1]) {
    return {
      kind: 'IFRAME',
      src: `https://drive.google.com/file/d/${driveMatch[1]}/preview`
    };
  }

  // Direct video URL or other link
  return {
    kind: 'VIDEO',
    src: url
  };
}
