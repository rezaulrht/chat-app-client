"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import NavLinks from "./buttons/NavLinks";
import { usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import ThemeSwitcher from "@/components/shared/ThemeSwitcher";

export default function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/#", label: "Home" },
    { href: "/#features", label: "Features" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 transition-all duration-500">
        <nav
          className={`
          w-full max-w-4xl flex items-center justify-between h-14 px-5
          rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
          ${
            scrolled
              ? "bg-deep/90 backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20"
              : "bg-transparent border border-transparent"
          }
        `}
        >
          {/* Logo + Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <div className="dropdown lg:hidden">
              <label
                tabIndex={0}
                className="btn btn-ghost btn-circle btn-sm text-ivory/80"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </label>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-1 p-3 shadow-xl bg-deep/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl w-56"
              >
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-ivory/70 hover:text-ivory font-medium text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {isMounted && (
                  <>
                    {!user || !user.isVerified ? (
                      <>
                        <li className="border-t border-white/5 mt-2 pt-2">
                          <Link
                            href="/login"
                            className="text-ivory/70 hover:text-ivory font-medium text-sm"
                          >
                            Sign In
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/register"
                            className="btn btn-sm w-full mt-2 bg-accent text-obsidian font-bold rounded-xl border-0"
                          >
                            Get Started
                          </Link>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="border-t border-white/5 mt-2 pt-2">
                          <Link
                            href="/profile"
                            className="text-ivory/70 hover:text-ivory font-medium text-sm"
                          >
                            My Profile
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/chat"
                            className="text-ivory/70 hover:text-ivory font-medium text-sm"
                          >
                            Go to ConvoX
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={logout}
                            className="text-ivory/70 hover:text-ivory px-3 py-2 text-sm text-left w-full font-medium"
                          >
                            Sign Out
                          </button>
                        </li>
                      </>
                    )}
                  </>
                )}
              </ul>
            </div>

            <Link href="/" className="flex items-center group">
              <img
                src="https://i.ibb.co/PG0X3Tbf/Convo-X-logo.png"
                alt="ConvoX Logo"
                className="h-7 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Center – Desktop Links */}
          <div className="hidden lg:flex">
            <ul className="flex items-center gap-7">
              {links.map((link) => (
                <li key={link.href}>
                  <NavLinks
                    href={link.href}
                    className={`
                    text-[13px] font-medium tracking-wide transition-all duration-300 hover:-translate-y-0.5
                    ${pathname === link.href ? "text-ivory" : "text-ivory/50 hover:text-ivory"}
                  `}
                  >
                    {link.label}
                  </NavLinks>
                </li>
              ))}
            </ul>
          </div>

          {/* Right – Theme + Auth Buttons */}
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            {isMounted && (
              <>
                {!user || !user.isVerified ? (
                  <>
                    <Link
                      href="/login"
                      className="hidden sm:block text-[13px] font-medium text-ivory/50 hover:text-ivory transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="hidden sm:flex items-center justify-center px-5 py-2 text-[13px] font-bold rounded-xl text-obsidian bg-accent hover:bg-accent/90 transition-all duration-300 shadow-lg shadow-accent/20 hover:scale-[1.03] active:scale-[0.98]"
                    >
                      Get Started
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/profile"
                      className="hidden sm:flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-white/[0.06] transition-all duration-200 group/navprofile"
                      title="My Profile"
                    >
                      <div className="w-7 h-7 rounded-lg overflow-hidden ring-1 ring-white/[0.08] group-hover/navprofile:ring-accent/40 transition-all duration-200 shrink-0">
                        <Image
                          src={
                            user?.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "user"}`
                          }
                          width={28}
                          height={28}
                          className="w-full h-full object-cover"
                          alt="avatar"
                          unoptimized
                        />
                      </div>
                      <span className="text-[13px] font-display font-bold text-ivory/60 group-hover/navprofile:text-ivory transition-colors duration-200">
                        {user?.name?.split(" ")[0]}
                      </span>
                    </Link>
                    <Link
                      href="/chat"
                      className="hidden sm:flex items-center justify-center px-5 py-2 text-[13px] font-bold rounded-xl text-obsidian bg-accent hover:bg-accent/90 transition-all duration-300 shadow-lg shadow-accent/20 hover:scale-[1.03] active:scale-[0.98]"
                    >
                      Go to ConvoX
                    </Link>
                    <button
                      onClick={logout}
                      className="text-[13px] font-medium text-ivory/50 hover:text-ivory transition-all duration-300"
                    >
                      Sign Out
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
