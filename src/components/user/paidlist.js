import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import store from '../../util/redux_storage';
import Constant from '../../util/constant_variables';
import ModalComponent from '../../util/modal';
import Plane from '../../styles/image/plane.png'
import styled from "styled-components";

const SubThead = styled.span`
    color:grey;
`;
/** 결제한 목록을 보여주는 함수 */
export default function PaidList() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴
    const [nickname, setNickname] = useState(store.getState().nickname); //리덕스에 있는 nickname를 가져옴
    const [open, setOpen] = useState(false); // 취소모달창
    const [contents, setContents] = useState([]); //백엔드로부터 받은 예약목록 리스트를 여기다가 저장
    const [selectedData, setSelectedData] = useState([]) //선택한 컴포넌트 객체
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        callGetPaidListAPI().then((response) => {
            setContents(response);
            setLoading(false);
        }).catch((error) => {
            console.log("먼이유로 예약 목록 못받아옴");
        })
    }, [])
    /** 결제확인 함수 */
    const handleOpenClose = useCallback((data) => {
        setOpen(prev => !prev); //예약확인 모달창 띄움
        setSelectedData(data); //선택한 데이터의 객체 저장
    }, []);

    /** 결제취소 함수 */
    const handleSubmit = async (id) => {
        try {
            await callDeletePayListAPI(id);
            alert('결제취소가 완료되었습니다.');
            // 결제 취소 후 새로운 결제 목록을 불러옵니다.
            const updatedContents = await callGetPaidListAPI();
            setContents(updatedContents);
            setOpen(!open);
        } catch (error) {
            console.log("예약 취소 중 오류 발생:", error);
            setOpen(!open);
        }
    }

    /** 결제 목록 불러오는 API */
    async function callGetPaidListAPI() {
        try {
            //const response = axios.get(Constant.serviceURL+`/예약목록`,{ withCredentials: true })
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
    /** 결제 취소하는 API */
    async function callDeletePayListAPI(id) {
        try {
            const response = axios.delete(Constant.serviceURL + `결제URL/${id}`, { withCredentials: true })
            return response;
        } catch (error) {
            console.error(error);
        }

    }
    return (
        <div>
            {
                loading ? <div className="loading">
                    <p>로딩중</p>
                </div> : <>
                    {
                        open && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"결제취소 하시겠습니까?"} />
                    }

                    <div>
                        {
                            contents.map((paidlist, i) => (
                                <PaidListItem key={paidlist.id} paidlist={paidlist} handleOpenClose={handleOpenClose} />
                            ))
                        }

                    </div>
                    <div>
                        <p>* 스케줄 및 기종은 부득이한 사유로 사전 예고없이 변경될 수 있습니다.</p>
                        <p>* 예약등급에 따라 마일리지 적립률이 상이하거나 마일리지가 제공되지 않습니다.</p>
                    </div>
                </>
            }

        </div>
    )
}

/** 결제 목록 리스트 아이템 */
/** 결제 목록 리스트 아이템 */
const PaidListItem = ({ paidlist, handleOpenClose }) => {

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
            <thead>
                <tr>
                    <th>편명 <SubThead>Flight</SubThead></th>
                    <th>출발 <SubThead>From</SubThead></th>
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
                        <h1 className="special-color">{paidlist.depAirportNm}</h1>
                        <p >{handleChangeDate(paidlist.depPlandTime)}</p>

                    </td>
                    <td>
                        <img src={Plane} width={'40px'} />
                    </td>
                    <td>
                        <h1 className="special-color">{paidlist.arrAirportNm}</h1>
                        <p>{handleChangeDate(paidlist.arrPlandTime)}</p>
                    </td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <h2>₩ {paidlist.price.toLocaleString()}</h2>
                    </td>
                    <td colSpan={2}>

                        <button onClick={() => handleOpenClose(paidlist.id)}>결제취소</button>
                    </td>
                </tr>
            </tbody>

        </table>

    )
}