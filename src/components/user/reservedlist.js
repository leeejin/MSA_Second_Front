import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import store from '../../util/redux_storage';
import Constant from '../../util/constant_variables';
import ModalComponent from '../../util/modal';
import Plane from '../../styles/image/plane.png'
import styled from 'styled-components';
import Pagination from '../../util/pagenation';
import Spinner from '../../styles/image/loading.gif';

/** 티켓테이블 디자인 */
const TicketTable = styled.table`
    border-radius: 15px;
    padding: 5px;
    margin-bottom: 5px;
    background-color:var(--white-color);
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
    td{
        padding:5px;
    }
    tr:nth-child(1) td:nth-child(2) {
        border-left: 1px solid var(--grey-color);
    }
    
    tr:nth-child(1) {
        border-bottom: 1px solid var(--grey-color);
    }
`;
/** 결제한 목록을 보여주는 함수 */
export default function ReservedList() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴
    const [nickname, setNickname] = useState(store.getState().nickname); //리덕스에 있는 nickname를 가져옴
    const [open, setOpen] = useState({ pay: false, cancel: false }); // 취소모달창
    const [contents, setContents] = useState([]); //백엔드로부터 받은 예약목록 리스트를 여기다가 저장
    const [selectedData, setSelectedData] = useState([]) //선택한 컴포넌트 객체
    const [success, setSuccess] = useState({ pay: false, cancel: false }); // 예약,결제 성공 메시지

    const [payError, setPayError] = useState({ name: false, email: false, phone: false }); //결제 정보 에러 메시지
    const [payInfo, setPayInfo] = useState({ name: '', email: '', phone: '' }); //결제 정보
    const [payModalVisible, setPayModalVisible] = useState(false); //결제 정보 모달창
    //페이지네이션
    const itemCountPerPage = 2;//한페이지당 보여줄 아이템 갯수
    const pageCountPerPage = 5;//보여줄 페이지 갯수
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 (setCurrentPage()에서 변경됨)
    const [offset, setOffset] = useState(0); //현재페이지에서 시작할 item index
    useEffect(() => {
        const { IMP } = window;
        IMP.init('imp85467664');
    }, []);

    useEffect(() => {
        callGetReservedListAPI().then((response) => {
            setContents(response);
        }).catch((error) => {
            console.log("먼이유로 예약 목록 못받아옴");
        })
    }, [])
    /** 예약확인 함수 */
    const handleOpenClose = useCallback((data) => {
        setOpen(prev => ({ ...prev, cancel: !prev.cancel })); // 예약확인 모달창 띄움
        setSelectedData(data); // 선택한 데이터의 객체 저장
    }, []);
    /** 결제확인 함수 */
    const handleOpenCloseSecond = useCallback((data) => {
        setOpen(prev => ({ ...prev, pay: !prev.pay })); // 예약확인 모달창 띄움
        setSelectedData(data); // 선택한 데이터의 객체 저장
    }, []);
    /** 페이지네이션 함수 */
    const setCurrentPageFunc = (page) => {
        let lastOffset = (page - 1) * itemCountPerPage;
        setCurrentPage(page);
        setOffset(lastOffset);
    };

    /** 예약취소 함수 */
    const handleSubmit = async (id) => {
        try {
            await callPostReservedListAPI(id);
            // 결제 취소 후 새로운 결제 목록을 불러옵니다.
            const updatedContents = await callPostReservedListAPI();
            setContents(updatedContents);
            setOpen(prev => ({ ...prev, cancel: !prev.cancel }));

            setSuccess(prev => ({ ...prev, cancel: !prev.cancel }));
            setTimeout(() => {
                setSuccess(prev => ({ ...prev, cancel: !prev.cancel }));
            }, [1000])
        } catch (error) {
            console.log("예약 취소 중 오류 발생:", error);
            setOpen(prev => ({ ...prev, cancel: !prev.cancel }));
        }
    }
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
    /** 전화번호 - 넣기 */
    const autoHyphen2 = (target) => {
        target.value = target.value
            .replace(/[^0-9]/g, '')
            .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3")
            .replace(/(\-{1,2})$/g, "");
    };
    const handleInfoModal = () => {
        setOpen(false);
        setPayModalVisible(!payModalVisible);
    }
    /** 결제 함수 */
    const handlePay = async (reservedlist) => {
        const { IMP } = window;
        const merchant_uid = 1; // 이부분을 예약번호로 해야함!! 예약서비스에 저장된 예약번호와 동일(백엔드에서 예약하기할 때 예약번호를 보내줄예정)
        const amount = reservedlist.price;

        let errors = {
            emailError: payInfo.email === '' || !payInfo.email.match(/^[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/),
            nameError: payInfo.name.length < 2 || payInfo.name.length > 5,
            phoneError: !payInfo.phone.match(/^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4}$)/),
        }

        if (!errors.emailError && !errors.nameError && !errors.phoneError) {
            // 사전 검증 로직 추가: 서버에 결제 예정 금액 등록 요청
            await axios.post(Constant.serviceURL + `/payments/prepare`, {
                merchant_uid,
                amount
            });

            IMP.request_pay({
                pg: "kakaopay",
                pay_method: "card",
                merchant_uid,
                name: "항공예약",
                amount,
                buyer_email: payInfo.email,
                buyer_name: payInfo.name,
                buyer_tel: payInfo.phone,
            }, async rsp => {
                if (rsp.success) {
                    console.log('Payment succeeded');
                    // 결제 성공 시 결제 정보를 서버에 저장
                    const formData = {
                        imp_uid: rsp.imp_uid,
                        merchant_uid: rsp.merchant_uid,
                    }
                    try {
                        const response = await axios.post(Constant.serviceURL + `/payments/validate`, formData, {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        setSuccess(prev => ({ ...prev, pay: !prev.pay }));
                        setTimeout(() => {
                            setSuccess(prev => ({ ...prev, pay: !prev.pay }));
                        }, [1000])
                    } catch (error) {
                        console.error('Failed to save payment information', error);
                    }
                } else {
                    console.error(`Payment failed. Error: ${rsp.error_msg}`);
                }
                setOpen(prev => ({ ...prev, pay: false }));
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
    /** 예약 목록 불러오는 API */
    async function callGetReservedListAPI() {
        try {
            //const response = axios.get(Constant.serviceURL+`/예약목록`,{ withCredentials: true })
            return [{
                id: 1,
                price: 5000,
                vihicleId: "TW901",
                seatCapacity: null,
                airlineNm: "티웨이항공",
                arrAirportNm: "제주",
                depAirportNm: "광주",
                arrPlandTime: 202402151005,
                depPlandTime: 202402150915,
                status: '결제 전'
            }];
        } catch (error) {
            console.error(error);
        }

    }
    /** 예약 취소하는 API */
    async function callPostReservedListAPI(id) {
        try {
            const response = axios.delete(Constant.serviceURL + `예약URL/${id}`, { withCredentials: true })
            return response;
        } catch (error) {
            console.error(error);
        }

    }

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
                success.cancel && <h3 className="white-wrap message">예약취소가 완료되었습니다 !</h3>
            }
            {
                open.cancel && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"예약취소 하시겠습니까 ?"} />
            }
            {
                open.pay && <ModalComponent handleSubmit={handleInfoModal} handleOpenClose={handleOpenCloseSecond} message={"카카오페이로 결제 하시겠습니까 ?"} />
            }
            {
                payModalVisible && <InfoModalComponent handleChangeInfo={handleChangeInfo} handlePay={handlePay} handleInfoModal={handleInfoModal} autoHyphen2={autoHyphen2} />
            }
            <div className="componentContent">
                {
                    contents.map((reservedlist, i) => (
                        <ReservedListItem key={reservedlist.id} reservedlist={reservedlist} handleOpenCloseSecond={handleOpenCloseSecond} handleOpenClose={handleOpenClose} />
                    ))
                }
            </div>
            <div className="footer">
                {contents.length > 0 && (
                    <Pagination
                        itemCount={contents.length}
                        pageCountPerPage={pageCountPerPage}
                        itemCountPerPage={itemCountPerPage}
                        currentPage={currentPage}
                        clickListener={setCurrentPageFunc}
                    />
                )}
            </div>
        </div >
    )
}

/** 결제 목록 리스트 아이템 */
const ReservedListItem = ({ reservedlist, handleOpenClose, handleOpenCloseSecond }) => {

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
        <TicketTable>
            <tbody>
                <tr>
                    <td>
                        <h3>{reservedlist.airlineNm}</h3>
                        <p>{reservedlist.vihicleId}</p>
                    </td>
                    <td>
                        <h1 className="special-color">{reservedlist.depAirportNm}</h1>
                        <p >{handleChangeDate(reservedlist.depPlandTime)}</p>

                    </td>
                    <td>
                        <img src={Plane} width={'40px'} />
                    </td>
                    <td>
                        <h1 className="special-color">{reservedlist.arrAirportNm}</h1>
                        <p>{handleChangeDate(reservedlist.arrPlandTime)}</p>
                    </td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <h2>₩ {reservedlist.price.toLocaleString()}</h2>
                    </td>
                    <td colSpan={2}>

                        {reservedlist.status === '결제 전' && <button className="handle-button-modal handle-button-confirmstyle-modal" onClick={() => handleOpenCloseSecond(reservedlist.id)}>결제</button>}
                        <button className="handle-button-modal handle-button-cancelstyle-modal" onClick={() => handleOpenClose(reservedlist.id)}>취소</button>
                    </td>
                </tr>
            </tbody>

        </TicketTable>

    )
}

/** 결제 확인 모달창 */
const InfoModalComponent = ({ handleChangeInfo, handlePay, handleInfoModal, autoHyphen2 }) => {
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
                    type=""
                    placeholder="010-0000-0000"
                    onChange={(e) => handleChangeInfo("phone", e)}
                    onBlur={(e) => autoHyphen2(e.target)}
                />
                <div>
                    <button onClick={handlePay}>확인</button>
                    <button onClick={handleInfoModal}>취소</button>
                </div>

            </div>
        </>



    )
}