import Image from "next/image";
import Link from "next/link";
import AtmoFrame from "./AtmoFrame";
import styles from "./PhotoTile.module.css";

type PhotoTileProps = {
  href: string;
  image: string;
  alt: string;
  name: string;
  tag?: string;
  imagePosition?: string;
  compact?: boolean;
  sizes?: string;
};

// The square photo tile used on the Destinations and Experiences index
// grids — a full-bleed image with a bottom-anchored name/tag caption over a
// gradient scrim, wrapped in an AtmoFrame for the shared light/grain finish.
export default function PhotoTile({ href, image, alt, name, tag, imagePosition, compact, sizes }: PhotoTileProps) {
  return (
    <Link href={href} className={`${styles.tileLink} photo-hover`}>
      <AtmoFrame className={styles.tile}>
        <Image
          src={image}
          alt={alt}
          fill
          sizes={sizes ?? "(max-width: 767px) 92vw, (max-width: 1279px) 46vw, 20vw"}
          className="photo-hover-img"
          style={{ objectFit: "cover", objectPosition: imagePosition ?? "center" }}
        />
        <div aria-hidden="true" className={`${styles.scrim} photo-hover-scrim`} />
        <div className={compact ? `${styles.caption} ${styles.captionCompact}` : styles.caption}>
          <p className={compact ? `${styles.name} ${styles.nameCompact}` : styles.name}>{name}</p>
          {tag ? <p className={styles.tag}>{tag}</p> : null}
        </div>
      </AtmoFrame>
    </Link>
  );
}
