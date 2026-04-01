"use client";
import React from "react";
import { Autoplay, EffectCoverflow, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";


const reviews = [
  {
    name: "Sumaiya Zannat",
    date: "2025-06-02",
    text: "I'm genuinely impressed with the real-time performance of this chat application. Messages are delivered instantly without any delay. The interface is clean, modern, and very user-friendly.",
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

export default function CustomerSlider() {
  return (
    <section className="relative bg-obsidian py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none"
          style={{ background: "color-mix(in srgb, var(--color-accent) 8%, transparent)" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-ivory">
            What our{" "}
            <span className="font-serif italic text-accent">users</span> say
          </h2>
          <p className="text-ivory/40 max-w-2xl mx-auto text-sm md:text-base font-light leading-relaxed">
            Join thousands of satisfied teams using ConvoX for their daily
            communication.
          </p>
        </div>

        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          coverflowEffect={{
            rotate: 5,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
            slideShadows: false,
          }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          modules={[EffectCoverflow, Pagination, Autoplay]}
          className="reviews-swiper pb-16!"
        >
          {reviews.map((review, index) => (
            <SwiperSlide
              key={index}
              className="w-[calc(100vw-3rem)]! sm:w-87.5! md:w-100!"
            >
              <div
                className="p-8 rounded-3xl relative h-full flex flex-col justify-between glass-card"
              >
                {/* Decorative quote mark */}
                <div
                  className="absolute top-4 right-6 font-serif text-6xl leading-none pointer-events-none select-none"
                  style={{ color: "color-mix(in srgb, var(--color-accent) 7%, transparent)" }}
                >
                  &ldquo;
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 fill-accent"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-ivory/60 italic leading-relaxed text-sm md:text-base">
                    &quot;{review.text}&quot;
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-white/[0.05] pt-6">
                  <div>
                    <h4 className="text-ivory font-display font-bold text-sm tracking-wide">
                      {review.name}
                    </h4>
                    <p
                      className="text-[10px] uppercase tracking-widest font-bold mt-1 font-mono"
                      style={{ color: "var(--color-accent)" }}
                    >
                      Verified User
                    </p>
                  </div>
                  <div className="text-ivory/20 text-[10px] uppercase tracking-widest font-bold font-mono">
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
