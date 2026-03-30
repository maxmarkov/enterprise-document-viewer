import { createContext, useContext } from 'react';

interface HighlightContextValue {
  activeHighlight: string | null;
  setHighlight: (text: string | null) => void;
}

export const HighlightContext = createContext<HighlightContextValue>({
  activeHighlight: null,
  setHighlight: () => {},
});

export function useHighlight() {
  return useContext(HighlightContext);
}
