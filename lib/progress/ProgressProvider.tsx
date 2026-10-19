"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isSupabaseConfigured } from "../env";
import { createBrowserSupabase } from "../supabase/browser";
import {
  completedSet,
  readLocalProgress,
  writeLocalProgress,
  type ProgressMap,
} from "./storage";

interface ProgressContextValue {
  ready: boolean;
  completedIds: Set<string>;
  isCompleted: (lessonId: string) => boolean;
  markComplete: (lessonId: string) => Promise<void>;
  userId: string | null;
  demoMode: boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const demoMode = !isSupabaseConfigured();
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [map, setMap] = useState<ProgressMap>({});

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(async () => {
      const local = readLocalProgress();
      if (demoMode) {
        if (!cancelled) {
          setMap(local);
          setReady(true);
        }
        return;
      }

      const supabase = createBrowserSupabase();
      if (!supabase) {
        if (!cancelled) {
          setMap(local);
          setReady(true);
        }
        return;
      }

      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      if (cancelled) {
        return;
      }
      setUserId(uid);

      if (!uid) {
        setMap(local);
        setReady(true);
        return;
      }

      const { data: rows, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed_at")
        .eq("user_id", uid);

      if (cancelled) {
        return;
      }

      if (error || !rows) {
        setMap(local);
      } else {
        const remote: ProgressMap = {};
        for (const row of rows) {
          remote[row.lesson_id as string] = row.completed_at as string;
        }
        setMap({ ...local, ...remote });
      }
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [demoMode]);

  const markComplete = useCallback(
    async (lessonId: string) => {
      const stamp = new Date().toISOString();
      setMap((prev) => {
        const next = { ...prev, [lessonId]: stamp };
        writeLocalProgress(next);
        return next;
      });

      if (demoMode || !userId) {
        return;
      }

      const supabase = createBrowserSupabase();
      if (!supabase) {
        return;
      }

      await supabase.from("lesson_progress").upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          completed_at: stamp,
        },
        { onConflict: "user_id,lesson_id" },
      );
    },
    [demoMode, userId],
  );

  const ids = useMemo(() => completedSet(map), [map]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      ready,
      completedIds: ids,
      isCompleted: (lessonId: string) => ids.has(lessonId),
      markComplete,
      userId,
      demoMode,
    }),
    [ready, ids, markComplete, userId, demoMode],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress debe usarse dentro de ProgressProvider");
  }
  return ctx;
}
