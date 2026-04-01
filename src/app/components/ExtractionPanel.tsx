import { useRef, useState } from 'react';
import { FileText, FolderOpen, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { useLang } from '../i18n/LangContext';

// File System Access API types
interface FSDirectoryHandle {
  readonly name: string;
  getFileHandle(name: string, opts: { create: boolean }): Promise<FSFileHandle>;
}
interface FSFileHandle {
  createWritable(): Promise<FSWritableFileStream>;
}
interface FSWritableFileStream {
  write(data: BufferSource | Blob | string): Promise<void>;
  close(): Promise<void>;
}

type Step = 'uploading' | 'converting' | 'extracting' | 'saving';

interface ExtractionPanelProps {
  onComplete: (dirHandle: { name: string }) => Promise<void>;
}

export function ExtractionPanel({ onComplete }: ExtractionPanelProps) {
  const { t } = useLang();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [outputHandle, setOutputHandle] = useState<FSDirectoryHandle | null>(null);
  const [step, setStep] = useState<Step | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const isRunning = step !== null && !done && !error;
  const canExtract = pdfFile !== null && outputHandle !== null && !isRunning;

  const handlePickOutputFolder = async () => {
    try {
      const handle = await (window as unknown as {
        showDirectoryPicker: (opts: object) => Promise<FSDirectoryHandle>;
      }).showDirectoryPicker({ mode: 'readwrite' });
      setOutputHandle(handle);
      setError(null);
    } catch (err: unknown) {
      if ((err as { name?: string })?.name !== 'AbortError') {
        setError('Could not open output folder.');
      }
    }
  };

  const handleExtract = async () => {
    if (!pdfFile || !outputHandle) return;
    setError(null);
    setDone(false);
    setResultMessage(null);

    try {
      // Step 1 — upload
      setStep('uploading');
      const formData = new FormData();
      formData.append('file', pdfFile);

      // Step 2 — converting (optimistic: backend does both convert+extract in one call)
      setStep('converting');
      console.log('[ExtractionPanel] Sending POST /api/extract', { filename: pdfFile.name, size: pdfFile.size });
      const response = await fetch('/api/extract', { method: 'POST', body: formData });
      console.log('[ExtractionPanel] Response received', { status: response.status, ok: response.ok });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error((body as { detail?: string }).detail ?? `HTTP ${response.status}`);
      }

      // Step 3 — extracting (data is already here, update label for UX clarity)
      setStep('extracting');
      const result = await response.json() as { filename: string; message?: string; markdown?: string; json?: unknown };

      if (result.message) {
        // Test mode: backend returned a plain message
        setResultMessage(result.message);
        setDone(true);
        setStep(null);
        return;
      }

      // Step 4 — save files to output folder
      setStep('saving');
      const stem = result.filename;

      const pdfArrayBuffer = await pdfFile.arrayBuffer();
      await writeFile(outputHandle, `${stem}.pdf`, new Blob([pdfArrayBuffer], { type: 'application/pdf' }));
      await writeFile(outputHandle, `${stem}.md`, result.markdown ?? '');
      await writeFile(outputHandle, `${stem}.json`, JSON.stringify(result.json, null, 2));

      setDone(true);
      setStep(null);
      await onComplete(outputHandle);
    } catch (err: unknown) {
      setStep(null);
      setError((err as Error)?.message ?? 'Unknown error');
    }
  };

  const stepLabels: Record<Step, string> = {
    uploading: t.stepUploading,
    converting: t.stepConverting,
    extracting: t.stepExtracting,
    saving: t.stepSaving,
  };

  const STEPS: Step[] = ['uploading', 'converting', 'extracting', 'saving'];
  const currentStepIndex = step ? STEPS.indexOf(step) : -1;

  return (
    <div className="flex h-full items-center justify-center bg-[#f8f9fc] p-6">
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy/8">
              <Sparkles className="h-4 w-4 text-brand-navy" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-brand-navy">{t.extractionTitle}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{t.extractionDesc}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* PDF picker */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setPdfFile(f);
                setError(null);
                setDone(false);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isRunning}
              className="w-full flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-200 px-4 py-3.5 text-left transition-colors hover:border-brand-navy/30 hover:bg-brand-navy/3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="h-4 w-4 flex-shrink-0 text-brand-navy/60" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-brand-navy">
                  {pdfFile ? t.selectedPdf : t.selectPdf}
                </p>
                {pdfFile && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{pdfFile.name}</p>
                )}
              </div>
            </button>
          </div>

          {/* Output folder picker */}
          <div>
            <button
              onClick={handlePickOutputFolder}
              disabled={isRunning}
              className="w-full flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-200 px-4 py-3.5 text-left transition-colors hover:border-brand-navy/30 hover:bg-brand-navy/3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FolderOpen className="h-4 w-4 flex-shrink-0 text-brand-navy/60" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-brand-navy">
                  {outputHandle ? t.selectedOutputFolder : t.selectOutputFolder}
                </p>
                {outputHandle && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{outputHandle.name}</p>
                )}
              </div>
            </button>
          </div>

          {/* Progress steps */}
          {(isRunning || done) && (
            <div className="rounded-lg bg-gray-50 px-4 py-3 space-y-2">
              {STEPS.map((s, i) => {
                const isPast = done || i < currentStepIndex;
                const isCurrent = !done && i === currentStepIndex;
                return (
                  <div key={s} className="flex items-center gap-2.5">
                    {isPast ? (
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-brand-green" />
                    ) : isCurrent ? (
                      <div className="h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 border-brand-navy/20 border-t-brand-navy animate-spin" />
                    ) : (
                      <div className="h-3.5 w-3.5 flex-shrink-0 rounded-full border border-gray-300" />
                    )}
                    <span className={`text-xs ${isCurrent ? 'text-brand-navy font-medium' : isPast ? 'text-gray-400' : 'text-gray-300'}`}>
                      {stepLabels[s]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Backend message (test mode) */}
          {resultMessage && (
            <div className="flex items-start gap-2.5 rounded-lg bg-green-50 border border-green-100 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600 mt-0.5" />
              <p className="text-xs text-green-700 break-words">{resultMessage}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-100 px-4 py-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-red-700">{t.extractionError}</p>
                <p className="text-xs text-red-500 mt-0.5 break-words">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-2">
          {error && (
            <Button
              variant="ghost" size="sm"
              onClick={() => { setError(null); setDone(false); }}
              className="text-xs text-brand-navy/70 hover:text-brand-navy"
            >
              {t.retryButton}
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleExtract}
            disabled={!canExtract}
            className="gap-2 text-xs bg-brand-navy hover:bg-brand-navy-dark text-white h-8 px-4 disabled:opacity-40"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t.extractButton}
          </Button>
        </div>
      </div>
    </div>
  );
}

async function writeFile(
  dirHandle: FSDirectoryHandle,
  name: string,
  content: string | Blob
): Promise<void> {
  const fileHandle = await dirHandle.getFileHandle(name, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(typeof content === 'string' ? new Blob([content]) : content);
  await writable.close();
}
