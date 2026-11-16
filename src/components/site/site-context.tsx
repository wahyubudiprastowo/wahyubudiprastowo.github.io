"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_CONTENT,
  setByPath,
  type SiteContent,
} from "@/lib/site-content";

const LS_KEY = "wahyu-portfolio-content-v2";
const LS_MOTION = "wahyu-portfolio-motion";

export type SaveStatus = "idle" | "saving" | "saved";

interface SiteCtx {
  content: SiteContent;
  editing: boolean;
  mounted: boolean;
  motion: boolean;
  saveStatus: SaveStatus;
  isModified: boolean;
  toggleMotion: () => void;
  setEditing: (v: boolean) => void;
  setPath: (path: string, value: string) => void;
  updateProject: (id: string, patch: Record<string, string>) => void;
  addProject: () => void;
  removeProject: (id: string) => void;
  exportJson: () => void;
  importJson: (file: File) => Promise<boolean>;
  resetContent: () => void;
}

const Ctx = createContext<SiteCtx | null>(null);

/** Cek objek polos (bukan array/null). */
function isPlainObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

/**
 * Deep merge: field yang hilang di data tersimpan (mis. hero.floatTags dari
 * versi content.json lama) diisi dari default, tanpa menghapus array milik
 * pengguna (projects, tabs, dst. tetap diganti utuh bila ada di saved).
 */
function deepMerge<T>(base: T, over: unknown): T {
  if (!isPlainObj(base) || !isPlainObj(over)) return (over === undefined ? base : (over as T));
  const out: Record<string, unknown> = { ...base };
  for (const k of Object.keys(over)) {
    out[k] = k in base ? deepMerge((base as Record<string, unknown>)[k], over[k]) : over[k];
  }
  return out as T;
}

function mergeWithDefault(saved: unknown): SiteContent {
  return deepMerge(DEFAULT_CONTENT, saved);
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [content, setContentState] = useState<SiteContent>(DEFAULT_CONTENT);
  const [editing, setEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [motion, setMotion] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isModified, setIsModified] = useState(false);
  const firstRun = useRef(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load: default -> content.json (repo) -> localStorage (edit terakhir di browser ini)
  useEffect(() => {
    (async () => {
      let loaded = DEFAULT_CONTENT;
      try {
        const res = await fetch("content.json", { cache: "no-store" });
        if (res.ok) loaded = mergeWithDefault(await res.json());
      } catch {
        /* pakai default */
      }
      try {
        const saved = localStorage.getItem(LS_KEY);
        if (saved) {
          loaded = mergeWithDefault(JSON.parse(saved));
          // Hanya tandai "ada perubahan" bila isinya benar-benar beda
          // dari konten bawaan (mis. setelah Reset).
          setIsModified(JSON.stringify(loaded) !== JSON.stringify(DEFAULT_CONTENT));
        }
      } catch {
        /* abaikan */
      }
      try {
        if (localStorage.getItem(LS_MOTION) === "off") {
          setMotion(false);
          document.documentElement.classList.add("no-motion");
        }
      } catch {
        /* abaikan */
      }
      setContentState(loaded);
      setMounted(true);
    })();
  }, []);

  // Keep the browser tab title in sync with the editable meta.title.
  // Re-asserted shortly after every change because the Next.js runtime
  // re-applies the static SSR metadata asynchronously after commits.
  useEffect(() => {
    if (!mounted) return;
    const t = content.meta?.title;
    if (!t) return;
    const apply = () => {
      document.title = t;
    };
    apply();
    const id = setTimeout(apply, 150);
    return () => clearTimeout(id);
  }, [mounted, content.meta?.title]);

  // Autosave ke localStorage setiap konten berubah
  useEffect(() => {
    if (!mounted) return;
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    saveTimer.current = setTimeout(() => {
      setSaveStatus("saving");
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(content));
        // Konten identik dengan default tidak dianggap "ada perubahan"
        // (mis. setelah Reset), agar indikator toolbar tidak menyesatkan.
        setIsModified(JSON.stringify(content) !== JSON.stringify(DEFAULT_CONTENT));
        setSaveStatus("saved");
      } catch {
        setSaveStatus("idle");
      }
    }, 350);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [content, mounted]);

  const setPath = useCallback((path: string, value: string) => {
    setContentState((c) => setByPath(c, path, value));
  }, []);

  const updateProject = useCallback((id: string, patch: Record<string, string>) => {
    setContentState((c) => ({
      ...c,
      projects: c.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, []);

  const addProject = useCallback(() => {
    setContentState((c) => ({
      ...c,
      projects: [
        ...c.projects,
        {
          id: `p-${Date.now()}`,
          title: "New Project",
          small: "Short description / Tech",
          hook: "Write one sentence explaining why this project is interesting.",
          url: "https://github.com/wahyubudiprastowo",
          cat: "apps",
          tag: "New",
          lang: "TypeScript",
          img: "",
        },
      ],
    }));
  }, []);

  const removeProject = useCallback((id: string) => {
    setContentState((c) => ({ ...c, projects: c.projects.filter((p) => p.id !== id) }));
  }, []);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(content, null, 2) + "\n"], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "content.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [content]);

  const importJson = useCallback(async (file: File) => {
    try {
      const parsed = mergeWithDefault(JSON.parse(await file.text()));
      if (!Array.isArray(parsed.projects)) return false;
      setContentState(parsed);
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetContent = useCallback(() => {
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* abaikan */
    }
    setIsModified(false);
    setContentState(DEFAULT_CONTENT);
  }, []);

  const toggleMotion = useCallback(() => {
    setMotion((m) => {
      const next = !m;
      document.documentElement.classList.toggle("no-motion", !next);
      try {
        localStorage.setItem(LS_MOTION, next ? "on" : "off");
      } catch {
        /* abaikan */
      }
      return next;
    });
  }, []);

  const value = useMemo<SiteCtx>(
    () => ({
      content,
      editing,
      mounted,
      motion,
      saveStatus,
      isModified,
      toggleMotion,
      setEditing,
      setPath,
      updateProject,
      addProject,
      removeProject,
      exportJson,
      importJson,
      resetContent,
    }),
    [
      content,
      editing,
      mounted,
      motion,
      saveStatus,
      isModified,
      toggleMotion,
      setPath,
      updateProject,
      addProject,
      removeProject,
      exportJson,
      importJson,
      resetContent,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSite(): SiteCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSite must be used inside SiteProvider");
  return ctx;
}
