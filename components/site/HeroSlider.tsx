"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { youtubeId } from "@/lib/content-config";
import { Btn } from "@/components/site/ui";

export type Slide = {
  id: number; mediaUrl: string; mediaType: string;
  heading: string | null; subHeading: string | null; ctaText: string | null; ctaUrl: string | null;
};

function SlideMedia({ slide, index, current }: { slide: Slide; index: number; current: boolean }) {
  if (slide.mediaType === "youtube") {
    const id = youtubeId(slide.mediaUrl);
    if (!current || !id) return null; // only the visible slide plays, saves data
    return (
      <iframe title="" aria-hidden tabIndex={-1} allow="autoplay; encrypted-media"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&playsinline=1&rel=0`}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2" />
    );
  }
  if (slide.mediaType === "video") {
    if (!current) return null;
    return <video src={slide.mediaUrl} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />;
  }
  return <Image src={slide.mediaUrl} alt="" fill priority={index === 0} sizes="100vw" className="object-cover" />;
}

export default function HeroSlider({ slides, eyebrow, fallbackTitle }: { slides: Slide[]; eyebrow: string; fallbackTitle: string }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const count = slides.length;

  useEffect(() => { setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  useEffect(() => {
    if (count < 2 || paused || reduced) return;
    const t = setInterval(() => setActive((a) => (a + 1) % count), 7000);
    return () => clearInterval(t);
  }, [count, paused, reduced]);

  const cur = slides[active];
  const heading = cur?.heading ?? (count === 0 ? fallbackTitle : null);
  const hasText = !!(heading || cur?.subHeading || cur?.ctaText);
  const primary = cur?.ctaText ? { text: cur.ctaText, href: cur.ctaUrl || "/customized-holidays" } : { text: "Plan your journey", href: "/customized-holidays" };

  return (
    <section aria-roledescription="carousel" aria-label="Featured journeys"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-navy">
      {count === 0 ? (
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-2 to-navy" />
      ) : (
        slides.map((s, i) => (
          <div key={s.id} aria-hidden={i !== active}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === active ? "opacity-100" : "opacity-0"}`}>
            <SlideMedia slide={s} index={i} current={i === active} />
          </div>
        ))
      )}

      {/* dark overlays keep the white text readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/35 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-navy/40" />

      {hasText && (
        <div key={active} className="relative z-10 mx-auto w-full max-w-[1200px] px-6 pb-24 pt-40 md:px-10 md:pb-32 xl:px-0 animate-fade-up">
          {heading && eyebrow && <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>}
          {heading && <h1 className="max-w-3xl text-[2.75rem] font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">{heading}</h1>}
          {cur?.subHeading && <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-white/90 md:text-xl">{cur.subHeading}</p>}
          <div className="mt-9 flex flex-wrap gap-4">
            <Btn href={primary.href} variant="gold">{primary.text}</Btn>
            <Btn href="/destinations" variant="outline">Explore destinations</Btn>
          </div>
        </div>
      )}

      {count > 1 && (
        <div className="absolute bottom-8 right-6 z-10 flex gap-2 lg:right-14" role="tablist" aria-label="Choose slide">
          {slides.map((s, i) => (
            <button key={s.id} type="button" role="tab" aria-selected={i === active} aria-label={`Slide ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-1 w-9 transition-colors ${i === active ? "bg-gold" : "bg-white/40 hover:bg-white/70"}`} />
          ))}
        </div>
      )}
    </section>
  );
}
