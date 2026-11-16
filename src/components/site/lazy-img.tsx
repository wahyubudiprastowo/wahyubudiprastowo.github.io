"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Lazy image with a skeleton shimmer + fade-in when the file actually
 * arrives. Uses native loading="lazy" + async decoding; before load it
 * shows the animated placeholder, after load it eases in. Falls back to
 * the `fallback` node on error (broken link / offline).
 */
export function LazyImg({
  src,
  alt,
  className,
  imgClassName,
  width,
  height,
  eager = false,
  fallback,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  width?: number;
  height?: number;
  /** hero/LCP images should be eager; everything else lazy-fades in */
  eager?: boolean;
  fallback?: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  // New src -> reset reveal state during render (React-recommended).
  if (prevSrc !== src) {
    setPrevSrc(src);
    setLoaded(false);
    setErr(false);
  }

  // Images served from cache never fire a load event; catch them when
  // the element attaches instead of in an effect.
  const attach = (el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth > 0) {
      setLoaded((was) => (was ? was : true));
    }
  };

  if (err) {
    return <>{fallback ?? null}</>;
  }

  return (
    <span
      className={cn("lazy-img", loaded && "is-loaded", eager && "is-eager", className)}
      aria-hidden={!loaded && !eager ? true : undefined}
    >
      <img
        ref={attach}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setErr(true)}
        className={imgClassName}
      />
    </span>
  );
}
