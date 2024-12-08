from itsdangerous import URLSafeTimedSerializer
from django.conf import settings
from django.core.mail import send_mail

def generate_email_token(user_email):
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    return serializer.dumps(user_email, salt='email-confirmation')

def verify_email_token(token):
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    try:
        email = serializer.loads(token, salt='email-confirmation', max_age=3600)  # Токен действует 1 час
        return email
    except Exception:
        return None
    
def send_confirmation_email(user_email, token):
    confirmation_url = f"http://127.0.0.1:8000/api/users/confirm-email/{token}/"
    subject = "Подтверждение регистрации"
    message = f"Для подтверждения регистрации перейдите по ссылке: {confirmation_url}"
    send_mail(subject, message, 'your_email@example.com', [user_email])