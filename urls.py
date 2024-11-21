from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from olympiads.views import OlympiadViewSet, UserOlympiadViewSet

router = DefaultRouter()
router.register(r'olympiads', OlympiadViewSet)
router.register(r'user-olympiads', UserOlympiadViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
