from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from jwt import decode as jwt_decode
from django.conf import settings

class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        from django.contrib.auth.models import AnonymousUser
        from rest_framework_simplejwt.tokens import UntypedToken
        from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
        from django.contrib.auth import get_user_model

        query_string = scope.get("query_string", b"").decode()
        token = parse_qs(query_string).get("token", [None])[0]

        if token is None:
            print("❌ Aucun token trouvé dans la requête WebSocket")
            scope["user"] = AnonymousUser()
            return await self.app(scope, receive, send)

        print("🎫 Token brut reçu :", token)

        try:
            # Vérifie que le token est valide
            UntypedToken(token)

            # Décodage du token
            decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = decoded_data.get("user_id")
            print("✅ Token décodé. user_id :", user_id)

            @database_sync_to_async
            def get_user():
                User = get_user_model()
                try:
                    return User.objects.get(id=user_id)
                except User.DoesNotExist:
                    return AnonymousUser()

            scope["user"] = await get_user()

        except (InvalidToken, TokenError, Exception) as e:
            print("❌ JWT Middleware error:", e)
            scope["user"] = AnonymousUser()

        return await self.app(scope, receive, send)
