from rest_framework import serializers
from .models import VehicleInventory, VehicleExpense

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleExpense
        # ADD 'is_active' here
        fields = ['id', 'vehicle', 'description', 'amount', 'date', 'is_active']

class InventorySerializer(serializers.ModelSerializer):
    expenses = ExpenseSerializer(many=True, read_only=True)
    total_expenses = serializers.ReadOnlyField()
    net_cost = serializers.ReadOnlyField()

    class Meta:
        model = VehicleInventory
        fields = '__all__'