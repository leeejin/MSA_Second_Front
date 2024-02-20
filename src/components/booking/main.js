import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";
import axios from '../../axiosInstance';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { TbArmchair2 } from "react-icons/tb";
import Constant from '../../util/constant_variables';
import AirPort from '../../util/json/airport-list';
import Datepicker from '../../util/datepicker';
import reverse from '../../styles/image/revert.png';

const Tr = styled.tr`
    text-align:center;

    td:nth-child(3){
        border-right:1px solid var(--grey-color);
    }
    td:nth-child(4),td:nth-child(5){
      width:25%;
    }
   
`;

const MarkTd = styled.span`
    border:1px solid var(--grey-color);
    border-radius:15px;
    padding:0px 10px 0px 10px;
    font-size:1.0rem;
`;
const ReverseIcon = styled.img`
    width:30px;
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
const SelectOptions = styled.ul`
  max-height: ${(props) => (props.show ? "none" : "0")};
`;
const level = Constant.getSeatLevel(); // 좌석등급
const airport = AirPort.response.body.items.item; // 공항 목록
const footer = Constant.getSliderMenus(); //푸터 이미지 내용
/** 메인페이지 - 여기서 예약조회 하기 위한 검색 */
export default function Main() {
    const navigate = useNavigate();

    const [airports, setAirPorts] = useState({
        dep: '출발',
        arr: '도착',
        level: '좌석을 선택하세요'
    })

    const [depTime, setDepTime] = useState(null); // 출발날짜는 항상 오늘날짜의 다음날부터
    const [errorMessage, setErrorMessage] = useState({ depError: false, arrError: false, locationError: false, dateError: false }); //에러메시지 (출발지-도착지, 날짜)
    const [serverErrorMessage, setServerErrorMessage] = useState({ searchError: false })
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
    /** 선택한거 나와있는 지역으로 바꾸기 */
    const handleReserve = (value) => {
        setAirPorts(prev => ({
            ...prev,
            arr: value
        }));
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };
    /** 검색 핸들러 */
    const handleSearch = async () => {
        /** 에러모음 */
        let errors = {
            depError: airports.dep === '출발',
            arrError: airports.arr === '도착',
            levelError: airports.level === '좌석을 선택하세요',
            locationError: airports.dep === airports.arr, //출발지와 도착지가 똑같을 때
            dateError: depTime === null || depTime <= new Date() //날짜를 선택하지 않았거나 선택한 날짜가 오늘날짜보다 이전일때
        };
        if (!errors.locationError && !errors.dateError && !errors.depError && !errors.arrError) { //둘다 에러 아닐시
            setErrorMessage({ locationError: false, dateError: false }); //에러 모두 false로 바꿈
            callPostAirInfoAPI().then((response) => {
                navigate(`/Reserve`, {
                    state: {
                        contents: response.data,
                        seatLevel: airport.level
                    }
                });

            }).catch((error) => {
                setServerErrorMessage({ searchError: true });
                setTimeout(() => {
                    setServerErrorMessage({ searchError: false }); //에러 모두 false로 바꿈
                }, 1000);
            })


        } else {
            if (errors.depError) {
                setErrorMessage({ depError: errors.depError });
            } else if (errors.arrError) {
                setErrorMessage({ arrError: errors.arrError });
            } else if (errors.levelError) {
                setErrorMessage({ levelError: errors.levelError });
            } else if (errors.dateError) {
                setErrorMessage({ dateError: errors.dateError });
            } else if (errors.locationError) {
                setErrorMessage({ locationError: errors.locationError });
            }
            setTimeout(() => {
                setErrorMessage({ locationError: false, dateError: false, levelError: false, depError: false, arrError: false }); //에러 모두 false로 바꿈
            }, 1000);
        }
    }
    /** main.js 조회 데이터 API요청 */
    async function callPostAirInfoAPI() {
        const year = depTime.getFullYear();
        const month = String(depTime.getMonth() + 1).padStart(2, "0");
        const day = String(depTime.getDate()).padStart(2, "0");

        const formattedDate = year + month + day;

        /** 백엔드로 보낼 데이터 : 출발지, 도착지, 날짜 */
        const formData = {
            depAirport: getSelectedAirport(airports.dep), //출발지
            arrAirport: getSelectedAirport(airports.arr), //도착지
            seatLevel: airports.level, //좌석등급
            depTime: formattedDate, //날짜
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
        <div>
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
                serverErrorMessage.searchError && <h3 className="white-wrap message">먼 이유로 검색이 불가능합니다</h3>
            }
            <div className="mainbackground" >
                <div className="mainpanel">

                    <table className='parent-container'>
                        <thead>
                            <Tr>
                                <td><MarkTd>출발지</MarkTd></td>
                                <td />
                                <td><MarkTd>도착지</MarkTd></td>
                                <td><MarkTd>가는날</MarkTd></td>
                                <td><MarkTd>좌석등급</MarkTd></td>
                            </Tr>
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
                                <td style={{ textAlign: 'center' }}>
                                    <button className="doButton" onClick={handleAirPortReverse}><ReverseIcon src={reverse} /></button>
                                </td>
                                <td style={{ borderRight: '1px solid var(--grey-color)' }}>
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
                                    <SelectComponent
                                        selectBoxRef={selectBoxRef}
                                        number={3}
                                        isShowOptions={isShowOptions.level}
                                        setShowOptions={() => setShowOptions((prev) => ({ ...prev, level: !prev.level }))}
                                        airportsName={airports.level}
                                        level={level}
                                        handleLocationChange={(e) => handleLocationChange("level", e)}
                                    />
                                </td>
                                <td>
                                    <Datepicker handleDateChange={handleDateChange} depTime={depTime} />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div>
                        <button className="button-search" onClick={handleSearch} >검색하기</button>
                    </div>
                </div>
            </div>
            <div className="middlebackground">
                <h1>여기엔 뭘 넣지 ???</h1>
            </div>


            <FooterSlider footerData={footer} handleReserve={handleReserve} />

        </div>

    );
}

/** 출발지,도착지 컴포넌트 */
const SelectComponent = ({ selectBoxRef, number, isShowOptions, setShowOptions, airportsName, airport, level, handleLocationChange }) => {
    return (
        <div
            ref={el => selectBoxRef.current[number] = el}
            className={`${isShowOptions ? 'select select-location active' : 'select select-location'} ${number === 3 && 'select select-level'}`}
            onClick={setShowOptions}>
            {
                number === 3 ? <>
                    <TbArmchair2 />
                    <Label>{airportsName}</Label>
                </> : <LocationLabel>{airportsName}</LocationLabel>
            }
            <SelectOptions
                className={`${number === 3 ? "select-option select-option-level" : "select-option select-option-location"}`}
                show={isShowOptions}>
                {
                    number === 3 ? <>
                        <OptionLabel>좌석 등급 선택</OptionLabel>
                        {
                            level.map((level) => (
                                <li
                                    className="option level-style"
                                    onClick={handleLocationChange}
                                    key={level.key}
                                    value={level.value}>
                                    {level.name}
                                </li>
                            ))
                        }
                    </> : <>
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
                        }</>
                }

            </SelectOptions>
        </div>
    )
}
/** footer 슬라이더 */
function FooterSlider({ footerData, handleReserve }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    function handleChange(index) {
        setCurrentIndex(index);
    }
    const renderSlides = footerData.map((footer) => (
        <div className="footerbackground"  style={{ backgroundImage: `url(${footer.imageUrl})` }} key={footer.key}>
            <div className="footerpanel">
                <div>
                    <h1>{footer.title}</h1>
                    <h1>{footer.subTitle}</h1>
                    <h3>{footer.content}</h3>
                    <button className="button-reserve" onClick={() => handleReserve(footer.value)}>
                        예약하기
                    </button>
                </div>
            </div>
        </div>
    ))
    return (
        <Carousel
            showStatus={false}
            showArrows={false}
            autoPlay={true}
            infiniteLoop={true}
            showThumbs={false}
            onChange={handleChange}
            className="w-[400px] lg:hidden">
            {renderSlides}
        </Carousel>
    );
}