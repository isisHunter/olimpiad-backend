import random
import requests
from bs4 import BeautifulSoup
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.timezone import now
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from itsdangerous import URLSafeTimedSerializer
from django.conf import settings
from .serializers import UserSerializer, OlympiadSerializer
from .models import User, Olympiad

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False
            user.save()
            token = URLSafeTimedSerializer(settings.SECRET_KEY).dumps(user.email, salt='email-confirmation')
            send_mail("Подтверждение регистрации", f"Для подтверждения регистрации перейдите по ссылке: https://rosolympiad.ru/confirm-email/{token}/", 'rosolympiad.ru <olimpiad.reminder@gmail.com>', [user.email])
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": {
                    "id": user.id,
                    "email": user.email,
                },
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ConfirmEmailView(APIView):
    def get(self, request, token):
        try:
            email = URLSafeTimedSerializer(settings.SECRET_KEY).loads(token, salt='email-confirmation', max_age=3600)
        except Exception:
            return Response({"message": "Неверный или истекший токен"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email)
            if user.is_active:
                return Response({"message": "Учетная запись уже активирована"}, status=status.HTTP_400_BAD_REQUEST)

            user.is_active = True
            user.save()
            return Response({"message": "Email успешно подтвержден. Теперь вы можете войти в систему"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"message": "Пользователь не найден"}, status=status.HTTP_404_NOT_FOUND)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, email=email, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'token': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
        return Response({'detail': 'Неверные email или пароль'}, status=status.HTTP_401_UNAUTHORIZED)

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh = request.data.get('refresh')
        if not refresh:
            return Response({'detail': 'Токен не предоставлен'}, status=status.HTTP_400_BAD_REQUEST)
        return super().post(request, *args, **kwargs)

class ResetPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            if user.last_password_reset and now() - user.last_password_reset < timedelta(days=30):
                return Response({'detail': 'Обновлять пароль можно не чаще чем раз в месяц'}, status=status.HTTP_400_BAD_REQUEST)
            new_password = ''.join(random.choices("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", k=12))
            user.set_password(new_password)
            user.last_password_reset = now()
            user.save()
            send_mail('Сброс пароля', f'Ваш новый пароль: {new_password}\nДля входа перейдите на https://rosolympiad.ru/enter', 'rosolympiad.ru <olimpiad.reminder@gmail.com>', [user.email])
            return Response({'message': 'Новый пароль отправлен на ваш email'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"detail": "Пользователь не найден"}, status=status.HTTP_404_NOT_FOUND)

class OlympiadListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        subjects = ["Биология", "География", "Информатика", "Математика", "Физика", "Химия", "Астрономия", "ИЗО", "Искусство", "История", "Лингвистика", "Литература", "ОБЖ", "Обществознание", "Предпринимательство", "Право", "Психология", "Робототехника", "Русский язык", "Технологии", "Физкультура", "Черчение", "Экология", "Экономика", "Иностранные языки"]
        types = {"team" : "Командные", "offline" : "Очные", "online" : "Дистанционные"}
        grade = request.query_params.get('grade')
        subject = request.query_params.get('subject')
        type = request.query_params.get('type')
        olympiads = Olympiad.objects.using('olympiads').all()
        olympiads = olympiads.filter(subject=subjects[int(subject)])
        olympiads = olympiads.filter(grades__contains=[int(grade)])
        if type != "any":
            olympiads = olympiads.filter(type__contains=[types[type]])
        olympiads = olympiads.order_by('-rating')
        serializer = OlympiadSerializer(olympiads, many=True)
        return Response(serializer.data)

class UserOlympiadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.user
        user.olympiads.append(request.data)
        user.save()
        return Response({'message': 'Олимпиады обновлены'})
    
class FecthUserOlympiadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        return Response(user.olympiads)
    
class FecthUserOlympiadViewFull(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        olympiads = Olympiad.objects.using('olympiads').all()
        olympiads = set(olympiads.filter(id__in=user.olympiads))
        serializer = OlympiadSerializer(olympiads, many=True)
        return Response(serializer.data)
    
class DeleteUserOylmpiadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.user
        id = request.query_params.get('id')
        user.olympiads.remove(int(id))
        user.save()
        return Response({'message': 'Олимпиады удалены'})

class GetMoreInfoOlympiadView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        id = request.query_params.get('id')
        response = requests.get(f'https://olimpiada.ru/activity/{id}')
        soup = BeautifulSoup(response.content, 'html.parser')
        link = soup.find_all('div', class_='contacts')[-1].find('a', class_='color')['href']
        try:
            list1 = [element.text.replace("Еще", ".").replace("...", "").replace('\xa0', ' ') for element in soup.find('div', class_='info block_with_margin_bottom').find_all('p')]
        except Exception:
            list1 = []
        description = ' '.join(list1)
        return Response({'link': link, 'description': description})