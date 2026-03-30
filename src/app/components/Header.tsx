import { FolderOpen, FileText } from 'lucide-react';
import { Button } from './ui/button';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from './ui/breadcrumb';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { BRAND_NAME, BRAND_TAGLINE } from '../constants';

interface HeaderProps {
  folderPath?: string;
  onRefresh: () => void;
  showPdf: boolean;
  onTogglePdf: () => void;
}

export function Header({ folderPath, onRefresh, showPdf, onTogglePdf }: HeaderProps) {
  const pathParts = folderPath?.split('/').filter(Boolean) ?? [];

  return (
    <header className="border-b border-brand-green/25 bg-brand-green/10 shadow-md flex-shrink-0">
      <div className="flex h-14 items-center justify-between px-5">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-3 flex-shrink-0">
            <img src="/ag-logo.svg" alt="AG Logo" className="h-8 w-auto" />
            <div>
              <h1 className="font-semibold text-sm text-brand-navy leading-tight">{BRAND_NAME}</h1>
              <p className="text-[11px] text-brand-navy/50 leading-tight">{BRAND_TAGLINE}</p>
            </div>
          </div>

          <Separator orientation="vertical" className="h-7 bg-brand-navy/20 flex-shrink-0" />

          {folderPath ? (
            <Breadcrumb className="min-w-0">
              <BreadcrumbList className="flex-nowrap">
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" className="text-brand-navy/50 hover:text-brand-navy text-xs">
                    Documents
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
            <span className="text-brand-navy/40 text-xs">No folder open — click Open Folder to begin</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost" size="sm" onClick={onTogglePdf}
                  className={`gap-2 h-8 text-xs border ${showPdf ? 'text-brand-navy bg-brand-green/25 border-brand-green/50 hover:bg-brand-green/35' : 'text-brand-navy/70 hover:text-brand-navy hover:bg-brand-navy/8 border-brand-navy/20'}`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  {showPdf ? 'Hide PDF' : 'Show PDF'}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>{showPdf ? 'Hide PDF viewer' : 'Show PDF viewer'}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost" size="sm" onClick={onRefresh}
                  className="gap-2 text-brand-navy/70 hover:text-brand-navy hover:bg-brand-navy/8 border border-brand-navy/20 h-8 text-xs"
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  Open Folder
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Open a folder to load documents</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
