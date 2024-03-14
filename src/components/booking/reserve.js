import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Constant from '../../util/constant_variables';
import styled from "styled-components";
import Pagination from '../../util/pagenation';
import Spinner from '../../styles/image/loading.gif';
import { IoCall } from "react-icons/io5";
import NoData from '../../styles/image/noData.png';
const Image = styled.img`
    width:100%;
    transition:all 0.5s;
    &:hover{
        transform : scale(1.1);
    }
`;
const Hr = styled.hr`
    clear:both;
    border:1px solid var(--grey-color);
`;

//페이지네이션 ** 상태를 바꾸지 않으면 아예 외부로 내보낸다. 
const itemCountPerPage = 8; //한페이지당 보여줄 아이템 갯수
const pageCountPerPage = 5; //보여줄 페이지 갯수
const areas = Constant.getRegionList();
/** 예약확인 목록 페이지 */
export default function ModalReserveCheck() {

    const [rooms, setRooms] = useState([]); //백엔드로부터 오는 데이터를 담을 변수
    const [roomContents, setRoomContents] = useState([]); //데이터필터링 해서 실제 사용할 데이터 변수
    const [loading, setLoading] = useState(false); //백엔드로 요청할 시에는 true로 변경하기
    const [areaCode, setAreaCode] = useState(areas[0].value); //기본 지역은 전체 검색

    //페이지네이션
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 (setCurrentPage()에서 변경됨)
    const [offset, setOffset] = useState(0); //현재페이지에서 시작할 item index

    /** 셀렉트 전용 */
    const [isShowOptions, setShowOptions] = useState(false);
    const selectBoxRef = useRef(null);
    useEffect(() => {
        setLoading(true);
        getRoomsListAPI().then((response) => {
            setRooms(response);
            setRoomContents(response);
            setLoading(false);
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

    /** 숙소 데이터 불러오는 함수 */
    async function getRoomsListAPI() {
        // 테스트 데이터, 백엔드에서 보내줄 데이터는 아래의 contentid, title, addr1, tel, firstimage로 현재는 이렇게 있습니다.
        const testRooms = [
            { contentid: 1, title: '시상이 떠오르는 방', addr1: '서울시 강남구', tel: '02-1234-5678', firstimage: NoData },
            { contentid: 2, title: '단풍과 차향이 어우러진 차실', addr1: '서울시 강북구', tel: '02-8765-4321', firstimage: NoData },
            { contentid: 3, title: '일상 순찰 속 즐거운 일들', addr1: '서울시 강북구', tel: '02-8765-4321', firstimage: NoData },
            { contentid: 4, title: '잠시 멀어진 소란과 고민', addr1: '서울시 강북구', tel: '02-8765-4321', firstimage: NoData },
            { contentid: 5, title: '방5', addr1: '서울시 강북구', tel: '02-8765-4321', firstimage: NoData },
            { contentid: 6, title: '방5', addr1: '인천시 강북구', tel: '02-8765-4321', firstimage: NoData },
            { contentid: 7, title: '방6', addr1: '인천시 강북구', tel: '02-8765-4321', firstimage: NoData },
            { contentid: 8, title: '방7', addr1: '울산시 강북구', tel: '02-8765-4321', firstimage: NoData },

            // 필요한 만큼 방 정보를 직접 추가하세요.
        ];
        try {
            //const result = await axios.get(Constant.serviceURL + `/rooms/search`);
            //return result.data;

            return testRooms;
        } catch (error) {
            console.error(error);
        }
    }
    if (loading) {
        return (
            <div className="loading">
                <img src={Spinner} alt="로딩" width="100px" />
            </div>
        );
    }
    return (
        <div className="container">

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
                    {roomContents.length > 0 ? (
                        roomContents.slice(offset, offset + itemCountPerPage).map((room, i) => (
                            <InfoComponent key={room.contentid} room={room} />
                        ))
                    ) : (
                        <div className="container-content">
                            <div className="container-column" style={{ height: '100%' }}>
                                <img src={NoData} />
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
            <div onClick={handleLocation}>
                <Image src={room.firstimage} alt={room.title} />
                <h3>{room.title.length > 12 ? room.title.substring(0, 12) + '...' : room.title}</h3>
                <div style={{ color: 'var(--darkgrey-color)' }}>
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