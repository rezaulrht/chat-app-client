"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Globe, Users, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import toast from "react-hot-toast";

export default function DiscoverWorkspacesPage() {
  const router = useRouter();
  const { discoverWorkspaces, joinPublicWorkspace, workspaces } = useWorkspace();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const joiningRef = useRef(null);

  useEffect(() => {
    const fetchDiscover = async () => {
      setLoading(true);
      try {
        const data = await discoverWorkspaces(search);
        setResults(data);
      } catch (err) {
        toast.error("Failed to load public workspaces");
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce search slightly
    const timer = setTimeout(fetchDiscover, 400);
    return () => clearTimeout(timer);
  }, [search, discoverWorkspaces]);

  const handleJoin = async (workspace) => {
    if (joiningRef.current === workspace._id || joiningRef.current) return;

    // If already joined, just navigate
    if (workspaces.some((w) => w._id === workspace._id)) {
      router.push(`/app/workspace/${workspace._id}`);
      return;
    }

    joiningRef.current = workspace._id;
    setJoiningId(workspace._id);
    try {
      const joined = await joinPublicWorkspace(workspace._id);
      toast.success(`Joined ${joined.name}!`);
      router.push(`/app/workspace/${joined._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to join workspace");
    } finally {
      joiningRef.current = null;
      setJoiningId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-obsidian overflow-hidden">
      {/* ── Header */}
      <header className="h-16 px-6 border-b border-white/6 flex items-center gap-4 bg-obsidian/80 backdrop-blur-sm shrink-0 z-10 sticky top-0">
        <button
          onClick={() => router.push("/app/workspace")}
          className="w-9 h-9 rounded-xl bg-white/4 flex items-center justify-center text-ivory/40 hover:text-ivory hover:bg-white/8 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-[16px] font-display font-bold text-ivory flex items-center gap-2">
            <Globe className="text-accent" size={18} /> Discover
          </h1>
          <p className="text-[11px] font-mono text-ivory/30 mt-0.5">
            Find and join public communities
          </p>
        </div>
      </header>

      {/* ── Main Content */}
      <div className="flex-1 overflow-y-auto w-full p-6 lg:p-10">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Hero & Search */}
          <div className="relative rounded-3xl overflow-hidden bg-white/4 border border-white/8 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] opacity-20 pointer-events-none" />
            <div className="relative z-10 max-w-xl">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-ivory mb-4 leading-tight">
                Find your community on microtask.
              </h2>
              <p className="text-ivory/50 text-[14px] font-mono mb-8">
                From gaming and tech to art and education, there's a place for everyone.
              </p>
              
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/30" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Explore communities..."
                  className="w-full bg-obsidian/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-[15px] font-display text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all shadow-xl"
                />
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div>
            <h3 className="text-[13px] font-mono font-bold text-ivory/40 uppercase tracking-widest mb-4">
              {search ? "Search Results" : "Featured Communities"}
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={32} className="animate-spin text-accent/50" />
                <p className="text-[12px] font-mono text-ivory/30">Loading communities...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-white/4 border-dashed rounded-3xl bg-white/1">
                <Globe size={48} className="text-ivory/10 mb-4" />
                <h3 className="text-[16px] font-display font-bold text-ivory/70 mb-2">No communities found</h3>
                <p className="text-[13px] font-mono text-ivory/30 max-w-sm">
                  We couldn't find any public workspaces matching your search. Try different keywords.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.map((ws) => {
                  const isJoined = workspaces.some((hw) => hw._id === ws._id);
                  const isJoining = joiningId === ws._id;
                  
                  return (
                    <div
                      key={ws._id}
                      className="group flex flex-col bg-white/3 border border-white/6 rounded-3xl overflow-hidden hover:bg-white/6 hover:border-white/10 transition-all cursor-pointer shadow-lg shadow-black/20"
                      onClick={() => handleJoin(ws)}
                    >
                      {/* Banner */}
                      <div className="h-28 w-full bg-white/4 relative shrink-0">
                        {ws.banner ? (
                          <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${ws.banner})` }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-linear-to-br from-accent/10 to-transparent" />
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-obsidian/80 to-transparent" />
                        
                        {/* Avatar pushing up */}
                        <div className="absolute -bottom-6 left-5 w-14 h-14 rounded-2xl bg-obsidian p-1 shadow-xl">
                          <div className="w-full h-full rounded-xl overflow-hidden bg-accent/10 flex items-center justify-center border border-white/10">
                            {ws.avatar ? (
                              <Image src={ws.avatar} width={48} height={48} alt="" className="w-full h-full object-cover" unoptimized />
                            ) : (
                              <span className="text-lg font-bold text-accent/60">{ws.name?.[0]?.toUpperCase()}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="pt-8 px-5 pb-5 flex-1 flex flex-col">
                        <div className="mb-3">
                          <h4 className="text-[16px] font-display font-bold text-ivory leading-tight mb-1 group-hover:text-accent transition-colors">
                            {ws.name}
                          </h4>
                          <p className="text-[12px] font-mono text-ivory/40 line-clamp-2 leading-relaxed">
                            {ws.description || "No description provided."}
                          </p>
                        </div>
                        
                        <div className="mt-auto pt-4 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-ivory/30">
                            <Users size={12} />
                            <span>{ws.memberCount} members</span>
                          </div>
                          
                          <button
                            disabled={isJoining}
                            onClick={(e) => { e.stopPropagation(); handleJoin(ws); }}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 ${
                              isJoined
                                ? "bg-white/5 text-ivory/40 hover:bg-white/10 hover:text-ivory"
                                : "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
                            }`}
                          >
                            {isJoining ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : isJoined ? (
                              "Open"
                            ) : (
                              <>Join <ChevronRight size={12} /></>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
