from flask import Blueprint, jsonify, request
import mysql.connector

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

@db_api.route('/insert_ticket', methods=['POST'])
def insert_ticket():
    # 从URL参数获取数据
    workflow_id = request.args.get('workflow_id')
    conversation_id = request.args.get('conversation_id')
    ticket_content_original = request.args.get('ticket_content_original')
    ticket_content_translated = request.args.get('ticket_content_translated')
    language = request.args.get('language')
    user_id = request.args.get('user_id')

    # 验证必需参数
    if not all([workflow_id, conversation_id, ticket_content_original, ticket_content_translated, language, user_id]):
        return jsonify({"error": "Missing required parameters"}), 400

    # 数据库连接
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
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
        return jsonify({"message": "Ticket inserted successfully"}), 201
    except mysql.connector.Error as err:
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

    # 验证必需参数
    if not all([workflow_id, step_number, conversation_id, user_id]):
        return jsonify({"error": "Missing required parameters"}), 400

    # 数据库连接
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
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
        return jsonify({"message": "Ticket workflow inserted successfully"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        connection.close() 