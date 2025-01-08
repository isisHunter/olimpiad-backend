import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './authcontext';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('page'));
root.render(<React.StrictMode><AuthProvider><Router><App /></Router></AuthProvider></React.StrictMode>);

reportWebVitals();
