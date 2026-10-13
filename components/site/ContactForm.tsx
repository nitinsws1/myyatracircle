"use client";

import { useActionState, useState } from "react";
import { ActionButton } from "@/components/ui/Button";
import { submitContactInquiry, type ContactFormState } from "@/app/(site)/contact/actions";
import styles from "./ContactForm.module.css";

interface ContactFormProps {
  initialDestination?: string;
}

export default function ContactForm({ initialDestination = "" }: ContactFormProps) {
  const [state, formAction, pending] = useActionState(submitContactInquiry, undefined);
  const [submittedKey, setSubmittedKey] = useState(0);

  const errors = state?.errors ?? {};
  const isSuccess = state?.success;

  return (
    <div className={styles.form}>
      <div className={styles.header}>
        <h2 className={styles.title}>Send Us a Message</h2>
        <p className={styles.subtitle}>
          Have a destination in mind or a question about our journeys? Fill in the details below and
          our travel curators will respond shortly.
        </p>
      </div>

      {isSuccess ? (
        <div className={`${styles.alertBox} ${styles.successBox}`} role="status">
          <p className="font-semibold mb-1">Message Sent Successfully</p>
          <p>{state.message}</p>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={() => setSubmittedKey((k) => k + 1)}
          >
            Send another inquiry
          </button>
        </div>
      ) : (
        <form key={submittedKey} action={formAction} noValidate>
          <div className={styles.fields}>
            <label className={styles.field}>
              <span>
                Your Name <span className={styles.required}>*</span>
              </span>
              <input
                type="text"
                name="name"
                defaultValue={state?.data?.name ?? ""}
                placeholder="Full name"
                required
                maxLength={120}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <span id="name-error" className={styles.fieldError}>
                  {errors.name}
                </span>
              )}
            </label>

            <label className={styles.field}>
              <span>
                Email Address <span className={styles.required}>*</span>
              </span>
              <input
                type="email"
                name="email"
                defaultValue={state?.data?.email ?? ""}
                placeholder="name@example.com"
                required
                maxLength={254}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <span id="email-error" className={styles.fieldError}>
                  {errors.email}
                </span>
              )}
            </label>

            <label className={styles.field}>
              <span>Phone / WhatsApp</span>
              <input
                type="tel"
                name="phone"
                defaultValue={state?.data?.phone ?? ""}
                placeholder="+91 98765 43210"
                maxLength={40}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              {errors.phone && (
                <span id="phone-error" className={styles.fieldError}>
                  {errors.phone}
                </span>
              )}
            </label>

            <label className={styles.field}>
              <span>Country of Residence</span>
              <input
                type="text"
                name="country"
                defaultValue={state?.data?.country ?? ""}
                placeholder="e.g. India, United States, United Kingdom"
                maxLength={100}
                aria-invalid={Boolean(errors.country)}
                aria-describedby={errors.country ? "country-error" : undefined}
              />
              {errors.country && (
                <span id="country-error" className={styles.fieldError}>
                  {errors.country}
                </span>
              )}
            </label>

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Destination or Journey of Interest</span>
              <input
                type="text"
                name="destinationOfInterest"
                defaultValue={state?.data?.destinationOfInterest ?? initialDestination}
                placeholder="e.g. Kashmir, Ladakh, Rajasthan, or specific tour package"
                maxLength={160}
                aria-invalid={Boolean(errors.destinationOfInterest)}
                aria-describedby={
                  errors.destinationOfInterest ? "destination-error" : undefined
                }
              />
              {errors.destinationOfInterest && (
                <span id="destination-error" className={styles.fieldError}>
                  {errors.destinationOfInterest}
                </span>
              )}
            </label>

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Message or Specific Inquiries</span>
              <textarea
                name="message"
                defaultValue={state?.data?.message ?? ""}
                placeholder="Tell us about your dates, preferences, number of travelers, or any questions you have..."
                rows={4}
                maxLength={4000}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "message-error" : undefined}
              />
              {errors.message && (
                <span id="message-error" className={styles.fieldError}>
                  {errors.message}
                </span>
              )}
            </label>
          </div>

          {state?.message && !state.success && (
            <div className={`${styles.alertBox} ${styles.errorBox}`} role="alert">
              {state.message}
            </div>
          )}

          <div className={styles.submitRow}>
            <ActionButton type="submit" disabled={pending}>
              {pending ? "Sending your inquiry..." : "Send Inquiry"}
            </ActionButton>
            <p className={styles.helperText}>
              We respect your privacy. Your information is never shared with third parties.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
