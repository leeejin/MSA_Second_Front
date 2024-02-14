import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";
import axios from 'axios';
import { TbArmchair2 } from "react-icons/tb";
import Constant from '../../util/constant_variables';
import AirPort from '../../util/json/airport-list';
import AirLine from '../../util/json/airline-list';
import Datepicker from '../../util/datepicker';
const SelectBox = styled.div`
  position: relative;
  top:-8px;
  width: 200px;
  padding: 8px;
  align-self: center;
  border-bottom:2px solid var(--black-color);
  cursor: pointer;
  
 
`;
const IconWrapper = styled.div`
    display: inline-block;
`;
const Label = styled.label`
    padding-left:30px;
`;
const OptionLabel = styled.h3`
    margin-left:10px
`;
const SelectOptions = styled.ul`
  position: absolute;
  list-style: none;
  top: 25px;
  left: 0;
  width: 100%;
  overflow: hidden;
  padding:0px;
  max-height: ${(props) => (props.show ? "none" : "0")};
  border-radius: 20px;
  background-color: var(--white-color);
  color: var(--black-color);
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
  &:hover{
    cursor:auto;
}
`;
const Option = styled.li`
  padding:5px;
  margin:5px;
  width:100px;
  margin-left:auto;
  margin-right:auto;
  transition: background-color 0.2s ease-in;
  border:1px solid var(--grey-color);
  border-radius:20px;
  &:hover {
    cursor:pointer;
    border:1px solid var(--hovering-color);
    color:var(--hovering-color);
  }
`;
/** 메인페이지 - 여기서 예약조회 하기 위한 검색 */
export default function Main() {

    const navigate = useNavigate();

    const level = Constant.getSeatLevel(); // 좌석등급
    const airport = AirPort.response.body.items.item; // 공항 목록

    const [airports, setAirports] = useState({ //출발지, 도착지 상태 저장할 변수
        dep: { //출발
            id: AirPort.response.body.items.item[0].airportId,
            name: AirPort.response.body.items.item[0].airportNm
        },
        arr: { //도착
            id: AirPort.response.body.items.item[1].airportId,
            name: AirPort.response.body.items.item[1].airportNm
        }
    });
    const [seatLevel, setSeatLevel] = useState(level[0].value); //좌석등급
    const [depTime, setDepTime] = useState(null); // 출발날짜는 항상 오늘날짜의 다음날부터
    const [contents, setContents] = useState([]); //백에서 받은 출발지,도착지,출발날짜를 포함한 다른 데이터를 가진 객체 배열을 여기다가 저장
    const [errorMessage, setErrorMessage] = useState({ locationError: false, dateError: false }); //에러메시지 (출발지-도착지, 날짜)

    /** 셀렉트 전용 */
    const [isShowOptions, setShowOptions] = useState(false);
    const selectBoxRef = useRef(null);
    const handleOnChangeSelectValue = (e) => {
        setSeatLevel(e.target.getAttribute("value"));
    };
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (selectBoxRef.current && !selectBoxRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    /**공항 핸들러 함수 */
    const handleAirportChange = (type) => (e) => {
        const selectedAirportId = e.target.value;
        const selectedAirport = getSelectedAirport(selectedAirportId);
        setAirports(prev => ({
            ...prev,
            [type]: { id: selectedAirportId, name: selectedAirport.airportNm }
        }));
    };
    /**공항 선택 컴포넌트 */
    const AirportSelect = ({ value, onChange, airport }) => (
        <select value={value} onChange={onChange}>
            {
                airport.map((ap) => (
                    <option key={ap.airportId} value={ap.airportId}>
                        {ap.airportNm}
                    </option>
                ))
            }
        </select>
    );
    /** 해당 ID를 가진 공항 객체를 찾음 */
    const getSelectedAirport = (selectedAirportId) => {
        const selectedAirport = AirPort.response.body.items.item.find(
            (airport) => airport.airportId === selectedAirportId
        );
        return selectedAirport;
    }
    /**출발지와 도착지 리버스 핸들러 */
    const handleAirPortReverse = () => {
        setAirports(prev => ({
            dep: prev.arr,
            arr: prev.dep
        }));
    }
    /** 좌석 핸들러 함수 */
    const handleSeatChange = (e) => {
        setSeatLevel(e.target.value);
    }

    /** 출발 날짜 핸들러 */
    const handleDateChange = (date) => {
        setDepTime(date);
    }
    /** 검색 핸들러 */
    const handlePay = async () => {
        /** 에러모음 */
        let errors = {
            locationError: airports.dep.id === airports.arr.id, //출발지와 도착지가 똑같을 때
            dateError: depTime === null || depTime <= new Date() //날짜를 선택하지 않았거나 선택한 날짜가 오늘날짜보다 이전일때
        }
        if (!errors.locationError && !errors.dateError) { //둘다 에러 아닐시
            setErrorMessage({ locationError: false, dateError: false }); //에러 모두 false로 바꿈
            const response = await callPostAirInfoAPI();
            setContents(response);
            navigate(`/Reserve`, {
                state: {
                    contents: response, // 업데이트된 response를 직접 전달
                    seatLevel: seatLevel
                }
            });
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
            depAirport: airports.dep.id, //출발지
            arrAirport: airports.arr.id, //도착지
            depTime: depTime, //날짜
        };
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
        catch (error) {
            console.error(error);
        }
    }
    return (
        <div style={{ marginTop: '20%' }}>
            <div>
                {
                    errorMessage.locationError && <h3 className="white-wrap">출발지와 도착지가 같습니다</h3>
                }
                {
                    errorMessage.dateError && <h3 className="white-wrap">날짜를 선택해주세요</h3>
                }
                <div>
                    <div>
                        <p>출발지</p>
                        <AirportSelect
                            value={airports.dep.id}
                            onChange={handleAirportChange('dep')}
                            airport={airport}
                        />
                    </div>
                    <button className="doButton" onClick={handleAirPortReverse}>~</button>
                    <div>
                        <p>도착지</p>
                        <AirportSelect
                            value={airports.arr.id}
                            onChange={handleAirportChange('arr')}
                            airport={airport}
                        />
                    </div>
                    <div>
                        <p>좌석등급</p>
                        <SelectBox
                            ref={selectBoxRef}
                            className={`${isShowOptions ? 'active' : ''}`}
                            onClick={() => setShowOptions((prev) => !prev)}>
                            <IconWrapper>
                                <TbArmchair2 />
                                <Label>{seatLevel}</Label>
                            </IconWrapper>
                            <SelectOptions show={isShowOptions}>
                                <OptionLabel>좌석 등급 선택</OptionLabel>
                                {level.map((level) => (
                                    <Option
                                        onClick={(e) => handleOnChangeSelectValue(e)}
                                        key={level.key}
                                        value={level.value}>
                                        {level.name}
                                    </Option>
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

        </div>
    );
}