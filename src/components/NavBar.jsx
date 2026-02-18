"use client";

import React from "react";
import Link from "next/link";
import NavLinks from "./buttons/NavLinks";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Features" },
    { href: "/solution", label: "Solution" },
    { href: "/developers", label: "Developers" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#05050A] border-b border-white/10 shadow-lg">
      <div className="navbar max-w-7xl mx-auto px-4 lg:py-6 lg:px-8">
        {/* Start - Logo + Mobile Hamburger */}
        <div className="navbar-start">
          <div className="dropdown lg:hidden">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
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
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-xl bg-[#0a0f15]/95 backdrop-blur-lg rounded-box w-52 border border-white/10"
            >
              {links.map((link) => (
                <li key={link.href}>
                  <NavLinks href={link.href}>{link.label}</NavLinks>
                </li>
              ))}
              <li>
                <Link href="/login" className="text-white/80 hover:text-white">
                  Log In
                </Link>
              </li>
              <li>
                <button className="btn btn-primary btn-sm w-full mt-2">Get Started</button>
              </li>
            </ul>
          </div>

          <Link href="/" className="text-2xl font-bold tracking-tight text-white">
            ConvoX
          </Link>
        </div>

        {/* Center - Desktop Links */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <NavLinks
                  href={link.href}
                  className={`
                    px-4 py-2 rounded-lg transition-all duration-200
                    ${pathname === link.href
                      ? "text-white bg-white/10 font-medium"
                      : "text-white/70 hover:text-white hover:bg-white/5"}
                  `}
                >
                  {link.label}
                </NavLinks>
              </li>
            ))}
          </ul>
        </div>

        {/* End - Auth Buttons */}
        <div className="navbar-end gap-3 hidden lg:flex">
          <Link
            href="/login"
            className="btn btn-ghost text-white/80 hover:text-white hover:bg-white/10"
          >
            Log In
          </Link>
          <button className="btn btn-primary px-6">Get Started</button>
        </div>
      </div>
    </header>
  );
}