from flask import Flask, request
from flask_cors import CORS
from api.db_api import db_api
import os
from dotenv import load_dotenv
from pathlib import Path

# 获取项目根目录
ROOT_DIR = Path(__file__).parent
ENV_FILE = ROOT_DIR / 'frontend' / '.env.local'

# 加载环境变量并打印调试信息
print("=== 环境变量加载 ===")
print(f"当前工作目录: {os.getcwd()}")
print(f"项目根目录: {ROOT_DIR}")
print(f"环境变量文件路径: {ENV_FILE}")
print(f"环境变量文件是否存在: {ENV_FILE.exists()}")

# 加载环境变量
if ENV_FILE.exists():
    load_dotenv(ENV_FILE)
    print("已加载环境变量文件")
else:
    print("警告：环境变量文件不存在！")

app = Flask(__name__)

# 获取API配置
api_host = os.getenv('NEXT_PUBLIC_API_HOST', 'localhost')
api_port = os.getenv('NEXT_PUBLIC_API_PORT', '5003')

# 从环境变量获取允许的源列表
allowed_origins = os.getenv('NEXT_PUBLIC_ALLOWED_ORIGINS', '').split(',')
if not allowed_origins or allowed_origins == ['']:
    allowed_origins = [
        'http://localhost:3000',
        'http://192.168.70.221:3000',
        'http://192.168.111.225:3000',
        'http://192.168.70.221',
        'http://192.168.111.225'
    ]

# 添加带端口的变体
additional_origins = []
for origin in allowed_origins:
    if ':' not in origin:  # 如果原始URL不包含端口
        additional_origins.append(f"{origin}:3000")
allowed_origins.extend(additional_origins)

print("\n=== 配置信息 ===")
print(f"API主机: {api_host}")
print(f"API端口: {api_port}")
print(f"允许的源: {allowed_origins}")
print("================")

# 配置CORS
CORS(app, 
     resources={
         r"/api/*": {
             "origins": "*",  # 允许所有源
             "allow_headers": ["Content-Type", "Authorization"],
             "methods": ["GET", "POST", "OPTIONS"]
         }
     },
     supports_credentials=True)

app.register_blueprint(db_api, url_prefix='/api')

@app.after_request
def after_request(response):
    origin = request.headers.get('Origin', '')
    print(f"收到请求，Origin: {origin}")
    
    # 允许所有源访问
    response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Max-Age'] = '3600'  # 缓存预检请求结果1小时
    
    return response

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(api_port)) 