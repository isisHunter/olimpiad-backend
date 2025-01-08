import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { useAuth } from '../authcontext';

const Dashboard = () => {
    const [userOlympiads, setUserOlympiads] = useState([]);
    const { user, logout } = useAuth();

    const fetchUserOlympiads = async () => {
        const response = await fetch('http://127.0.0.1:8000/api/users/olympiads/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setUserOlympiads(data);
    };

    const handleLogout = () => {
      logout();
    };
  
    useEffect(() => {
        fetchUserOlympiads();
      }, []);
    
    return (
        <div class="main">
            <title>Личный кабинет</title>
            <header class="main_box">
                <a class="name" href="/">Сайт с олимпиадами</a>
                {user ? (<a class="enter" href="dashboard">{user.email.split('@')[0]}</a>) : (<a class="enter" href="enter">Вход/Регистрация</a>)}
                <a class="search" href="search" style={{float : "right"}}><span>Поиск по фильтрам</span></a> 
            </header>
            <h1>{user.email}</h1>
            <h2>Ваши олимпиады:</h2>
                <ul>
                    {userOlympiads.map((olympiad) => (
                    <li key={olympiad.id}>
                        {olympiad.name} - {olympiad.description}
                    </li>
                    ))}
                </ul>
            <button onClick={handleLogout} class="exit">Выйти</button>
            <footer>Сайт с олимпиадами 2024</footer>
        </div>
    );
  };
  
  export default Dashboard;
  