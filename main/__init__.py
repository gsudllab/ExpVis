# -*- coding:utf-8 -*-

import os
import logging

from flask import Flask

app = Flask(__name__, static_folder= os.path.join(os.path.dirname(__file__), "static"))

# 日志
log_file_name = os.path.join(
    os.environ.get('OPENSHIFT_PYTHON_LOG_DIR', '.'),
    'app.log')

handler = logging.FileHandler(log_file_name, mode='a')
handler.setLevel(logging.INFO)
fmt = "%(asctime)s\t%(message)s"
# 实例化formatter
formatter = logging.Formatter(fmt)
# 为handler添加formatter
handler.setFormatter(formatter)
app.logger.addHandler(handler)
app.logger.setLevel(logging.INFO)

from .views import *
