"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, MessageSquare, Hexagon } from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown";

export default function TopNavbar() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full border-b border-border-dark bg-background-dark relative z-20">
      <header className="flex items-center justify-between whitespace-nowrap px-6 py-3 mx-auto max-w-360">
        {/* Left Side: Logo & Search */}
        <div className="flex items-center gap-8">
          <Link
            href="/chat"
            className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <Hexagon size={20} className="fill-current" />
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
              ConvoX
            </h2>
          </Link>

          <label className="flex-col min-w-40 h-10 max-w-64 hidden md:flex">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full ring-1 ring-border-dark bg-surface-dark focus-within:ring-primary transition-all">
              <div className="text-slate-400 flex items-center justify-center pl-3 pr-1">
                <Search size={18} />
              </div>
              <input
                className="w-full bg-transparent border-none text-white placeholder-slate-400 focus:ring-0 text-sm outline-none px-2"
                placeholder="Search"
              />
            </div>
          </label>
        </div>

        {/* Right Side: Nav Links & Icons */}
        <div className="flex flex-1 justify-end gap-8">
          <div className="hidden lg:flex items-center gap-8">
            <Link
              href="/workspace"
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="#"
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              Projects
            </Link>
            <Link
              href="#"
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              Community
            </Link>
            <Link
              href="#"
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              Learn
            </Link>
          </div>

          <div className="flex gap-3 relative">
            {/* Notification Button */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  isNotificationsOpen
                    ? "bg-primary text-white"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                <Bell
                  size={20}
                  className={isNotificationsOpen ? "fill-current" : ""}
                />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background-dark"></span>
              </button>

              <NotificationsDropdown
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
              />
            </div>

            <Link
              href="/chat/messages"
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-dark text-slate-300 hover:text-white transition-colors"
            >
              <MessageSquare size={20} />
            </Link>

            <button className="flex items-center justify-center w-10 h-10 rounded-full transition-transform hover:scale-105">
              <div
                className="w-8 h-8 rounded-full bg-slate-700 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB-R4hf9tEPmPOrCMEfjUu_oVrzlW48UjTGlsD7O-Le-Aew09nk93f7E-5ZIeL2ltO6ARCu0B6blpB9fuadWY4yzdgWWPKEJ2L_OXJbWHcUZU6J3uVgm0Ngypv3Ji-cTWsbSGWBhIPdQgz-0tjLNdSbyE_XeDKZZdmrCY9P8Za5PLyYVUvvgu6j8AViz9MYjCSklHDzMn0t8USRbpADBRgB-vUHc0T7oPGT6d-8BKER5AUfmkmuxzXOwazkPC2SWXgZ7DklLYycieM')",
                }}
              ></div>
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
