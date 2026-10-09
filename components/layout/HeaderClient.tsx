"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import styles from "./Header.module.css";

type DestinationMenuItem = {
  name: string;
  slug: string;
  region: "india" | "international";
  image: string | null;
  alt: string;
  tag: string;
};

type PackageMenuItem = {
  title: string;
  slug: string;
  destinations: string;
  duration: string;
};

type HeaderClientProps = {
  destinations: DestinationMenuItem[];
  packages: PackageMenuItem[];
  logo: string;
  siteName: string;
};

const ABOUT_LINKS = [
  { label: "Our Story", href: "/about" },
  { label: "Why MYC", href: "/#why-myc" },
  { label: "Contact", href: "/#contact" },
];

type DropdownKey = "destinations" | "packages" | "about" | null;

export default function HeaderClient({ destinations, packages, logo, siteName }: HeaderClientProps) {
  const [solid, setSolid] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<DropdownKey>(null);
  const headerRef = useRef<HTMLElement>(null);
  const internationalDestinations = destinations.filter((destination) => destination.region === "international");
  const indiaDestinations = destinations.filter((destination) => destination.region != "international");
  const featuredDestination = destinations.find((destination) => destination.image) ?? destinations[0];
  const displayName = siteName || "My Yatra Circle";

  useEffect(() => {
    function onScroll() {
      setSolid(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    }
    function onClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function toggleDropdown(key: Exclude<DropdownKey, null>) {
    setOpenDropdown((prev) => (prev === key ? null : key));
  }

  return (
    <header ref={headerRef} className={`${styles.header} ${solid ? styles.solid : ""}`}>
      <div className={styles.inner}>
        <Link aria-label={`${displayName} — home`} className={styles.brand} href="/">
          <Image
            alt=""
            aria-hidden="true"
            className={styles.brandMark}
            src={logo || "/images/myc-symbol-gold.png"}
            width={65}
            height={54}
          />
          <span className={styles.brandName}>{displayName}</span>
        </Link>

        <nav aria-label="Primary" className={styles.desktopNav}>
          <div className={styles.navItem}>
            <button
              aria-controls="nav-overlay"
              aria-expanded={openDropdown === "destinations"}
              aria-haspopup="true"
              className={`${styles.navlinkDrop} ${openDropdown === "destinations" ? styles.navlinkDropActive : ""}`}
              type="button"
              onClick={() => toggleDropdown("destinations")}
            >
              Destinations
              <ChevronIcon open={openDropdown === "destinations"} />
            </button>
          </div>
          <div className={styles.navItem}>
            <button
              aria-controls="nav-overlay"
              aria-expanded={openDropdown === "packages"}
              aria-haspopup="true"
              className={`${styles.navlinkDrop} ${openDropdown === "packages" ? styles.navlinkDropActive : ""}`}
              type="button"
              onClick={() => toggleDropdown("packages")}
            >
              Packages
              <ChevronIcon open={openDropdown === "packages"} />
            </button>
          </div>
          <Link className={styles.navlink} href="/experiences">
            Experiences
          </Link>
          <Link className={styles.navlink} href="/blogs">
            Blogs
          </Link>
          <div className={styles.navItem}>
            <button
              aria-controls="nav-about-panel"
              aria-expanded={openDropdown === "about"}
              aria-haspopup="true"
              className={`${styles.navlinkDrop} ${openDropdown === "about" ? styles.navlinkDropActive : ""}`}
              type="button"
              onClick={() => toggleDropdown("about")}
            >
              About
              <ChevronIcon open={openDropdown === "about"} />
            </button>
          </div>
        </nav>

        <div className={styles.desktopCta}>
          <Button href="/#journey-finder" sm>
            Plan Your Journey
          </Button>
        </div>

        <button
          aria-controls="mobile-nav"
          aria-expanded={mobileOpen}
          aria-label="Open menu"
          className={styles.hamburger}
          type="button"
          onClick={() => setMobileOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>

        <AnimatePresence>
          {openDropdown === "destinations" && (
            <motion.div
              id="nav-overlay"
              className={styles.overlay}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.overlayInner}>
                <div className={styles.overlayGrid}>
                  <div className={styles.overlayLinks}>
                    {internationalDestinations.length > 0 && (
                      <div className={styles.overlayGroup}>
                        <p className={styles.overlayGroupLabel}>International</p>
                        <ul className={styles.overlayList}>
                          {internationalDestinations.map((destination) => (
                            <li key={destination.slug}>
                              <Link
                                className={styles.overlayLink}
                                href={`/destinations/${destination.slug}`}
                                onClick={() => setOpenDropdown(null)}
                              >
                                {destination.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {indiaDestinations.length > 0 && (
                      <div className={styles.overlayGroup}>
                        <p className={styles.overlayGroupLabel}>Within India</p>
                        <ul className={styles.overlayList}>
                          {indiaDestinations.map((destination) => (
                            <li key={destination.slug}>
                              <Link
                                className={styles.overlayLink}
                                href={`/destinations/${destination.slug}`}
                                onClick={() => setOpenDropdown(null)}
                              >
                                {destination.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Link className={styles.overlayAllLink} href="/destinations" onClick={() => setOpenDropdown(null)}>
                      View All Destinations
                      <span aria-hidden="true" className="cta-arrow">→</span>
                    </Link>
                  </div>
                  {featuredDestination?.image && (
                    <Link
                      className={styles.overlayImagePanel}
                      href={`/destinations/${featuredDestination.slug}`}
                      onClick={() => setOpenDropdown(null)}
                    >
                      <div className={styles.overlayImage}>
                        <div className={styles.overlayImageFrame}>
                          <Image src={featuredDestination.image} alt={featuredDestination.alt} fill style={{ objectFit: "cover" }} />
                        </div>
                      </div>
                      <span className={styles.overlayImageLabel}>Featured Destination</span>
                      <span className={styles.overlayImageName}>{featuredDestination.name}</span>
                      <span className={styles.overlayImageDesc}>{featuredDestination.tag}</span>
                      <span className={styles.overlayImageCta}>
                        Explore {featuredDestination.name}
                        <span aria-hidden="true" className="cta-arrow">→</span>
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {openDropdown === "packages" && (
            <motion.div
              id="nav-overlay"
              className={styles.overlay}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.overlayInner}>
                <div className={styles.overlayGrid}>
                  <div className={styles.overlayLinks}>
                    {packages.length > 0 && (
                      <div className={styles.overlayGroup}>
                        <p className={styles.overlayGroupLabel}>Packages</p>
                        <ul className={styles.overlayList}>
                          <li>
                            <Link className={styles.overlayLink} href="/#journey-finder" onClick={() => setOpenDropdown(null)}>
                              Featured Packages
                            </Link>
                          </li>
                        </ul>
                      </div>
                    )}
                    <Link className={styles.overlayAllLink} href="/packages" onClick={() => setOpenDropdown(null)}>
                      View All Packages
                      <span aria-hidden="true" className="cta-arrow">→</span>
                    </Link>
                  </div>
                  {packages.length > 0 && (
                    <ul className={styles.overlayJourneyGrid}>
                      {packages.map((pkg) => (
                        <li key={pkg.slug}>
                          <Link className={styles.overlayJourneyLink} href={`/packages/${pkg.slug}`} onClick={() => setOpenDropdown(null)}>
                            <span className={styles.overlayJourneyTitle}>{pkg.title}</span>
                            <span className={styles.overlayJourneyMeta}>
                              {[pkg.destinations, pkg.duration].filter(Boolean).join(" · ")}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {openDropdown === "about" && (
            <motion.div
              id="nav-about-panel"
              className={styles.aboutPanel}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {ABOUT_LINKS.map((link) => (
                <Link key={link.href} className={styles.aboutLink} href={link.href} onClick={() => setOpenDropdown(null)}>
                  {link.label}
                </Link>
              ))}
              <p className={styles.aboutStatement}>Never templated. Always personal.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className={styles.scrim}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              id="mobile-nav"
              className={styles.mobilePanel}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.mobileHeader}>
                <span className={styles.brandName}>{displayName}</span>
                <button aria-label="Close menu" className={styles.closeBtn} type="button" onClick={() => setMobileOpen(false)}>
                  ✕
                </button>
              </div>
              <nav className={styles.mobileNav}>
                <MobileAccordion
                  label="Destinations"
                  open={mobileAccordion === "destinations"}
                  onToggle={() => setMobileAccordion((p) => (p === "destinations" ? null : "destinations"))}
                >
                  {destinations.map((destination) => (
                    <Link
                      key={destination.slug}
                      className={styles.mobileSubLink}
                      href={`/destinations/${destination.slug}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {destination.name}
                    </Link>
                  ))}
                  <Link className={styles.mobileSubLink} href="/destinations" onClick={() => setMobileOpen(false)}>
                    View All Destinations
                  </Link>
                </MobileAccordion>
                <MobileAccordion
                  label="Packages"
                  open={mobileAccordion === "packages"}
                  onToggle={() => setMobileAccordion((p) => (p === "packages" ? null : "packages"))}
                >
                  {packages.map((pkg) => (
                    <Link
                      key={pkg.slug}
                      className={styles.mobileSubLink}
                      href={`/packages/${pkg.slug}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {pkg.title}
                    </Link>
                  ))}
                  <Link className={styles.mobileSubLink} href="/packages" onClick={() => setMobileOpen(false)}>
                    View All Packages
                  </Link>
                </MobileAccordion>
                <Link className={styles.mobileTopLink} href="/experiences" onClick={() => setMobileOpen(false)}>
                  Experiences
                </Link>
                <Link className={styles.mobileTopLink} href="/blogs" onClick={() => setMobileOpen(false)}>
                  Blogs
                </Link>
                <MobileAccordion
                  label="About"
                  open={mobileAccordion === "about"}
                  onToggle={() => setMobileAccordion((p) => (p === "about" ? null : "about"))}
                >
                  {ABOUT_LINKS.map((link) => (
                    <Link key={link.href} className={styles.mobileSubLink} href={link.href} onClick={() => setMobileOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                </MobileAccordion>
              </nav>
              <div className={styles.mobileCta}>
                <Button href="/#journey-finder" onClick={() => setMobileOpen(false)}>
                  Plan Your Journey
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" fill="none" height="10" width="10" viewBox="0 0 12 12" style={{ transition: "transform 0.25s ease", transform: open ? "rotate(180deg)" : "none" }}>
      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
    </svg>
  );
}

function MobileAccordion({ label, open, onToggle, children }: { label: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className={styles.accordion}>
      <button aria-expanded={open} className={styles.accordionTrigger} type="button" onClick={onToggle}>
        {label}
        <ChevronIcon open={open} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className={styles.accordionPanel}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className={styles.accordionInner}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
