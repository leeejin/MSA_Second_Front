import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
export default function AIRAPI() {
    // 상태를 관리하기 위한 useState 훅을 사용합니다. 초기 상태는 null입니다.
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true); //로딩
    // 컴포넌트가 마운트되었을 때 실행되는 useEffect 훅을 사용합니다.
    useEffect(() => {
        setLoading(true);
        // API 엔드포인트 URL입니다.
        const url = '/1613000/DmstcFlightNvgInfoService/getFlightOpratInfoList';
        // API 호출에 필요한 파라미터들을 객체로 정의합니다.
        const params = {
            serviceKey: 'O+0DdibyeRPwjChz+qSJN/EurIanim0THVar8SxizDrSwO9bDs+JWH5YxshTVo5qudULTKjhTOOUyxZSrjD9oQ==',  // 서비스 키입니다. OpenAPI를 사용하기 위해 발급받은 키를 입력합니다.
            pageNo: '1',     // 조회할 페이지 번호를 지정합니다.
            numOfRows: '10',  // 한 페이지에 표시할 항목의 수를 지정합니다.
            _type: 'json',   // JSON 형식으로 응답을 받습니다.
            depAirportId: 'NAARKJJ', // 출발 공항의 ID입니다. 여기서는 김포공항(NAARKJJ)을 출발 공항으로 지정하였습니다.
            arrAirportId: 'NAARKPC', // 도착 공항의 ID입니다. 여기서는 제주공항(NAARKPC)을 도착 공항으로 지정하였습니다.
            depPlandTime: '20240206', // 출발 계획 시간입니다. 여기서는 2024년 2월 6일을 출발 계획 시간으로 지정하였습니다.
            airlineId: 'AAR', // 항공사의 ID입니다. 여기서는 아시아나항공(AAR)을 항공사로 지정하였습니다.
        };

        // axios.get 함수로 GET 요청을 보냅니다. 두 번째 인자로 파라미터를 전달합니다.
        axios.get(url, { params })
            .then(response => {
                // 요청이 성공하면 응답 데이터를 콘솔에 출력하고, 상태를 업데이트합니다.
                // 이 데이터는 화면에 출력될 항공편 정보입니다.
                console.log(response);
                setData(response.data.response.body.items.item);
                setLoading(false);
            })
            .catch(error => {
                // 요청이 실패하면 오류 메시지를 콘솔에 출력합니다.
                console.error('Error:', error);
                setLoading(false);
            });
    }, []); // 의존성 배열이 비어 있으므로, 이 훅은 컴포넌트가 마운트될 때 한 번만 실행됩니다.

    // 컴포넌트가 렌더링하는 JSX입니다. data 상태가 null이 아니면 응답 데이터를 출력합니다.
    return (
        <div>
            {
                loading ? <div className="loading"><CircularProgress /></div> : <> {data && data.map((flight, index) => (
                    <div key={index}>
                        {/* 각 항공편의 상세 정보를 출력합니다. */}
                        <p>Airline Name: {flight.airlineNm}</p>
                        <p>Arrival Airport: {flight.arrAirportNm}</p>
                        <p>Arrival Time: {flight.arrPlandTime}</p>
                        <p>Departure Airport: {flight.depAirportNm}</p>
                        <p>Departure Time: {flight.depPlandTime}</p>
                        <p>Economy Charge: {flight.economyCharge}</p>
                        <p>Prestige Charge: {flight.prestigeCharge}</p>
                        <p>Vehicle ID: {flight.vihicleId}</p>
                    </div>
                ))
                }
                </>
            }
        </div>
    );
}