
var dir_tree = null;
var global_temp_data = null;
var dataset_chose = null;
var size_chosen = null;
var method_chosen = null;
var exp_chosen = null;
var plot_data = {};

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

    var dir = "{0}/{1}/{2}/{3}/{4}".format(data_name, size_chosen, method_chosen, exp_chosen, file);
    console.log(dir);
    $.ajax({
        method: "post",
        url : "/get_result_array",
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify({"file": dir}),
        success : function (data){
            var list = data.data;
            global_temp_data = data.data
            plot_data[section].push(list);

            var canvas = $("#content" + dataset_id).children("div.vis_canvas").children("div.canvas");
            var layout = {
                title: "{0} on {1}".format(data_name, size_chosen),
                showlegend: true,
            }
            Plotly.plot(canvas[0], [list], layout, {scrollZoom: true, editable: true});
        }
    });
}

function remove_chart() {
    var section = $("input:checked")[0].id;
    let dataset_id = section.substring(3);
    var canvas = $("#content" + dataset_id).children("div.vis_canvas").children("div.canvas");
    plot_data[section] = [];
    Plotly.purge(canvas[0]);
}

get_results_dir_tree();