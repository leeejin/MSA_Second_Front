import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import store from '../../util/redux_storage';
import Constant from '../../util/constant_variables';
import ModalComponent from '../../util/modal';

import Plane from '../../styles/image/plane.png'
/** 결제한 목록을 보여주는 함수 */
export default function ReservedList() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴
    const [nickname, setNickname] = useState(store.getState().nickname); //리덕스에 있는 nickname를 가져옴
    const [open, setOpen] = useState(false); // 취소모달창
    const [contents, setContents] = useState([]); //백엔드로부터 받은 예약목록 리스트를 여기다가 저장
    const [selectedData, setSelectedData] = useState([]) //선택한 컴포넌트 객체

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdn.iamport.kr/v1/iamport.js";
        script.async = true;
        document.head.appendChild(script);
        return () => {
            document.head.removeChild(script);
        }
    }, []);

    useEffect(() => {
        callGetPaidListAPI().then((response) => {
            setContents(response);
            console.log(response);
        }).catch((error) => {
            console.log("먼이유로 예약 목록 못받아옴");
        })
    }, [])
    /** 예약확인 함수 */
    const handleOpenClose = useCallback((data) => {
        setOpen(prev => !prev); //예약확인 모달창 띄움
        setSelectedData(data); //선택한 데이터의 객체 저장
    }, []);
    /** 뒤로가기 함수 */
    const handleLocation = () => {
        navigate(`/MyPage/${userId}`);
    }
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
        window.IMP.init("imp85467664"); //가맹점 식별 코드 

        const merchant_uid = "0" + new Date().getTime(); //고유 주문 번호
        const amount = reservedlist.price;

        window.IMP.request_pay({
            pg: "kakaopay", //등록된 pg 사
            pay_method: "card", // 결제방식: card(신용카드), trans(실시간계좌이체), vbank(가상계좌), phone(소액결제)
            merchant_uid: merchant_uid, // 주문번호
            name: "항공예약", //상품명
            amount: amount, //금액
            buyer_name: userId,  //주문자
            buyer_tel: "01063030402", //필수입력 휴대폰번호


        }, function (response) { //결제가 되었다면 
            if (response.success) {
                //백엔드에도 결제데이터 보내야함
                callPostPayAPI().then((response) => {

                    console.log(response);
                    alert("결제 성공 결제목록페이지로 가면 확인가능");
                }).catch((error) => {
                    console.error(error + "백엔드로 데이터 안감 개 큰일인데");
                })
            } else {
                console.log('결제 에러', response.error_msg);
            }
        });
    };
    /** 결제하는 API */
    async function callPostPayAPI() {
        /** 백엔드로 보낼 결제데이터 */
        const formData = {

        }
        try {
            const response = await axios.post(Constant.serviceURL + `/payments/prepare`, formData, { withCredentials: true });
            return response;
        } catch (error) {
            console.error(error);
        }
    }
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
    /** 예약 취소하는 API */
    async function callPostPayListAPI(id) {
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
                open && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"예약취소 하시겠습니까?"} />
            }
            <div className="backBox">
                <div className="innerBox">
                    <button onClick={handleLocation}>뒤로가기</button>
                    <h3>예약목록페이지</h3>

                    {
                        contents.map((reservedlist, i) => (
                            <ReservedListItem key={reservedlist.id} reservedlist={reservedlist} handlePay={handlePay} handleOpenClose={handleOpenClose} />
                        ))
                    }

                </div>
            </div>

        </div>
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
        <table className="box-container">
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
                <td colspan={2}>
                    <h2>₩ {reservedlist.price.toLocaleString()}</h2>
                </td>
                <td colspan={2}>

                    {reservedlist.status === '결제 전' && <button onClick={() => handlePay(reservedlist)}>결제</button>}
                    <button onClick={() => handleOpenClose(reservedlist.id)}>취소</button>
                </td>
            </tr>
        </table>

    )
}