"use client";

import { useMemo, useState } from "react";
import { useSite } from "./site-context";
import { Ed } from "./ed";
import { Rv } from "./rv";
import { LazyImg } from "./lazy-img";
import { cn } from "@/lib/utils";
import type { ProjectItem } from "@/lib/site-content";

/** GitHub repo link -> its live OpenGraph preview card (1200x600). */
function ogFor(p: ProjectItem): string {
  if (p.img) return p.img;
  const m = p.url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)/);
  return m ? `https://opengraph.githubassets.com/1/${m[1]}/${m[2]}` : "";
}

function ProjectThumb({ p, no }: { p: ProjectItem; no: string }) {
  const og = ogFor(p);
  const fb = (
    <div className="thumb-fb" aria-hidden="true">
      <span className="fb-ghost font-display">{no}</span>
      <span className="fb-title font-display">{p.title}</span>
      <span className="fb-foot">
        <i>GITHUB / WAHYUBUDIPRASTOWO</i>
        <b>{p.lang}</b>
      </span>
    </div>
  );
  if (!og) return fb;
  return (
    <LazyImg
      src={og}
      alt={`Preview of project ${p.title}`}
      width={1200}
      height={600}
      className="thumb-lazy"
      fallback={fb}
    />
  );
}

/** Settings panel for one project card (only visible in Edit Mode). */
function CardSettings({ p, onClose }: { p: ProjectItem; onClose: () => void }) {
  const { content, updateProject, removeProject } = useSite();
  const field = (key: keyof ProjectItem, label: string, type = "text") => (
    <label className="cs-field">
      <span>{label}</span>
      <input
        type={type}
        value={p[key] as string}
        onChange={(e) => updateProject(p.id, { [key]: e.target.value })}
      />
    </label>
  );
  return (
    <div className="card-settings" role="dialog" aria-label={`Card settings for ${p.title}`}>
      <div className="cs-head">
        <span>Card settings</span>
        <button type="button" onClick={onClose} aria-label="Close">&times;</button>
      </div>
      {field("title", "Title")}
      {field("small", "Subtitle (tech / year)")}
      {field("hook", "Hook (one catchy sentence)")}
      {field("url", "URL (GitHub, website, etc.)")}
      {field("lang", "Main language / tech")}
      {field("tag", "Chip label on thumbnail")}
      {field("img", "Thumbnail image URL (empty = fallback)")}
      <label className="cs-field">
        <span>Category</span>
        <select value={p.cat} onChange={(e) => updateProject(p.id, { cat: e.target.value })}>
          {content.work.tabs
            .filter((t) => t.id !== "all")
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
        </select>
      </label>
      <button
        type="button"
        className="cs-delete"
        onClick={() => {
          if (window.confirm(`Delete the card "${p.title}" from the list?`)) {
            removeProject(p.id);
            onClose();
          }
        }}
      >
        Delete this card
      </button>
    </div>
  );
}

export function WorkSection() {
  const { content, editing, addProject } = useSite();
  const [tab, setTab] = useState("all");
  const [openSettings, setOpenSettings] = useState<string | null>(null);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of content.projects) m.set(p.cat, (m.get(p.cat) ?? 0) + 1);
    return m;
  }, [content.projects]);

  const shown =
    tab === "all" ? content.projects : content.projects.filter((p) => p.cat === tab);

  // Red spotlight follows the pointer across the card surface.
  const spot = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <Rv className="section-head">
        <div>
          <p className="label">
            <b>{content.work.num}</b> / <Ed p="work.label" />
          </p>
          <Ed p="work.titleEn" tag="h2" className="h-en font-display" id="work-title" />
          <span className="h-zh">
            <Ed p="work.titleSub" />
            <i className="r" aria-hidden="true">.</i>
          </span>
        </div>
        <p className="small">
          <Ed p="work.aside" />
        </p>
      </Rv>

      <Rv className="tabs-wrap">
        <div className="tabs" role="tablist" aria-label="Filter projects">
          {content.work.tabs.map((t) => {
            const n = t.id === "all" ? content.projects.length : (counts.get(t.id) ?? 0);
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={cn("tab", tab === t.id && "is-active")}
                onClick={() => setTab(t.id)}
              >
                {t.label}
                <sup>{n}</sup>
              </button>
            );
          })}
        </div>
      </Rv>

      <div className="work-grid">
        {shown.map((p, idx) => {
          const no = String(content.projects.indexOf(p) + 1).padStart(2, "0");
          const inner = (
            <>
              <div className="thumb">
                <span className="tag">{p.tag}</span>
                <ProjectThumb p={p} no={no} />
              </div>
              <div className="meta">
                <span className="no">{no}</span>
                <span className="ttl">
                  {p.title}
                  <small>
                    {p.small}
                    <span className="lang-chip">{p.lang}</span>
                  </small>
                  <span className="hook">{p.hook}</span>
                </span>
                {!editing && <span className="go" aria-hidden="true">&#8599;</span>}
                {editing && (
                  <button
                    type="button"
                    className="card-gear"
                    onClick={() => setOpenSettings(openSettings === p.id ? null : p.id)}
                    aria-label={`Card settings for ${p.title}`}
                    aria-expanded={openSettings === p.id}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.09a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" />
                    </svg>
                  </button>
                )}
              </div>
            </>
          );

          return (
            <Rv className="card-wrap" key={p.id} delay={(idx % 3) * 70}>
              {editing ? (
                <div className="card is-editing" aria-label={`Project card ${p.title}`}>
                  {inner}
                </div>
              ) : (
                <a
                  className="card"
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="view"
                  data-cursor-label="Open"
                  onMouseMove={spot}
                  onClick={(e) => {
                    if (p.url === "#") e.preventDefault();
                  }}
                >
                  {inner}
                </a>
              )}
              {openSettings === p.id && (
                <CardSettings p={p} onClose={() => setOpenSettings(null)} />
              )}
            </Rv>
          );
        })}
      </div>

      {editing && (
        <div className="add-row">
          <button type="button" className="btn btn-line" onClick={addProject}>
            + {content.work.addBtn}
          </button>
        </div>
      )}

      <Rv as="p" className="grid-note">
        <Ed p="work.note" />
      </Rv>

      <Rv className="tools">
        <p className="label">
          <Ed p="work.toolsLabel" />
          <br />
          <b>{content.work.toolsLabelSub}</b>
        </p>
        <ul>
          {content.work.tools.map((tl, i) => (
            <li key={`tool-${i}`}>{tl}</li>
          ))}
        </ul>
      </Rv>
    </section>
  );
}
