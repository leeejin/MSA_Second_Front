import React, { useState, useEffect, useRef, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axiosInstance';
import styled from "styled-components";
import { TbArmchair2 } from "react-icons/tb";
import Datepicker from '../../util/datepicker';
import reverse from '../../styles/image/revert.png';
import Constant from '../../util/constant_variables';
import AirPort from '../../util/json/airport-list';
import store from '../../util/redux_storage';
import { reducer, ERROR_STATE, Alert } from '../../util/alert';

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
const loginInfo = {
    userId: store.getState().userId,
    name: store.getState().name,
    email: store.getState().username,
};
/** top component */
export default function TopComponent({ airports, handleChange, handleAirPortReverse,handleDateChange }) {
    const navigate = useNavigate();
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지

    /** 셀렉트 전용 */
    const [isShowOptions, setShowOptions] = useState({ dep: false, arr: false, level: false });
    const selectBoxRef = useRef([null, null, null]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            const isOutsideClick = selectBoxRef.current.every((ref) => {
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

   
    /** 경고 메시지 */
    const handleError = (errorType, hasError) => {
        errorDispatch({ type: errorType, [errorType]: hasError });

        setTimeout(() => {
            errorDispatch({ type: 'error' });
        }, 1000);
    }
    /** 검색 핸들러 */
    const handleSearch = async () => {
        /** 에러모음 */
        let errors = {
            depError: airports.dep === '출발',
            arrError: airports.arr === '도착',
            levelError: airports.level === '좌석을 선택해주세요',
            locationError: airports.dep === airports.arr, //출발지와 도착지가 똑같을 때
            dateError: airports.depTime <= new Date() //선택한날짜가 지금시간대보다 이전일 때
        };
        if (!errors.locationError && !errors.dateError && !errors.depError && !errors.arrError) { //둘다 에러 아닐시
            callPostAirInfoAPI().then((response) => {
                if (response.data.length > 0) {
                    navigate(`/Book`, {
                        state: {
                            dep: airports.dep,
                            arr: airports.arr,
                            depTime: Constant.handleDateFormatISOChange(airports.depTime),
                            contents: response.data,
                            seatLevel: airports.level
                        }
                    });

                } else {
                    handleError('seatError', true);
                }
            });
        } else {
            if (errors.depError) {
                handleError('depError', errors.depError);
            } else if (errors.arrError) {
                handleError('arrError', errors.arrError);
            } else if (errors.locationError) {
                handleError('locationError', errors.locationError);
            } else if (errors.levelError) {
                handleError('levelError', errors.levelError);
            } else if (errors.dateError) {
                handleError('dateError', errors.dateError);
            }
        }
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
            depAirport: Constant.getSelectedAirport(airports.dep), //출발지
            arrAirport: Constant.getSelectedAirport(airports.arr), //도착지
            seatLevel: airports.level, //좌석등급
            depTime: Constant.handleDateFormatISOChange(airports.depTime), //날짜
        };
        try {
            const response = axios.get(Constant.serviceURL + `/flightInfos/${loginInfo.userId}`, { params: formData })
            return response;
        }
        catch (error) {
            if (error.response.status === 401) {
                handleError('loginError', true);
            } else {
                handleError('searchError', true);
            }
        }
    }
    return (
        <>
            <Alert errorMessage={errorMessage} />
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
                                            handleChange={(e) => handleChange("dep", e)}
                                        />
                                    </td>
                                    <td>
                                        <button className="btn btn-style-none" onClick={handleAirPortReverse}><img src={reverse} alt="뒤바꾸기" /></button>
                                    </td>
                                    <td>
                                        <SelectComponent
                                            selectBoxRef={selectBoxRef}
                                            number={2}
                                            isShowOptions={selectBoxRef.current[2] && isShowOptions.arr}
                                            show={() => show('arr', isShowOptions.arr)} // show 함수를 호출할 때 'dep'을 전달합니다.
                                            airportsName={airports.arr}
                                            handleChange={(e) => handleChange("arr", e)}
                                        />
                                    </td>

                                </tr>
                            </tbody>
                        </table>
                        <table>
                            <thead>
                                <tr>
                                    <td><MarkTd>좌석등급</MarkTd></td>
                                    <td><MarkTd>가는날</MarkTd></td>
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
                                            handleChange={(e) => handleChange("level", e)}
                                        />
                                    </td>

                                    <td>
                                        <Datepicker handleDateChange={handleDateChange} depTime={airports.depTime} />
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
const SelectComponent = ({ selectBoxRef, number, isShowOptions, show, airportsName, handleChange }) => {
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