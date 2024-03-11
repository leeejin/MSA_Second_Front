import React from 'react';

/** 소개정보 */
const DetailIntroduceInfo = ({ contents }) => {

    return (
        <div className="container">
            <div className="container-middle middlepanel">
            <table className="w-50 table-list">
            <tbody>
                <tr>
                    <td>체크인 시간</td>
                    <td>{contents.checkintime}</td>
                </tr>
                <tr>
                    <td>체크아웃 시간</td>
                    <td>{contents.checkouttime}</td>
                </tr>
                <tr>
                    <td>주차가능 여부</td>
                    <td>{contents.parkinglodging}</td>
                </tr>
                <tr>
                    <td>조리가능 여부</td>
                    <td>{contents.chkcooking}</td>
                </tr>
                <tr>
                    <td>환불 규정</td>
                    <td>{contents.refundregulation}</td>
                </tr>
            </tbody>
        </table>
            </div>
        </div>
    )
}

export default DetailIntroduceInfo;