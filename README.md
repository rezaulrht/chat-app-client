# ConvoX Client - Frontend Architecture & Development Guide

> Next.js 14 + React 18 + TailwindCSS + Socket.io | Real-time Chat UI

---

## 📚 Quick Navigation

| Topic                | File                                      |
| -------------------- | ----------------------------------------- |
| **Setup**            | See below                                 |
| **Architecture**     | [Architecture Section](#-architecture)    |
| **Components**       | [Components Guide](#-components)          |
| **Hooks**            | [Custom Hooks](#-custom-hooks)            |
| **State Management** | [Context & Providers](#-state-management) |

---

## 🚀 Quick Start

```bash
cd chat-app-client

# Install dependencies
npm install

# Set up environment
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:5000" >> .env.local

# Start development server
npm run dev

# Open browser
# http://localhost:3000
```

---

## 📁 Directory Structure

```
src/
├── app/                              # Next.js App Router
│   ├── (site)/                       # Public routes
│   │   ├── layout.jsx                # Site layout
│   │   ├── page.jsx                  # Landing page
│   │   └── (auth)/                   # Auth routes
│   │       ├── login/
│   │       ├── register/
│   │       └── forgot-password/
│   ├── chat/                         # Protected chat routes
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── about/
│   ├── contact/
│   ├── globals.css                   # Global styles
│   └── layout.jsx                    # Root layout
│
├── components/                       # React components
│   ├── ChatDashboard/
│   │   ├── ChatDashboard.jsx         # Main container (state management)
│   │   ├── ChatWindow.jsx            # Message display & input
│   │   ├── SidebarChats.jsx          # Conversation list
│   │   ├── WorkspaceSidebar.jsx      # Workspace/navigation
│   │   ├── ChannelSidebar.jsx        # Channels for workspace
│   │   │
│   │   └── Sub-component Examples:
│   │       ├── ChannelItem.jsx
│   │       └── MessageItem.jsx
│   │
│   ├── CreateGroupModal.jsx          # Group creation UI
│   ├── NavBar.jsx                    # Navigation bar
│   ├── Footer.jsx
│   ├── Providers.jsx                 # All context providers
│   │
│   ├── Landing/                      # Landing page components
│   │   ├── HeroSection.jsx
│   │   ├── Features.jsx
│   │   └── ...
│   │
│   ├── auth/
│   │   └── ProtectedRoute.jsx        # Route guard component
│   │
│   ├── buttons/                      # Reusable button components
│   │   ├── LoginButton.jsx
│   │   ├── NavLinks.jsx
│   │   └── ...
│   │
│   ├── common/                       # Shared UI components
│   └── Contact/
│
├── context/                          # React Context Providers
│   ├── AuthContext.jsx               # Auth state shape
│   ├── AuthProvider.jsx              # Auth logic & login/register
│   ├── SocketContext.jsx             # Socket state shape
│   └── SocketProvider.jsx            # Socket lifecycle & events
│
├── hooks/                            # Custom React hooks
│   ├── useAuth.jsx                   # Access auth context
│   └── useSocket.js                  # Access socket context
│
└── utils/                            # Utility functions
    ├── sortConversations.js          # Sort conversations (pinned first)
    ├── formatLastSeen.js             # Format timestamps
    ├── emojis.js                     # Emoji quick shortcuts
    └── Axios.js (in api/)            # Configured HTTP client
```

---

## 🏗 Architecture Overview

### Data Flow

```
User Input (ChatWindow)
    ↓
Socket.emit() or api.post()
    ↓
Backend processes & broadcasts
    ↓
Socket.on() listener triggers state update
    ↓
Component re-renders with new data
    ↓
UI displays message/reaction/etc
```

### Key Principles

1. **Optimistic Updates** - Show message instantly, confirm async
2. **Room Broadcasting** - Join `conv:{id}` rooms for targeted updates
3. **Presence Tracking** - Redis tracks online users
4. **Unread Counting** - Per-conversation unread badges

---

## 🔧 State Management

### AuthContext (`src/context/AuthContext.jsx`)

```javascript
{
  user: {
    _id: String,
    name: String,
    email: String,
    avatar: String,
    status: "online" | "offline" | "away"
  },
  token: String,                      // JWT in localStorage
  isAuthenticated: Boolean,
  isLoading: Boolean,
  error: String | null
}
```

**Usage:**

```javascript
const { user, token, isAuthenticated } = useAuth();
```

### SocketContext (`src/context/SocketContext.jsx`)

```javascript
{
  socket: Socket.io instance,
  onlineUsers: Map {
    userId: { online: Boolean, lastSeen: Date }
  },
  typingUsers: Map {
    conversationId: [userId1, userId2]
  }
}
```

**Usage:**

```javascript
const { socket, onlineUsers, typingUsers } = useSocket();
```

---

## 📦 Main Components

### ChatDashboard.jsx (Container)

**Role:** Main state container managing conversations

**Key Features:**

- Fetches all conversations on mount
- Manages active conversation selection
- Handles socket listeners for new messages
- Integrates pin/archive/mute callbacks
- Sorts conversations with pinned first

**State:**

```javascript
const [conversations, setConversations] = useState([]);
const [activeConversationId, setActiveConversationId] = useState(null);
const [loadingConversations, setLoadingConversations] = useState(true);
const [activeView, setActiveView] = useState("home"); // "home" or "workspace"
```

**Key Methods:**

```javascript
handleMessageSent(conversationId, text, gifUrl);
handleNewConversation(conversation);
handleConversationUpdate(updatedConversations);
handleMessagesSeen(conversationId);
```

---

### ChatWindow.jsx (Message Display)

**Role:** Display messages and message input UI

**Key Features:**

- Display messages with reactions
- Show typing indicators
- Edit/delete message UI (hover actions)
- Reply context in message bubble
- GIF & emoji picker integration
- Real-time message updates via socket

**State:**

```javascript
const [messages, setMessages] = useState([]);
const [text, setText] = useState("");
const [editingMessageId, setEditingMessageId] = useState(null);
const [replyTo, setReplyTo] = useState(null);
const [reactions, setReactions] = useState({}); // emoji -> users
```

**Socket Listeners:**

```javascript
socket.on("message:new", handleReceive);
socket.on("message:edited", handleEdited);
socket.on("message:deleted", handleDeleted);
socket.on("message:reacted", handleReacted);
socket.on("message:status", handleDelivered);
```

**Key Methods:**

```javascript
handleSend(); // Send message
handleEdit(messageId, text); // Edit message
handleDelete(messageId); // Delete message
toggleReaction(msgId, emoji); // React with emoji
```

---

### SidebarChats.jsx (Conversation List)

**Role:** Display list of conversations with search, pin, archive, mute

**Key Features:**

- Search/filter conversations
- Show unread badges
- Context menu (pin/archive/mute)
- Display last message preview
- Show last-seen timestamps
- Online status indicator

**State:**

```javascript
const [filterTerm, setFilterTerm] = useState("");
const [searchedConversations, setSearchedConversations] = useState([]);
const [showArchived, setShowArchived] = useState(false);
const [contextMenu, setContextMenu] = useState(null);
const [modalOpen, setModalOpen] = useState(false); // New chat modal
```

**Key Methods:**

```javascript
handleTogglePin(conversationId);
handleToggleArchive(conversationId);
handleToggleMute(conversationId);
handleNewConversation(); // Open new chat modal
startChatWithUser(userId);
```

---

### WorkspaceSidebar.jsx (Navigation)

**Role:** Workspace/view selection

**Features:**

- Toggle between "Home" and "Workspace" views
- Workspace selection
- Logout button
- User profile quick access

---

### CreateGroupModal.jsx (Group Creation)

**Role:** Modal UI for creating group conversations

**Features:**

- Member selection with search
- Group name input
- Group avatar upload
- Confirmation flow

---

## 🎣 Custom Hooks

### useAuth()

**Purpose:** Access authentication context

```javascript
const { user, token, login, register, logout, isAuthenticated } = useAuth();

// Use in components
if (!isAuthenticated) {
  return <Navigate to="/login" />;
}
```

### useSocket()

**Purpose:** Access WebSocket context

```javascript
const { socket, onlineUsers, typingUsers } = useSocket();

// Check if user is online
const isOnline = onlineUsers.get(userId)?.online;

// Check who's typing
const typing = typingUsers.get(conversationId);

// Emit event
socket.emit("message:send", { conversationId, text });

// Listen to event
useEffect(() => {
  socket.on("message:new", handleNewMessage);
  return () => socket.off("message:new", handleNewMessage);
}, [socket]);
```

---

## 🔀 Socket Events (Client Perspective)

### Emit (Client → Server)

```javascript
// Messages
socket.emit("message:send", {
  conversationId,
  receiverId,
  text,
  gifUrl,
  tempId,
  replyTo,
});
socket.emit("message:edit", { messageId, newText });
socket.emit("message:delete", { messageId, conversationId });
socket.emit("message:react", { messageId, emoji });

// Conversations
socket.emit("conversation:join", conversationId);
socket.emit("conversation:leave", conversationId);
socket.emit("conversation:seen", { conversationId, lastSeenMessageId });

// Presence
socket.emit("presence:ping");
socket.emit("typing:start", { conversationId, receiverId });
socket.emit("typing:stop", { conversationId, receiverId });
```

### Listen (Server → Client)

```javascript
// Messages
socket.on("message:new", (msg) => {
  /* Handle new message */
});
socket.on("message:edited", (msg) => {
  /* Update message */
});
socket.on("message:deleted", ({ messageId }) => {
  /* Remove/hide */
});
socket.on("message:reacted", ({ messageId, reactions }) => {
  /* Update */
});
socket.on("message:status", ({ messageId, status }) => {
  /* Update */
});

// Presence
socket.on("presence:update", ({ userId, online }) => {
  /* Update status */
});
socket.on("typing:users", ({ conversationId, users }) => {
  /* Show typing */
});

// Notifications
socket.on("unread:update", ({ conversationId, count }) => {
  /* Badge */
});
```

---

## 📊 Utilities

### sortConversations.js

Sorts conversations with pinned first, then by most recent

```javascript
import { sortConversations } from "@/utils/sortConversations";

const sorted = sortConversations(conversations, currentUserId);
```

### formatLastSeen.js

Formats last seen timestamps

```javascript
import { formatLastSeen } from "@/utils/formatLastSeen";

const display = formatLastSeen(timestamp);
// Returns: "2 minutes ago", "Yesterday", "Mar 5", etc
```

### Axios.js

Pre-configured HTTP client with auth headers

```javascript
import api from "@/app/api/Axios";

// All requests automatically include JWT
const res = await api.get("/api/chat/conversations");
const res = await api.post("/api/chat/messages", { text: "Hello" });
```

---

## 🎨 Styling Guide

### TailwindCSS Classes

**Color Scheme:**

```
Primary:      teal-normal (#13c8ec)
Surface:      bg-[#0a0e13], bg-[#080b0f]
Borders:      border-white/5, border-white/10
Text:         text-slate-200, text-slate-400, text-slate-600
```

**Common Components:**

```jsx
// Button
<button className="bg-teal-normal text-black px-4 py-2 rounded-lg hover:bg-teal-light">
  Send
</button>

// Message bubble
<div className="bg-teal-normal text-white rounded-2xl p-3 max-w-xs">
  Message content
</div>

// Card
<div className="bg-[#0a0e13] border border-white/5 rounded-xl p-4">
  Content
</div>
```

---

## 🧪 Development & Testing

### Run Development Server

```bash
npm run dev
```

### Browser DevTools

**Check WebSocket:**

```javascript
// In console
socket.connected; // true/false
socket.id; // socket ID
io.reconnection; // reconnection enabled?
```

**Monitor Events:**

```javascript
socket.onAny((event, ...args) => {
  console.log(`Event: ${event}`, args);
});
```

### Testing Checklist

- [ ] Send message appears instantly
- [ ] Edit message updates in real-time
- [ ] Delete message shows placeholder
- [ ] Reaction emoji appears on message
- [ ] Pin/archive/mute buttons work
- [ ] Unread badge updates
- [ ] Online status shows correctly
- [ ] Last seen time formats correctly
- [ ] Typing indicator shows/hides
- [ ] GIF picker works and displays

---

## 🐛 Common Issues

| Issue                   | Solution                                |
| ----------------------- | --------------------------------------- |
| Socket not connected    | Check backend running, verify CORS      |
| Auth token missing      | Check localStorage, try logout/login    |
| Styling looks off       | Clear .next/ folder: `rm -rf .next`     |
| Components not updating | Check socket event listeners registered |
| Messages not sending    | Verify conversationId and receiverId    |

---

## 📝 Code Patterns

### Adding a New Message Feature

1. **Add Socket Listener in ChatWindow.jsx:**

```javascript
useEffect(() => {
  socket?.on("feature:event", (data) => {
    setMessages(prev => /* update logic */);
  });
  return () => socket?.off("feature:event");
}, [socket]);
```

2. **Add Emit in Message Handler:**

```javascript
const handleFeature = () => {
  socket.emit("feature:request", { messageId, data });
};
```

3. **Add UI Element:**

```jsx
<button
  onClick={handleFeature}
  className="p-1.5 rounded-md hover:bg-slate-700/60"
>
  <Icon size={16} />
</button>
```

### Adding a Conversation Feature

1. **Add Method in ChatDashboard.jsx:**

```javascript
const handleFeature = (conversationId) => {
  api.patch(`/api/chat/conversations/${conversationId}/feature`);
  // Update state optimistically
};
```

2. **Pass to SidebarChats:**

```jsx
<SidebarChats onFeature={handleFeature} />
```

3. **Implement in SidebarChats:**

```javascript
const handleClick = async () => {
  await onFeature(conversationId);
};
```

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Vercel (Recommended for Next.js)

```bash
npm install -g vercel
vercel
# Follow prompts
```

### Environment Variables (Production)

```env
NEXT_PUBLIC_API_URL=https://api.convox.app
NEXT_PUBLIC_SOCKET_URL=https://api.convox.app
```

---

## 📖 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Hooks Guide](https://react.dev/reference/react)
- [TailwindCSS](https://tailwindcss.com)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)
- [Axios](https://axios-http.com/docs/intro)

---

**Last Updated:** March 5, 2026 | v1.0.0

For backend details, see [SERVER_README.md](../chat-app-server/README.md)
