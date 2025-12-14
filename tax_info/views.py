from rest_framework import viewsets
from .models import TaxRecord
from .serializers import TaxRecordSerializer

class TaxRecordViewSet(viewsets.ModelViewSet):
    queryset = TaxRecord.objects.all()
    serializer_class = TaxRecordSerializer