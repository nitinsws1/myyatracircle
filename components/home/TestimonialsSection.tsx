import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionHeading from "@/components/ui/SectionHeading";
import { getFeaturedTestimonials } from "@/lib/site-data";

export default async function TestimonialsSection({
  heading,
  subheading,
}: {
  heading: string | null;
  subheading: string | null;
}) {
  const testimonials = await getFeaturedTestimonials();

  return (
    <section aria-labelledby="testimonials-heading" className="bg-stone-50 py-16 md:py-24" id="testimonials">
      <Container width="editorial">
        <div className="mb-10">
          <SectionLabel>Testimonials</SectionLabel>
          <SectionHeading id="testimonials-heading">
            {heading?.trim() || "What Our Travelers Say"}
          </SectionHeading>
          {subheading?.trim() && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">{subheading.trim()}</p>
          )}
        </div>
        {testimonials.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.id} className="flex h-full flex-col rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
                <blockquote
                  className="flex-1 text-base leading-relaxed text-gray-700 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: testimonial.feedbackHtml }}
                />
                <figcaption className="mt-6 border-t border-stone-200 pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.travelerName}</p>
                  {testimonial.location && <p className="mt-1 text-sm text-gray-500">{testimonial.location}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
