import Container from "./Container";
import styles from "./PageHero.module.css";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  desc?: string;
  banner?: string | null;      // optional image / video URL
  bannerType?: string | null;  // "IMAGE" | "VIDEO" (optional, URL extension is also checked)
};

const isVideo = (url: string, type?: string | null) =>
  type?.toUpperCase() === "VIDEO" || /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

// The hero banner used at the top of every inner index page. It stays plain navy
// unless a banner image/video is passed in, in which case the media becomes the
// background with a dark overlay so the text stays readable.
export default function PageHero({ eyebrow, title, desc, banner, bannerType }: PageHeroProps) {
  return (
    <section className={`${styles.hero} ${banner ? styles.withMedia : ""}`}>
      {banner ? (
        <>
          {isVideo(banner, bannerType) ? (
            <video
              className={styles.media}
              src={banner}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.media} src={banner} alt="" aria-hidden="true" />
          )}
          <div className={styles.overlay} aria-hidden="true" />
        </>
      ) : null}

      <div className={styles.content}>
        <Container>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          {desc ? <p className={styles.desc}>{desc}</p> : null}
        </Container>
      </div>
    </section>
  );
}