import os
import sys

# Dynamically add the workspace root to sys.path so 'backend' is recognized as a package
backend_parent = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_parent not in sys.path:
    sys.path.insert(0, backend_parent)

# FinanceTwin AI App Package

