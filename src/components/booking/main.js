import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Box, TextField, Container, FormControl, Select, MenuItem, Alert } from '@mui/material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CodeIcon from '@mui/icons-material/Code';
import AirPort from '../../util/json/airport-list';
import AirLine from '../../util/json/airline-list';
// import DatePicker from 'react-datepicker';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
export default function Main() {
    const navigate = useNavigate();
    const airport = AirPort.response.body.items.item; // 공항 목록
    const airLine = AirLine.response.body.items.item; // 항공사
    const [chooseAirLine, setChooseAirLine] = useState(AirLine.response.body.items.item[0].airlineId);
    const [depAirPort, setDepAirPort] = useState(AirPort.response.body.items.item[0].airportId); // 출발지
    const [arrAirPort, setArrAirPort] = useState(AirPort.response.body.items.item[1].airportId); // 도착지

    const tomorrow = dayjs().add(1, 'day'); // 오늘 날짜의 다음 날을 계산합니다.
    const [startDate, setStartDate] = useState(tomorrow); // 출발날짜는 항상 오늘날짜의 다음날부터
    const [cost, setCost] = useState(0); // 가격

    const [errorMessage, setErrorMessage] = useState(false);
    // 출발지 변경 핸들러
    const handleDepAirPortChange = (event) => {
        setDepAirPort(event.target.value);
    };
    //도착지 변경 핸들러
    const handleArrAirPortChange = (event) => {
        setArrAirPort(event.target.value);
    };
    //항공사 변경 핸들러
    const handleChooseAirLineChange = (event) => {
        setChooseAirLine(event.target.value);
    };
    //출발 날짜 핸들러
    const handleDateChange = (date) => {
        setStartDate(date);
    }
    //출발지랑 도착지 리버스 핸들러
    const handleAirPortReverse = () => {
        setDepAirPort(arrAirPort);
        setArrAirPort(depAirPort);
    }
    //결제 핸들러
    const handlePay = () => {
        //에러모음
        let errors = {
            locationError: depAirPort === arrAirPort
        }
        if (!errors.locationError) {
            setErrorMessage(false);
            navigate('/PayCheck');
            //결제 버튼 눌렀을 때 로직 짜야함
        } else {
            setErrorMessage(true);
        }
    }
    //출발지, 도착지, 항공사, 날짜
    return (
        <Container>
            {
                errorMessage && <Alert severity="error">출발지와 도착지가 같습니다</Alert>
            }
            <Box>
                <FormControl >
                    <label>출발지</label>
                    <Select
                        value={depAirPort}
                        onChange={handleDepAirPortChange}
                        size="small">
                        {airport.map((ap) => (
                            <MenuItem key={ap.airportId} value={ap.airportId}>
                                {ap.airportNm}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <CodeIcon className="reverseIcon" onClick={handleAirPortReverse} />

                <FormControl >
                    <label>도착지</label>
                    <Select
                        value={arrAirPort}
                        onChange={handleArrAirPortChange}
                        size="small">
                        {airport.map((ap) => (
                            <MenuItem key={ap.airportId} value={ap.airportId}>
                                {ap.airportNm}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>


            <FormControl >
                <label>항공사</label>
                <Select
                    value={chooseAirLine}
                    onChange={handleChooseAirLineChange}
                    size="small">
                    {airLine.map((ap) => (
                        <MenuItem key={ap.airlineId} value={ap.airlineId}>
                            {ap.airlineNm}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <DemoContainer components={['DatePicker']}>
                <DatePicker
                    format='YYYY-MM-DD'
                    showDaysOutsideCurrentMonth
                    onChange={handleDateChange}
                    minDate={tomorrow}
                />
            </DemoContainer>

            <Button onClick={handlePay}>예약</Button>
        </Container>
    );
}