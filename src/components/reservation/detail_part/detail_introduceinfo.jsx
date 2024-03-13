import React,{useState,useEffect} from 'react';

/** 소개정보 */
const DetailIntroduceInfo = ({ contentid }) => {
    const [contents, setContents] = useState({});
    useEffect(() => {
        getAccommodationIntroduceReserveAPI().then((response) => {
            setContents(response);
        });
    }, [])
    /** 숙소디테일 데이터 불러오는 함수 페이지 로드 될 때 실행 */
    async function getAccommodationIntroduceReserveAPI() {

        try {
            //const response = await axios.get(Constant.serviceURL + `/lodgings/searchIntro/${contentid}`);

            return {
                id: 1,
                contentid: 2465071,
                contenttypeid: 32,
                roomcount: "2",
                roomtype: "한실",
                refundregulation: "7일전 100%, 3일전 50%, 2일전~당일 환불 불가",
                checkintime: "16:00",
                checkouttime: "10:00",
                chkcooking: "불가",
                parkinglodging: "가능"
            };
        } catch (error) {
            console.error(error);
        }

    }
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
                            <td>타입</td>
                            <td>{contents.roomtype}</td>
                        </tr>
                        <tr>
                            <td>방 개수</td>
                            <td>{contents.roomcount}</td>
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