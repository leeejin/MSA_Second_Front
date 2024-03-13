import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import NoImage from '../../../styles/image/noImage.png';
import axios from '../../../axiosInstance';
import Constant from '../../../util/constant_variables';
const Img = styled.img`
    cursor:pointer;
`;
/** 객실정보 */
const DetailRoomInfo = ({ contentid }) => {
    //const [larger, setLarger] = useState(false); //사진 크게 보기
    const [contents, setContents] = useState({});
    const [image, setImage] = useState({img: null, imgAlt: ''});
    useEffect(() => {
        getAccommodationRoomReserveAPI().then((response) => {
            setContents(response);
            
            setImage(prev=>({
                ...prev,
                img:response.roomImg1,
                imgAlt:response.roomImg1Alt
            }))
        });
    }, [])
    /** 자세히 보기 */
    const handleViewLarger = (img,imgAlt) => {
        setImage({ img: img, imgAlt: imgAlt });
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
    /** 숙소디테일 데이터 불러오는 함수 페이지 로드 될 때 실행 */
    async function getAccommodationRoomReserveAPI() {

        try {
            //const response = await axios.get(Constant.serviceURL + `/lodgings/searchDetail/${contentid}`);

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
                roomImg1Alt:"사진1 설명",
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


            <div className="container-middle middlepanel">
                <div className="w-50">
                    <ModalLargerComponent imgAlt={image.imgAlt} image={image.img} />
                    <Img
                        src={contents.roomImg1 ? contents.roomImg1 : NoImage}
                        alt={contents.roomImg1Alt}
                        width={"10%"} height={"50px"}
                        onClick={()=>handleViewLarger(contents.roomImg1,contents.roomImg1Alt)} />
                    <Img
                        src={contents.roomImg2 ? contents.roomImg2 : NoImage}
                        alt={contents.roomImg2Alt}
                        width={"10%"} height={"50px"}
                        onClick={()=>handleViewLarger(contents.roomImg2,contents.roomImg2Alt)} />
                    <Img
                        src={contents.roomImg3 ? contents.roomImg3 : NoImage}
                        alt={contents.roomImg3Alt}
                        width={"10%"} height={"50px"}
                        onClick={()=>handleViewLarger(contents.roomImg3,contents.roomImg3Alt)} />
                    <Img
                        src={contents.roomImg4 ? contents.roomImg4 : NoImage}
                        alt={contents.roomImg4Alt}
                        width={"10%"} height={"50px"}
                        onClick={()=>handleViewLarger(contents.roomImg4,contents.roomImg4Alt)} />
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