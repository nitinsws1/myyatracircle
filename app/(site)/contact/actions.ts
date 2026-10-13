"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { validateContactInquiry } from "@/lib/validations/inquiries";

export type ContactFormState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string>;
  data?: {
    name?: string;
    email?: string;
    phone?: string;
    country?: string;
    destinationOfInterest?: string;
    message?: string;
  };
};

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Graceful fallback when invoked outside request store
  }
}

export async function submitContactInquiry(
  _prevState: ContactFormState | undefined,
  formData: FormData
): Promise<ContactFormState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    destinationOfInterest: formData.get("destinationOfInterest"),
    message: formData.get("message"),
  };

  const validation = validateContactInquiry(raw);

  if (!validation.success || !validation.data) {
    return {
      success: false,
      message: validation.message ?? "Please fix the highlighted errors.",
      errors: validation.errors,
      data: {
        name: typeof raw.name === "string" ? raw.name : "",
        email: typeof raw.email === "string" ? raw.email : "",
        phone: typeof raw.phone === "string" ? raw.phone : "",
        country: typeof raw.country === "string" ? raw.country : "",
        destinationOfInterest:
          typeof raw.destinationOfInterest === "string" ? raw.destinationOfInterest : "",
        message: typeof raw.message === "string" ? raw.message : "",
      },
    };
  }

  try {
    await prisma.contactInquiry.create({
      data: {
        name: validation.data.name,
        email: validation.data.email,
        phone: validation.data.phone,
        country: validation.data.country,
        destinationOfInterest: validation.data.destinationOfInterest,
        message: validation.data.message,
        status: "NEW",
      },
    });

    safeRevalidate("/admin/inquiries");
    safeRevalidate("/admin");

    return {
      success: true,
      message:
        "Thank you for contacting My Yatra Circle. We have received your inquiry and our team will get in touch with you shortly.",
    };
  } catch (error) {
    console.error("Failed to submit contact inquiry:", error);
    return {
      success: false,
      message: "Something went wrong while sending your inquiry. Please try again or contact us directly.",
    };
  }
}
