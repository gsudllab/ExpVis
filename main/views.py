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
    app.logger.info(content)

    name, lstm_shape, network_data, enc_length, order = readLog(content)

    return json.dumps({"type": name, "shape": lstm_shape, "index": network_data.keys(), "enc": enc_length},
                      ensure_ascii=False)
