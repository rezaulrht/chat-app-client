"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavLinks = ({ children, href }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`font-semibold ${isActive ? "text-white" : "text-white/50 hover:text-white"} transition-colors duration-200`}
    >
      {children}
    </Link>
  );
};

export default NavLinks;
