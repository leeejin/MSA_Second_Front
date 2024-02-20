import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router';
import Constant from '../../util/constant_variables';
import ModalComponent from '../../util/modal';
import AirPort from '../../util/json/airport-list';
import store from '../../util/redux_storage';
/** 예약확인 목록 페이지 */
const airport = AirPort.response.body.items.item; // 공항 목록
export default function ModalBookCheck() {

    const navigate = useNavigate();
    const location = useLocation(); //main.js에서 보낸 경로와 state를 받기 위함
    const [success, setSuccess] = useState({ pay: false, reserve: false }); // 예약,결제 성공 메시지
    const { contents, seatLevel } = location.state; // 다른 컴포넌트로부터 받아들인 데이터 정보
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴
    const [open, setOpen] = useState({ pay: false, reserve: false }); // 예약모달창
    const [reservedInfo, setReservedInfo] = useState({ uid: null, amount: 0 }); //예약정보랑 가격 저장
    const [selectedData, setSelectedData] = useState([]) //선택한 컴포넌트 객체
    const [errorMessage, setErrorMessage] = useState({ reserveError: false }); //에러메시지 
    /**포트원 카카오페이를 api를 이용하기 위한 전역 변수를 초기화하는 과정 이게 렌더링 될때 초기화 (requestPay가 실행되기전에 이게 초기화되어야함) */
    useEffect(() => {
        const { IMP } = window;
        if (IMP) {
            IMP.init('imp01307537');
        } else {
            console.error('The IMP object does not exist on window.');
        }
    }, []);
    /** 예약확인 함수 */
    const handleOpenClose = useCallback((data) => {
        setOpen(prev => ({ ...prev, reserve: !prev.reserve })); //예약확인 모달창 띄움
        setSelectedData(data); //선택한 데이터의 객체 저장
        if (seatLevel === "이코노미") setReservedInfo(prev => ({ ...prev, amount: data.economyCharge }));
        else setReservedInfo(prev => ({ ...prev, amount: data.prestigeCharge }));
    }, []);

    /** 예약 보내는 핸들러 함수 */
    const handleReserve = async () => {
        //백엔드에 보낼 예약정보
        const formData = {
            id: selectedData.id, //id
            airLine: selectedData.airlineNm, //항공사
            arrAirport: getAirportIdByName(selectedData.arrAirportNm), // 도착지 공항 ID
            depAirport: getAirportIdByName(selectedData.depAirportNm), // 출발지 공항 ID
            arrTime: selectedData.arrPlandTime, //도착시간
            depTime: selectedData.depPlandTime, //출발시간
            charge: reservedInfo.amount, //비용
            vihicleId: selectedData.vihicleId, //항공사 id
            status: "결제전",
            userId: userId, //예약하는 userId
        };
        // 예약 요청하는 부분 -> 이부분은 예약 요청할때의 옵션들을 하드코딩으로 채워넣음 사용자가 선택한 옵션으로 수정해야함 
        try {
            const response = await axios.post(Constant.serviceURL + `/flightReservations`, formData);
            console.log(response.status);
            // 예약 요청이 성공적으로 이루어졌을 때
            if (response.status === 201) {
                setSelectedData(response.data); //백엔드로부터 받은 정보를 여기다가 저장
                // setReservedInfo(prev => ({ ...prev, uid: selectedData.id + "_" + new Date().getTime() }));

                // // 사전 검증 로직 추가: 서버에 결제 예정 금액 등록 요청
                // await axios.post(Constant.serviceURL + `/payments/prepare`, {
                //     merchant_uid: reservedInfo.uid,
                //     amount: reservedInfo.amount
                // });

                // setSuccess(prev => ({ ...prev, reserve: !prev.reserve }));
                // setOpen(prev => ({ ...prev, reserve: !prev.reserve, pay: !prev.pay })); //예약확인 모달창 띄움

                console.log("예약됨",selectedData);
            } else {
                throw new Error('Reservation failed');
            }
        } catch (error) {
            //안되면 에러뜨게 함
            console.error(error);
            setErrorMessage({ reserveError: true });
            setOpen(prev => ({ ...prev, reserve: !prev.reserve })); //예약확인 모달창 띄움
            setTimeout(() => {
                setErrorMessage({ reserveError: false });
            }, 1000);
        }
    }
    /** 결제 보내는 핸들러 함수 */
    const handleSubmit = async () => {
        const { IMP } = window;

        // 카카오페이 결제 요청
        IMP.request_pay({
            pg: "kakaopay",
            pay_method: "card",
            merchant_uid: reservedInfo.uid,
            name: "항공편 예약",
            amount: reservedInfo.amount,
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

                    setOpen(false);
                    navigate(`/CompleteReserve/${selectedData.id}`, {   //로그인 하면 가야함 근데 아직 서버 연결안되서 App.js 임시적으로 풀어놓음
                        state: {
                            contents: selectedData,
                            cost: reservedInfo.amount,
                        }
                    });
                } catch (error) {
                    console.error('Failed to save payment information', error);
                    await cancelPayment(rsp.merchant_uid); // 결제 검증 실패 시 결제 취소 요청을 보내는 함수 호출
                }
            } else {
                console.error(`Payment failed. Error: ${rsp.error_msg}`);
                await cancelPayment(rsp.merchant_uid);
            }
        });

    };


    /** 출발지, 도착지 Nm -> Id로 변경 */
    const getAirportIdByName = (airportNm) => {
        const matchedAirport = airport.find((item) => item.airportNm === airportNm);
        return matchedAirport ? matchedAirport.airportId : null;
    };

    /**결제 취소 요청 함수  */ 
    async function cancelPayment(merchant_uid) {
        console.log(merchant_uid);
        try {
            await axios.post(Constant.serviceURL + `/payments/fail`, { // 결제 취소 요청
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
    return (
        <div>
            {
                errorMessage.reserveError && <h3 className="white-wrap message">예약실패했습니다.</h3>
            }
            {
                success.reserve && <h3 className="white-wrap message">예약이 완료되었습니다! 결제를 진행해주세요.</h3>
            }
            {
                open.reserve && <ModalComponent handleSubmit={handleReserve} handleOpenClose={handleOpenClose} message={"예약 하시겠습니까?"} />
            }
            {
                open.pay && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"카카오페이로 결제 하시겠습니까?"} />
            }
            <div style={{ marginTop: '50%' }}>
                {
                    contents.map((info) => <InfoComponent key={info.id} info={info} handleOpenClose={handleOpenClose} seatLevel={seatLevel} />)
                }
            </div>
        </div>

    )
};

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
                <button onClick={() => handleOpenClose(info)}>선택</button>
            </div>
        </div>
    )
}
