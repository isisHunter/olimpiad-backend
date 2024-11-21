from rest_framework import generics
from .models import Olympiad
from .serializers import OlympiadSerializer
import requests # type: ignore
from bs4 import BeautifulSoup
from .models import Olympiad

class OlympiadListView(generics.ListCreateAPIView):
    queryset = Olympiad.objects.all()
    serializer_class = OlympiadSerializer

def update_olympiads():
    response = requests.get("https://postupi.online/olimp-list/")
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, "html.parser")
        items = soup.find_all("li", class_="list-wrap__item")
        for item in items:
            title = item.find("a").text.strip()
            link = item.find("a")["href"]
            # Добавьте другие данные, если они есть
            Olympiad.objects.update_or_create(title=title, defaults={"link": link})
