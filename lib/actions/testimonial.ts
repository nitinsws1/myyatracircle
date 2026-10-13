"use server";
 import { prisma } from "@/lib/prisma";


export async function submitTestimonial(formData: FormData) {
  try {
    const travelerName = formData.get("travelerName") as string;
    const location = formData.get("location") as string;
    const feedback = formData.get("feedback") as string;
    const imageUrl = formData.get("imageUrl") as string; 

    if (!travelerName || !feedback) {
      return { error: "Name and Feedback are required" };
    }

    await prisma.testimonial.create({
      data: {
        travelerName,
        location: location || null,
        feedback,
        imageUrl: imageUrl || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Testimonial submission error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}