/**
 * Group chat helper utilities
 *
 * Pure functions for computing role checks, member counts, and online
 * status aggregation for group conversations.  Kept free of side-effects
 * so they can be used in any component without hooks.
 */

/**
 * Returns true if the given userId has admin rights in the conversation.
 *
 * @param {object} conv     - Conversation object (must have `admins` array)
 * @param {string} userId   - The authenticated user's _id
 * @returns {boolean}
 */
export function isAdmin(conv, userId) {
  if (!conv?.admins || !userId) return false;
  return conv.admins.some((a) => {
    // admins can be populated objects { _id, name } or raw ObjectId strings
    const id = typeof a === "object" ? a._id?.toString() : a?.toString();
    return id === userId;
  });
}

/**
 * Returns true if the given userId is the original creator (owner) of the group.
 *
 * @param {object} conv     - Conversation object (must have `createdBy`)
 * @param {string} userId   - The authenticated user's _id
 * @returns {boolean}
 */
export function isCreator(conv, userId) {
  if (!conv?.createdBy || !userId) return false;
  const creatorId =
    typeof conv.createdBy === "object"
      ? conv.createdBy._id?.toString()
      : conv.createdBy?.toString();
  return creatorId === userId;
}

/**
 * Returns the total number of participants in the conversation.
 *
 * @param {object} conv - Conversation object (must have `participants` array)
 * @returns {number}
 */
export function getMemberCount(conv) {
  return conv?.participants?.length || 0;
}

/**
 * Returns the number of participants currently showing as online.
 *
 * @param {object} conv          - Conversation object (must have `participants` array)
 * @param {Map}    onlineUsers   - Map<userId, { online: boolean }> from SocketContext
 * @returns {number}
 */
export function getOnlineCount(conv, onlineUsers) {
  if (!conv?.participants || !onlineUsers) return 0;
  return conv.participants.filter((p) => {
    const id = typeof p === "object" ? p._id?.toString() : p?.toString();
    return onlineUsers.get(id)?.online === true;
  }).length;
}

/**
 * Returns the role label for a participant in a group.
 * Matches the precedence: creator > admin > member.
 *
 * @param {object} conv     - Conversation object
 * @param {string} userId   - Participant's _id to check
 * @returns {"creator" | "admin" | "member"}
 */
export function getMemberRole(conv, userId) {
  if (isCreator(conv, userId)) return "creator";
  if (isAdmin(conv, userId)) return "admin";
  return "member";
}

/**
 * Returns the display name for a group conversation's last message,
 * prefixed with the sender's first name when available.
 *
 * Examples:
 *   "Rakib: Hey everyone"
 *   "You: Hey everyone"          ← when currentUserId matches sender
 *   "Hey everyone"               ← when senderName is unavailable
 *
 * @param {object} lastMessage   - { text, gifUrl, sender: { _id, name } | string }
 * @param {string} currentUserId - The viewing user's _id
 * @returns {string}
 */
function getNicknameValue(nicknames, userId) {
  if (!nicknames || !userId) return null;
  if (nicknames instanceof Map) return nicknames.get(userId) || null;
  if (typeof nicknames === "object") return nicknames[userId] || null;
  return null;
}

export function getGroupLastMessagePreview(
  lastMessage,
  currentUserId,
  nicknames,
) {
  if (!lastMessage) return "No messages yet";

  // Resolve sender identity
  const senderId =
    typeof lastMessage.sender === "object"
      ? lastMessage.sender?._id?.toString()
      : lastMessage.sender?.toString();

  const senderName =
    typeof lastMessage.sender === "object" ? lastMessage.sender?.name : null;
  const senderNickname = getNicknameValue(nicknames, senderId);

  const isMe = senderId === currentUserId;
  const senderDisplayName = senderNickname || senderName;
  const prefix = isMe
    ? "You"
    : senderDisplayName
      ? senderDisplayName.split(" ")[0]
      : null;

  // Determine content label
  let content;
  if (lastMessage.callLog) {
    const cl = lastMessage.callLog;
    if (cl.status === "missed") content = "Missed call";
    else if (cl.status === "declined") content = "Call declined";
    else {
      const dur = cl.duration
        ? " · " + Math.floor(cl.duration / 60) + "m " + (cl.duration % 60) + "s"
        : "";
      content = (cl.callType === "video" ? "Video" : "Audio") + " call" + dur;
    }
    return prefix ? prefix + ": " + content : content;
  } else if (lastMessage.gifUrl) {
    content = "sent a GIF";
  } else if (lastMessage.attachments?.length > 0) {
    const att = lastMessage.attachments[0];
    if (att.resourceType === "image") content = "sent an image";
    else if (att.resourceType === "video") content = "sent a video";
    else content = "sent a file";
  } else {
    content = lastMessage.text || "";
    // Plain text — use old "Prefix: text" style
    if (!senderId) return content || "No messages yet";
    return prefix ? `${prefix}: ${content}` : content || "No messages yet";
  }

  if (!senderId) return content;
  return prefix ? `${prefix} ${content}` : content;
}
