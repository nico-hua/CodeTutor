import io
import json

import requests
import logging
from flask import request, Flask

import pg_logger

app = Flask(__name__)  # 创建应用实例

# 配置日志记录器
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.route("/getCodeTrace", methods=["post", "get"])
def get_code_trace():
    code = request.json.get("code")
    trace = get_py_exec(code)
    return json.loads(trace)


@app.route("/getCodeTraceByUrl", methods=["post", "get"])
def get_code_by_url():
    url = request.json.get("url")
    code = ""
    try:
        raw_url = url.replace("blob", "raw")
        response = requests.get(raw_url)
        if response.status_code == 200:
            logger.error(f"Success")
            code = response.text
    except Exception as e:
        logger.error(f"Failed to fetch code from URL: {url}, error: {e}")
        pass
    trace = get_py_exec(code)
    return json.loads(trace)


def get_py_exec(user_script):
    out_s = io.StringIO()

    def json_finalizer(input_code, output_trace):
        ret = dict(code=input_code, trace=output_trace)
        json_output = json.dumps(ret, indent=None)
        out_s.write(json_output)

    # options = json.loads(request.query.options_json)
    options = {
        'cumulative_mode': False,
        'heap_primitives': False
    }

    pg_logger.exec_script_str_local(
        user_script,
        None,
        options['cumulative_mode'],
        options['heap_primitives'],
        json_finalizer)

    return out_s.getvalue()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000, debug=True)
