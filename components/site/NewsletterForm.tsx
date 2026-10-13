"use client";

import { useActionState, useId, useState } from "react";
import { subscribeNewsletter } from "@/lib/actions/newsletter";
import styles from "./NewsletterForm.module.css";

interface NewsletterFormProps {
  variant?: "dark" | "editorial";
  placeholder?: string;
  buttonText?: string;
  className?: string;
}

export default function NewsletterForm({
  variant = "dark",
  placeholder = "Your email address",
  buttonText = "Join the Circle",
  className = "",
}: NewsletterFormProps) {
  const [state, formAction, pending] = useActionState(subscribeNewsletter, undefined);
  const [key, setKey] = useState(0);
  const inputId = useId();

  const variantClass = variant === "dark" ? styles.dark : styles.editorial;
  const hasError = Boolean(state?.error || (state?.message && !state.success));

  return (
    <div className={`${styles.wrapper} ${variantClass} ${className}`}>
      <form
        key={key}
        action={async (formData) => {
          await formAction(formData);
          // If successful, reset the input field
          if (!state?.error) {
            setKey((k) => k + 1);
          }
        }}
        className={styles.form}
        noValidate
      >
        <div className={styles.inputGroup}>
          <label className="visually-hidden" htmlFor={inputId}>
            Email address
          </label>
          <input
            id={inputId}
            name="email"
            type="email"
            required
            maxLength={254}
            placeholder={placeholder}
            className={`${styles.input} ${hasError ? styles.inputError : ""}`}
            aria-invalid={hasError}
            aria-describedby={state?.message ? `${inputId}-status` : undefined}
          />
        </div>

        <button type="submit" disabled={pending} className={styles.submitBtn}>
          {pending ? "Subscribing..." : buttonText}
          <span aria-hidden="true">→</span>
        </button>
      </form>

      {state?.message && (
        <p
          id={`${inputId}-status`}
          className={`${styles.statusMessage} ${state.success ? styles.statusSuccess : styles.statusError}`}
          role={state.success ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
