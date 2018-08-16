/**
 * Created by 2017-11-22
 */

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

Plotly.plot( TESTER, [{
    x: [1, 2, 3, 4, 5],
    y: [1, 2, 4, 8, 16] }], { 
    margin: { t: 0 } } );