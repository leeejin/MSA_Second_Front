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

    const [startDate, setStartDate] = useState(null); // 출발날짜는 항상 오늘날짜의 다음날부터
    const [cost, setCost] = useState(0); // 가격

    const [listModalVisible, setListModalVisible] = useState(false); //예약목록체크 모달

    const [errorMessage, setErrorMessage] = useState(false); //에러메시지
    const [dateErrorMessage, setDateErrorMessage] = useState(false) //날짜에러 메시지
    //예약목록 데이터
    const listData = {
        chooseAirLine: chooseAirLine,
        depAirPort: depAirPort,
        arrAirPort: arrAirPort,
        startDate: startDate
    }

    // 출발지 변경 핸들러
    const handleDepAirPortChange = (event) => {
        const selectedAirportId = event.target.value;
        setDepAirPort(selectedAirportId);

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
            locationError: depAirPort === arrAirPort,
            dateError: startDate === null || startDate<=new Date()
        }
        if (!errors.locationError && !errors.dateError) {
            setErrorMessage(false);
            setDateErrorMessage(false);
            setListModalVisible(true);
            //결제 버튼 눌렀을 때 로직 짜야함
        } else {
            setErrorMessage(errors.locationError);
            setDateErrorMessage(errors.dateError);
            setListModalVisible(false);
        }

    }

    //출발지, 도착지, 항공사, 날짜
    return (
        <div className="container">
            {
                listModalVisible && <ModalBookCheck listData={listData} setListModalVisible={setListModalVisible} />
            }
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

//예약확인 모달창
const ModalBookCheck = ({ listData, setListModalVisible }) => {
    const navigate = useNavigate();
    const startDate = listData.startDate;

    const handlePayCheck = () => {
        //여기서 예약됐고 결제 페이지 가시겠습니까? 문구 띄어야함
        console.log('야호~');
        navigate('/PayCheck'); //로그인 하면 가야함 근데 아직 서버 연결안되서 안됨
    }
    const handleModalVisible = () => {
        setListModalVisible(false);
    }
    return (
        <div className="black-wrap">
            <div className="white-wrap">
                <div>
                    <h5>예약목록</h5>
                    <p>출발지 : ({listData.depAirPort})</p>
                    <p>도착지 : ({listData.arrAirPort})</p>
                    <p>항공사 : ({listData.chooseAirLine})</p>
                    <p>예약날짜 : {dayjs(startDate).format('YYYY-MM-DD a h:mm')}</p>
                </div>
                <div>
                    <button onClick={handlePayCheck}>예</button>
                    <button onClick={handleModalVisible}>아니오</button>
                </div>
            </div>

        </div>
    )
}