import React from "react";
import {
  Mail,
  MapPin,
  Send,
  AtSign,
  Camera,
  Rss,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

const ContactPage = () => {
  return (
    <div className="bg-[#080c16] text-white font-sans py-24 px-6 relative overflow-hidden min-h-screen">
      {/* Primary Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-500/10 blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Get in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Touch
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Have a question about our features or pricing? Need a custom
            solution for your enterprise? We're here to help you sync up.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Contact Form */}
          <div className="lg:col-span-7 bg-[#0f172a]/40 backdrop-blur-sm border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl relative">
            {/* Inner card glow */}
            <div className="absolute inset-0 bg-blue-500/5 blur-2xl -z-10 rounded-[2rem]" />

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full bg-[#1e293b]/50 border border-white/5 rounded-xl px-5 py-4 focus:border-blue-500/50 focus:outline-none transition-all placeholder:text-gray-500 text-sm"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full bg-[#1e293b]/50 border border-white/5 rounded-xl px-5 py-4 focus:border-blue-500/50 focus:outline-none transition-all placeholder:text-gray-500 text-sm"
                  />
                </div>
              </div>

              <input
                type="email"
                placeholder="Work Email"
                className="w-full bg-[#1e293b]/50 border border-white/5 rounded-xl px-5 py-4 focus:border-blue-500/50 focus:outline-none transition-all placeholder:text-gray-500 text-sm"
              />

              <div className="relative">
                <select className="w-full bg-[#1e293b]/50 border border-white/5 rounded-xl px-5 py-4 appearance-none focus:border-blue-500/50 focus:outline-none text-gray-500 text-sm">
                  <option>Select a topic...</option>
                  <option>Sales Inquiry</option>
                  <option>Technical Support</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
                  ▼
                </div>
              </div>

              <textarea
                rows="5"
                placeholder="How can we help?"
                className="w-full bg-[#1e293b]/50 border border-white/5 rounded-xl px-5 py-4 focus:border-blue-500/50 focus:outline-none transition-all placeholder:text-gray-500 text-sm"
              ></textarea>

              <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] text-sm">
                Send Message <Send className="w-4 h-4" />
              </button>

              <p className="text-center text-[10px] text-gray-500 mt-4">
                By sending this message, you agree to our{" "}
                <span className="text-blue-400 cursor-pointer hover:underline">
                  Privacy Policy
                </span>
                .
              </p>
            </form>
          </div>

          {/* Right Side: Info & FAQs */}
          <div className="lg:col-span-5 space-y-8">
            {/* Contact Info Card */}
            <div className="bg-[#0f172a]/40 backdrop-blur-sm border border-white/10 p-8 rounded-[2rem]">
              <h3 className="text-xl font-bold mb-8">Contact Information</h3>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
                      Email Us
                    </p>
                    <p className="font-semibold text-gray-200">
                      hello@syncteam.com
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      We typically reply within 2 hours.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
                      Office
                    </p>
                    <p className="font-semibold text-gray-200">
                      1200 Innovation Blvd
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Suite 404, San Francisco, CA 94107
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold mb-6">
                  Follow Updates
                </p>
                <div className="flex gap-3">
                  {[AtSign, Camera, Rss].map((Icon, i) => (
                    <button
                      key={i}
                      className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5"
                    >
                      <Icon className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Common Questions Card */}
            <div className="bg-[#0f172a]/40 backdrop-blur-sm border border-white/10 p-8 rounded-[2rem]">
              <div className="flex items-center gap-2 mb-8">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xl font-bold">Common Questions</h3>
              </div>
              <ul className="space-y-4 text-sm text-gray-400">
                {[
                  "How does the free trial work?",
                  "Can I migrate from Slack?",
                  "Is there an on-premise version?",
                ].map((q, i) => (
                  <li
                    key={i}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-between group"
                  >
                    {q}{" "}
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </li>
                ))}
              </ul>
              <button className="mt-8 text-blue-400 text-[11px] font-bold hover:text-blue-300 transition-colors">
                Visit Help Center →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
