export interface FolderRecord {
  id: string;
  name: string;
  path: string;
  lastModified: string;
  files: {
    document?: {
      type: 'pdf' | 'jpeg' | 'png';
      url: string;
      size: string;
    };
    markdown?: {
      content: string;
      size: string;
    };
    json?: {
      data: unknown;
      size: string;
    };
  };
  status: {
    complete: boolean;
    error?: string;
  };
}
