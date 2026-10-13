"use client";

import * as React from "react";
import { motion, type Transition } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PerspectiveCarouselItem {
  src?: string | null;
  title: string;
  alt?: string;
  designation?: string;
  bio?: string;
}

export interface PerspectiveCarouselProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: PerspectiveCarouselItem[];
  activeIndex?: number;
  defaultActiveIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  loop?: boolean;
  slideWidth?: number;
  rotationStep?: number;
  inactiveScale?: number;
  transition?: Transition;
  showControls?: boolean;
  showDots?: boolean;
  viewportClassName?: string;
  slideClassName?: string;
  imageClassName?: string;
  labelClassName?: string;
  designationClassName?: string;
  bioClassName?: string;
  controlsClassName?: string;
}

const DEFAULT_TRANSITION: Transition = {
  type: "spring",
  bounce: 0.14,
  duration: 0.9,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function PerspectiveCarousel({
  items,
  activeIndex,
  defaultActiveIndex = 0,
  onActiveIndexChange,
  loop = false,
  slideWidth = 200,
  rotationStep = 60,
  inactiveScale = 0.85,
  transition = DEFAULT_TRANSITION,
  showControls = true,
  showDots = true,
  viewportClassName,
  slideClassName,
  imageClassName,
  labelClassName,
  designationClassName,
  bioClassName,
  controlsClassName,
  className,
  onKeyDown,
  tabIndex,
  ...props
}: PerspectiveCarouselProps) {
  const bioDialogRef = React.useRef<HTMLDialogElement>(null);
  const [selectedBio, setSelectedBio] = React.useState<PerspectiveCarouselItem | null>(null);
  const maxIndex = Math.max(0, items.length - 1);
  const [uncontrolledIndex, setUncontrolledIndex] = React.useState(() =>
    clamp(defaultActiveIndex, 0, maxIndex)
  );
  const currentIndex = clamp(activeIndex ?? uncontrolledIndex, 0, maxIndex);
  const safeSlideWidth = Math.max(96, slideWidth);
  const safeInactiveScale = clamp(inactiveScale, 0.5, 1);

  React.useEffect(() => {
    const dialog = bioDialogRef.current;
    if (!dialog) return;

    if (selectedBio && !dialog.open) {
      dialog.showModal();
    } else if (!selectedBio && dialog.open) {
      dialog.close();
    }
  }, [selectedBio]);

  const selectSlide = React.useCallback(
    (nextIndex: number) => {
      if (!items.length) {
        return;
      }

      const resolvedIndex = loop
        ? (nextIndex + items.length) % items.length
        : clamp(nextIndex, 0, maxIndex);

      if (activeIndex === undefined) {
        setUncontrolledIndex(resolvedIndex);
      }

      onActiveIndexChange?.(resolvedIndex);
    },
    [activeIndex, items.length, loop, maxIndex, onActiveIndexChange]
  );

  if (!items.length) {
    return null;
  }

  const isPreviousDisabled = !loop && currentIndex === 0;
  const isNextDisabled = !loop && currentIndex === maxIndex;
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectSlide(currentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectSlide(currentIndex + 1);
    }
  };

  return (
    <>
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Perspective image carousel"
      tabIndex={tabIndex ?? 0}
      onKeyDown={handleKeyDown}
      className={cn("relative isolate h-full w-full overflow-hidden", className)}
      {...props}
    >
      <div
        className={cn("absolute inset-0 overflow-hidden", viewportClassName)}
        style={{ perspective: "1200px" }}
      >
        <motion.div
          className="absolute left-1/2 top-1/2 flex w-fit -translate-y-1/2 items-center"
          animate={{ x: -(currentIndex * safeSlideWidth + safeSlideWidth / 2) }}
          transition={transition}
        >
          {items.map((item, index) => {
            const isActive = currentIndex === index;

            return (
              <div
                key={`${item.src ?? item.title}-${index}`}
                className="shrink-0"
                style={{ width: safeSlideWidth, perspective: "1200px" }}
              >
                <motion.div
                  className={cn(
                    "flex w-full flex-col items-center gap-3 will-change-transform",
                    slideClassName
                  )}
                  animate={{
                    rotateY: (currentIndex - index) * rotationStep,
                    scale: isActive ? 1 : safeInactiveScale,
                  }}
                  transition={transition}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <button
                    type="button"
                    aria-label={`Show ${item.title}`}
                    aria-current={isActive ? "true" : undefined}
                    className="aspect-[3/4] w-full cursor-pointer"
                    onClick={() => selectSlide(index)}
                  >
                    {item.src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.src}
                        alt={item.alt ?? item.title}
                        draggable={false}
                        className={cn(
                          "h-full w-full select-none rounded-lg object-cover shadow-xl",
                          imageClassName
                        )}
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="flex h-full w-full items-center justify-center rounded-lg bg-neutral-200 text-5xl font-semibold text-neutral-500 shadow-xl dark:bg-neutral-800 dark:text-neutral-300"
                      >
                        {item.title.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </button>

                  <motion.p
                    className={cn("whitespace-nowrap text-sm", labelClassName)}
                    animate={{
                      filter: isActive ? "blur(0px)" : "blur(2px)",
                      opacity: isActive ? 1 : 0,
                    }}
                    transition={transition}
                  >
                    {item.title}
                  </motion.p>
                  {item.designation && (
                    <motion.p
                      className={designationClassName}
                      animate={{
                        filter: isActive ? "blur(0px)" : "blur(2px)",
                        opacity: isActive ? 1 : 0,
                      }}
                      transition={transition}
                    >
                      {item.designation}
                    </motion.p>
                  )}
                  {item.bio && (
                    <>
                      <motion.p
                        className={bioClassName}
                        animate={{
                          filter: isActive ? "blur(0px)" : "blur(2px)",
                          opacity: isActive ? 1 : 0,
                        }}
                        transition={transition}
                      >
                        {item.bio}
                      </motion.p>
                      <motion.button
                        type="button"
                        className="text-xs font-semibold text-[var(--gold-dark)] underline underline-offset-2 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold-dark)]"
                        animate={{
                          filter: isActive ? "blur(0px)" : "blur(2px)",
                          opacity: isActive ? 1 : 0,
                        }}
                        transition={transition}
                        onClick={() => setSelectedBio(item)}
                        aria-label={`Read the full bio for ${item.title}`}
                      >
                        Read full bio
                      </motion.button>
                    </>
                  )}
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {showControls && (
        <div
          className={cn(
            "absolute inset-x-4 bottom-5 z-10 mx-auto flex w-fit items-center justify-center gap-3 rounded-full border border-neutral-300/80 bg-neutral-200/70 px-2 text-neutral-700 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-100",
            controlsClassName
          )}
        >
          <button
            type="button"
            aria-label="Show previous slide"
            disabled={isPreviousDisabled}
            className="inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-35 dark:hover:bg-white/10"
            onClick={() => selectSlide(currentIndex - 1)}
          >
            <ChevronLeft className="size-5" />
          </button>

          {showDots && (
            <div className="flex items-center justify-center gap-2">
              {items.map((item, index) => (
                <button
                  key={`${item.title}-${index}`}
                  type="button"
                  aria-label={`Show slide ${index + 1}: ${item.title}`}
                  aria-current={currentIndex === index ? "true" : undefined}
                  className={cn(
                    "h-2 rounded-full bg-current transition-[width,opacity] duration-300",
                    currentIndex === index ? "w-7 opacity-100" : "w-2 opacity-30"
                  )}
                  onClick={() => selectSlide(index)}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            aria-label="Show next slide"
            disabled={isNextDisabled}
            className="inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-35 dark:hover:bg-white/10"
            onClick={() => selectSlide(currentIndex + 1)}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </div>
    <dialog
      ref={bioDialogRef}
      aria-labelledby="team-member-dialog-title"
      onClose={() => setSelectedBio(null)}
      className="m-auto max-h-[85vh] w-[min(36rem,92vw)] overflow-y-auto rounded-2xl border-0 bg-white p-0 text-neutral-800 shadow-2xl backdrop:bg-black/60"
    >
      {selectedBio && (
        <article className="relative p-6 sm:p-8">
          <button
            type="button"
            aria-label="Close bio"
            onClick={() => bioDialogRef.current?.close()}
            className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-neutral-100 text-xl text-neutral-600 transition-colors hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold-dark)]"
          >
            ×
          </button>
          {selectedBio.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selectedBio.src}
              alt={selectedBio.alt ?? selectedBio.title}
              className="mb-5 h-32 w-32 rounded-full object-cover shadow-md"
            />
          ) : (
            <div
              aria-hidden="true"
              className="mb-5 flex size-32 items-center justify-center rounded-full bg-neutral-200 text-5xl font-semibold text-neutral-500"
            >
              {selectedBio.title.charAt(0).toUpperCase()}
            </div>
          )}
          <h2 id="team-member-dialog-title" className="pr-10 text-2xl font-semibold text-neutral-900">
            {selectedBio.title}
          </h2>
          {selectedBio.designation && (
            <p className="mt-1 font-medium text-[var(--gold-dark)]">{selectedBio.designation}</p>
          )}
          <p className="mt-5 whitespace-pre-wrap text-left leading-7 text-neutral-700">{selectedBio.bio}</p>
        </article>
      )}
    </dialog>
    </>
  );
}

export default PerspectiveCarousel;
