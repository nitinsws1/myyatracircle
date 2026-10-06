import TestimonialForm from "@/components/admin/TestimonialForm";
import { createTestimonial } from "../actions";

export default function NewTestimonialPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">New testimonial</h1>
      <TestimonialForm action={createTestimonial} />
    </>
  );
}
