import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import CustomizeHolidayForm from "./CustomizeHolidayForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Customize Your Holiday | My Yatra Circle",
  description: "Share your travel plans and let My Yatra Circle shape a holiday around you.",
};

type CustomizeHolidayPageProps = {
  searchParams: Promise<{
    destination?: string;
  }>;
};

export default async function CustomizeHolidayPage({ searchParams }: CustomizeHolidayPageProps) {
  const sp = await searchParams;
  const initialDestination = sp.destination || "";

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Your journey, your way"
        title="Customize your holiday"
        desc="Share a few details about the trip you are imagining. Our team will get back to you to make it personal."
      />
      <section className={styles.section}>
        <Container className={styles.container}>
          <CustomizeHolidayForm initialDestination={initialDestination} />
        </Container>
      </section>
    </main>
  );
}
