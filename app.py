from flask import Flask
from api.db_api import db_api

app = Flask(__name__)
app.register_blueprint(db_api, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5003) 