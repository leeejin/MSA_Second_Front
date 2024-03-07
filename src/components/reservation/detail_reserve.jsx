import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import styled from "styled-components";
import { IoCall } from "react-icons/io5";
import NoImage from '../../styles/image/noImage.png';
const Hr = styled.hr`
    width:49px;
    border:1px solid var(--grey-color);
    transform: rotate(-90deg);
    margin-top:40px;
    margin-bottom:40px;
`;
const Img = styled.img`
    cursor:pointer;
`;
/** 예약확인 목록 페이지 */
export default function ModalRoomsReserveCheck() {
    const location = useLocation();

    const { contents } = location.state ?? {};
    const [open, setOpen] = useState(false); // 예약모달창
    const [larger, setLarger] = useState(false); //사진 크게 보기
    /** 예약확인 함수 */
    const handleOpenClose = (() => {
        setOpen(prev => !prev);
    });
    const handleViewLarger = (() => {
        setLarger(prev => !prev);
    })
    if (!location.state) {
        return (<Navigate to="*" />)
    }
    else {
        return (
            <div className="container" style={{ textAlign: 'center' }}>
                {
                    larger && <ModalLargerComponent title={contents.title} firstimage={contents.firstimage} handleViewLarger={handleViewLarger} />
                }
                <div className="container-top" style={{ height: '200px', marginTop: '60px' }}>
                    <div className="panel panel-top font-color-white" >
                        <div>
                            <h1 className="font-family-bold">숙소 검색</h1>
                        </div>
                    </div>
                </div>
                <div className="container-middle middlepanel" style={{ height: '1000px' }}>
                    <InfoComponent contents={contents} handleOpenClose={handleOpenClose} handleViewLarger={handleViewLarger} />
                </div>

            </div>
        )
    }

};

const InfoComponent = ({ contents, handleOpenClose, handleViewLarger }) => {
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
                    <div className="d-flex" style={{ gap: '10px' }}>
                        <p>가격</p>
                        <h3 style={{ margin: '0 0 0 10px' }}>{contents.charge} 원</h3>
                    </div>
                    <div>
                        <button className="btn btn-style-reserve" onClick={handleOpenClose}>
                            예약하러 가기
                        </button>
                    </div>
                </div>
            </div>

            <Hr />
            <div>
                <Img
                    src={contents.firstimage ? contents.firstimage : NoImage}
                    alt={contents.title}
                    width={"100%"} height={"400px"}
                    onClick={handleViewLarger} />
            </div>
            <table className="w-50 table-list" style={{ marginTop: '50px' }}>
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
                        <td>예약 전날 까지 100%</td>
                    </tr>
                    <tr>
                        <td>반려동물 동반</td>
                        <td>가능</td>
                    </tr>
                    <tr>
                        <td>주차</td>
                        <td>가능</td>
                    </tr>
                    <tr>
                        <td>조리</td>
                        <td>가능</td>
                    </tr>

                </tbody>
            </table>

        </>
    )
}

/** 자세히 보기 */ 
const ModalLargerComponent = ({ title,firstimage, handleViewLarger }) => {
    return (
        <>
            <div className="modal black-wrap" onClick={handleViewLarger} />
            <div className="modal white-wrap" style={{ width: '80%' }}>
                <img
                    src={firstimage ? firstimage : NoImage}
                    alt={title}
                    width={"100%"} height={"600px"}
                />
            </div>
        </>
    );
}