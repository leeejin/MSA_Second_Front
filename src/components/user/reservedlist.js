import React, { useState, useEffect, useCallback  } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import store from '../../util/redux_storage';
import Constant from '../../util/constant_variables';
import ModalComponent from '../../util/modal';
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
        navigate(-1);
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
        window.IMP.init("imp85467664");
        window.IMP.request_pay({
            pg: "kakaopay",
            pay_method: "card",
            amount: "백엔드에서 준 가격",
            name: reservedlist.airlineNm,
            merchant_uid: reservedlist.id
        }, async (response) => {
            if (response.success) {
                alert('결제 성공');
            } else {
                console.log('결제 에러', response.error_msg);
            }
        });
    };
    /** 예약 목록 불러오는 API */
    async function callGetPaidListAPI() {
        //const response = axios.get(Constant.serviceURL+`/누구의 예약목록`,{ withCredentials: true })
        return [{
            id: 1,
            economyCharge: null,
            prestigeCharge: null,
            vihicleId: "TW901",
            seatCapacity: null,
            airlineNm: "티웨이항공",
            arrAirportNm: "제주",
            depAirportNm: "광주",
            arrPlandTime: 202402151005,
            depPlandTime: 202402150915,
        }];
    }
    /** 예약 취소하는 API */
    async function callPostPayListAPI(id) {
        try{
            const response = axios.delete(Constant.serviceURL + `예약URL/${id}`, { withCredentials: true })
            return response;
        }catch(error){
            console.error(error);
        }

    }
    return (
        <div className="background">
            {
                open && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"취소 하시겠습니까?"} />
            }
            <div className="backBox">
                <div className="innerBox">
                    <button onClick={handleLocation}>뒤로가기</button>
                    <h3>예약목록페이지</h3>
                    <div className="box-container">
                        {
                            contents.map((reservedlist, i) => (
                                <ReservedListItem key={reservedlist.id} reservedlist={reservedlist} handlePay={handlePay} handleOpenClose={handleOpenClose} />
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

/** 결제 목록 리스트 아이템 */
const ReservedListItem = ({ reservedlist,handlePay, handleOpenClose }) => {
    return (
        <div>
            <p>출발 : {reservedlist.depAirportNm}</p>
            <p>출발시간 :  {reservedlist.depPlandTime}</p>
            <p>도착 : {reservedlist.arrAirportNm}</p>
            <p>도착시간 : {reservedlist.arrPlandTime}</p>
            <div>
                <button onClick={()=>handlePay(reservedlist)}>결제</button>
                <button onClick={() => handleOpenClose(reservedlist.id)}>예약취소</button>
            </div>
        </div>
    )
}