from flask import Flask
from flask_cors import CORS
from api.db_api import db_api
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": [
    f"http://localhost:3000",
    f"http://{os.getenv('API_HOST', 'localhost')}:3000"
]}})
app.register_blueprint(db_api, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv('API_PORT', 5003))) 