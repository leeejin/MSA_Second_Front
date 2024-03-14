import React, { useState, useEffect } from 'react';
import NoImage from '../../../styles/image/noImage.png';
import axios from '../../../axiosInstance';
import Constant from '../../../util/constant_variables';
import styled from 'styled-components';
const Wrapper = styled.div`
  position: relative;
  width:58%;
  height:400px; 
  cursor:pointer;
  // 호버 시 텍스트 표시
  &:hover::after {
    content: '로드뷰 보기';
    position: absolute;
    left:42%;
    bottom:50%;
    white-space: nowrap;
    padding: 5px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 12px;
    border-radius: 4px;
    pointer-events: none; // ::after 요소가 마우스 이벤트를 받지 않도록 설정
  }
`;
const { kakao } = window;

/** 공통정보 */
const DetailPublicInfo = ({ contentid }) => {
    const [contents, setContents] = useState({});

    useEffect(() => {
        getAccommodationPublicReserveAPI().then((response) => {
            setContents(response);
        });
    }, [])
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

    }, [contents?.mapx, contents?.mapy]);

    /** 로드뷰 켜는 함수 */
    const handleRoadView=()=>{
        window.open(`https://map.kakao.com/link/roadview/${contents.mapy},${contents.mapx}`, '_blank');
    }
    /** 숙소디테일 데이터 불러오는 함수 페이지 로드 될 때 실행 */
    async function getAccommodationPublicReserveAPI() {
        
        try {
            const response = await axios.get(Constant.serviceURL + `/lodgings/searchDetail/${contentid}`);
           
            return {
                id: response.data.id,
                contentid: response.data.contentid,
                contenttypeid: response.data.contenttypeid,
                createdtime: response.data.createdtime,
                title: response.data.title,
                modifiedtime: response.data.modifiedtime,
                tel: response.data.tel,
                telname: response.data.telname,
                homePage: response.data.homePage,
                firstimage: response.data.firstimage,
                firstimage2: response.data.firstimage2,
                areacode: response.data.areacode,
                sigungucode: response.data.sigungucode,
                addr1: response.data.addr1,
                addr2: response.data.addr2,
                mapx: response.data.mapx,
                mapy: response.data.mapy,
                overview: response.data.overview
            };
        } catch (error) {
            console.error(error);
        }

    }
    return (
        <div className="container">

            <div className="container-middle middlepanel">
                <div className="w-50">
                    <p>{contents.overview}</p>
                    <div className="d-flex d-row" style={{ justifyContent: 'space-between' }}>
                        <Wrapper>
                        <img
                            src={contents.firstimage ? contents.firstimage : NoImage}
                            alt={contents.title}
                            width={"100%"} height={"100%"} 
                            onClick={handleRoadView}/>
                        </Wrapper>
                        
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