import React, { useState } from "react";
import API from "./api";
import './Enter.css';
import { useAuth } from '../authcontext';
import { useNavigate } from 'react-router-dom';

const Enter = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [action, setAction] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (action === "register") {
        setLoading(true);
        await API.post("register/", formData);
        setLoading(false);
        setMessage("Вы успешно зарегистрировались. Проверьте вашу почту для подтверждения");
        setError("");
      } else if (action === "login") {
        setLoading(true);
        const response = await API.post("login/", formData);
        const token = response.data.token;
        localStorage.setItem("refresh", response.data.refresh);
        setLoading(false);
        setMessage("Вы успешно вошли!");
        setError("");
        const userData = {email : formData.email, token : token};
        login(userData);
        navigate('/dashboard');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.detail || err.response?.data?.email || "Произошла ошибка");
      setMessage("");
    }
  };

  return (
    <div class="main">
        <title>{action === "register" ? "Регистрация" : "Вход"}</title>
        <header class="main_box">
                <a class="name" href="/">rosolympiad.ru</a>
                <a class="enter" href="/enter">Вход/Регистрация</a>
                <a class="search" href="/search" style={{float : "right"}}><span>Поиск по фильтрам</span></a> 
        </header>
        <h1>{action === "register" ? "Регистрация" : "Вход"}</h1>
        <button  class="btn" onClick={() => (setAction("login"), setError(""), setMessage(""), setLoading(false))}>Вход</button>
        <button class="btn" onClick={() => (setAction("register"), setError(""), setMessage(""), setLoading(false))}>Регистрация</button>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required/>
          </div>
          <div>
            <label>Пароль:</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required/>
            <div>
              <button type="submit" class="search" disabled={loading || message}><span>{action === "register" ? "Зарегистрироваться" : "Войти"}</span></button>
            </div>
          </div>
        </form>
        <a class="reset" href="/reset-password">Забыли пароль?</a>
        {loading && <p><span class="loader"/></p>}
        {message && !loading && <p style={{color: "green"}}>{message}</p>}
        {error && !loading && <p style={{color: "red"}}>{error}</p>}
        <footer>rosolympiad.ru 2025<tr/>Проект выполнили ученики лицея №1511<tr/>Мельников Антон и Манчуленко Василий<tr/>По всем вопросам писать на <a href="mailto:olimpiad.reminder@gmail.com">olimpiad.reminder@gmail.com</a></footer>
    </div>
  );
};

export default Enter;
