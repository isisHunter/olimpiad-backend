from django.contrib import admin
from .models import User, Olympiad

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'is_active', 'is_admin')
    list_filter = ('is_active', 'is_admin')
    search_fields = ('email',)
    ordering = ('email',)

class OlympiadAdmin(admin.ModelAdmin):
    list_display = ('ID', 'Subject', 'Name', 'Type', 'Dates')
    list_filter = ('Subject',)
    search_fields = ('Name', 'Description', 'ID', 'Subject')

    def get_queryset(self, request):
        return super().get_queryset(request).using('olympiads')

    def save_model(self, request, obj, form, change):
        obj.save(using='olympiads')

    def delete_model(self, request, obj):
        obj.delete(using='olympiads')

admin.site.register(Olympiad, OlympiadAdmin)