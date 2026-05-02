from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import json
import re
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Groq Client Configuration
client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

# Paths
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, 'model.pkl')
VECTORIZER_PATH = os.path.join(BASE_DIR, 'vectorizer.pkl')
KB_PATH = os.path.join(BASE_DIR, 'knowledge_base.json')

def load_ai_model():
    if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            vectorizer = joblib.load(VECTORIZER_PATH)
            return model, vectorizer
        except Exception as e:
            print(f"Error loading model: {e}")
    return None, None

def load_kb():
    if os.path.exists(KB_PATH):
        with open(KB_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

model, vectorizer = load_ai_model()
kb_data = load_kb()

def get_relevant_context(message, products=None):
    """
    Strict price filtering and context retrieval.
    """
    message = message.lower()
    # Normalize common Roman Urdu variations
    message = message.replace('srdi', 'sardi').replace('srdiyoon', 'sardi').replace('kaprai', 'kapray').replace('kmrai', 'kapray').replace('km rai', 'kapray')
    
    context_parts = []
    kb_info = kb_data.get("website_info", {})
    
    # 1. Knowledge Base Matching
    kb_triggers = {
        'shipping': ['shipping', 'delivery', 'charges', 'bhej', 'paisa', 'kiraya', 'miley ga', 'tracking'],
        'returns_refunds': ['return', 'refund', 'wapas', 'tabdeel', 'exchange', 'policy', 'badal'],
        'privacy_policy': ['privacy', 'data', 'security', 'mehfooz', 'policy', 'hifazat'],
        'contact': ['contact', 'rabta', 'number', 'email', 'whatsapp', 'address', 'location', 'pata', 'shehar', 'timing'],
        'about': ['about', 'kaun ho', 'brand', 'company', 'lumiere', 'maloomat']
    }

    for key, keywords in kb_triggers.items():
        if any(kw in message for kw in keywords):
            context_parts.append(f"{key.upper()}: {json.dumps(kb_info.get(key))}")

    # 2. Product Matching (Strict Price)
    if products:
        found_products = []
        
        # Semantic mapping for products
        semantic_map = {
            'winter': ['hoodie', 'jacket', 'sardi', 'garam', 'sweater', 'winter', 'coat'],
            'summer': ['shirt', 't-shirt', 'summer', 'halka', 'cotton', 'garmi'],
            'shoes': ['sneaker', 'shoe', 'jootay', 'jogger', 'footwear'],
            'accessories': ['cap', 'hat', 'topi', 'bag', 'wallet', 'caps']
        }

        # Check for price limit
        numbers = re.findall(r'\d+', message)
        target_price = int(numbers[0]) if numbers else None

        # Check for categories
        active_categories = []
        for cat_name, keywords in semantic_map.items():
            if any(kw in message for kw in keywords):
                active_categories.append(cat_name)

        for p in products:
            name = p.get('name', '').lower()
            cat = p.get('category', '').lower()
            desc = p.get('description', '').lower()
            price = p.get('price', 0)
            
            # STRICT PRICE FILTER: Must be less than or equal to target_price if specified
            if target_price and price > target_price:
                continue
                
            is_match = False
            
            # Match by explicit name/category in message
            if any(word in message for word in name.split()) or any(word in message for word in cat.split()):
                is_match = True
                
            # Match by semantic category expansion
            if active_categories:
                for acat in active_categories:
                    if any(kw in name or kw in desc or kw in cat for kw in semantic_map[acat]):
                        is_match = True
                        break
            
            # General search match if no specific category found
            if not active_categories and not target_price:
                if any(word in message for word in ['product', 'cheez', 'item', 'dikhao']):
                    is_match = True
            
            # If user only specified price, show all products under that price
            if target_price and not active_categories:
                is_match = True

            if is_match:
                found_products.append({
                    "Name": p.get('name'),
                    "Price": f"Rs. {price}",
                    "Category": p.get('category'),
                    "Details": p.get('description')
                })
        
        if found_products:
            # Sort by highest price first (but still under limit)
            found_products.sort(key=lambda x: int(re.sub(r'[^\d]', '', str(x['Price']))), reverse=True)
            context_parts.append(f"PRODUCTS_IN_STOCK (STRICTLY UNDER PRICE LIMIT): {json.dumps(found_products[:15])}")
        
    return "\n".join(context_parts)

def get_grok_response(user_message, context=None):
    try:
        # STRICT SYSTEM PROMPT - NO FUZZY WORDS - STRICT PRICE
        system_prompt = (
            "Aap Lumiere website ke AI assistant hain. Aapne hamesha TO THE POINT aur DIRECT jawab dena hai.\n\n"
            "STRICT RULES:\n"
            "1. Roman Urdu mein jawab dein.\n"
            "2. FUZZY WORDS YA FAZOOL BAATEIN NA KAREIN (e.g., 'hum koshish kar sakte hain', 'options dikhane ki koshish', 'agar aapko pasand aaye').\n"
            "3. PRICE LIMIT: Agar user ne koi price limit di hai, toh SIRF wahi products dikhayein jo us ke barabar ya us se kam hain. "
            "KABHI BHI limit se zyada wali product na dikhayein.\n"
            "4. Agar koi product limit mein nahi milti, toh sirf ye kahein: 'Maafi chahte hain, is range mein koi product mojood nahi hai.'\n"
            "5. Context se bahar ki koi baat na karein.\n"
            "6. Direct list format mein jawab dein.\n"
            "7. Sari products IN STOCK hain."
        )
        
        messages = [{"role": "system", "content": system_prompt}]
        
        if context:
            messages.append({"role": "user", "content": f"STRICT_DATA_CONTEXT:\n{context}"})
        else:
            # If context is empty, it means no products were found within price limit
            if re.search(r'\d+', user_message):
                return "Maafi chahte hain, is range mein koi product mojood nahi hai."
            
        messages.append({"role": "user", "content": user_message})
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.0, # NO creativity
            max_tokens=400
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Groq API Error: {e}")
        return "Service temporarily unavailable."

@app.route('/predict', methods=['POST'])
def predict():
    if model is None or vectorizer is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    data = request.json
    message = data.get('message', '')
    products = data.get('products', [])
    
    if not message:
        return jsonify({"error": "No message provided"}), 400

    # 1. Intent Detection
    message_vec = vectorizer.transform([message])
    intent = model.predict(message_vec)[0]
    
    # 2. Strict Context Retrieval
    context = get_relevant_context(message, products)
    
    # 3. Direct Response
    response_text = get_grok_response(message, context)

    return jsonify({
        "message": message,
        "intent": intent,
        "response": response_text
    })

@app.route('/status', methods=['GET'])
def status():
    return jsonify({
        "status": "running",
        "model_loaded": model is not None,
        "kb_loaded": bool(kb_data)
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)
