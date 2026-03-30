import { Skeleton } from './ui/skeleton';

export function DocumentLoadingSkeleton() {
  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-12" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-center">
          <Skeleton className="h-[800px] w-[600px]" />
        </div>
      </div>
    </div>
  );
}

export function MarkdownLoadingSkeleton() {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-6 w-1/2 mt-6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

export function JsonLoadingSkeleton() {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="border-b border-gray-200 p-3">
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{ paddingLeft: `${(i % 3) * 20}px` }}>
            <Skeleton className="h-5 w-48" />
          </div>
        ))}
      </div>
    </div>
  );
}
