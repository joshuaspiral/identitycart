"""Real-time product search using SerpAPI"""

import os
import requests
from typing import List, Dict, Any
from urllib.parse import quote_plus

SERPAPI_KEY = os.getenv("SERPAPI_API_KEY", "")

def search_products(query: str, max_results: int = 10) -> List[Dict[str, Any]]:
    """
    Search for products using SerpAPI Google Shopping
    
    Args:
        query: Search query (e.g., "macbook pro m3")
        max_results: Maximum number of results to return
        
    Returns:
        List of product dictionaries with normalized structure
    """
    
    if not SERPAPI_KEY:
        raise Exception("SERPAPI_API_KEY not configured. Real-time search unavailable.")
    
    try:
        url = "https://serpapi.com/search"
        params = {
            "engine": "google_shopping",
            "q": query,
            "api_key": SERPAPI_KEY,
            "num": max_results,
            "gl": "us"  # Country: United States
        }
        
        response = requests.get(url, params=params, timeout=20)  # Increased timeout
        response.raise_for_status()
        data = response.json()
        
        # Parse SerpAPI results into our format
        products = []
        for item in data.get("shopping_results", [])[:max_results]:
            product = {
                "id": f"serp-{item.get('position', 0)}",
                "name": item.get("title", "Unknown Product"),
                "price": parse_price(item.get("price", "$0")),
                "image_url": item.get("thumbnail", ""),
                "link": item.get("link") or f"https://www.google.com/search?tbm=shop&q={quote_plus(item.get('title', ''))}",
                "source": item.get("source", "Google Shopping"),
                "rating": item.get("rating", 0),
                "reviews": item.get("reviews", 0),
                "category": categorize_product(item.get("title", "")),
                "specs": extract_specs(item),
                "repairability_score": calculate_repairability(item.get("title", "")),
                "tags": generate_tags(item.get("title", ""))
            }
            products.append(product)
        
        return products
        
    except Exception as e:
        print(f"SerpAPI error: {e}")
        raise  # Propagate error instead of falling back

def parse_price(price_str: str) -> float:
    """Extract numeric price from string"""
    try:
        # Remove $ and commas
        clean = price_str.replace("$", "").replace(",", "")
        return float(clean)
    except:
        return 0.0

def categorize_product(title: str) -> str:
    """Categorize product from title"""
    title_lower = title.lower()
    
    # Check for laptop Book models first
    if "galaxy book" in title_lower or "surface book" in title_lower or "zenbook" in title_lower:
        return "laptop"
        
    if any(word in title_lower for word in ["laptop", "macbook", "thinkpad", "chromebook", "notebook", "surface"]):
        return "laptop"
    elif any(word in title_lower for word in ["desktop", "gaming pc", "tower", "computer", "ibuypower", "cyberpower", "alienware", "mac studio", "mini"]):
        return "desktop"
    elif any(word in title_lower for word in ["headphone", "earbuds", "airpods", "speaker", "headset"]):
        return "audio"
    elif any(word in title_lower for word in ["keyboard", "mouse", "monitor", "webcam"]):
        return "peripherals"
    elif any(word in title_lower for word in ["phone", "iphone", "galaxy", "pixel", "android"]):
        return "phone"
    elif any(word in title_lower for word in ["watch", "wearable"]):
        return "wearable"
    elif any(word in title_lower for word in ["camera", "dslr", "mirrorless"]):
        return "camera"
    elif any(word in title_lower for word in ["tv", "television", "oled"]):
        return "tv"
    else:
        return "electronics"

def extract_specs(item: Dict) -> Dict[str, str]:
    """Extract key specs from product data"""
    specs = {}
    
    # Try product_attributes field
    product_attributes = item.get("product_attributes", [])
    if product_attributes:
        for attr in product_attributes:
            if isinstance(attr, dict):
                # Handle dict format: {"name": "Storage", "value": "512GB"}
                name = attr.get("name", "").lower()
                value = attr.get("value", "")
                if name and value:
                    # Map common attribute names
                    if "storage" in name or "ssd" in name or "hdd" in name:
                        specs["Storage"] = str(value)
                    elif "memory" in name or "ram" in name:
                        specs["Memory"] = str(value)
                    elif "display" in name or "screen" in name or "monitor" in name:
                        specs["Display"] = str(value)
                    elif "processor" in name or "cpu" in name:
                        specs["Processor"] = str(value)
            elif isinstance(attr, str):
                # Handle string format
                attr_lower = attr.lower()
                if "gb" in attr_lower or "tb" in attr_lower:
                    if "Storage" not in specs:
                        specs["Storage"] = attr
                elif "ram" in attr_lower or "memory" in attr_lower:
                    if "Memory" not in specs:
                        specs["Memory"] = attr
    
    # Extract from extensions field
    extensions = item.get("extensions", [])
    for ext in extensions:
        # Convert to string if it's not already
        ext_str = str(ext) if not isinstance(ext, str) else ext
        ext_lower = ext_str.lower()
        
        if ("gb" in ext_lower or "tb" in ext_lower) and "Storage" not in specs:
            specs["Storage"] = ext_str
        elif ("inch" in ext_lower or '"' in ext_str) and "Display" not in specs:
            specs["Display"] = ext_str
        elif "hz" in ext_lower and "Refresh Rate" not in specs:
            specs["Refresh Rate"] = ext_str
        elif ("ram" in ext_lower or "memory" in ext_lower) and "Memory" not in specs:
            specs["Memory"] = ext_str
            
    # Extract from title as fallback
    title = item.get("title", "")
    import re
    
    if "Storage" not in specs:
        storage_match = re.search(r'(\d+(?:TB|GB))\s*(?:SSD|HDD|Storage)?', title, re.IGNORECASE)
        if storage_match:
            specs["Storage"] = storage_match.group(1).upper()
            
    if "Memory" not in specs:
        ram_match = re.search(r'(\d+)\s*GB\s*(?:RAM|Memory)?', title, re.IGNORECASE)
        if ram_match:
            specs["Memory"] = f"{ram_match.group(1)}GB"
            
    if "Display" not in specs:
        screen_match = re.search(r'(\d+(?:\.\d+)?)(?:\s*\"|\s*inch)', title, re.IGNORECASE)
        if screen_match:
            specs["Display"] = f"{screen_match.group(1)}\""
            
    if "Processor" not in specs:
        cpu_match = re.search(r'(M[1-4]\s*(?:Pro|Max|Ultra)?|Core\s*i\d|Ryzen\s*\d|Snapdragon|Tensor)', title, re.IGNORECASE)
        if cpu_match:
            specs["Processor"] = cpu_match.group(1)
            
    # Extract brand
    common_brands = ["Samsung", "Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "LG", "Microsoft", "Razer", "MSI", "Sony", "Bose"]
    for brand in common_brands:
        if brand.lower() in title.lower():
            specs["Brand"] = brand
            break
            
    if "Brand" not in specs:
        specs["Brand"] = item.get("source", "Unknown")
        
    if not specs:
        specs["Summary"] = "No detailed specifications available via API."
        
    return specs

def generate_tags(title: str) -> List[str]:
    """Generate tags from title"""
    tags = []
    title_lower = title.lower()
    
    if "pro" in title_lower or "premium" in title_lower or "ultra" in title_lower or "max" in title_lower:
        tags.append("premium")
    if "gaming" in title_lower or "rgb" in title_lower or "rtx" in title_lower:
        tags.append("gaming")
    if "wireless" in title_lower or "bluetooth" in title_lower:
        tags.append("wireless")
    if "eco" in title_lower or "sustainable" in title_lower:
        tags.append("eco-friendly")
        
    return tags

def calculate_repairability(title: str) -> int:
    """Estimate repairability score (1-10)"""
    title_lower = title.lower()
    
    # High repairability brands
    if any(brand in title_lower for brand in ["framework", "fairphone", "system76"]):
        return 9
    
    # Good repairability
    if any(brand in title_lower for brand in ["thinkpad", "elitebook", "latitude", "dell", "lenovo"]):
        return 7
    
    # Moderate
    if any(brand in title_lower for brand in ["asus", "acer", "hp", "msi", "samsung"]):
        return 6
        
    # Low repairability (glued, soldered)
    if any(brand in title_lower for brand in ["macbook", "apple", "ipad", "iphone", "surface", "microsoft"]):
        return 3
        
    # Very low/Disposable
    if any(word in title_lower for word in ["airpods", "buds", "disposable"]):
        return 1
        
    return 5  # Default average
