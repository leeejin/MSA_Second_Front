
import React, { useState, useEffect, useCallback, useRef, forwardRef, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";
import axios from '../../axiosInstance';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { TbArmchair2 } from "react-icons/tb";
import Constant from '../../util/constant_variables';
import AirPort from '../../util/json/airport-list';
import Datepicker from '../../util/datepicker';
import reverse from '../../styles/image/revert.png';

/** middle component */
export default function MiddleComponent() {

    return (
        <div className="container container-middle">
            <h1>여기엔 뭘 넣지 ???</h1>
        </div>
    );
}

