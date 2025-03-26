from django.urls import path
from .views import RegisterAdminView, RegisterUserView, CompleteRegistrationView, VerifyAdminView, LoginView, UpdateProfileView, GetUserProfileView , GetUserByTokenView , ForgotPasswordView, ResetPasswordView, LogoutView

urlpatterns = [
    path('register-admin/', RegisterAdminView.as_view(), name='register-admin'),  
    path('register/', RegisterUserView.as_view(), name='register'),
    path('complete-registration/', CompleteRegistrationView.as_view(), name='complete-registration'),
    path('get-profile/', GetUserProfileView.as_view(), name='get-profile'),
    path('get-userbytokenview/', GetUserByTokenView.as_view(), name='get-userbytokenview'),
    path('verify-admin/', VerifyAdminView.as_view(), name='verify-admin'),
    path('login/', LoginView.as_view(), name='login'),
    path('update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
    path('logout/', LogoutView.as_view(), name='logout'),

    



]
