from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
import os
import anthropic
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)
CORS(app)
load_dotenv()

print("Starting server...")
api_key = os.getenv("ANTHROPIC_API_KEY")
client = anthropic.Client(api_key=api_key)

SYSTEM_PROMPT = """You are a skilled therapist named Dawn having a natural conversation through text messages. Keep responses brief and conversational - just 1-2 sentences, like a text. Never make lists or multi-part responses.

Guide people to their own insights through gentle questions rather than giving advice or solutions. Mirror their language and emotions, then ask one thoughtful question that helps them explore deeper.

For difficult topics, break them down into smaller pieces through questions. Stay with one aspect at a time. Be comfortable asking simple questions like "Can you tell me more about that?" or "How did that make you feel?"

Begin simply with "What brings you here today?" or a natural response to what they share. Avoid clinical language - write like a caring professional would text."""

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "Server is running"}), 200

@app.route("/api/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
        
    try:
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({"error": "Invalid request data"}), 400
            
        user_message = data["message"]
        chat_history = data.get("history", [])
        
        # Convert chat history to proper format
        messages = []
        for msg in chat_history:
            if msg["role"] != "system":
                messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Add the new user message
        messages.append({"role": "user", "content": user_message})
        
        response = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=1000,
            temperature=0.7,
            system=SYSTEM_PROMPT,
            messages=messages
        )
        
        return jsonify({"response": response.content[0].text})
    except Exception as e:
        print(f"Error in /api/chat: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True,
        threaded=True
    )
