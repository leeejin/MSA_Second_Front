import React, { useState, useEffect, useCallback, useReducer, useMemo, useRef } from 'react';
import axios from '../../axiosInstance';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import Constant from '../../util/constant_variables';
import styled from "styled-components";
import store from '../../util/redux_storage';
import Pagination from '../../util/pagenation';
import { BsExclamationCircle } from "react-icons/bs";
import { IoCall } from "react-icons/io5";
import Image from '../../styles/image/jeju.jpg';
const Hr = styled.hr`
    clear:both;
    border:1px solid var(--grey-color);
`;
/** 에러메시지 (출발지-도착지, 날짜) */
const ERROR_STATE = {
    paySuccess: false, //결제 성공
    payError: false, //결제 에러
    cancelSuccess: false, //취소 성공
    cancelErorr: false, //취소 에러
    reserveError: false, // 예약 에러
}
const reducer = (state, action) => {
    switch (action.type) {
        case 'paySuccess':
            return { ...state, payError: true }
        case 'payError':
            return { ...state, payError: true }
        case 'cancelError':
            return { ...state, cancelError: true }
        case 'cancelSuccess':
            return { ...state, cancelSuccess: true }
        case 'reserveError':
            return { ...state, reserveError: true }
        default:
            return ERROR_STATE

    }
}

// 테스트 데이터, 백엔드에서 보내줄 데이터는 아래의 contentid, title, addr1, tel, firstimage로 현재는 이렇게 있습니다.
const testRooms = [
    { contentid: 1, title: '시상이 떠오르는 방', addr1: '서울시 강남구', tel: '02-1234-5678', firstimage: Image },
    { contentid: 2, title: '단풍과 차향이 어우러진 차실', addr1: '서울시 강북구', tel: '02-8765-4321', firstimage: Image },
    { contentid: 3, title: '일상 순찰 속 즐거운 일들', addr1: '서울시 강북구', tel: '02-8765-4321', firstimage: Image },
    { contentid: 4, title: '잠시 멀어진 소란과 고민', addr1: '서울시 강북구', tel: '02-8765-4321', firstimage: Image },
    { contentid: 5, title: '방5', addr1: '서울시 강북구', tel: '02-8765-4321', firstimage: Image },
    { contentid: 6, title: '방5', addr1: '인천시 강북구', tel: '02-8765-4321', firstimage: Image },
    { contentid: 7, title: '방6', addr1: '인천시 강북구', tel: '02-8765-4321', firstimage: Image },
    { contentid: 8, title: '방7', addr1: '울산시 강북구', tel: '02-8765-4321', firstimage: Image },

    // 필요한 만큼 방 정보를 직접 추가하세요.
];
//페이지네이션 ** 상태를 바꾸지 않으면 아예 외부로 내보낸다. 
const itemCountPerPage = 8; //한페이지당 보여줄 아이템 갯수
const pageCountPerPage = 5; //보여줄 페이지 갯수
const numOfRows = 5;
const areas = Constant.getRegionList();
/** 예약확인 목록 페이지 */
export default function ModalReserveCheck() {

    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지
    const errorMapping = {
        reserveError: '이미 예약하였습니다',
        paySuccess: '결제가 완료되었습니다! 결제목록 카테고리로 가면 확인할 수 있습니다',
        payError: '결제실패하였습니다',
        cancelError: '예약취소 실패하였습니다',
        cancelSuccess: '예약취소 성공하였습니다',
    };

    const [rooms, setRooms] = useState(testRooms); //백엔드로부터 오는 데이터를 담을 변수
    const [roomContents, setRoomContents] = useState(testRooms); //데이터필터링 해서 실제 사용할 데이터 변수
    const [loading, setLoading] = useState(false); //백엔드로 요청할 시에는 true로 변경하기
    const [areaCode, setAreaCode] = useState(areas[0].value); //기본 지역은 전체 검색

    const [selectedData, setSelectedData] = useState([]) //선택한 컴포넌트 객체
    const [serverData, setServerData] = useState([]); //서버에서 받은 데이터
    //페이지네이션
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 (setCurrentPage()에서 변경됨)
    const [offset, setOffset] = useState(0); //현재페이지에서 시작할 item index

    /** 셀렉트 전용 */
    const [isShowOptions, setShowOptions] = useState(false);
    const selectBoxRef = useRef(null);
    /**포트원 카카오페이를 api를 이용하기 위한 전역 변수를 초기화하는 과정 이게 렌더링 될때 초기화 (requestPay가 실행되기전에 이게 초기화되어야함) */
    useEffect(() => {
        const { IMP } = window;
        IMP.init('imp01307537');
    }, []);
    useEffect(() => {
        getRoomsListAPI().then(() => {
            setRoomContents(rooms);
        })
    }, []);
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
        setAreaCode(e.target.value);
        /** 데이터 필터링 */
        setRoomContents(dataFiltering(e.target.value));
    };
    const dataFiltering = (text) => {
        let filteredContents = [...rooms];
        //가맹점명으로 검색
        filteredContents = filteredContents.filter((item) => {
            if (item.addr1.includes(text))
                return true;
            else if (text === "전체")
                return rooms;
        });
        return filteredContents;
    }

    /** 페이지네이션 함수 */
    const setCurrentPageFunc = (page) => {
        let lastOffset = (page - 1) * itemCountPerPage;
        setCurrentPage(page);
        setOffset(lastOffset);
    };

    const errorElements = useMemo(() => {
        return Object.keys(errorMapping).map((key) => {
            if (errorMessage[key]) {
                return (
                    <h3 className="white-wrap message" key={key}>
                        <BsExclamationCircle className="exclamation-mark" /> {errorMapping[key]}
                    </h3>
                );
            }
            return null;
        });
    }, [errorMessage, errorMapping]);

    async function getRoomsListAPI() {
        try {
            // const fetchData = async () => {
            //   setLoading(true);
            //   try {
            //     const result = await axios.get(
            //       `http://localhost:8088/rooms/search`
            //     );
            //     setRooms(result.data);
            //     setError(null);
            //   } catch (error) {
            //     setError(error);
            //   }
            //   setLoading(false);
            // };

            // fetchData();
        } catch (error) {
            console.error(error);
        }

    }
    if (loading) {
        return <div>숙소 정보를 불러오는 중 입니다. 잠시만 기다려주세요...</div>;
    }
    return (
        <div className="container">
            <div>
                {errorElements}
            </div>

            <div className="container-top" style={{ height: '200px', marginTop: '60px' }}>
                <div className="panel panel-top font-color-white" >
                    <div className="container-flex">
                        <h1 className="font-family-bold">숙소 검색</h1>
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

                    {roomContents.slice(offset, offset + itemCountPerPage).map(room => (//testRooms는 테스터용
                        <InfoComponent key={room.contentid} room={room} />
                    ))}
                </div>
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

    )

};

const InfoComponent = ({ room }) => {
    const navigate = useNavigate();
    const roomDetailURL = `/rooms/searchDetail/${room.contentid}`;

    return (
        <div className="list-room">
            <div onClick={() => { navigate(roomDetailURL) }}>
                <img src={room.firstimage} alt={room.title} width={"100%"} />
                <h3>{room.title.length > 12 ? room.title.substring(0, 12) + '...' : room.title}</h3>
                <div style={{color:'var(--darkgrey-color)'}}>
                <p>{room.addr1}</p>
                <p><IoCall /> {room.tel}</p>
                </div>
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
                style={{ float: 'left', width: '100px' }}
                onClick={show}
            >
                <label>{areaCode}</label>
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

            <Hr />
        </>


    )
}