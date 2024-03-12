import React, { useState, useEffect } from 'react';
import NoImage from '../../../styles/image/noImage.png';

const { kakao } = window;

/** 공통정보 */
const DetailPublicInfo = ({ contents }) => {
    console.log(contents);
    /** 지도 api */
    useEffect(() => {
        if (!contents.mapx || !contents.mapy) return; // mapx와 mapy 값이 없다면 함수 실행 중지
        var container = document.getElementById('map');
        var options = {
            center: new kakao.maps.LatLng(contents.mapy, contents.mapx),
            level: contents.mlevel ? contents.mlevel : 3
        };

        var map = new kakao.maps.Map(container, options);
        var markerPosition = new kakao.maps.LatLng(contents.mapy, contents.mapx);
        var marker = new kakao.maps.Marker({
            position: markerPosition
        });
        marker.setMap(map);

    }, [contents.mapx, contents.mapy]);


    return (
        <div className="container">

            <div className="container-middle middlepanel">
                <div className="w-50">
                    <p>{contents.overview}</p>
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
                            <td><a href={contents.reserveationurl}>{contents.reserveationurl}</a></td>
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
            </div>
        </div>
    )
}


export default DetailPublicInfo;