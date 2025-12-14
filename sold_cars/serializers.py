from rest_framework import serializers
from .models import SoldVehicle, SoldVehicleExpense

class SoldVehicleExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoldVehicleExpense
        fields = ['description', 'amount', 'date']

class SoldVehicleSerializer(serializers.ModelSerializer):
    # Include the list of history expenses nested inside the Sold Vehicle object
    history_expenses = SoldVehicleExpenseSerializer(many=True, read_only=True)

    class Meta:
        model = SoldVehicle
        fields = '__all__'