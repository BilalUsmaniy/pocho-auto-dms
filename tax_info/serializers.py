from rest_framework import serializers
from .models import TaxRecord

class TaxRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxRecord
        fields = '__all__'