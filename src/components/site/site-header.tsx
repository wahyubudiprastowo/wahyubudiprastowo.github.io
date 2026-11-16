"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useSite } from "./site-context";

const CHARS = "!<>-_\\/[]{}=+*^?#";

/** Scramble-in hover effect for nav links (resolves back to the real text). */
function Scramble({ text, active }: { text: string; active: boolean }) {
  const [out, setOut] = useState(text);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (ivRef.current) {
      clearInterval(ivRef.current);
      ivRef.current = null;
    }
  };

  const start = () => {
    if (!active) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    stop();
    let i = 0;
    let tick = 0;
    ivRef.current = setInterval(() => {
      tick += 1;
      if (tick % 2 === 0) i += 1;
      const tail = text
        .slice(i)
        .split("")
        .map((ch) => (ch === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)]))
        .join("");
      setOut(text.slice(0, i) + tail);
      if (i >= text.length) {
        stop();
        setOut(text);
      }
    }, 26);
  };

  useEffect(() => stop, []);
  // Reset instantly when the target text changes (adjust-during-render).
  const [prevText, setPrevText] = useState(text);
  if (prevText !== text) {
    setPrevText(text);
    setOut(text);
  }

  return (
    <span className="scr" onMouseEnter={start} onMouseLeave={() => { stop(); setOut(text); }}>
      {out}
    </span>
  );
}

const NAV = [
  { href: "#work", label: "Work" },
  { href: "#numbers", label: "Numbers" },
  { href: "#craft", label: "Craft" },
  { href: "#journey", label: "Journey" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  const { content, editing, setEditing, motion, toggleMotion, mounted } = useSite();

  // POPOLAB-style scroll spy: the red dot marks the section in view.
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const links = NAV.map((n) => ({ n, el: document.querySelector<HTMLElement>(n.href) })).filter(
      (x): x is { n: { href: string; label: string }; el: HTMLElement } => !!x.el,
    );
    if (!links.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(`#${e.target.id}`);
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    links.forEach(({ el }) => io.observe(el));
    return () => io.disconnect();
  }, [mounted]);

  return (
    <header className="site-header">
      <div className="bar">
        <a
          className="logo"
          href="#top"
          onClick={(e) => {
            if (editing) e.preventDefault();
          }}
          aria-label={`${content.brand} homepage`}
        >
          <span className="font-display">{content.brand}</span>
          <span className="dot" aria-hidden="true" />
        </a>

        <nav className="nav" aria-label="Main menu">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className={cn(active === n.href && "on")}
              onClick={(e) => editing && e.preventDefault()}
            >
              <Scramble text={n.label} active={motion && !editing} />
            </a>
          ))}
        </nav>

        <div className="hd-right">
          <button
            type="button"
            className={cn("motion-toggle", !motion && "is-off")}
            onClick={toggleMotion}
            title="Turn animations on / off"
            aria-pressed={motion}
          >
            <span className="ic" aria-hidden="true">
              {motion ? "\u25B6" : "\u25A0"}
            </span>
            <span className="tx">Motion</span>
            <span className="st">{motion ? "On" : "Off"}</span>
          </button>

          <button
            type="button"
            className={cn("edit-toggle", editing && "is-on")}
            onClick={() => setEditing(!editing)}
            aria-pressed={editing}
            title="Edit every text on the website right from the browser"
            disabled={!mounted}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
            <span className="tx">{editing ? "Exit" : "Edit"}</span>
          </button>

          <a
            className="hd-cta"
            href="#contact"
            onClick={(e) => editing && e.preventDefault()}
          >
            <span className="tx">Hire me</span> <span aria-hidden="true">&#8599;</span>
          </a>
        </div>
      </div>
    </header>
  );
}
