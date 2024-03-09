import React, { useState } from 'react';
import styled from "styled-components";
import { IoCall } from "react-icons/io5";
import NoImage from '../../../styles/image/noImage.png';
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
/** 공통정보 */
const DetailPublicInfo=({ contents })=> {

    const [larger, setLarger] = useState(false); //사진 크게 보기
    /** 자세히 보기 */
    const handleViewLarger = (() => {
        setLarger(prev => !prev);
    });

    return (
        <div className="container">
           {
                larger && <ModalLargerComponent title={contents.title} firstimage={contents.firstimage} handleViewLarger={handleViewLarger} />
            }
            <div className="container-middle middlepanel">
                <InfoComponent contents={contents} handleViewLarger={handleViewLarger} />
            </div>
        </div>
    )
}
const InfoComponent = ({ contents, handleViewLarger }) => {
    return (
        <>
            <div className="w-50">
                <h2>{contents.title}</h2>
                <p className="font-color-darkgrey">{contents.addr1}</p>
                <p className="font-color-darkgrey">{contents.addr2}</p>
                <p className="font-color-darkgrey"><IoCall /> {contents.tel}</p>

                <Hr />
                <Img
                    src={contents.firstimage ? contents.firstimage : NoImage}
                    alt={contents.title}
                    width={"100%"} height={"400px"}
                    onClick={handleViewLarger} />
            </div>

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
export default DetailPublicInfo;