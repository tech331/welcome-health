export type PayerSupplier = {
  id: string;
  name: string;
  detail: string;
};

export type PayerCaseManager = {
  id: string;
  displayName: string;
  initials: string;
};

export type PayerRecord = {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  suppliers: PayerSupplier[];
  caseManagers: PayerCaseManager[];
};

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  { bg: "#fbe4cf", text: "#8a4b1f" },
  { bg: "#dff0e4", text: "#2d6a4f" },
  { bg: "#dbe7fb", text: "#274b8a" },
  { bg: "#f3ddf1", text: "#7a2f74" },
  { bg: "#fdeecf", text: "#8a6a1f" },
  { bg: "#d9eef0", text: "#1f6a72" },
];

export function getAvatarColor(seed: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
