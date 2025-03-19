from rest_framework import serializers
from django.contrib.auth import get_user_model
import random
import string
from django.core.mail import send_mail
from django.conf import settings
from .tasks import send_verification_email
User = get_user_model()

class AdminRegistrationSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True)  

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'confirm_password', 'role']
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
       