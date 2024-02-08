import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import CodeIcon from '@mui/icons-material/Code';
import AirPort from '../../util/json/airport-list';
import AirLine from '../../util/json/airline-list';

import DatePicker from 'react-datepicker';
import ko from 'date-fns/locale/ko';
import dayjs from 'dayjs';
import "react-datepicker/dist/react-datepicker.css";

export default function Main() {
    const navigate = useNavigate();
    const airport = AirPort.response.body.items.item; // 공항 목록
    const airLine = AirLine.response.body.items.item; // 항공사
    const [chooseAirLine, setChooseAirLine] = useState(AirLine.response.body.items.item[0].airlineId);
    const [depAirPort, setDepAirPort] = useState(AirPort.response.body.items.item[0].airportId); // 출발지
    const [arrAirPort, setArrAirPort] = useState(AirPort.response.body.items.item[1].airportId); // 도착지

    const [startDate, setStartDate] = useState(null); // 출발날짜는 항상 오늘날짜의 다음날부터
    const [cost, setCost] = useState(0); // 가격

    const [errorMessage, setErrorMessage] = useState(false);
    // 출발지 변경 핸들러
    const handleDepAirPortChange = (event) => {
        setDepAirPort(event.target.value);
    };
    //도착지 변경 핸들러
    const handleArrAirPortChange = (event) => {
        setArrAirPort(event.target.value);
    };
    //항공사 변경 핸들러
    const handleChooseAirLineChange = (event) => {
        setChooseAirLine(event.target.value);
    };
    //출발 날짜 핸들러
    const handleDateChange = (date) => {
        setStartDate(date);
    }
    //출발지랑 도착지 리버스 핸들러
    const handleAirPortReverse = () => {
        setDepAirPort(arrAirPort);
        setArrAirPort(depAirPort);
    }
    //결제 핸들러
    const handlePay = () => {
        //에러모음
        let errors = {
            locationError: depAirPort === arrAirPort
        }
        if (!errors.locationError) {
            setErrorMessage(false);
            navigate('/PayCheck');
            //결제 버튼 눌렀을 때 로직 짜야함
        } else {
            setErrorMessage(true);
        }
    }

    //출발지, 도착지, 항공사, 날짜
    return (
        <div className="container">
            {
                errorMessage && <div>출발지와 도착지가 같습니다</div>
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
                <CodeIcon className="reverseIcon" onClick={handleAirPortReverse} />

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
            <section>
                <DatePicker
                    className="datepicker"
                    shouldCloseOnSelect
                    locale={ko}
                    selectsRange={false}
                    selected={startDate}
                    dateFormat="yyyy-MM-dd"
                    minDate={new Date(dayjs().add(1, 'day'))}
                    onChange={(date) => handleDateChange(date)}
                />
            </section>



            <button onClick={handlePay}>예약</button>
        </div>
    );
}