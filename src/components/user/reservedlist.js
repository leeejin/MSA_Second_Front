import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import store from '../../util/redux_storage';
import Constant from '../../util/constant_variables';
/** 결제한 목록을 보여주는 함수 */
export default function ReservedList() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴
    const [nickname, setNickname] = useState(store.getState().nickname); //리덕스에 있는 nickname를 가져옴

    const [contents, setContents] = useState([]); //백엔드로부터 받은 예약목록 리스트를 여기다가 저장
    useEffect(() => {
        callGetPaidListAPI().then((response) => {
            setContents(response);
            console.log(response);
        }).catch((error) => {
            console.log("먼이유로 예약 목록 못받아옴");
        })
    }, [])
    const handleLocation = () => {
        navigate(-1);
    }
    const handleCancel = async(id) => {
        try {
            await callPostPayListAPI(id);
            alert('예약취소가 완료되었습니다.');
            // 결제 취소 후 새로운 결제 목록을 불러옵니다.
            const updatedContents = await callGetPaidListAPI();
            setContents(updatedContents);
        } catch (error) {
            console.log("예약 취소 중 오류 발생:", error);
            alert('예약 취소에 실패했습니다.');
        }
    }
    //예약 목록 불러오는 API
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
    //예약 취소하는 API
    async function callPostPayListAPI(id) {
        const response = axios.post(Constant.serviceURL + `예약URL/${id}`, { withCredentials: true })
        return response;
    }
    return (
        <div className="background">
            <div className="backBox">
                <div className="innerBox">
                    <button onClick={handleLocation}>뒤로가기</button>
                    <h3>예약목록페이지</h3>
                    <div className="box-container">
                        {
                            contents.map((reservedlist,i) => (
                                <ReservedListItem key={reservedlist.id} reservedlist={reservedlist} handleCancel={handleCancel} />
                            ))
                        }
                    </div>
                </div>

            </div>
        </div>
    )
}

/** 결제 목록 리스트 아이템 */
const ReservedListItem = ({ reservedlist, handleCancel }) => {
    return (
        <div >
            <p>출발 : {reservedlist.depAirportNm}</p>
            <p>출발시간 :  {reservedlist.depPlandTime}</p>
            <p>도착 : {reservedlist.arrAirportNm}</p>
            <p>도착시간 : {reservedlist.arrPlandTime}</p>
            <button onClick={() => handleCancel(reservedlist.id)}>취소</button>
        </div>
    )
}