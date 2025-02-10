from django.urls import path
from .views import RegisterView, ConfirmEmailView, LoginView, CustomTokenRefreshView, OlympiadListView, UserOlympiadView, FecthUserOlympiadView, FecthUserOlympiadViewFull, DeleteUserOylmpiadView, ResetPasswordView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('confirm-email/<str:token>/', ConfirmEmailView.as_view(), name='confirm-email'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('olympiads/', OlympiadListView.as_view(), name='olympiads-list'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('user/olympiads/', UserOlympiadView.as_view(), name='user-olympiads'),
    path('user/olympiads-get', FecthUserOlympiadView.as_view(), name='user-olympiads-get'),
    path('user/olympiads-get-full', FecthUserOlympiadViewFull.as_view(), name='user-olympiads-get-full'),
    path('user/olympiads-delete', DeleteUserOylmpiadView.as_view(), name='user-olympiads-delete'),
]