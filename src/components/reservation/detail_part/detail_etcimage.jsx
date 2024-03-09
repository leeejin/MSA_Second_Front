import React, { useState, useReducer, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import styled from "styled-components";
import { IoCall } from "react-icons/io5";
import NoImage from '../../../styles/image/noImage.png';
import ModalComponent from '../../../util/custom/modal';
import { reducer, ERROR_STATE, Alert } from '../../../util/custom/alert';

/** 추가이미지 */
const DetailETCImageInfo=()=> {

    return (
        <div className="container" style={{ textAlign: 'center' }}>
        </div>
    )
}

export default DetailETCImageInfo;