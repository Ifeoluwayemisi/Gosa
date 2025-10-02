"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    title: "Exclusive Handmade Bags",
    desc: "Discover our unique collection of stylish handmade bags.",
    img: "/images/heroBags.jpg",
    link: "/shop?category=bags",
  },
  {
    id: 2,
    title: "Step Into Comfort",
    desc: "Handcrafted shoes made for elegance and durability.",
    img: "/images/heroShoes.jpg",
    link: "/shop?category=shoes",
  },
  {
    id: 3,
    title: "Finest Accessories",
    desc: "Complete your look with timeless accessories.",
    img: "/images/heroAccessories.jpg",
    link: "/shop?category=accessories",
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderContainerRef = useRef(null);
  const intervalRef = useRef(null);

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
  });

  // autoplay effect
  useEffect(() => {
    if (!instanceRef.current) return;

    const startAutoplay = () => {
      stopAutoplay(); // clear any existing interval
      intervalRef.current = setInterval(() => {
        instanceRef.current?.next();
      }, 4000);
    };

    const stopAutoplay = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    startAutoplay();

    const container = sliderContainerRef.current;
    container.addEventListener("mouseenter", stopAutoplay);
    container.addEventListener("mouseleave", startAutoplay);

    return () => {
      stopAutoplay();
      container.removeEventListener("mouseenter", stopAutoplay);
      container.removeEventListener("mouseleave", startAutoplay);
    };
  }, [instanceRef]);

  return (
    <div className="relative" ref={sliderContainerRef}>
      {/* Carousel */}
      <div
        ref={sliderRef}
        className="keen-slider h-[500px] md:h-[600px] rounded-xl overflow-hidden"
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="keen-slider__slide relative flex items-center justify-center"
          >
            {/* Background Image */}
            <Image
              src={slide.img}
              alt={slide.title}
              fill
              priority={idx === 0}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Animated Text */}
            <AnimatePresence mode="wait">
              {currentSlide === idx && (
                <motion.div
                  key={slide.id}
                  className="relative z-10 text-center text-white max-w-2xl px-4"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <motion.h1
                    className="text-3xl md:text-5xl font-bold"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p
                    className="mt-4 text-lg md:text-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {slide.desc}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Link
                      href={slide.link}
                      className="inline-block mt-6 bg-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                    >
                      Shop Now
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Left Arrow */}
      <button
        onClick={() => instanceRef.current?.prev()}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-3 rounded-full text-white"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => instanceRef.current?.next()}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-3 rounded-full text-white"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => instanceRef.current?.moveToIdx(idx)}
            className={`w-3 h-3 rounded-full transition ${
              currentSlide === idx ? "bg-purple-600 scale-125" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
