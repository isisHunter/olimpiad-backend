from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer
from .models import User
from .utils import generate_email_token, send_confirmation_email, verify_email_token

class RegisterView(APIView):
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