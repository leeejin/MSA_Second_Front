import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ModalComponent = ({ subOpen, message, handleSubmit, handleOpenClose }) => {
    const navigate = useNavigate();

    const handleConfirm = () => {
        handleSubmit();
    };
    const handleModalVisible = () => {
        handleOpenClose();
    };
    return (<div>
     <div className="black-wrap" onClick={handleModalVisible} />
            <div className="white-wrap">
                <div>{message}</div>
                <div id="modal-modal-description" sx={{ mt: 2, textAlign: 'center' }}>
                    <button onClick={handleConfirm}>예</button>
                    <button sx={{ color: 'gray' }} onClick={handleModalVisible}>아니오</button>
                </div>
                {subOpen === true && (
                    <div>
                        <p>회원가입이 성공적으로 완료되었습니다! 로그인 페이지로 가시겠습니까?</p>
                        <p>
                            <button onClick={() => { navigate('/') }}>예</button>
                        </p>
                    </div>
                )}
            </div>
       
    </div>
       
    );
};

export default ModalComponent;