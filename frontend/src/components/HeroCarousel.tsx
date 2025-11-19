"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function HeroCarousel() {
  const images = [
    "/img/carousel/HeroCarousel11.jpg",
    "/img/carousel/HeroCarousel22.jpg",
    "/img/carousel/HeroCarousel33.jpg",
    "/img/carousel/HeroCarousel44.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance carousel every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="w-full">
      <div className="w-full px-0">
        <div className="relative h-100 w-full overflow-hidden bg-zinc-200">
          {/* Carousel Images */}
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={image}
                alt={`Carousel image ${index + 1}`}
                width={1200}
                height={500}
                className="object-cover w-full h-full"
                priority={index === 0}
                sizes="100vw"
              />
            </div>
          ))}

          {/* Left arrow */}
          <button
            onClick={goToPrevious}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-zinc-700 shadow hover:bg-white z-10"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {/* Right arrow */}
          <button
            onClick={goToNext}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 text-zinc-700 shadow hover:bg-white z-10"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          {/* Dots indicator */}
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-white/80" : "bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
