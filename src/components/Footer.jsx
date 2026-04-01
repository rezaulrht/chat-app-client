import React from "react";

export default function Footer() {
  return (
    <footer className="relative bg-obsidian text-ivory/40 pt-0 pb-0">
      {/* Animated gradient top border */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-accent) 50%, transparent), #a78bfa50, color-mix(in srgb, var(--color-accent) 50%, transparent), transparent)",
        }}
      />

      <div className="rounded-t-[2rem] sm:rounded-t-[4rem] pt-16 pb-12 px-6 bg-obsidian">
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
                {
                  href: "https://x.com",
                  label: "X",
                  path: "M18.244 2H21l-6.56 7.497L22.154 22h-6.04l-4.73-6.18L5.96 22H3.2l7.02-8.014L2 2h6.193l4.276 5.633L18.244 2zm-1.06 18.2h1.676L7.102 3.704H5.304L17.184 20.2z",
                },
                {
                  href: "https://facebook.com",
                  label: "Facebook",
                  path: "M22 12.07C22 6.477 17.523 2 12 2S2 6.477 2 12.07c0 5.019 3.657 9.18 8.438 9.93v-7.03H7.898V12.07h2.54V9.845c0-2.517 1.492-3.91 3.777-3.91 1.094 0 2.238.196 2.238.196v2.47h-1.26c-1.243 0-1.63.776-1.63 1.571v1.898h2.773l-.443 2.9h-2.33V22c4.78-.75 8.437-4.911 8.437-9.93z",
                },
                {
                  href: "https://linkedin.com",
                  label: "LinkedIn",
                  path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
                },
              ].map((icon) => (
                <a
                  key={icon.label}
                  href={icon.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={icon.label}
                  className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:border-accent/30 hover:text-accent transition-all"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d={icon.path} />
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
