import { Swiper, SwiperSlide } from "swiper/react";
import React from 'react';
import { Navigation, Pagination, EffectCoverflow, A11y } from "swiper/modules";
import { games } from "../data/gamesData";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

export default () => {
  return (
    <Swiper
      effect={"coverflow"}
      direction={"horizontal"}
      navigation
      observer={true}
      observeParents={true}
      centeredSlides={true}
      scrollbar={{ draggable: true }}
      modules={[Pagination, Navigation, EffectCoverflow, A11y]}
      coverflowEffect={{
        depth: 50,
        rotate: 0,
        scale: 0.9,
        slideShadows: false,
        stretch: 50,
      }}
      pagination={{
        clickable: true,
        type: "bullets",
      }}
      spaceBetween={0}
      slidesPerView={1}
      breakpoints={{
        300: {
          slidesPerView: 1,
          spaceBetween: 0,
          effect: "coverflow",
          coverflowEffect: {
            depth: 50,
            rotate: 0,
            scale: 0.4,
            slideShadows: false,
          },
        },
        600: {
          slidesPerView: 2,
          spaceBetween: -15,
          effect: "coverflow",
          coverflowEffect: {
            depth: 50,
            rotate: 0,
            scale: 14 / 20,
            slideShadows: false,
            stretch: 0,
          },
        },
        1100: {
          slidesPerView: 3,
          spaceBetween: -20,
          effect: "coverflow",
          coverflowEffect: {
            depth: 50,
            rotate: 0,
            slideShadows: false,
            stretch: 0,
          },
        },
      }}
      loop={true}
      className="h-auto flex w-11/12 flex-col items-center justify-center rounded-lg"
    >
      {Object.entries(games).map(([name, game], index) => (
        <SwiperSlide key={index}>
          <img
            src={game.image}
            alt={name}
            className="h-[490px] w-[370px] scale-90 rounded-lg"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
