"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { validateHolidayInquiry } from "@/lib/validations/inquiries";

export type HolidayFormState = {
  errors?: Record<string, string>;
  message?: string;
  success?: boolean;
  data?: {
    name?: string;
    email?: string;
    phone?: string;
    preferredDestination?: string;
    travelStartDate?: string;
    travelEndDate?: string;
    numTravelers?: string;
    budgetRange?: string;
    accommodationPreference?: string;
    specialRequirements?: string;
  };
} | undefined;

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Graceful fallback when invoked outside request store
  }
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitHolidayInquiry(
  _previousState: HolidayFormState,
  formData: FormData,
): Promise<HolidayFormState> {
  const name = getText(formData, "name");
  const email = getText(formData, "email");
  const phone = getText(formData, "phone");
  const preferredDestination = getText(formData, "preferredDestination");
  const travelStartDate = getText(formData, "travelStartDate");
  const travelEndDate = getText(formData, "travelEndDate");
  const numTravelers = getText(formData, "numTravelers");
  const budgetRange = getText(formData, "budgetRange");
  const accommodationPreference = getText(formData, "accommodationPreference");
  const specialRequirements = getText(formData, "specialRequirements");

  const raw = {
    name,
    email,
    phone,
    preferredDestination,
    travelStartDate,
    travelEndDate,
    numTravelers,
    budgetRange,
    accommodationPreference,
    specialRequirements,
  };

  const validation = validateHolidayInquiry(raw);

  if (!validation.success || !validation.data) {
    return {
      success: false,
      errors: validation.errors,
      message: validation.message ?? "Please check the highlighted fields.",
      data: {
        name,
        email,
        phone,
        preferredDestination,
        travelStartDate,
        travelEndDate,
        numTravelers,
        budgetRange,
        accommodationPreference,
        specialRequirements,
      },
    };
  }

  try {
    await prisma.holidayInquiry.create({
      data: {
        name: validation.data.name,
        email: validation.data.email,
        phone: validation.data.phone,
        preferredDestination: validation.data.preferredDestination,
        travelStartDate: validation.data.travelStartDate,
        travelEndDate: validation.data.travelEndDate,
        numTravelers: validation.data.numTravelers,
        budgetRange: validation.data.budgetRange,
        accommodationPreference: validation.data.accommodationPreference,
        specialRequirements: validation.data.specialRequirements,
        status: "NEW",
      },
    });

    safeRevalidate("/admin/inquiries");
    safeRevalidate("/admin");

    return {
      success: true,
      message: "Thank you for sharing your travel plans! Our holiday specialist will design a personalized itinerary and reach out soon.",
    };
  } catch (error) {
    console.error("Failed to submit holiday inquiry:", error);
    return {
      success: false,
      message: "Something went wrong while submitting your request. Please try again or contact us directly.",
      data: {
        name,
        email,
        phone,
        preferredDestination,
        travelStartDate,
        travelEndDate,
        numTravelers,
        budgetRange,
        accommodationPreference,
        specialRequirements,
      },
    };
  }
}
