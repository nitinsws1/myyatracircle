import Container from "./Container";
import styles from "./PageHero.module.css";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  desc?: string;
};

// The plain navy hero banner used at the top of every inner index page
// (Contact, Destinations, Journeys, Experiences, Inspiration) that doesn't
// have its own full-bleed photo hero (About does — see
// their page files).
export default function PageHero({ eyebrow, title, desc }: PageHeroProps) {
  return (
    <section className={styles.hero}>
      <Container>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        {desc ? <p className={styles.desc}>{desc}</p> : null}
      </Container>
    </section>
  );
}
