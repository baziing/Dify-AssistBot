from flask import Flask, request
from flask_cors import CORS
from api.db_api import db_api
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv('.env.local')

app = Flask(__name__)

# 获取API配置（使用与前端一致的环境变量名称）
api_host = os.getenv('NEXT_PUBLIC_API_HOST', 'localhost')
api_port = os.getenv('NEXT_PUBLIC_API_PORT', '5003')

# 从环境变量获取允许的源列表
default_origins = f'http://localhost:3000,http://{api_host}:3000'
allowed_origins = os.getenv('NEXT_PUBLIC_ALLOWED_ORIGINS', default_origins).split(',')

# CORS配置
cors_config = {
    "origins": allowed_origins,
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
    "supports_credentials": True,
    "expose_headers": ["Access-Control-Allow-Origin"]
}

CORS(app, resources={r"/api/*": cors_config})
app.register_blueprint(db_api, url_prefix='/api')

@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin and origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Vary'] = 'Origin'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

if __name__ == '__main__':
    print(f"环境变量配置:")
    print(f"- NEXT_PUBLIC_API_HOST: {api_host}")
    print(f"- NEXT_PUBLIC_API_PORT: {api_port}")
    print(f"- NEXT_PUBLIC_ALLOWED_ORIGINS: {os.getenv('NEXT_PUBLIC_ALLOWED_ORIGINS', default_origins)}")
    print(f"\nAPI服务运行配置:")
    print(f"- API地址: http://{api_host}:{api_port}")
    print(f"- 允许的源: {allowed_origins}")
    app.run(debug=True, host='0.0.0.0', port=int(api_port)) 