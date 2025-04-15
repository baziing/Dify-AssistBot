from flask import Flask
from flask_cors import CORS
from api.db_api import db_api
import os

app = Flask(__name__)

# 获取API主机地址和端口
api_host = os.getenv('API_HOST', 'localhost')
api_port = os.getenv('API_PORT', '5003')

# 允许的源列表
allowed_origins = [
    'http://localhost:3000',
    f'http://{api_host}:3000',
    f'http://{api_host}',  # 允许不带端口的访问
]

# CORS配置
cors_config = {
    "origins": allowed_origins,
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
    "supports_credentials": True
}

CORS(app, resources={r"/api/*": cors_config})
app.register_blueprint(db_api, url_prefix='/api')

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    print(f"允许的源: {allowed_origins}")
    app.run(debug=True, host='0.0.0.0', port=int(api_port)) 