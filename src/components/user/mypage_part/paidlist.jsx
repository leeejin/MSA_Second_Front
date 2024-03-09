import React, { useState, useReducer } from 'react';
import axios from '../../../axiosInstance';
import Constant from '../../../util/constant_variables';
import ModalComponent from '../../../util/modal';
import Plane from '../../../styles/image/plane.png'
import Spinner from '../../../styles/image/loading.gif';
import NoData from '../../../styles/image/noData.png';
import { reducer, ERROR_STATE, Alert } from '../../../util/alert';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { useSelector } from 'react-redux';
const logos = Constant.getLogos();

/** 결제한 목록을 보여주는 함수 */
const PaidList=()=> {
    const queryClient = useQueryClient();
    const userId = useSelector((state) => state.userId); //리덕스에 있는 userId를 가져옴
    const [open, setOpen] = useState(false); // 취소모달창
    const [contents, setContents] = useState([]); //백엔드로부터 받은 예약목록 리스트를 여기다가 저장
    const [selectedData, setSelectedData] = useState({}); //선택한 컴포넌트 객체
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지

    const { isLoading } = useQuery('bookedList', callGetBookedListAPI, {
        onError: () => {
            handleError('listError', true);
        },
        onSuccess: (data) => {
            setContents(data);
        }
    });
    /** 경고 메시지 */
    const handleError = (errorType, hasError) => {
        errorDispatch({ type: errorType, [errorType]: hasError });

        setTimeout(() => {
            errorDispatch({ type: 'error' });
        }, 1000);
    }
    /** 결제확인 함수 */
    const handleOpenClose = () => {
        setOpen(prev => !prev); //결재취소 확인 모달창 띄움
    };
    const handleOpenCloseData = (data) => {
        setOpen(prev => !prev); //결재취소 확인 모달창 띄움
        setSelectedData(data); //선택한 데이터의 객체 저장
    };
    const mutation = useMutation(cancelPayment, {
        onError: (error) => {
            setOpen(prev => !prev);
            handleError('cancelError', true);
        },
        onSuccess: async () => {
            // 결제 취소 후 새로운 결제 목록을 불러옵니다.
            await queryClient.invalidateQueries('bookedList');
            setOpen(prev => !prev);
            handleError('cancelSuccess', true);
            window.location.reload();
        },
        onSettled: (data) => {
            setContents(data);
        }
    });

    /** 결제취소 함수 */
    const handleSubmit = () => {
        console.log("선택한 데이터 : ", selectedData);
        mutation.mutate(selectedData.reservationId); // 결제 취소 요청
    }

    /** 예약 목록 불러오는 API */
    async function callGetBookedListAPI() {
        try {
            const response = await axios.post(Constant.serviceURL + `/flightInfos`, { userId });
            return response.data;
        } catch (error) {
            console.error(error);
        }

    }
    /**결제 취소 요청 함수  */
    async function cancelPayment(merchant_uid) {
        try {
            await axios.post(Constant.serviceURL + `/payments/cancel`, { merchant_uid }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Failed to notify payment cancellation', error);
        }
    };

    return (
        <div className="container">
            <Alert errorMessage={errorMessage} />
            {
                open && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={() => handleOpenClose(selectedData)} message={"결제취소 하시겠습니까?"} />
            }
            <div className="w-50">
                {
                    isLoading ? <div className="fixed d-flex container-fixed">
                        <img src={Spinner} alt="로딩" width="100px" />
                    </div> : <>
                        {contents.length > 0 ? (
                            contents.map((paidlist) => (
                                <PaidListItem key={paidlist.reservationId} paidlist={paidlist} handleOpenCloseData={() => handleOpenCloseData(paidlist)} />
                            ))
                        ) : (
                            <div className="container-content">
                                <div className=" d-flex d-column" style={{ height: '100%' }}>
                                    <img src={NoData} alt="데이터없음" />
                                    <h3>최근 결제된 내역이 없어요!</h3>
                                </div>
                            </div>
                        )}</>
                }


            </div>
        </div>
    )
}

/** 결제 목록 리스트 아이템 */
const PaidListItem = ({ paidlist, handleOpenCloseData }) => {

    return (
        <table className="table-list-card">
            <thead>
                <tr>
                    <th>편명 <span className="font-color-darkgrey">Flight</span></th>
                    <th >출발 <span className="font-color-darkgrey">From</span></th>
                    <th />
                    <th>도착 <span className="font-color-darkgrey">To</span></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <img src={Constant.getAirlineLogo(logos, paidlist.airLine)} width={"130px"} alt={paidlist.airlineNm} />
                        <h3>{paidlist.airLine}</h3>
                        <p>{paidlist.vihicleId}</p>
                    </td>
                    <td>
                        <h1 className="font-color-special">{Constant.getAirportNmById(paidlist.depAirport)}</h1>
                        <p>{Constant.handleDateFormatChange(paidlist.depTime)}</p>

                    </td>
                    <td>
                        <img src={Plane} width={'40px'} alt="비행기" />
                    </td>
                    <td>
                        <h1 className="font-color-special">{Constant.getAirportNmById(paidlist.arrAirport)}</h1>
                        <p>{Constant.handleDateFormatChange(paidlist.arrTime)}</p>
                    </td>
                </tr>
                <tr>
                    <td >
                        <h2 className="font-family-extrabold">₩ {paidlist.charge.toLocaleString()}</h2>
                    </td>
                    <td>
                        <p>{paidlist.status}</p>
                    </td>
                    <td colSpan={2}>
                        {
                            paidlist.status === "예약취소" ? null : <button className="btn btn-style-grey" onClick={() => handleOpenCloseData(paidlist)}>취소</button>
                        }

                    </td>
                </tr>
            </tbody>

        </table>

    )
}

export default PaidList;