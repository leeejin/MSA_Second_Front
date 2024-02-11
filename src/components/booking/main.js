import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Constant from '../../util/constant_variables';
import AirPort from '../../util/json/airport-list';
import AirLine from '../../util/json/airline-list';
import Datepicker from '../../util/datepicker';

/** 메인페이지 - 여기서 예약조회 하기 위한 검색 */
export default function Main() {

    const navigate = useNavigate();

    const level = Constant.getSeatLevel(); // 좌석등급
    const airport = AirPort.response.body.items.item; // 공항 목록

    const [airports, setAirports] = useState({ //출발지, 도착지 상태 저장할 변수
        dep: { //출발
            id: AirPort.response.body.items.item[0].airportId,
            name: AirPort.response.body.items.item[0].airportNm
        },
        arr: { //도착
            id: AirPort.response.body.items.item[1].airportId,
            name: AirPort.response.body.items.item[1].airportNm
        }
    });
    const [seatLevel, setSeatLevel] = useState(level[0].value); //좌석등급
    const [depTime, setDepTime] = useState(null); // 출발날짜는 항상 오늘날짜의 다음날부터
    const [contents, setContents] = useState([]); //백에서 받은 출발지,도착지,출발날짜를 포함한 다른 데이터를 가진 객체 배열을 여기다가 저장
    const [errorMessages, setErrorMessages] = useState({ locationError: false, dateError: false }); //에러메시지 (출발지-도착지, 날짜)

    /**공항 핸들러 함수 */
    const handleAirportChange = (type) => (e) => {
        const selectedAirportId = e.target.value;
        const selectedAirport = getSelectedAirport(selectedAirportId);
        setAirports(prev => ({
            ...prev,
            [type]: { id: selectedAirportId, name: selectedAirport.airportNm }
        }));
    };
    /**공항 선택 컴포넌트 */
    const AirportSelect = ({ value, onChange, airport }) => (
        <select value={value} onChange={onChange}>
            {
                airport.map((ap) => (
                    <option key={ap.airportId} value={ap.airportId}>
                        {ap.airportNm}
                    </option>
                ))
            }
        </select>
    );
    /** 해당 ID를 가진 공항 객체를 찾음 */
    const getSelectedAirport = (selectedAirportId) => {
        const selectedAirport = AirPort.response.body.items.item.find(
            (airport) => airport.airportId === selectedAirportId
        );
        return selectedAirport;
    }
    /**출발지와 도착지 리버스 핸들러 */
    const handleAirPortReverse = () => {
        setAirports(prev => ({
            dep: prev.arr,
            arr: prev.dep
        }));
    }
    /** 좌석 핸들러 함수 */
    const handleSeatChange = (e) => {
        setSeatLevel(e.target.value);
    }
    /** 좌석 선택 컴포넌트 */
    const SeatLevelSelect = ({ value, onChange, level }) => (
        <select value={value} onChange={onChange} >
            {
                level.map((level) =>
                    <option key={level.key} value={level.value} >
                        {level.name}
                    </option>)
            }
        </select>
    );
    /** 출발 날짜 핸들러 */
    const handleDateChange = (date) => {
        setDepTime(date);
    }
    /** 검색 핸들러 */
    const handlePay = async () => {
        /** 에러모음 */
        let errors = {
            locationError: airports.dep.id === airports.arr.id, //출발지와 도착지가 똑같을 때
            dateError: depTime === null || depTime <= new Date() //날짜를 선택하지 않았거나 선택한 날짜가 오늘날짜보다 이전일때
        }
        if (!errors.locationError && !errors.dateError) { //둘다 에러 아닐시
            setErrorMessages({ locationError: false, dateError: false }); //에러 모두 false로 바꿈
            const response = await callPostAirInfoAPI();
            setContents(response);
            navigate(`/Reserve`, {
                state: {
                    contents: response, // 업데이트된 response를 직접 전달
                    seatLevel: seatLevel
                }
            });
        } else {
            setErrorMessages(errors);
        }
    }
    /** 출발지,도착지,항공사,날짜가 바뀔때마다 API요청 */
    async function callPostAirInfoAPI() {
        /** 백엔드로 보낼 데이터 : 출발지, 도착지, 날짜 */
        const formData = {
            depAirport: airports.dep.id, //출발지
            arrAirport: airports.arr.id, //도착지
            depTime: depTime, //날짜
        };
        try {
            // const response = axios.post(Constant.serviceURL + `/실시간데이터를 가지고 있는 URL`, formData, { withCredentials: true })
            return [{
                id: 1,
                economyCharge: null,
                prestigeCharge: null,
                vihicleId: "TW901",
                seatCapacity: null,
                airlineNm: "티웨이항공",
                arrAirportNm: "제주",
                depAirportNm: "광주",
                arrPlandTime: 202402151005,
                depPlandTime: 202402150915,
            }, {
                id: 2,
                economyCharge: 57900,
                prestigeCharge: 82900,
                vihicleId: "KE1603",
                seatCapacity: null,
                airlineNm: "대한항공",
                arrAirportNm: "제주",
                depAirportNm: "광주",
                arrPlandTime: 202402151035,
                depPlandTime: 202402150940,
            },
            ];
        }
        catch (error) {
            console.error(error);
        }
    }
    return (
        <div style={{marginTop:'44px'}}>
            {
                errorMessages.locationError && <div className="message danger-color">출발지와 도착지가 같습니다</div>
            }
            {
                errorMessages.dateError && <div className="message danger-color">날짜를 선택해주세요</div>
            }
            <div>
                <div>
                    <label>출발지</label>
                    <AirportSelect
                        value={airports.dep.id}
                        onChange={handleAirportChange('dep')}
                        airport={airport}
                    />
                </div>
                <button className="reverseIcon" onClick={handleAirPortReverse}>~</button>
                <div>
                    <label>도착지</label>
                    <AirportSelect
                        value={airports.arr.id}
                        onChange={handleAirportChange('arr')}
                        airport={airport}
                    />
                </div>
                <div>
                    <label>좌석등급</label>
                    <SeatLevelSelect
                        value={seatLevel}
                        onChange={(e) => handleSeatChange(e)}
                        level={level}
                    />
                </div>
                <div>
                    <label>가는날</label>
                    <Datepicker handleDateChange={handleDateChange} depTime={depTime} />
                </div>
                <button onClick={handlePay}>검색</button>
            </div>
        </div>
    );
}