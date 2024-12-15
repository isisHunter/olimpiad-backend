import React, { useState } from "react";
import API from "./api";
import './Enter.css';

const Enter = () => {
  const [action, setAction] = useState("register");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (action === "register") {
        const response = await API.post("register/", formData);
        setMessage("Вы успешно зарегистрировались. Проверьте вашу почту для подтверждения.");
        setError("");
      } else if (action === "login") {
        const response = await API.post("login/", formData);
        const token = response.data.token;
        localStorage.setItem("token", token);
        setMessage("Вы успешно вошли!");
        setError("");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Произошла ошибка.");
      setMessage("");
    }
  };

  return (
    <div class="main">
        <header class="main_box">
                <a class="name" href="/">Сайт с олимпиадами</a>
                <a class="enter" href="enter">Вход/Регистрация</a>
                <a class="search" href="search" style={{float : "right"}}><span>Поиск по фильтрам</span></a> 
        </header>
        <h1>{action === "register" ? "Регистрация" : "Вход"}</h1>

        <button class="btn" onClick={() => setAction("register")}>Регистрация</button>
        <button  class="btn" onClick={() => setAction("login")}>Вход</button>
        <form onSubmit={handleSubmit}>
            <div>
            <label>Email:</label>
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
            />
            </div>
            <div>
            <label>Пароль:</label>
            <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
            />
            </div>
            <button type="submit" class="search"><span>{action === "register" ? "Зарегистрироваться" : "Войти"}</span></button>
        </form>
        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <footer>Сайт с олимпиадами 2024</footer>
    </div>
  );
};

export default Enter;
