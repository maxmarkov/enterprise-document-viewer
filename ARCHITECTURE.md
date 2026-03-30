# Architecture & Application Structure

## Overview

**Document Intelligence** is a browser-based, desktop-only document review tool. It uses the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) to open a local folder and display document sets side-by-side: a PDF (or image), a Markdown notes file, and a structured JSON data file — all matched by filename.

**Stack:** React 18 · TypeScript · Vite 6 · Tailwind CSS v4 · Radix UI (shadcn/ui) · react-pdf · react-resizable-panels

---

## NPM Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start the Vite dev server at `http://localhost:5173` |
| `build` | `vite build` | Compile and bundle for production into `dist/` |
| `preview` | `vite preview` | Serve the production build locally for verification |
| `typecheck` | `tsc --noEmit` | Run TypeScript type checking without emitting files |

**Running locally:**
```sh
pnpm install
pnpm dev
```

---

## Directory Structure

```
enterprise-document-viewer/
├── public/
│   └── ag-logo.svg              # Static brand logo (served as-is by Vite)
├── src/
│   ├── main.tsx                 # React bootstrap — mounts <App /> into #root
│   ├── app/
│   │   ├── App.tsx              # Root component, layout, state orchestration
│   │   ├── constants.ts         # All magic values (zoom, extensions, brand strings)
│   │   ├── data/
│   │   │   └── mockData.ts      # FolderRecord interface (no mock data)
│   │   ├── utils/
│   │   │   ├── folderScanner.ts # File System Access API scanning logic
│   │   │   └── formatters.ts    # Shared formatting utilities
│   │   └── components/
│   │       ├── Header.tsx       # Top navigation bar
│   │       ├── Sidebar.tsx      # Folder list panel (left)
│   │       ├── DocumentViewer.tsx   # PDF / image viewer (left main panel)
│   │       ├── MarkdownViewer.tsx   # Rendered markdown panel
│   │       ├── JsonViewer.tsx       # Structured JSON panel
│   │       ├── EmptyState.tsx       # Placeholder screens
│   │       ├── json/
│   │       │   ├── Section.tsx      # Top-level collapsible JSON section
│   │       │   ├── SectionValue.tsx # Level-2 sub-section / array renderer
│   │       │   └── Field.tsx        # Leaf field and field group (level 3)
│   │       └── ui/              # Radix UI / shadcn primitives (Button, Tooltip, etc.)
│   └── styles/
│       ├── index.css            # Entry CSS — imports tailwind.css + theme.css
│       ├── tailwind.css         # Tailwind v4 setup + brand color @theme tokens
│       ├── theme.css            # CSS variables (light/dark), prose styles
│       └── fonts.css            # Font-face declarations
├── index.html                   # Vite HTML entry point
├── package.json
├── .gitignore
└── ARCHITECTURE.md              # This file
```

---

## Application Architecture

### State & Data Flow

All top-level state lives in `App.tsx`. No external state library is used.

```
User clicks "Open Folder"
        │
        ▼
  showDirectoryPicker()          ← Browser File System Access API
        │
        ▼
  scanDirectory(dirHandle)       ← folderScanner.ts
        │  Iterates subfolders, reads PDF/MD/JSON files,
        │  creates object URLs for PDFs, parses JSON
        │
        ▼
  setFolders(records)            ← FolderRecord[] stored in App state
        │
        ▼
  User selects a folder in Sidebar
        │
        ▼
  selectedFolder passed as props to:
    ├── DocumentViewer  (document file)
    ├── MarkdownViewer  (markdown file)
    └── JsonViewer      (json file)
```

### Layout

The UI is a fixed three-panel layout (desktop only):

```
┌─────────────────────────────────────────────────────┐
│  Header (nav bar, breadcrumb, Open Folder button)    │
├────────┬──────────────────────────────────────────── │
│        │  DocumentViewer     │  MarkdownViewer        │
│Sidebar │  (PDF / image)      │──────────────────────  │
│(folder │  resizable, 0–50%   │  JsonViewer            │
│ list)  │  collapsible        │  fixed 50/50 split     │
└────────┴─────────────────────┴───────────────────────┘
```

- The **Sidebar** is a fixed 256 px (`w-64`) column.
- The **main area** uses `react-resizable-panels` with two panels:
  - Left panel: `DocumentViewer` — resizable from 0% (fully collapsed) to 50%, default 35%.
  - Right panel: a flex container split 50/50 between `MarkdownViewer` and `JsonViewer` — not resizable.

---

## Key Modules

### `folderScanner.ts`

Reads the selected directory using the File System Access API and returns a `FolderRecord[]`.

- **`scanDirectory(dirHandle)`** — public entry point. Iterates all entries:
  - If subfolders are found, calls `scanSubfolder` on each.
  - If no subfolders (or none yielded results), falls back to scanning the root folder itself.
  - Returns records sorted alphabetically.
- **`scanSubfolder(name, dirHandle)`** — reads one folder's files into a `Map`, categorizes them by extension (single pass via `categorizeFiles`), then reads file contents:
  - The primary document (PDF) anchors filename matching. Markdown and JSON are matched by base name (case-insensitive).
  - Falls back to MD-first, then JSON-only, if no PDF is present.
  - Uses `URL.createObjectURL()` for PDF binary data.
  - Errors per-file are caught and logged with `console.warn`; partial results are still returned.
- **`categorizeFiles(fileHandles)`** — single-pass bucketing into `byExt` map (`{ '.pdf': [], '.md': [], '.json': [] }`).
- **`findMatch(baseName, candidates)`** — case-insensitive base-name lookup.

### `data/mockData.ts` — `FolderRecord` interface

The central data shape flowing through the entire app:

```typescript
interface FolderRecord {
  id: string;
  name: string;
  path: string;
  lastModified: string;       // ISO timestamp
  files: {
    document?: { type: 'pdf' | 'jpeg' | 'png'; url: string; size: string };
    markdown?: { content: string; size: string };
    json?:     { data: Record<string, unknown>; size: string };
  };
  status: { complete: boolean; error?: string };
}
```

All three file slots are optional — a record may have any combination.

### `utils/formatters.ts`

Shared pure functions used across components:

| Function | Purpose |
|---|---|
| `formatKey(key)` | Converts `camelCase` / `snake_case` keys to `Title Case` labels |
| `formatValue(value)` | Renders any JSON value as a human-readable string |
| `formatBytes(bytes)` | Converts byte counts to `B / KB / MB` strings |

### `constants.ts`

Single source of truth for all magic values:

```typescript
BRAND_NAME        // 'Document Intelligence'
BRAND_TAGLINE     // 'Review & Extraction Platform'
ZOOM_DEFAULT      // 100  (percent)
ZOOM_STEP         // 25
ZOOM_MIN          // 50
ZOOM_MAX          // 200
COPY_FEEDBACK_MS  // 2000 (ms before "Copied" resets)
EXT_PDF / EXT_MD / EXT_JSON  // '.pdf', '.md', '.json'
```

---

## Component Reference

| Component | Description |
|---|---|
| `Header` | Navy top bar with AG logo, breadcrumb path, and Open Folder button |
| `Sidebar` | Scrollable list of `FolderRecord` cards with PDF/MD/JSON badges; Open Folder button at top |
| `DocumentViewer` | Renders PDFs via `react-pdf` (`<Document>` + `<Page scale={zoom/100}>`) or `<img>` for JPEG/PNG; zoom 50–200%, pagination for multi-page PDFs |
| `MarkdownViewer` | Renders markdown with `react-markdown` + `remark-gfm`; applies `.markdown-body` prose styles; Copy button |
| `JsonViewer` | Renders `FolderRecord.files.json.data` as collapsible sections; Copy raw JSON button |
| `json/Section` | Level-1 collapsible block with chevron toggle; renders `SectionValue` entries in a 2-column grid |
| `json/SectionValue` | Level-2 renderer: plain value → `Field`; array → list of `FieldGroup`s; object → nested `FieldGroup` |
| `json/Field` + `FieldGroup` | Level-3 leaf: labelled input-style box; `FieldGroup` renders a 2-column grid of `Field`s |
| `EmptyState` | Contextual placeholder — large centered (no folder selected) or compact inline (missing file type) |

---

## Styling

### Tailwind CSS v4

Custom brand tokens are defined in `src/styles/tailwind.css` using the `@theme` directive:

```css
@theme {
  --color-brand-navy:      #1a2e6e;
  --color-brand-navy-dark: #162459;
  --color-brand-green:     #7dc422;
}
```

These are available as standard Tailwind utilities: `bg-brand-navy`, `text-brand-navy`, `hover:bg-brand-navy-dark`, etc.

### Theme variables (`theme.css`)

CSS custom properties for the full design token system (background, foreground, border, radius, etc.) follow the shadcn/ui convention, mapped through `@theme inline` into Tailwind color utilities.

### Markdown prose (`.markdown-body`)

The `.markdown-body` class in `theme.css` is the single source of truth for all markdown rendering styles. It uses Tailwind's `@apply` with `prose-*` modifiers to define heading sizes, colors, code blocks, tables, blockquotes, and links.

### Panel identity strips

Each main panel has a 3 px colored top border to visually distinguish it at a glance:

| Panel | Color |
|---|---|
| DocumentViewer | `bg-brand-navy` (dark blue) |
| MarkdownViewer | `bg-violet-500` |
| JsonViewer | `bg-emerald-500` |
