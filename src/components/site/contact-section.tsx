"use client";

import { useSite } from "./site-context";
import { Ed } from "./ed";
import { Rv } from "./rv";
import { Ico } from "./ico";
import { Magnetic } from "./magnetic";
import { LazyImg } from "./lazy-img";

export function ContactSection() {
  const { content, editing } = useSite();
  const c = content.contact;

  return (
    <section className="section" id="contact" aria-labelledby="contact-title">
      <div className="contact">
        <Rv className="contact-left">
          <p className="label">
            <b>{c.num}</b> / <Ed p="contact.label" />
          </p>
          <Ed
            p="contact.titleEn"
            tag="h2"
            className="h-en font-display"
            id="contact-title"
          />
          <span className="h-zh">
            <Ed p="contact.titleSub" />
            <i className="r" aria-hidden="true">.</i>
          </span>
          <Ed p="contact.lede" tag="p" className="lede" />
          <Magnetic className="mag-cta">
            <a
              className="circle-cta"
              href={c.ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (editing || c.ctaHref === "#") e.preventDefault();
              }}
            >
              <span className="c" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M8 7h9v9" />
                </svg>
              </span>
              <Ed p="contact.cta" />
            </a>
          </Magnetic>
        </Rv>

        <Rv className="contact-list" delay={120}>
          {c.items.map((it, i) => (
            <Rv key={it.id} as="a" className="ci" href={it.href} target={it.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
              onClick={(e: React.MouseEvent) => {
                if (editing || it.href === "#") e.preventDefault();
              }}
            >
              <span className="ico">
                <Ico name={it.icon} size={20} />
              </span>
              <span className="ct">
                <small>
                  <Ed p={`contact.items.${i}.small`} />
                </small>
                <Ed p={`contact.items.${i}.main`} />
              </span>
              <span className="ca" aria-hidden="true">&#8599;</span>
            </Rv>
          ))}
        </Rv>

        {/* POPOLAB-style tilted character card (GTA VI edition). */}
        <Rv className="tilt-wrap" delay={200}>
          <a
            className="tilt-card"
            href={c.ctaHref}
            target={c.ctaHref.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            aria-label="Contact card — open to work"
            onClick={(e) => {
              if (editing || c.ctaHref === "#") e.preventDefault();
            }}
          >
            <div className="tc-top">
              <span className="label">
                <b>GTA VI</b> / me &amp; Ria
              </span>
              <span className="label">
                <b>Open to work</b>
              </span>
            </div>
            <LazyImg
              src={c.tiltImg}
              alt={c.tiltImgAlt}
              width={800}
              height={1067}
              className="tc-img"
            />
            <span className="tc-title font-display">
              <Ed p="contact.tiltTitle" />
            </span>
          </a>
        </Rv>
      </div>

      <Rv className="support">
        <p className="sp-big font-display">
          <Ed p="contact.keepTitle" />
        </p>
        <Ed p="contact.keepBody" tag="p" />
        <Magnetic>
          <a
            className="btn btn-red"
            href={c.keepHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (editing || c.keepHref === "#") e.preventDefault();
            }}
          >
            <Ed p="contact.keepBtn" /> <span className="arr" aria-hidden="true">&#8599;</span>
          </a>
        </Magnetic>
      </Rv>
    </section>
  );
}
