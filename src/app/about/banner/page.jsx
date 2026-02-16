"use client"; 

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import banner1 from "@/assets/bannerImg1.jpg";
import banner2 from "@/assets/bannerImg2.jpg";
import banner3 from "@/assets/bannerImg3.jpg";

const Banner = () => {
  return (
    <div className="relative -mt-1 mb-3 overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true} 
        pagination={{ clickable: true }}
        speed={800}
        allowTouchMove={true}
        className="hero-carousel"
      >
        {/* Slide 1 */}
        <SwiperSlide>
          <div className="relative h-[55vh] md:h-[65vh] lg:h-[70vh]">
            <Image
              src={banner1}
              alt="Reflect on life's lessons"
              fill
              className="object-cover"
              priority 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            <div className="absolute bottom-10 left-6 md:left-12 lg:left-20 max-w-2xl text-left">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Preserve the Wisdom <br />
                <span className="text-amber-400">That Shaped You</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-2xl">
                Every experience teaches something. Don't let your deepest
                lessons fade away.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a
                  href="/register"
                  className="btn btn-lg bg-amber-600 hover:bg-amber-700 text-white border-none shadow-xl px-8"
                >
                  Start Writing
                </a>
                <a
                  href="/public-lessons"
                  className="btn btn-lg btn-outline text-white hover:bg-white hover:text-black border-white shadow-xl px-8"
                >
                  Explore Lessons
                </a>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 2 */}
        <SwiperSlide>
          <div className="relative h-[55vh] md:h-[65vh] lg:h-[70vh]">
            <Image
              src={banner2}
              alt="Grow through reflection"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            <div className="absolute bottom-10 left-6 md:left-12 lg:left-20 max-w-2xl text-left">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Turn Your Pain Into <br />
                <span className="text-amber-400">Power</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-2xl">
                The hardest moments often carry the greatest wisdom. Share
                yours. Help others grow.
              </p>
              <div className="mt-8">
                <a
                  href="/dashboard/add-lesson"
                  className="btn btn-lg bg-amber-600 hover:bg-amber-700 text-white border-none shadow-xl px-8"
                >
                  Share Your Story
                </a>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 3 */}
        <SwiperSlide>
          <div className="relative h-[55vh] md:h-[65vh] lg:h-[70vh]">
            <Image
              src={banner3}
              alt="Join a mindful community"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            <div className="absolute bottom-10 left-6 md:left-12 lg:left-20 max-w-2xl text-left">
              <h1 className="text-3xl md:text-5xl lg:text-5xl font-bold text-white leading-tight">
                Join Thousands Who Are <br />
                <span className="text-amber-400">Growing Together</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-2xl">
                Be part of a community that values reflection, growth, and
                meaningful connection.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a
                  href="/pricing"
                  className="btn btn-lg bg-amber-600 hover:bg-amber-700 text-white border-none shadow-xl px-8"
                >
                  Go Premium
                </a>
                <a
                  href="/public-lessons"
                  className="btn btn-lg btn-outline text-white hover:bg-white hover:text-black border-white shadow-xl px-8"
                >
                  Browse Free Lessons
                </a>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>

      {/* Custom Dots (pagination) styling */}
      <style jsx>{`
        .hero-carousel .swiper-pagination-bullet {
          background: #f59e0b !important;
          opacity: 0.7;
          width: 12px;
          height: 12px;
        }
        .hero-carousel .swiper-pagination-bullet-active {
          opacity: 1;
          transform: scale(1.3);
        }
      `}</style>
    </div>
  );
};

export default Banner;
