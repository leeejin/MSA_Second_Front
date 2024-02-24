
import React, { useState, useEffect, useCallback, useRef, forwardRef, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";
import axios from '../../axiosInstance';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { TbArmchair2 } from "react-icons/tb";
import Constant from '../../util/constant_variables';
import AirPort from '../../util/json/airport-list';
import Datepicker from '../../util/datepicker';
import reverse from '../../styles/image/revert.png';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';

const accommodation = Constant.getSliderMenus();
/** middle component */
export default function MiddleComponent() {

    return (
        <div className="container container-middle">
            <div className="middlepanel">
                <h1>실시간 인기 숙소</h1>
                <p>여행자들에게 인기 있는 숙소지를 소개합니다. 항공권을 검색하고 바로 떠나세요!</p>
                <Swiper
                    className="swiper"
                    spaceBetween={40}
                    pagination={{ clickable: true }}
                    breakpoints={{
                        980: {
                            slidesPerView: 3.5,
                        },
                    }}

                    onSlideChange={() => console.log('slide change')}
                    onSwiper={(swiper) => console.log(swiper)}
                >
                    {
                        accommodation.map((ac, i) => (
                            <SwiperSlide
                                className="swiper-slide"
                                style={{ backgroundImage: `url(${ac.imageUrl})` }} >
                                <div className="swiper-slide-sub">
                                    <h1>{ac.value}</h1>
                                    <p>{ac.content}</p>
                                    <button className="button-reserve">
                                        예약하기
                                    </button>
                                </div>
                            </SwiperSlide>
                        ))
                    }
                </Swiper>
            </div>

        </div>
    );
}