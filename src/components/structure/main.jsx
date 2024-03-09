import React, { useState } from 'react';
import styled from 'styled-components';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import FooterSlider from './structure_part/footer';
import MiddleComponent from './structure_part/middle';
import TopComponent from './structure_part/top';
import Top2Component from './structure_part/top2';
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
const Main=()=> {
    const [airports, setAirPorts] = useState({
        dep: '출발',
        arr: '도착',
        level: '좌석을 선택해주세요',
        depTime: new Date()
    })
    const [mode, setMode] = useState(0);

    const handleModeChange = (number) => {
        setMode(number);
    }
    const handleReserve = (value) => {
        setAirPorts(prev => ({
            ...prev,
            arr: value
        }));
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };
    const handleChange = (locationType, e) => {
        
        setAirPorts((prev) => ({
            ...prev,
            [locationType]: e.target.getAttribute("value")
        }));
    };
    /** 출발 날짜 핸들러 */
    const handleDateChange = (date) => {
        console.log(date);
        setAirPorts(prev => ({
            ...prev,
            depTime: date
        }));
    }
    /**출발지와 도착지 리버스 핸들러 */
    const handleAirPortReverse = () => {
        setAirPorts(prev => {
            if (prev.dep === '출발' || prev.arr === '도착') {
                // dep가 '출발'이고 arr가 '도착'일 때는 상태를 업데이트하지 않는다.
                return prev;
            }
            // 그 외의 경우에는 dep와 arr를 서로 바꾼다.
            return { ...prev, dep: prev.arr, arr: prev.dep }
        });
    }

    return (
        <div>
            <div style={{ position: 'relative' }}>
                {
                    mode === 0 ? <TopComponent
                        airports={airports}
                        handleChange={handleChange}
                        handleAirPortReverse={handleAirPortReverse}
                        handleDateChange={handleDateChange} /> :
                        <Top2Component />
                }
                <Div>
                    <Button className="btn " onClick={() => handleModeChange(0)}>항공편 예약</Button>
                    <Button className="btn " onClick={() => handleModeChange(1)}>숙소 예약</Button>
                </Div>
            </div>

            <MiddleComponent handleReserve={handleReserve} />
            <FooterSlider handleReserve={handleReserve} />

        </div>

    );
}
export default Main;