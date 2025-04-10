import requests

# API端点
base_url = "http://127.0.0.1:5003/api/insert_ticket_workflow"

# 测试数据（作为URL参数）
params = {
    "workflow_id": "test_workflow_123",
    "step_number": "1",
    "ai_message": "这是AI的回复消息",
    "customer_message": "这是客户的消息",
    "conversation_id": "conv_123456",
    "user_id": "test_user_456"
}

# 发送POST请求，参数作为URL查询参数
response = requests.post(base_url, params=params)

# 打印响应
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}") 