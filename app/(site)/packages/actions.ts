"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { validateTourInquiry } from "@/lib/validations/inquiries";

export type TourFormState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string>;
  data?: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    packageId?: number;
  };
};

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Graceful fallback when invoked outside request store
  }
}

export async function submitTourInquiry(
  _prevState: TourFormState | undefined,
  formData: FormData
): Promise<TourFormState> {
  const packageIdRaw = formData.get("packageId");
  const raw = {
    packageId: packageIdRaw ? Number(packageIdRaw) : undefined,
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
  };

  const validation = validateTourInquiry(raw);

  if (!validation.success || !validation.data) {
    return {
      success: false,
      message: validation.message ?? "Please fix the highlighted errors.",
      errors: validation.errors,
      data: {
        name: typeof raw.name === "string" ? raw.name : "",
        email: typeof raw.email === "string" ? raw.email : "",
        phone: typeof raw.phone === "string" ? raw.phone : "",
        message: typeof raw.message === "string" ? raw.message : "",
        packageId: validation.data?.packageId ?? (typeof raw.packageId === "number" ? raw.packageId : undefined),
      },
    };
  }

  try {
    // If a packageId was passed, verify it exists (or gracefully proceed if not found)
    let validPackageId: number | null = null;
    if (validation.data.packageId) {
      const existingPackage = await prisma.tourPackage.findUnique({
        where: { id: validation.data.packageId },
        select: { id: true },
      });
      if (existingPackage) {
        validPackageId = existingPackage.id;
      }
    }

    await prisma.tourInquiry.create({
      data: {
        packageId: validPackageId,
        name: validation.data.name,
        email: validation.data.email,
        phone: validation.data.phone,
        message: validation.data.message,
        status: "NEW",
      },
    });

    safeRevalidate("/admin/inquiries");
    safeRevalidate("/admin");

    return {
      success: true,
      message:
        "Thank you for inquiring about this journey! Our travel specialist will review your request and get back to you with custom options.",
    };
  } catch (error) {
    console.error("Failed to submit tour inquiry:", error);
    return {
      success: false,
      message: "Something went wrong while submitting your inquiry. Please try again or contact us directly.",
    };
  }
}
