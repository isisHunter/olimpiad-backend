import React, { useState, useEffect } from 'react';
import API from "./api";
import './Dashboard.css';
import { useAuth } from '../authcontext';

const Dashboard = () => {
    const [olympiads, setOlympiads] = useState([""]);
    const { user, logout } = useAuth();
    const [buttons2, setButtons2] = useState({});
    const [show, setShow] = useState({})
    const [loading, setLoading] = useState(true);

    const showContacts = async (id) => {
      setButtons2((prevButtons) => ({...prevButtons, [id]: [<span class="loader"/>, true]}));
      const response = await API.get(`olympiad-get-info?id=${id}`);
      const data = await response.data;
      const link = data.link;
      const description = data.description;
      setButtons2((prevButtons) => ({...prevButtons, [id]: [<><a class="olimpiada_link" href={link} target="_blank">Регистрация</a><p class="olimpiada_description">{description}</p></>, true]}));
    };

    const fetchUserOlympiads = async () => {
      const response = await API.get('user/olympiads-get-full')
      const data = await response.data;
      setLoading(false);
      data.map((olympiad) => (setButtons2((prevButtons) => ({...prevButtons, [olympiad.id]: ["Показать дополнительную информацию и ссылку на регистрацию", false]}))));
      data.map((olympiad) => (setShow((prevShow) => ({...prevShow, [olympiad.id]: true}))));
      setOlympiads(data);
    };

    const deleteUserOlympiads = async (id) => {
      setShow((prevShow) => ({...prevShow, [id]: false}));
      await API.post(`user/olympiads-delete?id=${id}`);
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
                <a class="name" href="/">rosolympiad.ru</a>
                <a class="enter" href="/dashboard">{user.email.split('@')[0]}</a>
                <a class="search" href="/search" style={{float : "right"}}><span>Поиск по фильтрам</span></a> 
            </header>
            <h1>{user.email}</h1>
            <div class="exit">
              <button onClick={handleLogout}>Выйти</button>
            </div>
            <h2>Ваши олимпиады:</h2>
              <div>
		{loading && <p><span class="loader"/></p>}
                {olympiads.map((olympiad) => (show[olympiad.id] &&
                  <div class="olimpiada" id={olympiad.id}>
                    <p class="olimpiada_name">{olympiad.name}</p>
                    <p class="olimpiada_info">{olympiad.description}</p><hr/>
                    <div class="olimpiada_dates">{olympiad.dates && Object.entries(olympiad.dates).map(([name, date]) => (<p class = "olimpiada_date">{name}: {date}</p>))}</div>
                    <button class="soglashenie" onClick={() => deleteUserOlympiads(olympiad.id, olympiad.subject)}>Не буду участвовать</button>
                    {olympiad && <button class="olimpiada_moreinfo" onClick={() => showContacts(olympiad.id)} disabled={buttons2[olympiad.id][1]}>{buttons2[olympiad.id][0]}</button>}
                  </div>
                ))}
              </div>
              <footer>rosolympiad.ru 2025. Часть материалов была взята с сайта <a href="https://olimpiada.ru/" target="_blank">© Олимпиада.ру</a><tr/>Проект выполнили ученики лицея №1511<tr/>Мельников Антон и Манчуленко Василий<tr/>По всем вопросам писать на <a href="mailto:olimpiad.reminder@gmail.com">olimpiad.reminder@gmail.com</a></footer>
        </div>
    );
  };
  
  export default Dashboard;
  