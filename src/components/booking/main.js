import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";
import axios from 'axios';
import { TbArmchair2 } from "react-icons/tb";
import Constant from '../../util/constant_variables';
import AirPort from '../../util/json/airport-list';
import Datepicker from '../../util/datepicker';
import reverse from '../../styles/image/revert.png';
const ReverseIcon = styled.img`
    width:30px;
`;

const LocationLabel = styled.label`
    font-size:1.6rem;
`;
const Label = styled.label`
    padding-left:30px;
`;
const OptionLabel = styled.h3`
    margin-left:10px
`;
const SelectOptions = styled.ul`
  max-height: ${(props) => (props.show ? "none" : "0")};
`;

/** 메인페이지 - 여기서 예약조회 하기 위한 검색 */
export default function Main() {
    const navigate = useNavigate();

    const level = Constant.getSeatLevel(); // 좌석등급
    const airport = AirPort.response.body.items.item; // 공항 목록

    const [airports, setAirPorts] = useState({
        dep: AirPort.response.body.items.item[0].airportNm,
        arr: AirPort.response.body.items.item[1].airportNm,
        level: level[0].value
    })

    const [depTime, setDepTime] = useState(null); // 출발날짜는 항상 오늘날짜의 다음날부터
    const [contents, setContents] = useState([]); //백에서 받은 출발지,도착지,출발날짜를 포함한 다른 데이터를 가진 객체 배열을 여기다가 저장
    const [errorMessage, setErrorMessage] = useState({ locationError: false, dateError: false }); //에러메시지 (출발지-도착지, 날짜)

    /** 셀렉트 전용 */
    const [isShowOptions, setShowOptions] = useState({ dep: false, arr: false, level: false });
    const selectBoxRef = useRef([null, null, null]);
    useEffect(() => {
        const handleOutsideClick = (event) => {
            const isOutsideClick = selectBoxRef.current.every((ref, index) => {
                return !ref?.contains(event.target);
            });
            if (isOutsideClick) {
                setShowOptions({ dep: false, arr: false, level: false });
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const handleLocationChange = (locationType, e) => {
        setAirPorts((prev) => ({
            ...prev,
            [locationType]: e.target.getAttribute("value")
        }));
    };

    /** 해당 Nm를 가진 공항 객체를 찾아 id로 변환 */
    const getSelectedAirport = (selectedAirportNm) => {
        const selectedAirport = AirPort.response.body.items.item.find(
            (airport) => airport.airportNm === selectedAirportNm
        );
        if (selectedAirport) {
            return selectedAirport.airportId;
        }
    }
    /**출발지와 도착지 리버스 핸들러 */
    const handleAirPortReverse = () => {
        setAirPorts(prev => ({ ...prev, dep: prev.arr, arr: prev.dep }));
    }

    /** 출발 날짜 핸들러 */
    const handleDateChange = (date) => {
        setDepTime(date);
    }
    /** 검색 핸들러 */
    const handleSearch = async () => {
        /** 에러모음 */
        let errors = {
            locationError: airports.dep === airports.arr, //출발지와 도착지가 똑같을 때
            dateError: depTime === null || depTime <= new Date() //날짜를 선택하지 않았거나 선택한 날짜가 오늘날짜보다 이전일때
        }
        if (!errors.locationError && !errors.dateError) { //둘다 에러 아닐시
            setErrorMessage({ locationError: false, dateError: false }); //에러 모두 false로 바꿈
            const response = await callPostAirInfoAPI();
            setContents(response);
            // navigate(`/Reserve`, {
            //     state: {
            //         contents: response, // 업데이트된 response를 직접 전달
            //         seatLevel: airport.level
            //     }
            // });

        } else {
            if (errors.locationError) {
                setErrorMessage({ locationError: errors.locationError });
            } else if (errors.dateError) {
                setErrorMessage({ dateError: errors.dateError });
            }
            setTimeout(() => {
                setErrorMessage({ locationError: false, dateError: false }); //에러 모두 false로 바꿈
            }, 1000);
        }
    }
    /** main.js 조회 데이터 API요청 */
    async function callPostAirInfoAPI() {

        /** 백엔드로 보낼 데이터 : 출발지, 도착지, 날짜 */
        const formData = {
            depAirport: getSelectedAirport(airports.dep), //출발지
            arrAirport: getSelectedAirport(airports.arr), //도착지
            seatLevel: airports.level, //좌석등급
            depTime: depTime, //날짜
        };
        console.log(formData);
        try {
            const response = axios.post(Constant.serviceURL + `/flights/search`, formData, { withCredentials: true })
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
            },
            ];
        }
        catch (error) {
            console.error(error);
        }
    }
    return (
        <div>

            {
                errorMessage.locationError && <h3 className="white-wrap message">출발지와 도착지가 같습니다</h3>
            }
            {
                errorMessage.dateError && <h3 className="white-wrap message">날짜를 선택해주세요</h3>
            }

            <div className="mainbackground" >
                <div className="mainpanel">

                    <table className='parent-container'>
                        <thead>
                            <tr>
                                <td>출발지</td>
                                <td />
                                <td>도착지</td>
                                <td>가는날</td>
                                <td>좌석등급</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <SelectComponent
                                        selectBoxRef={selectBoxRef}
                                        number={1}
                                        isShowOptions={isShowOptions.dep}
                                        setShowOptions={() => setShowOptions((prev) => ({ ...prev, dep: !prev.dep }))}
                                        airportsName={airports.dep}
                                        airport={airport}
                                        handleLocationChange={(e) => handleLocationChange("dep", e)}
                                    />
                                </td>
                                <td>
                                    <button className="doButton" onClick={handleAirPortReverse}><ReverseIcon src={reverse} /></button>
                                </td>
                                <td>
                                    <SelectComponent
                                        selectBoxRef={selectBoxRef}
                                        number={2}
                                        isShowOptions={isShowOptions.arr}
                                        setShowOptions={() => setShowOptions((prev) => ({ ...prev, arr: !prev.arr }))}
                                        airportsName={airports.arr}
                                        airport={airport}
                                        handleLocationChange={(e) => handleLocationChange("arr", e)}
                                    />
                                </td>
                                <td>
                                    <div
                                        ref={el => selectBoxRef.current[3] = el}
                                        className={`${isShowOptions.level ? 'select-box select-level active' : 'select-box select-level'}`}
                                        onClick={() => setShowOptions((prev) => ({ ...prev, level: !prev.level }))}>
                                        <div>
                                            <TbArmchair2 />
                                            <Label>{airports.level}</Label>
                                        </div>
                                        <SelectOptions
                                            className="select-option"
                                            show={isShowOptions.level}>
                                            <OptionLabel>좌석 등급 선택</OptionLabel>
                                            {level.map((level) => (
                                                <li
                                                    className="option level-style"
                                                    onClick={(e) => handleLocationChange("level", e)}
                                                    key={level.key}
                                                    value={level.value}>
                                                    {level.name}
                                                </li>
                                            ))}
                                        </SelectOptions>
                                    </div>
                                </td>
                                <td>
                                    <Datepicker handleDateChange={handleDateChange} depTime={depTime} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <button className="nav-item" onClick={handleSearch} >검색하기</button>
                </div>
            </div>
        </div>

    );
}

/** 출발지,도착지 컴포넌트 */
const SelectComponent = ({ selectBoxRef, number, isShowOptions, setShowOptions, airportsName, airport, handleLocationChange }) => {
    return (
        <div
            ref={el => selectBoxRef.current[number] = el}
            className={`${isShowOptions ? 'select-box select-location active' : 'select-box select-location'}`}
            onClick={setShowOptions}>

            <LocationLabel>{airportsName}</LocationLabel>
            <SelectOptions
                className="select-option"
                show={isShowOptions}>
                {
                    airport.map((ap) => (
                        <li
                            className="option"
                            onClick={handleLocationChange}
                            key={ap.airportId}
                            value={ap.airportNm}>
                            {ap.airportNm}
                        </li>
                    ))
                }
            </SelectOptions>
        </div>
    )
}