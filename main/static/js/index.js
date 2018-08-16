/**
 * Created by 2017-11-22
 */

 var lines = [];

String.prototype.format = function() {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,
        function(m,i){
            return args[i];
        }
    );
}

String.prototype.startsWith = function(str){
    var reg=new RegExp("^"+str);
    return reg.test(this);
}

function selectFile(obj) {
    var options = {  
        // 规定把请求发送到那个URL  
        url: "/uploadFile",
        // 请求方式  
        contentType: 'application/json',
        dataType: "json",
        // 服务器响应的数据类型  
        success: function(data) {  
            if (data.error) {
                alert(data.error);
            }
            var np_list = data.data;
            // [{  x: x,
            //     y: y }]
            var curve = {};
            var length = np_list.length;
            var step = 100;
            curve.x = Array(length).fill().map((item, index) => {
                return index * step;
            })
            curve.y = np_list;
            lines.push(curve)
            plot(lines)
        }
    };
    $(obj).parent().ajaxSubmit(options);
}

function selectFolder(e) {
    var theFiles = e.target.files;
    var relativePath = theFiles[0].webkitRelativePath;
    var folder = relativePath.split("/");
    alert(folder[0]);
}

TESTER = document.getElementById('tester');

function plot(data) {
    Plotly.plot( TESTER, data, { 
        margin: { t: 0 } } );
}
