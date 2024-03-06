import React, { useState } from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import Constant from '../../util/constant_variables';
const footer = Constant.getSliderMenus(); //푸터 이미지 내용
/** footer slider */
export default function FooterSlider ({ handleReserve }) {
    const renderSlides = footer.map((footer) => (
        <div className="container-bottom" style={{ backgroundImage: `url(${footer.imageUrl})` }} key={footer.key}>
            <div className="panel panel-bottom">
                <div>
                    <h1>{footer.title}</h1>
                    <h1>{footer.subTitle}</h1>
                    <p>{footer.content}</p>
                    <button className="btn btn-style-border" onClick={() => handleReserve(footer.value)}>
                        예약하기
                    </button>
                </div>
            </div>
        </div>
    ))
    return (
        <Carousel
            showStatus={false}
            showArrows={true}
            autoPlay={true}
            infiniteLoop={true}
            showThumbs={false}
            >
            {renderSlides}
        </Carousel>
    );
}
