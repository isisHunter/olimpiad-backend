from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import authenticate
from .serializers import UserSerializer, OlympiadSerializer
from .models import User, Olympiad
from .utils import generate_email_token, send_confirmation_email, verify_email_token

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False
            user.save()
            token = generate_email_token(user.email)
            send_confirmation_email(user.email, token)
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
        email = verify_email_token(token)
        if email is None:
            return Response({"message": "Неверный или истекший токен"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            if user.is_active:
                return Response({"message": "Учетная запись активирована"}, status=status.HTTP_400_BAD_REQUEST)

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

class OlympiadListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
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
        serializer = OlympiadSerializer(olympiads, many=True)
        return Response(serializer.data)

class UserOlympiadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        user = request.user
        user.olympiads.append(request.data)
        user.save()
        return Response({'message': 'Олимпиады обновлены'})
    
class FecthUserOlympiadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        user = request.user
        return Response(user.olympiads)
    
class FecthUserOlympiadViewFull(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        user = request.user
        olympiads = Olympiad.objects.using('olympiads').all()
        olympiads = set(olympiads.filter(id__in=user.olympiads))
        serializer = OlympiadSerializer(olympiads, many=True)
        return Response(serializer.data)