"use client";

import React from "react";
import Link from "next/link";
import NavLinks from "./buttons/NavLinks";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const links = [
    { href: "/#features", label: "Features" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background-dark/80 border-b border-white/5">
      <div className="navbar max-w-7xl mx-auto px-4 h-16 lg:px-8">
        {/* Start - Logo + Mobile Hamburger */}
        <div className="navbar-start">
          <div className="dropdown lg:hidden">
            <label
              tabIndex={0}
              className="btn btn-ghost btn-circle text-slate-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
              className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow-xl bg-surface-dark border border-white/5 rounded-xl w-52"
            >
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {isMounted && (
                <>
                  {!user ? (
                    <>
                      <li className="border-t border-white/5 mt-2 pt-2">
                        <Link
                          href="/login"
                          className="text-slate-300 hover:text-white"
                        >
                          Sign In
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/register"
                          className="btn btn-primary btn-sm w-full mt-2 text-background-dark"
                        >
                          Get Started
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="border-t border-white/5 mt-2 pt-2">
                        <Link
                          href="/chat"
                          className="text-slate-300 hover:text-white"
                        >
                          Go to ConvoX
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={logout}
                          className="text-slate-300 hover:text-white px-3 py-2 text-sm text-left w-full"
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
            <span className="font-bold text-2xl tracking-tight text-white">
              Convo<span className="text-[#13c8ec]">X</span>
            </span>
          </Link>
        </div>

        {/* Center - Desktop Links */}
        <div className="navbar-center hidden lg:flex">
          <ul className="flex items-center gap-8">
            {links.map((link) => (
              <li key={link.href}>
                <NavLinks
                  href={link.href}
                  className={`
                    text-sm font-medium transition-all duration-200
                    ${pathname === link.href ? "text-white" : "text-slate-400 hover:text-white"}
                  `}
                >
                  {link.label}
                </NavLinks>
              </li>
            ))}
          </ul>
        </div>

        {/* End - Auth Buttons */}
        <div className="navbar-end gap-4 items-center">
          {isMounted && (
            <>
              {!user ? (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="hidden sm:flex items-center justify-center px-5 py-2 text-sm font-semibold rounded-lg text-background-dark bg-[#13c8ec] hover:bg-[#13c8ec]/90 transition-all shadow-lg shadow-[#13c8ec]/20"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/chat"
                    className="hidden sm:flex items-center justify-center px-5 py-2 text-sm font-semibold rounded-lg text-background-dark bg-[#13c8ec] hover:bg-[#13c8ec]/90 transition-all shadow-lg shadow-[#13c8ec]/20"
                  >
                    Go to ConvoX
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
