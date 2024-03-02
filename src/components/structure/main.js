import React, { useState, useEffect, useRef, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axiosInstance';
import "react-responsive-carousel/lib/styles/carousel.min.css";

import FooterSlider from './footer';
import MiddleComponent from './middle';
import TopComponent from './top';


/** 메인페이지 - 여기서 예약조회 하기 위한 검색 */
export default function Main() {
    const [airports, setAirPorts] = useState({
        dep: '출발',
        arr: '도착',
        level: '좌석을 선택해주세요',
    })
    return (
        <div>
           
            <TopComponent airports={airports} setAirPorts={setAirPorts} />
            <MiddleComponent setAirPorts={setAirPorts}/>
            <FooterSlider setAirPorts={setAirPorts} />

        </div>

    );
}
