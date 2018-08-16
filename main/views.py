# -*- coding:utf-8 -*-
import json

from flask import request, render_template
import numpy as np
from main import app


network_data = []
name = "lstm"
lstm_shape = []
order = []
enc_length = 1


@app.route('/')
@app.route('/index.html')
def index():
    return render_template('index.html')


@app.route('/uploadFile', methods=['POST'])
def upload_file():
    global network_data, name, lstm_shape, enc_length, order
    c = request.files.get("log")

    content = np.load(c)
    if content.shape[0] > content.shape[1]:
        content = content.T
    app.logger.info(content)

    return json.dumps({"data": list(content[0])}, ensure_ascii=False)
