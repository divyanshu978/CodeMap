import os
from collections import Counter

class DataProcessor:
    def __init__(self, data):
        self.data = data

    def count_items(self):
        return Counter(self.data)

def process_data(data_list):
    processor = DataProcessor(data_list)
    counts = processor.count_items()
    print(f"Counts: {counts}")

process_data([1, 2, 2, 3])
