import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Constant from '../../util/constant_variables';
import Pagination from '../../util/pagenation';
import Spinner from '../../styles/image/loading.gif';
import { IoCall } from "react-icons/io5";
import NoImage from '../../styles/image/noImage.png';
import NoData from '../../styles/image/noData.png';
import axios from '../../axiosInstance';
import { useQuery } from 'react-query';

//페이지네이션 ** 상태를 바꾸지 않으면 아예 외부로 내보낸다. 
const itemCountPerPage = 6; //한페이지당 보여줄 아이템 갯수
const pageCountPerPage = 10; //보여줄 페이지 갯수
const areas = Constant.getRegionList();
/** 예약확인 목록 페이지 */
export default function ModalReserveCheck() {
    const location = useLocation();
    const { code } = location.state ?? {};
    const [rooms, setRooms] = useState([]); //백엔드로부터 오는 데이터를 담을 변수
    const [roomContents, setRoomContents] = useState([]); //데이터필터링 해서 실제 사용할 데이터 변수
    const [areaCode, setAreaCode] = useState(code); //기본 지역은 전체 검색

    //페이지네이션
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 (setCurrentPage()에서 변경됨)
    const [offset, setOffset] = useState(0); //현재페이지에서 시작할 item index

    /** 셀렉트 전용 */
    const [isShowOptions, setShowOptions] = useState(false);
    const selectBoxRef = useRef(null);

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
    const show = () => {
        setShowOptions((prev) => !prev);
    };

    const handleOnChangeSelectValue = (e) => {
        const value = Constant.getAccommodationCodeByValue(areas, e.target.value);
        setAreaCode(value);
        /** 데이터 필터링 */
        setRoomContents(dataFiltering(e.target.value));
    };

    const dataFiltering = (text) => {
        let filteredContents = [...rooms];
        //가맹점명으로 검색
        filteredContents = filteredContents.filter((item) => {
            if (item.addr1.includes(text))
                return true;
        });
        return filteredContents;
    }

    /** 페이지네이션 함수 */
    const setCurrentPageFunc = (page) => {
        let lastOffset = (page - 1) * itemCountPerPage;
        setCurrentPage(page);
        setOffset(lastOffset);
    };

    const { error, isLoading } = useQuery(['rooms', areaCode], getRoomsListAPI, {
        onSuccess: (data) => {
            setRooms(data);
            setRoomContents(data);
        },
        onError: (error) => {
            console.error("데이터 불러오는 중 에러 발생:", error);
        }
    });
    /** 숙소 데이터 불러오는 함수 */
    async function getRoomsListAPI() {
        const params = {
            areaCode: areaCode,
        }
        try {
            const response = await axios.get(Constant.serviceURL + `/lodgings/search`, { params: params, withCredentials: true });
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    if (!location.state) {
        return (<Navigate to={"*"} />)
    }
    if (isLoading) return (<div className="fixed d-flex container-fixed">
        <img src={Spinner} alt="로딩" width="100px" />
    </div>)
    if (error) return (<div className="fixed d-flex container-fixed">
        <h3>데이터 불러오는 도중 문제 발생 다시 시도해주세요</h3>
    </div>)
    return (
        <div className="container">

            <div className="container-top" style={{ height: '200px', marginTop: '60px' }}>
                <div className="panel panel-top font-color-white" >
                    <div>
                        <h1 className="font-family-bold">숙소 검색</h1>
                        <h3>{Constant.getAccommodationValueByCode(areas, areaCode)}</h3>
                    </div>
                </div>
            </div>
            <div className="container-content middlepanel">

                <SelectComponent
                    areaCode={areaCode}
                    selectBoxRef={selectBoxRef}
                    isShowOptions={isShowOptions}
                    show={show}
                    handleOnChangeSelectValue={handleOnChangeSelectValue} />

                <div>
                    {roomContents.length > 0 ? (
                        roomContents.slice(offset, offset + itemCountPerPage).map((room, i) => (
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
                    {roomContents.length > 0 && (
                        <Pagination
                            itemCount={roomContents.length}
                            pageCountPerPage={pageCountPerPage}
                            itemCountPerPage={itemCountPerPage}
                            currentPage={currentPage}
                            clickListener={setCurrentPageFunc}
                        />
                    )}
                </div>

            </div>

        </div>

    )

};

const InfoComponent = ({ room }) => {
    const navigate = useNavigate();

    const handleLocation = () => {
        navigate(`/Rooms/searchDetail/${room.contentid}`, {
            state: {
                contents: room,
            }
        });
    }
    return (
        <div className="list-room">
            <div className="d-flex d-row" style={{ justifyContent: 'space-between' }}>
                <h3>{room.title.length > 12 ? room.title.substring(0, 12) + '...' : room.title}</h3>
                <button className="btn btn-style-reserve" onClick={handleLocation}>상세보기</button>
            </div>

            <img src={room.firstimage ? room.firstimage : NoImage} alt={room.title} width={"100%"} />

            <div className="font-color-darkgrey">
                <p>{room.addr1}</p>
                <p><IoCall /> {room.tel}</p>
            </div>
        </div>

    )

}

/** 지역 선택 컴포넌트 */
const SelectComponent = ({ selectBoxRef, isShowOptions, show, handleOnChangeSelectValue, areaCode }) => {

    return (
        <>
            <div
                ref={selectBoxRef}
                className={`select select-email ${isShowOptions && 'active'}`}
                style={{ float: 'right', width: '100px' }}
                onClick={show}
            >
                <label>{Constant.getAccommodationValueByCode(areas, areaCode)}</label>
                {isShowOptions && (
                    <ul className="select-option select-option-email">
                        {areas.map(area => (
                            <option
                                className="option"
                                key={area.key}
                                value={area.value}
                                onClick={(e) => handleOnChangeSelectValue(e)}>
                                {area.value}
                            </option>
                        ))}
                    </ul>
                )}
            </div>


        </>


    )
}