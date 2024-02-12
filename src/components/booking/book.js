import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router';
import Constant from '../../util/constant_variables';
import ModalComponent from '../../util/modal';
import PayCheck from './pay';
<<<<<<< HEAD
/** 예약확인 목록 페이지 */
export default function ModalBookCheck() {

    const navigate = useNavigate();
    const location = useLocation(); //main.js에서 보낸 경로와 state를 받기 위함

    const { contents, seatLevel } = location.state; // 다른 컴포넌트로부터 받아들인 데이터 정보

    const [open, setOpen] = useState(false); // 모달창
    const [selectedId, setSelectedId] = useState(null); //선택한 컴포넌트 Id
    const [cost, setCost] = useState(0);
    /** 선택한 id가 바뀔 때마다 가격 변함 */
    useEffect(() => {
        const selectedData = contents.find(item => item.id === selectedId);
        if (seatLevel === "이코노미") setCost(selectedData ? selectedData.economyCharge : null);
        else setCost(selectedData ? selectedData.prestigeCharge : null);
    }, [selectedId])
    /** 예약확인 함수 */
    const handleOpenClose = useCallback((id) => {
        setOpen(prev => !prev); //예약확인 모달창 띄움
        setSelectedId(id); //선택한 데이터의 id 저장
    }, []);
    /** 예약 보내는 핸들러 함수 */
    const handleSubmit = () => {
        let filteredData = contents.filter(item => item.id === selectedId);
        // callPostBookInfoAPI(filteredData).then((response) => {
        //     if (response) //서버로부터 예약확인을 받았다면 
        //         setOpen(false);
            navigate(`/Pay/${selectedId}`, {   //로그인 하면 가야함 근데 아직 서버 연결안되서 App.js 임시적으로 풀어놓음
                state: {
                    contents: filteredData,
                    selectedId: selectedId,
                    cost: cost,
                }
            });
        // }).catch(() => {
        //     console.log("무슨이유로 예약정보가 서버로 안감");
        // })
    }
    /** 예약보내는 API */
    async function callPostBookInfoAPI(filteredData) {
        //백엔드로 보낼 예약데이터
        const formData = {
            airlineNm: filteredData.airlineNm,
            arrAirportNm: filteredData.arrAirportNm,
            arrPlandTime: filteredData.arrPlandTime,
            depAirportNm: filteredData.depAirportNm,
            depPlandTime: filteredData.depPlandTime,
            economyCharge: filteredData.economyCharge,
            id: filteredData.id,
            prestigeCharge: filteredData.prestigeCharge,
            seatCapacity: filteredData.seatCapacity,
            vihicleId: filteredData.vihicleId
        };
        try {
            const response = axios.post(Constant.serviceURL + `예약URL/${selectedId}`, formData, { withCredentials: true })
            return response;
        }
        catch (error) {
            console.error(error);
        }
=======
import 'dayjs/locale/ko';
import dayjs from 'dayjs';
dayjs.locale('ko'); // 한국어로 설정
//예약확인 목록 페이지
export default function ModalBookCheck() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        depTime,
        chooseAirLine,
        depAirPort,
        arrAirPort,
        chooseAirLineNm,
        depAirPortNm,
        arrAirPortNm,
        charge,
        arrTime,
        seatCapacity,
    } = location.state; //다른 컴포넌트로부터 받아들인 데이터 정보
    const [open, setOpen] = useState(false);

    //예약확인 모달창
    const handleOpenClose = () => {
        setOpen(!open);
    }
    //예약 보내는 핸들러 함수
    const handleSubmit = () => {
        callPostBookInfoAPI().then((response) => {
            console.log("예약 정보 : ", response);
            setOpen(false);
            navigate(`/Pay`, {   //로그인 하면 가야함 근데 아직 서버 연결안되서 App.js 임시적으로 풀어놓음
                state: {
                    chooseAirLine: chooseAirLine,
                    depAirPort: depAirPort,
                    arrAirPort: arrAirPort,
                    depTime: depTime,
                    chooseAirLineNm: chooseAirLineNm,
                    depAirPortNm: depAirPortNm,
                    arrAirPortNm: arrAirPortNm,
                }
            });
        }).catch(() => {
            console.log("무슨이유로 예약정보가 서버로 안감");
        })
    }
    //취소버튼 
    const handleModalVisible = () => {
        navigate(-1);
    }
    //예약보내는 API
    async function callPostBookInfoAPI() {
        //백엔드로 보낼 예약데이터
        const formData = {
            airLine: chooseAirLine,
            depAirport: depAirPort,
            arrAirport: arrAirPort,
            depTime: depTime,
        };
        // try {
        //     const response = axios.post(Constant.serviceURL + `예약URL`, formData, { withCredentials: true })
        //     return response;
        // }
        // catch (error) {
        //     console.error(error);
        // }
>>>>>>> f465aade644923a6019bf68c52f26d28d42406f8
    }
    return (
        <div>
            {
                open && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"예약 하시겠습니까?"} />
            }
<<<<<<< HEAD
            <div>
                {
                    contents.map((info) => <InfoComponent key={info.id} info={info} handleOpenClose={handleOpenClose} seatLevel={seatLevel} />)
                }
=======

            <div>
                <h3>내가 선택한 여정</h3>
                <table>
                    <thead>
                        <tr>
                            <th>항공편</th>
                            <th>출발지</th>
                            <th>도착지</th>
                            <th>좌석수</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td >{chooseAirLineNm} ({chooseAirLine})</td>
                            <td ><p>{depAirPortNm}</p> <span>{dayjs(depTime).format('MM월DD일')}</span>
                                <span className="special-color">{dayjs(depTime).format(' H시mm분')}</span></td>
                            <td ><p>{arrAirPortNm}</p> <span>{dayjs(arrTime).format('MM월DD일')}</span>
                                <span className="special-color">{dayjs(arrTime).format(' H시mm분')}</span></td>
                            <td>{seatCapacity}석</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div >
                <span >총 요금 {charge}원</span>
                <div>
                    <button onClick={handleOpenClose}>예약</button>
                    <button onClick={handleModalVisible} >취소</button>
                </div>
>>>>>>> f465aade644923a6019bf68c52f26d28d42406f8
            </div>
        </div>

    )
}
<<<<<<< HEAD

const InfoComponent = ({ info, handleOpenClose, seatLevel }) => {
    return (
        <div>
            <div>
                <span>{info.airlineNm} ({info.vihicleId})</span>
            </div>
            <div>
                <p>{info.arrPlandTime}</p>
                <p>{info.depAirportNm}</p>
            </div>
            <div>~</div>
            <div>
                <p>{info.depPlandTime}</p>
                <p>{info.arrAirportNm}</p>
            </div>
            <div>{
                seatLevel === "이코노미" ? <span>{info.economyCharge}</span> : <span>{info.prestigeCharge}</span>
            }</div>
            <div>
                <span>잔여 {info.seatCapacity}석</span>
                <button onClick={() => handleOpenClose(info.id)}>선택</button>
            </div>
        </div>
    )
}
=======
>>>>>>> f465aade644923a6019bf68c52f26d28d42406f8
