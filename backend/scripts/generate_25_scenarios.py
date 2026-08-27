import os
import sys

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.dataset_25_scenarios import generate_25_feature_datasets

if __name__ == "__main__":
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print("Generating 25 feature test datasets...")
    data_dir = generate_25_feature_datasets(base_path)
    print(f"25 Feature Test Datasets successfully written to {data_dir}")
