/**
 * Sorts conversations with pinned conversations first, then by most recent activity
 * Creates a shallow copy to avoid mutating the input array
 */
export const sortConversations = (conversations) =>
    [...conversations].sort((a, b) => {
        // Pinned conversations always come first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // Within the same group (both pinned or both non-pinned), sort by most recent
        return (
            new Date(b.updatedAt || b.lastMessage?.timestamp || 0).getTime() -
            new Date(a.updatedAt || a.lastMessage?.timestamp || 0).getTime()
        );
    });
