from django.contrib import admin
from .models import Category, Region, Olympiad, UserProfile

admin.site.register(Category)
admin.site.register(Region)
admin.site.register(Olympiad)
admin.site.register(UserProfile)
