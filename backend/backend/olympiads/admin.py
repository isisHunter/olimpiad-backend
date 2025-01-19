from django.contrib import admin
from .models import User, Olympiad

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'is_active', 'is_admin')
    list_filter = ('is_active', 'is_admin')
    search_fields = ('email',)
    ordering = ('email',)

class OlympiadAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'name', 'type', 'dates')
    list_filter = ('subject',)
    search_fields = ('name', 'description', 'id', 'subject')

    def get_queryset(self, request):
        return super().get_queryset(request).using('olympiads')

    def save_model(self, request, obj, form, change):
        obj.save(using='olympiads')

    def delete_model(self, request, obj):
        obj.delete(using='olympiads')

admin.site.register(Olympiad, OlympiadAdmin)