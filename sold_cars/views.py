from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import SoldVehicle, SoldVehicleExpense
from .serializers import SoldVehicleSerializer
from inventory.models import VehicleInventory, VehicleExpense


class SoldVehicleViewSet(viewsets.ModelViewSet):
    queryset = SoldVehicle.objects.all().order_by('-sale_date')
    serializer_class = SoldVehicleSerializer

    @action(detail=False, methods=['post'])
    def sell_vehicle(self, request):
        inventory_id = request.data.get('inventory_id')
        sale_price = float(request.data.get('sale_price'))
        tax_amount = float(request.data.get('tax_amount', 0))
        sale_date = request.data.get('sale_date')
        customer_name = request.data.get('customer_name')

        try:
            car = VehicleInventory.objects.get(id=inventory_id)
            final_net_cost = car.net_cost
            final_profit = sale_price - final_net_cost

            with transaction.atomic():
                sold_car = SoldVehicle.objects.create(
                    year=car.year, make=car.make, model=car.model,
                    vin=car.vin, odometer=car.odometer,

                    # --- SAVE ORIGIN DATA HERE ---
                    original_purchase_date=car.purchase_date,
                    auction_name=car.auction_name,

                    purchase_price=car.purchase_price,
                    total_expenses=car.total_expenses,
                    net_cost=final_net_cost,
                    sale_price=sale_price,
                    tax_amount=tax_amount,
                    sale_date=sale_date,
                    customer_name=customer_name,
                    profit=final_profit
                )

                for exp in car.expenses.filter(is_active=True):
                    SoldVehicleExpense.objects.create(
                        sold_vehicle=sold_car,
                        description=exp.description,
                        amount=exp.amount,
                        date=exp.date
                    )

                car.delete()

            return Response({"status": "success"}, status=status.HTTP_201_CREATED)

        except VehicleInventory.DoesNotExist:
            return Response({"error": "Vehicle not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def return_to_inventory(self, request, pk=None):
        try:
            sold_car = self.get_object()

            with transaction.atomic():
                new_car = VehicleInventory.objects.create(
                    year=sold_car.year,
                    make=sold_car.make,
                    model=sold_car.model,
                    vin=sold_car.vin,
                    odometer=sold_car.odometer,
                    purchase_price=sold_car.purchase_price,
                    status='READY',
                    location='Returned',

                    # --- RESTORE ORIGIN DATA HERE ---
                    auction_name=sold_car.auction_name,
                    purchase_date=sold_car.original_purchase_date
                )

                for hist_exp in sold_car.history_expenses.all():
                    VehicleExpense.objects.create(
                        vehicle=new_car,
                        description=hist_exp.description,
                        amount=hist_exp.amount,
                        date=hist_exp.date,
                        is_active=True
                    )

                sold_car.delete()

            return Response({"status": "returned"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)