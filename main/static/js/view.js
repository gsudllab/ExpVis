
var dir_tree = null;
var global_temp_data = null;
var dataset_chose = null;
var size_chosen = null;
var method_chosen = null;
var exp_chosen = null;
var plot_data = {};
var sub_names = [];

function get_results_dir_tree() {
    $.ajax({
        method: "get",
        url : "/results_tree",
        contentType: 'application/json',
        dataType: "json",
        success : function (data){
            dir_tree = data.data;
        }
    });
}

function dir_button(level_name, id, name) {
    let template = '<a id="{0}-{1}" class="btn btn-default col-md-12" style="white-space: normal;" href="#" role="button" onclick="choose_exp(this)">{2}</a>';
    return template.format(level_name, id, name);
}

function exp_button(level_name, id, name) {
    let template = '<a id="{0}-{1}" class="btn btn-default col-md-12" style="white-space: normal;" href="#" role="button" onclick="choose_file(this)">{2}</a>';
    return template.format(level_name, id, name);
}

function file_button(level_name, id, name) {
    let template = '<a id="{0}-{1}" class="btn btn-default col-md-12" style="white-space: normal;" href="#" role="button" onclick="draw_file(this)">{2}</a>';
    return template.format(level_name, id, name);
}

function choose_directory(obj) {
    let size_id = obj.id.substring(4);
    let ele = $(obj);
    let size = ele.html();
    size_chosen = size;
    let section = $("input:checked")[0].id;
    let dataset_id = section.substring(3);
    let dataset = $("label[for=tab"+dataset_id+"]").html();
    dataset_chose = dataset;
    id = dataset_id;

    var name = dir_tree[id-1][0];
    var sub = dir_tree[id-1][1][size_id][1];
    var method_div = $("#content" + dataset_id).children("div.side_container").children("div.method")
    method_div.empty();
    var file_div = $("#content" + dataset_id).children("div.exp")
    file_div.empty();
    var file_div = $("#content" + dataset_id).children("div.files")
    file_div.empty();
    for (let i in sub) {
        let temp = dir_button(size_id + "-method", i, sub[i]);
        method_div.append(temp);
    }
}

function choose_exp(obj) {
    let ele = $(obj);
    let size_id = obj.id.split("-")[0];
    let method_id = obj.id.split("-")[2];
    let method = ele.html();
    let section = $("input:checked")[0].id;
    let dataset_id = section.substring(3);
    let dataset = $("label[for=tab"+dataset_id+"]").html();
    plot_data[section] = [];

    method_chosen = method;

    let data_name = dir_tree[id-1][0];
    let size_name = dir_tree[id-1][1][size_id][0];

    var dir = "{0}/{1}/{2}".format(data_name, size_name, method);
    console.log(dir);
    var file_div = $("#content" + dataset_id).children("div.files")
    file_div.empty();
    var exp_div = $("#content" + dataset_id).children("div.exp")
    exp_div.empty();
    $.ajax({
        method: "post",
        url : "/result_exp",
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify({"dir": dir}),
        success : function (data){
            var list = data.data;
            global_temp_data = data.data
            for (var i in list) {
                var temp = exp_button(size_id + "-" + method_id + "-exp", i, list[i]);
                exp_div.append(temp)
            }
        }
    });

}

function choose_file(obj) {
    let ele = $(obj);
    let size_id = obj.id.split("-")[0];
    let exp = ele.html();
    exp_chosen = exp;
    let section = $("input:checked")[0].id;
    let dataset_id = section.substring(3);
    let dataset = $("label[for=tab"+dataset_id+"]").html();

    let data_name = dir_tree[id-1][0];
    let size_name = dir_tree[id-1][1][size_id][0];

    var dir = "{0}/{1}/{2}/{3}".format(data_name, size_name, method_chosen, exp);
    console.log(dir);
    let file_div = $("#content" + dataset_id).children("div.files")
    file_div.empty();
    $.ajax({
        method: "post",
        url : "/result_files",
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify({"dir": dir}),
        success : function (data){
            var list = data.data;
            global_temp_data = data.data
            for (var i in list) {
                var temp = file_button(size_id + "-file", i, list[i]);
                file_div.append(temp)
            }
        }
    });
}

function draw_file(obj) {
    let ele = $(obj);
    let file = ele.html();
    let section = $("input:checked")[0].id;
    let dataset_id = section.substring(3);

    let data_name = dir_tree[id-1][0];

    var file_path = "{0}/{1}/{2}/{3}/{4}".format(data_name, size_chosen, method_chosen, exp_chosen, file);
    var file_name = file.split("/")[file.split("/").length-1];
    var file_parts = file_name.split("_")
    var metric = ""
    var contain_flag = false;
    var canvas_id = 0;
    for (var i = 0; i < 2; i++) {
        if (file_parts[i] == "")
            continue;
        var prefix = file_parts[i].substring(0, 3);
        if (prefix == "val" || prefix == "tes" || prefix == "tra") {
            continue;
        }
        metric = file_parts[i];
        for (var j = 0; j < sub_names.length; j++) {
            if (sub_names[j] == metric) {
                contain_flag = true;
                canvas_id = j;
                break;
            }
        }
        if (contain_flag == false) {
            canvas_id = sub_names.length;
            sub_names.push(metric);
        }
    }
    $.ajax({
        method: "post",
        url : "/get_result_array",
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify({"file": file_path}),
        success : function (data){
            var list = data.data;
            global_temp_data = list;
            
            var canvas = $("#content" + dataset_id).children("div.vis_canvas").children("div.canvas");
            var layout = {
                title: "{0} on {1}".format(data_name, size_chosen),
                legend: {traceorder: 'reversed'},
                margin: {
                    b: 50,
                    t: 50
                },
                showlegend: true,
            };
            for (var i = 0; i < sub_names.length; i++) {
                layout["xaxis" + (i+1)] = {anchor: 'y' + (i+1)};
                layout["yaxis" + (i+1)] = {domain: [i * 1.0 / sub_names.length, (i+1) * 1.0 / sub_names.length-0.05],
                                           "title": sub_names[i]};
            }
            list["xaxis"] = 'x' + (canvas_id + 1)
            list["yaxis"] = 'y' + (canvas_id + 1)
            plot_data[section].push(list);
            if (contain_flag == false) {
                Plotly.newPlot(canvas[0], plot_data[section], layout, {editable: true});
            } else {
                Plotly.purge(canvas[0]);
                Plotly.plot(canvas[0], plot_data[section], layout, {editable: true});
            }
        }
    });
}

function remove_chart() {
    var section = $("input:checked")[0].id;
    let dataset_id = section.substring(3);
    var canvas = $("#content" + dataset_id).children("div.vis_canvas").children("div.canvas");
    plot_data[section] = [];
    sub_names = [];
    Plotly.purge(canvas[0]);
}

get_results_dir_tree();