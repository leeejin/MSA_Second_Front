import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AirPort from '../../util/json/airport-list';
import AirLine from '../../util/json/airline-list';
import Datepicker from '../../util/datepicker';
import 'dayjs/locale/ko';
import dayjs from 'dayjs';
dayjs.locale('ko'); // 한국어로 설정

export default function Main() {

    const navigate = useNavigate();

    const airport = AirPort.response.body.items.item; // 공항 목록
    const airLine = AirLine.response.body.items.item; // 항공사

    const [chooseAirLine, setChooseAirLine] = useState(AirLine.response.body.items.item[0].airlineId); //항공사
    const [depAirPort, setDepAirPort] = useState(AirPort.response.body.items.item[0].airportId); // 출발지
    const [arrAirPort, setArrAirPort] = useState(AirPort.response.body.items.item[1].airportId); // 도착지
    const [chooseAirLineNm, setChooseAirLineNm] = useState(AirLine.response.body.items.item[0].airlineNm); //항공사
    const [depAirPortNm, setDepAirPortNm] = useState(AirPort.response.body.items.item[0].airportNm); // 출발지
    const [arrAirPortNm, setArrAirPortNm] = useState(AirPort.response.body.items.item[1].airportNm); // 도착지
    const [startDate, setStartDate] = useState(null); // 출발날짜는 항상 오늘날짜의 다음날부터
    const [cost, setCost] = useState(0); // 가격


    const [errorMessage, setErrorMessage] = useState(false); //에러메시지
    const [dateErrorMessage, setDateErrorMessage] = useState(false) //날짜에러 메시지

    // 출발지 변경 핸들러
    const handleDepAirPortChange = (event) => {
        const selectedAirportId = event.target.value;
        setDepAirPort(selectedAirportId);
        // 해당 ID를 가진 객체를 찾음
        const selectedAirport = AirPort.response.body.items.item.find(
            (airport) => airport.airportId === selectedAirportId
        );
        // 객체에서 공항 이름을 찾아 상태를 업데이트
        if (selectedAirport) {
            setDepAirPortNm(selectedAirport.airportNm);
        }
    };
    //도착지 변경 핸들러
    const handleArrAirPortChange = (event) => {
        const selectedAirportId = event.target.value;
        setArrAirPort(selectedAirportId);
        // 해당 ID를 가진 객체를 찾음
        const selectedAirport = AirPort.response.body.items.item.find(
            (airport) => airport.airportId === selectedAirportId
        );
        // 객체에서 공항 이름을 찾아 상태를 업데이트
        if (selectedAirport) {
            setArrAirPortNm(selectedAirport.airportNm);
        }
    };
    //항공사 변경 핸들러
    const handleChooseAirLineChange = (event) => {
        const selectedAirlineId = event.target.value;
        setChooseAirLine(selectedAirlineId);
        // 해당 ID를 가진 객체를 찾음
        const selectedAirline = AirLine.response.body.items.item.find(
            (airline) => airline.airlineId === selectedAirlineId
        );
        // 객체에서 공항 이름을 찾아 상태를 업데이트
        if (selectedAirline) {
            setChooseAirLineNm(selectedAirline.airlineNm);
        }
    };
    //출발 날짜 핸들러
    const handleDateChange = (date) => {
        setStartDate(date);
    }
    //출발지랑 도착지 리버스 핸들러
    const handleAirPortReverse = () => {
        //Id가 서로 바뀜
        setDepAirPort(arrAirPort);
        setArrAirPort(depAirPort);
        //Nm가 서로 바뀜
        setDepAirPortNm(arrAirPortNm);
        setArrAirPortNm(depAirPortNm);
    }
    //결제 핸들러
    const handlePay = () => {
        //에러모음
        let errors = {
            locationError: depAirPort === arrAirPort,
            dateError: startDate === null || startDate <= new Date()
        }
        if (!errors.locationError && !errors.dateError) {
            setErrorMessage(false);
            setDateErrorMessage(false);
            navigate(`/PayCheck`, {   //로그인 하면 가야함 근데 아직 서버 연결안되서 안됨
                state: {
                    chooseAirLine: chooseAirLine,
                    depAirPort: depAirPort,
                    arrAirPort: arrAirPort,
                    startDate: startDate,
                    chooseAirLineNm: chooseAirLineNm,
                    depAirPortNm: depAirPortNm,
                    arrAirPortNm: arrAirPortNm,
                    cost: cost,
                }
            });
        } else {
            setErrorMessage(errors.locationError);
            setDateErrorMessage(errors.dateError);
        }

    }

    //출발지, 도착지, 항공사, 날짜
    return (
        <div className="container">

            {
                errorMessage && <div className="message danger-color">출발지와 도착지가 같습니다</div>
            }
            {
                dateErrorMessage && <div className="message danger-color">날짜를 선택해주세요 </div>
            }
            <div>
                <div>
                    <label>출발지</label>
                    <select
                        value={depAirPort}
                        onChange={handleDepAirPortChange}
                        size="small">
                        {airport.map((ap) => (
                            <option key={ap.airportId} value={ap.airportId}>
                                {ap.airportNm}
                            </option>
                        ))}
                    </select>
                </div>
                <button className="reverseIcon" onClick={handleAirPortReverse}>~</button>
                <div>
                    <label>도착지</label>
                    <select
                        value={arrAirPort}
                        onChange={handleArrAirPortChange}
                        size="small">
                        {airport.map((ap) => (
                            <option key={ap.airportId} value={ap.airportId}>
                                {ap.airportNm}
                            </option>
                        ))}
                    </select>
                </div>
            </div>


            <div>
                <label>항공사</label>
                <select
                    value={chooseAirLine}
                    onChange={handleChooseAirLineChange}
                    size="small">
                    {airLine.map((ap) => (
                        <option key={ap.airlineId} value={ap.airlineId}>
                            {ap.airlineNm}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <Datepicker handleDateChange={handleDateChange} startDate={startDate} />
            </div>
            <button onClick={handlePay}>예약</button>
        </div>
    );
}