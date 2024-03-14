import React, { useState, useEffect, useCallback, useReducer, useMemo, useRef } from 'react';
import axios from '../../axiosInstance';
import { useNavigate, Navigate, Link, useLocation } from 'react-router-dom';
import Constant from '../../util/constant_variables';
import styled from "styled-components";
import store from '../../util/redux_storage';
import { IoCall } from "react-icons/io5";


/** 예약확인 목록 페이지 */
export default function ModalRoomsReserveCheck() {
    const location = useLocation();

    const { contents } = location.state;
    return (
        <div className="container">
            <div className="container-top" style={{ height: '200px', marginTop: '60px' }}>
                <div className="panel panel-top font-color-white" >
                    <div className="container-flex">
                        <h1 className="font-family-bold">숙소 검색</h1>
                    </div>
                </div>
            </div>
            <div className="middlepanel">
                <div style={{float:'left',width:'50%'}}>
                    <img src={contents.firstimage} alt={contents.title} width={"100%"} />
                </div>

                <div>
                    <h1>{contents.title}</h1>
                    <p>{contents.addr1}</p>
                    <p><IoCall /> {contents.tel}</p>
                </div>
            </div>


        </div>

    )

};
