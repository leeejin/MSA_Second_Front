import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #1976d2',
    borderRadius: '10px',
    boxShadow: 24,
    p: 4,
};

const ModalComponent = ({ subOpen, message, handleSubmit, handleOpenClose }) => {
    const navigate = useNavigate();

    const [messageConfirm, setMessageConfirm] = useState(false);

    const handleConfirm = () => {
        setMessageConfirm(true);
        if (messageConfirm) {
            handleSubmit();
        }
    };
    const handleModalVisible = () => {
        handleOpenClose();
    };
    return (
        <div className="black-wrap" onClick={handleModalVisible}>
            <div>
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