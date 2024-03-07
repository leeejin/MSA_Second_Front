import React, { useState, useReducer, useEffect } from 'react';
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
const { kakao } = window;
/** 예약확인 목록 페이지 */
export default function ModalRoomsReserveCheck() {
    const location = useLocation();
    const { contents } = location.state ?? {};
    const [larger, setLarger] = useState(false); //사진 크게 보기

    /** 지도 api */
    useEffect(() => {
        var container = document.getElementById('map');
        var options = {
            center: new kakao.maps.LatLng(contents.mapx, contents.mapy),
            level:contents.mlevel ? contents.mlevel : 3
        };

        var map = new kakao.maps.Map(container, options);
        var markerPosition = new kakao.maps.LatLng(contents.mapx, contents.mapy);
        var marker = new kakao.maps.Marker({
            position: markerPosition
        });
        marker.setMap(map);

    }, [])
    const handleViewLarger = (() => {
        setLarger(prev => !prev);
    });
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
                <div className="container-middle middlepanel" style={{ height: '1370px' }}>
                    <InfoComponent contents={contents}  handleViewLarger={handleViewLarger} />
                </div>

            </div>
        )
    }

};

const InfoComponent = ({ contents, handleViewLarger }) => {
    return (
        <>
            <div className="w-50">
                <h2>{contents.title}</h2>
                <p className="font-color-darkgrey">{contents.addr1}</p>
                <p className="font-color-darkgrey">{contents.addr2}</p>
                <p className="font-color-darkgrey"><IoCall /> {contents.tel}</p>

                <Hr />
                <p>{contents.overview}</p>
                {/* <div className="d-flex d-row" style={{ justifyContent: 'space-around' }} >
                    <div className="d-flex" style={{ gap: '10px' }}>
                        <p>가격</p>
                        <h3 style={{ margin: '0 0 0 10px' }}>{contents.charge} 원</h3>
                    </div>
                    <div>
                        <button className="btn btn-style-reserve" onClick={handleOpenClose}>
                            예약하러 가기
                        </button>
                    </div>
                </div> */}
            </div>

            <Hr />
            <div>
                <Img
                    src={contents.firstimage ? contents.firstimage : NoImage}
                    alt={contents.title}
                    width={"100%"} height={"400px"}
                    onClick={handleViewLarger} />
                <div id="map" style={{ width: '100%', height: '400px' }}></div>
            </div>
            <table className="w-50 table-list" style={{ marginTop: '50px' }}>
                <tbody>
                    <tr>
                        <td>체크인</td>
                        <td>{contents.checkintime}</td>
                    </tr>
                    <tr>
                        <td>체크아웃</td>
                        <td>{contents.checkouttime}</td>
                    </tr>
                    <tr>
                        <td>환불 규정</td>
                        <td>{contents.refundregulation}</td>
                    </tr>
                    <tr>
                        <td>주차</td>
                        <td>{contents.parkinglodging}</td>
                    </tr>
                    <tr>
                        <td>조리</td>
                        <td>{contents.chkcooking}</td>
                    </tr>
                    <tr>
                        <td>홈페이지</td>
                        <td><a href={contents.homepage}>{contents.homepage}</a></td>
                        </tr>
                </tbody>
            </table>

        </>
    )
}

/** 자세히 보기 */
const ModalLargerComponent = ({ title, firstimage, handleViewLarger }) => {
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