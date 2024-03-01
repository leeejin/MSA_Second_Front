import React, { useState, useEffect, useReducer, useMemo} from 'react';
import axios from '../../axiosInstance';
import { useNavigate, Navigate, Link, useLocation } from 'react-router-dom';
import Constant from '../../util/constant_variables';
import styled from "styled-components";
import ModalComponent from '../../util/modal';
import store from '../../util/redux_storage';
import { IoCall } from "react-icons/io5";
import { RiKakaoTalkFill } from "react-icons/ri";
import { BsExclamationCircle } from "react-icons/bs";
import reducer from '../../util/reducers';
const Hr = styled.hr`
    width:49px;
    border:1px solid var(--grey-color);
    transform: rotate(-90deg);
    margin-top:40px;
    margin-bottom:40px;
`;
/** 에러메시지 (출발지-도착지, 날짜) */
const PAY_SUCCESS = 'paySuccess';
const PAY_ERROR = 'payError';

const ERROR_STATE = {
    [PAY_SUCCESS]: false,
    [PAY_ERROR]: false,
};

const errorMapping = {
    [PAY_SUCCESS]: '결제가 완료되었습니다! 결제목록 카테고리로 가면 확인할 수 있습니다',
    [PAY_ERROR]: '결제실패하였습니다',
};
/** 예약확인 목록 페이지 */
export default function ModalRoomsReserveCheck() {
    const navigate = useNavigate();
    const location = useLocation();

    const [userId,setUserId] = useState(store.getState().userId);
    const { contents } = location.state ?? {};
    const [open, setOpen] = useState(false); // 예약모달창
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지
   
    /**포트원 카카오페이를 api를 이용하기 위한 전역 변수를 초기화하는 과정 이게 렌더링 될때 초기화 (requestPay가 실행되기전에 이게 초기화되어야함) */
    useEffect(() => {
        const { IMP } = window;
        IMP.init('imp01307537');
    }, []);
    const errorElements = useMemo(() => {
        return Object.keys(errorMapping).map((key) => {
            if (errorMessage[key]) {
                return (
                    <h3 className="modal white-wrap message" key={key}>
                        <BsExclamationCircle className="exclamation-mark" /> {errorMapping[key]}
                    </h3>
                );
            }
            return null;
        });
    }, [errorMessage, errorMapping]);
    /** 예약확인 함수 */
    const handleOpenClose = (() => {
        setOpen(prev => !prev);
    });
    const handlePay = async () => {
        const { IMP } = window;
        const merchant_uid = contents.id + "_" + new Date().getTime(); // 이부분 예약에서 받아야함 이때 1 부분만 reservationId로 변경하면됨   
        const amount = contents.charge;

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
                    navigate(`/MyPage/${userId}`);
                } catch (error) {
                    errorDispatch({ type: 'payError', payError: true });
                    setTimeout(() => {
                        errorDispatch({ type: 'error' });
                    }, [1000])
                    await cancelPaymentAPI(rsp.merchant_uid, rsp.imp_uid); // 결제 사후 검증 실패 시 결제 취소 요청
                }
            } else {
                console.error(`Payment failed.Error: ${rsp.error_msg} `);
                await cancelPaymentNotifyAPI(rsp.merchant_uid); // 결제 실패되었음을 알리는 요청
            }
        });
    }
    /**  결제 사전 확인 함수 */
    async function checkPaymentAPI(merchant_uid) {
        try {
            await axios.post(Constant.serviceURL + `/payments/check`, { // 결제 사전 검증 요청
                merchant_uid
            });
            console.log('Payment Check successfully');
        } catch (error) {
            console.error('Failed to check payment', error);
            errorDispatch({ type: 'payError', payError: true });
            setTimeout(() => {
                errorDispatch({ type: 'error' });
            }, [1000]);
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
            errorDispatch({ type: 'payError', payError: true });
            setTimeout(() => {
                errorDispatch({ type: 'error' });
            }, [1000]);
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

            setOpen(false);
        } catch (error) {

            console.error('Failed to notify payment cancellation', error);
        }
    };
    if (!location.state) {
        return (<Navigate to="*" />)
    }
    else {
        return (
            <div className="container" style={{ textAlign: 'center' }}>
                <div>{errorElements}</div>
                {
                    open && <ModalComponent handleSubmit={handlePay} handleOpenClose={handleOpenClose} message={`결제하시겠습니까?`} />
                }
                <div className="container-top" style={{ height: '200px', marginTop: '60px' }}>
                    <div className="panel panel-top font-color-white" >
                        <div>
                            <h1 className="font-family-bold">숙소 검색</h1>
                        </div>
                    </div>
                </div>
                <div className="container-middle middlepanel">
                    <InfoComponent contents={contents} handleOpenClose={handleOpenClose} />
                </div>


            </div>
        )
    }

};

const InfoComponent = ({ contents, handleOpenClose }) => {
    return (
        <>
            <div className="w-50">
                <h2>{contents.title}</h2>
                <p className="font-color-darkgrey">{contents.addr1}</p>
                <p className="font-color-darkgrey"><IoCall /> {contents.tel}</p>

                <Hr />
                <p>가영당은 청주시 오창 미래지농촌테마공원 내 오창한옥마을에 자리한 한옥스테이다. 꽃차 명인 김병희 씨가 한국에서 자란 육송만으로 지어, 방 안 가득 솔향기가 그득하다.

                    객실은 모두 한실이고, 본채에 머물면 방, 거실, 다도실을 고루 쓸 수 있고, 별채를 독채로 쓰면
                    바비큐를 할 수 있다. ‘가영당 찻자리 체험’이 있어 꽃차와 정과를 음미하며 명인과 대화를 나눌 수도 있다.

                    세미나, 작은 음악회나 결혼식 등의 공간으로도 대여한다</p>
                <div className="d-flex d-row" style={{ justifyContent: 'space-around' }} >
                    <div className="d-flex"style={{ gap: '10px' }}>
                        <p>가격</p>
                        <h3 style={{ margin: '0 0 0 10px' }}>60000 원</h3>
                    </div>
                    <div>
                        <button className="btn btn-style-kakao" onClick={handleOpenClose}>
                            <RiKakaoTalkFill />
                            <span className="font-family-bold">Pay</span> 카카오페이로 결제하기
                        </button>
                    </div>
                </div>
            </div>

            <Hr />
            <div>
                <img className="image-reserve" src={contents.firstimage} alt={contents.title} />
            </div>
            <table className="w-50 table-list">
                <tbody>
                    <tr>
                        <td>체크인</td>
                        <td>15:00</td>
                    </tr>
                    <tr>
                        <td>체크아웃</td>
                        <td>10:00</td>
                    </tr>
                    <tr>
                        <td>환불 규정</td>
                        <td>모르겠음</td>
                    </tr>
                    <tr>
                        <td>반려동물 동반</td>
                        <td>될지도?</td>
                    </tr>
                    <tr>
                        <td>주차</td>
                        <td>可能</td>
                    </tr>
                    <tr>
                        <td>조리</td>
                        <td>可能</td>
                    </tr>
                    <tr>
                        <td>홈페이지</td>
                        <td>샬라샬라</td>
                    </tr>
                </tbody>
            </table>

        </>
    )
}