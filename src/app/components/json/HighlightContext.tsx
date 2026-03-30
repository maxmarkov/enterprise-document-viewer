import { createContext, useContext } from 'react';

interface HighlightContextValue {
  activeHighlight: string | null;
  setHighlight: (text: string | null) => void;
  markdownContent: string | null;
}

export const HighlightContext = createContext<HighlightContextValue>({
  activeHighlight: null,
  setHighlight: () => {},
  markdownContent: null,
});

export function useHighlight() {
  return useContext(HighlightContext);
}
