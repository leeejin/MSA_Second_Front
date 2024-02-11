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

    const level = Constant.getSeatLevel();
    const airport = AirPort.response.body.items.item; // 공항 목록
    const [depAirPort, setDepAirPort] = useState(AirPort.response.body.items.item[0].airportId); // 출발지
    const [arrAirPort, setArrAirPort] = useState(AirPort.response.body.items.item[1].airportId); // 도착지

    const [depAirPortNm, setDepAirPortNm] = useState(AirPort.response.body.items.item[0].airportNm); // 출발지
    const [arrAirPortNm, setArrAirPortNm] = useState(AirPort.response.body.items.item[1].airportNm); // 도착지
    const [seatLevel, setSeatLevel] = useState(level[0].value);
    const [depTime, setDepTime] = useState(null); // 출발날짜는 항상 오늘날짜의 다음날부터
    const [contents, setContents] = useState([]);

    useEffect(() => {
        callPostAirInfoAPI().then((response) => {
            setContents(response);
        }).catch((error) => {
            console.log("정보를 불러들이는데 실패");
        })
    }, [depTime, depAirPort, arrAirPort])

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

    // 해당 ID를 가진 공항 객체를 찾음
    const getSelectedAirport = (selectedAirportId) => {
        const selectedAirport = AirPort.response.body.items.item.find(
            (airport) => airport.airportId === selectedAirportId
        );
        return selectedAirport;
    }


    const handleSeatChange = (e) => {
        setSeatLevel(e.target.value);
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
                    contents: contents,
                    seatLevel: seatLevel
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
        //     depAirport: depAirPort, //출발지
        //     arrAirport: arrAirPort, //도착지
        //     depTime: depTime, //날짜
        // };
        // const response = axios.post(Constant.serviceURL + `실시간데이터를 가지고 있는 URL`, formData, { withCredentials: true })
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
                    <label>좌석등급</label>
                    <select
                        value={seatLevel}
                        onChange={(e) => handleSeatChange(e)}>
                        {
                            level.map((level, i) =>
                                <option key={level.key} value={level.value}>
                                    {level.name}
                                </option>)
                        }
                    </select>
                </div>
                <div>
                    <Datepicker handleDateChange={handleDateChange} depTime={depTime} />
                </div>
                <button onClick={handlePay}>검색</button>
            </div>



        </div>
    );
}