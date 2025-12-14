from rest_framework import viewsets
from .models import VehicleInventory, VehicleExpense
from .serializers import InventorySerializer, ExpenseSerializer

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = VehicleInventory.objects.all().order_by('-id')
    serializer_class = InventorySerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = VehicleExpense.objects.all()
    serializer_class = ExpenseSerializer

    # OVERRIDE THE DELETE COMMAND
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()