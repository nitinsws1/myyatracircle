import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionHeading from "@/components/ui/SectionHeading";
import { getFeaturedTestimonials } from "@/lib/site-data";
import TestimonialsClient from "./TestimonialsClient"; // Relative import since they are in same folder

export default async function TestimonialsSection({
  heading,
  subheading,
}: {
  heading: string | null;
  subheading: string | null;
}) {
  const testimonials = await getFeaturedTestimonials();
  const trimmedSubheading = subheading?.trim();
  const displaySubheading =
    trimmedSubheading?.toLowerCase() === "subheading what our travelers say"
      ? null
      : trimmedSubheading;

  return (
    <section aria-labelledby="testimonials-heading" className="bg-stone-50 py-16 md:py-24" id="testimonials">
      <Container width="editorial">
        <div className="mb-8 flex flex-col items-center text-center">
          <SectionLabel>Testimonials</SectionLabel>
          <SectionHeading id="testimonials-heading">
            {heading?.trim() || "What Our Travelers Say"}
          </SectionHeading>
          {displaySubheading && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">{displaySubheading}</p>
          )}
        </div>

        <TestimonialsClient testimonials={testimonials} />
      </Container>
    </section>
  );
}