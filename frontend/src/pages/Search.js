import './Search.css';
import { useAuth } from '../authcontext';
import React, { useState } from 'react';
import API from "./api";

const SearchPage = () => {
    const [filter, setFilter] = useState({grade : "1", subject : "0", type : "any"});
    const [olympiads, setOlympiads] = useState([]);
    const [buttons1, setButtons1] = useState({});
    const [buttons2, setButtons2] = useState({});
    const [loading, setLoading] = useState(false);
    const [NoOlympiads, setNoOlympiads] = useState(false);
    const { user } = useAuth();

    const confirmParticipation = async (id) => {
      setButtons1((prevButtons) => ({...prevButtons, [id]: ["Вы указали своё участие в этой олимпиаде. Вам на почту будут приходить оповещения об её изменениях", true]}));
      await API.post('user/olympiads/', id);
    };
    
    const showContacts = async (id) => {
      setButtons2((prevButtons) => ({...prevButtons, [id]: [<span class="loader"/>, true]}));
      const response = await API.get(`olympiad-get-info?id=${id}`);
      const data = await response.data;
      const link = data.link;
      const description = data.description;
      setButtons2((prevButtons) => ({...prevButtons, [id]: [<><a class="olimpiada_link" href={link} target="_blank">Регистрация</a><p class="olimpiada_description">{description}</p></>, true]}));
    };
    
    const handleChange = (e) => {
      setFilter({ ...filter, [e.target.name]: e.target.value });
    };

    const findOlympiads = async () => {
      setNoOlympiads(true)
      setLoading(true)
      let response = await API.get(`olympiads?grade=${filter.grade}&subject=${filter.subject}&type=${filter.type}`);
      const olympiads_data = await response.data;
      if (user) {
        response = await API.get(`user/olympiads-get`);
        const data = await response.data;
        olympiads_data.map((olympiad) => (setButtons1((prevButtons) => ({...prevButtons, [olympiad.id]: ["Буду участвовать", false]}))));
        data.map((id) => (setButtons1((prevButtons) => ({...prevButtons, [id] : ["Вы указали своё участие в этой олимпиаде. Вам на почту будут приходить оповещения об её изменениях", true]}))))
      }
      setLoading(false)
      olympiads_data.map((olympiad) => (setButtons2((prevButtons) => ({...prevButtons, [olympiad.id]: ["Показать дополнительную информацию и ссылку на регистрацию", false]}))));
      setOlympiads(olympiads_data);
    };

    return(
        <div class="main">
            <title>Поиск</title>
            <header class="main_box">
                <a class="name" href="/">rosolympiad.ru</a>
                {user ? (<a class="enter" href="/dashboard">{user.email.split('@')[0]}</a>) : (<a class="enter" href="/enter">Вход/Регистрация</a>)}
                <a class="enter" href="/search" style={{float : "right"}}><span>Поиск по фильтрам</span></a>
                <a class="search" href="/AI" style={{float : "right"}}><span>Подготовка с ИИ</span></a> 
            </header>
            <h1>Поиск олимпиад</h1>
            <div class="filters">
            <label>
              Класс:&emsp;
              <select name="grade" onChange={handleChange} required>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
              </select>
            </label>
            <label>
              Предмет:&emsp;
              <select name="subject" onChange={handleChange} required>
                <option value="0">Биология</option>
                <option value="1">География</option>
                <option value="2">Информатика</option>
                <option value="3">Математика</option>
                <option value="4">Физика</option>
                <option value="5">Химия</option>
                <option value="6">Астрономия</option>
                <option value="7">ИЗО</option>
                <option value="8">Искусство</option>
                <option value="9">История</option>
                <option value="10">Лингвистика</option>
                <option value="11">Литература</option>
                <option value="12">ОБЖ</option>
                <option value="13">Обществознание</option>
                <option value="14">Предпринимательство</option>
                <option value="15">Право</option>
                <option value="16">Психология</option>
                <option value="17">Робототехника</option>
                <option value="18">Русский язык</option>
                <option value="19">Технологии</option>
                <option value="20">Физкультура</option>
                <option value="21">Черчение</option>
                <option value="22">Экология</option>
                <option value="23">Экономика</option>
                <option value="24">Иностранные языки</option>
              </select>
              </label>
              <label>
              Формат:&emsp;
              <select name="type" onChange={handleChange} required>
                <option value="any">Любой</option>
                <option value="team">Командные</option>
                <option value="offline">Очные</option>
                <option value="online">Дистанционные</option>
              </select>
            </label>
            <button class="search" onClick={findOlympiads} disabled={loading}><span>Найти</span></button>
            </div>
                {olympiads.length && !loading ? (olympiads.map((olympiad) => (
                  <div class="olimpiada" id={olympiad.id}>
                    {olympiad && <p class="olimpiada_name">{olympiad.name}</p>}
                    {olympiad && <p class="olimpiada_info">{olympiad.description}</p>}
                    {olympiad && <p class="olimpiada_info">Рейтинг<div class="olimpiada_rating"><div class="progress-bar"><progress value={olympiad.rating} max="100"/></div><div class="background"/></div></p>}
                    {olympiad && <hr/>}
                    {olympiad && <div class="olimpiada_dates">{olympiad.dates && Object.entries(olympiad.dates).map(([name, date]) => (<p class = "olimpiada_date">{name}: {date}</p>))}</div>}
                    {user && olympiad && <button class="soglashenie" onClick={() => confirmParticipation(olympiad.id, olympiad.subject)} disabled={buttons1[olympiad.id][1]}>{buttons1[olympiad.id][0]}</button>}
                    {olympiad && <button class="olimpiada_moreinfo" onClick={() => showContacts(olympiad.id)} disabled={buttons2[olympiad.id][1]}>{buttons2[olympiad.id][0]}</button>}
                  </div>
                ))) : (loading ? (<p><span class="loader"/></p>) : (NoOlympiads && <h1 style={{color : "red"}}>Олимпиады не найдены</h1>))}
            <footer>rosolympiad.ru 2025<tr/>Проект выполнили ученики лицея №1511<tr/>Мельников Антон и Манчуленко Василий<tr/>По всем вопросам писать на <a href="mailto:olimpiad.reminder@gmail.com">olimpiad.reminder@gmail.com</a></footer>
        </div>
        )
}
export default SearchPage;