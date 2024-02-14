import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";
import axios from 'axios';
import { TbArmchair2 } from "react-icons/tb";
import Constant from '../../util/constant_variables';
import AirPort from '../../util/json/airport-list';
import Datepicker from '../../util/datepicker';
const SelectLocation = styled.div`
width: 100px;
border:none;
`;
const SelectBox = styled.div`
width: 200px;
  border-bottom:2px solid var(--black-color);
`;
const IconWrapper = styled.div`
    display: inline-block;
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
    const [dep, setDep] = useState( // 도착지 상태 저장할 변수
        AirPort.response.body.items.item[0].airportNm
    );
    const [arr, setArr] = useState( // 도착지 상태 저장할 변수
        AirPort.response.body.items.item[1].airportNm
    );

    const [seatLevel, setSeatLevel] = useState(level[0].value); //좌석등급
    const [depTime, setDepTime] = useState(null); // 출발날짜는 항상 오늘날짜의 다음날부터
    const [contents, setContents] = useState([]); //백에서 받은 출발지,도착지,출발날짜를 포함한 다른 데이터를 가진 객체 배열을 여기다가 저장
    const [errorMessage, setErrorMessage] = useState({ locationError: false, dateError: false }); //에러메시지 (출발지-도착지, 날짜)

    /** 셀렉트 전용 */
    const [isShowDepOptions, setShowDepOptions] = useState(false);
    const [isShowArrOptions, setShowArrOptions] = useState(false);
    const [isShowOptions, setShowOptions] = useState(false);
    const selectBoxRef = useRef([null, null, null]);
    const handleOnChangeSelectValue = (e) => {
        setSeatLevel(e.target.getAttribute("value"));
    };
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (selectBoxRef.current[1] && !selectBoxRef.current[1].contains(event.target)) {
                setShowDepOptions(false);
            }
            if (selectBoxRef.current[2] && !selectBoxRef.current[2].contains(event.target)) {
                setShowArrOptions(false);
            }
            if (selectBoxRef.current[3] && !selectBoxRef.current[3].contains(event.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const handleDepChange = (e) => {
        setDep(e.target.getAttribute("value"));
    }
    const handleArrChange = (e) => {
        setArr(e.target.getAttribute("value"));
    }

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
        setArr(dep);
        setDep(arr);
    }

    /** 출발 날짜 핸들러 */
    const handleDateChange = (date) => {
        setDepTime(date);
    }
    /** 검색 핸들러 */
    const handlePay = async () => {
        /** 에러모음 */
        let errors = {
            locationError: dep === arr, //출발지와 도착지가 똑같을 때
            dateError: depTime === null || depTime <= new Date() //날짜를 선택하지 않았거나 선택한 날짜가 오늘날짜보다 이전일때
        }
        if (!errors.locationError && !errors.dateError) { //둘다 에러 아닐시
            setErrorMessage({ locationError: false, dateError: false }); //에러 모두 false로 바꿈
            const response = await callPostAirInfoAPI();
            setContents(response);
            // navigate(`/Reserve`, {
            //     state: {
            //         contents: response, // 업데이트된 response를 직접 전달
            //         seatLevel: seatLevel
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
    /** 출발지,도착지,항공사,날짜가 바뀔때마다 API요청 */
    async function callPostAirInfoAPI() {

        /** 백엔드로 보낼 데이터 : 출발지, 도착지, 날짜 */
        const formData = {
            depAirport: getSelectedAirport(dep), //출발지
            arrAirport: getSelectedAirport(arr), //도착지
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
            <div className="background" style={{ height: '50%' }} />
            <h3 className='componentTitle' />
            {
                errorMessage.locationError && <h3 className="white-wrap">출발지와 도착지가 같습니다</h3>
            }
            {
                errorMessage.dateError && <h3 className="white-wrap">날짜를 선택해주세요</h3>
            }
            <div>
                <div>
                    <p>출발지</p>
                    <SelectLocation
                        ref={el => selectBoxRef.current[1] = el}
                        className={`${isShowDepOptions ? 'select-box active' : 'select-box'}`}
                        onClick={() => setShowDepOptions((prev) => !prev)}>
                        <LocationLabel>{dep}</LocationLabel>
                        <SelectOptions
                            className="select-option"
                            show={isShowDepOptions}>
                            {
                                airport.map((ap) => (
                                    <li
                                        className="option"
                                        onClick={(e) => handleDepChange(e)}
                                        key={ap.airportId}
                                        value={ap.airportNm}>
                                        {ap.airportNm}
                                    </li>
                                ))
                            }
                        </SelectOptions>
                    </SelectLocation>
                </div>
                <button className="doButton" onClick={handleAirPortReverse}>~</button>
                <div>
                    <p>도착지</p>
                    <SelectLocation
                        ref={el => selectBoxRef.current[2] = el}
                        className={`${isShowArrOptions ? 'select-box active' : 'select-box'}`}
                        onClick={() => setShowArrOptions((prev) => !prev)}>
                        <LocationLabel>{arr}</LocationLabel>
                        <SelectOptions
                            className="select-option"
                            show={isShowArrOptions}>
                            {
                                airport.map((ap) => (
                                    <li
                                        className="option"
                                        onClick={(e) => handleArrChange(e)}
                                        key={ap.airportId}
                                        value={ap.airportNm}>
                                        {ap.airportNm}
                                    </li>
                                ))
                            }
                        </SelectOptions>
                    </SelectLocation>
                </div>
                <div>
                    <p>좌석등급</p>
                    <SelectBox
                        ref={el => selectBoxRef.current[3] = el}
                        className={`${isShowOptions ? 'select-box active' : 'select-box'}`}
                        onClick={() => setShowOptions((prev) => !prev)}>
                        <IconWrapper>
                            <TbArmchair2 />
                            <Label>{seatLevel}</Label>
                        </IconWrapper>
                        <SelectOptions
                            className="select-option"
                            show={isShowOptions}>
                            <OptionLabel>좌석 등급 선택</OptionLabel>
                            {level.map((level) => (
                                <li
                                    className="option level-style"
                                    onClick={(e) => handleOnChangeSelectValue(e)}
                                    key={level.key}
                                    value={level.value}>
                                    {level.name}
                                </li>
                            ))}
                        </SelectOptions>
                    </SelectBox>
                </div>
                <div>
                    <p>가는날</p>
                    <Datepicker handleDateChange={handleDateChange} depTime={depTime} />
                </div>
                <button onClick={handlePay}>검색</button>
            </div>

        </div>
    );
}