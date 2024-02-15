import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ModalComponent = ({ subOpen, message, handleSubmit, handleOpenClose ,handleSignup}) => {
    const navigate = useNavigate();
    
    useEffect(() => {
        document.body.style= `overflow: hidden`;
        return () => document.body.style = `overflow: auto`
      }, [])
      
    return (<div>
        <div className="black-wrap" onClick={handleOpenClose} />
        <div className="white-wrap">
            <div>{message}</div>
            <div>
                <button onClick={handleSubmit}>예</button>
                <button onClick={handleOpenClose}>아니오</button>
            </div>
            {subOpen === true && (
                <div>
                    <p>회원가입이 성공적으로 완료되었습니다! 로그인 페이지로 가시겠습니까?</p>
                    <p>
                        <button onClick={handleSignup}>예</button>
                    </p>
                </div>
            )}
        </div>

    </div>

    );
};

export default ModalComponent;