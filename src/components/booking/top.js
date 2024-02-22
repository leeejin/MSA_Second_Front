import React, { useState, useEffect, useRef, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axiosInstance';
import styled from "styled-components";
import { TbArmchair2 } from "react-icons/tb";
import Datepicker from '../../util/datepicker';
import reverse from '../../styles/image/revert.png';
import Constant from '../../util/constant_variables';
import AirPort from '../../util/json/airport-list';
const MarkTd = styled.span`
    border:1px solid var(--grey-color);
    border-radius:15px;
    padding:0px 10px 0px 10px;
    font-size:1.0rem;
`;

const LocationLabel = styled.label`
    font-size:1.8rem;
`;
const Label = styled.label`
    padding-left:30px;
`;
const OptionLabel = styled.h3`
    margin-left:10px
`;

const level = Constant.getSeatLevel(); // 좌석등급
const airport = AirPort.response.body.items.item; // 공항 목록

/** 에러메시지 (출발지-도착지, 날짜) */
const ERROR_STATE = {
    depError: false,
    arrError: false,
    locationError: false,
    levelError: false,
    dateError: false,
    searchError: false,
}
const reducer = (state, action) => {
    switch (action.type) {
        case 'depError':
            return { ...state, depError: true }
        case 'arrError':
            return { ...state, arrError: true }
        case 'locationError':
            return { ...state, locationError: true }
        case 'levelError':
            return { ...state, levelError: true }
        case 'dateError':
            return { ...state, dateError: true }
        case 'searchError':
            return { ...state, searchError: true }
        default:
            return ERROR_STATE

    }
}
/** top component */
export default function TopComponent({ airports, setAirPorts }) {
    const navigate = useNavigate();

    const [depTime, setDepTime] = useState(null); // 출발날짜는 항상 오늘날짜의 다음날부터
    const [errorMessage, dispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지
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
  
    const handleChange = (locationType, e) => {
        setAirPorts((prev) => ({
            ...prev,
            [locationType]: e.target.getAttribute("value")
        }));
    };

    /** 해당 Nm를 가진 공항 객체를 찾아 id로 변환 */
    const getSelectedAirport = (selectedAirportNm) => {
        const selectedAirport = airport.find(
            (airport) => airport.airportNm === selectedAirportNm
        );
        if (selectedAirport) {
            return selectedAirport.airportId;
        }
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

    /** 출발 날짜 핸들러 */
    const handleDateChange = (date) => {
        setDepTime(date);
    }

    /** 검색 핸들러 */
    const handleSearch = async () => {
        /** 에러모음 */
        let errors = {
            depError: airports.dep === '출발',
            arrError: airports.arr === '도착',
            levelError: airports.level === '좌석을 선택해주세요',
            locationError: airports.dep === airports.arr, //출발지와 도착지가 똑같을 때
            dateError: depTime === '' || depTime <= new Date() //날짜를 선택하지 않았거나 선택한 날짜가 오늘날짜보다 이전일때
        };
        if (!errors.locationError && !errors.dateError && !errors.depError && !errors.arrError) { //둘다 에러 아닐시
            dispatch({ type: 'error' }); //에러 모두 false로 바꿈
            callPostAirInfoAPI().then((response) => {
                navigate(`/Reserve`, {
                    state: {
                        contents: response.data,
                        seatLevel: airport.level
                    }
                });

            }).catch((error) => {
                dispatch({ type: 'searchError', searchError: true });
                setTimeout(() => {
                    dispatch({ type: 'error' }); //에러 모두 false로 바꿈
                }, 1000);
            })


        } else {
            if (errors.depError) {
                dispatch({ type: 'depError', depError: errors.depError });
            } else if (errors.arrError) {
                dispatch({ type: 'arrError', arrError: errors.arrError });
            } else if (errors.locationError) {
                dispatch({ type: 'locationError', locationError: errors.locationError });
            } else if (errors.levelError) {
                dispatch({ type: 'levelError', levelError: errors.levelError });
            } else if (errors.dateError) {
                dispatch({ type: 'dateError', dateError: errors.dateError });
            }
            setTimeout(() => {
                dispatch({ type: 'error' }); //에러 모두 false로 바꿈
            }, 1000);
        }
    }
    /**date 형식 바꾸는 함수 */
    const handleDateFormatChange = (date) => {
        const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, '');

        return formattedDate;
    }
    const show = (type, value) => {
        setShowOptions((prev) => ({
            ...prev,
            [type]: !value
        }));
    };
    /** main.js 조회 데이터 API요청 */
    async function callPostAirInfoAPI() {

        /** 백엔드로 보낼 데이터 : 출발지, 도착지, 날짜 */
        const formData = {
            depAirport: getSelectedAirport(airports.dep), //출발지
            arrAirport: getSelectedAirport(airports.arr), //도착지
            seatLevel: airports.level, //좌석등급
            depTime: handleDateFormatChange(depTime), //날짜
        };
        try {
            const response = axios.post(Constant.serviceURL + `/flights/search`, formData, { withCredentials: true })
            return response;
        }
        catch (error) {
            console.error(error);
        }
    }
    return (
        <>
            {
                errorMessage.depError && <h3 className="white-wrap message">출발지를 입력해주세요</h3>
            }
            {
                errorMessage.arrError && <h3 className="white-wrap message">도착지를 입력해주세요</h3>
            }
            {
                errorMessage.levelError && <h3 className="white-wrap message">좌석을 선택해주세요</h3>
            }
            {
                errorMessage.locationError && <h3 className="white-wrap message">출발지와 도착지가 같습니다</h3>
            }
            {
                errorMessage.dateError && <h3 className="white-wrap message">날짜를 선택해주세요</h3>
            }
            {
                errorMessage.searchError && <h3 className="white-wrap message">조회 실패하였습니다</h3>
            }
            <div className="container container-top" >
                <div className="mainpanel">
                    <div className='parent-container'>
                        <table>
                            <thead>
                                <tr>
                                    <td><MarkTd>출발지</MarkTd></td>
                                    <td />
                                    <td><MarkTd>도착지</MarkTd></td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <SelectComponent
                                            selectBoxRef={selectBoxRef}
                                            number={1}
                                            isShowOptions={selectBoxRef.current[1] && isShowOptions.dep}
                                            show={() => show('dep', isShowOptions.dep)} // show 함수를 호출할 때 'dep'을 전달합니다.
                                            airportsName={airports.dep}
                                            airport={airport}
                                            handleChange={(e) => handleChange("dep", e)}
                                        />
                                    </td>
                                    <td>
                                        <button className="doButton" onClick={handleAirPortReverse}><img src={reverse} /></button>
                                    </td>
                                    <td>
                                        <SelectComponent
                                            selectBoxRef={selectBoxRef}
                                            number={2}
                                            isShowOptions={selectBoxRef.current[2] && isShowOptions.arr}
                                            show={() => show('arr', isShowOptions.arr)} // show 함수를 호출할 때 'dep'을 전달합니다.
                                            airportsName={airports.arr}
                                            airport={airport}
                                            handleChange={(e) => handleChange("arr", e)}
                                        />
                                    </td>

                                </tr>
                            </tbody>
                        </table>
                        <table>
                            <thead>
                                <tr>
                                    <td><MarkTd>가는날</MarkTd></td>
                                    <td />
                                    <td><MarkTd>좌석등급</MarkTd></td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <SelectComponent
                                            selectBoxRef={selectBoxRef}
                                            number={3}
                                            isShowOptions={selectBoxRef.current[3] && isShowOptions.level}
                                            show={() => show('level', isShowOptions.level)} // show 함수를 호출할 때 'dep'을 전달합니다.
                                            airportsName={airports.level}
                                            level={level}
                                            handleChange={(e) => handleChange("level", e)}
                                        />
                                    </td>
                                    <td />
                                    <td>
                                        <Datepicker handleDateChange={handleDateChange} depTime={depTime} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style={{ clear: 'both' }}>
                        <button className="button-search" onClick={handleSearch} >검색하기</button>
                    </div>

                </div>
            </div>
        </>

    );
}
/** 출발지,도착지,좌석 컴포넌트 */
const SelectComponent = ({ selectBoxRef, number, isShowOptions, show, airportsName, airport, level, handleChange }) => {
    if (number === 3) {
        return (
            <div
                ref={el => selectBoxRef.current[number] = el}
                className={`select select-level ${isShowOptions && 'active'}`}
                onClick={show}>
                <TbArmchair2 style={{ fontSize: "1.6rem", margin: -5 }} />
                <Label style={{ paddingLeft: '5px', paddingBottom: '5px', color: airportsName === '좌석을 선택해주세요' ? 'grey' : 'var(--black-color)' }}>{airportsName}</Label>
                {
                    isShowOptions && (
                        <ul
                            className="select-option select-option-level"
                        >
                            <OptionLabel>좌석 등급 선택</OptionLabel>
                            {
                                level.map((level) => (
                                    <li
                                        className="option level-style"
                                        onClick={handleChange}
                                        key={level.key}
                                        value={level.value}>
                                        {level.name}
                                    </li>
                                ))
                            }
                        </ul>
                    )
                }

            </div>
        )
    } else {
        return (
            <div
                ref={el => selectBoxRef.current[number] = el}
                className={`select select-location ${isShowOptions && 'active'}`}
                onClick={show}>
                <LocationLabel style={{ color: (airportsName === '출발' || airportsName === '도착') ? 'grey' : 'var(--black-color)' }}>{airportsName}</LocationLabel>
                {
                    isShowOptions && (
                        <ul
                            className="select-option select-option-location"
                        >
                            {
                                airport.map((ap) => (
                                    <li
                                        className="option"
                                        onClick={handleChange}
                                        key={ap.airportId}
                                        value={ap.airportNm}>
                                        {ap.airportNm}
                                    </li>
                                ))
                            }
                        </ul>
                    )
                }

            </div>
        )
    }

}