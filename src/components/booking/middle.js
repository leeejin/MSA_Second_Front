
import React, { useState, useEffect, useCallback, useRef, forwardRef, useReducer } from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import 'swiper/css';
import 'swiper/css/virtual';
import Constant from '../../util/constant_variables';
import { Swiper, SwiperSlide } from 'swiper/react';

const accommodation = Constant.getSliderMenus();
/** middle component */
export default function MiddleComponent() {
    const [activeSlide, setActiveSlide] = useState(0);

    const handleSlideChange = (swiper) => {
        setActiveSlide(swiper.activeIndex);
    }

    const slideStyle = (ac, index) => {
        return index === activeSlide ?
            { backgroundImage: `url(${ac.imageUrl})`, transform: 'scaleX(1.1)', transition: 'all 0.5s' } :
            { backgroundImage: `url(${ac.imageUrl})` };
    }
    return (
        <div className="container container-middle">
            <div>
                <div className="middlepanel">
                    <h1 className="font-family-bold">실시간 인기 숙소</h1>
                    <p>다른 여행자들에게 인기 있는 숙소지를 소개합니다. 항공권을 검색하고 지금 바로 떠나세요!</p>
                </div>
                <div>
                    <Swiper
                        className="swiper"
                        spaceBetween={40}
                        centeredSlides={true} // center slides
                        onSlideChange={handleSlideChange}
                        breakpoints={{
                            // when window width is >= 980px
                            980: {
                                slidesPerView: 3.5,
                            },
                            // when window width is <= 568px
                            568: {
                                slidesPerView: 2.5,
                            },
                            0: {
                                slidesPerView: 1.5,
                            }
                        }}
                    >
                        {
                            accommodation.map((ac, i) => (
                                <SwiperSlide
                                    className="swiper-slide"
                                    key={i}
                                    style={slideStyle(ac, i)} >
                                    <div className="swiper-slide-sub">
                                        <h1>{ac.value}</h1>
                                        <p>{ac.content}</p>
                                        <button className="btn btn-style-border">
                                            예약하기
                                        </button>
                                    </div>
                                </SwiperSlide>
                            ))
                        }
                    </Swiper>
                </div>

            </div>




        </div>
    );
}

