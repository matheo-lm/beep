import os
import json
from pathlib import Path

# Directory containing JSON files to merge
source_directory = "feeds"
output_file = "feeds/merged.json"

# Ensure the source directory exists
Path(source_directory).mkdir(parents=True, exist_ok=True)

# List all JSON files in the directory
json_files = [f for f in os.listdir(source_directory) if f.endswith(".json")]

merged_data = []

# Process each JSON file
for json_file in json_files:
    file_path = os.path.join(source_directory, json_file)
    try:
        with open(file_path, "r") as file:
            data = json.load(file)
            
            # If the data is a list, add a source tag to each item
            if isinstance(data, list):
                for item in data:
                    item["_source"] = json_file
                merged_data.extend(data)
            # If the data is an object, wrap it in a list and add a source tag
            elif isinstance(data, dict):
                data["_source"] = json_file
                merged_data.append(data)
            else:
                print(f"Skipping unsupported format in {json_file}")
    except Exception as e:
        print(f"Error processing {json_file}: {e}")

# Write the merged data to the output file
try:
    with open(output_file, "w") as file:
        json.dump(merged_data, file, indent=4)
    print(f"Merged JSON written to {output_file}")
except Exception as e:
    print(f"Error writing merged JSON: {e}")
