from django.db import models
from django.contrib.auth.models import User

class Olympiad(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateField()

    def __str__(self):
        return self.title

class UserOlympiad(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    olympiad = models.ForeignKey(Olympiad, on_delete=models.CASCADE)
    reminder_sent = models.BooleanField(default=False)


class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    url = models.URLField()

    def __str__(self):
        return self.name