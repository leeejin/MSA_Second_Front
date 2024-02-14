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
/** 결제한 목록을 보여주는 함수 */
export default function ReservedList() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴
    const [nickname, setNickname] = useState(store.getState().nickname); //리덕스에 있는 nickname를 가져옴
    const [open, setOpen] = useState(false); // 취소모달창
    const [contents, setContents] = useState([]); //백엔드로부터 받은 예약목록 리스트를 여기다가 저장
    const [selectedData, setSelectedData] = useState([]) //선택한 컴포넌트 객체
    const [loading, setLoading] = useState(true);
    //페이지네이션
    const itemCountPerPage = 2;//한페이지당 보여줄 아이템 갯수
    const pageCountPerPage = 5;//보여줄 페이지 갯수
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 (setCurrentPage()에서 변경됨)
    const [offset, setOffset] = useState(0); //현재페이지에서 시작할 item index
    useEffect(() => {
        const { IMP } = window;
        IMP.init('imp85467664');
    }, []);

    useEffect(() => {
        setLoading(true);
        callGetPaidListAPI().then((response) => {
            setContents(response);
            setLoading(false);
        }).catch((error) => {
            console.log("먼이유로 예약 목록 못받아옴");
        })
    }, [])
    /** 예약확인 함수 */
    const handleOpenClose = useCallback((data) => {
        setOpen(prev => !prev); //예약확인 모달창 띄움
        
        setSelectedData(data); //선택한 데이터의 객체 저장
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
            await callPostPayListAPI(id);
            alert('예약취소가 완료되었습니다.');
            // 결제 취소 후 새로운 결제 목록을 불러옵니다.
            const updatedContents = await callGetPaidListAPI();
            setContents(updatedContents);
            setOpen(!open);
        } catch (error) {
            console.log("예약 취소 중 오류 발생:", error);
            setOpen(!open);
        }
    }
    /** 결제 함수 */
    const handlePay = async (reservedlist) => {
        const { IMP } = window;
        const merchant_uid = 1; // 이부분을 예약번호로 해야함!! 예약서비스에 저장된 예약번호와 동일(백엔드에서 예약하기할 때 예약번호를 보내줄예정)
        const amount = reservedlist.price;

        // 사전 검증 로직 추가: 서버에 결제 예정 금액 등록 요청
        await axios.post("http://localhost:8088/payments/prepare", {
            merchant_uid,
            amount
        });

        IMP.request_pay({
            pg: "kakaopay",
            pay_method: "card",
            merchant_uid,
            name: "항공예약",
            amount,
            buyer_email: "",
            buyer_name: "홍길동",
            buyer_tel: "010-4242-4242",
            buyer_addr: "서울특별시 강남구 신사동",
            buyer_postcode: "01181"
        }, async rsp => {
            if (rsp.success) {
                console.log('Payment succeeded');
                // 결제 성공 시 결제 정보를 서버에 저장
                const formData = {
                    imp_uid: rsp.imp_uid,
                    merchant_uid: rsp.merchant_uid,
                }
                try {
                    const response = await axios.post("http://localhost:8088/payments/validate", formData, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log('Payment information saved successfully');
                } catch (error) {
                    console.error('Failed to save payment information', error);
                }
            } else {
                console.error(`Payment failed. Error: ${rsp.error_msg}`);
            }
        });
    };
    /** 예약 목록 불러오는 API */
    async function callGetPaidListAPI() {
        try {
            //const response = axios.get(Constant.serviceURL+`/예약목록`,{ withCredentials: true })
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
            }, {
                id: 2,
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
    /** 예약 취소하는 API */
    async function callPostPayListAPI(id) {
        try {
            const response = axios.delete(Constant.serviceURL + `예약URL/${id}`, { withCredentials: true })
            return response;
        } catch (error) {
            console.error(error);
        }

    }
    if (loading) return (<div className="loading">
    <img src={Spinner} alt="로딩" width="100px" />
    </div>);
    return (
        <div>

            {
                open && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"예약취소 하시겠습니까?"} />
            }

            <div className="componentContent">
                {
                    contents.map((reservedlist, i) => (
                        <ReservedListItem key={reservedlist.id} reservedlist={reservedlist} handlePay={handlePay} handleOpenClose={handleOpenClose} />
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
const ReservedListItem = ({ reservedlist, handlePay, handleOpenClose }) => {

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

                        {reservedlist.status === '결제 전' && <button onClick={() => handlePay(reservedlist)}>결제</button>}
                        <button onClick={() => handleOpenClose(reservedlist.id)}>취소</button>
                    </td>
                </tr>
            </tbody>

        </TicketTable>

    )
}

