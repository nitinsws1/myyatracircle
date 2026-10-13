"use client";

import { useActionState, useState } from "react";
import { ActionButton } from "@/components/ui/Button";
import { submitHolidayInquiry } from "./actions";
import styles from "./page.module.css";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p className={styles.fieldError} id={id}>{message}</p> : null;
}

interface CustomizeHolidayFormProps {
  initialDestination?: string;
}

export default function CustomizeHolidayForm({ initialDestination = "" }: CustomizeHolidayFormProps) {
  const [state, formAction, pending] = useActionState(submitHolidayInquiry, undefined);
  const [formKey, setFormKey] = useState(0);

  const errors = state?.errors ?? {};
  const isSuccess = state?.success;
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className={styles.form}>
      <div className={styles.formIntro}>
        <p className={styles.formEyebrow}>A few details to get started</p>
        <p>Tell us what you have in mind. We’ll shape the journey around you.</p>
      </div>

      {isSuccess ? (
        <div className={styles.successMessage} role="status">
          <p className="font-semibold text-base mb-1">Your Journey Request Has Been Received</p>
          <p>{state.message}</p>
          <button
            type="button"
            className="mt-4 inline-block font-medium text-sm underline text-teal-900 hover:text-teal-700 cursor-pointer"
            onClick={() => setFormKey((k) => k + 1)}
          >
            Plan another holiday
          </button>
        </div>
      ) : (
        <form key={formKey} action={formAction} noValidate>
          <div className={styles.fields}>
            <label className={styles.field}>
              <span>Your name <span className={styles.required}>*</span></span>
              <input
                autoComplete="name"
                name="name"
                defaultValue={state?.data?.name ?? ""}
                required
                maxLength={120}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              <FieldError id="name-error" message={errors.name} />
            </label>

            <label className={styles.field}>
              <span>Email address <span className={styles.required}>*</span></span>
              <input
                autoComplete="email"
                name="email"
                type="email"
                defaultValue={state?.data?.email ?? ""}
                required
                maxLength={254}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              <FieldError id="email-error" message={errors.email} />
            </label>

            <label className={styles.field}>
              <span>Phone number</span>
              <input
                autoComplete="tel"
                name="phone"
                type="tel"
                defaultValue={state?.data?.phone ?? ""}
                maxLength={40}
                placeholder="+91 98765 43210"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              <FieldError id="phone-error" message={errors.phone} />
            </label>

            <label className={styles.field}>
              <span>Where would you like to go?</span>
              <input
                name="preferredDestination"
                defaultValue={state?.data?.preferredDestination ?? initialDestination}
                placeholder="A place, region or ‘open to ideas’"
                maxLength={160}
                aria-invalid={Boolean(errors.preferredDestination)}
                aria-describedby={errors.preferredDestination ? "destination-error" : undefined}
              />
              <FieldError id="destination-error" message={errors.preferredDestination} />
            </label>

            <label className={styles.field}>
              <span>Travel start date</span>
              <input
                name="travelStartDate"
                type="date"
                min={todayStr}
                defaultValue={state?.data?.travelStartDate ?? ""}
                aria-invalid={Boolean(errors.travelStartDate)}
                aria-describedby={errors.travelStartDate ? "start-date-error" : undefined}
              />
              <FieldError id="start-date-error" message={errors.travelStartDate} />
            </label>

            <label className={styles.field}>
              <span>Travel end date</span>
              <input
                name="travelEndDate"
                type="date"
                min={todayStr}
                defaultValue={state?.data?.travelEndDate ?? ""}
                aria-invalid={Boolean(errors.travelEndDate)}
                aria-describedby={errors.travelEndDate ? "end-date-error" : undefined}
              />
              <FieldError id="end-date-error" message={errors.travelEndDate} />
            </label>

            <label className={styles.field}>
              <span>Number of travelers</span>
              <input
                name="numTravelers"
                type="number"
                min={1}
                max={1000}
                step={1}
                inputMode="numeric"
                defaultValue={state?.data?.numTravelers ?? ""}
                aria-invalid={Boolean(errors.numTravelers)}
                aria-describedby={errors.numTravelers ? "travelers-error" : undefined}
              />
              <FieldError id="travelers-error" message={errors.numTravelers} />
            </label>

            <label className={styles.field}>
              <span>Approximate budget</span>
              <input
                name="budgetRange"
                defaultValue={state?.data?.budgetRange ?? ""}
                placeholder="For example, ₹1.5L - ₹2.5L per person"
                maxLength={120}
                aria-invalid={Boolean(errors.budgetRange)}
                aria-describedby={errors.budgetRange ? "budget-error" : undefined}
              />
              <FieldError id="budget-error" message={errors.budgetRange} />
            </label>

            <label className={styles.field}>
              <span>Accommodation preference</span>
              <input
                name="accommodationPreference"
                defaultValue={state?.data?.accommodationPreference ?? ""}
                placeholder="Heritage palace, luxury boutique, homestay, 5-star hotel…"
                maxLength={120}
                aria-invalid={Boolean(errors.accommodationPreference)}
                aria-describedby={errors.accommodationPreference ? "accommodation-error" : undefined}
              />
              <FieldError id="accommodation-error" message={errors.accommodationPreference} />
            </label>

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Anything else we should know?</span>
              <textarea
                name="specialRequirements"
                rows={5}
                maxLength={4000}
                defaultValue={state?.data?.specialRequirements ?? ""}
                placeholder="Interests, occasion, pace, accessibility needs or other requests"
                aria-invalid={Boolean(errors.specialRequirements)}
                aria-describedby={errors.specialRequirements ? "requirements-error" : undefined}
              />
              <FieldError id="requirements-error" message={errors.specialRequirements} />
            </label>
          </div>

          {state?.message && !state.success && (
            <p className={styles.errorMessage} role="alert">
              {state.message}
            </p>
          )}

          <div className={styles.submitRow}>
            <ActionButton type="submit" disabled={pending}>
              {pending ? "Sending your request…" : "Send my travel plans"}
            </ActionButton>
            <p>Your details are only used to help plan your enquiry.</p>
          </div>
        </form>
      )}
    </div>
  );
}
