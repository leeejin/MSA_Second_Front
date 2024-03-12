import React, { useState, useEffect, useRef, useReducer } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Constant from '../../util/constant_variables';
import Pagination from '../../util/custom/pagenation';
import Spinner from '../../styles/image/loading.gif';
import { IoCall } from "react-icons/io5";
import NoImage from '../../styles/image/noImage.png';
import NoData from '../../styles/image/noData.png';
import axios from '../../axiosInstance';
import Area from '../../util/json/지역코드.json';
import { reducer, ERROR_STATE, Alert } from '../../util/custom/alert';
//페이지네이션 ** 상태를 바꾸지 않으면 아예 외부로 내보낸다. 
const itemCountPerPage = 6; //한페이지당 보여줄 아이템 갯수
const pageCountPerPage = 10; //보여줄 페이지 갯수
const areas = Area.response.body.items.item;
/** 예약확인 목록 페이지 */
const ModalReserveCheck = () => {
    const location = useLocation();
    const { code, sigunguCode, cities } = location.state ?? {};
    const [citiesMenu, setCitiesMenu] = useState(cities);
    const [rooms, setRooms] = useState([]); //백엔드로부터 오는 데이터를 담을 변수
    const [roomContents, setRoomContents] = useState([]); //데이터필터링 해서 실제 사용할 데이터 변수
    const [clicked, setClicked] = useState({
        areaCode: code,
        cityCode: sigunguCode
    });
    const [searchText, setSearchText] = useState(''); //검색어
    const [isLoading, setIsLoading] = useState(false);
    //페이지네이션
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 (setCurrentPage()에서 변경됨)
    const [offset, setOffset] = useState(0); //현재페이지에서 시작할 item index
    /** 셀렉트 전용 */
    const [isShowOptions, setShowOptions] = useState({ area: false, city: false });
    const selectBoxRef = useRef([null, null]);
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지
    useEffect(() => {
        const handleOutsideClick = (event) => {
            const isOutsideClick = selectBoxRef.current.every((ref) => {
                return !ref?.contains(event.target);
            });
            if (isOutsideClick) {
                setShowOptions({ area: false, city: false });
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);
    useEffect(() => {
        const fetchRoomsData = async () => {
            try {
                setIsLoading(true);
                await getRoomsListAPI();

            } catch (error) {
                console.error("데이터 불러오는 중 에러 발생:", error);
            }
        };

        fetchRoomsData();

    }, []);
    const handleError = (errorType, hasError) => {
        errorDispatch({ type: errorType, [errorType]: hasError });

        setTimeout(() => {
            errorDispatch({ type: 'error' });
        }, 2000);
    }
    const show = (type, value) => {
        setShowOptions(prev => ({
            ...prev,
            area: type === 'area' && !value,
            city: type === 'city' && !value,
        }));
    };
    const changeSearch = (e) => {
        setSearchText(e.target.value);
    }
    const handleSearch = () => {
        if (searchText === '') {
            handleError('searchTextError', true);
        } else {
            const value = Constant.getAccommodationValueByCode(areas, clicked.areaCode);
            setRoomContents(dataFiltering(searchText, value));
        }

    }
    const handleOnChangeSelectValue = (areaCode) => {
        setClicked((prev) => ({
            ...prev,
            areaCode: areaCode,
            cityCode: "선택",
        }))
        const city = Constant.getCityCode(areaCode);
        setCitiesMenu(city);
    };
    const handleOnChangeSelectValue2 = (cityCode) => {
        setClicked((prev) => ({
            ...prev,
            cityCode: cityCode
        }))

    };
    const handleSubmit = async () => {
        if (clicked.cityCode !== "선택") {
            setIsLoading(true);
            await getRoomsListAPI();
        } else {
            handleError('accommodationSigunguError', true);
        }

    }
    const dataFiltering = (text, areaCode) => {
        let filteredContents = [...rooms];
        // 가맹점명으로 검색
        filteredContents = filteredContents.filter((item) => {
            return item.title.toLowerCase().includes(text.toLowerCase()) && item.addr1.includes(areaCode);
        }).sort((a, b) => {
            // 검색어가 title의 시작 부분에 위치한 경우 우선적으로 보여줌
            return a.title.toLowerCase().startsWith(text.toLowerCase()) ? -1 : b.title.toLowerCase().startsWith(text.toLowerCase()) ? 1 : 0;
        });
        return filteredContents;
    }

    /** 페이지네이션 함수 */
    const setCurrentPageFunc = (page) => {
        let lastOffset = (page - 1) * itemCountPerPage;
        setCurrentPage(page);
        setOffset(lastOffset);
    };

    /** 숙소 데이터 불러오는 함수 */
    async function getRoomsListAPI() {
        const params = {
            areaCode: clicked.areaCode,
            //sigunguCode: clicked.cityCode
        }
        try {
            const response = await axios.get(Constant.serviceURL + `/lodgings/search`, { params: params });
            setRooms(response.data);
            setRoomContents(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    }

    if (!location.state) {
        return (<Navigate to={"*"} />)
    }
    return (
        <div className="container">
            <Alert errorMessage={errorMessage} />
            <div className="container-top" style={{ height: '200px', marginTop: '60px' }}>
                <div className="panel panel-top font-color-white" >
                    <div>
                        <h1 className="font-family-bold">숙소 검색</h1>
                    </div>
                </div>
            </div>
            <div className="container-content middlepanel">
                <div className="d-flex d-row" style={{ justifyContent: 'space-between' }}>
                    <div>
                        <input
                            placeholder='호텔명으로 검색해주세요'
                            onChange={(e) => changeSearch(e)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") { handleSearch() }
                            }} />
                        <button className="btn" onClick={handleSearch}>검색</button>
                    </div>
                    <div className="d-flex d-row">
                        <div
                            ref={(el) => selectBoxRef.current[1] = el}
                            className={`select select-email ${isShowOptions.area && 'active'}`}
                            style={{ width: '100px' }}
                            onClick={() => show('area', isShowOptions.area)}
                        >
                            <label>{Constant.getAccommodationValueByCode(areas, clicked.areaCode)}</label>
                            {(selectBoxRef.current[1] && isShowOptions.area) && (
                                <ul className="select-option select-option-email">
                                    {areas.map((area) => (
                                        <li
                                            className="option"
                                            key={area.code}
                                            value={area.code}
                                            onClick={() => handleOnChangeSelectValue(area.code)}>
                                            {area.name}
                                        </li>
                                    ))}
                                </ul>
                            )}

                        </div>
                        <div
                            ref={(el) => selectBoxRef.current[2] = el}
                            className={`select select-email ${isShowOptions.city && 'active'}`}
                            style={{ width: '100px' }}
                            onClick={() => show('city', isShowOptions.city)}
                        >
                            <label>{Constant.getCityValuebyCode(citiesMenu, clicked.cityCode)}</label>
                            {(selectBoxRef.current[2] && isShowOptions.city) && (
                                <ul className="select-option select-option-email">
                                    {citiesMenu.map((citiesMenu) => (
                                        <li
                                            className="option"
                                            key={citiesMenu.rnum}
                                            value={citiesMenu.code}
                                            onClick={() => handleOnChangeSelectValue2(citiesMenu.code)}>
                                            {citiesMenu.name}
                                        </li>
                                    ))}
                                </ul>
                            )}

                        </div>
                        <button className="btn" onClick={handleSubmit}>검색</button>
                    </div>
                </div>


                <hr className="hr" />
                {
                    isLoading ? <div className="fixed d-flex container-fixed">
                        <img src={Spinner} alt="로딩" width="100px" />
                    </div> : <>
                        <div style={{ height: '550px' }}>
                            {roomContents.length > 0 ? (
                                roomContents.slice(offset, offset + itemCountPerPage).map((room) => (
                                    <InfoComponent key={room.contentid} room={room} />
                                ))
                            ) : (
                                <div className="container-content">
                                    <div className="d-flex d-column" style={{ height: '100%' }}>
                                        <img src={NoData} alt="데이터 없음" />
                                        <h3>해당 내용이 존재하지 않습니다</h3>
                                    </div>
                                </div>)}
                        </div>
                        <div style={{ clear: 'both' }}>
                            {roomContents.length > itemCountPerPage && (
                                <Pagination
                                    itemCount={roomContents.length}
                                    pageCountPerPage={pageCountPerPage}
                                    itemCountPerPage={itemCountPerPage}
                                    currentPage={currentPage}
                                    clickListener={setCurrentPageFunc}
                                />
                            )}
                        </div>
                    </>
                }


            </div>

        </div>

    )

};

const InfoComponent = ({ room }) => {
    const navigate = useNavigate();

    const handleLocation = () => {
        navigate(`/Rooms/searchDetail/${room.roomCode}`, {
            state: {
                roomCode: room.roomCode,
            }
        });
    }
    return (
        <div className="list-room" >
            <div className="d-flex d-row" style={{ width: '90%', margin: 'auto', justifyContent: 'space-between' }}>
                <h3>{room.title.length > 12 ? room.title.substring(0, 12) + '...' : room.title}</h3>
                <button className="btn btn-style-reserve" onClick={handleLocation}>상세보기</button>
            </div>
            <div className="font-color-darkgrey" style={{ width: '90%', margin: 'auto' }}>
                <img src={room.firstimage ? room.firstimage : NoImage} alt={room.title} width={"100%"} />


                <p style={{ overflow: "hidden" }}>{room.addr1.length > 23 ? room.addr1.substring(0, 23) + '...' : room.addr1}</p>
                <p><IoCall /> {room.tel}</p>
            </div>
        </div>

    )

}

export default ModalReserveCheck;