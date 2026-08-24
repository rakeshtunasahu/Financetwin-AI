import os
import sys

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.dataset_generator import generate_synthetic_data

if __name__ == "__main__":
    # Base path is backend directory
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print("Generating synthetic datasets...")
    generate_synthetic_data(base_path)
    print("Generation complete!")
