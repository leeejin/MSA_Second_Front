import React, { useState, useEffect } from 'react';
import AIRAPI from '../../util/airAPI';
import axios from 'axios';
import { Container } from '@mui/material';

export default function Main() {
    const [airName,setAirName] = useState(''); //항공사명
    const [arrivalPort,setArrivalPort] = useState(''); //도착공항
    const [arrivalTime,setArrivalTime] = useState(''); //도착시간
    const [depAir,setDepAir] = useState(''); //출발공항
    const [depTime,setDepTime] = useState(''); //출발시간
    const [economyCharge,setEconomyCharge] = useState(0); //경제요금
    const [prestiCharge,setPrestiCharge] = useState(0); //프레스티지 요금
    const [vegicleID,setVehicleID] = useState(''); //차량 ID


    return (
        <Container>
           <AIRAPI />
        </Container>
    );
}