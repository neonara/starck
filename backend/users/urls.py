from django.urls import path
from .views import RegisterAdminView, RegisterUserView, CompleteRegistrationView,GetUserByTokenView, VerifyAdminView, LoginView, ForgotPasswordView, ResetPasswordView

urlpatterns = [
    path('register-admin/', RegisterAdminView.as_view(), name='register-admin'),  
    path('register/', RegisterUserView.as_view(), name='register'),
    path('complete-registration/', CompleteRegistrationView.as_view(), name='complete-registration'),
    path('get-user-by-token/', GetUserByTokenView.as_view(), name='get-user-by-token'),
    path('verify-admin/', VerifyAdminView.as_view(), name='verify-admin'),
    path('login/', LoginView.as_view(), name='login'),
     path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),


]
