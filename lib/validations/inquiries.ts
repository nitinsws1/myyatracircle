export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  message?: string;
};

export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const PHONE_REGEX = /^\+?[0-9\s\-().]{7,25}$/;

export function sanitizeText(val: unknown): string {
  if (typeof val !== "string") return "";
  return val.trim();
}

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return EMAIL_REGEX.test(email);
}

export function isValidPhone(phone: string): boolean {
  if (!phone) return true; // Phone is usually optional
  const digits = phone.replace(/\D/g, "");
  return PHONE_REGEX.test(phone) && digits.length >= 7 && digits.length <= 16;
}

export function parseIsoDate(val: string): Date | null | undefined {
  if (!val) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return undefined;
  const d = new Date(`${val}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== val ? undefined : d;
}

// ──────────────────────────────────────────────
// Contact Inquiry Validation
// ──────────────────────────────────────────────
export type ContactInquiryData = {
  name: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  destinationOfInterest?: string | null;
  message?: string | null;
};

export function validateContactInquiry(raw: Record<string, unknown>): ValidationResult<ContactInquiryData> {
  const errors: Record<string, string> = {};

  const name = sanitizeText(raw.name);
  const email = sanitizeText(raw.email).toLowerCase();
  const phone = sanitizeText(raw.phone);
  const country = sanitizeText(raw.country);
  const destinationOfInterest = sanitizeText(raw.destinationOfInterest);
  const message = sanitizeText(raw.message);

  if (!name) {
    errors.name = "Please enter your name.";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (name.length > 120) {
    errors.name = "Name must be 120 characters or fewer.";
  }

  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (phone) {
    if (!isValidPhone(phone)) {
      errors.phone = "Please enter a valid phone number with 7 to 15 digits.";
    } else if (phone.length > 40) {
      errors.phone = "Phone number must be 40 characters or fewer.";
    }
  }

  if (country && country.length > 100) {
    errors.country = "Country must be 100 characters or fewer.";
  }

  if (destinationOfInterest && destinationOfInterest.length > 160) {
    errors.destinationOfInterest = "Destination of interest must be 160 characters or fewer.";
  }

  if (message && message.length > 4000) {
    errors.message = "Message must be 4,000 characters or fewer.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      message: "Please correct the highlighted fields.",
    };
  }

  return {
    success: true,
    data: {
      name,
      email,
      phone: phone || null,
      country: country || null,
      destinationOfInterest: destinationOfInterest || null,
      message: message || null,
    },
  };
}

// ──────────────────────────────────────────────
// Tour Inquiry Validation
// ──────────────────────────────────────────────
export type TourInquiryData = {
  packageId?: number | null;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
};

export function validateTourInquiry(raw: Record<string, unknown>): ValidationResult<TourInquiryData> {
  const errors: Record<string, string> = {};

  const name = sanitizeText(raw.name);
  const email = sanitizeText(raw.email).toLowerCase();
  const phone = sanitizeText(raw.phone);
  const message = sanitizeText(raw.message);
  const packageIdRaw = raw.packageId;

  let packageId: number | null = null;
  if (packageIdRaw !== undefined && packageIdRaw !== null && packageIdRaw !== "") {
    const parsedId = Number(packageIdRaw);
    if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
      errors.packageId = "Invalid package selected.";
    } else {
      packageId = parsedId;
    }
  }

  if (!name) {
    errors.name = "Please enter your name.";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (name.length > 120) {
    errors.name = "Name must be 120 characters or fewer.";
  }

  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (phone) {
    if (!isValidPhone(phone)) {
      errors.phone = "Please enter a valid phone number with 7 to 15 digits.";
    } else if (phone.length > 40) {
      errors.phone = "Phone number must be 40 characters or fewer.";
    }
  }

  if (message && message.length > 4000) {
    errors.message = "Message must be 4,000 characters or fewer.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      message: "Please correct the highlighted fields.",
    };
  }

  return {
    success: true,
    data: {
      packageId,
      name,
      email,
      phone: phone || null,
      message: message || null,
    },
  };
}

// ──────────────────────────────────────────────
// Holiday Inquiry Validation (Custom Holidays)
// ──────────────────────────────────────────────
export type HolidayInquiryData = {
  name: string;
  email: string;
  phone?: string | null;
  preferredDestination?: string | null;
  travelStartDate?: Date | null;
  travelEndDate?: Date | null;
  numTravelers?: number | null;
  budgetRange?: string | null;
  accommodationPreference?: string | null;
  specialRequirements?: string | null;
};

export function validateHolidayInquiry(raw: Record<string, unknown>): ValidationResult<HolidayInquiryData> {
  const errors: Record<string, string> = {};

  const name = sanitizeText(raw.name);
  const email = sanitizeText(raw.email).toLowerCase();
  const phone = sanitizeText(raw.phone);
  const preferredDestination = sanitizeText(raw.preferredDestination);
  const startDateStr = sanitizeText(raw.travelStartDate);
  const endDateStr = sanitizeText(raw.travelEndDate);
  const travelersStr = sanitizeText(raw.numTravelers);
  const budgetRange = sanitizeText(raw.budgetRange);
  const accommodationPreference = sanitizeText(raw.accommodationPreference);
  const specialRequirements = sanitizeText(raw.specialRequirements);

  if (!name) {
    errors.name = "Please enter your name.";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (name.length > 120) {
    errors.name = "Name must be 120 characters or fewer.";
  }

  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (phone) {
    if (!isValidPhone(phone)) {
      errors.phone = "Please enter a valid phone number with 7 to 15 digits.";
    } else if (phone.length > 40) {
      errors.phone = "Phone number must be 40 characters or fewer.";
    }
  }

  if (preferredDestination && preferredDestination.length > 160) {
    errors.preferredDestination = "Destination must be 160 characters or fewer.";
  }

  const travelStartDate = parseIsoDate(startDateStr);
  const travelEndDate = parseIsoDate(endDateStr);

  if (startDateStr && travelStartDate === undefined) {
    errors.travelStartDate = "Please enter a valid start date (YYYY-MM-DD).";
  }
  if (endDateStr && travelEndDate === undefined) {
    errors.travelEndDate = "Please enter a valid end date (YYYY-MM-DD).";
  }

  if (travelStartDate && travelEndDate && travelStartDate > travelEndDate) {
    errors.travelEndDate = "End date must be on or after start date.";
  }

  let numTravelers: number | null = null;
  if (travelersStr) {
    numTravelers = Number(travelersStr);
    if (!Number.isSafeInteger(numTravelers) || numTravelers < 1 || numTravelers > 1000) {
      errors.numTravelers = "Please enter a valid number of travelers (1 - 1000).";
    }
  }

  if (budgetRange && budgetRange.length > 120) {
    errors.budgetRange = "Budget must be 120 characters or fewer.";
  }

  if (accommodationPreference && accommodationPreference.length > 120) {
    errors.accommodationPreference = "Accommodation preference must be 120 characters or fewer.";
  }

  if (specialRequirements && specialRequirements.length > 4000) {
    errors.specialRequirements = "Please keep special requirements under 4,000 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      message: "Please correct the highlighted fields.",
    };
  }

  return {
    success: true,
    data: {
      name,
      email,
      phone: phone || null,
      preferredDestination: preferredDestination || null,
      travelStartDate: travelStartDate ?? null,
      travelEndDate: travelEndDate ?? null,
      numTravelers,
      budgetRange: budgetRange || null,
      accommodationPreference: accommodationPreference || null,
      specialRequirements: specialRequirements || null,
    },
  };
}

// ──────────────────────────────────────────────
// Newsletter Validation
// ──────────────────────────────────────────────
export type NewsletterData = {
  email: string;
};

export function validateNewsletter(raw: Record<string, unknown>): ValidationResult<NewsletterData> {
  const errors: Record<string, string> = {};
  const email = sanitizeText(raw.email).toLowerCase();

  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      message: errors.email,
    };
  }

  return {
    success: true,
    data: { email },
  };
}
