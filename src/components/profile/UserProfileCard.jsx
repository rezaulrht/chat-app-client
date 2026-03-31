"use client";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Pencil, Camera, Check, X } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function UserProfileCard({ onClose, anchorRef, onOpenFullProfile }) {
  const { user, updateProfile } = useAuth();
  const [position, setPosition] = useState({ top: 0, left: 0, bottom: 0 });
  const cardRef = useRef(null);

  // Status editing state
  const [editingStatus, setEditingStatus] = useState(false);
  const [statusInput, setStatusInput] = useState(user?.statusMessage || "");
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const sidebarWidth = rect.right;
      setPosition({
        left: sidebarWidth + 12,
        bottom: window.innerHeight - rect.bottom
      });
    }
  }, [anchorRef]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target) && anchorRef.current && !anchorRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, anchorRef]);

  const handleSaveStatus = async () => {
    setSavingStatus(true);
    const res = await updateProfile({ statusMessage: statusInput });
    setSavingStatus(false);
    if (res.success) {
      toast.success("Status updated");
    } else {
      toast.error(res.message || "Failed to update status");
    }
    setEditingStatus(false);
  };

  if (!user) return null;

  return createPortal(
    <div
      ref={cardRef}
      className="fixed z-50 w-[320px] bg-[#1a1b23]/95 backdrop-blur-xl rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden border border-white/[0.08] animate-in slide-in-from-bottom-2 fade-in duration-200"
      style={{ left: position.left, bottom: position.bottom }}
    >
      {/* Banner */}
      <div className="h-[92px] bg-gradient-to-br from-accent/40 via-accent/15 to-[#0f1015] relative overflow-hidden">
         {user?.banner?.imageUrl && <Image src={user.banner.imageUrl} fill className="object-cover" alt="Banner" unoptimized />}
      </div>
      
      <div className="relative px-4 flex-shrink-0">
          {/* Avatar */}
          <div className="absolute top-[-40px] left-[16px] w-[80px] h-[80px] rounded-full bg-[#1a1b23] p-[4px] z-20">
            <div className="w-full h-full rounded-full overflow-hidden relative group cursor-pointer" onClick={onOpenFullProfile}>
               <Image
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  fill
                  className="object-cover"
                  alt="Avatar"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <Camera size={18} className="text-white" />
                </div>
            </div>
            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-[3px] border-[#1a1b23] bg-emerald-400 z-30 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
          </div>
      </div>

      <div className="pt-12 pb-4 px-4 bg-[#1a1b23] flex-1 relative z-0">
        <h3 className="font-display font-bold text-[20px] text-ivory leading-tight">{user.name}</h3>
        <p className="text-ivory/50 text-[13px] font-mono mb-3">{user.email}</p>

        <div className="h-px bg-white/[0.06] my-3" />

        {/* Custom Status */}
        <div className="mb-3">
          <div className="text-[11px] uppercase font-mono tracking-widest font-bold text-ivory/30 mb-2">Custom Status</div>
          {editingStatus ? (
             <div className="flex flex-col gap-2">
               <div className="flex items-center gap-1">
                 <input 
                    autoFocus
                    type="text" 
                    value={statusInput} 
                    onChange={e => setStatusInput(e.target.value)}
                    onKeyDown={e => {
                       if (e.key === 'Enter') handleSaveStatus();
                       if (e.key === 'Escape') setEditingStatus(false);
                    }}
                    disabled={savingStatus}
                    className="flex-1 bg-white/[0.04] border border-accent/20 rounded-lg px-2.5 py-1.5 text-[13px] text-ivory outline-none focus:border-accent/50 transition-colors"
                    placeholder="What's on your mind?"
                 />
                 <button onClick={handleSaveStatus} disabled={savingStatus} className="w-7 h-7 rounded-md bg-accent/20 hover:bg-accent/30 text-accent flex items-center justify-center transition-colors">
                   <Check size={14} />
                 </button>
                 <button onClick={() => setEditingStatus(false)} className="w-7 h-7 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-ivory/50 hover:text-ivory transition-colors flex items-center justify-center">
                   <X size={14} />
                 </button>
               </div>
             </div>
          ) : (
             <div 
               className="group flex items-center justify-between cursor-text hover:bg-white/[0.03] p-2 -mx-2 rounded-lg transition-colors border border-transparent"
               onClick={() => { setStatusInput(user.statusMessage || ""); setEditingStatus(true); }}
             >
               <p className={`text-[13px] italic ${user.statusMessage ? 'text-ivory/80' : 'text-ivory/30'}`}>
                 {user.statusMessage || "Click to add a status..."}
               </p>
               <Pencil size={12} className="text-ivory/20 group-hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
          )}
        </div>

        <div className="h-px bg-white/[0.06] my-3" />
        
        <div className="mb-3">
           <div className="text-[11px] uppercase font-mono tracking-widest font-bold text-ivory/30 mb-1">Member Since</div>
           <p className="text-[13px] text-ivory/70 font-mono">
              {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
           </p>
        </div>
        
        <div className="flex items-center gap-2 mt-5">
           <button 
             onClick={onOpenFullProfile}
             className="flex-1 bg-accent/15 hover:bg-accent/25 border border-accent/20 text-accent rounded-lg py-2 text-[13px] font-bold font-display transition-colors"
           >
             Edit Profile
           </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
