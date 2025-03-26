from django.utils import timezone
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from users.models import User
import jwt

class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        authorization_header = request.headers.get('Authorization', '')

        if authorization_header.startswith('Bearer '):
            token = authorization_header.split(' ')[1]
            try:
                payload = jwt.decode(
                    token,
                    settings.JWT_SECRET_KEY,  
                    algorithms=['HS256']
                )

                if timezone.now().timestamp() > payload.get('exp', 0):
                    request.user = AnonymousUser()
                else:
                    try:
                        user = User.objects.get(id=payload['user_id'])
                        request.user = user
                    except User.DoesNotExist:
                        request.user = AnonymousUser()
            except jwt.PyJWTError:
                request.user = AnonymousUser()
        else:
            request.user = AnonymousUser()

        return self.get_response(request)
