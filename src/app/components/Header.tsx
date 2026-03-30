import { FolderOpen } from 'lucide-react';
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
}

export function Header({ folderPath, onRefresh }: HeaderProps) {
  const pathParts = folderPath?.split('/').filter(Boolean) ?? [];

  return (
    <header className="border-b border-brand-navy/20 bg-brand-navy shadow-md flex-shrink-0">
      <div className="flex h-14 items-center justify-between px-5">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-3 flex-shrink-0">
            <img src="/ag-logo.svg" alt="AG Logo" className="h-8 w-auto rounded-md bg-white px-2 py-0.5" />
            <div>
              <h1 className="font-semibold text-sm text-white leading-tight">{BRAND_NAME}</h1>
              <p className="text-[11px] text-white/60 leading-tight">{BRAND_TAGLINE}</p>
            </div>
          </div>

          <Separator orientation="vertical" className="h-7 bg-white/20 flex-shrink-0" />

          {folderPath ? (
            <Breadcrumb className="min-w-0">
              <BreadcrumbList className="flex-nowrap">
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" className="text-white/60 hover:text-white text-xs">
                    Documents
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {pathParts.map((part, index) => (
                  <div key={index} className="flex items-center gap-1.5 min-w-0">
                    <BreadcrumbSeparator className="text-white/30" />
                    <BreadcrumbItem className="min-w-0">
                      {index === pathParts.length - 1 ? (
                        <BreadcrumbPage className="font-medium text-white text-xs truncate max-w-[200px]">
                          {part}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href="#" className="text-white/60 hover:text-white text-xs truncate max-w-[120px]">
                          {part}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          ) : (
            <span className="text-white/40 text-xs">No folder open — click Open Folder to begin</span>
          )}
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost" size="sm" onClick={onRefresh}
                className="flex-shrink-0 gap-2 text-white/80 hover:text-white hover:bg-white/15 border border-white/20 h-8 text-xs"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                Open Folder
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Open a folder to load documents</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}
