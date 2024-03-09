import React, { useState, useReducer, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import styled from "styled-components";
import { IoCall } from "react-icons/io5";
import NoImage from '../../../styles/image/noImage.png';
import ModalComponent from '../../../util/modal';
import { reducer, ERROR_STATE, Alert } from '../../../util/alert';

/** 객실정보 */
const DetailRoomInfo=()=> {

    return (
        <div className="container">
        </div>
    )
}
export default DetailRoomInfo;