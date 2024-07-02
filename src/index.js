import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './config/firebase_config';
import App from './App';
import { OpenCvProvider } from "opencv-react";

const root = ReactDOM.createRoot(document.getElementById('root'));

const onLoaded = (cv) => {
  console.log('opencv loaded', cv)
}


root.render(
  <React.StrictMode>
     {/* <OpenCvProvider onLoad={onLoaded}> */}
      <App />
    {/* </OpenCvProvider> */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
