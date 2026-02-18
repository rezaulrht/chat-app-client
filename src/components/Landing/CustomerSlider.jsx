"use client";

import React from "react";
import { Autoplay, EffectCoverflow, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

export default function CustomerSlider() {
  const reviews = [
    {
      name: "Sumaiya Zannat",
      date: "2025-06-02",
      text: "I’m genuinely impressed with the real-time performance of this chat application. Messages are delivered instantly without any delay. The interface is clean, modern, and very user-friendly.",
    },
    {
      name: "Arif Mahmud",
      date: "2025-06-05",
      text: "The instant messaging feature works flawlessly. I especially love the typing indicator and message status updates. It feels professional and reliable.",
    },
    {
      name: "Nusrat Jahan",
      date: "2025-06-10",
      text: "Group chat and media sharing are extremely smooth. Uploading images and files is fast, and everything syncs perfectly in real-time.",
    },
    {
      name: "Mehedi Hasan",
      date: "2025-06-14",
      text: "The design and performance of this chat app truly stand out. Dark mode, instant notifications, and seamless transitions make it feel like a premium communication platform.",
    },
    {
      name: "Tanisha Rahman",
      date: "2025-06-20",
      text: "I use this chat application daily, and it never disappoints. Fast delivery, stable connection, and a simple yet powerful interface make it perfect.",
    },
  ];

  return (
    <section className="relative bg-[#05050A] py-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-125 bg-blue-600/10 rounded-full blur-[120px] opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_at_center,black_50%,transparent_100%)] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            What Our <span className="text-[#13c8ec]">Users</span> Say
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-light">
            Join thousands of satisfied teams using ConvoX for their daily
            communication.
          </p>
        </div>

        <Swiper
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={"auto"}
          coverflowEffect={{
            rotate: 5,
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
              <div className="glass-card p-8 rounded-2xl border border-white/5 relative h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-[#13c8ec]">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-300 italic leading-relaxed text-sm md:text-base">
                    &quot;{review.text}&quot;
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                  <div>
                    <h4 className="text-white font-bold text-sm tracking-wide">
                      {review.name}
                    </h4>
                    <p className="text-[#13c8ec] text-[10px] uppercase tracking-widest font-bold mt-1">
                      Verified User
                    </p>
                  </div>
                  <div className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                    {review.date}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
