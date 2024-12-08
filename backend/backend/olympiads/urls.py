from django.urls import path
from .views import RegisterView, ConfirmEmailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('confirm-email/<str:token>/', ConfirmEmailView.as_view(), name='confirm-email'),
]