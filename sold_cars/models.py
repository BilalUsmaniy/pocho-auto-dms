from django.db import models


class SoldVehicle(models.Model):
    # --- Original Vehicle Details ---
    year = models.IntegerField()
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    vin = models.CharField(max_length=17)
    odometer = models.IntegerField()

    # --- Origin History (NEW FIELDS) ---
    original_purchase_date = models.DateField(null=True, blank=True)
    auction_name = models.CharField(max_length=100, blank=True)

    # --- Financials ---
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_expenses = models.DecimalField(max_digits=10, decimal_places=2)
    net_cost = models.DecimalField(max_digits=10, decimal_places=2)

    # --- Sales Info ---
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    sale_date = models.DateField()
    customer_name = models.CharField(max_length=100)
    profit = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"SOLD: {self.year} {self.make} - {self.customer_name}"


class SoldVehicleExpense(models.Model):
    sold_vehicle = models.ForeignKey(SoldVehicle, related_name='history_expenses', on_delete=models.CASCADE)
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()

    def __str__(self):
        return f"{self.description} (${self.amount})"