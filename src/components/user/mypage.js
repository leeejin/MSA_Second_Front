import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Box, TextField, Container } from '@mui/material';
import axios from 'axios';
import store from '../../util/redux_storage';
export default function MyPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴
    const [nickname, setNickname] = useState(store.getState().nickname); //리덕스에 있는 nickname를 가져옴

    console.log("변경")
    return (
        <Container>
            <h1>{nickname}님의 마이페이지</h1>
        </Container>
    )
}