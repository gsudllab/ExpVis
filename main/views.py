# -*- coding:utf-8 -*-
import os
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


@app.route('/view.html')
def view():
    directory = os.path.join(os.environ["HOME"], "project/results")
    lists = os.listdir(directory)
    filter_list = []
    for e in lists:
        print(e)
        full_name = os.path.join(directory, e)
        if not os.path.isdir(full_name):
            continue
        if e.endswith(" (copy)"):
            continue
        if not e.startswith("dataset="):
            continue
        sub_dir = os.listdir(full_name)
        filter_list.append([e, sub_dir])

    return render_template('newest_results.html', sections=filter_list)


@app.route('/uploadFile', methods=['POST'])
def upload_file():
    global network_data, name, lstm_shape, enc_length, order
    c = request.files.get("log")

    content = np.load(c)
    if len(content.shape) > 1 and content.shape[0] > content.shape[1]:
        content = content.T
    app.logger.info(content)

    return json.dumps({"data": list(content)}, ensure_ascii=False)
