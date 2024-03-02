import React, { useState } from 'react';

import styled from 'styled-components';
import "react-responsive-carousel/lib/styles/carousel.min.css";

import FooterSlider from './footer';
import MiddleComponent from './middle';
import TopComponent from './top';
import Top2Component from './top2';
const Button = styled.button`
    background-color:var(--white-color);
    border-radius:25px;
    padding:5px;
    margin:10px;
    width:150px;
    height:40px;
    box-shadow: 0px 3px 6px rgba(0.16, 0.16, 0.16, 0.16);
    &:hover{
        color:var(--hovering-color);
    }
`;
const Div = styled.div`
    position:absolute;
   bottom:-25px;
    text-align:center;
    width:100%;

`;
/** 메인페이지 - 여기서 예약조회 하기 위한 검색 */
export default function Main() {
    const [airports, setAirPorts] = useState({
        dep: '출발',
        arr: '도착',
        level: '좌석을 선택해주세요',
    })
    const [mode, setMode] = useState(0);
    
    const handleModeChange = (value) => {
        setMode(value);
    }
    return (
        <div>
            <div style={{position:'relative'}}>
            {
                mode === 0 ? <TopComponent airports={airports} setAirPorts={setAirPorts} /> : <Top2Component />
            }
             <Div>
                <Button className="btn " onClick={() => handleModeChange(0)}>항공편 예약</Button>
                <Button className="btn " onClick={() => handleModeChange(1)}>숙소 예약</Button>
            </Div>
            </div>
           
           

            <MiddleComponent setAirPorts={setAirPorts} />
            <FooterSlider setAirPorts={setAirPorts} />

        </div>

    );
}
