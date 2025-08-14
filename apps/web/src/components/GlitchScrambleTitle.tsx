"use client";
import { useEffect, useRef, useCallback, useState } from "react";

const GLYPHS = "█▓▒░/\\|_-=+*<>[](){}#?¡!¿@%&$§æÆøØß†‡ΔΣΛΨΩµ≠≈±«»^~·•";

export function GlitchScrambleTitle({
  as = "h1",
  children,
  intensity = 0.35,
  burstMs = 260,
  minPause = 1100,
  maxPause = 2400,
  loop = true,
  className = "",
  ...rest
}: {
  as?: keyof JSX.IntrinsicElements;
  children: string;
  intensity?: number;
  burstMs?: number;
  minPause?: number;
  maxPause?: number;
  loop?: boolean;
  className?: string;
  [key: string]: any;
}) {
  const Tag = as as any;
  // Reaktivní flags – mění se při toggle animací a při změně media query
  const computePrefersReduced = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const computeAnimationsDisabled = () => typeof document !== "undefined" && !!document.body?.classList.contains("no-animations");
  const [prefersReduced, setPrefersReduced] = useState<boolean>(computePrefersReduced);
  const [animationsDisabled, setAnimationsDisabled] = useState<boolean>(computeAnimationsDisabled);
  const rootRef = useRef<HTMLElement | null>(null);
  const layerRef = useRef<HTMLSpanElement | null>(null);
  const baseRef = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const setText = (t: string) => {
    if (!layerRef.current || !baseRef.current) return;
    layerRef.current.dataset.target = t;
    baseRef.current.textContent = t;
    layerRef.current.textContent = t;
  };

  useEffect(() => {
    setText(children);
    // malý kick, ať se efekt ukáže i bez loopu
    try { scrambleOnce(180); } catch {}
  }, [children]);

  function randomGlyph() {
    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }

  const scrambleOnce = useCallback((dur = burstMs) => {
    const layer = layerRef.current!;
    const target = (layer.dataset.target || "").toString();
    const original = target.split("");
    const len = original.length;
    const now = performance.now();

    const schedule = new Array(len).fill(0).map((_, i) => {
      const active = original[i] !== " " && Math.random() < intensity;
      const start = now + Math.random() * (dur * 0.35);
      const end = start + dur * (0.35 + Math.random() * 0.65);
      return { active, start, end };
    });

    const step = (t: number) => {
      let allDone = true;
      const out = original.map((ch, i) => {
        const s = schedule[i];
        if (!s.active || ch === " ") return ch;
        if (t < s.start) {
          allDone = false;
          return ch;
        }
        if (t >= s.end) {
          return ch;
        }
        allDone = false;
        return randomGlyph();
      });
      layer.textContent = out.join("");
      if (!allDone) rafRef.current = requestAnimationFrame(step);
      else layer.textContent = target;
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
  }, [burstMs, intensity]);

  useEffect(() => {
    if (prefersReduced || animationsDisabled || !loop) return;
    const loopPulse = () => {
      scrambleOnce();
      const pause = minPause + Math.random() * (maxPause - minPause);
      // setTimeout vrací number v browseru
      timerRef.current = window.setTimeout(loopPulse, pause) as unknown as number;
    };
    loopPulse();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [intensity, burstMs, minPause, maxPause, loop, prefersReduced, animationsDisabled, scrambleOnce]);

  useEffect(() => {
    const root = rootRef.current!;
    const onEnter = () => !prefersReduced && !animationsDisabled && scrambleOnce();
    root.addEventListener("pointerenter", onEnter);
    return () => root.removeEventListener("pointerenter", onEnter);
  }, [prefersReduced, animationsDisabled, scrambleOnce]);

  // Sleduj změny media query + custom event z control panelu
  useEffect(() => {
    let mql: MediaQueryList | null = null;
    if (typeof window !== 'undefined' && window.matchMedia) {
      mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      const onMQ = () => setPrefersReduced(!!mql?.matches);
      try { mql.addEventListener('change', onMQ); } catch { mql?.addListener(onMQ); }
      // initial sync
      onMQ();
    }
    const onAnimChange = () => setAnimationsDisabled(computeAnimationsDisabled());
    document.addEventListener('synthoma:animations-changed', onAnimChange as EventListener);
    // fallback: i klik mimo event by měl syncnout
    const onVisibility = () => setAnimationsDisabled(computeAnimationsDisabled());
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      if (mql) {
        const onMQ = () => setPrefersReduced(!!mql?.matches);
        try { mql.removeEventListener('change', onMQ); } catch { mql.removeListener(onMQ); }
      }
      document.removeEventListener('synthoma:animations-changed', onAnimChange as EventListener);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <Tag className={`glitch-title scramble-title ${className}`.trim()} data-glitch="on" ref={rootRef as any} {...rest}>
      <span className="scramble-base" ref={baseRef}>{children}</span>
      <span className="scramble-layer" ref={layerRef} data-target={children} aria-hidden="true"></span>
      <span className="sr-only">{children}</span>
    </Tag>
  );
}
