"use client";

/**
 * SWARM CURSORS — "kursor berlarian"
 * A faithful, self-written port of the POPOLAB resident cursor swarm
 * (inspired by multiplayer design tools): a squad of named AI cursors
 * that
 *   1. rush onto the screen when the page loads,
 *   2. orbit the visitor's mouse while it moves (with flock separation),
 *   3. when the mouse rests, go off to "work": read a line of text
 *      (leaving a colored highlight), click a button (selection box +
 *      ripple, purely visual — nothing is actually pressed) or inspect
 *      an image / title (marquee box with live W×H measurements).
 *
 * Disabled while Edit Mode is on, when Motion is off, under
 * prefers-reduced-motion, and it never intercepts any pointer event.
 */

import { useEffect, useRef } from "react";
import { useSite } from "./site-context";

/* Skill cursors: 10 tools from the CV, near-brand colors (no logos).
   "Wazuh" carries the site red so the squad always has one red cursor. */
const ROSTER = [
  { n: "Terraform", c: "#7b42bc" },
  { n: "Kubernetes", c: "#326ce5" },
  { n: "Docker", c: "#2496ed" },
  { n: "Ansible", c: "#ee0000" },
  { n: "Azure", c: "#0078d4" },
  { n: "Microsoft 365", c: "#d83b01" },
  { n: "Python", c: "#ffd343", dark: true },
  { n: "PowerShell", c: "#5391fe" },
  { n: "GitHub Actions", c: "#2088ff" },
  { n: "Wazuh", c: "#ff1e2d" },
];

/* Tuning (mirrors the reference implementation). */
const T = {
  tasks: true,
  maxBusySmall: 2,
  maxBusy: 3,
  readSpeedSmall: 110,
  readSpeed: 150, // px per second while "reading"
  travelSpeed: 0.32, // px per ms while dragging an inspect box
  restMinSmall: 14000,
  restMaxSmall: 44000,
  restMin: 18000,
  restMax: 54000,
  followMax: 9,
};

/* Site-specific selector sets for the three task types. */
const READ_SEL = [
  ".hero-desc",
  ".hero-role",
  ".tagline-tx",
  ".card .hook",
  ".lede",
  ".support p",
  ".grid-note",
  ".row .rt",
  ".tl .what",
  ".tl .body",
  ".quote-card blockquote",
  ".wins .wt",
  ".ci .ct",
  ".big-sub",
  ".small",
  ".cs-head span",
].join(",");
const CLICK_SEL = [
  ".btn",
  ".tab",
  ".card .thumb",
  ".play-link",
  ".ci",
  ".circle-cta",
  ".chip",
  ".tl summary",
  ".wins li a",
  ".motion-toggle",
  ".edit-toggle",
  ".eb-btn",
  ".ft-links button",
  ".tools li",
  ".link",
].join(",");
const INSPECT_SEL = [
  ".hero-visual img",
  ".card .thumb img",
  ".thumb-fb",
  ".h-en",
  ".ft-mega",
  ".stat",
  ".mega",
  ".big-stat",
  ".quote-card",
  ".tilt-card",
].join(",");

/* ---------- tiny helpers ---------- */
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}
function esc(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string);
}
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls: string,
  html?: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
function arrowSVG(c: string, dark: boolean) {
  const stroke = dark ? "#111" : "#fff";
  return `<svg viewBox="0 0 20 22" width="20" height="22" aria-hidden="true"><path d="M2.5 1.8l14.6 8.1-6.5 1.7-3.5 6.5z" fill="${c}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
}

/* ---------- one cursor agent ---------- */
type Seg = {
  x: number;
  y: number;
  dur: number;
  u?: (p: number) => void;
  d?: () => void;
  ez?: "lin" | "sine" | "quad" | "cubic";
  /* internal segment state */
  fx?: number;
  fy?: number;
  t?: number;
};

class Agent {
  i: number;
  c: string;
  dark: boolean;
  e: HTMLDivElement;
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  seg: Seg | null = null;
  queue: Seg[] = [];
  task: string | null = null;
  next = 0;
  recent: Element[] = [];
  cont: { e: Element; top: number } | null = null;
  anchor: { x: number; y: number } | null = null;
  home = { x: 0, y: 0 };
  ph = rand(0, Math.PI * 2);
  w = rand(0.6, 1.2);
  r = rand(46, 120);
  soft = false;

  constructor(layer: HTMLElement, i: number) {
    this.i = i;
    const named = i < ROSTER.length;
    const r = named ? ROSTER[i] : { n: "", c: "#ffffff", dark: true };
    this.c = r.c;
    this.dark = !!r.dark;
    this.e = el(
      "div",
      "sw-agent" + (named ? "" : " anon"),
      `<i class="tool">${arrowSVG(this.c, this.dark)}</i>` +
        (named ? `<b style="background:${r.c}${this.dark ? ";color:#111" : ""}">${esc(r.n)}</b>` : ""),
    );
    const side = i % 2 ? 1 : -1;
    this.x = side > 0 ? innerWidth + rand(30, 140) : -rand(30, 140);
    this.y = rand(innerHeight * 0.15, innerHeight * 0.85);
    this.home = {
      x: rand(innerWidth * 0.12, innerWidth * 0.88),
      y: rand(innerHeight * 0.22, innerHeight * 0.78),
    };
    layer.appendChild(this.e);
    this.draw();
  }

  draw() {
    this.e.style.transform = `translate3d(${this.x.toFixed(1)}px,${this.y.toFixed(1)}px,0)`;
  }

  go(x: number, y: number, dur: number, u?: (p: number) => void, d?: () => void, ez?: Seg["ez"]) {
    this.queue.push({ x, y, dur, u, d, ez });
  }

  clear() {
    this.queue = [];
    this.seg = null;
  }

  stepSeg(dt: number): boolean {
    if (!this.seg && this.queue.length) {
      const s = this.queue.shift()!;
      s.fx = this.x;
      s.fy = this.y;
      s.t = 0;
      this.seg = s;
    }
    if (!this.seg) return false;
    const s = this.seg;
    s.t = (s.t ?? 0) + dt;
    const p = Math.min(1, s.t / s.dur);
    const ez = s.ez || (this.soft ? "sine" : "cubic");
    const e =
      ez === "lin"
        ? p
        : ez === "sine"
          ? (1 - Math.cos(Math.PI * p)) / 2
          : ez === "quad"
            ? p < 0.5
              ? 2 * p * p
              : 1 - Math.pow(-2 * p + 2, 2) / 2
            : ease(p);
    this.x = (s.fx ?? this.x) + (s.x - (s.fx ?? this.x)) * e;
    this.y = (s.fy ?? this.y) + (s.y - (s.fy ?? this.y)) * e;
    if (s.u) s.u(p);
    if (p >= 1) {
      this.seg = null;
      if (s.d) s.d();
    }
    return true;
  }

  idle(dt: number, now: number) {
    const hx = this.home.x + Math.cos((now / 900) * this.w + this.ph) * 26;
    const hy = this.home.y + Math.sin((now / 1100) * this.w + this.ph) * 18;
    this.vx += (hx - this.x) * 0.0025 * dt;
    this.vy += (hy - this.y) * 0.0025 * dt;
    this.vx *= 0.86;
    this.vy *= 0.86;
    this.x += this.vx;
    this.y += this.vy;
  }

  press() {
    this.e.classList.add("press");
    setTimeout(() => this.e.classList.remove("press"), 170);
  }

  travel(x: number, y: number) {
    return Math.max(340, Math.min(1000, Math.hypot(x - this.x, y - this.y) / 1.4));
  }
}

interface RectLike {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

function makeBox(host: HTMLElement, r: { left: number; top: number; width: number; height: number }, kind = "") {
  const b = el("div", "sw-box" + (kind ? " " + kind : ""));
  b.style.left = r.left + "px";
  b.style.top = r.top + "px";
  b.style.width = r.width + "px";
  b.style.height = r.height + "px";
  b.innerHTML = "<i></i><i></i><i></i><i></i><em></em>";
  host.appendChild(b);
  return b;
}

/* ---------- the resident swarm controller ---------- */
function Swarm() {
  const { motion, editing, mounted } = useSite();
  const layerRef = useRef<HTMLDivElement>(null);
  const fxRef = useRef<HTMLDivElement>(null);
  const enabled = mounted && motion && !editing;

  useEffect(() => {
    const layer = layerRef.current;
    const fx = fxRef.current;
    if (!enabled || !layer || !fx) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let small = window.innerWidth < 820;
    const fine = window.matchMedia("(pointer: fine)").matches;

    let on = true;
    let raf = 0;
    let last = 0;
    let mx = -1;
    let my = -1;
    let lastMove = 0;
    const busy: Element[] = [];
    const agents: Agent[] = [];

    const nAgents = small ? 4 : ROSTER.length;
    for (let i = 0; i < nAgents; i++) agents.push(new Agent(layer, i));

    /* ---- rush-in entrance: fly from the screen edge to a home spot ---- */
    agents.forEach((a, k) => {
      setTimeout(() => {
        if (!on) return;
        a.soft = true;
        a.go(a.home.x, a.home.y, rand(620, 980), undefined, () => {
          a.soft = false;
          a.next = performance.now() + rand(1400, small ? 9000 : 16000);
        }, "sine");
      }, 120 + k * 85);
    });

    const isBusy = (e: Element) =>
      busy.some((b) => b === e || b.contains(e) || e.contains(b));

    const release = (a: Agent, e: Element, quick = false) => {
      const i = busy.indexOf(e);
      if (i > -1) busy.splice(i, 1);
      a.task = null;
      a.anchor = null;
      a.next = performance.now() + (quick ? rand(300, 900) : rand(small ? T.restMinSmall : T.restMin, small ? T.restMaxSmall : T.restMax));
      a.recent.unshift(e);
      if (a.recent.length > 4) a.recent.pop();
    };

    const inView = (r: DOMRect | RectLike, pad = 0) =>
      r.width > 8 &&
      r.height > 6 &&
      r.top > 72 + pad &&
      r.bottom < innerHeight - 24 - pad &&
      r.left > -2 &&
      r.right < innerWidth + 2;

    /* merge client rects into visual text lines */
    const lines = (e: Element): RectLike[] => {
      const rg = document.createRange();
      rg.selectNodeContents(e);
      const rs = Array.from(rg.getClientRects());
      const out: RectLike[] = [];
      for (const r of rs) {
        if (r.width < 2 || r.height < 6) continue;
        let merged = false;
        for (const L of out) {
          if (Math.abs(L.top - r.top) < 6 || (r.top < L.bottom - 4 && r.bottom > L.top + 4)) {
            L.left = Math.min(L.left, r.left);
            L.right = Math.max(L.right, r.right);
            L.top = Math.min(L.top, r.top);
            L.bottom = Math.max(L.bottom, r.bottom);
            L.width = L.right - L.left;
            L.height = L.bottom - L.top;
            merged = true;
            break;
          }
        }
        if (!merged)
          out.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height });
      }
      return out
        .filter((L) => {
          const ok =
            L.right - L.left > 60 &&
            inView({ left: L.left, right: L.right, top: L.top, bottom: L.bottom, width: L.right - L.left, height: L.bottom - L.top });
          return ok;
        })
        .sort((p, q) => p.top - q.top);
    };

    type Opt = { type: "read" | "click" | "inspect"; e: Element; d: number };
    const options = (a: Agent): Opt[] => {
      const out: Opt[] = [];
      const sets: Array<[Opt["type"], string]> = [
        ["read", READ_SEL],
        ["click", CLICK_SEL],
        ["inspect", INSPECT_SEL],
      ];
      for (const [type, sel] of sets) {
        document.querySelectorAll(sel).forEach((e) => {
          if (e.closest(".sw-live") || isBusy(e) || a.recent.indexOf(e) > -1) return;
          if (!document.contains(e)) return;
          const r = e.getBoundingClientRect();
          if (r.bottom < 80 || r.top > innerHeight - 30 || r.width < 8) return;
          const nx = Math.max(r.left, Math.min(a.x, r.right));
          const ny = Math.max(r.top, Math.min(a.y, r.bottom));
          out.push({ type, e, d: Math.hypot(nx - a.x, ny - a.y) * rand(0.85, 1.15) });
        });
      }
      return out.sort((p, q) => p.d - q.d);
    };

    /* ---- task: read one line of text, leaving a highlight ---- */
    const doRead = (a: Agent, e: Element, L: RectLike) => {
      busy.push(e);
      a.task = "read";
      const y = L.top + (L.bottom - L.top) * 0.5;
      a.go(L.left - 3, y, a.travel(L.left - 3, y), undefined, () => {
        if (!on) return release(a, e, true);
        const h = L.bottom - L.top;
        const hl = el("div", "sw-hl");
        hl.style.cssText = `left:${L.left}px;top:${L.top + 1}px;height:${h - 2}px;width:0;background:${rgba(a.c, 0.22)};box-shadow:inset -2px 0 0 ${a.c}`;
        fx.appendChild(hl);
        const w = L.right - L.left;
        a.go(
          L.right,
          y,
          Math.max(900, (w / (small ? T.readSpeedSmall : T.readSpeed)) * 1000),
          (p) => {
            hl.style.width = w * p + "px";
          },
          () => {
            setTimeout(() => {
              hl.classList.add("gone");
              setTimeout(() => hl.remove(), 900);
            }, 550);
            const more = lines(e).some((l) => l.top > L.top + 4) && Math.random() < 0.6;
            a.cont = more ? { e, top: L.top } : null;
            a.go(a.x + rand(6, 20), a.y + rand(6, 16), 350, undefined, () => release(a, e, more), "lin");
          },
          "lin",
        );
      });
    };

    /* ---- task: click a button (visual only) ---- */
    const doClick = (a: Agent, e: Element): boolean => {
      const r = e.getBoundingClientRect();
      if (!inView(r)) return false;
      const x = r.left + r.width * rand(0.3, 0.7);
      const y = r.top + r.height * rand(0.35, 0.65);
      const host = (e.closest(".card") as Element) || e;
      busy.push(e);
      a.task = "click";
      a.go(x, y, a.travel(x, y), undefined, () => {
        if (!on) return release(a, e, true);
        const box = makeBox(fx, r, "sel");
        const lab = box.querySelector("em")!;
        box.style.borderColor = a.c;
        lab.style.background = a.c;
        if (a.dark) lab.style.color = "#111";
        const label = (e.getAttribute("aria-label") || e.textContent || "").replace(/\s+/g, " ").trim();
        lab.textContent = label ? (label.length > 12 ? label.slice(0, 12) + "…" : label) : "Click";
        host.classList.add("sw-hover");
        setTimeout(() => {
          if (!on) return;
          a.press();
          const rp = el("div", "sw-ripple");
          rp.style.left = x + "px";
          rp.style.top = y + "px";
          rp.style.borderColor = a.c;
          fx.appendChild(rp);
          setTimeout(() => rp.remove(), 1500);
        }, 400);
        setTimeout(() => {
          if (!on) return;
          host.classList.remove("sw-hover");
          box.classList.add("gone");
          setTimeout(() => box.remove(), 900);
          a.go(a.x + rand(-40, 40), a.y + rand(20, 50), 450, undefined, () => release(a, e));
        }, 1600);
      });
      return true;
    };

    /* ---- task: marquee-select an image/title, showing its size ---- */
    const doInspect = (a: Agent, e: Element): boolean => {
      const r = e.getBoundingClientRect();
      if (!inView(r, 4) || r.width > innerWidth * 0.9) return false;
      busy.push(e);
      a.task = "inspect";
      a.go(r.left, r.top, a.travel(r.left, r.top), undefined, () => {
        if (!on) return release(a, e, true);
        const b = makeBox(fx, { left: r.left, top: r.top, width: 0, height: 0 });
        const lab = b.querySelector("em")!;
        b.style.borderColor = a.c;
        lab.style.background = a.c;
        if (a.dark) lab.style.color = "#111";
        a.go(
          r.right,
          r.bottom,
          Math.max(600, Math.hypot(r.width, r.height) / T.travelSpeed),
          (p) => {
            const q = ease(p);
            b.style.width = r.width * q + "px";
            b.style.height = r.height * q + "px";
            lab.textContent = Math.round(r.width * q) + " × " + Math.round(r.height * q);
          },
          () => {
            setTimeout(() => {
              b.classList.add("gone");
              setTimeout(() => b.remove(), 900);
              release(a, e);
            }, 1200);
          },
        );
      });
      return true;
    };

    const startTask = (a: Agent): boolean => {
      /* 1. continue reading the previous paragraph */
      const c = a.cont;
      a.cont = null;
      if (c && document.contains(c.e) && !isBusy(c.e)) {
        const ls = lines(c.e);
        for (const l of ls)
          if (l.top > c.top + 4) {
            doRead(a, c.e, l);
            return true;
          }
      }
      /* 2. pick something nearby (nearest first, some randomness) */
      const opts = options(a);
      for (let k = 0; k < opts.length && k < 10; k++) {
        if (k < opts.length - 1 && Math.random() < 0.3) continue;
        const o = opts[k];
        if (o.type === "read") {
          const ls = lines(o.e);
          if (!ls.length) continue;
          ls.sort(
            (p, q) =>
              Math.abs((p.top + p.bottom) / 2 - a.y) - Math.abs((q.top + q.bottom) / 2 - a.y),
          );
          doRead(a, o.e, ls[0]);
          return true;
        }
        if (o.type === "click" && doClick(a, o.e)) return true;
        if (o.type === "inspect" && doInspect(a, o.e)) return true;
      }
      return false;
    };

    const drift = (a: Agent, now: number, dt: number) => {
      if (!a.anchor)
        a.anchor = {
          x: Math.max(30, Math.min(innerWidth - 60, a.x)),
          y: Math.max(90, Math.min(innerHeight - 50, a.y)),
        };
      const hx = a.anchor.x + Math.cos((now / 1500) * a.w + a.ph) * 34;
      const hy = a.anchor.y + Math.sin((now / 1900) * a.w + a.ph * 1.3) * 24;
      a.vx += (hx - a.x) * 0.0012 * dt;
      a.vy += (hy - a.y) * 0.0012 * dt;
      a.vx *= 0.88;
      a.vy *= 0.88;
      a.x += a.vx;
      a.y += a.vy;
    };

    const tick = (now: number) => {
      if (!on) return;
      const dt = Math.min(40, now - (last || now));
      last = now;
      const mouseActive = fine && mx >= 0 && now - lastMove < 2800;
      let running = 0;
      for (const a of agents) if (a.task) running++;
      const maxBusy = small ? T.maxBusySmall : T.maxBusy;
      for (let i = 0; i < agents.length; i++) {
        const a = agents[i];
        if (a.task) {
          a.stepSeg(dt);
          a.draw();
          continue;
        }
        if (T.tasks && now >= a.next) {
          if (running < maxBusy && startTask(a)) {
            running++;
            a.stepSeg(dt);
            a.draw();
            continue;
          }
          a.next = now + rand(2000, 6000);
        }
        if (mouseActive) {
          /* orbit the mouse like collaborators in a design tool */
          if (a.seg || a.queue.length) a.clear();
          a.anchor = null;
          const ang = a.ph + (now / 1000) * 0.55 * a.w;
          const tx = mx + Math.cos(ang) * a.r + 10;
          const ty = my + Math.sin(ang) * a.r * 0.8 + 14;
          a.vx += (tx - a.x) * 0.0016 * dt;
          a.vy += (ty - a.y) * 0.0016 * dt;
          for (let j = 0; j < agents.length; j++) {
            if (j === i) continue;
            const b = agents[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 900 && d2 > 0.01) {
              const f = ((900 - d2) / 900) * 0.06 * dt;
              const d = Math.sqrt(d2);
              a.vx += (dx / d) * f;
              a.vy += (dy / d) * f;
            }
          }
          a.vx *= 0.9;
          a.vy *= 0.9;
          const sp = Math.hypot(a.vx, a.vy);
          if (sp > T.followMax) {
            a.vx *= T.followMax / sp;
            a.vy *= T.followMax / sp;
          }
          a.x += a.vx;
          a.y += a.vy;
        } else {
          if (a.seg || a.queue.length) a.stepSeg(dt);
          else drift(a, now, dt);
        }
        a.draw();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    /* ---- listeners ---- */
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX;
      my = e.clientY;
      lastMove = performance.now();
    };
    const onLeave = () => {
      lastMove = 0;
    };
    const interruptAll = () => {
      if (!on) return;
      const now = performance.now();
      for (const a of agents) {
        a.cont = null;
        a.anchor = null;
        if (a.task) {
          a.clear();
          a.task = null;
          a.next = now + rand(3000, 10000);
        }
      }
      busy.length = 0;
      Array.from(fx.children).forEach((c) => {
        c.classList.add("gone");
        setTimeout(() => c.remove(), 420);
      });
      document.querySelectorAll(".sw-hover").forEach((e2) => e2.classList.remove("sw-hover"));
    };
    const onScroll = () => interruptAll();
    const onResize = () => {
      interruptAll();
      small = window.innerWidth < 820;
    };
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        last = 0;
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      on = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      busy.length = 0;
      document.querySelectorAll(".sw-hover").forEach((e2) => e2.classList.remove("sw-hover"));
      layer.innerHTML = "";
      fx.innerHTML = "";
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div ref={fxRef} className="sw-fx" aria-hidden="true" />
      <div ref={layerRef} className="sw-live" aria-hidden="true" />
    </>
  );
}

export { Swarm };
