import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from notification.routing import websocket_urlpatterns as notification_websocket_urlpatterns

from users.jwt_middleware import JWTAuthMiddleware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

django_asgi_app = get_asgi_application()

# Combinez les websocket_urlpatterns des notifications et des alarmes
websocket_urlpatterns = notification_websocket_urlpatterns 

application = ProtocolTypeRouter({
    "http": django_asgi_app,  # Gérer les requêtes HTTP
    "websocket": JWTAuthMiddleware(
        URLRouter(websocket_urlpatterns)  # Routes WebSocket combinées
    ),
})
