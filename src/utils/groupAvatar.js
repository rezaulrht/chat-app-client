/**
 * Group avatar utilities
 *
 * Provides consistent initials-based fallback avatars for groups
 * that don't have a custom uploaded image.
 */

// ---------------------------------------------------------------------------
// Palette of 8 teal-adjacent hues used for auto-generated group avatars.
// Each colour is a Tailwind-compatible CSS value (used inline via style=).
// ---------------------------------------------------------------------------
const AVATAR_PALETTE = [
  { bg: "#0e4e5c", text: "#00d3bb" }, // deep teal
  { bg: "#0e3d52", text: "#38bdf8" }, // ocean blue
  { bg: "#0f3347", text: "#7dd3fc" }, // steel blue
  { bg: "#162e40", text: "#93c5fd" }, // slate blue
  { bg: "#1a2d3f", text: "#a5b4fc" }, // indigo-teal
  { bg: "#1b2f38", text: "#5eead4" }, // mint teal
  { bg: "#0f3530", text: "#34d399" }, // emerald
  { bg: "#142e2a", text: "#6ee7b7" }, // sea green
];

/**
 * Returns the first 1–2 initials for a group name.
 *
 * Rules:
 *   - Split on whitespace, take the first letter of each word
 *   - Return up to 2 characters, uppercased
 *   - Single-word names return the first 2 characters (e.g. "Dev" → "DE")
 *
 * @param {string} name - Group display name
 * @returns {string} 1–2 uppercase characters
 *
 * @example
 *   getGroupInitials("Team Undefined")   // "TU"
 *   getGroupInitials("Alpha Beta Gamma") // "AB"
 *   getGroupInitials("Dev")              // "DE"
 *   getGroupInitials("")                 // "G"
 */
export function getGroupInitials(name) {
  if (!name || typeof name !== "string") return "G";

  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    // Single word: take first 2 chars
    return words[0].slice(0, 2).toUpperCase();
  }

  // Multiple words: first char of first two words
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Returns a deterministic {bg, text} colour pair for a group name.
 * Same name always gets the same colour — no randomness on re-render.
 *
 * @param {string} name - Group display name
 * @returns {{ bg: string, text: string }}
 */
export function getGroupAvatarColor(name) {
  if (!name) return AVATAR_PALETTE[0];

  // Simple hash: sum of char codes mod palette length
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) % AVATAR_PALETTE.length;
  }

  return AVATAR_PALETTE[hash];
}

/**
 * Returns true if the conversation object represents a group chat.
 *
 * @param {object} conv - Conversation object from the API
 * @returns {boolean}
 */
export function isGroupConversation(conv) {
  return conv?.type === "group";
}
