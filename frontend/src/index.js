import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Main from './pages/Main';
import ConfirmEmail from './pages/EmailConfirmation'
import Enter from './pages/Enter'
import Search from './pages/Search'
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Main />} />
        <Route path="enter" element={<Enter />} />
        <Route path="search" element={<Search />} />
        <Route path="/confirm-email/:token" element={<ConfirmEmail />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('page'));
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
