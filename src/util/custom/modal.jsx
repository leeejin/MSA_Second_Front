import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export const ModalComponent = ({ message, handleSubmit, handleOpenClose }) => {
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style = `overflow: hidden`;
        return () => document.body.style = `overflow: auto`
    }, [])

    return (
        <>
            <div className="modal black-wrap" onClick={handleOpenClose} />
            <div className="modal white-wrap" style={{ width: '300px' }}>
                <h2>{message}</h2>
                <div>
                    <button className="btn btn-style-confirm" onClick={handleSubmit} >예</button>
                    <button className="btn btn-style-grey" onClick={handleOpenClose} >아니오</button>
                </div>
            </div>
        </>
    );
};

export const ConfirmComponent = ({ message, handleSubmit, handleOpenClose }) => {
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style = `overflow: hidden`;
        return () => document.body.style = `overflow: auto`
    }, [])
//회원가입이 성공적으로 완료되었습니다! 로그인 페이지로 가시겠습니까?
    return (
        <>
            <div className="modal black-wrap" onClick={handleOpenClose} />
            <div className="modal white-wrap" style={{ width: '300px' }}>

            
                <div>
                    <h2>{message}</h2>
                    <button className="btn btn-style-confirm" onClick={handleSubmit}>예</button>
                </div>

            </div>
        </>
    );
};