from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from sqlite3 import connect as user_connect
from bs4 import BeautifulSoup
from time import sleep
from html import unescape
from psycopg2 import connect
from json import dumps
from datetime import datetime, timedelta
from django.utils.timezone import now
from django.core.mail import send_mail
from django.core.management.base import BaseCommand

class Command(BaseCommand):

    def get_date(date):
        months = {"янв": 1, "фев": 2, "мар": 3, "апр": 4, "май": 5, "июн": 6, "июл": 7, "авг": 8, "сен": 9, "окт": 10, "ноя": 11, "дек": 12}
        day, month = date.split()
        return datetime(now().year, months[month], int(day))

    def get_time(element):
        try:
            element.find_element(By.CLASS_NAME, "timeline")
            dates = [BeautifulSoup(unescape(date.find_element(By.CLASS_NAME, "tl_cont_f").get_attribute("innerHTML")), "html.parser").get_text().replace("\xa0", " ") for date in element.find_elements(By.CLASS_NAME, "tl_event")]
            clear_dates = {}
            for i in dates:
                for j, k in enumerate(i):
                    if k in "АБВГДЕЁЖЗИКЛМНОПРСТУФХЦЧШЩЪЬЭЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ":
                        clear_dates[i[j:]] = i[:j-1].replace("...", " - ")
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

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Программа успешно завершена"))

    conn = connect(dbname="olympiads", user="postgres", password="12345", host="localhost", port="5432")
    cursor = conn.cursor()

    user_conn = user_connect("C:/olimpiad-backend/backend/backend/db.sqlite3")
    user_cursor = user_conn.cursor()
    user_cursor.execute("SELECT Email, Olympiads FROM olympiads_user")
    user_olympiads = user_cursor.fetchall()
    for user_olympiad in user_olympiads:
        for id in user_olympiad[1][1:-1].split(", "):
            if id:
                cursor.execute("SELECT Dates, Name FROM Olympiads WHERE ID = %s", (id,))
                dates = cursor.fetchall()[0]
                for date in dates[0]:
                    if " - " not in dates[0][date]:
                        date_time = get_date(dates[0][date])
                        if date_time.date() == now().date() + timedelta(days=2):
                            send_mail(f"{dates[1]}: послезавтра состоится {date}", f"В выбранных вами олимпиадах ({dates[1]}) произошли изменения:\nПослезавтра, {dates[0][date]}, состоится {date}, найти ссылку на регистрацию вы можете найти в своём личном кабинете https://rosolympiad.ru/dashboard", 'rosolympiad.ru <olimpiad.reminder@gmail.com>', [user_olympiad[0]])        
                    else:
                        dates[0][date] = dates[0][date].split(" - ")
                        if  " " not in dates[0][date][0]:
                            dates[0][date][0] += dates[0][date][1][-4:]
                        date_time_start = get_date(dates[0][date][0])
                        date_time_end = get_date(dates[0][date][1])
                        if date_time_start.date() == now().date() + timedelta(days=2):
                            send_mail(f"{dates[1]}: послезавтра начинается {date}", f"В выбранных вами олимпиадах ({dates[1]}) произошли изменения:\nПослезавтра, {dates[0][date][0]}, начинается {date} и длится до {dates[0][date][1]}. Найти ссылку на регистрацию вы можете найти в своём личном кабинете https://rosolympiad.ru/dashboard", 'rosolympiad.ru <olimpiad.reminder@gmail.com>', [user_olympiad[0]])
                        if date_time_end.date() == now().date() + timedelta(days=2):
                            send_mail(f"{dates[1]}: послезавтра заканчивается {date}", f"В выбранных вами олимпиадах ({dates[1]}) произошли изменения:\nПослезавтра, {dates[0][date][1]}, заканчивается {date}, найти ссылку на регистрацию вы можете найти в своём личном кабинете https://rosolympiad.ru/dashboard", 'rosolympiad.ru <olimpiad.reminder@gmail.com>', [user_olympiad[0]])
    user_conn.close()

    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    service = Service("C:/chromedriver-win64/chromedriver.exe")
    driver = webdriver.Chrome(service=service, options=options)

    driver.get("https://olimpiada.ru/activities")
    scroll_to_load(driver)
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "megalist")))
    container = driver.find_element(By.ID, "megalist").find_elements(By.CLASS_NAME, "fav_olimp.olimpiada")
    results = []
    for element in container:
        results.append([element.get_attribute("act"), element.find_element(By.CLASS_NAME, "headline").text, get_info(element), get_time(element)])
    for result in results:
        cursor.execute("SELECT ID, Subject, Name, Description, Dates FROM Olympiads WHERE ID = %s", (result[0],))
        rows = cursor.fetchall()
        for row in rows:
            cursor.execute("UPDATE Olympiads SET Name = %s, Description = %s, Dates = %s WHERE ID = %s AND Subject = %s", (result[1], result[2], dumps(result[3]), row[0], row[1]))
    conn.commit()
    driver.quit()
    conn.close()