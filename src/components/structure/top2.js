import React, { useState, useEffect, useRef, useReducer, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axiosInstance';
import styled from "styled-components";
import Constant from '../../util/constant_variables';
const Table = styled.table`
    height:100%;
    tr{
        td:nth-child(1){
            width:40%;
            border-right: 1px solid var(--grey-color);
        }
    }
`;
const Button = styled.button`
    &:hover{
        color:var(--hovering-color);
    }
`;


const areas = Constant.getRegionList();
/** top2 component */
export default function Top2Component() {
    const navigate = useNavigate();
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
    const handleSearch = useCallback(() => {
        setLoading(true);
        getRoomsListAPI().then((response) => {
            setRooms(response);
            setRoomContents(response);
            setLoading(false);
            console.log("데이터불러오기 완료");
            navigate(`/Reserve`, {
                state: {
                    code: areaCode
                }
            });
        })

    }, [areaCode]);
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
    const show = () => {
        setShowOptions((prev) => !prev);
    };
    /** 지역코드 찾기 */
    const getAccommodation = (value) => {
        const matchingareas = areas.find(areas => areas.value === value);
        return matchingareas ? matchingareas.code : "";
    };
    /** 숙소 데이터 불러오는 함수 */
    async function getRoomsListAPI() {
        const params = {
            areaCode: getAccommodation(areaCode),
        }
        try {
            const response = await axios.get(Constant.serviceURL + `/lodgings/search`, { params: params, withCredentials: true });
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <>
            <div className="container container-top" >
                <div className="panel panel-top background-color-white">
                  
                        <Table>
                            <tbody>
                            <tr>
                                <td>
                                    <h3>어디로 여행하시겠어요 ? </h3>
                                    <h2>{areaCode}</h2>
                                </td>
                                <td>
                                    <SelectComponent
                                        areaCode={areaCode}
                                        selectBoxRef={selectBoxRef}
                                        isShowOptions={isShowOptions}
                                        show={show}
                                        handleOnChangeSelectValue={handleOnChangeSelectValue} />
                                </td>
                            </tr>
                            </tbody>
                        </Table>
                   
                    <div className="second-container" style={{ clear: 'both' }}>
                        <button className="btn btn-style-border" onClick={handleSearch} >검색하기</button>
                    </div>



                </div>
            </div>
        </>

    );
}
/** 지역 선택 컴포넌트 */
const SelectComponent = ({ isShowOptions, show, handleOnChangeSelectValue, areaCode }) => {

    return (
        <>
            {areas.map(area => (
                <Button
                    className="btn "
                    key={area.key}
                    value={area.value}
                    onClick={(e) => handleOnChangeSelectValue(e)}>
                    {area.value}
                </Button>
            ))}
        </>


    )
}