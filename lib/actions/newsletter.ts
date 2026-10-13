"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { validateNewsletter } from "@/lib/validations/inquiries";

export type NewsletterActionState = {
  success?: boolean;
  message?: string;
  error?: string;
};

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Graceful fallback when invoked outside request store
  }
}

export async function subscribeNewsletter(
  _prevState: NewsletterActionState | undefined,
  formData: FormData
): Promise<NewsletterActionState> {
  const emailRaw = formData.get("email");
  const validation = validateNewsletter({ email: emailRaw });

  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: validation.errors?.email ?? "Please enter a valid email address.",
      message: validation.message ?? "Please enter a valid email address.",
    };
  }

  const { email } = validation.data;

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isSubscribed) {
        return {
          success: true,
          message: "You're already subscribed to our newsletter. Thank you for being in the circle!",
        };
      } else {
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            isSubscribed: true,
            unsubscribedAt: null,
            subscribedAt: new Date(),
          },
        });
        safeRevalidate("/admin/inquiries");
        safeRevalidate("/admin");
        return {
          success: true,
          message: "Welcome back! Your newsletter subscription has been reactivated.",
        };
      }
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email,
        isSubscribed: true,
      },
    });

    safeRevalidate("/admin/inquiries");
    safeRevalidate("/admin");

    return {
      success: true,
      message: "Thank you for subscribing! You are now part of My Yatra Circle.",
    };
  } catch (error) {
    console.error("Failed to subscribe to newsletter:", error);
    return {
      success: false,
      message: "Something went wrong while subscribing. Please try again later.",
    };
  }
}
