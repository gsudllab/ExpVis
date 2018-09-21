
var dir_tree = null;
var global_temp_data = null;
var dataset_chose = null;
var size_chosen = null;
var method_chosen = null;
var exp_chosen = null;
var plot_data = [];
var plot_index = [];
var sub_names = [];
var real_time_data = [];
var group_color = {};
var groups = [];

function dir_button(level, name) {
    var template = '<a class="btn btn-default col-md-12" style="white-space: normal;" href="#" role="button" onclick="choose_directory(this, {0}, \'{1}\')">{2}</a>';
    return template.format(level, name, name);
}

function file_button(level, name) {
    var template = '<a class="btn btn-default col-md-12" style="white-space: normal;" href="#" role="button" onclick="draw_file(this, {0})">{1}</a>';
    return template.format(level, name);
}

function choose_directory(obj, level, name) {
    var spans = $("#dir_path").children("span");
    var levels = spans.children("select");
    var path = "."
    for (var i = 1; i < level; i++) {
        path += "/" + $(levels[i-1]).val();
    }
    if (name == "") {
        path += "/" + $(obj).val();
    } else {
        $(levels[level-1]).val(name);
        path += "/" + name;
    }
    console.log(path);
    $.ajax({
        method: "post",
        url : "/get_lists_in_dir.html",
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify({"dir": path}),
        success : function (data){
            var list = data.data;
            global_temp_data = data.data
            $("#sub_files").empty();
            for (var i in list[0]) {
                var temp = file_button(level+1, list[0][i]);
                $("#sub_files").append(temp)
            }
            $("#sub_dirs").empty();
            for (var i in list[1]) {
                var temp = dir_button(level+1, list[1][i]);
                $("#sub_dirs").append(temp)
            }

            for (var i = level; i < spans.length; i++) {
                var span = spans[i];
                span.remove();
            }
            var new_span = $("<span></span>");
            var new_select = $("<select></select>");
            new_select.attr("onchange", "choose_directory(this, {0}, '')".format(level+1));
            new_select.append('<option disabled selected value="0">default</option>"');
            for (var i in list[1]) {
                new_select.append('<option value="{0}">{1}</option>'.format(list[1][i], list[1][i]));
            }
            new_span.append(new_select);
            new_span.append("<span>/</span>")
            $("#dir_path").append(new_span);
        }
    });
}

function draw_file(obj, level) {
    var spans = $("#dir_path").children("span");
    var levels = spans.children("select");
    var path = ".";
    var data_name = "";
    var size = "";
    var group_name = "";
    for (var i = 1; i < level; i++) {
        group_name = $(levels[i-1]).val();
        path += "/" + $(levels[i-1]).val();
        var parts = $(levels[i-1]).val().split("=");
        if (parts.length != 2)
            continue;
        switch(parts[0]) {
            case "dataset":
                data_name = parts[1];
                break;
            case "size":
                size = parts[1];
                break;
        }
    }
    path += "/" + $(obj).html();
    var ele = $(obj);
    var file = ele.html();
    var file_path = path;

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
            var colors = ["red", "blue", "orange", "brown", "pink", "gray", "black"];
            
            var layout = {
                title: "{0} on {1}".format(data_name, size),
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
            list["legendgroup"] = group_name;
            if (!(group_name in group_color)) {
                group_color[group_name] = colors[groups.length];
                groups.push(group_name);
            } else {
                list["showlegend"] = false;
            }
            list["maker"] = {color:group_color[group_name], line: {color: group_color[group_name]}};

            var canvas = $("div.vis_canvas").children("div.canvas");
            var new_curve = '<div class="btn btn-default col-md-12"><input type="checkbox" checked value="{0}"/>{1}</div>'.format(plot_data.length, file_path);
            $(".curves").append(new_curve);
            plot_data.push(list);
            if (contain_flag == false) {
                Plotly.newPlot(canvas[0], plot_data, layout, {editable: true});
            } else {
                var temp = plot_data[plot_data.length - 1];
                Plotly.purge(canvas[0]);
                Plotly.plot(canvas[0], plot_data, layout, {editable: true});
            }

            // plotted_data = [];
            // for (var i = 0; i < $("checkbox").length; i++) {
            //     if ($("checkbox").attr('checked')) {
            //         plotted_data.append(plot_data[i]);
            //     }
            // }
        }
    });
}

function remove_chart() {
    var canvas = $("div.vis_canvas").children("div.canvas");
    plot_data = [];
    sub_names = [];
    group_color = {};
    groups = [];
    $(".curves").empty();
    Plotly.purge(canvas[0]);
}

function realtime_query() {
    $.ajax({
        method: "post",
        url : "/realtime_query",
        contentType: 'application/json',
        dataType: "json",
        success : function (data){
            var set = data.data;
            var interval = data.x;
            real_time_data = data;
            console.log(set);
            var r_plot_data = [];
            for (var ele in set) {
                var exps = set[ele];
                for (var i in exps) {
                }
            }
        }
    });
}