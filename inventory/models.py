from django.db import models
from django.db.models import Sum


class VehicleInventory(models.Model):
    STATUS_CHOICES = [
        ('READY', 'Ready for Sale'),
        ('SERVICE', 'In Service'),
        ('SOLD', 'Sold'),
    ]
    # ... (Keep existing fields: purchase_date, auction_name, status, location, year, make, model, vin, odometer) ...
    purchase_date = models.DateField(null=True, blank=True)
    auction_name = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='READY')
    location = models.CharField(max_length=100, blank=True)

    year = models.IntegerField()
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    vin = models.CharField(max_length=17, unique=True)
    odometer = models.IntegerField()
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def total_expenses(self):
        # UPDATE: Only sum up expenses where is_active is True
        total = self.expenses.filter(is_active=True).aggregate(Sum('amount'))['amount__sum']
        return total if total else 0.00

    @property
    def net_cost(self):
        return float(self.purchase_price) + float(self.total_expenses)

    def __str__(self):
        return f"{self.year} {self.make} {self.model}"


class VehicleExpense(models.Model):
    vehicle = models.ForeignKey(VehicleInventory, related_name='expenses', on_delete=models.CASCADE)
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(auto_now_add=True)

    # NEW: This flag determines if the expense counts or not
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.description}: ${self.amount}"