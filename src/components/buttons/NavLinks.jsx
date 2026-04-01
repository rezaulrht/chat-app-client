"use client";
import Link from "next/link";

const NavLinks = ({ children, href, className = "" }) => {
  return (
    <Link
      href={href}
      className={className}
    >
      {children}
    </Link>
  );
};

export default NavLinks;
