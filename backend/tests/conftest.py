import os
import sys

# Dynamically add the workspace root to sys.path so 'backend' is recognized during test collection
workspace_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if workspace_root not in sys.path:
    sys.path.insert(0, workspace_root)
