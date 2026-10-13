"use client";

import { useActionState, useState } from "react";
import { ActionButton } from "@/components/ui/Button";
import { submitTourInquiry } from "@/app/(site)/packages/actions";
import styles from "./TourInquiryForm.module.css";

interface TourInquiryFormProps {
  packageId: number;
  packageName: string;
}

export default function TourInquiryForm({ packageId, packageName }: TourInquiryFormProps) {
  const [state, formAction, pending] = useActionState(submitTourInquiry, undefined);
  const [submittedKey, setSubmittedKey] = useState(0);

  const errors = state?.errors ?? {};
  const isSuccess = state?.success;

  return (
    <div className={styles.formWrapper} id="enquire-form">
      <div className={styles.header}>
        <span className={styles.badge}>Inquire About This Journey</span>
        <h2 className={styles.title}>{packageName}</h2>
        <p className={styles.subtitle}>
          Interested in this itinerary? Tell us your desired travel dates, party size, and any
          customizations you wish to make.
        </p>
      </div>

      {isSuccess ? (
        <div className={`${styles.alertBox} ${styles.successBox}`} role="status">
          <p className="font-semibold mb-1">Inquiry Sent Successfully</p>
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
          <input type="hidden" name="packageId" value={packageId} />

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
                aria-describedby={errors.name ? "tour-name-error" : undefined}
              />
              {errors.name && (
                <span id="tour-name-error" className={styles.fieldError}>
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
                aria-describedby={errors.email ? "tour-email-error" : undefined}
              />
              {errors.email && (
                <span id="tour-email-error" className={styles.fieldError}>
                  {errors.email}
                </span>
              )}
            </label>

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Phone / WhatsApp</span>
              <input
                type="tel"
                name="phone"
                defaultValue={state?.data?.phone ?? ""}
                placeholder="+91 98765 43210 (with country code)"
                maxLength={40}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "tour-phone-error" : undefined}
              />
              {errors.phone && (
                <span id="tour-phone-error" className={styles.fieldError}>
                  {errors.phone}
                </span>
              )}
            </label>

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Message & Travel Requirements</span>
              <textarea
                name="message"
                defaultValue={state?.data?.message ?? ""}
                placeholder="Preferred travel dates, number of adults/children, special celebrations, or custom adjustments you'd like to make..."
                rows={4}
                maxLength={4000}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "tour-message-error" : undefined}
              />
              {errors.message && (
                <span id="tour-message-error" className={styles.fieldError}>
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
              {pending ? "Sending your inquiry..." : "Enquire for this Journey"}
            </ActionButton>
            <p className={styles.helperText}>
              Our journey planners will get in touch directly. No obligation, no pushy sales.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
