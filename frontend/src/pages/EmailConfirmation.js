import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from './api';
import { useAuth } from '../authcontext';

const ConfirmEmail = () => {
  const { token } = useParams();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    localStorage.clear()
    const confirmEmail = async () => {
      try {
        const response = await API.get(`confirm-email/${token}/`);
        setMessage(response.data.message);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка подтверждения email');
        setMessage('');
      }
    };

    confirmEmail();
  }, [token]);

  return (
    <div class="main">
      <title>Подтверждение email</title>
      <header class="main_box">
        <a class="name" href="/">rosolympiad.ru</a>
        {user ? (<a class="enter" href="/dashboard">{user.email.split('@')[0]}</a>) : (<a class="enter" href="/enter">Вход/Регистрация</a>)}
        <a class="search" href="/search" style={{float : "right"}}><span>Поиск по фильтрам</span></a> 
      </header>
      <h1>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      </h1>
      <footer>rosolympiad.ru 2025. Часть материалов была взята с сайта <a href="https://olimpiada.ru/" target="_blank">© Олимпиада.ру</a><tr/>Проект выполнили ученики лицея №1511<tr/>Мельников Антон и Манчуленко Василий<tr/>По всем вопросам писать на <a href="mailto:olimpiad.reminder@gmail.com">olimpiad.reminder@gmail.com</a></footer>
    </div>
  );
};

export default ConfirmEmail;
