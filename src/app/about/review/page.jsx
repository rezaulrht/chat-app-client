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
    <div className="my-20 px-4 space-y-6">
      <h1 className="text-secondary text-3xl font-bold text-center">
        What Our Users Say
      </h1>

      <p className="text-center text-gray-700 mt-2 mb-16">
        Delivering fast, secure, and seamless real-time communication is our
        core mission. Our chat application enables users to connect instantly
        through private and group messaging, share files effortlessly, and enjoy
        a smooth, modern, and reliable communication experience — anytime,
        anywhere.
      </p>

      <Swiper
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={3}
        coverflowEffect={{
          rotate: 30,
          stretch: "50%",
          depth: 200,
          modifier: 1,
          scale: 0.75,
          slideShadows: true,
        }}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        pagination={true}
        modules={[EffectCoverflow, Pagination, Autoplay]}
        className="mySwiper"
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={index}>
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              {/* Top Section */}
              <div className="flex items-center gap-4">
                {/* Profile Placeholder */}
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl font-semibold text-gray-700">
                  {review.name.charAt(0)}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {review.name}
                  </h3>
                  <p className="text-sm text-gray-500">{review.date}</p>
                </div>

                {/* Facebook Icon */}
                <span className="ml-auto text-blue-600 text-xl">
                  <i className="fab fa-facebook"></i>
                </span>
              </div>

              {/* Recommends Badge */}
              <div className="flex items-center gap-2 mt-4">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                  ✓
                </div>
                <p className="text-green-600 font-medium">recommends</p>
              </div>

              {/* Review Text */}
              <p className="mt-4 text-gray-700 leading-relaxed">
                {review.text}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
