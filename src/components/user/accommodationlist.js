import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import store from '../../util/redux_storage';
import Constant from '../../util/constant_variables';
import ModalComponent from '../../util/modal';
import Plane from '../../styles/image/plane.png'
import styled from 'styled-components';
import Pagination from '../../util/pagenation';
import Spinner from '../../styles/image/loading.gif';

/** 티켓테이블 디자인 */
const TicketTable = styled.table`
    border-radius: 15px;
    padding: 5px;
    margin-bottom: 5px;
    background-color:var(--white-color);
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
    td{
        padding:5px;
    }
    tr:nth-child(1) td:nth-child(2) {
        border-left: 1px solid var(--grey-color);
    }
    
    tr:nth-child(1) {
        border-bottom: 1px solid var(--grey-color);
    }
`; 

 //페이지네이션 ** 상태를 바꾸지 않으면 아예 외부로 내보낸다. 
const itemCountPerPage = 2;//한페이지당 보여줄 아이템 갯수
const pageCountPerPage = 5;//보여줄 페이지 갯수

/** 결제한 목록을 보여주는 함수 */
export default function ReservedList() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴
    const [nickname, setNickname] = useState(store.getState().nickname); //리덕스에 있는 nickname를 가져옴
    const [open, setOpen] = useState({ pay: false, cancel: false }); // 취소모달창
    const [contents, setContents] = useState([]); //백엔드로부터 받은 예약목록 리스트를 여기다가 저장
    const [selectedData, setSelectedData] = useState([]) //선택한 컴포넌트 객체
    const [success, setSuccess] = useState({ pay: false, cancel: false }); // 예약,결제 성공 메시지
   //페이지네이션
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 (setCurrentPage()에서 변경됨)
    const [offset, setOffset] = useState(0); //현재페이지에서 시작할 item index
   

    useEffect(() => {
        callGetReservedListAPI().then((response) => {
            setContents(response);
        }).catch((error) => {
            console.log("먼이유로 예약 목록 못받아옴");
        })
    }, [])
    /** 예약확인 함수 */
    const handleOpenClose = useCallback((data) => {
        setOpen(prev => ({ ...prev, cancel: !prev.cancel })); // 예약확인 모달창 띄움
        setSelectedData(data); // 선택한 데이터의 객체 저장
    }, []);
    /** 결제확인 함수 */
    const handleOpenCloseSecond = useCallback((data) => {
        setOpen(prev => ({ ...prev, pay: !prev.pay })); // 예약확인 모달창 띄움
        setSelectedData(data); // 선택한 데이터의 객체 저장
    }, []);
    /** 페이지네이션 함수 */
    const setCurrentPageFunc = (page) => {
        let lastOffset = (page - 1) * itemCountPerPage;
        setCurrentPage(page);
        setOffset(lastOffset);
    };

    /** 예약취소 함수 */
    const handleSubmit = async (id) => {
        try {
            await callPostReservedListAPI(id);
            // 결제 취소 후 새로운 결제 목록을 불러옵니다.
            const updatedContents = await callPostReservedListAPI();
            setContents(updatedContents);
            setOpen(prev => ({ ...prev, cancel: !prev.cancel }));

            setSuccess(prev => ({ ...prev, cancel: !prev.cancel }));
            setTimeout(() => {
                setSuccess(prev => ({ ...prev, cancel: !prev.cancel }));
            }, [1000])
        } catch (error) {
            console.log("예약 취소 중 오류 발생:", error);
            setOpen(prev => ({ ...prev, cancel: !prev.cancel }));
        }
    }

    /** 결제 목록 불러오는 API */
    async function callGetReservedListAPI() {
        try {
            //const response = axios.get(Constant.serviceURL+`/결제목록`,{ withCredentials: true })
            return [{
                id: 1,
                price: 5000,
                vihicleId: "TW901",
                seatCapacity: null,
                airlineNm: "티웨이항공",
                arrAirportNm: "제주",
                depAirportNm: "광주",
                arrPlandTime: 202402151005,
                depPlandTime: 202402150915,
                status: '결제 전'
            }];
        } catch (error) {
            console.error(error);
        }

    }
    /** 결제 취소하는 API */
    async function callPostReservedListAPI(id) {
        try {
            const response = axios.delete(Constant.serviceURL + `예약URL/${id}`, { withCredentials: true })
            return response;
        } catch (error) {
            console.error(error);
        }

    }

    return (
        <div>
           
            {
                success.cancel && <h3 className="white-wrap message">결제취소가 완료되었습니다 !</h3>
            }
            {
                open.cancel && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"결제취소 하시겠습니까 ?"} />
            }
        
           
            <div className="componentContent">
                {
                    contents.map((reservedlist, i) => (
                        <ReservedListItem key={reservedlist.id} reservedlist={reservedlist} handleOpenCloseSecond={handleOpenCloseSecond} handleOpenClose={handleOpenClose} />
                    ))
                }
            </div>
            <div className="footer">
                {contents.length > 0 && (
                    <Pagination
                        itemCount={contents.length}
                        pageCountPerPage={pageCountPerPage}
                        itemCountPerPage={itemCountPerPage}
                        currentPage={currentPage}
                        clickListener={setCurrentPageFunc}
                    />
                )}
            </div>
        </div >
    )
}

/** 결제 목록 리스트 아이템 */
const ReservedListItem = ({ reservedlist, handleOpenClose, handleOpenCloseSecond }) => {

    const handleChangeDate = (date) => {
        const arrAirportTime = date.toString();
        const year = arrAirportTime.substr(0, 4);
        const month = arrAirportTime.substr(4, 2);
        const day = arrAirportTime.substr(6, 2);
        const hour = arrAirportTime.substr(8, 2);
        const minute = arrAirportTime.substr(10, 2);
        const formattedTime = `${year}년 ${month}월 ${day}일 ${hour}:${minute}`;
        return formattedTime;
    }
    return (
        <TicketTable>
            <tbody>
                <tr>
                    <td>
                        <h3>{reservedlist.airlineNm}</h3>
                        <p>{reservedlist.vihicleId}</p>
                    </td>
                    <td>
                        <h1 className="special-color">{reservedlist.depAirportNm}</h1>
                        <p >{handleChangeDate(reservedlist.depPlandTime)}</p>

                    </td>
                    <td>
                        <img src={Plane} width={'40px'} />
                    </td>
                    <td>
                        <h1 className="special-color">{reservedlist.arrAirportNm}</h1>
                        <p>{handleChangeDate(reservedlist.arrPlandTime)}</p>
                    </td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <h2>₩ {reservedlist.price.toLocaleString()}</h2>
                    </td>
                    <td colSpan={2}>

                        {reservedlist.status === '결제 전' && <button className="handle-button-modal handle-button-confirmstyle-modal" onClick={() => handleOpenCloseSecond(reservedlist.id)}>결제</button>}
                        <button className="handle-button-modal handle-button-cancelstyle-modal" onClick={() => handleOpenClose(reservedlist.id)}>취소</button>
                    </td>
                </tr>
            </tbody>

        </TicketTable>

    )
}

