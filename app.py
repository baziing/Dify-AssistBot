from flask import Flask, request
from flask_cors import CORS
from api.db_api import db_api
import os
from dotenv import load_dotenv

# 加载环境变量并打印调试信息
print("正在加载环境变量...")
load_dotenv('.env.local')
print(f"当前工作目录: {os.getcwd()}")
print(f".env.local 文件是否存在: {os.path.exists('.env.local')}")

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

print(f"允许的源列表: {allowed_origins}")

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
    
    print(f"响应头: {dict(response.headers)}")
    return response

if __name__ == '__main__':
    print("\n=== API服务配置 ===")
    print(f"API地址: http://{api_host}:{api_port}")
    print(f"允许的源: {allowed_origins}")
    print("=================\n")
    
    # 确保使用正确的IP地址启动
    app.run(debug=True, host='0.0.0.0', port=int(api_port)) 