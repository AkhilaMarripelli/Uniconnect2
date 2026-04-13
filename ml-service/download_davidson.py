import requests
import os

def download_dataset():
    url = "https://raw.githubusercontent.com/t-davidson/hate-speech-and-offensive-language/master/data/labeled_data.csv"
    save_path = os.path.join(os.path.dirname(__file__), "davidson_dataset.csv")
    
    print(f"Downloading Davidson dataset from: {url}")
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        with open(save_path, "wb") as f:
            f.write(response.content)
            
        print(f"✅ Success! Dataset saved at: {os.path.abspath(save_path)}")
        print(f"Total rows: {len(response.text.splitlines()) - 1}")
        
    except Exception as e:
        print(f"❌ Error downloading dataset: {e}")

if __name__ == "__main__":
    download_dataset()
