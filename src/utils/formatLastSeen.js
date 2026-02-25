/**
 * Returns a fuzzy, human-friendly "last seen" string.
 * Intentionally rounded so it never looks precise/awkward.
 */
export function formatLastSeen(timestamp) {
    if (!timestamp) return "";

    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMin = diffMs / 60000;
    const diffHrs = diffMs / 3600000;
    const diffDays = diffMs / 86400000;

    if (diffMin < 5) return "recently";
    if (diffMin < 15) return "5 min ago";
    if (diffMin < 45) return "30 min ago";
    if (diffHrs < 2) return "1 hour ago";
    if (diffHrs < 6) return "a few hours ago";
    if (diffHrs < 24) return "earlier today";
    if (diffDays < 2) return "yesterday";
    if (diffDays < 7) return `${Math.floor(diffDays)} days ago`;
    return "over a week ago";
}
