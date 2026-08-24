from decimal import Decimal, ROUND_HALF_UP
from typing import Any

def to_decimal(val: Any) -> Decimal:
    if val is None:
        return Decimal("0.0000")
    if isinstance(val, Decimal):
        return val
    try:
        return Decimal(str(val))
    except Exception:
        return Decimal("0.0000")

def quantize_money(amount: Decimal) -> Decimal:
    return amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def is_amount_close(a: Decimal, b: Decimal, tolerance: Decimal = Decimal("1.00")) -> bool:
    return abs(to_decimal(a) - to_decimal(b)) <= to_decimal(tolerance)
