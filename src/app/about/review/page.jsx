"use client";

import { Autoplay, EffectCoverflow, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

export default function CustomerReview() {
  const reviews = [
    {
      name: "Sumaiya Zannat",
      date: "2025-06-02",
      text: "I’m genuinely impressed with the real-time performance of this chat application. Messages are delivered instantly without any delay. The interface is clean, modern, and very user-friendly. It makes communication feel effortless and smooth.",
    },
    {
      name: "Arif Mahmud",
      date: "2025-06-05",
      text: "The instant messaging feature works flawlessly. I especially love the typing indicator and message status updates. It feels professional and reliable — exactly what I was looking for in a real-time chat platform.",
    },
    {
      name: "Nusrat Jahan",
      date: "2025-06-10",
      text: "Group chat and media sharing are extremely smooth. Uploading images and files is fast, and everything syncs perfectly in real-time. The overall experience feels secure and well-optimized.",
    },
    {
      name: "Mehedi Hasan",
      date: "2025-06-14",
      text: "The design and performance of this chat app truly stand out. Dark mode, instant notifications, and seamless transitions make it feel like a premium communication platform.",
    },
    {
      name: "Tanisha Rahman",
      date: "2025-06-20",
      text: "I use this chat application daily, and it never disappoints. Fast delivery, stable connection, and a simple yet powerful interface make it perfect for both personal and team communication.",
    },
  ];

  return (
    <div className="bg-[#05050A] min-h-screen font-sans text-slate-200 antialiased relative overflow-hidden flex flex-col pt-10">
      {/* Background Effects (Standardized) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-175 h-125 bg-blue-600/20 rounded-full blur-[120px] opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_at_center,black_50%,transparent_100%)] pointer-events-none" />
      </div>

      <div className="relative z-10 py-20 px-4 space-y-6 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            What Our <span className="text-[#13c8ec]">Users</span> Say
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg font-light leading-relaxed">
            Delivering fast, secure, and seamless real-time communication is our
            core mission. Experience why thousands of teams choose ConvoX for
            their daily collaboration.
          </p>
        </div>

        <Swiper
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={"auto"}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
            slideShadows: false,
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          modules={[EffectCoverflow, Pagination, Autoplay]}
          className="reviews-swiper pb-16!"
        >
          {reviews.map((review, index) => (
            <SwiperSlide key={index} className="w-87.5! sm:w-100!">
              <div className="glass-card rounded-2xl p-8 border border-white/10 h-full flex flex-col justify-between hover:border-[#13c8ec]/30 transition-all duration-300">
                <div>
                  {/* Top Section */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-[#13c8ec]/20 border border-[#13c8ec]/30 flex items-center justify-center text-xl font-bold text-[#13c8ec]">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">
                        {review.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                        Verified User
                      </p>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-slate-300 leading-relaxed font-light italic">
                    &quot;{review.text}&quot;
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-[#13c8ec]/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-[#13c8ec] rounded-full shadow-[0_0_8px_#13c8ec]" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#13c8ec]">
                      Recommended
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    {review.date}
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
