import React from "react";
import Menubar from "./menubar.js";

import '../styles/main.css'; //className 써서 쓰는 style
import '../styles/datepicker.css'; //datepicker 전용 style
import '../styles/constructor.css'; //컴포넌트 전용 style
export default function Home({ children }) {
  return (
    <div>
      <Menubar />
      <div style={{ marginTop: '50px' }}>{children}</div>
    </div>
  );
};

