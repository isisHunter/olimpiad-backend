import React, { useState, useEffect } from 'react';
import API from "./api";
import './Dashboard.css';
import { useAuth } from '../authcontext';

const Dashboard = () => {
    const [olympiads, setOlympiads] = useState([]);
    const { user, logout } = useAuth();
    const [buttons2, setButtons2] = useState({});
    const [show, setShow] = useState({})
    const [loading, setLoading] = useState(true);
    let events = {};

    let datesContainer = document.getElementById("dates");
    let monthYear = document.getElementById("monthYear");
    let prevBtn = document.getElementById("prev");
    let nextBtn = document.getElementById("next");

    let today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    const monthNames = [
      "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];

    const monthMap = {янв: 0, фев: 1, мар: 2, апр: 3, мая: 4, июн: 5, июл: 6, авг: 7, сен: 8, окт: 9, ноя: 10, дек: 11
    };
    
    function parseDates(olympname, name, input) {
      const result = {};
    
      const datePattern = /(\d{1,2})(?:\s)?([а-я]{3})?/gi;
      const parts = input.split('-').map(p => p.trim());
    
      if (parts.length === 1) {
        const match = datePattern.exec(parts[0]);
        if (match) {
          const day = parseInt(match[1], 10);
          const monthStr = match[2];
          const month = monthMap[monthStr.toLowerCase()];
          const date = new Date(currentYear, month, day);
          result[date.toISOString().split('T')[0]] = `${olympname}: ${name}`;
        }
      } else if (parts.length === 2) {
        const match1 = datePattern.exec(parts[0]);
        datePattern.lastIndex = 0;
        const match2 = datePattern.exec(parts[1]);
    
        if (match1 && match2) {
          const day1 = parseInt(match1[1], 10);
          const month1Str = match1[2];
          const day2 = parseInt(match2[1], 10);
          const month2Str = match2[2];
    
          const month1 = monthMap[(month1Str || month2Str).toLowerCase()];
          const month2 = month2Str ? monthMap[month2Str.toLowerCase()] : month1;

          const startDate = currentMonth > month1 ? new Date(currentYear + 1, month1, day1) : new Date(currentYear, month1, day1);
          const endDate = currentMonth > month2 ? new Date(currentYear + 1, month1, day1) : new Date(currentYear, month2, day2);
    
          result[startDate.toISOString().split('T')[0]] = `${olympname}: ${name} - начало`;
          result[endDate.toISOString().split('T')[0]] = `${olympname}: ${name} - конец`;
        }
      }
    
      return result;
    }

    function renderCalendar(month, year) {
      datesContainer.innerHTML = "";
      monthYear.textContent = `${monthNames[month]} ${year}`;

      const firstDayOfMonth = new Date(year, month, 1);
      const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
      const startDay = (firstDayOfMonth.getDay() + 6) % 7;
      const prevLastDate = new Date(year, month, 0).getDate();

      for (let i = startDay - 1; i >= 0; i--) {
        const date = prevLastDate - i;
        datesContainer.innerHTML += `<div class="other-month">${date}</div>`;
      }

      for (let date = 1; date <= lastDateOfMonth; date++) {
        const fullDate = new Date(year, month, date);
        const formatted = fullDate.toISOString().slice(0, 10);
        const event = (formatted in events) ? events[formatted] : null;
        const isToday =
          date === today.getDate() &&
          month === today.getMonth() &&
          year === today.getFullYear();

        let classes = "";
        if (isToday) classes += "today ";
        if (event) classes += "event";

        const tooltip = event ? `${event}` : "";

        datesContainer.innerHTML += `<div class="${classes}" data-tooltip="${tooltip}">${date}</div>`;
      }


      const totalCells = 42;
      const currentCells = startDay + lastDateOfMonth;
      const nextDays = totalCells - currentCells;

      for (let i = 1; i <= nextDays; i++) {
        datesContainer.innerHTML += `<div class="other-month">${i}</div>`;
      }
    }

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
      data.map((olympiad) => (olympiad.dates && (Object.entries(olympiad.dates).map((date) => (Object.assign(events, (parseDates(olympiad.name, date[0], date[1]))))))));
      setOlympiads(data);
    };

    const deleteUserOlympiads = async (id) => {
      setShow((prevShow) => ({...prevShow, [id]: false}));
      await API.post(`user/olympiads-delete?id=${id}`);
    };

    const handleLogout = () => {
      logout();
    };
    console.log("лк")
    useEffect(() => {
      fetchUserOlympiads();
      datesContainer = document.getElementById("dates");
      monthYear = document.getElementById("monthYear");
      prevBtn = document.getElementById("prev");
      nextBtn = document.getElementById("next");
      renderCalendar(currentMonth, currentYear);
      prevBtn.addEventListener("click", () => {
        currentMonth--;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
      });

      nextBtn.addEventListener("click", () => {
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
      });
    }, []);
    
    return (
        <div class="main">
            <title>Личный кабинет</title>
            <header class="main_box">
                <a class="name" href="/">rosolympiad.ru</a>
                <a class="enter" href="/dashboard">{user.email.split('@')[0]}</a>
                <a class="enter" href="/search" style={{float : "right"}}><span>Поиск по фильтрам</span></a>
                <a class="search" href="/AI" style={{float : "right"}}><span>Подготовка с ИИ</span></a> 
            </header>
            
            <div class="calendar">
              <div class="header">
                <button id="prev">&#8592;</button>
                <h2 id="monthYear"></h2>
                <button id="next">&#8594;</button>
              </div>
              <div class="days">
                <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
              </div>
              <div id="dates" class="dates"></div>
            </div>
            <h1 style={{margin: "40px"}}>{user.email}</h1>
            <div class="exit">
              <button onClick={handleLogout}>Выйти</button>
            </div>
            <h2>Ваши олимпиады:</h2>
              <div>
                {olympiads.length ? (olympiads.map((olympiad) => (show[olympiad.id] &&
                  <div class="olimpiada" id={olympiad.id}>
                    <p class="olimpiada_name">{olympiad.name}</p>
                    <p class="olimpiada_info">{olympiad.description}</p><hr/>
                    <div class="olimpiada_dates">{olympiad.dates && Object.entries(olympiad.dates).map(([name, date]) => (<p class = "olimpiada_date">{name}: {date}</p>))}</div>
                    <button class="soglashenie" onClick={() => deleteUserOlympiads(olympiad.id, olympiad.subject)}>Не буду участвовать</button>
                    {olympiad && <button class="olimpiada_moreinfo" onClick={() => showContacts(olympiad.id)} disabled={buttons2[olympiad.id][1]}>{buttons2[olympiad.id][0]}</button>}
                  </div>
                ))) : (loading ? (<p><span class="loader"/></p>) : (<h1 style={{color : "red"}}>Олимпиады не выбраны</h1>))}
              </div>
              <footer>rosolympiad.ru 2025<tr/>Проект выполнили ученики лицея №1511<tr/>Мельников Антон и Манчуленко Василий<tr/>По всем вопросам писать на <a href="mailto:olimpiad.reminder@gmail.com">olimpiad.reminder@gmail.com</a></footer>
        </div>
    );
  };
  
  export default Dashboard;
  