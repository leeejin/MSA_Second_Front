import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { useNavigate } from "react-router-dom";
import axios from '../../axiosInstance';
import store from '../../util/redux_storage';
import Constant from '../../util/constant_variables';
import ModalComponent from '../../util/modal';
import Plane from '../../styles/image/plane.png'
import styled from "styled-components";
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
const SubThead = styled.span`
    color:grey;
`;
//페이지네이션 ** 상태를 바꾸지 않으면 아예 외부로 내보낸다. 
const itemCountPerPage = 2; //한페이지당 보여줄 아이템 갯수
const pageCountPerPage = 5; //보여줄 페이지 갯수

/** 에러메시지 (출발지-도착지, 날짜) */
const ERROR_STATE = {
    cancelError: false,
    listError: false,

}
const reducer = (state, action) => {
    switch (action.type) {
        case 'cancelError':
            return { ...state, cancelError: true }
        case 'listError':
            return { ...state, listError: true }
        default:
            return ERROR_STATE
    }
}

/** 결제한 목록을 보여주는 함수 */
export default function PaidList() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴
    const [open, setOpen] = useState(false); // 취소모달창
    const [contents, setContents] = useState([]); //백엔드로부터 받은 예약목록 리스트를 여기다가 저장
    const [selectedData, setSelectedData] = useState([]) //선택한 컴포넌트 객체
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지
    //페이지네이션
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 (setCurrentPage()에서 변경됨)
    const [offset, setOffset] = useState(0); //현재페이지에서 시작할 item index

    useEffect(() => {
        callGetPaidListAPI().then((response) => {
            setContents(response);
        }).catch((error) => {
            console.log("먼이유로 예약 목록 못받아옴");
        })
    }, [])
    /** 결제확인 함수 */
    const handleOpenClose = useCallback((data) => {
        setOpen(prev => !prev); //결재취소 확인 모달창 띄움
        setSelectedData(data); //선택한 데이터의 객체 저장

    }, []);
    /** 페이지네이션 함수 */
    const setCurrentPageFunc = (page) => {
        let lastOffset = (page - 1) * itemCountPerPage;
        setCurrentPage(page);
        setOffset(lastOffset);
    };
    /** 결제취소 함수 */
    const handleSubmit = async (id) => {
        const merchant_uid = id + "_" + new Date().getTime();
        try {
            await cancelPayment(merchant_uid);
            // 결제 취소 후 새로운 결제 목록을 불러옵니다.
            const updatedContents = await callGetPaidListAPI();
            setContents(updatedContents);
            setOpen(!open);

            errorDispatch({ type: 'cancelError', cancelError: true });
            setTimeout(() => {
                errorDispatch({ type: 'error' });
            }, [1000])
            window.location.reload(); //취소되면 페이지 리로드
        } catch (error) {
            console.log("예약 취소 중 오류 발생:", error);
            setOpen(!open);
        }
    }

    /** 결제 목록 불러오는 API */
    async function callGetPaidListAPI() {
        try {
            //const response = axios.get(Constant.serviceURL+`/결과목록`,{ withCredentials: true })
            return [{
                id: 1,
                price: 5000,
                vihicleId: "TW901",
                airlineNm: "티웨이항공",
                arrAirportNm: "제주",
                depAirportNm: "광주",
                arrPlandTime: 202402151005,
                depPlandTime: 202402150915,
                status: '결제 후'
            }];
        } catch (error) {
            console.error(error);
        }

    }
    /**결제 취소 요청 함수  */
    async function cancelPayment(merchant_uid) {
        try {
            await axios.post(Constant.serviceURL + `/payments/cancel`, { // 결제 취소 요청
                merchant_uid
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Failed to notify payment cancellation', error);
        }
    };

    return (
        <div className="container">
            {
                errorMessage.cancelError && <h3 className="white-wrap message">결제취소가 완료되었습니다!</h3>
            }
            {
                open && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"결제취소 하시겠습니까?"} />
            }
                

            <div className="container-content">
                {
                    contents.slice(offset,offset+itemCountPerPage).map((paidlist, i) => (
                        <PaidListItem key={paidlist.id} paidlist={paidlist} handleOpenClose={handleOpenClose} />
                    ))
                }

            </div>
            <div className="background-color-white">
                {contents.length > 0 && (
                    <Pagination
                        itemCount={contents.length}
                        pageCountPerPage={pageCountPerPage}
                        itemCountPerPage={itemCountPerPage}
                        currentPage={currentPage}
                        clickListener={setCurrentPageFunc}
                    />
                )}
                <p>* 스케줄 및 기종은 부득이한 사유로 사전 예고없이 변경될 수 있습니다.</p>
                <p>* 예약등급에 따라 마일리지 적립률이 상이하거나 마일리지가 제공되지 않습니다.</p>
            </div>

        </div>
    )
}

/** 결제 목록 리스트 아이템 */
const PaidListItem = ({ paidlist, handleOpenClose }) => {
    return (
        <table className="table-list-card">
            <thead>
                <tr>
                    <th>편명 <SubThead>Flight</SubThead></th>
                    <th >출발 <SubThead>From</SubThead></th>
                    <th />
                    <th>도착 <SubThead>To</SubThead></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <p>{paidlist.vihicleId}</p>
                        <p>Operated by {paidlist.vihicleId.substring(0, 2)}</p>
                        <h3>{paidlist.airlineNm}</h3>
                    </td>
                    <td>
                        <h1 className="font-color-special">{paidlist.depAirportNm}</h1>
                        <p>{Constant.handleDateFormatChange(paidlist.depPlandTime)}</p>

                    </td>
                    <td>
                        <img src={Plane} width={'40px'} />
                    </td>
                    <td>
                        <h1 className="font-color-special">{paidlist.arrAirportNm}</h1>
                        <p>{Constant.handleDateFormatChange(paidlist.arrPlandTime)}</p>
                    </td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <h2 className="font-family-extrabold">₩ {paidlist.price.toLocaleString()}</h2>
                    </td>
                    <td colSpan={2}>

                        <button className="btn btn-style-grey" onClick={() => handleOpenClose(paidlist.id)}>취소</button>
                    </td>
                </tr>
            </tbody>

        </table>

    )
}