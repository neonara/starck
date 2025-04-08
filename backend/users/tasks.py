from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def send_verification_email(email, verification_code):
    """Envoyer le code de vérification par email de manière asynchrone."""
    subject = "Admin Account Verification Code"
    message = f"Your verification code is: {verification_code}"
    from_email = settings.EMAIL_HOST_USER
    send_mail(subject, message, from_email, [email], fail_silently=False)


@shared_task
def send_registration_link(email, registration_link):
    """Envoie un email avec un lien d'inscription."""
    subject = "Complétez votre inscription"
    message = f"Bonjour,\n\nCliquez sur le lien suivant pour compléter votre inscription : {registration_link}\n\nSi vous n'avez pas demandé cela, ignorez cet email."
    from_email = settings.EMAIL_HOST_USER
    send_mail(subject, message, from_email, [email], fail_silently=False)