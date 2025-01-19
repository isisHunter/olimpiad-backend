import React, { useState, useEffect } from 'react';
import API from "./api";
import axios from 'axios';
import * as cheerio from 'cheerio';
import './Dashboard.css';
import { useAuth } from '../authcontext';

const Dashboard = () => {
    const [olympiads, setOlympiads] = useState([""]);
    const { user, logout } = useAuth();
    const [buttons2, setButtons2] = useState({});

    const showContacts = async (id) => {
      setButtons2((prevButtons) => ({...prevButtons, [id]: ["Загрузка...", true]}));
      const response = await axios.get(`http://localhost:8080/https://olimpiada.ru/activity/${id}`);
      const $ = cheerio.load(response.data);
      const link = $('div.contacts').last().find('a.color').attr('href');
      const list = $('div.info.block_with_margin_bottom p').map((_, element) => {const text = $(element).text(); return text.replace("Еще", ".").replace("...", "").replace(/\xa0/g, " ");}).get();
      const description = list.join(' ');
      setButtons2((prevButtons) => ({...prevButtons, [id]: [<><a class="olimpiada_link" href={link} target="_blank">Регистрация</a><p class="olimpiada_description">{description}</p></>, true]}));
    };

    const fetchUserOlympiads = async () => {
        const response = await API.get('user/olympiads-get-full')
        const data = await response.data;
        setOlympiads(data);
        data.map((olympiad) => (setButtons2((prevButtons) => ({...prevButtons, [olympiad.id]: ["Показать дополнительную информацию и ссылку на регистрацию", false]}))));
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
            <div class="exit">
              <button onClick={handleLogout}>Выйти</button>
            </div>
            <h2>Ваши олимпиады:</h2>
              <div>
                {olympiads.map((olympiad) => (
                  <div class="olimpiada" id={olympiad.id}>
                    <p class="olimpiada_name">{olympiad.name}</p>
                    <p class="olimpiada_info">{olympiad.description}</p>
                    <div class="olimpiada_dates">{olympiad.dates && Object.entries(olympiad.dates).map(([name, date]) => (<p class = "olimpiada_date">{name}: {date}</p>))}</div>
                    {olympiad && <button class="olimpiada_moreinfo" onClick={() => showContacts(olympiad.id)} disabled={buttons2[olympiad.id][1]}>{buttons2[olympiad.id][0]}</button>}
                  </div>
                ))}
              </div>
            <footer>Сайт с олимпиадами 2025. Часть материалов была взята с сайта <a href="https://olimpiada.ru/" target="_blank">© Олимпиада.ру</a></footer>
        </div>
    );
  };
  
  export default Dashboard;
  