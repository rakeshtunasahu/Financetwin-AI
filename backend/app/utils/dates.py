from datetime import datetime, date, timedelta
from typing import Union, Any

def to_date(val: Any) -> date:
    if isinstance(val, date):
        if isinstance(val, datetime):
            return val.date()
        return val
    if isinstance(val, str):
        val_clean = val.strip()
        for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%SZ", "%Y/%m/%d"):
            try:
                return datetime.strptime(val_clean, fmt).date()
            except ValueError:
                continue
    raise ValueError(f"Cannot parse date: {val}")

def days_between(d1: date, d2: date) -> int:
    return abs((to_date(d1) - to_date(d2)).days)

def is_date_within_tolerance(d1: date, d2: date, tolerance_days: int = 2) -> bool:
    return days_between(d1, d2) <= tolerance_days
