from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
import uuid
import random
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from .tasks import send_verification_email 
from .tasks import send_registration_link
from .serializers import UserProfileSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.core.cache import cache


User = get_user_model()

import logging
logger = logging.getLogger(__name__)



class RegisterAdminView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()  
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')

        if not email or not first_name or not last_name or not password:
            return Response({"error": "Tous les champs sont requis."}, status=status.HTTP_400_BAD_REQUEST)

        if password != confirm_password:
            return Response({"error": "Les mots de passe ne correspondent pas."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Cet email est déjà enregistré."}, status=status.HTTP_400_BAD_REQUEST)

        verification_code = str(random.randint(100000, 999999))
        # Stocker le code de vérification dans Redis avec une expiration (5 minutes)
        cache.set(f"admin_verification:{email}", verification_code, timeout=300)
        
        try:
            user = User.objects.create_user(
                first_name=first_name,
                last_name=last_name,
                email=email,
                username=email,  
                role="admin",
                is_active=False,
            )
            user.set_password(password) 
            user.save()

            logger.info(f"Admin créé : {email}, en attente de vérification.")

           
           
            send_verification_email.delay(email, verification_code)

            return Response(
                {"message": "Admin enregistré avec succès. Vérifiez votre email pour le code de vérification."},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            logger.error(f"Erreur lors de la création de l'admin : {str(e)}")
            return Response({"error": "Une erreur s'est produite lors de l'inscription."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegisterUserView(APIView):
    """
    Permet à un admin ou un installateur d'ajouter un utilisateur.
    L'utilisateur reçoit un email avec un lien pour compléter son inscription.
    """
    permission_classes = [permissions.IsAuthenticated]  

    def post(self, request):
        email = request.data.get('email')
        role = request.data.get('role')

        
        if role not in ['installateur', 'technicien', 'client']:
            return Response({"error": "Rôle invalide."}, status=status.HTTP_400_BAD_REQUEST)

        
        if request.user.role == 'installateur' and role == 'admin':
            return Response({"error": "Un installateur ne peut pas ajouter un admin."}, status=status.HTTP_403_FORBIDDEN)

        
        if User.objects.filter(email=email).exists():
            return Response({"error": "Cet email est déjà enregistré."}, status=status.HTTP_400_BAD_REQUEST)

        registration_token = str(uuid.uuid4())

        # Ajouter le token dans le cache
        cache.set(f"registration_token:{email}", registration_token, timeout=3600)  # 1 heure
        

        
        user = User.objects.create(
            email=email,
            role=role,
            username=email,
            is_active=False
        )
        user.set_password(registration_token)  
        user.save()

       
        FRONTEND_URL = "http://localhost:5173/complete-registration"
        registration_link = f"{FRONTEND_URL}?token={registration_token}&email={email}"
        send_registration_link.delay(email, registration_link)

        return Response({"message": "Utilisateur ajouté. Un email a été envoyé pour compléter l'inscription."}, status=status.HTTP_201_CREATED)


class CompleteRegistrationView(APIView):
    """
    Permet à un utilisateur de finaliser son inscription avec un mot de passe sécurisé.
    """
    permission_classes = [permissions.AllowAny]  

    def post(self, request):
        email = request.data.get('email')
        token = request.data.get('token')
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')

        if password != confirm_password:
            return Response({"error": "Les mots de passe ne correspondent pas."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            # Vérifier le token dans le cache
            cached_token = cache.get(f"registration_token:{email}")
            if cached_token and cached_token == token:
                user.set_password(password)
                user.is_active = True
                user.save()
                # Supprimer le token du cache après utilisation
                cache.delete(f"registration_token:{email}")
                return Response({"message": "Inscription complétée avec succès."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Token invalide."}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "Utilisateur non trouvé."}, status=status.HTTP_404_NOT_FOUND)

class GetUserProfileView(APIView):
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        user = request.user  
        return Response({
                "email": user.email,
                "first_name": user.first_name if user.first_name else "Non défini",
                "last_name": user.last_name if user.last_name else "Non défini",
                "role": user.role
            }, status=status.HTTP_200_OK)
class GetUserByTokenView(APIView):
    """
    Récupère les informations de l'utilisateur via le token d'inscription.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        email = request.query_params.get('email')
        token = request.query_params.get('token')
        
        # Vérifier d'abord dans le cache
        cache_key = f"user_info:{email}:{token}"
        cached_user = cache.get(cache_key)
        
        if cached_user:
            return Response(cached_user, status=status.HTTP_200_OK)
        
        try:
            user = User.objects.get(email=email, registration_token=token)
            user_data = {
                "email": user.email,
                "first_name": user.first_name if user.first_name else "",
                "last_name": user.last_name if user.last_name else "",
                "phone": user.phone if hasattr(user, "phone") else ""
            }
            
            # Mettre en cache pour 5 minutes
            cache.set(cache_key, user_data, timeout=300)
            
            return Response(user_data, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"error": "Utilisateur introuvable ou token invalide."}, status=status.HTTP_404_NOT_FOUND)

class VerifyAdminView(APIView):
    permission_classes = [permissions.AllowAny]  

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        if not email or not code:
            return Response({"error": "Email et code requis."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email, role='admin')
            verification_code = cache.get(f"admin_verification:{email}")

            if verification_code and verification_code == code:
                user.is_active = True
                user.save()

                # Supprimer le code de Redis après vérification réussie
                cache.delete(f"admin_verification:{email}")

                return Response({"detail": "Compte vérifié avec succès. Vous pouvez maintenant vous connecter."},
                                status=status.HTTP_200_OK)
            return Response({"error": "Code de vérification invalide ou expiré."}, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            return Response({"error": "Admin non trouvé."}, status=status.HTTP_404_NOT_FOUND)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get("identifier")
        password = request.data.get("password")

        if not identifier or not password:
            return Response({"error": "L'identifiant et le mot de passe sont requis."}, status=status.HTTP_400_BAD_REQUEST)

        # Vérifier si l'utilisateur est déjà en cache
        cache_key = f"user:{identifier}"
        cached_user = cache.get(cache_key)

        if cached_user:
            user = User.objects.filter(id=cached_user["id"]).first()
        else:
            user = User.objects.filter(email=identifier).first() or User.objects.filter(username=identifier).first()

            if user:
                cache.set(cache_key, {"id": user.id, "role": user.role, "is_active": user.is_active}, timeout=600)  # Stocké 10 min

        if user is None or not user.check_password(password):
            return Response({"error": "Identifiants invalides."}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_active:
            return Response({"error": "Votre compte est inactif. Veuillez vérifier votre email."}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)

        # Stocker le token dans Redis (expire après 1h)
        token_key = f"token:{user.id}"
        cache.set(token_key, str(refresh.access_token), timeout=3600)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
        }, status=status.HTTP_200_OK)






class UpdateProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        print("Utilisateur connecté :", self.request.user)
        return self.request.user  

    def update(self, request, *args, **kwargs):
        """
        Gère la mise à jour du profil et du mot de passe.
        """
        user = self.get_object()
        print("Données reçues pour mise à jour :", request.data)  

        serializer = self.get_serializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            print("Utilisateur mis à jour :", user.first_name, user.last_name)  
            return Response({"message": "Profil mis à jour avec succès.", "user": serializer.data})

        print("Erreurs de validation :", serializer.errors) 
        return Response(serializer.errors, status=400)

    
class ForgotPasswordView(APIView):
    """
    Permet à un utilisateur de demander une réinitialisation de mot de passe.
    Un email avec un code de vérification est envoyé.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"error": "L'email est requis."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)

            reset_code = str(random.randint(100000, 999999))
            
            # Stocker dans Redis pour 5 minutes
            cache.set(f"password_reset:{email}", reset_code, timeout=300)
            
            send_verification_email.delay(email, reset_code)

            return Response({"message": "Un code de vérification a été envoyé à votre email."}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"error": "Aucun utilisateur trouvé avec cet email."}, status=status.HTTP_404_NOT_FOUND)


class ResetPasswordView(APIView):
    """
    Permet à un utilisateur de réinitialiser son mot de passe en utilisant le code reçu par email.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not all([email, code, new_password, confirm_password]):
            return Response({"error": "Tous les champs sont requis."}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({"error": "Les mots de passe ne correspondent pas."}, status=status.HTTP_400_BAD_REQUEST)

        # Vérifier le code dans Redis
        cached_code = cache.get(f"password_reset:{email}")

        if cached_code and cached_code == code:
            try:
                user = User.objects.get(email=email)
                user.set_password(new_password)
                user.save()

                # Supprimer le code après utilisation
                cache.delete(f"password_reset:{email}")

                return Response({"message": "Mot de passe réinitialisé avec succès."}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({"error": "Utilisateur non trouvé."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"error": "Code de vérification invalide ou expiré."}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    Permet à l'utilisateur de se déconnecter en supprimant son token de Redis et en le blacklistant.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            print(f"Token reçu : {refresh_token}")  # Vérifie ce qui est envoyé

            if not refresh_token:
                return Response({"error": "Token de rafraîchissement requis."}, status=status.HTTP_400_BAD_REQUEST)

            # Blacklister le token de rafraîchissement
            token = RefreshToken(refresh_token)
            token.blacklist()  # Si ça plante ici, le token est soit expiré, soit déjà en blacklist

            # Supprimer le token de Redis
            token_key = f":1:token:{request.user.id}"
            cache.delete(token_key)

            return Response({"message": "Déconnexion réussie."}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
