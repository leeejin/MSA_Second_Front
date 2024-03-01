import React, { useState, useEffect, useRef, useReducer, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axiosInstance';
import styled from "styled-components";
import { TbArmchair2 } from "react-icons/tb";
import Datepicker from '../../util/datepicker';
import reverse from '../../styles/image/revert.png';
import Constant from '../../util/constant_variables';
import AirPort from '../../util/json/airport-list';
import store from '../../util/redux_storage';
import { BsExclamationCircle } from "react-icons/bs";
import reducer from '../../util/reducers';
const MarkTd = styled.span`
    border:1px solid var(--grey-color);
    border-radius:15px;
    padding:0px 10px 0px 10px;
    font-size:1.0rem;
`;

const LocationLabel = styled.label`
    font-size:1.8rem;
    color: ${props => props.color};
`;
const Label = styled.label`
    padding-left:5px;
    padding-bottom: 5px;
    font-family: Pretendard-semibold;
`;
const OptionLabel = styled.h3`
    margin-left:-20px
`;

const level = Constant.getSeatLevel(); // 좌석등급
const airport = AirPort.response.body.items.item; // 공항 목록

/** 에러메시지 (출발지-도착지, 날짜) */
const DEP_ERROR = 'depError';
const ARR_ERROR = 'arrError';
const LOCATION_ERROR = 'locationError';
const LEVEL_ERROR = 'levelError';
const DATE_ERROR = 'dateError';
const SEARCH_ERROR='searchError';
const LOGIN_ERROR='loginError';
const SEAT_ERROR='seatError';

const ERROR_STATE = {
    [DEP_ERROR]: false,
    [ARR_ERROR]: false,
    [LOCATION_ERROR]: false,
    [LEVEL_ERROR]: false,
    [DATE_ERROR]: false,
    [SEARCH_ERROR]:false,
    [LOGIN_ERROR]:false,
    [SEAT_ERROR]:false,
};

const errorMapping = {
    [DEP_ERROR]: '출발지를 입력해주세요',
    [ARR_ERROR]: '도착지를 입력해주세요',
    [LOCATION_ERROR]: '좌석을 선택해주세요',
    [LEVEL_ERROR]: '출발지와 도착지가 같습니다',
    [DATE_ERROR]: '날짜를 선택해주세요',
    [SEARCH_ERROR]:'조회 실패하였습니다',
    [LOGIN_ERROR]:'로그인이 필요한 서비스입니다',
    [SEAT_ERROR]:'해당 항공편이 존재하지 않습니다',
};

/** top component */
export default function TopComponent({ airports, setAirPorts }) {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(store.getState().userId);
    const [depTime, setDepTime] = useState(new Date()); // 출발날짜는 항상 오늘날짜의 다음날부터
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
    const errorElements = useMemo(() => {
        return Object.keys(errorMapping).map((key) => {
            if (errorMessage[key]) {
                return (
                    <h3 className="modal white-wrap message" key={key}>
                        <BsExclamationCircle className="exclamation-mark" /> {errorMapping[key]}
                    </h3>
                );
            }
            return null;
        });
    }, [errorMessage, errorMapping]);
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
            dateError: depTime < Date().now //선택한날짜가 지금시간대보다 이전일 때
        };
        if (!errors.locationError && !errors.dateError && !errors.depError && !errors.arrError) { //둘다 에러 아닐시
            dispatch({ type: 'error' }); //에러 모두 false로 바꿈
            callPostAirInfoAPI().then((response) => {
                if (response.data.length > 0) {
                    navigate(`/Book`, {
                        state: {
                            dep: airports.dep,
                            arr: airports.arr,
                            depTime: handleDateFormatChange(depTime),
                            contents: response.data,
                            seatLevel: airports.level
                        }
                    });

                } else {
                    dispatch({ type: 'seatError', seatError: true });
                    setTimeout(() => {
                        dispatch({ type: 'error' }); //에러 모두 false로 바꿈
                    }, 1000);
                }


            }).catch((error) => {
                if (error.response.status === 401) {
                    dispatch({ type: 'loginError', loginError: true });
                    setTimeout(() => {
                        dispatch({ type: 'error' }); //에러 모두 false로 바꿈
                    }, 1000);
                } else {
                    dispatch({ type: 'searchError', searchError: true });
                    setTimeout(() => {
                        dispatch({ type: 'error' }); //에러 모두 false로 바꿈
                    }, 1000);
                }

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

            console.log(response);
            return response;

        }
        catch (error) {
            console.error(error);
        }
    }
    return (
        <>
            <div>
                {errorElements}
            </div>
            <div className="container container-top" >
                <div className="panel panel-top background-color-white">
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
                                        <button className="btn btn-style-none" onClick={handleAirPortReverse}><img src={reverse} /></button>
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

                                    <td>
                                        <Datepicker handleDateChange={handleDateChange} depTime={depTime} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="second-container" style={{ clear: 'both' }}>
                            <button className="btn btn-style-border" onClick={handleSearch} >검색하기</button>
                        </div>
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
                <Label style={{ color: airportsName === '좌석을 선택해주세요' ? 'grey' : 'var(--black-color)' }}>{airportsName}</Label>
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
                <LocationLabel color={airportsName === '출발' || airportsName === '도착' ? 'var(--darkgrey-color)' : 'var(--black-color)'}>{airportsName}</LocationLabel>
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