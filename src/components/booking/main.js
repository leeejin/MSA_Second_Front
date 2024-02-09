import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Constant from '../../util/constant_variables';
import AirPort from '../../util/json/airport-list';
import AirLine from '../../util/json/airline-list';
import Datepicker from '../../util/datepicker';
import 'dayjs/locale/ko';
import dayjs from 'dayjs';
dayjs.locale('ko'); // 한국어로 설정

//메인페이지 - 여기서 예약조회 가능
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
    const [depTime, setDepTime] = useState(null); // 출발날짜는 항상 오늘날짜의 다음날부터
    const [contents, setContents] = useState([]);

    useEffect(() => {
        callPostAirInfoAPI().then((response) => {
            setContents(response);
        }).catch((error) => {
            console.log("정보를 불러들이는데 실패");
        })
    }, [depTime, depAirPort, arrAirPort, chooseAirLine])

    const [errorMessage, setErrorMessage] = useState(false); //에러메시지
    const [dateErrorMessage, setDateErrorMessage] = useState(false) //날짜에러 메시지

    // 공항 핸들러 함수
    const handleAirportChange = (setAirport, setAirportNm) => (event) => {
        const selectedAirportId = event.target.value;
        setAirport(selectedAirportId);
        const selectedAirport = getSelectedAirport(selectedAirportId);
        if (selectedAirport) setAirportNm(selectedAirport.airportNm);
    };
    // 공항 선택 컴포넌트
    const AirportSelect = ({ value, onChange, airport }) => (
        <select value={value} onChange={onChange} size="small">
            {airport.map((ap) => (
                <option key={ap.airportId} value={ap.airportId}>
                    {ap.airportNm}
                </option>
            ))}
        </select>
    );
    //항공사 변경 핸들러
    const handleChooseAirLineChange = (event) => {
        const selectedAirlineId = event.target.value;
        setChooseAirLine(selectedAirlineId);
        // 객체에서 공항 이름을 찾아 상태를 업데이트
        const selectedAirline = getSelectedAirline(selectedAirlineId);
        if (selectedAirline) setChooseAirLineNm(selectedAirline.airlineNm);
    };
    // 해당 ID를 가진 공항 객체를 찾음
    const getSelectedAirport = (selectedAirportId) => {
        const selectedAirport = AirPort.response.body.items.item.find(
            (airport) => airport.airportId === selectedAirportId
        );
        return selectedAirport;
    }
    // 해당 ID를 가진 항공사 객체를 찾음
    const getSelectedAirline = (selectedAirlineId) => {
        const selectedAirline = AirLine.response.body.items.item.find(
            (airline) => airline.airlineId === selectedAirlineId
        );
        return selectedAirline;
    }

    //출발 날짜 핸들러
    const handleDateChange = (date) => {
        setDepTime(date);
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
            dateError: depTime === null || depTime <= new Date()
        }
        if (!errors.locationError && !errors.dateError) {
            setErrorMessage(false);
            setDateErrorMessage(false);
            navigate(`/Reserve`, {   //로그인 하면 가야함 근데 아직 서버 연결안되서 App.js 임시적으로 풀어놓음
                state: {
                    chooseAirLine: chooseAirLine,
                    depAirPort: depAirPort,
                    arrAirPort: arrAirPort,
                    depTime: depTime,
                    chooseAirLineNm: chooseAirLineNm,
                    depAirPortNm: depAirPortNm,
                    arrAirPortNm: arrAirPortNm,
                    charge: contents.charge,
                    arrTime: contents.arrTime,
                    seatCapacity: contents.seatCapacity
                }
            });
        } else {
            setErrorMessage(errors.locationError);
            setDateErrorMessage(errors.dateError);
        }

    }
    //출발지,도착지,항공사,날짜가 바뀔때마다 API요청 -맞나 ..?
    async function callPostAirInfoAPI() {
        //백엔드로 보낼 데이터 : 출발지, 도착지, 항공사, 날짜
        // const formData = {
        //     airLine: chooseAirLine,
        //     depAirport: depAirPort,
        //     arrAirport: arrAirPort,
        //     depTime: depTime,
        // };
        // const response = axios.post(Constant.serviceURL + `실시간데이터를 가지고 있는 URL`, formData, { withCredentials: true })
        return {
            charge: 0, // 가격
            seatCapacity: 0, //좌석 수
            vihicleId: 0, //무슨 아이디지 ??
            arrTime: new Date('2024-03-16 16:20') //도착시간
        };
    }

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
                    <AirportSelect
                        value={depAirPort}
                        onChange={handleAirportChange(setDepAirPort, setDepAirPortNm)}
                        airport={airport}
                    />
                </div>
                <button className="reverseIcon" onClick={handleAirPortReverse}>~</button>
                <div>
                    <label>도착지</label>
                    <AirportSelect
                        value={arrAirPort}
                        onChange={handleAirportChange(setArrAirPort, setArrAirPortNm)}
                        airport={airport}
                    />
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
                    <label>좌석수</label>
                    <p>{contents.seatCapacity}석</p>
                </div>
            </div>


            <div>
                <Datepicker handleDateChange={handleDateChange} depTime={depTime} />
            </div>
            <button onClick={handlePay}>예약</button>
        </div>
    );
}