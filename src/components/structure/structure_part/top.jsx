import React, { useState, useEffect, useRef, useReducer, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../axiosInstance';
import styled from "styled-components";
import { TbArmchair2 } from "react-icons/tb";
import Datepicker from '../../../util/datepicker';
import reverse from '../../../styles/image/revert.png';
import Constant from '../../../util/constant_variables';
import Spinner from '../../../styles/image/loading.gif';
import { reducer, ERROR_STATE, Alert } from '../../../util/alert';
import AirPort from '../../../util/json/airport-list';
import { useSelector } from 'react-redux';

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

/** top component */
const TopComponent=({ airports, handleChange, handleAirPortReverse, handleDateChange })=> {
    const navigate = useNavigate();
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지
    const [isLoading, setIsLoading] = useState(false);
    const userId = useSelector((state) => state.userId);
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
        }, 2000);
    }
    /** 검색 핸들러 */
    const handleSearch = () => {
        setIsLoading(prev => !prev);
        if (userId <= 0) { //먼저 로그인 했는지 안했는지 검사
            handleError('loginError', true);
        } else {
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
        setIsLoading(prev => !prev);
    }

    const show = (type, value) => {
        setShowOptions(prev => ({
            ...prev,
            dep: type === 'dep' && !value,
            arr: type === 'arr' && !value,
            level: type === 'level' && !value
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
            //const response = axios.post(Constant.serviceURL + `/flights/search`, formData, { withCredentials: true })
            const response = axios.get(Constant.serviceURL + `/flightInfos/${userId}`, { params: formData });
            return response;
        }
        catch (error) {
            handleError('searchError', true);
        }
    }
    return (
        <>
            <Alert errorMessage={errorMessage} />
            <div className="container container-top" >
                <div className="panel panel-top background-color-white">
                    <div className='parent-container'>
                        {
                            isLoading ? <div className="fixed d-flex container-fixed">
                                <img src={Spinner} alt="로딩" width="100px" />
                            </div> : <>
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
                                                <div
                                                    ref={(el) => selectBoxRef.current[1] = el}
                                                    className={`select select-location ${isShowOptions && 'active'}`}
                                                    onClick={() => show('dep', isShowOptions.dep)} // show 함수를 호출할 때 'dep'을 전달합니다.
                                                >
                                                    <LocationLabel color={airports.dep === '출발' ? 'var(--darkgrey-color)' : 'var(--black-color)'}>{airports.dep}</LocationLabel>
                                                    <SelectLocationComponent
                                                        isShowOptions={selectBoxRef.current[1] && isShowOptions.dep}
                                                        onClick={(e) => handleChange("dep", e)}
                                                    />
                                                </div>
                                            </td>
                                            <td>
                                                <button className="btn" ><img src={reverse} alt="뒤바꾸기" onClick={handleAirPortReverse} /></button>
                                            </td>
                                            <td>
                                                <div
                                                    ref={(el) => selectBoxRef.current[2] = el}
                                                    className={`select select-location ${isShowOptions && 'active'}`}
                                                    onClick={() => show('arr', isShowOptions.arr)} // show 함수를 호출할 때 'arr'을 전달합니다.
                                                >
                                                    <LocationLabel color={airports.arr === '도착' ? 'var(--darkgrey-color)' : 'var(--black-color)'}>{airports.arr}</LocationLabel>
                                                    <SelectLocationComponent
                                                        isShowOptions={selectBoxRef.current[2] && isShowOptions.arr}
                                                        onClick={(e) => handleChange("arr", e)}
                                                    />
                                                </div>
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
                                                <div
                                                    ref={(el) => selectBoxRef.current[3] = el}
                                                    className={`select select-level ${isShowOptions && 'active'}`}
                                                    onClick={() => show('level', isShowOptions.level)} >
                                                    <TbArmchair2 style={{ fontSize: "1.6rem", margin: -5 }} />
                                                    <Label style={{ color: airports.level === '좌석을 선택해주세요' ? 'var(--darkgrey-color)' : 'var(--black-color)' }}>{airports.level}</Label>
                                                    <SelectLevelComponent
                                                        isShowOptions={selectBoxRef.current[3] && isShowOptions.level}
                                                        onClick={(e) => handleChange("level", e)}
                                                    />
                                                </div>
                                            </td>

                                            <td>
                                                <Datepicker handleDateChange={handleDateChange} depTime={airports.depTime} />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </>
                        }
                        <div className="second-container" style={{ clear: 'both' }}>
                            <button className="btn btn-style-border" onClick={handleSearch} >검색하기</button>
                        </div>
                    </div>


                </div>
            </div>
        </>

    );
}
/** 출발지,도착지 컴포넌트 */
const SelectLocationComponent = (({ isShowOptions, onClick }) => {
    return (
        <>
            {
                isShowOptions && (
                    <ul
                        className="select-option select-option-location"
                    >
                        {
                            airport.map((ap) => (
                                <li
                                    className="option"
                                    onClick={onClick}
                                    key={ap.airportId}
                                    value={ap.airportNm}>
                                    {ap.airportNm}
                                </li>
                            ))
                        }
                    </ul>
                )
            }
        </>
    )

});

/** 좌석 컴포넌트 */
const SelectLevelComponent = ({ isShowOptions, onClick }) => {
    return (
        <>
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
                                    onClick={onClick}
                                    key={level.key}
                                    value={level.value}>
                                    {level.name}
                                </li>
                            ))
                        }
                    </ul>
                )
            }
        </>
    )
};

export default TopComponent;