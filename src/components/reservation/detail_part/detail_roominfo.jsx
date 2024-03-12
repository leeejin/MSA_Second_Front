import React, { useState, useReducer, useEffect } from 'react';
import styled from "styled-components";
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
/** 객실정보 */
const DetailRoomInfo = ({ contents }) => {
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
                <div className="w-50">
                    <Img
                        src={contents.firstimage ? contents.firstimage : NoImage}
                        alt={contents.title}
                        width={"100%"} height={"400px"}
                        onClick={handleViewLarger} />
                </div>
                <table className="w-50 table-list" style={{ marginTop: '40px' }}>
                    <tbody>
                        <tr>
                            <td>객실크기</td>
                            <td>와우!</td>
                        </tr>
                        <tr>
                            <td>기준인원</td>
                            <td>와우!!</td>
                        </tr>
                        <tr>
                            <td>비수기주중최소</td>
                            <td>{contents.charge1.toLocaleString()}원</td>
                        </tr>
                        <tr>
                            <td>비수기주말최소</td>
                            <td>{contents.charge2.toLocaleString()}원</td>
                        </tr>
                        <tr>
                            <td>TV</td>
                            <td>와우!!!</td>
                        </tr>
                        <tr>
                            <td>인터넷</td>
                            <td>와우!!!!</td>
                        </tr>
                        <tr>
                            <td>냉장고</td>
                            <td>와우!!!!!</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
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
export default DetailRoomInfo;