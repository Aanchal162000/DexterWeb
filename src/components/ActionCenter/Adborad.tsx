import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { FaFire } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function Adboard() {
    // Sample data for multiple slides
    const slides = [
        {
            badge: "Available Now! Fully Automated Trading Loops",
            title: "How This New Wallet Turned $1,000 Into 10,000 Virgen Points In a Week Using Dexter's Volume Loop",
            subtitle: "That only took less than 15 secs to create",
            description: "Dexter's fully automated volume loop strategy is helping countless users farm Virgen points at scale, without manual trading or complex setup.",
            primaryButton: "Create Loop",
            secondaryButton: "Read More",
        },
        {
            badge: "Available Now! Fully Automated Trading Loops",
            title: "How This New Wallet Turned $1,000 Into 10,000 Virgen Points In a Week Using Dexter's Volume Loop",
            subtitle: "That only took less than 15 secs to create",
            description: "Dexter's fully automated volume loop strategy is helping countless users farm Virgen points at scale, without manual trading or complex setup.",
            primaryButton: "Create Loop",
            secondaryButton: "Read More",
        },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                navigation={{
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                }}
                pagination={{
                    clickable: true,
                    bulletClass: "swiper-pagination-bullet custom-bullet",
                    bulletActiveClass: "swiper-pagination-bullet-active custom-bullet-active",
                }}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                }}
                loop={true}
                className="adboard-swiper"
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index} className="">
                        <div className="w-full h-full flex flex-row bg-[linear-gradient(145deg,rgba(38,252,252,0.5)_0%,rgba(87,89,199,0)_10%,rgba(118,113,208,0)_90%,rgba(38,252,252,0.5)_100%)] overflow-hidden relative shadow-2xl p-10">
                            <div className="relative z-10 flex h-full flex-1">
                                {/* Left Content */}
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    {/* Header Badge */}
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="flex items-center gap-2 text-nowrap text-sm font-medium">
                                            <FaFire className="w-4 h-4" />
                                            {slide.badge}
                                        </div>
                                    </div>

                                    {/* Main Content */}
                                    <div className="space-y-4 my-6 w-[70%]">
                                        <h1 className="text-xl font-bold text-white leading-tight">{slide.title}</h1>
                                        <p className="text-teal-200 text-sm opacity-90 pb-7">{slide.subtitle}</p>
                                        <p className="text-gray-300 text-base leading-relaxed max-w-md">{slide.description}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-4 mt-6">
                                        <button className="bg-primary-100 text-black font-semibold px-6 py-2 rounded-sm transition-all duration-200 transform hover:scale-105 shadow-lg text-sm">{slide.primaryButton}</button>
                                        <button className="border-2 border-primary-100 text-primary-100 font-semibold px-6 py-2 rounded-sm transition-all duration-200 text-sm hover:scale-105">{slide.secondaryButton}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Navigation Buttons */}
            {/* <div className="swiper-button-prev !text-white !w-8 !h-8 !mt-0 !left-4 !top-1/2 !transform !-translate-y-1/2 bg-black/30 !rounded-full backdrop-blur-sm hover:bg-black/50 transition-all duration-200 after:!text-sm after:!font-bold"></div>
            <div className="swiper-button-next !text-white !w-8 !h-8 !mt-0 !right-4 !top-1/2 !transform !-translate-y-1/2 bg-black/30 !rounded-full backdrop-blur-sm hover:bg-black/50 transition-all duration-200 after:!text-sm after:!font-bold"></div> */}

            {/* Custom Styles */}
            <style jsx global>{`
                .adboard-swiper .swiper-pagination {
                    bottom: 16px !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    width: auto !important;
                }

                .custom-bullet {
                    width: 8px !important;
                    height: 8px !important;
                    background: rgba(156, 163, 175, 0.5) !important;
                    margin: 0 4px !important;
                    opacity: 1 !important;
                }

                .custom-bullet-active {
                    background: #06b6d4 !important;
                }

                .adboard-swiper .swiper-button-prev:after,
                .adboard-swiper .swiper-button-next:after {
                    font-size: 14px !important;
                    font-weight: bold !important;
                }
            `}</style>
        </div>
    );
}

export default Adboard;
