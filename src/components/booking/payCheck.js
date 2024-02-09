import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router';
import 'dayjs/locale/ko';
import dayjs from 'dayjs';
dayjs.locale('ko'); // 한국어로 설정
//예약확인 모달창
export default function ModalBookCheck() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        startDate,
        chooseAirLine,
        depAirPort,
        arrAirPort,
        chooseAirLineNm,
        depAirPortNm,
        arrAirPortNm,
        cost,
    } = location.state; //다른 컴포넌트로부터 받아들인 데이터 정보

    const [listModalVisible, setListModalVisible] = useState(false); //예약목록체크 모달

    //결제창으로 감
    const handlePayCheck = () => {
        setListModalVisible(true);
    }
    //취소버튼 
    const handleModalVisible = () => {
        navigate(-1);
    }
    return (
        <div>
            {
                listModalVisible && <PayCheck depAirPort={depAirPort} arrAirPort={arrAirPort} />
            }
            <div>
                <table>
                    <thead>
                        <tr>
                            <th >구분</th>
                            <th >항공편</th>
                            <th >출발지</th>
                            <th >도착지</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>편도</td>
                            <td >{chooseAirLineNm} ({chooseAirLine})</td>
                            <td >{depAirPortNm} <span>{dayjs(startDate).format('MM월DD일')}</span>
                                <span className="special-color">{dayjs(startDate).format(' H시mm분')}</span></td>
                            <td>{arrAirPortNm}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div >
                <span >총 요금 {cost}원</span>
                <div>
                    <button onClick={handlePayCheck} >결제</button>
                    <button onClick={handleModalVisible} >취소</button>
                </div>
            </div>
        </div>

    )
}
const PayCheck = ({ depAirPort, arrAirPort }) => {
    return (
        <div className="container">
            <h3>결제창 아직 데이터가 뭐 없어서 디자인만해야할것같습니다</h3>
            <p>{depAirPort}</p>
            <p>{arrAirPort}</p>
        </div>
    )
}