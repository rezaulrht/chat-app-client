"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Globe, Users, ChevronRight, Loader2, ArrowLeft, X } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import toast from "react-hot-toast";

export default function DiscoverWorkspacesPage() {
  const router = useRouter();
  const { discoverWorkspaces, joinPublicWorkspace, workspaces } = useWorkspace();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
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

  const handleCardClick = (workspace) => {
    setSelectedWorkspace(workspace);
  };

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
              <h2 className="text-2xl md:text-5xl font-display font-bold text-ivory mb-4 leading-tight wrap-break-word">
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
                  
                  // Ensure previewMembers is always an array
                  const previewMembers = ws.previewMembers || [];
                  
                  return (
                    <div
                      key={ws._id}
                      className="group flex flex-col bg-white/3 border border-white/6 rounded-3xl overflow-hidden hover:bg-white/6 hover:border-white/10 transition-all cursor-pointer shadow-lg shadow-black/20"
                      onClick={() => handleCardClick(ws)}
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
                        
                        {/* Preview Members */}
                        {previewMembers.length > 0 && (
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center -space-x-2">
                              {previewMembers.slice(0, 3).map((m, i) => (
                                <img
                                  key={i}
                                  src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`}
                                  className="w-6 h-6 rounded-full border border-obsidian bg-white/10 object-cover"
                                  alt={m.name}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-mono text-ivory/30">
                              {previewMembers.length > 3 
                                ? `${previewMembers[0]?.name} & ${previewMembers.length - 1} others`
                                : `${previewMembers.slice(0, 2).map(m => m.name).join(', ')}`}
                            </span>
                          </div>
                        )}
                        
                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
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

      {/* ── Slide-Out Drawer / Bottom Sheet Preview ── */}
      {selectedWorkspace && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedWorkspace(null)} 
          />
          
          {/* Drawer */}
          <div className="relative w-full max-w-sm sm:max-w-md h-[90vh] sm:h-full mt-auto sm:mt-0 bg-[#0e0e17] sm:border-l border-t sm:border-t-0 border-white/10 rounded-t-3xl sm:rounded-none shadow-2xl flex flex-col overflow-hidden animate-in sm:slide-in-from-right slide-in-from-bottom duration-300">
            
            {/* Banner Area */}
            <div className="h-40 w-full bg-white/4 relative shrink-0">
              {selectedWorkspace.banner ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${selectedWorkspace.banner})` }}
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-accent/20 to-transparent" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-[#0e0e17] to-transparent" />
              
              <button 
                onClick={() => setSelectedWorkspace(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-ivory/60 hover:text-ivory hover:bg-black/60 transition-all border border-white/10"
              >
                <X size={16} />
              </button>

              <div className="absolute -bottom-8 left-6 w-20 h-20 rounded-2xl bg-[#0e0e17] p-1 shadow-2xl">
                <div className="w-full h-full rounded-xl overflow-hidden bg-accent/10 flex items-center justify-center border border-white/10">
                  {selectedWorkspace.avatar ? (
                    <Image src={selectedWorkspace.avatar} width={80} height={80} alt="" className="w-full h-full object-cover" unoptimized />
                  ) : (
                    <span className="text-3xl font-bold text-accent/60">{selectedWorkspace.name?.[0]?.toUpperCase()}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="pt-12 px-6 pb-6 overflow-y-auto flex-1 flex flex-col">
              <h2 className="text-2xl font-display font-bold text-ivory mb-2 leading-tight">
                {selectedWorkspace.name}
              </h2>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1.5 text-[12px] font-mono text-ivory/50">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>{selectedWorkspace.memberCount} members</span>
                </div>
                {selectedWorkspace.categories?.length > 0 && (
                  <div className="flex gap-1.5">
                    {selectedWorkspace.categories.map((cat, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-ivory/40 uppercase tracking-wider">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h3 className="text-[11px] font-mono font-bold text-ivory/30 uppercase tracking-widest mb-3">About</h3>
                <p className="text-[14px] text-ivory/70 leading-relaxed font-mono">
                  {selectedWorkspace.description || "No description provided for this community."}
                </p>
              </div>

              {selectedWorkspace.previewMembers?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-[11px] font-mono font-bold text-ivory/30 uppercase tracking-widest mb-3">Recent Members</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {selectedWorkspace.previewMembers.map((m, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5 w-14 shrink-0">
                        <img
                          src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`}
                          className="w-10 h-10 rounded-full border border-white/10 object-cover"
                          alt={m.name}
                        />
                        <span className="text-[10px] font-display text-ivory/60 truncate w-full text-center">{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-6 border-t border-white/10">
                <button
                  disabled={joiningId === selectedWorkspace._id}
                  onClick={() => handleJoin(selectedWorkspace)}
                  className={`w-full py-3.5 rounded-2xl text-[14px] font-display font-bold transition-all flex items-center justify-center gap-2 ${
                    workspaces.some((hw) => hw._id === selectedWorkspace._id)
                      ? "bg-white/10 text-ivory hover:bg-white/15"
                      : "bg-accent/20 text-accent hover:bg-accent hover:text-deep border border-accent/30 hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] pointer-events-auto"
                  }`}
                >
                  {joiningId === selectedWorkspace._id ? (
                    <><Loader2 size={16} className="animate-spin" /> Joining...</>
                  ) : workspaces.some((hw) => hw._id === selectedWorkspace._id) ? (
                    "Open Workspace"
                  ) : (
                    "Join Community"
                  )}
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
