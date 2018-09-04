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


def walk_results_dir():
    directory = os.path.join(os.environ["HOME"], "project/results")
    lists = os.listdir(directory)
    filter_list = []
    for e in lists:
        full_name = os.path.join(directory, e)
        if not os.path.isdir(full_name):
            continue
        if e.endswith(" (copy)"):
            continue
        if not e.startswith("dataset="):
            continue
        sub_dirs = []
        for sub_dir in os.listdir(full_name):
            sub_name = os.path.join(full_name, sub_dir)
            sub_sub_dirs = []
            for sub_sub in os.listdir(sub_name):
                if "running" in sub_sub:
                    continue
                sub_sub_dirs.append(sub_sub)
            if len(sub_sub_dirs):
                sub_dirs.append([sub_dir, sub_sub_dirs])
        filter_list.append([e, sub_dirs])
    return filter_list


@app.route('/view.html')
def view():
    filter_list = walk_results_dir()
    return render_template('newest_results.html', sections=filter_list)


@app.route('/results_tree')
def get_results_tree():
    filter_list = walk_results_dir()
    return json.dumps({"data": filter_list}, ensure_ascii=False)


def get_all_experiment(sub):
    directory = os.path.join(os.environ["HOME"], "project/results", sub)
    lists = os.listdir(directory)
    filter_list = []
    for e in lists:
        if not e.endswith("running"):
            filter_list.append(e)
    return filter_list


def get_all_npy(sub):
    directory = os.path.join(os.environ["HOME"], "project/results", sub)
    lists = os.listdir(directory)
    filter_list = []
    for e in lists:
        if e.endswith(".npy"):
            filter_list.append(e)
    for e in lists:
        if e != "npy":
            continue
        sub_lists = os.listdir(os.path.join(directory, e))
        for sub in sub_lists:
            if e.endswith(".npy"):
                filter_list.append("npy/" + e)
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
    array = np.load(full_name)
    return json.dumps({"data": {"x": range(len(array)), "y":list(array)}}, ensure_ascii=False)


@app.route('/uploadFile', methods=['POST'])
def upload_file():
    global network_data, name, lstm_shape, enc_length, order
    c = request.files.get("log")

    content = np.load(c)
    if len(content.shape) > 1 and content.shape[0] > content.shape[1]:
        content = content.T
    app.logger.info(content)

    return json.dumps({"data": list(content)}, ensure_ascii=False)
