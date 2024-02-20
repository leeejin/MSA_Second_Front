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
    const [success, setSuccess] = useState({ pay: false, cancel: false }); // 예약,결제 성공 메시지
    const [payModalVisible, setPayModalVisible] = useState(false); //결제 정보 모달창
    const [payInfo, setPayInfo] = useState({ name: '', email: '', phone: '' }); //결제 정보
    const { contents, seatLevel } = location.state; // 다른 컴포넌트로부터 받아들인 데이터 정보
    const [payError, setPayError] = useState({ name: false, email: false, phone: false }); //결제 정보 에러 메시지
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴
    const [nickname, setNickname] = useState(store.getState().nickname); //리덕스에 있는 userId를 가져옴
    const [open, setOpen] = useState(false); // 모달창
    const [cost, setCost] = useState(0);
    const [selectedData, setSelectedData] = useState([]) //선택한 컴포넌트 객체
    /**포트원 카카오페이를 api를 이용하기 위한 전역 변수를 초기화하는 과정 이게 렌더링 될때 초기화 (requestPay가 실행되기전에 이게 초기화되어야함) */
    useEffect(() => {
        const { IMP } = window;
        if (IMP) {
            IMP.init('imp01307537');
        } else {
            console.error('The IMP object does not exist on window.');
        }
    }, []);
    /** 전화번호 - 넣기 */
    const autoHyphen2 = (target) => {
        target.value = target.value
            .replace(/[^0-9]/g, '')
            .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3")
            .replace(/(\-{1,2})$/g, "");
    };
    /** 예약확인 함수 */
    const handleOpenClose = useCallback((data) => {
        setOpen(prev => !prev); //예약확인 모달창 띄움
        setSelectedData(data); //선택한 데이터의 객체 저장
        if (seatLevel === "이코노미") setCost(data.economyCharge);
        else setCost(data.prestigeCharge);
    }, []);
    /** 예약 보내는 핸들러 함수 */
    const handleSubmit = async () => {
        const { IMP } = window;
        let errors = {
            emailError: payInfo.email === '' || !payInfo.email.match(/^[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/),
            nameError: payInfo.name.length < 2 || payInfo.name.length > 5,
            phoneError: !payInfo.phone.match(/^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4}$)/),
        }

        //백엔드에 보낼 예약정보
        const formData = {
            id: selectedData.id, //id
            airLine: selectedData.airlineNm, //항공사
            arrAirport: getAirportIdByName(selectedData.arrAirportNm), // 도착지 공항 ID
            depAirport: getAirportIdByName(selectedData.depAirportNm), // 출발지 공항 ID
            arrTime: selectedData.arrPlandTime, //도착시간
            depTime: selectedData.depPlandTime, //출발시간
            charge: cost, //비용
            vihicleId: selectedData.vihicleId, //항공사 id
            status: "결제전",
            userId: userId, //예약하는 userId
            passenger: nickname, //예약하는 nickname
        };
        // 예약 요청하는 부분 -> 이부분은 예약 요청할때의 옵션들을 하드코딩으로 채워넣음 사용자가 선택한 옵션으로 수정해야함 
        const reservationResponse = await axios.post(Constant.serviceURL + `/flightReservations`, formData);
        console.log(reservationResponse.status);

        // 예약 요청이 성공적으로 이루어졌을 때
        if (reservationResponse.status === 201) {
            const merchant_uid = selectedData.id + "_" + new Date().getTime(); // 이부분 예약에서 받아야함 이때 1 부분만 reservationId로 변경하면됨   
            const amount = cost;  // 이부분도 예약 응답에서 받아야함 charge

            // 사전 검증 로직 추가: 서버에 결제 예정 금액 등록 요청
            await axios.post(Constant.serviceURL + `/payments/prepare`, {
                merchant_uid,
                amount
            });

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
                                cost: cost,
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
        } else {
            //안되면 에러뜨게 함
            if (errors.nameError) {
                setPayError({ name: errors.nameError });
            } else if (errors.emailError) {
                setPayError({ email: errors.emailError });
            } else if (errors.phoneError) {
                setPayError({ phone: errors.phoneError });
            }
            setTimeout(() => {
                setPayError({ email: false, name: false, phone: false });
            }, 1500);
        }
    };


    //출발지, 도착지 Nm -> Id로 변경
    const getAirportIdByName = (airportNm) => {
        const matchedAirport = airport.find((item) => item.airportNm === airportNm);
        return matchedAirport ? matchedAirport.airportId : null;
    };
    /** Info 변화 */
    const handleChangeInfo = (infoType, e) => {
        if (infoType === "phone") {
            autoHyphen2(e.target);
        }
        setPayInfo((prev) => ({
            ...prev,
            [infoType]: e.target.value
        }));
    }

    const handleInfoModal = () => {
        setOpen(false);
        setPayModalVisible(!payModalVisible);
    }
    // 결제 취소 요청 함수
    const cancelPayment = async (merchant_uid) => {
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
                payError.name && <h3 className="white-wrap message">알맞은 이름을 입력해주세요. </h3>
            }
            {
                payError.phone && <h3 className="white-wrap message">알맞은 전화번호를 입력해주세요. </h3>
            }
            {
                payError.email && <h3 className="white-wrap message">알맞은 이메일을 입력해주세요. </h3>
            }
          
            {
                success.pay && <h3 className="white-wrap message">결제가 완료되었습니다! 결제목록 카테고리로 가면 확인할 수 있습니다.</h3>
            }
            {
                payModalVisible && <InfoModalComponent handleChangeInfo={handleChangeInfo} handleSubmit={handleSubmit} handleInfoModal={handleInfoModal} autoHyphen2={autoHyphen2} />
            }
            {
                open && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"예약 및 결제하시겠습니까?"} />
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

/** 결제 확인 모달창 */
const InfoModalComponent = ({ handleChangeInfo, handleSubmit, handleInfoModal, autoHyphen2 }) => {
    useEffect(() => {
        document.body.style = `overflow: hidden`;
        return () => document.body.style = `overflow: auto`
    }, []);


    return (
        <>
            <div className="black-wrap" />
            <div className="white-wrap">
                <h3>카카오페이 결제정보</h3>
                <p>이름</p>
                <input
                    placeholder="이름"
                    onChange={(e) => handleChangeInfo("name", e)}
                    autoFocus
                />
                <p>이메일</p>
                <input
                    type="email"
                    placeholder="이메일"
                    onChange={(e) => handleChangeInfo("email", e)}
                />
                <p>전화번호</p>
                <input
                    placeholder="010-0000-0000"
                    onChange={(e) => handleChangeInfo("phone", e)}
                    onBlur={(e) => autoHyphen2(e.target)}
                />
                <div>
                    <button onClick={handleSubmit}>확인</button>
                    <button onClick={handleInfoModal}>취소</button>
                </div>

            </div>
        </>



    )
}