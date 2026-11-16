"use client";

import { useEffect, useRef, useState } from "react";
import { useSite } from "./site-context";
import { Ed } from "./ed";
import { Ast } from "./ico";
import { LazyImg } from "./lazy-img";
import { cn } from "@/lib/utils";

/** Statistic number with a count-up animation once visible (supports decimals). */
function CountNum({ target }: { target: string }) {
  const { motion, mounted } = useSite();
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  const num = parseFloat(target.replace(/[^\d.]/g, "")) || 0;
  const decimals = (target.split(".")[1] || "").length;
  const active = mounted && motion;

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const id = setTimeout(() => setN(num), 0);
      return () => clearTimeout(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const t0 = performance.now();
        const dur = 900;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(num * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [num, active]);

  const shown = active ? n : num;

  return (
    <span ref={ref} className="n">
      {decimals ? shown.toFixed(decimals) : Math.round(shown)}
    </span>
  );
}

export function Hero() {
  const { content, editing, motion, mounted } = useSite();
  const full = content.hero.name;
  const animate = mounted && motion && !editing;
  const [typed, setTyped] = useState(full);

  // Typewriter effect for the name; state-driven so re-renders are safe.
  useEffect(() => {
    if (!animate) {
      const id = requestAnimationFrame(() => setTyped(full));
      return () => cancelAnimationFrame(id);
    }
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) clearInterval(iv);
    }, 45);
    return () => clearInterval(iv);
  }, [full, animate]);

  // Giant gradient word drifts sideways as the page scrolls (parallax).
  const megaRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (!mounted || !motion || editing) return;
    const el = megaRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      el.style.transform = `translate3d(${Math.min(y * 0.16, 240).toFixed(1)}px, 0, 0)`;
      el.style.opacity = String(Math.max(0.35, 1 - y / 1100));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [mounted, motion, editing]);

  const c = content;
  const isTyping = typed.length < full.length;

  return (
    <section className="hero" aria-labelledby="hero-name" id="top">
      <p className="mega font-display" aria-hidden="true" ref={megaRef}>
        {c.brand}
      </p>

      <div className="hero-left">
        <span className="hello intro d1 font-hand">
          <Ed p="hero.hello" />
        </span>
        <h1 className="hero-name intro d2" id="hero-name">
          <span className={cn("typed", !isTyping && "done")}>{typed}</span>
          {!isTyping ? (
            <Ed p="hero.dot" className="r" ariaLabel="dot" />
          ) : null}
        </h1>
        <Ed p="hero.role" tag="p" className="hero-role intro d3" />
        <Ed p="hero.desc" tag="p" className="hero-desc intro d4" />
        <div className="hero-cta intro d5">
          <a
            className="btn btn-red"
            href="#work"
            onClick={(e) => editing && e.preventDefault()}
          >
            <Ed p="hero.ctaPrimary" /> <span className="down" aria-hidden="true">&darr;</span>
          </a>
          <a
            className="link"
            href={c.hero.ctaSecondaryHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (editing || c.hero.ctaSecondaryHref === "#") e.preventDefault();
            }}
          >
            <Ed p="hero.ctaSecondary" /> <b aria-hidden="true">&rarr;</b>
          </a>
        </div>
      </div>

      {/* POPOLAB-style visual: the GTA artwork rises out of the giant word. */}
      <div className="hero-visual intro d3">
        <LazyImg
          src={c.hero.photoUrl}
          alt={c.hero.photoAlt}
          width={940}
          height={1528}
          eager
          className="hero-cut"
          fallback={
            <div className="photo-fb font-display" role="img" aria-label={c.hero.photoAlt}>
              WB
            </div>
          }
        />
        <span className="vis-note font-hand" aria-hidden={!editing}>
          <Ed p="hero.photoCaption" />
        </span>
      </div>

      <div className="hero-right">
        <div className="tagline intro d4">
          <span className="ast" aria-hidden="true">
            <Ast />
          </span>
          <Ed p="hero.tagline" tag="span" className="tagline-tx" />
        </div>
        <div className="stats intro d5">
          {c.stats.map((st, i) => (
            <div className="stat" key={`stat-${i}`}>
              <span className="num-row">
                <CountNum target={st.n} />
                {st.small ? <small className="n-small">{st.small}</small> : null}
              </span>
              <span className="t">
                {st.t}
                {st.sub ? <span className="t-sub">{st.sub}</span> : null}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-strip intro d6">
        <a
          className="play-link"
          href={c.hero.stripLeftHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (editing || c.hero.stripLeftHref === "#") e.preventDefault();
          }}
        >
          <span className="play-ic" aria-hidden="true">
            <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
              <path d="M0 0l10 6-10 6z" />
            </svg>
          </span>
          <Ed p="hero.stripLeft" />
        </a>
        <span className="label mid">
          <Ed p="hero.stripMid" /> <b aria-hidden="true">&darr;</b>
        </span>
        <span className="label">
          <Ed p="hero.stripRight" />
        </span>
      </div>
    </section>
  );
}
