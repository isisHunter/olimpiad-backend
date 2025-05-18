import React, { useState, useEffect } from 'react';
import API from "./api";
import './AIprep.css';
import { useAuth } from '../authcontext';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const AI = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [messageLoading, setMessageLoading] = useState(false);
    const [olympiads, setOlympiads] = useState({});
    const [filter, setFilter] = useState({name : "", grade : "1"});
    const [sent, setSent] = useState(false);
    const [message, setMessage] = useState("");

    const fetchUserOlympiads = async () => {
        const response = await API.get('user/olympiads-get-full')
        const data = await response.data;
        data.map((olympiad) => {setOlympiads((prevOlympiads) => ({...prevOlympiads, [olympiad.name] : {subject: olympiad.subject, description: olympiad.description}}))});
        setLoading(false);
    };

    const MessageRenderer = ({ message }) => {
    const createSafeHtml = () => {
        const rawHtml = marked.parse(message || '');
        const cleanHtml = DOMPurify.sanitize(rawHtml);
        return { __html: cleanHtml };
    };

    return (
        <div className="message-content" dangerouslySetInnerHTML={createSafeHtml()} />
    );
    };


    const handleChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
    };

    const getTask = async () => {
        setSent(true);
        const response = await API.get("user/get-task", filter + olympiads[filter.name]);
    }

    useEffect(() => {
        fetchUserOlympiads();
    }, []);

    return(
        <div class="main" style={{height: "100vh", display: "flex", flexDirection: "column"}}>
            <div style={{flex: "1", display: "flex", flexDirection: "column"}}>
                <title>Подготовка с ИИ</title>
                <header class="main_box">
                    <a class="name" href="/">rosolympiad.ru</a>
                    {user ? (<a class="enter" href="/dashboard">{user.email.split('@')[0]}</a>) : (<a class="enter" href="/enter">Вход/Регистрация</a>)}
                    <a class="enter" href="/search" style={{float : "right"}}><span>Поиск по фильтрам</span></a>
                    <a class="search" href="/AI" style={{float : "right"}}><span>Подготовка с ИИ</span></a> 
                </header>
                <h1>Подготовка с ИИ</h1>
                {loading && user ? (<p><span class="loader"/></p>) : (
                    <div class="filters">
                    <label>
                        Олимпиада:&emsp;
                        <select name="name" onChange={handleChange} style={{width : "950px"}} required disabled={sent || !user}>
                            {Object.keys(olympiads).map((name) => (<option value={name}>{name}</option>))}
                        </select>
                    </label>
                    <label>
                        Класс:&emsp;
                        <select name="grade" onChange={handleChange} style={{width : "50px"}} required disabled={sent || !user}>
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
                    <button class="search" onClick={getTask} disabled={sent || !user}><span>Отправить</span></button>
                </div>)}
                <div class="chatbox">
                    {user ? (!sent && <h1 style={{color: "#b1b1b1"}}>Нажмите "Отправить" для взаимодействия</h1>) : (<h1 style={{color: "red"}}>Зарегистрируйтесь для просмотра</h1>)}
                    {sent && <span class="spinner"/>}
                    <MessageRenderer message={message} />
                </div>
                <div class="filters">
                    <button class="search" style={{width: "200px"}}><span>Дать ответы</span></button>
                </div>
            </div>
            <footer>rosolympiad.ru 2025<tr/>Проект выполнили ученики лицея №1511<tr/>Мельников Антон и Манчуленко Василий<tr/>По всем вопросам писать на <a href="mailto:olimpiad.reminder@gmail.com">olimpiad.reminder@gmail.com</a></footer>
        </div>
    )
}
export default AI