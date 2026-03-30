import { FileQuestion, FolderOpen, FileX, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { useLang } from '../i18n/LangContext';
import type { Translations } from '../i18n/translations';

interface EmptyStateProps {
  type: 'no-selection' | 'no-document' | 'no-markdown' | 'no-json' | 'error' | 'loading';
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

function getConfig(type: EmptyStateProps['type'], t: Translations) {
  return {
    'no-selection': {
      icon: FolderOpen,
      defaultTitle: t.selectRecord,
      defaultDescription: t.selectRecordDesc,
      iconBg: 'bg-[#1a2e6e]/8',
      iconColor: 'text-[#1a2e6e]/40',
      primary: true,
    },
    'no-document': {
      icon: FileX,
      defaultTitle: t.noDocumentTitle,
      defaultDescription: t.noDocumentDesc,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-300',
      primary: false,
    },
    'no-markdown': {
      icon: FileQuestion,
      defaultTitle: t.noNotesTitle,
      defaultDescription: t.noNotesDesc,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-300',
      primary: false,
    },
    'no-json': {
      icon: FileQuestion,
      defaultTitle: t.noDataTitle,
      defaultDescription: t.noDataDesc,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-300',
      primary: false,
    },
    error: {
      icon: AlertTriangle,
      defaultTitle: t.errorTitle,
      defaultDescription: t.errorDesc,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-400',
      primary: false,
    },
    loading: {
      icon: FileQuestion,
      defaultTitle: t.loadingTitle,
      defaultDescription: t.loadingDesc,
      iconBg: 'bg-gray-50',
      iconColor: 'text-gray-300',
      primary: false,
    },
  }[type];
}

export function EmptyState({ type, title, description, action }: EmptyStateProps) {
  const { t } = useLang();
  const config = getConfig(type, t);
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
