import type { FolderRecord } from '../data/mockData';
import { formatBytes } from './formatters';
import { EXT_PDF, EXT_MD, EXT_JSON } from '../constants';

// Local typing for the File System Access API
interface FSDirectoryHandle {
  readonly name: string;
  entries(): AsyncIterableIterator<[string, { kind: 'file' | 'directory' } & FSDirectoryHandle & FSFileHandle]>;
}
interface FSFileHandle {
  readonly name: string;
  readonly kind: 'file';
  getFile(): Promise<File>;
}

const SUPPORTED_EXTS = [EXT_PDF, EXT_MD, EXT_JSON] as const;

function getBaseName(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
}

function categorizeFiles(fileHandles: Map<string, FSFileHandle>) {
  const byExt: Record<string, [string, FSFileHandle][]> = {
    [EXT_PDF]: [],
    [EXT_MD]: [],
    [EXT_JSON]: [],
  };

  for (const [name, handle] of fileHandles) {
    const ext = ('.' + (name.split('.').pop() ?? '')).toLowerCase();
    if (ext in byExt) {
      byExt[ext].push([name, handle]);
    }
  }

  return byExt;
}

function findMatch(
  baseName: string,
  candidates: [string, FSFileHandle][]
): [string, FSFileHandle] | undefined {
  return candidates.find(
    ([n]) => getBaseName(n).toLowerCase() === baseName.toLowerCase()
  );
}

async function scanSubfolder(
  name: string,
  dirHandle: FSDirectoryHandle
): Promise<FolderRecord | null> {
  const fileHandles = new Map<string, FSFileHandle>();

  for await (const [fileName, handle] of dirHandle.entries()) {
    if (handle.kind === 'file') {
      fileHandles.set(fileName, handle as unknown as FSFileHandle);
    }
  }

  const byExt = categorizeFiles(fileHandles);
  const pdfs = byExt[EXT_PDF];
  const mds = byExt[EXT_MD];
  const jsons = byExt[EXT_JSON];

  const hasAny = SUPPORTED_EXTS.some((ext) => byExt[ext].length > 0);
  if (!hasAny) return null;

  const files: FolderRecord['files'] = {};

  if (pdfs.length > 0) {
    const [pdfName, pdfHandle] = pdfs[0];
    const base = getBaseName(pdfName);

    try {
      const file = await pdfHandle.getFile();
      files.document = { type: 'pdf', url: URL.createObjectURL(file), size: formatBytes(file.size) };
    } catch (err) {
      console.warn(`[folderScanner] Failed to read PDF "${pdfName}":`, err);
    }

    const mdMatch = findMatch(base, mds);
    if (mdMatch) {
      try {
        const f = await mdMatch[1].getFile();
        files.markdown = { content: await f.text(), size: formatBytes(f.size) };
      } catch (err) {
        console.warn(`[folderScanner] Failed to read markdown for "${base}":`, err);
      }
    }

    const jsonMatch = findMatch(base, jsons);
    if (jsonMatch) {
      try {
        const f = await jsonMatch[1].getFile();
        files.json = { data: JSON.parse(await f.text()), size: formatBytes(f.size) };
      } catch (err) {
        console.warn(`[folderScanner] Failed to parse JSON for "${base}":`, err);
      }
    }
  } else if (mds.length > 0) {
    const [mdName, mdHandle] = mds[0];
    const base = getBaseName(mdName);

    try {
      const f = await mdHandle.getFile();
      files.markdown = { content: await f.text(), size: formatBytes(f.size) };
    } catch (err) {
      console.warn(`[folderScanner] Failed to read markdown "${mdName}":`, err);
    }

    const jsonMatch = findMatch(base, jsons);
    if (jsonMatch) {
      try {
        const f = await jsonMatch[1].getFile();
        files.json = { data: JSON.parse(await f.text()), size: formatBytes(f.size) };
      } catch (err) {
        console.warn(`[folderScanner] Failed to parse JSON for "${base}":`, err);
      }
    }
  } else if (jsons.length > 0) {
    try {
      const f = await jsons[0][1].getFile();
      files.json = { data: JSON.parse(await f.text()), size: formatBytes(f.size) };
    } catch (err) {
      console.warn(`[folderScanner] Failed to parse JSON "${jsons[0][0]}":`, err);
    }
  }

  return {
    id: name,
    name,
    path: name,
    lastModified: new Date().toISOString(),
    files,
    status: { complete: true },
  };
}

export async function scanDirectory(dirHandle: FSDirectoryHandle): Promise<FolderRecord[]> {
  const records: FolderRecord[] = [];
  let hasSubfolders = false;

  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === 'directory') {
      hasSubfolders = true;
      try {
        const record = await scanSubfolder(name, handle as unknown as FSDirectoryHandle);
        if (record) records.push(record);
      } catch (err) {
        console.warn(`[folderScanner] Failed to scan subfolder "${name}":`, err);
      }
    }
  }

  if (!hasSubfolders || records.length === 0) {
    const self = await scanSubfolder(dirHandle.name, dirHandle);
    if (self) return [self];
  }

  return records.sort((a, b) => a.name.localeCompare(b.name));
}
