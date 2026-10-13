import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import PerspectiveCarousel from "@/components/ui/perspective-carousel";
import WhyMYC from "@/components/home/WhyMYC";
import { getAboutPage, getAboutTeamMembers } from "@/lib/site-data";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAboutPage();
  return {
    title: about ? `${about.metaTitle} | My Yatra Circle` : "About Us | My Yatra Circle",
    description: about?.metaDescription ?? "My Yatra Circle is an India-origin travel company building curated journeys across India and beyond — planned by hand, never templated.",
  };
}

export default async function AboutPage() {
  const [about, teamMembers] = await Promise.all([getAboutPage(), getAboutTeamMembers()]);

  // Fallback when the CMS page hasn't been published yet
  const hero = about?.hero ?? {
    eyebrow: "About MYC",
    title: "A circle of curated journeys",
    imageUrl: "/images/about-kerala.jpg",
  };

  return (
    <main id="main-content">
      <section className={styles.hero}>
        <Image
          alt={`${hero.title} — My Yatra Circle`}
          src={hero.imageUrl}
          fill
          sizes="100vw"
          priority
          style={{ objectFit: "cover" }}
        />
        <div aria-hidden="true" className={styles.scrim} />
        <Container className={styles.heroCaption}>
          <p className={styles.eyebrow}>{hero.eyebrow}</p>
          <h1 className={styles.title}>{hero.title}</h1>
        </Container>
      </section>

      <section className={styles.body}>
        <Container className={styles.bodyInner}>
          <SectionLabel tone="gold-dark">Who we are</SectionLabel>

          {/* CMS sections (Brand Story, Vision, Mission, Expertise …) */}
          {about?.sections.map((section, index) => (
            <article
              key={section.key}
              className={[
                styles.aboutSection,
                section.imageUrl ? styles.aboutSectionWithImage : "",
                section.imageUrl && index % 2 === 1 ? styles.aboutSectionImageLeft : "",
              ].filter(Boolean).join(" ")}
            >
              <div className={styles.aboutSectionCopy}>
                {section.label && <h2 className={styles.aboutSectionHeading}>{section.label}</h2>}
                {section.html && (
                  <div
                    className={styles.aboutSectionContent}
                    dangerouslySetInnerHTML={{ __html: section.html }}
                  />
                )}
              </div>
              {section.imageUrl && (
                <div className={styles.aboutSectionImage}>
                  <Image
                    alt={section.label ? `${section.label} — My Yatra Circle` : "About My Yatra Circle"}
                    src={section.imageUrl}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 90vw, 42vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
            </article>
          ))}

          {/* Fallback copy when no CMS sections exist */}
          {(!about || about.sections.length === 0) && (
            <>
              <p className={styles.paragraph}>
                My Yatra Circle is an India-origin travel company building curated journeys across India and beyond. Every
                itinerary is planned by hand — never templated — and paired with concierge support from the first enquiry
                to the last mile home.
              </p>
              <p className={styles.paragraph}>
                Curated. Heritage. International. This is travel built around the traveller, not the other way around.
              </p>
            </>
          )}

        </Container>
      </section>

      <WhyMYC />

      {teamMembers.length > 0 && (
        <section aria-labelledby="team-heading" className={styles.teamSection}>
          <Container width="wide" className={styles.teamInner}>
            <SectionLabel>Meet the people behind the journey</SectionLabel>
            <h2 className={styles.teamHeading} id="team-heading">Our team</h2>
            <p className={styles.teamIntro}>
              The thoughtful people who bring every My Yatra Circle journey to life.
            </p>
            <PerspectiveCarousel
              aria-label="Our team members"
              items={teamMembers.map((member) => ({
                src: member.photoUrl,
                title: member.name,
                alt: `Portrait of ${member.name}`,
                designation: member.designation ?? "",
                bio: member.bio ?? "",
              }))}
              defaultActiveIndex={Math.floor(teamMembers.length / 2)}
              slideWidth={240}
              loop
              className={styles.teamCarousel}
              slideClassName={styles.teamSlide}
              labelClassName={styles.teamName}
              designationClassName={styles.teamDesignation}
              bioClassName={styles.teamBio}
            />
          </Container>
        </section>
      )}
    </main>
  );
}
