import React from "react";

const ACCENT = "#00d3bb";
const DEEP = "#12121a";

export default function Footer() {
  return (
    <footer className="relative bg-obsidian text-ivory/40 pt-0 pb-0">
      {/* Animated gradient top border */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, " +
            ACCENT +
            "50, #a78bfa50, " +
            ACCENT +
            "50, transparent)",
        }}
      />

      <div
        className="rounded-t-[2rem] sm:rounded-t-[4rem] pt-16 pb-12 px-6"
        style={{ background: DEEP }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <aside className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center">
              <img
                src="https://i.ibb.co/PG0X3Tbf/Convo-X-logo.png"
                alt="ConvoX Logo"
                className="h-8 w-auto"
              />
            </div>
            <p className="max-w-sm text-sm leading-relaxed font-light text-ivory/30">
              Empowering teams with secure, high-performance real-time
              communication. ConvoX is built for speed, privacy, and seamless
              collaboration.
            </p>

            {/* System status indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-green-400">
                System Operational
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              {[
                "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z",
                "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z",
                "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
              ].map((d, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:border-accent/30 hover:text-accent transition-all"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d={d} />
                  </svg>
                </a>
              ))}
            </div>
          </aside>

          <nav className="space-y-4">
            <h6 className="text-ivory font-display font-bold text-sm uppercase tracking-widest">
              Product
            </h6>
            <ul className="space-y-3 text-sm font-light">
              {["Features", "Security", "Integrations", "API Docs"].map(
                (item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-accent transition-colors">
                      {item}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <nav className="space-y-4">
            <h6 className="text-ivory font-display font-bold text-sm uppercase tracking-widest">
              Company
            </h6>
            <ul className="space-y-3 text-sm font-light">
              {["About Us", "Blog", "Careers", "Privacy Policy"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-accent transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-mono font-medium text-ivory/20 uppercase tracking-widest">
            &copy; 2026 ConvoX Inc. All rights reserved.
          </p>
          <div className="flex gap-8 text-[10px] font-mono font-bold uppercase tracking-widest text-ivory/20">
            <a href="#" className="hover:text-ivory transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-ivory transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
