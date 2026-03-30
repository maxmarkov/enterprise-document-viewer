import { FolderOpen, Columns2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from './ui/breadcrumb';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { BRAND_NAME } from '../constants';
import { useLang } from '../i18n/LangContext';
import { type Lang } from '../i18n/translations';
import { cn } from './ui/utils';

const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'fr', label: 'FR' },
  { id: 'nl', label: 'NL' },
];

interface HeaderProps {
  folderPath?: string;
  onRefresh: () => void;
  compareMode: boolean;
  onToggleCompare: () => void;
  extractionMode: boolean;
  onToggleExtract: () => void;
  onLogoClick: () => void;
}

export function Header({ folderPath, onRefresh, compareMode, onToggleCompare, extractionMode, onToggleExtract, onLogoClick }: HeaderProps) {
  const { lang, setLang, t } = useLang();
  const pathParts = folderPath?.split('/').filter(Boolean) ?? [];

  return (
    <header className="border-b border-brand-green/25 bg-brand-green/10 shadow-md flex-shrink-0">
      <div className="flex h-14 items-center justify-between px-5">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onLogoClick}
            className="flex items-center gap-3 flex-shrink-0 rounded-md px-1 py-0.5 hover:bg-brand-navy/6 transition-colors"
          >
            <img src="/ag-logo.svg" alt="AG Logo" className="h-8 w-auto" />
            <div className="text-left">
              <h1 className="font-semibold text-sm text-brand-navy leading-tight">{BRAND_NAME}</h1>
              <p className="text-[11px] text-brand-navy/50 leading-tight">{t.brandTagline}</p>
            </div>
          </button>

          <Separator orientation="vertical" className="h-7 bg-brand-navy/20 flex-shrink-0" />

          {folderPath ? (
            <Breadcrumb className="min-w-0">
              <BreadcrumbList className="flex-nowrap">
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" className="text-brand-navy/50 hover:text-brand-navy text-xs">
                    {t.breadcrumbRoot}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {pathParts.map((part, index) => (
                  <div key={index} className="flex items-center gap-1.5 min-w-0">
                    <BreadcrumbSeparator className="text-brand-navy/30" />
                    <BreadcrumbItem className="min-w-0">
                      {index === pathParts.length - 1 ? (
                        <BreadcrumbPage className="font-medium text-brand-navy text-xs truncate max-w-[200px]">
                          {part}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href="#" className="text-brand-navy/50 hover:text-brand-navy text-xs truncate max-w-[120px]">
                          {part}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          ) : (
            <span className="text-brand-navy/40 text-xs">{t.noFolderOpenHint}</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Language switcher */}
          <div className="flex items-center rounded-md border border-brand-navy/20 overflow-hidden">
            {LANGS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setLang(id)}
                className={cn(
                  'px-2.5 h-8 text-xs font-medium transition-colors duration-100',
                  lang === id
                    ? 'bg-brand-navy text-white'
                    : 'text-brand-navy/60 hover:text-brand-navy hover:bg-brand-navy/8',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost" size="sm" onClick={onToggleExtract}
                  className={`w-[130px] justify-center gap-2 h-8 text-xs border ${extractionMode ? 'text-brand-navy bg-brand-green/25 border-brand-green/50 hover:bg-brand-green/35' : 'text-brand-navy/70 hover:text-brand-navy hover:bg-brand-navy/8 border-brand-navy/20'}`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {t.extract}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>{extractionMode ? t.exitExtractMode : t.extractTooltip}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost" size="sm" onClick={onToggleCompare}
                  className={`w-[130px] justify-center gap-2 h-8 text-xs border ${compareMode ? 'text-brand-navy bg-brand-green/25 border-brand-green/50 hover:bg-brand-green/35' : 'text-brand-navy/70 hover:text-brand-navy hover:bg-brand-navy/8 border-brand-navy/20'}`}
                >
                  <Columns2 className="h-3.5 w-3.5" />
                  {t.compare}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>{compareMode ? t.exitCompareMode : t.compareViewsSideBySide}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost" size="sm" onClick={onRefresh}
                  className="w-[165px] justify-center gap-2 text-brand-navy/70 hover:text-brand-navy hover:bg-brand-navy/8 border border-brand-navy/20 h-8 text-xs"
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  {t.openFolder}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>{t.openFolderTooltip}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
