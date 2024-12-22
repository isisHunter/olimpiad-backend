import React from 'react';
import './Dashboard.css';
import { useAuth } from '../authcontext';

const Dashboard = () => {
    const { user, logout } = useAuth();
  
    const handleLogout = () => {
      logout();
    };
  
    return (
        <div class="main">
            <header class="main_box">
                <a class="name" href="/">Сайт с олимпиадами</a>
                {user ? (<a class="enter" href="dashboard">{user.email.split('@')[0]}</a>) : (<a class="enter" href="enter">Вход/Регистрация</a>)}
                <a class="search" href="search" style={{float : "right"}}><span>Поиск по фильтрам</span></a> 
            </header>
            <h1>{user.email}</h1>
            <button onClick={handleLogout} class="exit">Выйти</button>
            <footer>Сайт с олимпиадами 2024</footer>
        </div>
    );
  };
  
  export default Dashboard;
  