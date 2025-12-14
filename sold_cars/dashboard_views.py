from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum, Count
from datetime import date, timedelta
from .models import SoldVehicle
from inventory.models import VehicleInventory, VehicleExpense


def get_last_12_months():
    """Generates a list of the last 12 month names (e.g., ['Jan 2025', 'Feb 2025'])"""
    months = []
    today = date.today()
    current = today.replace(day=1)  # Start from first of this month

    for _ in range(12):
        months.append(current)
        # Move back one month
        # Logic: subtract 1 day from 1st of month to get last day of prev month, then replace day=1
        first_of_prev = (current - timedelta(days=1)).replace(day=1)
        current = first_of_prev

    return sorted(months)


@api_view(['GET'])
def dashboard_stats(request):
    # --- 1. KPI CARDS ---
    total_sold = SoldVehicle.objects.count()
    total_profit = SoldVehicle.objects.aggregate(Sum('profit'))['profit__sum'] or 0
    total_revenue = SoldVehicle.objects.aggregate(Sum('sale_price'))['sale_price__sum'] or 0

    cars_in_stock = VehicleInventory.objects.count()
    inventory_cost = VehicleInventory.objects.aggregate(Sum('purchase_price'))['purchase_price__sum'] or 0
    active_expenses = VehicleExpense.objects.filter(is_active=True).aggregate(Sum('amount'))['amount__sum'] or 0
    total_inventory_value = inventory_cost + active_expenses

    # --- 2. INVENTORY BREAKDOWN ---
    status_counts = VehicleInventory.objects.values('status').annotate(count=Count('id'))
    status_data = [{"name": item['status'], "value": item['count']} for item in status_counts]

    brand_counts = VehicleInventory.objects.values('make').annotate(count=Count('id')).order_by('-count')[:5]
    brand_data = [{"name": item['make'], "count": item['count']} for item in brand_counts]

    # --- 3. RECENT ACTIVITY ---
    recent_sales = SoldVehicle.objects.all().order_by('-sale_date')[:5]
    recent_sales_data = [{
        "id": s.id, "name": f"{s.year} {s.make} {s.model}",
        "price": s.sale_price, "date": s.sale_date, "profit": s.profit
    } for s in recent_sales]

    recent_adds = VehicleInventory.objects.all().order_by('-id')[:5]
    recent_adds_data = [{
        "id": c.id, "name": f"{c.year} {c.make} {c.model}",
        "price": c.purchase_price, "date": c.purchase_date, "status": c.status
    } for c in recent_adds]

    # --- 4. 12-MONTH TRENDS (NEW LOGIC) ---
    # A. Initialize empty map for last 12 months
    last_12_dates = get_last_12_months()  # List of date objects
    trend_map = {}

    for d in last_12_dates:
        key = d.strftime("%b %Y")  # e.g. "Dec 2025"
        trend_map[key] = {"month": key, "profit": 0, "count": 0}

    # B. Fetch sales from last year only
    one_year_ago = date.today() - timedelta(days=365)
    year_sales = SoldVehicle.objects.filter(sale_date__gte=one_year_ago)

    # C. Fill the map
    for sale in year_sales:
        month_key = sale.sale_date.strftime("%b %Y")
        if month_key in trend_map:
            trend_map[month_key]["profit"] += float(sale.profit)
            trend_map[month_key]["count"] += 1

    # D. Convert back to list (sorted chronologically)
    trend_data = list(trend_map.values())

    return Response({
        "kpi": {
            "total_sold": total_sold,
            "total_profit": total_profit,
            "total_revenue": total_revenue,
            "cars_in_stock": cars_in_stock,
            "inventory_value": total_inventory_value,
        },
        "charts": {
            "status_data": status_data,
            "brand_data": brand_data,
            "trend_data": trend_data  # <--- New 12-month data
        },
        "activity": {
            "recent_sales": recent_sales_data,
            "recent_adds": recent_adds_data
        }
    })