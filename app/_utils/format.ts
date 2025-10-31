import { CurrencyCode, ProfileDetails } from "../_types/profile";

export function formatCurrency(value: number, currency: CurrencyCode) {
  if (Number.isNaN(value)) {
    return `0.00 ${currency}`;
  }
  try {
    return new Intl.NumberFormat("az-Latn-AZ", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export function formatDate(date: string | null, fallback = "-") {
  if (!date) {
    return fallback;
  }
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }
  try {
    return parsed.toLocaleDateString("az-Latn-AZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return `${parsed.getDate()}.${parsed.getMonth() + 1}.${parsed.getFullYear()}`;
  }
}

export function formatFullName(profile: ProfileDetails) {
  const parts = [profile.firstName?.trim(), profile.lastName?.trim()].filter(
    Boolean,
  );
  return parts.length ? parts.join(" ") : "İstifadəçi";
}

export function getInitials(profile: ProfileDetails) {
  const initials = [
    profile.firstName?.trim().charAt(0),
    profile.lastName?.trim().charAt(0),
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase();
  return initials || "İS";
}
