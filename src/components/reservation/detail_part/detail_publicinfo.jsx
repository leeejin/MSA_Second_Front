import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import NoImage from '../../../styles/image/noImage.png';
const Hr = styled.hr`
    width:49px;
    border:1px solid var(--grey-color);
    transform: rotate(-90deg);
    margin-top:40px;
    margin-bottom:40px;
`;

const { kakao } = window;

/** 공통정보 */
const DetailPublicInfo = ({ contents }) => {

    /** 지도 api */
    useEffect(() => {
        var container = document.getElementById('map');
        var options = {
            center: new kakao.maps.LatLng(contents.mapx, contents.mapy),
            level: contents.mlevel ? contents.mlevel : 3
        };

        var map = new kakao.maps.Map(container, options);
        var markerPosition = new kakao.maps.LatLng(contents.mapx, contents.mapy);
        var marker = new kakao.maps.Marker({
            position: markerPosition
        });
        marker.setMap(map);

    }, []);


    return (
        <div className="container">

            <div className="container-middle middlepanel">
                <InfoComponent contents={contents} />
            </div>
        </div>
    )
}
const InfoComponent = ({ contents }) => {
    return (
        <>
            <div className="w-50">
                <h2>{contents.overview}</h2>
                <div className="d-flex d-row" style={{ justifyContent: 'space-between' }}>
                    <img
                        src={contents.firstimage ? contents.firstimage : NoImage}
                        alt={contents.title}
                        width={"58%"} height={"400px"} />
                    <div id="map" style={{ width: '38%', height: '400px' }}></div>
                </div>
            </div>
            <table className="w-50 table-list" style={{ marginTop: '40px' }}>
                <tbody>
                    <tr>
                        <td>우편번호</td>
                        <td>{contents.zipcode}</td>
                    </tr>
                    <tr>
                        <td>전화명</td>
                        <td>{contents.telname}</td>
                    </tr>
                    <tr>
                        <td>전화번호</td>
                        <td>{contents.tel}</td>
                    </tr>
                    <tr>
                        <td>홈페이지</td>
                        <td><a href={contents.homepage}>{contents.homepage}</a></td>
                    </tr>
                    <tr>
                        <td>주소</td>
                        <td>
                            <p>{contents.addr1}</p>
                            <p>{contents.addr2}</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}


export default DetailPublicInfo;