import React, { useState } from "react";
import API from "./api";

const ResetPassword = () => {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
          setLoading(true)
          const response = await API.post("reset-password/", {email})
          setLoading(false);
          setMessage(response.data.message);
          setError("");
        } catch (err) {
          setLoading(false);
          setError(err.response?.data?.detail || "Произошла ошибка");
          setMessage("");
        }
      };
    return (
        <div class="main">
            <title>Сброс пароля</title>
            <header class="main_box">
                <a class="name" href="/">rosolympiad.ru</a>
                <a class="enter" href="/enter">Вход/Регистрация</a>
                <a class="enter" href="/search" style={{float : "right"}}><span>Поиск по фильтрам</span></a>
                <a class="search" href="/AI" style={{float : "right"}}><span>Подготовка с ИИ</span></a> 
            </header>
            <h1>Сброс пароля</h1>
            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                <div><button type="submit" class="search" disabled={loading || message}><span>Сбросить пароль</span></button></div>
            </form>
            {loading && <p><span class="loader"/></p>}
            {message && !loading && <p style={{ color: "green" }}>{message}</p>}
            {error && !loading && <p style={{ color: "red" }}>{error}</p>}
            <footer>rosolympiad.ru 2025<tr/>Проект выполнили ученики лицея №1511<tr/>Мельников Антон и Манчуленко Василий<tr/>По всем вопросам писать на <a href="mailto:olimpiad.reminder@gmail.com">olimpiad.reminder@gmail.com</a></footer>
        </div>
    )
}
export default ResetPassword