# views.py
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ProductionConsommation
from .serializers import ProductionConsommationSerializer

class ProductionConsommationAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = ProductionConsommation.objects.all()
        serializer = ProductionConsommationSerializer(data, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProductionConsommationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
