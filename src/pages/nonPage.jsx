import React from 'react';
import { useNavigate } from 'react-router-dom';
import nonPagelogo from './../styles/image/nonPage.png';
import styled from "styled-components";
import './../styles/main.css';
import './../styles/colors.css';
const Box = styled.div`
    width:100%;
    white-space: pre-line;
    text-align: center;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;
const Text = styled.p`
    margin: 0;
    line-height: 1.5;
    font-family: Pretendard-light;
`;
const Button = styled.button`
    margin:15px;
`;
export default function NonPage() {
    const navigate = useNavigate();
    const goBack = () => {
        navigate("/");
    };
    return (
        <Box>
            <img src={nonPagelogo} width={'200px'} />
            <h3 className="font-family-bold">요청한 페이지를 찾을 수 없습니다.</h3>
            <Text>존재하지 않는 주소를 입력하셨거나, <br />
                요청하신 페이지의 주소가 변경, 삭제되어 찾을 수 없습니다. <br />
                입력하신 주소가 정확한지 다시 한 번 확인해 주시기 바랍니다.</ Text>
            <Button className="btn btn-style-grey" onClick={goBack}>메인</Button>
        </Box>
    );
}