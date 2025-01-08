from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from time import sleep
from html import unescape
from sqlite3 import connect
from json import dumps

def get_grade(element):
    if element.text == "":
        return list(range(1, 12))
    else:
        if "," in element.text:
            return element.text.split()[0].split(",")
        else:
            grades = element.text.split()[0].split("–")
        grades += grades
        return list(range(int(grades[0]), int(grades[1]) + 1))

def get_time(element):
    try:
        element.find_element(By.CLASS_NAME, "timeline")
        dates = [BeautifulSoup(unescape(date.find_element(By.CLASS_NAME, "tl_cont_f").get_attribute("innerHTML")), "html.parser").get_text().replace("\xa0", " ") for date in element.find_elements(By.CLASS_NAME, "tl_event")]
        clear_dates = {}
        for i in dates:
            for j, k in enumerate(i):
                if k in "АБВГДЕЁЖЗИКЛМНОПРСТУФХЦЧШЩЪЬЭЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ":
                    clear_dates[i[j:]] = i[0:j-1].split("...")
                    if " " not in clear_dates[i[j:]][0]:
                        clear_dates[i[j:]][0] += clear_dates[i[j:]][1][-4:]
                    break
        return clear_dates
    except NoSuchElementException:
        return {}

def get_info(element):
    try:
        return element.find_element(By.CLASS_NAME, "headline.red").text
    except NoSuchElementException:
        return ""

def scroll_to_load(driver):
    last_height = driver.execute_script("return document.body.scrollHeight")
    while 1:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        sleep(4)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height

def parse_olympiads(url):
    driver.get(url)
    scroll_to_load(driver)
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "megalist")))
    container = driver.find_element(By.ID, "megalist").find_elements(By.CLASS_NAME, "fav_olimp.olimpiada")
    results = [[element.get_attribute("act"), element.find_element(By.CLASS_NAME, "headline").text, get_info(element), get_grade(element.find_element(By.CLASS_NAME, "classes_dop")), get_time(element)] for element in container]
    return results

def add_olympiad(id, subject, name, description,grades, dates):
    cursor.execute(
        "INSERT INTO Olympiads (ID, Subject, Name, Description, Grades, Type, Dates) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            id,
            subject,
            name,
            description,
            dumps(grades),
            dumps(["Командные", "Очные", "Дистанционные"]),
            dumps(dates)
        )
    )
    conn.commit()

if __name__ == "__main__":

    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    service = Service("C:/chromedriver-win64/chromedriver.exe")
    driver = webdriver.Chrome(service=service, options=options)

    conn = connect("olympiads.db")
    cursor = conn.cursor()
    cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS Olympiads (
        ID INTEGER NOT NULL,
        Subject TEXT NOT NULL,
        Name TEXT NOT NULL,
        Description TEXT NOT NULL,
        Grades TEXT NOT NULL,
        Type TEXT NOT NULL,
        Dates TEXT NOT NULL,
        PRIMARY KEY (ID, Subject)
    )
    """
    )

    subjects = {"Биология" : 11, "География" : 10, "Информатика" : 7, "Математика" : 6, "Физика" : 12, "Химия" : 13, "Астрономия" : 20, "ИЗО" : 22, "Искусство" : 18, "История" : 8, "Лингвистика" : 24, "Литература" : 2, "ОБЖ" : 16, "Обществознание" : 9, "Предпринимательство" : 23, "Право" : 15, "Психология" : 28, "Робототехника" : 27, "Русский язык" : 1, "Технологии" : 17, "Физкультура" : 19, "Черчение" : 31, "Экология" : 21, "Экономика" : 14, "Иностранные языки" : 32}
    for subject in subjects:
        olympiads = parse_olympiads(f"https://olimpiada.ru/activities?subject%5B{subjects[subject]}%5D=on&class=any&type=any&period_date=&period=year")
        for olympiad in olympiads:
            add_olympiad(olympiad[0], subject, olympiad[1], olympiad[2], olympiad[3], olympiad[4])

    type_names = {"9" : "Командные", "ind": "Очные", "dist": "Дистанционные"}
    types = {}
    for type_name in type_names:
        driver.get(f"https://olimpiada.ru/activities?type={type_name}")
        scroll_to_load(driver)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "megalist")))
        container = driver.find_element(By.ID, "megalist").find_elements(By.CLASS_NAME, "fav_olimp.olimpiada")
        for element in container:
            if element.get_attribute("act") in types:
                types[element.get_attribute("act")].append(type_names[type_name])
            else:
                types[element.get_attribute("act")] = [type_names[type_name]]
    for id in types:
        cursor.execute("SELECT ID, Subject, Type FROM Olympiads WHERE ID = ?", (id,))
        rows = cursor.fetchall()
        for row in rows:
            cursor.execute("UPDATE Olympiads SET Type = ? WHERE ID = ? AND Subject = ?", (dumps(types[id]), row[0], row[1]))
    conn.commit()

    conn.close()
    driver.quit()