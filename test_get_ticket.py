import requests

# API端点
base_url = "http://127.0.0.1:5003/api/get_ticket_by_workflow_id"

# 测试数据（作为URL参数）
params = {
    "workflow_id": "test_workflow_123"  # 使用之前插入的workflow_id
}

# 发送GET请求，参数作为URL查询参数
response = requests.get(base_url, params=params)

# 打印响应
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}") 