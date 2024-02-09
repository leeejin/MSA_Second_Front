import React from "react";
import Menubar from "./menubar.js";

import '../styles/main.css';
import '../styles/datepicker.css';

export default function Home({ children }) {
  return (
    <div>
      <Menubar />
      <div style={{ marginTop: '50px' }}>{children}</div>
    </div>
  );
};

