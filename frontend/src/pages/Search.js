import './Search.css';
function Main() {
    return(
        <div class="main">
            <header class="main_box">
                <a class="name" href="/">Сайт с олимпиадами</a>
                <a class="enter" href="enter">Вход/Регистрация</a>
                <a class="search" href="search" style={{float : "right"}}><span>Поиск по фильтрам</span></a> 
            </header>
            <h1>Поиск</h1>
            <footer>Сайт с олимпиадами 2024</footer>
        </div>
    )
}
export default Main