import React from 'react';
import { useNavigate } from 'react-router-dom';
import nonPagelogo from '../styles/image/nonPage.png';

export default function NonPage() {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };
    return (
        <div>
            <img src={nonPagelogo} width={'400px'} />
            <h1>잘못된 경로입니다.</h1>
            <button onClick={goBack}>뒤로가기</button>
        </div>
    );
}