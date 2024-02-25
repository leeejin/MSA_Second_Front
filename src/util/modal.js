import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ModalComponent = ({ subOpen, message, handleSubmit, handleOpenClose, handleSignup }) => {
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style = `overflow: hidden`;
        return () => document.body.style = `overflow: auto`
    }, [])

    return (
        <div>
            <div className="black-wrap" onClick={handleOpenClose} />
            <div className="white-wrap">

                {subOpen === true ? (
                    <div>
                        <h2>회원가입이 성공적으로 완료되었습니다! 로그인 페이지로 가시겠습니까?</h2>
                        <button className="btn btn-style-confirm" onClick={handleSignup}>예</button>
                    </div>
                ) : <>
                    <h2>{message}</h2>
                    <div>
                        <button className="btn btn-style-confirm" onClick={handleSubmit} >예</button>
                        <button className="btn btn-style-grey" onClick={handleOpenClose} >아니오</button>
                    </div>
                </>
                }
            </div>
        </div>
    );
};

export default ModalComponent;