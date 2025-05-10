import { useAuth } from '../authcontext';
function Error404() {
    const { user } = useAuth();
    return(
        <div class="main">
            <title>Страница не найдена</title>
            <header class="main_box">
                <a class="name" href="/">rosolympiad.ru</a>
                {user ? (<a class="enter" href="/dashboard">{user.email.split('@')[0]}</a>) : (<a class="enter" href="/enter">Вход/Регистрация</a>)}
                <a class="search" href="/search" style={{float : "right"}}><span>Поиск по фильтрам</span></a> 
            </header>
            <h1 style={{ color: 'red' }}>404</h1>
            <h2 style={{ color: 'red' }}>Страница не найдена</h2>
            <footer>rosolympiad.ru 2025<tr/>Проект выполнили ученики лицея №1511<tr/>Мельников Антон и Манчуленко Василий<tr/>По всем вопросам писать на <a href="mailto:olimpiad.reminder@gmail.com">olimpiad.reminder@gmail.com</a></footer>
        </div>
        )
    }
export default Error404
