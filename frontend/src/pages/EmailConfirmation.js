import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from './api';

const ConfirmEmail = () => {
  const { token } = useParams();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
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
        <a class="name" href="/">Сайт с олимпиадами</a>
        <a class="enter" href="/enter">Вход/Регистрация</a>
        <a class="search" href="/search" style={{float : "right"}}><span>Поиск по фильтрам</span></a> 
      </header>
      <h1>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      </h1>
      <footer>Сайт с олимпиадами 2025. Часть материалов была взята с сайта <a href="https://olimpiada.ru/" target="_blank">© Олимпиада.ру</a></footer>
    </div>
  );
};

export default ConfirmEmail;
