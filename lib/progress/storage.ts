const STORAGE_KEY = "practica.progress.v1";

export type ProgressMap = Record<string, string>;

export function readLocalProgress(): ProgressMap {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }
    return parsed as ProgressMap;
  } catch {
    return {};
  }
}

export function writeLocalProgress(map: ProgressMap): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function completedSet(map: ProgressMap): Set<string> {
  return new Set(Object.keys(map));
}
