import { FileQuestion, FolderOpen, FileX, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyStateProps {
  type: 'no-selection' | 'no-document' | 'no-markdown' | 'no-json' | 'error' | 'loading';
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

const configs = {
  'no-selection': {
    icon: FolderOpen,
    defaultTitle: 'Select a record',
    defaultDescription: 'Choose a folder from the sidebar to view its document, notes, and extracted data.',
    iconBg: 'bg-[#1a2e6e]/8',
    iconColor: 'text-[#1a2e6e]/40',
    primary: true,
  },
  'no-document': {
    icon: FileX,
    defaultTitle: 'No document found',
    defaultDescription: 'No PDF or image file in this folder.',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-300',
    primary: false,
  },
  'no-markdown': {
    icon: FileQuestion,
    defaultTitle: 'No notes file',
    defaultDescription: 'No markdown file found in this folder.',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-300',
    primary: false,
  },
  'no-json': {
    icon: FileQuestion,
    defaultTitle: 'No data file',
    defaultDescription: 'No JSON file found in this folder.',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-300',
    primary: false,
  },
  error: {
    icon: AlertTriangle,
    defaultTitle: 'Error',
    defaultDescription: 'Something went wrong loading this content.',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-400',
    primary: false,
  },
  loading: {
    icon: FileQuestion,
    defaultTitle: 'Loading…',
    defaultDescription: 'Please wait.',
    iconBg: 'bg-gray-50',
    iconColor: 'text-gray-300',
    primary: false,
  },
};

export function EmptyState({ type, title, description, action }: EmptyStateProps) {
  const config = configs[type];
  const Icon = config.icon;

  if (config.primary) {
    return (
      <div className="flex h-full items-center justify-center p-8 bg-[#f8f9fc]">
        <div className="text-center max-w-xs">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${config.iconBg} mb-5`}>
            <Icon className={`h-8 w-8 ${config.iconColor}`} />
          </div>
          <h3 className="font-semibold text-gray-700 text-base">{title || config.defaultTitle}</h3>
          <p className="mt-2 text-sm text-gray-400 leading-relaxed">{description || config.defaultDescription}</p>
          {action && (
            <Button onClick={action.onClick} className="mt-6 bg-[#1a2e6e] hover:bg-[#162459]">
              {action.label}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="text-center max-w-[200px]">
        <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${config.iconBg} mb-3`}>
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <p className="text-xs font-medium text-gray-400">{title || config.defaultTitle}</p>
        <p className="mt-1 text-[11px] text-gray-300 leading-snug">{description || config.defaultDescription}</p>
      </div>
    </div>
  );
}
