# Document Intelligence Platform

A professional enterprise-grade web application for reviewing and presenting folder contents containing documents, markdown notes, and structured JSON data.

## Features

### Core Functionality
- **3-Panel Desktop Layout**: Resizable side-by-side view of Document, Markdown, and JSON
- **Responsive Design**: Automatically switches to tabbed layout on tablets/mobile (< 1024px)
- **Document Viewer**: PDF and image (JPEG/PNG) support with zoom and page navigation
- **Markdown Renderer**: Preview and raw modes with full GFM support (tables, code blocks, etc.)
- **JSON Inspector**: Interactive tree view with expand/collapse, plus raw JSON view
- **Folder Navigation**: Searchable sidebar with status indicators and confidence scores

### User Experience
- Professional enterprise SaaS aesthetic
- Real-time search and filtering
- Copy-to-clipboard functionality
- Toast notifications for actions
- Empty states for missing files
- Loading skeletons (ready to integrate)
- File type badges and status indicators
- Confidence score visualization

## Component Architecture

```
/src/app/
├── App.tsx                 # Main application with responsive layout
├── data/
│   └── mockData.ts        # Sample folder data with various document types
└── components/
    ├── Header.tsx         # Top bar with breadcrumbs and actions
    ├── Sidebar.tsx        # Folder navigation with search
    ├── DocumentViewer.tsx # PDF/image viewer with controls
    ├── MarkdownViewer.tsx # Rendered markdown with tabs
    ├── JsonViewer.tsx     # Structured JSON tree view
    ├── EmptyState.tsx     # Various empty state displays
    └── LoadingSkeleton.tsx # Loading states (optional)
```

## Mock Data

The application includes 5 sample folders demonstrating different use cases:

1. **Invoice** (PDF) - Vendor invoice with line items
2. **Service Contract** (PDF) - Multi-page contract with SLA terms
3. **Identity Document** (JPEG) - Driver's license verification
4. **Expense Receipt** (PNG) - Office supplies receipt
5. **Incomplete Submission** - Missing document scenario

## Technology Stack

- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **react-resizable-panels** for resizable layout
- **react-markdown** with remark-gfm for markdown rendering
- **Lucide React** for icons
- **Radix UI** components for accessibility
- **Sonner** for toast notifications

## Design Principles

- **Enterprise-Grade**: Professional, trustworthy, minimal but information-dense
- **Clarity First**: Strong visual hierarchy, high scanability
- **Responsive**: Desktop-first but fully functional on all screen sizes
- **Accessible**: Proper contrast, keyboard navigation, semantic HTML
- **Performance**: Efficient rendering, optimized for daily operational use

## Customization

### Adding New Folders

Edit `/src/app/data/mockData.ts` and add a new `FolderRecord` object with:
- Unique ID and name
- File path
- Optional document (PDF/JPEG/PNG)
- Optional markdown content
- Optional JSON data
- Status and confidence information

### Styling

The application uses Tailwind CSS with custom theme tokens in `/src/styles/theme.css`. Markdown prose styles are also defined there for consistent typography.

## Future Enhancements

- Real PDF rendering with `react-pdf` library
- Backend integration for actual file loading
- File upload functionality
- Export and download features
- Advanced JSON search and filtering
- Collaborative annotations
- Version history
- Batch processing
