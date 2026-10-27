"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const CONNECT_KEY = "practica.connectWithoutDrag";
const TERM_SIZE_KEY = "practica.terminalSize";
const LIVE_BORDERS_KEY = "practica.liveBorders";
export const TERMINAL_SIZES = ["sm", "md", "lg"] as const;
export type TerminalSize = (typeof TERMINAL_SIZES)[number];

function isTerminalSize(value: string | null): value is TerminalSize {
  return value === "sm" || value === "md" || value === "lg";
}

function applyTerminalSize(size: TerminalSize) {
  document.documentElement.dataset.termSize = size;
}

interface BoardSettingsValue {
  connectWithoutDrag: boolean;
  setConnectWithoutDrag: (value: boolean) => void;
  showLiveBorders: boolean;
  setShowLiveBorders: (value: boolean) => void;
  terminalSize: TerminalSize;
  setTerminalSize: (value: TerminalSize) => void;
}

const BoardSettingsContext = createContext<BoardSettingsValue | null>(null);

export function BoardSettingsProvider({ children }: { children: ReactNode }) {
  const [connectWithoutDrag, setConnectWithoutDragState] = useState(false);
  const [showLiveBorders, setShowLiveBordersState] = useState(false);
  const [terminalSize, setTerminalSizeState] = useState<TerminalSize>("md");

  useEffect(() => {
    setConnectWithoutDragState(localStorage.getItem(CONNECT_KEY) === "1");
    setShowLiveBordersState(localStorage.getItem(LIVE_BORDERS_KEY) === "1");
    const stored = localStorage.getItem(TERM_SIZE_KEY);
    const size = isTerminalSize(stored) ? stored : "md";
    setTerminalSizeState(size);
    applyTerminalSize(size);
  }, []);

  const setConnectWithoutDrag = useCallback((value: boolean) => {
    setConnectWithoutDragState(value);
    localStorage.setItem(CONNECT_KEY, value ? "1" : "0");
  }, []);

  const setShowLiveBorders = useCallback((value: boolean) => {
    setShowLiveBordersState(value);
    localStorage.setItem(LIVE_BORDERS_KEY, value ? "1" : "0");
  }, []);

  const setTerminalSize = useCallback((value: TerminalSize) => {
    setTerminalSizeState(value);
    localStorage.setItem(TERM_SIZE_KEY, value);
    applyTerminalSize(value);
  }, []);

  const value = useMemo(
    () => ({
      connectWithoutDrag,
      setConnectWithoutDrag,
      showLiveBorders,
      setShowLiveBorders,
      terminalSize,
      setTerminalSize,
    }),
    [
      connectWithoutDrag,
      setConnectWithoutDrag,
      showLiveBorders,
      setShowLiveBorders,
      terminalSize,
      setTerminalSize,
    ],
  );

  return (
    <BoardSettingsContext.Provider value={value}>
      {children}
    </BoardSettingsContext.Provider>
  );
}

export function useBoardSettings(): BoardSettingsValue {
  const ctx = useContext(BoardSettingsContext);
  if (!ctx) {
    throw new Error("useBoardSettings debe usarse dentro de BoardSettingsProvider");
  }
  return ctx;
}
