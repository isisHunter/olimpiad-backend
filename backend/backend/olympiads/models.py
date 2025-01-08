from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UserManager(BaseUserManager):
    def create_user(self, email, password=None):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None):
        user = self.create_user(email, password)
        user.is_admin = True
        user.is_active = True
        user.is_staff = True 
        user.is_superuser = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    olympiads = models.ManyToManyField('Olympiad', blank=True, related_name='users')
    objects = UserManager()

    USERNAME_FIELD = 'email'

    def __str__(self):
        return self.email

class Olympiad(models.Model):
    ID = models.IntegerField(primary_key=True)
    Subject = models.CharField(max_length=255)
    Name = models.CharField(max_length=255)
    Description = models.TextField(blank=True, null=True)
    Grades = models.JSONField()
    Type = models.JSONField()
    Dates = models.JSONField()
    class Meta:
        managed = False
        db_table = 'olympiads'
        constraints = [
            models.UniqueConstraint(fields=['ID', 'Subject'], name='unique_id_subject')
        ]