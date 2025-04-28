from flask import Blueprint, jsonify, request
import mysql.connector
from urllib.parse import unquote

db_api = Blueprint('db_api', __name__)

# 数据库连接配置
DB_HOST = 'am-uf6eahlivj053528c90650o.ads.aliyuncs.com'
DB_PORT = 3306
DB_USER = 'op_query'
DB_PASSWORD = 'of8jTE%wHcMPGZ'
DB_DATABASE = 'neo_analyst'

def get_db_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_DATABASE
    )

@db_api.route('/query', methods=['GET'])
def query_database():
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM tickets")  # 替换为实际的查询
    results = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(results)

@db_api.route('/get_ticket_by_workflow_id', methods=['GET'])
def get_ticket_by_workflow_id():
    # 从URL参数获取workflow_id
    workflow_id = request.args.get('workflow_id')

    # 验证必需参数
    if not workflow_id:
        return jsonify({"error": "Missing workflow_id parameter"}), 400

    # 数据库连接
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)  # 使用字典游标，方便返回JSON

    try:
        # 查询数据
        query = """
        SELECT 
            workflow_id,
            conversation_id,
            ticket_content_original,
            ticket_content_translated,
            language,
            user_id
        FROM tickets
        WHERE workflow_id = %s
        """
        cursor.execute(query, (workflow_id,))
        result = cursor.fetchone()
        
        if not result:
            return jsonify({"error": "Ticket not found"}), 404
            
        return jsonify(result), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@db_api.route('/get_ticket_by_conversation_id', methods=['GET'])
def get_ticket_by_conversation_id():
    # 从URL参数获取conversation_id
    conversation_id = request.args.get('conversation_id')

    # 验证必需参数
    if not conversation_id:
        return jsonify({"error": "Missing conversation_id parameter"}), 400

    # 数据库连接
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)  # 使用字典游标，方便返回JSON

    try:
        # 查询数据
        query = """
        SELECT 
            workflow_id,
            conversation_id,
            ticket_content_original,
            ticket_content_translated,
            language,
            user_id
        FROM tickets
        WHERE conversation_id = %s
        """
        cursor.execute(query, (conversation_id,))
        result = cursor.fetchone()
        
        if not result:
            return jsonify({"error": "Ticket not found"}), 404
            
        return jsonify(result), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@db_api.route('/insert_ticket', methods=['POST'])
def insert_ticket():
    # 从URL参数获取数据
    workflow_id = request.args.get('workflow_id')
    conversation_id = request.args.get('conversation_id')
    ticket_content_original = request.args.get('ticket_content_original')
    ticket_content_translated = request.args.get('ticket_content_translated')
    language = request.args.get('language')
    user_id = request.args.get('user_id')

    # 日志：打印所有参数
    print("[insert_ticket] 参数：", {
        "workflow_id": workflow_id,
        "conversation_id": conversation_id,
        "ticket_content_original": ticket_content_original,
        "ticket_content_translated": ticket_content_translated,
        "language": language,
        "user_id": user_id
    })

    # 验证必需参数
    if not all([workflow_id, conversation_id, ticket_content_original, ticket_content_translated, language, user_id]):
        print("[insert_ticket] 缺少参数")
        return jsonify({"error": "Missing required parameters"}), 400

    # 数据库连接
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # 日志：准备插入的数据
        print("[insert_ticket] 即将插入数据库的数据：", (
            workflow_id,
            conversation_id,
            ticket_content_original,
            ticket_content_translated,
            language,
            user_id
        ))
        # 插入数据
        insert_query = """
        INSERT INTO tickets (
            workflow_id,
            conversation_id,
            ticket_content_original,
            ticket_content_translated,
            language,
            user_id
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (
            workflow_id,
            conversation_id,
            ticket_content_original,
            ticket_content_translated,
            language,
            user_id
        ))
        connection.commit()
        print("[insert_ticket] 插入成功")
        return jsonify({"message": "Ticket inserted successfully"}), 201
    except mysql.connector.Error as err:
        print("[insert_ticket] 数据库异常：", str(err))
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@db_api.route('/insert_ticket_workflow', methods=['POST'])
def insert_ticket_workflow():
    # 从URL参数获取数据
    workflow_id = request.args.get('workflow_id')
    step_number = request.args.get('step_number')
    ai_message = request.args.get('ai_message')
    ai_message_translated = request.args.get('ai_message_translated')
    customer_message = request.args.get('customer_message')
    conversation_id = request.args.get('conversation_id')
    user_id = request.args.get('user_id')

    # 日志：打印所有参数
    print("[insert_ticket_workflow] 参数：", {
        "workflow_id": workflow_id,
        "step_number": step_number,
        "ai_message": ai_message,
        "ai_message_translated": ai_message_translated,
        "customer_message": customer_message,
        "conversation_id": conversation_id,
        "user_id": user_id
    })

    # 验证必需参数
    if not all([workflow_id, step_number, conversation_id, user_id]):
        print("[insert_ticket_workflow] 缺少参数")
        return jsonify({"error": "Missing required parameters"}), 400

    # 数据库连接
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # 日志：准备插入的数据
        print("[insert_ticket_workflow] 即将插入数据库的数据：", (
            workflow_id,
            step_number,
            ai_message,
            ai_message_translated,
            customer_message,
            conversation_id,
            user_id
        ))
        # 插入数据
        insert_query = """
        INSERT INTO tickets_workflows (
            workflow_id,
            step_number,
            ai_message,
            ai_message_translated,
            customer_message,
            conversation_id,
            user_id
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (
            workflow_id,
            step_number,
            ai_message,
            ai_message_translated,
            customer_message,
            conversation_id,
            user_id
        ))
        connection.commit()
        print("[insert_ticket_workflow] 插入成功")
        return jsonify({"message": "Ticket workflow inserted successfully"}), 201
    except mysql.connector.Error as err:
        print("[insert_ticket_workflow] 数据库异常：", str(err))
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@db_api.route('/get_workflow_translation', methods=['GET'])
def get_workflow_translation():
    # 从URL参数获取conversation_id和message
    conversation_id = request.args.get('conversation_id')
    message = request.args.get('message')

    # 验证必需参数
    if not all([conversation_id, message]):
        return jsonify({"error": "Missing required parameters"}), 400

    # URL解码，将%0A转换为实际的换行符
    message = unquote(message)
    print("Decoded message:", message)  # 调试输出

    # 标准化消息文本，移除末尾的换行符和多余的空格
    normalized_message = message.strip()
    print("Normalized message:", normalized_message)  # 调试输出

    # 数据库连接
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # 使用标准化后的文本进行匹配
        query = """
        SELECT ai_message_translated, ai_message
        FROM tickets_workflows
        WHERE conversation_id = %s 
        AND TRIM(ai_message) = %s
        AND ai_message_translated IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 1
        """
        cursor.execute(query, (conversation_id, normalized_message))
        result = cursor.fetchone()
        
        if result:
            print("Found match:", result)  # 调试输出
        else:
            print("No match found for message")  # 调试输出
            
        if not result:
            return jsonify({"error": "Translation not found"}), 404
            
        return jsonify(result), 200
    except mysql.connector.Error as err:
        print("Database error:", str(err))  # 调试输出
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        connection.close()