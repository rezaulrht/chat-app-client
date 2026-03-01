"use client";
import React from "react";
import Image from "next/image";
import {
  Search,
  Code,
  DynamicFeed,
  LocalFireDepartment,
  Bookmarks,
  Terminal,
  School,
  Star,
  MenuBook,
  CodeBlocks,
  Help,
  Image as ImageIcon,
  SentimentSatisfied,
  MoreHoriz,
  Commit,
  Favorite,
  ChatBubble,
  Share,
  Bookmark,
  Warning,
  TrendingUp,
  GroupAdd,
  PersonAdd,
  Add,
} from "lucide-react";
import TopNavbar from "@/components/Navigation/TopNavbar";

export default function SocialFeed() {
  return (
    <div className="flex flex-col w-full h-full bg-background-dark overflow-y-auto">
      <TopNavbar />
      <div className="flex flex-1 justify-center w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 text-slate-100">
        {/* Left Sidebar (Navigation/Filters) - Desktop Only */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-6 sticky top-6 h-fit">
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Feeds
            </h3>
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium w-full text-left">
              <DynamicFeed size={20} />
              Home
            </button>
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-dark text-slate-300 font-medium transition-colors w-full text-left">
              <LocalFireDepartment size={20} />
              Popular
            </button>
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-dark text-slate-300 font-medium transition-colors w-full text-left">
              <Bookmarks size={20} />
              Bookmarks
            </button>
          </div>

          <div className="h-px bg-border-dark mx-3"></div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Topics
            </h3>
            <button className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-dark text-slate-300 font-medium transition-colors group w-full">
              <div className="flex items-center gap-3">
                <Code size={20} className="text-blue-400" />
                <span>Dev</span>
              </div>
              <span className="text-xs bg-border-dark px-1.5 py-0.5 rounded text-slate-500 group-hover:text-white">
                12
              </span>
            </button>
            <button className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-dark text-slate-300 font-medium transition-colors group w-full">
              <div className="flex items-center gap-3">
                <School size={20} className="text-purple-400" />
                <span>Learning</span>
              </div>
              <span className="text-xs bg-border-dark px-1.5 py-0.5 rounded text-slate-500 group-hover:text-white">
                5
              </span>
            </button>
            <button className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-dark text-slate-300 font-medium transition-colors group w-full">
              <div className="flex items-center gap-3">
                <Terminal size={20} className="text-green-400" />
                <span>Design</span>
              </div>
              <span className="text-xs bg-border-dark px-1.5 py-0.5 rounded text-slate-500 group-hover:text-white">
                8
              </span>
            </button>
          </div>
        </aside>

        {/* Central Feed */}
        <main className="flex flex-col flex-1 max-w-[640px] gap-6 w-full">
          {/* Filter Pills */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button className="flex shrink-0 items-center justify-center gap-x-2 rounded-full bg-surface-dark border border-border-dark pl-3 pr-4 py-1.5 hover:border-primary transition-colors group">
              <Star size={18} className="text-primary" />
              <p className="text-white text-sm font-medium">All</p>
            </button>
            <button className="flex shrink-0 items-center justify-center gap-x-2 rounded-full bg-transparent border border-border-dark pl-3 pr-4 py-1.5 hover:bg-surface-dark transition-colors">
              <MenuBook size={18} className="text-slate-500" />
              <p className="text-slate-400 text-sm font-medium">
                Today I Learned
              </p>
            </button>
            <button className="flex shrink-0 items-center justify-center gap-x-2 rounded-full bg-transparent border border-border-dark pl-3 pr-4 py-1.5 hover:bg-surface-dark transition-colors">
              <CodeBlocks size={18} className="text-slate-500" />
              <p className="text-slate-400 text-sm font-medium">
                GitHub Activity
              </p>
            </button>
            <button className="flex shrink-0 items-center justify-center gap-x-2 rounded-full bg-transparent border border-border-dark pl-3 pr-4 py-1.5 hover:bg-surface-dark transition-colors">
              <Help size={18} className="text-slate-500" />
              <p className="text-slate-400 text-sm font-medium">Questions</p>
            </button>
          </div>

          {/* Compose Input Area */}
          <div className="bg-surface-dark rounded-xl p-4 shadow-sm border border-border-dark">
            <div className="flex gap-4">
              <div className="bg-slate-700 rounded-full w-10 h-10 shrink-0"></div>
              <div className="flex-1">
                <input
                  className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 text-base p-0 h-10 mb-2 outline-none"
                  placeholder="Share something you learned today..."
                  type="text"
                />
                <div className="flex justify-between items-center pt-2 border-t border-border-dark">
                  <div className="flex gap-2">
                    <button className="text-slate-400 hover:text-primary transition-colors p-1.5 rounded hover:bg-border-dark">
                      <ImageIcon size={20} />
                    </button>
                    <button className="text-slate-400 hover:text-primary transition-colors p-1.5 rounded hover:bg-border-dark">
                      <Code size={20} />
                    </button>
                    <button className="text-slate-400 hover:text-primary transition-colors p-1.5 rounded hover:bg-border-dark">
                      <SentimentSatisfied size={20} />
                    </button>
                  </div>
                  <button className="bg-primary hover:bg-primary/80 text-background-dark text-sm font-bold py-1.5 px-4 rounded-lg transition-colors">
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Post 1: GitHub Activity */}
          <div className="bg-surface-dark rounded-xl overflow-hidden shadow-sm border border-border-dark group">
            <div className="flex items-center gap-3 p-4 border-b border-border-dark bg-black/20">
              <div className="bg-slate-700 rounded-full w-8 h-8 shrink-0"></div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    Jordan Smith
                  </span>
                  <span className="text-xs text-slate-400">• 2h ago</span>
                </div>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1">
                  <CodeBlocks size={14} /> GitHub Activity
                </span>
              </div>
              <button className="ml-auto text-slate-400 hover:text-white">
                <MoreHoriz size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-4 bg-black/40 rounded-lg p-4 border border-border-dark">
                <div className="shrink-0 w-12 h-12 rounded bg-slate-800 flex items-center justify-center text-white">
                  <Commit size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-lg mb-1">
                    Pushed 5 commits to{" "}
                    <span className="text-primary font-mono text-base">
                      react-dashboard-v2
                    </span>
                  </h4>
                  <p className="text-slate-400 text-sm mb-3">
                    merged pull request #42: Feature/dark-mode-toggle
                  </p>
                  <div className="flex gap-2 text-xs font-mono text-slate-500">
                    <span className="bg-slate-800 px-2 py-1 rounded text-green-400">
                      +124 additions
                    </span>
                    <span className="bg-slate-800 px-2 py-1 rounded text-red-400">
                      -45 deletions
                    </span>
                  </div>
                </div>
                <button className="self-start md:self-center h-8 px-3 rounded bg-primary text-background-dark text-xs font-bold hover:opacity-90 transition-opacity">
                  View
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-border-dark">
              <div className="flex gap-4">
                <button className="flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors text-sm">
                  <Favorite size={18} />
                  <span>24</span>
                </button>
                <button className="flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors text-sm">
                  <ChatBubble size={18} />
                  <span>3</span>
                </button>
              </div>
              <button className="text-slate-500 hover:text-primary transition-colors">
                <Share size={18} />
              </button>
            </div>
          </div>

          {/* Post 2: Text Post (TIL) */}
          <div className="bg-surface-dark rounded-xl overflow-hidden shadow-sm border border-border-dark">
            <div className="flex items-center gap-3 p-4">
              <div className="bg-slate-700 rounded-full w-10 h-10 shrink-0"></div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Alex Dev</span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase border border-blue-500/20">
                    Pro
                  </span>
                  <span className="text-xs text-slate-400">• 4h ago</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  Full Stack Developer
                </span>
              </div>
              <button className="ml-auto text-slate-400 hover:text-white">
                <MoreHoriz size={20} />
              </button>
            </div>
            <div className="px-4 pb-2">
              <div className="inline-flex items-center gap-1.5 mb-3 bg-purple-500/10 text-purple-300 px-2 py-1 rounded text-xs font-bold uppercase border border-purple-500/20">
                <MenuBook size={14} /> Today I Learned
              </div>
              <p className="text-slate-200 text-base leading-relaxed mb-4">
                Today I learned about the{" "}
                <span className="text-primary font-semibold">
                  Intersection Observer API
                </span>
                . It's incredibly useful for implementing lazy loading of images
                or infinite scrolling without relying on scroll event listeners
                which can be heavy on performance.
              </p>
              <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto border border-slate-800 mb-4 relative group">
                <pre className="text-slate-300">
                  <code>{`const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
});`}</code>
                </pre>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <button className="text-primary text-sm hover:underline">
                  #javascript
                </button>
                <button className="text-primary text-sm hover:underline">
                  #webdev
                </button>
                <button className="text-primary text-sm hover:underline">
                  #til
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-border-dark">
              <div className="flex gap-6">
                <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium">
                  <Favorite size={20} className="fill-current" />
                  <span>142</span>
                </button>
                <button className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium">
                  <ChatBubble size={20} />
                  <span>18 Comments</span>
                </button>
              </div>
              <button className="text-slate-500 hover:text-primary transition-colors">
                <Bookmark size={20} />
              </button>
            </div>
          </div>
        </main>

        {/* Right Sidebar (Trending/Suggestions) - Desktop Only */}
        <aside className="hidden xl:flex flex-col w-80 shrink-0 gap-6 sticky top-24 h-[calc(100vh-6rem)]">
          {/* Trending Tags */}
          <div className="bg-surface-dark rounded-xl border border-border-dark p-5 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={24} className="text-primary" /> Trending
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start group cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Programming</span>
                  <span className="font-bold text-slate-200 group-hover:text-primary transition-colors">
                    #typescript
                  </span>
                  <span className="text-xs text-slate-500">12.5k posts</span>
                </div>
                <MoreHoriz size={18} className="text-slate-600" />
              </div>
              <div className="flex justify-between items-start group cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Student Life</span>
                  <span className="font-bold text-slate-200 group-hover:text-primary transition-colors">
                    #exams
                  </span>
                  <span className="text-xs text-slate-500">8.2k posts</span>
                </div>
                <MoreHoriz size={18} className="text-slate-600" />
              </div>
              <div className="flex justify-between items-start group cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Frameworks</span>
                  <span className="font-bold text-slate-200 group-hover:text-primary transition-colors">
                    #nextjs14
                  </span>
                  <span className="text-xs text-slate-500">5.1k posts</span>
                </div>
                <MoreHoriz size={18} className="text-slate-600" />
              </div>
            </div>
            <button className="w-full mt-4 py-2 text-sm text-primary font-medium hover:bg-primary/10 rounded-lg transition-colors">
              Show more
            </button>
          </div>

          {/* Suggested Collaborators */}
          <div className="bg-surface-dark rounded-xl border border-border-dark p-5 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <GroupAdd size={24} className="text-primary" /> Collaborators
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-700 rounded-full w-10 h-10 shrink-0"></div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-sm text-white truncate">
                    David Chen
                  </span>
                  <span className="text-xs text-slate-400 truncate">
                    @dchen_dev
                  </span>
                </div>
                <button className="bg-transparent border border-slate-600 text-slate-300 hover:border-primary hover:text-primary p-1.5 rounded-full transition-all">
                  <PersonAdd size={18} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-slate-700 rounded-full w-10 h-10 shrink-0"></div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-sm text-white truncate">
                    Emily Rose
                  </span>
                  <span className="text-xs text-slate-400 truncate">
                    @emilyr_ux
                  </span>
                </div>
                <button className="bg-transparent border border-slate-600 text-slate-300 hover:border-primary hover:text-primary p-1.5 rounded-full transition-all">
                  <PersonAdd size={18} />
                </button>
              </div>
            </div>
            <button className="w-full mt-4 py-2 text-sm text-primary font-medium hover:bg-primary/10 rounded-lg transition-colors">
              Find people
            </button>
          </div>
        </aside>

        {/* Floating Action Button (Mobile) */}
        <button className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-background-dark rounded-full shadow-lg flex items-center justify-center z-50 hover:scale-105 transition-transform">
          <Add size={28} />
        </button>
      </div>
    </div>
  );
}
