from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

load_dotenv()

FATSECRET_CLIENT_ID = os.getenv('FATSECRET_CLIENT_ID', 'c513645381684dcf90d30797625ed5ae')
FATSECRET_CLIENT_SECRET = os.getenv('FATSECRET_CLIENT_SECRET', '2a95938769104978b18f29acb93d1650')

# Store the access token and its expiration
access_token = None
token_expiry = None

def get_oauth_token():
    global access_token, token_expiry
    
    # Check if we have a valid token
    if access_token and token_expiry and datetime.now() < token_expiry:
        return access_token

    # Get new token
    token_url = 'https://oauth.fatsecret.com/connect/token'
    
    # Prepare the request
    auth_data = {
        'grant_type': 'client_credentials',
        'scope': 'basic'
    }
    
    response = requests.post(
        token_url,
        auth=(FATSECRET_CLIENT_ID, FATSECRET_CLIENT_SECRET),
        data=auth_data
    )
    
    if response.status_code != 200:
        raise Exception('Failed to obtain OAuth token')
        
    token_data = response.json()
    access_token = token_data['access_token']
    # Set expiry to slightly less than the actual expiry time
    token_expiry = datetime.now() + timedelta(seconds=token_data['expires_in'] - 60)
    
    return access_token

@app.route('/nutrition', methods=['POST'])
def get_nutrition():
    try:
        data = request.json
        if not data or 'food_items' not in data:
            return jsonify({'error': 'No food items provided'}), 400
            
        food_items = data.get('food_items')
        
        # Get OAuth token
        token = get_oauth_token()
        
        total_nutrition = {
            'calories': 0,
            'protein': 0,
            'carbohydrates': 0,
            'fat': 0
        }

        detected_foods = []
        analysis = {
            'meal_type': 'unknown',
            'healthiness_score': 0,
            'suggestions': []
        }

        # Search for each food item
        for food_item in food_items:
            try:
                # Clean up the food item string
                cleaned_item = food_item.lower().strip()
                search_term = cleaned_item.split('(')[0].strip()  # Remove portion info for search
                
                # Search for the food item
                search_response = requests.post(
                    'https://platform.fatsecret.com/rest/server.api',
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f'Bearer {token}'
                    },
                    json={
                        'method': 'foods.search',
                        'search_expression': search_term,
                        'format': 'json',
                        'max_results': 3  # Get top 3 matches
                    }
                )

                if search_response.status_code == 200:
                    search_data = search_response.json()
                    if 'foods' in search_data and 'food' in search_data['foods']:
                        foods = search_data['foods']['food']
                        if not isinstance(foods, list):
                            foods = [foods]

                        # Get the best match
                        food = foods[0]
                        food_id = food['food_id']

                        # Get detailed nutrition data
                        detail_response = requests.post(
                            'https://platform.fatsecret.com/rest/server.api',
                            headers={
                                'Content-Type': 'application/json',
                                'Authorization': f'Bearer {token}'
                            },
                            json={
                                'method': 'food.get.v2',
                                'food_id': food_id,
                                'format': 'json'
                            }
                        )

                        if detail_response.status_code == 200:
                            detail_data = detail_response.json()
                            if 'food' in detail_data:
                                food_details = detail_data['food']
                                serving = food_details.get('servings', {}).get('serving', [])
                                if isinstance(serving, dict):
                                    serving = [serving]

                                if serving:
                                    detected_foods.append(f"{food_item} ({serving[0].get('serving_description', 'serving')})")
                                    total_nutrition['calories'] += float(serving[0].get('calories', 0))
                                    total_nutrition['protein'] += float(serving[0].get('protein', 0))
                                    total_nutrition['carbohydrates'] += float(serving[0].get('carbohydrate', 0))
                                    total_nutrition['fat'] += float(serving[0].get('fat', 0))

            except Exception as food_error:
                print(f"Error processing food item {food_item}: {str(food_error)}")
                continue

        # Calculate meal analysis
        total_calories = total_nutrition['calories']
        if total_calories > 0:
            protein_ratio = (total_nutrition['protein'] * 4 / total_calories) * 100
            carb_ratio = (total_nutrition['carbohydrates'] * 4 / total_calories) * 100
            fat_ratio = (total_nutrition['fat'] * 9 / total_calories) * 100

            analysis['healthiness_score'] = min(100, max(0, (
                (protein_ratio >= 10 and protein_ratio <= 35) * 33 +
                (carb_ratio >= 45 and carb_ratio <= 65) * 33 +
                (fat_ratio >= 20 and fat_ratio <= 35) * 34
            )))

            # Add suggestions based on analysis
            if protein_ratio < 10:
                analysis['suggestions'].append("Consider adding more protein-rich foods")
            if carb_ratio < 45:
                analysis['suggestions'].append("You might need more complex carbohydrates")
            if fat_ratio < 20:
                analysis['suggestions'].append("Consider adding healthy fats")

        return jsonify({
            'detected_foods': detected_foods,
            'nutrition': total_nutrition,
            'analysis': analysis
        })

    except Exception as e:
        print(f"Server Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True) 