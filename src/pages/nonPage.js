import React from 'react';
import { useNavigate } from 'react-router-dom';
import nonPagelogo from '../styles/image/nonPage.png';
import '../styles/main.css';

export default function NonPage() {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', 
        justifyContent: 'center', whiteSpace: 'pre-line', height: '100vh', textAlign: 'center' }}>
            <img src={nonPagelogo} width={'200px'} />
            <h3 style={{ fontFamily: 'Pretendard-Bold' }}>요청한 페이지를 찾을 수 없습니다.</h3>
                <p style={{ margin: 0, lineHeight: '1.5', fontFamily: 'Pretendard-Bold'}}>존재하지 않는 주소를 입력하셨거나,</p>
                <p style={{ margin: 0, lineHeight: '1.5', fontFamily: 'Pretendard-Bold'}}>요청하신 페이지의 주소가 변경, 삭제되어 찾을 수 없습니다.</p> 
                <p style={{ margin: 0, lineHeight: '1.5', fontFamily: 'Pretendard-Bold'}}>입력하신 주소가 정확한지 다시 한 번 확인해 주시기 바랍니다.</p>
            <button onClick={goBack} className="btn nav-item" style={{ marginTop: '20px'  }}>뒤로가기</button>
        </div>
    );
}