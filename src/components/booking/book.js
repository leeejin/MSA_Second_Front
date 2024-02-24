import React, { useState, useEffect, useCallback, useReducer, useMemo } from 'react';
import axios from '../../axiosInstance';
import { useNavigate, Navigate } from 'react-router-dom';
import { useLocation } from 'react-router';
import Constant from '../../util/constant_variables';
import ModalComponent from '../../util/modal';
import AirPort from '../../util/json/airport-list';
import store from '../../util/redux_storage';
import { useDispatch } from 'react-redux';
/** 에러메시지 (출발지-도착지, 날짜) */
const ERROR_STATE = {
    paySuccess: false, //결제 성공
    payError: false, //결제 에러
    cancelSuccess: false, //취소 성공
    reserveError: false, // 예약 에러
}
const reducer = (state, action) => {
    switch (action.type) {
        case 'paySuccess':
            return { ...state, payError: true }
        case 'payError':
            return { ...state, payError: true }
        case 'cancelError':
            return { ...state, cancelError: true }
        case 'reserveError':
            return { ...state, reserveError: true }
        default:
            return ERROR_STATE

    }
}
/** 예약확인 목록 페이지 */
const airport = AirPort.response.body.items.item; // 공항 목록
export default function ModalBookCheck() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation(); //main.js에서 보낸 경로와 state를 받기 위함
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지
     const { contents, seatLevel } = location.state; // 다른 컴포넌트로부터 받아들인 데이터 정보
 
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴 
    const [name, setName] = useState(store.getState().name); //리덕스에 있는 name를 가져옴 
    const [open, setOpen] = useState(false); // 예약모달창
    const [payopen, setPayOpen] = useState(false); //결제모달창
    const [selectedData, setSelectedData] = useState({}) //선택한 컴포넌트 객체
    /**포트원 카카오페이를 api를 이용하기 위한 전역 변수를 초기화하는 과정 이게 렌더링 될때 초기화 (requestPay가 실행되기전에 이게 초기화되어야함) */
    useEffect(() => {
        const { IMP } = window;

        IMP.init('imp01307537');
    }, []);
    /** 예약확인 함수 */
    const handleOpenClose = useCallback((data) => {
        setSelectedData(data);
        setOpen(prev => !prev);
        setSelectedData(prevData => ({
            ...prevData,
            charge: seatLevel === "일반석" ? data.economyCharge : data.prestigeCharge
        }));
    }, []);
    const handleOpenCloseReserve = () => {
        setPayOpen(!payopen);
        setOpen(false);
    };

    /** 예약 보내는 핸들러 함수 */
    const handleSubmit = async () => {
        const merchant_uid = selectedData.id + "_" + new Date().getTime(); // 이부분 예약에서 받아야함 이때 1 부분만 reservationId로 변경하면됨   
        //백엔드에 보낼 예약정보
        const formData = {
            id: selectedData.id,
            flightId: selectedData.id,
            airLine: selectedData.airlineNm, //항공사
            arrAirport: getAirportIdByName(selectedData.arrAirportNm), // 도착지 공항 ID
            depAirport: getAirportIdByName(selectedData.depAirportNm), // 출발지 공항 ID
            arrTime: Constant.getDateTypeChange(selectedData.arrPlandTime), //도착시간
            depTime: Constant.getDateTypeChange(selectedData.depPlandTime), //출발시간
            charge: selectedData.charge, //비용
            vihicleId: selectedData.vihicleId, //항공사 id
            status: "결제전",
            userId: userId, //예약하는 userId
            name: name
        };

        console.log("예약번호 : " + merchant_uid);
        console.log("선택한 컴포넌트 객체 : " + selectedData);
        console.log("폼데이터 : ", formData);
        // 예약 요청하는 부분 -> 이부분은 예약 요청할때의 옵션들을 하드코딩으로 채워넣음 사용자가 선택한 옵션으로 수정해야함 

        reserveInfoAPI(formData).then((response) => {
            // 예약 요청이 성공적으로 이루어졌을 때
            if (response === 201) {
                setPayOpen(!payopen);
            }
        });


    };

    const handlePay = async () => {
        const { IMP } = window;
        const merchant_uid = selectedData.id + "_" + new Date().getTime(); // 이부분 예약에서 받아야함 이때 1 부분만 reservationId로 변경하면됨   
        const amount = selectedData.charge;
        // 결제 체크 및 결제 사전검증 도중 둘 중 하나라도 실패하면 결제 함수 자체를 종료
        try {
            await checkPaymentAPI(merchant_uid);
            await preparePaymentAPI(merchant_uid, amount);
            console.log('Payment has been prepared successfully.');
        } catch (error) {
            alert(error.message);
            return;
        }

        // 카카오페이 결제 요청
        IMP.request_pay({
            pg: "kakaopay",
            pay_method: "card",
            merchant_uid,
            name: "항공편 예약",
            amount,
        }, async rsp => {
            if (rsp.success) { // 결제가 성공되면
                console.log('Payment succeeded');
                try {
                    const response = await axios.post(Constant.serviceURL + `/payments/validate`, { // 결제 사후 검증
                        imp_uid: rsp.imp_uid,
                        merchant_uid: rsp.merchant_uid,
                    }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log('Payment information saved successfully' + response);
                    console.log(merchant_uid);
                    setOpen(false);
                    navigate(`/CompleteReserve/${selectedData.id}`, {   //로그인 하면 가야함 근데 아직 서버 연결안되서 App.js 임시적으로 풀어놓음
                        state: {
                            contents: selectedData,
                        }
                    });
                } catch (error) {
                    errorDispatch({ type: 'payError', payError: true });
                    setTimeout(() => {
                        errorDispatch({ type: 'error' });
                    }, [1000])
                    await cancelPaymentAPI(rsp.merchant_uid, rsp.imp_uid); // 결제 사후 검증 실패 시 결제 취소 요청
                }
            } else {
                console.error(`Payment failed. Error: ${rsp.error_msg}`);
                await cancelPaymentNotifyAPI(rsp.merchant_uid); // 결제 실패되었음을 알리는 요청
            }
        });
    }
    /** 출발지, 도착지 Nm -> Id로 변경 */
    const getAirportIdByName = (airportNm) => {
        const matchedAirport = airport.find((item) => item.airportNm === airportNm);
        return matchedAirport ? matchedAirport.airportId : null;
    };

    /**  결제 사전 확인 함수 */
    async function checkPaymentAPI(merchant_uid) {
        try {
            await axios.post(Constant.serviceURL + `/payments/check`, { // 결제 사전 검증 요청
                merchant_uid
            });
            console.log('Payment Check successfully');
        } catch (error) {
            console.error('Failed to check payment', error);
            throw new Error("결제되어야할 정보가 존재하지 않습니다");
        }
    };

    /**  결제 사전 검증 함수 */
    async function preparePaymentAPI(merchant_uid, amount) {
        try {
            await axios.post(Constant.serviceURL + `/payments/prepare`, { // 결제 사전 검증 요청
                merchant_uid,
                amount
            });
            console.log('Payment Prepare successfully');
        } catch (error) {
            console.error('Failed to prepare payment', error);
            throw new Error("결제되어야할 정보가 일치하지 않습니다");
        }
    }
    /**  결제 취소 요청 함수 */
    async function cancelPaymentAPI(merchant_uid, imp_uid) {
        console.log(merchant_uid);
        try {
            await axios.post(Constant.serviceURL + `/payments/cancel`, { // 결제 취소 요청(사용자 단순 변심으로 결제취소및 결제 시간 만료를 위한 메서드)
                merchant_uid,
                imp_uid
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Payment cancellation successfully');
        } catch (error) {
            console.error('Failed to payment cancellation', error);
        }
    };
    /** 결제 취소 알림 함수 */
    async function cancelPaymentNotifyAPI(merchant_uid) {
        try {
            await axios.post(Constant.serviceURL + `/payments/fail`, { // 결제 취소 알림 요청
                merchant_uid
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Payment cancellation notified successfully');
        } catch (error) {
            console.error('Failed to notify payment cancellation', error);
        }
    };
    /** 예약 함수  */
    async function reserveInfoAPI(formData) {
        try {
            const reservationResponse = await axios.post(Constant.serviceURL + `/flightReservations`, formData);
            return reservationResponse.status;
        } catch (error) {
            //안되면 에러뜨게 함
            errorDispatch({ type: 'reserveError', reserveError: true });
            setTimeout(() => {
                errorDispatch({ type: 'error' });
            }, [1000])
        }
    }
    if (!location.state) {
        // return (<Navigate to="/" />)
    } else {
        return (
            <div>
                {
                    errorMessage.reserveError && <h3 className="white-wrap message">이미 예약하였습니다</h3>
                }
                {
                    errorMessage.paySuccess && <h3 className="white-wrap message">결제가 완료되었습니다! 결제목록 카테고리로 가면 확인할 수 있습니다</h3>
                }
                {
                    errorMessage.payError && <h3 className="white-wrap message">결제실패하였습니다</h3>
                }
                {
                    open && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"예약하시겠습니까?"} />
                }
                {
                    payopen && <ModalComponent handleSubmit={handlePay} handleOpenClose={handleOpenCloseReserve} message={"예약이 완료되었습니다. 카카오페이로 결제하시겠습니까?"} />
                }
                <div>
                    {
                        contents.map((info) => <InfoComponent key={info.id} info={info} handleOpenClose={handleOpenClose} seatLevel={seatLevel} />)
                    }
                </div>
            </div>

        )
    }

};

const InfoComponent = ({ info, handleOpenClose, seatLevel }) => {

    // economyCharge 또는 prestigeCharge가 0인 경우, 컴포넌트 렌더링 안함
    if ((seatLevel==="일반석" && info.economyCharge === 0)|| (seatLevel==="프리스티지석" && info.prestigeCharge === 0)) {
        return null;
    }else{
        return (
            <div>
                <div>
                    <span>{info.airlineNm} ({info.vihicleId})</span>
                </div>
                <div>
                    <p>{Constant.handleDateFormatChange(info.depPlandTime)}</p>
                    <p>{info.depAirportNm}</p>
                </div>
                <div>~</div>
                <div>{Constant.handleDateCalculate(info.arrPlandTime, info.depPlandTime)}</div>
                <div>
                    <p>{Constant.handleDateFormatChange(info.arrPlandTime)}</p>
                    <p>{info.arrAirportNm}</p>
                </div>
                <div>{
                    seatLevel === "일반석" ? <span>{info.economyCharge.toLocaleString()}원</span> : <span>{info.prestigeCharge.toLocaleString()}원</span>
                }</div>
                <div>
                    <span>잔여 {info.seatCapacity}석</span>
                    <button onClick={() => handleOpenClose(info)}>선택</button>
                </div>
            </div>
        )
    }
    
}
