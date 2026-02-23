# ConvoX — Chat App Client

**ConvoX** is the front-end client for a real-time, full-stack chat application. It is built with [Next.js](https://nextjs.org/) and [React](https://react.dev/), and communicates with a REST + WebSocket back-end server to deliver instant messaging experiences.

---

## What is this project?

ConvoX lets users sign up, log in, and chat with other users in real time — one-on-one or in groups. The interface is clean, dark-themed, and fully responsive.

Key highlights:

- **Real-time messaging** powered by [Socket.IO](https://socket.io/)
- **User presence** — live online / offline indicators and "last seen" timestamps
- **One-to-one & group chats** with a familiar sidebar + chat-window layout
- **JWT-based authentication** stored in `localStorage`; tokens are automatically attached to every API request
- **Read receipts** and **threaded replies**
- **Schedule messages** to be sent at a later time
- **Smart search** across message history and contacts
- A polished **landing page** with feature highlights, integrations, analytics, FAQ, and a customer testimonials slider
- **About** and **Contact** pages

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 + DaisyUI v5 |
| Icons | Lucide React |
| HTTP Client | Axios |
| Real-time | Socket.IO Client |
| Forms | React Hook Form |
| Alerts / Toasts | SweetAlert2, React Hot Toast |
| Image Avatars | DiceBear API |

---

## Project Structure

```
src/
├── app/
│   ├── (site)/              # Main site layout & pages
│   │   ├── page.jsx         # Landing page
│   │   ├── (auth)/          # Login, Register, Verify, Login error/success
│   ├── about/               # About page
│   ├── chat/                # Protected chat dashboard
│   ├── contact/             # Contact page
│   ├── forgot-password/     # Forgot-password flow
│   └── api/Axios.js         # Axios instance with auth interceptor
├── components/
│   ├── Landing/             # Landing page sections
│   ├── ChatDashboard/       # Sidebar + Chat window
│   ├── AboutUs/             # About page sections
│   ├── Contact/             # Contact & FAQ
│   ├── auth/                # ProtectedRoute wrapper
│   └── NavBar.jsx / Footer.jsx
├── context/
│   ├── AuthContext & AuthProvider   # Authentication state
│   └── SocketContext & SocketProvider # Socket.IO connection & presence
└── hooks/
    ├── useAuth.jsx
    └── useSocket.js
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A running instance of the **chat-app-server** back-end

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rezaulrht/chat-app-client.git
cd chat-app-client

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL to your back-end URL
# e.g. NEXT_PUBLIC_API_URL=http://localhost:5000

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js in development mode |
| `npm run build` | Create an optimised production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the chat-app-server back-end (e.g. `https://api.example.com`) |

---

## License

This project is private and not yet licensed for public distribution.
