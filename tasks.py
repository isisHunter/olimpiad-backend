from django.core.mail import send_mail
from .models import Olympiad

def send_olympiad_reminders():
    olympiads = Olympiad.objects.all()
    for olympiad in olympiads:
        for user in olympiad.user.all():
            send_mail(
                'Upcoming Olympiad Reminder',
                f'Reminder: The olympiad {olympiad.name} is on {olympiad.date}.',
                'olimpiad.reminder@example.com',
                [user.email],
            )
