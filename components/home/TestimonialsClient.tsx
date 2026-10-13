"use client";

import { useState } from "react";
import { submitTestimonial } from "@/lib/actions/testimonial";
import { ActionButton } from "@/components/ui/Button";

type Testimonial = {
  id: number;
  travelerName: string;
  location: string | null;
  feedbackHtml: string;
  imageUrl: string | null;
};

export default function TestimonialsClient({ testimonials }: { testimonials: Testimonial[] }) {
  const [selected, setSelected] = useState<Testimonial | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    let finalImageUrl = "";

    // 1. Agar user ne image select ki hai, toh pehle usko Cloudinary pe dalo
    if (imageFile) {
      try {
        // Fetch signature from our new public route
        const sigRes = await fetch("/api/public-upload-signature", { method: "POST" });
        const sigData = await sigRes.json();

        // Upload directly to Cloudinary
        const cloudData = new FormData();
        cloudData.append("file", imageFile);
        cloudData.append("api_key", sigData.apiKey);
        cloudData.append("timestamp", sigData.timestamp);
        cloudData.append("signature", sigData.signature);
        cloudData.append("folder", sigData.folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`,
          { method: "POST", body: cloudData }
        );
        const uploadedFile = await uploadRes.json();
        finalImageUrl = uploadedFile.secure_url;
      } catch (err) {
        console.error("Image upload failed", err);
        alert("Image upload failed, but submitting your text.");
      }
    }

    // 2. Form data mein naya Cloudinary URL set karo
    formData.set("imageUrl", finalImageUrl);
    
    // 3. Database mein save karo (using existing action)
    const result = await submitTestimonial(formData);
    
    if (result.success) {
      alert("Thank you! Your testimonial has been submitted and is pending approval.");
      setIsFormOpen(false);
      setImageFile(null);
      e.currentTarget.reset();
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <div className="mb-10 flex justify-center">
        <ActionButton
          onClick={() => setIsFormOpen(true)}
        >
          Share Your Experience
        </ActionButton>
      </div>

      <div className="grid items-start gap-x-8 gap-y-6 md:grid-cols-2 md:gap-y-8 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <figure 
            key={testimonial.id} 
            onClick={() => setSelected(testimonial)}
            className="group relative flex cursor-pointer flex-col rounded-2xl border border-stone-100 bg-white p-8 shadow-sm transition-all hover:shadow-md"
          >
            <svg className="mb-5 h-8 w-8 text-blue-100" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
               <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            <blockquote className="text-base leading-relaxed text-gray-700 line-clamp-4 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:underline" dangerouslySetInnerHTML={{ __html: testimonial.feedbackHtml }} />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setSelected(testimonial);
              }}
              aria-label={`Read full testimonial from ${testimonial.travelerName}`}
              className="mt-2 self-start text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Read more
            </button>
            <figcaption className="mt-auto flex items-center gap-4 border-t border-stone-100 pt-6">
              {testimonial.imageUrl ? (
                <img src={testimonial.imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-900">
                  {testimonial.travelerName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{testimonial.travelerName}</p>
                {testimonial.location && <p className="text-sm text-gray-500">{testimonial.location}</p>}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="mb-6 flex items-center gap-4 border-b border-gray-100 pb-6">
               {selected.imageUrl ? (
                <img src={selected.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-blue-900">
                  {selected.travelerName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selected.travelerName}</h3>
                {selected.location && <p className="text-gray-500">{selected.location}</p>}
              </div>
              <button onClick={() => setSelected(null)} className="ml-auto p-2 text-gray-400 hover:text-gray-900">✕</button>
            </div>
            <div className="space-y-4 text-lg leading-relaxed text-gray-700" dangerouslySetInnerHTML={{ __html: selected.feedbackHtml }} />
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-6 shadow-2xl sm:p-8" onClick={e => e.stopPropagation()}>
            <div className="mb-7 flex items-start justify-between border-b border-[var(--border)] pb-5">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold-dark)]">Traveler stories</p>
                <h3 className="text-2xl font-semibold text-[var(--navy)]">Share Your Experience</h3>
              </div>
              <button onClick={() => setIsFormOpen(false)} aria-label="Close form" className="ml-4 rounded-full p-2 text-[var(--grey)] transition-colors hover:bg-white hover:text-[var(--navy)]">✕</button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--navy)]">Name *</label>
                <input required type="text" name="travelerName" className="w-full rounded-md border border-[var(--border)] bg-white px-4 py-3 text-[var(--ink)] outline-none transition focus:border-[var(--gold-dark)] focus:ring-2 focus:ring-[var(--gold)]/30" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--navy)]">Location</label>
                <input type="text" name="location" placeholder="e.g. New Delhi, India" className="w-full rounded-md border border-[var(--border)] bg-white px-4 py-3 text-[var(--ink)] outline-none transition placeholder:text-[var(--grey)] focus:border-[var(--gold-dark)] focus:ring-2 focus:ring-[var(--gold)]/30" />
              </div>
              <div>
                {/* Changed from Text Input to File Input */}
                <label className="mb-2 block text-sm font-medium text-[var(--navy)]">Profile Photo (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none transition file:mr-4 file:rounded-sm file:border-0 file:bg-[var(--ivory)] file:px-3 file:py-2 file:font-medium file:text-[var(--navy)] hover:file:bg-[var(--gold)] focus:border-[var(--gold-dark)] focus:ring-2 focus:ring-[var(--gold)]/30" 
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--navy)]">Your Feedback *</label>
                <textarea required name="feedback" rows={5} className="w-full resize-y rounded-md border border-[var(--border)] bg-white px-4 py-3 text-[var(--ink)] outline-none transition focus:border-[var(--gold-dark)] focus:ring-2 focus:ring-[var(--gold)]/30"></textarea>
              </div>
              <ActionButton
                type="submit" 
                disabled={isSubmitting}
                className="w-full disabled:pointer-events-none disabled:opacity-60"
              >
                {isSubmitting ? "Uploading & Submitting..." : "Submit Testimonial"}
              </ActionButton>
            </form>
          </div>
        </div>
      )}
    </>
  );
}