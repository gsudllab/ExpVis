# -*- coding:utf-8 -*-
import os
import json
import getpass

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


def walk_results_dir(dir_path):
    directory = os.path.join(os.environ["HOME"], "project/results", dir_path)
    filter_list = [[], []]
    if not os.path.isdir(directory):
        return filter_list
    lists = sorted(os.listdir(directory))
    for e in lists:
        full_name = os.path.join(directory, e)
        if "copy" in e or ".png" in e:
            continue
        if os.path.isfile(full_name):
            filter_list[0].append(e)
        if os.path.isdir(full_name):
            filter_list[1].append(e)
        filter_list.append(e)
    return filter_list


@app.route('/realtime_query', methods=['POST'])
def realtime_query():
    listen_process_file = os.path.join(os.environ.get("HOME", "~"), "project/research/realtime.txt")
    dirs = []
    with open(listen_process_file) as fp:
        for e in fp.readlines():
            if not e.strip():
                continue
            dirs.append(e.strip())
    if len(dirs) == 0:
        return json.dumps({"data": {}}, ensure_ascii=False)
    filter_list = {}
    for d in dirs:
        dir = os.path.join(os.environ.get("HOME", "~"), "project/results", d)
        marker = dir.split("_")[-2]
        filter_list[d] = []
        exp_result = []
        exp = 0
        log_file = [e for e in filter(lambda x: marker in x, os.listdir(dir))][0]
        app.logger.info(log_file)
        with open(os.path.join(dir, log_file)) as fp:
            for line in fp.readlines():
                if "loss and acc" in line:
                    exp_result.append(line.strip().split()[-4:])
                if "single round" in line:
                    filter_list[d].append(exp_result[:])
                    exp += 1
                    exp_result = []

    return json.dumps({"data": filter_list, "x": 40}, ensure_ascii=False)


@app.route('/view.html')
def view():
    filter_list = walk_results_dir(".")
    return render_template('newest_results.html', sections=filter_list)


@app.route("/get_lists_in_dir.html", methods=["POST"])
def get_lists_in_dir():
    directory = request.json.get("dir", None)
    if directory is None:
        return json.dumps({"error": "not get"}, ensure_ascii=False)
    filter_list = walk_results_dir(directory)
    return json.dumps({"data": filter_list}, ensure_ascii=False)


def get_all_experiment(sub):
    directory = os.path.join(os.environ["HOME"], "project/results", sub)
    lists = sorted(os.listdir(directory))
    filter_list = []
    for e in lists:
        if "copy" not in e:
            filter_list.append(e)
    return filter_list


def get_all_npy(sub):
    directory = os.path.join(os.environ["HOME"], "project/results", sub)
    lists = sorted(os.listdir(directory))
    filter_list = []
    for e in lists:
        if e.endswith(".npy") or e.endswith(".npy.txt"):
            filter_list.append(e)
    for e in lists:
        if e != "npy":
            continue
        sub_lists = sorted(os.listdir(os.path.join(directory, e)))
        for sub in sub_lists:
            if sub.endswith(".npy"):
                filter_list.append("npy/" + sub)
    return filter_list


@app.route('/result_exp', methods=['POST'])
def get_experiments():
    directory = request.json.get("dir", None)
    if directory is None:
        return json.dumps({"error": "not get"}, ensure_ascii=False)

    filter_list = get_all_experiment(directory)
    return json.dumps({"data": filter_list}, ensure_ascii=False)


@app.route('/result_files', methods=['POST'])
def get_result_files_list():
    directory = request.json.get("dir", None)
    if directory is None:
        return json.dumps({"error": "not get"}, ensure_ascii=False)

    filter_list = get_all_npy(directory)
    return json.dumps({"data": filter_list}, ensure_ascii=False)


@app.route('/get_result_array', methods=['POST'])
def get_result_array():
    file_name = request.json.get("file")
    full_name = os.path.join(os.environ["HOME"], "project/results", file_name)
    param_file = os.path.join(os.path.dirname(full_name), "params.json")
    params = {}
    if os.path.isfile(param_file):
        with open(param_file) as fp:
            params = json.load(fp)
    array = []
    if file_name.endswith(".npy"):
        array = np.load(full_name)

    if file_name.endswith(".npy.txt"):
        array = np.loadtxt(full_name, delimiter=',')
    content = ""
    if file_name[-4:] in [".txt", "json"]:
        with open(full_name) as fp:
            content = fp.read()
    x = np.arange(len(array))
    if "queries" in params:
        x *= params["queries"]
    l_x = []
    for e in x:
        l_x.append(int(e))
    return json.dumps({"data": {"x": l_x, "y": list(array), "content": content}}, ensure_ascii=False)


@app.route('/uploadFile', methods=['POST'])
def upload_file():
    global network_data, name, lstm_shape, enc_length, order
    c = request.files.get("log")

    content = np.load(c)
    if len(content.shape) > 1 and content.shape[0] > content.shape[1]:
        content = content.T
    app.logger.info(content)

    return json.dumps({"data": list(content)}, ensure_ascii=False)
