import React, { useState, useEffect, useReducer } from 'react';
import styled from "styled-components";
import NoImage from '../../../styles/image/noImage.png';
import axios from '../../../axiosInstance';
import Constant from '../../../util/constant_variables';
import { reducer, ERROR_STATE, Alert } from '../../../util/custom/alert';
import { useSelector } from 'react-redux';
import Datepicker from '../../../util/custom/datepicker';
import { ModalComponent } from '../../../util/custom/modal';
const Img = styled.img`
    cursor:pointer;
`;
const { IMP } = window;
/** 객실정보 */
const DetailRoomInfo = ({ contentid }) => {
    //const [larger, setLarger] = useState(false); //사진 크게 보기
    const loginInfo = {
        userId: useSelector((state) => state.userId),
        name: useSelector((state) => state.name),
        email: useSelector((state) => state.username)
    };
    const [contents, setContents] = useState({});
    const [image, setImage] = useState({ img: null, imgAlt: '' });
    const [depTime, setDepTime] = useState(new Date());
    const [cost, setCost] = useState(0);
    const [open, setOpen] = useState({
        reserveopen: false,
        payopen: false,
    }); // 예약,결제 모달창
    const [selectedData, setSelectedData] = useState({}); //선택한 데이터
    const [serverData, setServerData] = useState({}); //서버로부터 받은 데이터

    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 
    /**포트원 카카오페이를 api를 이용하기 위한 전역 변수를 초기화하는 과정 이게 렌더링 될때 초기화 (requestPay가 실행되기전에 이게 초기화되어야함) */
    useEffect(() => {
        IMP.init('imp01307537');
    }, []);
    useEffect(() => {
        getAccommodationRoomReserveAPI().then((response) => {
            setContents(response);

            setImage(prev => ({
                ...prev,
                img: response.roomImg1,
                imgAlt: response.roomImg1Alt
            }))
        });
    }, []);
    useEffect(() => {
        const costs = [
            contents.roompeakseasonminfee2 ?? 0,
            contents.roompeakSeasonMinfee1 ?? 0,
            contents.roomoffseasonminfee2 ?? 0,
            contents.roomoffseasonminfee1 ?? 0,
        ];
        costs.sort((a, b) => a - b);
        const highestCost = costs[costs.length - 1];
        setCost(highestCost);
    }, [])
    /** 출발 날짜 핸들러 */
    const handleDateChange = (date) => {
        console.log(date);
        setDepTime(date);
    }
    /** 자세히 보기 */
    const handleViewLarger = (img, imgAlt) => {
        setImage({ img: img, imgAlt: imgAlt });
    };
    /** 모달창 on/off */
    const handleOpenClose = () => {
        setOpen(prev => ({ ...prev, reserveopen: !prev.reserveopen }));
    };
    const handleOpenCloseReserve = async () => {
        await reserveCancelAPI(serverData);
        setOpen(prev => ({
            ...prev,
            reserveopen: false,
            payopen: !prev.payopen
        }));

    };
    const handleError = (errorType, hasError) => {
        errorDispatch({ type: errorType, [errorType]: hasError });

        setTimeout(() => {
            errorDispatch({ type: 'error' });
        }, 2000);
    };
    /** 예약확인 함수 */
    const handleOpenCloseData = (data) => {
        setSelectedData(prevData => ({
            ...prevData,
            ...data,
        }));
        setOpen(prev => ({ ...prev, reserveopen: !prev.reserveopen }));

    };

    /** 예약 보내는 핸들러 함수 */
    const handleSubmit = async () => {
        if (depTime <= new Date()) { //당일 예약 불가
            handleError('dateError', true);
            setOpen(prev => ({
                ...prev,
                reserveopen: false,
            }));
        } else {
            await reserveInfoAPI();
        }

    };
    /** 자세히 보기 */
    const ModalLargerComponent = ({ imgAlt, image }) => {
        return (
            <img
                src={image ? image : NoImage}
                alt={imgAlt}
                width={"100%"} height={"400px"}
            />

        );
    }
    /** 결제 함수 */
    const handlePay = async () => {
        const merchant_uid = serverData.id + "_" + "L" + new Date().getTime(); // 이부분 예약에서 받아야함 이때 1 부분만 reservationId로 변경하면됨   
        const amount = serverData.charge;
        const category = serverData.category;

        // 결제 체크 및 결제 사전검증 도중 둘 중 하나라도 실패하면 결제 함수 자체를 종료
        try {
            await checkPaymentAPI(merchant_uid, category);
            await preparePaymentAPI(merchant_uid, amount, category);
            console.log('Payment has been prepared successfully.');
        } catch (error) {
            handleError('payError', true);
            return;
        }

        // 카카오페이 결제 요청
        IMP.request_pay({
            pg: "kakaopay",
            pay_method: "card",
            merchant_uid,
            name: "숙소 예약",
            amount,
        }, async (rsp) => {
            if (rsp.success) { // 결제가 성공되면
                console.log('Payment succeeded');
                await validatePaymentAPI(rsp);
            } else {
                console.error(`Payment failed.Error: ${rsp.error_msg} `);
                await cancelPaymentAPI(rsp.merchant_uid); // 결제 실패되었음을 알리는 요청
                setOpen(prev => ({
                    ...prev,
                    reserveopen: false,
                    payopen: false
                }));
            }
        });
    }

    /**  결제가 진행되기전 예약 요청을 토대로 결제 정보가 제대로 저장되었는지 확인하는 메서드 */
    async function checkPaymentAPI(merchant_uid, category) {
        try {
            await axios.post(Constant.serviceURL + `/payments/check`, { // 결제 정보 존재 확인을 요청
                merchant_uid,
                category
            });
            console.log('성공적으로 예약 요청을 수신했습니다');
        } catch (error) {
            console.error('해당 예약 번호로 결제 요청된 정보가 존재하지 않습니다\n오류내용 : ', error.reponse.data);

            throw new Error("결제되어야할 정보가 존재하지 않습니다");
        }
    };
    /** 실제로 결제가 되고 난 후, 결제된 금액이 실제 예약 정보에 있는 금액과 같은지 확인하는 메서드 */
    async function validatePaymentAPI(rsp) {
        try {
            const response = await axios.post(Constant.serviceURL + `/payments/validate`, { // 결제 사후 검증을 요청
                imp_uid: rsp.imp_uid,
                merchant_uid: rsp.merchant_uid,
                category: "F",
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('결제가 되고 난 후 진행되는 사후 검증에 성공했습니다.' + response);
            setOpen(prev => ({ ...prev, reserveopen: !prev.reserveopen, payopen: !prev.payopen }));
            //항공에선 여기서 CompleteBook으로 가서 결제내역 보여줬음
        } catch (error) {
            await refundPaymentAPI(rsp.merchant_uid, rsp.imp_uid); // 결제 사후 검증 실패 시 해당 결제에 대해 환불 요청
        }
    }
    /* 실제 결제가 진행되기 전, 포트원 서버에 예약 요청을 토대로 결제될 정보를 미리 등록하는 메서드 -> 결제 사전 검증 */
    async function preparePaymentAPI(merchant_uid, amount, category) {
        try {
            await axios.post(Constant.serviceURL + `/payments/prepare`, { // 결제 사전 검증 요청
                merchant_uid,
                amount,
                category
            });
            console.log('결제가 실제로 진행되기전 사전 검증에 성공했습니다');
        } catch (error) {
            console.error('가격과 예약번호의 불일치로 결제 사전 검증에 실패했습니다.\n오류 내용 : ', error.response.data);
            throw new Error("결제되어야할 정보가 일치하지 않습니다");
        }
    }
    /**  해당 예약번호를 가진 결제건수에 대해 환불요청 하는 메서드 */
    async function refundPaymentAPI(merchant_uid, imp_uid, category) {
        console.log(merchant_uid);
        try {
            await axios.post(Constant.serviceURL + `/payments/refund`, { // 환불 요청
                merchant_uid,
                imp_uid,
                category
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('환불처리 하는데 성공했습니다.');
        } catch (error) {
            console.error('환불처리하는데 실패했습니다.\n오류내용 : ', error.response.data);
        }
    };
    /* 사용자가 단순 변심으로 도중에 결제를 취소하거나 결제 URL이 만료 되었을 때를 처리하는 메서드 */
    async function cancelPaymentAPI(merchant_uid, category) {
        try {
            await axios.post(Constant.serviceURL + `/payments/cancel`, { // 결제취소 요청
                merchant_uid,
                category
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('결제취소 처리가 성공적으로 되었습니다');
            setOpen(prev => ({
                ...prev,
                payopen: !prev.payopen,
                reserveopen: !prev.reserveopen
            }));
        } catch (error) {

            console.error('결제취소 처리가 실패했습니다.\n오류내용 : ', error.reponse.data);
        }
    };
    /** 예약 함수  */
    async function reserveInfoAPI() {
        //백엔드에 보낼 예약정보
        const formData = {
            reservationdate: Constant.handleDateFormatISOChange(depTime),
            email: loginInfo.email,
            charge: cost,
            roomCode: selectedData.roomCode,
        };
        try {
            const reservationResponse = await axios.post(Constant.serviceURL + `/lodgingReservation/create`, formData);
            console.log("서버로부터 받은 데이터 : ", reservationResponse.data);
            setServerData(reservationResponse.data);
            handleError('accommodationReserveSuccess', true);
            setOpen(prev => ({
                ...prev,
                reserveopen: false,
                payopen: !prev.payopen
            }));
        } catch (error) {
            //안되면 에러뜨게 함
            setOpen(prev => ({
                ...prev,
                reserveopen: !prev.reserveopen
            }));
            handleError('reserveError', true);
        }
    }
    /**예약 취소 함수 */
    async function reserveCancelAPI() {
        // 취소보낼 데이터
        const formData = {
            lodgingReservationId: serverData.id,
        };
        try {// 결제 취소 알림 요청
            const response = await axios.post(Constant.serviceURL + `/lodgingReservation/cancel`, formData);
            console.log("취소완료");
            handleError('reservecancelSuccess', true);
            return response;

        } catch (error) {
            console.error(error);
            handleError('reservecancelError', true);
        }
    }
    /** 숙소디테일 데이터 불러오는 함수 페이지 로드 될 때 실행 */
    async function getAccommodationRoomReserveAPI() {

        try {
            const response = await axios.get(Constant.serviceURL + `/lodgings/searchDetail/${contentid}`);

            return {
                id: 36,
                contentid: 2531399,
                contenttypeid: 32,
                roomcode: 48188,
                roomtitle: "double 룸(독채형)",
                roomsize: null,
                roomcount: "0",
                roombasecount: 10,
                roommaxcount: 20,
                roomoffseasonminfee1: 250000,
                roomoffseasonminfee2: 350000,
                roompeakSeasonMinfee1: null,
                roompeakseasonminfee2: 450000,
                roomintro: "",
                roombathfadility: null,
                roombath: "",
                roomhometheater: "",
                roomaircondition: "Y",
                roomtv: "Y",
                roompc: "",
                roomcable: "",
                roominternet: "Y",
                roomrefrigerator: "Y",
                roomtoiletries: "Y",
                roomsofa: "",
                roomcook: "Y",
                roomtable: "Y",
                roomhairdryer: "Y",
                roomsize2: "100",
                roomImg1: "http://tong.visitkorea.or.kr/cms/resource/28/2573328_image2_1.jpg",
                roomImg1Alt: "사진1 설명",
                roomImg2: null,
                roomImg2Alt: null,
                roomImg3: null,
                roomImg3Alt: null,
                roomImg4: null,
                roomImg4Alt: null,
                originImgurl: null,
                imgname: null,
                smallimageurl: null,

                /**이 부분은 수정 될 수 있습니다.       
                 roomCapacity: {
                            "2024-03-31": 10,
                          ...
                            "2024-03-01": 10
                ////////////////////////////////////
                        }*/
            };
        } catch (error) {
            console.error(error);
        }

    }
    return (
        <div className="container">
            <Alert errorMessage={errorMessage} />
            {
                open.reserveopen && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"숙소예약하시겠습니까?"} />
            }
            {
                open.payopen && <ModalComponent handleSubmit={handlePay} handleOpenClose={handleOpenCloseReserve} message={"예약이 완료되었습니다. 카카오페이로 결제하시겠습니까?"} />
            }
            <div className="container-middle middlepanel">
                <div className="w-50">
                    <ModalLargerComponent imgAlt={image.imgAlt} image={image.img} />
                    <Img
                        src={contents.roomImg1 ? contents.roomImg1 : NoImage}
                        alt={contents.roomImg1Alt}
                        width={"10%"} height={"50px"}
                        onClick={() => handleViewLarger(contents.roomImg1, contents.roomImg1Alt)} />
                    <Img
                        src={contents.roomImg2 ? contents.roomImg2 : NoImage}
                        alt={contents.roomImg2Alt}
                        width={"10%"} height={"50px"}
                        onClick={() => handleViewLarger(contents.roomImg2, contents.roomImg2Alt)} />
                    <Img
                        src={contents.roomImg3 ? contents.roomImg3 : NoImage}
                        alt={contents.roomImg3Alt}
                        width={"10%"} height={"50px"}
                        onClick={() => handleViewLarger(contents.roomImg3, contents.roomImg3Alt)} />
                    <Img
                        src={contents.roomImg4 ? contents.roomImg4 : NoImage}
                        alt={contents.roomImg4Alt}
                        width={"10%"} height={"50px"}
                        onClick={() => handleViewLarger(contents.roomImg4, contents.roomImg4Alt)} />
                </div>
                <div className="d-flex d-row" style={{ justifyContent: 'space-around' }} >
                    <div className="d-flex" style={{ gap: '10px' }}>
                        <p>성수기 주중</p>
                        <h3 style={{ margin: '0 0 0 10px' }}>
                            {
                                cost === 0 ? <span>{contents.roomintro}</span> :
                                    <span>{cost.toLocaleString()}원</span>
                            }</h3>
                    </div>
                    <div>
                        <Datepicker depTime={depTime} handleDateChange={handleDateChange} />
                        <button className="btn btn-style-reserve" onClick={() => handleOpenCloseData(contents)}>
                            예약하러 가기
                        </button>
                    </div>
                </div>
                <table className="w-50 table-list" style={{ marginTop: '40px' }}>
                    <tbody>
                        <tr>
                            <td>객실명</td>
                            <td>{contents.roomtitle}</td>
                        </tr>
                        <tr>
                            <td>객실크기</td>
                            <td>{contents.roomsize}평 ({contents.roomsize2}㎡)</td>
                        </tr>
                        <tr>
                            <td>기준인원</td>
                            <td>{contents.roombasecount} ~ {contents.roommaxcount}</td>
                        </tr>
                        <tr>
                            <td>비수기 금액</td>
                            <td>{contents.roomoffseasonminfee1} ~ {contents.roomoffseasonminfee2} 원</td>
                        </tr>
                        <tr>
                            <td>성수기 금액</td>
                            <td>{contents.roompeakSeasonMinfee1} ~ {contents.roompeakseasonminfee2} 원</td>
                        </tr>
                        <tr>
                            <td>TV</td>
                            <td>{contents.roomtv}</td>
                        </tr>
                        <tr>
                            <td>인터넷</td>
                            <td>{contents.roominternet}</td>
                        </tr>
                        <tr>
                            <td>냉장고</td>
                            <td>{contents.roomrefrigerator}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default DetailRoomInfo;