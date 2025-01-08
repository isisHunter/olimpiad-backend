import './Search.css';
import { useAuth } from '../authcontext';
import React, { useState, useEffect } from 'react';
import API from "./api";

const SearchPage = () => {
    const [grade, setGrade] = useState('');
    const [subject, setSubject] = useState('');
    const [olympiads, setOlympiads] = useState([]);
    const [selectedOlympiads, setSelectedOlympiads] = useState([]);
    const [olympiadData, setOlympiadData] = useState({
      grade : "",
      subject : "",
      type : "",
    })

    const handleChange = (e) => {
      setOlympiadData({ ...olympiadData, [e.target.name]: e.target.value });
    };

    const fetchOlympiads = async () => {
      const params = new URLSearchParams();
      if (grade) params.append('ClassesParticipation', grade);
      if (subject) params.append('Subject', subject);
  
      const response = await API.get(`olympiads/?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.data;
      setOlympiads(data);
    };
  
    const handleCheckboxChange = (id) => {
      setSelectedOlympiads((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    };
  
    const saveOlympiads = async () => {
      await API.post('user/olympiads/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ olympiads: selectedOlympiads }),
      });
      alert('Выбранные олимпиады сохранены!');
    };
  
    useEffect(() => {
      fetchOlympiads();
    }, [grade, subject]);
  
    const { user } = useAuth();
    return(
        <div class="main">
            <title>Поиск</title>
            <header class="main_box">
                <a class="name" href="/">Сайт с олимпиадами</a>
                {user ? (<a class="enter" href="dashboard">{user.email.split('@')[0]}</a>) : (<a class="enter" href="enter">Вход/Регистрация</a>)}
                <a class="search" href="search" style={{float : "right"}}><span>Поиск по фильтрам</span></a> 
            </header>
            <h1>Поиск олимпиад</h1>
            <div>
                <label>
                Класс:
                <input
                    type="number"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                />
                </label>
                <label>
                Предмет:
                <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />
                </label>
                <button onClick={fetchOlympiads}>Применить фильтры</button>
            </div>
            <ul>
                {olympiads.map((olympiad) => (
                <li key={[olympiad.ID, olympiad.Subject]}>
                    <input
                    type="checkbox"
                    checked={selectedOlympiads.includes(olympiad.ID)}
                    onChange={() => handleCheckboxChange(olympiad.ID)}
                    />
                    {olympiad.Name} - {olympiad.Description}
                </li>
                ))}
            </ul>
            <button onClick={saveOlympiads}>Сохранить выбор</button>
            <footer>Сайт с олимпиадами 2024</footer>
        </div>
    )
}
export default SearchPage;