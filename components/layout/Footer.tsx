import Link from "next/link";
import { getActivePages, getDestinations, getPackages, getSiteSettings, getSocialLinks } from "@/lib/site-data";
import { platformLabel } from "@/lib/settings-config";
import styles from "./Footer.module.css";

const ABOUT_LINKS = [
  { label: "Our Story", href: "/about" },
  { label: "Why MYC", href: "/#why-myc" },
  { label: "Contact", href: "/#contact" },
];

const EXPLORE_LINKS = [
  { label: "Experiences", href: "/experiences" },
  { label: "Blogs", href: "/blogs" },
];

export default async function Footer() {
  const [destinations, packages, settings, socialLinks, activePages] = await Promise.all([
    getDestinations(),
    getPackages(),
    getSiteSettings(),
    getSocialLinks(),
    getActivePages(),
  ]);
  const year = new Date().getFullYear();
  const destinationLinks = [
    ...destinations.slice(0, 6).map((destination) => ({
      label: destination.name,
      href: `/destinations/${destination.slug}`,
    })),
    { label: "All Destinations", href: "/destinations" },
  ];
  const packageLinks = [
    ...packages
      .filter((pkg) => pkg.isFeatured)
      .slice(0, 4)
      .map((pkg) => ({ label: pkg.title, href: `/packages/${pkg.slug}` })),
    { label: "All Packages", href: "/packages" },
  ];
  const groups = [
    { heading: "Destinations", links: destinationLinks },
    { heading: "Packages", links: packageLinks },
    { heading: "Explore", links: EXPLORE_LINKS },
    { heading: "About", links: ABOUT_LINKS },
  ];
  const legalLinks = [...activePages.entries()]
    .filter(([slug, title]) => /privacy|terms|cancellation|cookie|disclaimer/i.test(`${slug} ${title}`))
    .map(([slug, title]) => ({ label: title, href: `/${slug}` }));
  const copyrightText = (
    settings.copyrightText || "© {year} My Yatra Circle. All rights reserved."
  ).replace(/\{year\}/g, String(year));

  return (
    <footer id="contact" className={styles.footer}>
      <p className={styles.brandLine}>
        {settings.footerText || "My Yatra Circle — Curated journeys. Thoughtfully made."}
      </p>

      <div className={styles.top}>
        <div className={styles.linkGrid}>
          {groups.map((group) => (
            <div key={group.heading}>
              <p className={styles.groupHeading}>{group.heading}</p>
              <div className={styles.groupLinks}>
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} className={styles.groupLink}>
                    {link.label}
                  </Link>
                ))}
              </div>
              {group.heading === "Explore" && socialLinks.length > 0 && (
                <>
                  <p className={styles.groupHeading}>Follow</p>
                  <div className={styles.groupLinks}>
                    {socialLinks.map((socialLink) => (
                      <a
                        key={socialLink.id}
                        className={styles.groupLink}
                        href={socialLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {platformLabel(socialLink.platform)}
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}

          <div className={styles.contactCol}>
            <p className={styles.groupHeading}>Contact</p>
            <div className={styles.contactInfo}>
              {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
              {settings.phone && <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}>{settings.phone}</a>}
              {settings.address && <p>{settings.address}</p>}
              {settings.workingHours && <p>{settings.workingHours}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copyright}>{copyrightText}</p>

        <div className={styles.bottomRight}>
          {legalLinks.length > 0 && (
            <div className={styles.legal}>
              {legalLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <a
            href="https://www.samwebstudio.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.creditBadge}
          >
            <span className={styles.creditIcon} aria-hidden="true">S</span>
            <span className={styles.creditText}>
              Designed &amp; Built by <span className={styles.creditHighlight}>Sam Web Studio</span>
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
