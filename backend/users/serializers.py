from rest_framework import serializers
from django.contrib.auth import get_user_model
import random
import string
from django.core.mail import send_mail
from django.conf import settings
from .tasks import send_verification_email
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class AdminRegistrationSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True)  

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'is_active', 'is_verified']
        read_only_fields = ('id', 'email', 'is_verified')
        extra_kwargs = {
            'password': {'write_only': True}  
        }
    
    def validate(self, data):
        """Check that the two password entries match and enforce any other rules."""
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        if data.get('role') != 'admin':
            raise serializers.ValidationError({"role": "Only 'admin' role can be registered via this endpoint."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        role = validated_data.pop('role', 'admin')
        email = validated_data.get('email')
        
        user = User(**validated_data)
        user.role = role
        user.is_active = False  
        user.set_password(validated_data['password'])

        
        code = ''.join(random.choices(string.digits, k=6))
        user.verification_code = code

        
        user.save()

        
        send_verification_email.apply_async(args=[user.email, code])  

        return user




class AdminVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    
    def validate(self, data):
        email = data.get('email').lower() 
        code = data.get('code')
        
        try:
            user = User.objects.get(email=email, role='admin')
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "No admin account found for this email."})
        if user.verification_code != code:
            raise serializers.ValidationError({"code": "Invalid verification code."})
        self.context['user'] = user
        return data
       



class UserProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    new_password = serializers.CharField(write_only=True, required=False)
    confirm_new_password = serializers.CharField(write_only=True, required=False)
    old_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'role', 'phone_number' , 'new_password', 'confirm_new_password', 'old_password']
        read_only_fields = ['role']  

    def validate_email(self, value):
        user = self.context['request'].user
        if user.role != 'admin' and user.email != value:
            raise serializers.ValidationError("Seuls les administrateurs peuvent modifier leur email.")
        return value

    def validate(self, data):
        user = self.context['request'].user
        new_password = data.get('new_password')
        confirm_new_password = data.get('confirm_new_password')
        old_password = data.get('old_password')

        if new_password or confirm_new_password or old_password:
            if not old_password:
                raise serializers.ValidationError({"old_password": "L'ancien mot de passe est requis pour en définir un nouveau."})
            if not user.check_password(old_password):
                raise serializers.ValidationError({"old_password": "L'ancien mot de passe est incorrect."})
            if new_password != confirm_new_password:
                raise serializers.ValidationError({"new_password": "Les nouveaux mots de passe ne correspondent pas."})

        return data

    def update(self, instance, validated_data):
        """
        Mise à jour du profil et du mot de passe si nécessaire.
        """
        if 'new_password' in validated_data:
            instance.set_password(validated_data['new_password'])
            validated_data.pop('new_password', None)
            validated_data.pop('confirm_new_password', None)
            validated_data.pop('old_password', None)

        if 'first_name' in validated_data and validated_data['first_name'] != "":
            instance.first_name = validated_data['first_name']
        elif instance.first_name == "":
            instance.first_name = "Utilisateur"

        if 'last_name' in validated_data and validated_data['last_name'] != "":
            instance.last_name = validated_data['last_name']
        elif instance.last_name == "":
            instance.last_name = "Inconnu"

        instance.save()
        return instance

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'is_verified')
        read_only_fields = ('id', 'email', 'is_verified')

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'role', 'is_active','phone_number')