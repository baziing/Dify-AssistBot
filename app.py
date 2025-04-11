from flask import Flask
from flask_cors import CORS
from api.db_api import db_api

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://192.168.111.225:3000"]}})
app.register_blueprint(db_api, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5003) 