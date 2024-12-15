from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate
from .serializers import UserSerializer
from .models import User
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
            return Response({"message": "Неверный или истекший токен."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            if user.is_active:
                return Response({"message": "Учетная запись уже активирована."}, status=status.HTTP_400_BAD_REQUEST)

            user.is_active = True
            user.save()
            return Response({"message": "Email успешно подтвержден. Теперь вы можете войти в систему."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"message": "Пользователь не найден."}, status=status.HTTP_404_NOT_FOUND)
        
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
        return Response({'detail': 'Неверные email или пароль.'}, status=status.HTTP_401_UNAUTHORIZED)

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh = request.data.get('refresh')
        if not refresh:
            return Response({'detail': 'Токен не предоставлен.'}, status=status.HTTP_400_BAD_REQUEST)
        return super().post(request, *args, **kwargs)