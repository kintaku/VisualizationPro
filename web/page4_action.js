var width = 2000,
    height = 1500;
var time_h = 900;
var fill = d3.scale.category20();
index = 0;
node_array = new Array();
var is_pausing = false;
frame = 100;
var addN;//add node timer

document.getElementById("dis_label").style.display="none";
document.getElementById("dis_type").style.display = "none";
document.getElementById("btn_pause").disabled  =true;
document.getElementById("btn_pause").style.background="#cccccc";

function startAnimation(){
        //启动播放
    clearInterval(addN);
    is_pausing = false;

    document.getElementById("node_chart").innerHTML="";
    document.getElementById("time_progress").innerHTML="";
    document.getElementById("time_label").innerHTML = "";
    document.getElementById("node_chart").style.display="inline";
    document.getElementById("time_line").style.display="inline";
    document.getElementById("btn_start").innerHTML="Restart";
    document.getElementById("btn_pause").disabled  =false;
    document.getElementById("btn_pause").style.background="#00b9e8";


    force = d3.layout.force()
            .size([width, height])// initialize with a single node
            .linkDistance(60)
            .charge(-150)
            .on("tick", tick);
//.nodes([{}])

        svg = d3.select("#node_chart").append("svg")
            .attr("width", width)
            .attr("height", height)
            .on("mousedown",mousedown)
            .on("mouseup",mouseup)
            .on("mousemove",mousemove)
            //.on("mousemove", mousemove);

        var gradient = svg.append("linearGradient")
            .attr("x1","0%").attr("x2","0%")
            .attr("y1","0%").attr("y2","100%")
            .attr("id", function(d) { return "gradient"; });

        gradient.append("svg:stop")
            .attr("offset", "10%")
            .attr("stop-color", function(d) { return "#00A0B0"; })
            .attr("stop-opacity", 1);
        gradient.append("svg:stop")
            .attr("offset", "90%")
            .attr("stop-color", function(d) { return "#EDC951"; })
            .attr("stop-opacity", 1);

        time_svg = d3.select("#time_progress").append("svg")
            .attr("width", 100)
            .attr("height", time_h)
            .attr("y",width-20);
        time_svg.append("rect")
            .attr("width", 20)
            .attr("height", time_h)
            .attr("rx",10)
            .attr("ry",10)
            .attr("style","fill:#333333");

        time_svg.append("rect")
            .attr("id","progress")
            .attr("width", 20)
            .attr("height", 20)
            .attr("rx",10)
            .attr("ry",10)
            .attr("style","fill:url(#gradient)");


        svg.append("rect")
            .attr("width", width)
            .attr("height", height);

        nodes = force.nodes(),
            links = force.links(),
            node = svg.selectAll(".node"),
            link = svg.selectAll(".link");

        cursor = svg.append("circle")
            .attr("r", 5)
            .attr("transform", "translate(-100,-100)")
            .attr("class", "cursor");
        frame = svg.append("rect")
            .attr("width", 1)
            .attr("height", 1)
            .attr("style","fill:rgba(0,0,0,0);stroke-width:1;stroke:rgb(219,0,0)");
        /*node_array[0] ={f_num:"00001",f_type:1,t_num:"00002",t_type:2,date:"2014-08-21"};*/
        //读取node到数组
        d3.csv("data/nodes/node_path_weight.csv", function(error, data) {
            var i = 0;
            data.forEach(function (d) {
                var type1 = parseInt(d.f_type);
                var type2 = parseInt(d.t_type);
                node_array[i] ={f_num: d.from_node,f_type: type1 ,
                    t_num: d.to_node,t_type: type2,
                    date: d.date.substr(0,10), weight: d.times};
                i++;
            })
        });

        addN = setInterval(addNode,frame);
}

function pauseAnimation(){
    if(is_pausing){
        document.getElementById("dis_type")[1].selected=true;
        document.getElementById("dis_label").style.display="none";
        document.getElementById("dis_type").style.display="none";
        is_pausing = false;
        showDropdown();
        addN = setInterval(addNode,frame);
        document.getElementById("btn_pause").innerHTML="Pause"
    }else{
        //暂停  显示下拉筐
        document.getElementById("dis_label").style.display="inline";
        document.getElementById("dis_type").style.display="inline";
        is_pausing = true;
        clearInterval(addN);
        document.getElementById("btn_pause").innerHTML="Resume";
    }
}

var x0,y0,x1,y1;
var is_down = false;
function mousedown(){
    /*x0 = d3.mouse(this)[0];
    y0 = d3.mouse(this)[1];
    frame.attr("x", x0)
        .attr("y",y0)
        .attr("width",1)
        .attr("height",1);
    is_down = true;*/
}
function mousemove() {
    cursor.attr("transform", "translate(" + d3.mouse(this) + ")");
}
function mouseup(){
    /*is_down = false;
    x1 = d3.mouse(this)[0];
    y1 = d3.mouse(this)[1];
    var w = Math.abs(x1-x0);
    var h = Math.abs(y1-y0);


    if(w>20 && h>20){
        frame
            .attr("width",w)
            .attr("height",h);
        var links_arr = getGroupNodes_Links();
        var links_arr1 = [{s_node:"009557",t_node:"007250",type1:4,type2:1},{s_node:"007312",t_node:"007250",type1:2,type2:1},
            {s_node:"008055",t_node:"007250",type1:2,type2:1},{s_node:"008335",t_node:"007250",type1:2,type2:1},
            {s_node:"007300",t_node:"007250",type1:2,type2:1},{s_node:"007312",t_node:"007293",type1:2,type2:2},
            {s_node:"007300",t_node:"007294",type1:2,type2:2},{s_node:"007294",t_node:"007300",type1:2,type2:2},
            {s_node:"007293",t_node:"007116",type1:2,type2:1},{s_node:"007294",t_node:"007116",type1:2,type2:1},
            {s_node:"007288",t_node:"007116",type1:2,type2:1},{s_node:"010056",t_node:"007116",type1:2,type2:1}];
        var links_arr2 = [{s_node:"009557",t_node:"007250",type1:4,type2:1},{s_node:"007312",t_node:"007250",type1:2,type2:1},
            {s_node:"008055",t_node:"007250",type1:2,type2:1},{s_node:"008335",t_node:"007250",type1:2,type2:1},
            {s_node:"007300",t_node:"007250",type1:2,type2:1},{s_node:"007312",t_node:"007293",type1:2,type2:2},
            {s_node:"007300",t_node:"007294",type1:2,type2:2},{s_node:"007294",t_node:"007300",type1:2,type2:2},
            {s_node:"007293",t_node:"007116",type1:2,type2:1},{s_node:"007294",t_node:"007116",type1:2,type2:1},
            {s_node:"007288",t_node:"007116",type1:2,type2:1},{s_node:"010056",t_node:"007116",type1:2,type2:1}];

        document.getElementById("matrix_panel").style.display = "inline";
        document.getElementById("num_group").innerHTML= "Group";
        addMatrix(links_arr1,"matrix_chart1",false);
        addMatrix(links_arr2,"matrix_chart2",true);
    }*/
}

function addNode(){
    source_num = node_array[index].f_num;
    target_num = node_array[index].t_num;
    document.getElementById("time_label").innerHTML= node_array[index].date;
    var h = time_h*index/node_array.length;
    time_svg.select("#progress").attr("height",h);
    var exist_source = false;
    var source_node,end_node;
    var exist_target = false;
    var point = [Math.random()*1*width,Math.random()*1*height];//d3.mouse(this);
    nodes.forEach(function(d){
        var number= d.tag;
        if(number==source_num){
            //初始节点存在
            source_node = d;
            point = [d.x, d.y];
            exist_source = true;
        }
    });
    if(exist_source){
        //console.log("exist source node");
        var point_target;
        nodes.forEach(function(d){
            var number= d.tag;
            if(number==target_num){
                //终始节点存在
                end_node = d;
                exist_target = true;
                point_target =[d.x,d.y];
            }
        });
        if(!exist_target){
            //加末节点
            var item = node_array[index];
            //console.log("not exist target node"+item.t_num+"  "+item.t_type);
            var end_node = {x: source_node.x, y: source_node.y,tag:target_num,type:item.t_type};//end node
            var n = nodes.push(end_node);
            // add links nodes
            links.push({source: source_node, target:end_node , type: source_node.type,
                weight:item.weight,
                tag: "l" + source_node.tag + "-" + end_node.tag});
            restart(false);

        }else{
            //console.log("exist target node");
            //节点已存在,加链接
            var item = node_array[index];
            console.log("just add link #l"+source_num+"-"+target_num);
            links.push({source: source_node, target: end_node,type:source_node.type,
                weight:item.weight,
                tag:"l"+source_num+"-"+target_num});
            restart(false)
        }
    }else{
        //var node = {x: point[0], y: point[1]};

        ///console.log("not exist source node"+item.f_num+"  "+item.f_type);
        //查询是否存在末节点
        nodes.forEach(function(d){
            var number= d.tag;
            if(number==target_num){
                //终节点存在
                end_node = d;
                point = [d.x, d.y];
                exist_target = true;
            }
        });

        if(exist_target){
            //console.log("exist target node");
            //add source node
            var item= node_array[index];
            var source_node = {x: point.x, y: point.y,tag:source_num,type:item.f_type};//end node
            nodes.push(source_node);
            // add links nodes
            links.push({source: source_node, target:end_node , type: source_node.type,
                weight:item.weight,
                tag: "l" + source_node.tag + "-" + end_node.tag});
            //addnode(end_node,source_num,item.f_type,item.f_type,item.weight,true);
            restart(false);
        }else{
            //console.log("not exist target node"+item.t_num+"  "+item.t_type);
            var item= node_array[index];
            if(index ==0){
                point = [width/2,height/2];
            }
            //add source node
            end_node = {x: point.x, y: point.y,tag:target_num,type:item.t_type};//end node
            nodes.push(end_node);
            source_node = {x: point.x, y: point.y,tag:source_num,type:item.f_type};
            nodes.push(source_node);
            links.push({source: source_node, target:end_node , type: source_node.type,
                weight:item.weight,
                tag: "l" + source_node.tag + "-" + end_node.tag});
            //addnode(null,target_num,item.t_type,item.f_type,item.weight,false);
            //addnode(null,source_num,item.f_type,item.f_type,item.weight,true);
            restart(true);
        }

    }
    index++;
    //console.log("timer"+index);
    if(index>=node_array.length){
        console.log("stop timer"+index);
        clearInterval(addN);
        document.getElementById("btn_start").innerHTML="Start";
        document.getElementById("dis_label").style.display="inline";
        document.getElementById("dis_type").style.display="inline";
        document.getElementById("btn_pause").disabled  =true;
        document.getElementById("btn_pause").style.background="#cccccc";
        document.getElementById("btn_pause").innerHTML="Pause";
        is_pausing = false;
    }
}

function tick() {
    link.attr("x1", function(d) {
        return d.source.x; })
        .attr("y1", function(d) {
            return d.source.y; })
        .attr("x2", function(d) {
            return d.target.x; })
        .attr("y2", function(d) {
            return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
}

function restart(make_source) {

    link = link.data(links);

    link.enter().insert("line", ".node")
        .attr("id", function(d){
            return d.tag;
        })
        .attr("class", "link")
        .attr("style",function(d) {
            var c = getColor(parseInt(d.type))
            return "opacity:0.5;stroke-width:2;stroke:"+c;
        });

    node = node.data(nodes);


    node.enter().insert("circle", ".cursor")
        .attr("class", "node")
        .attr("r", function(){
            if(make_source){
                return 5;
            }else{
                return 5;
            }
        })
        .attr("stroke",function(d){
            if(make_source){
                return getColor(parseInt(d.type));
            }else{
                return null;
            }
        })
        .attr("stroke-width",function(d){
            if(make_source){
                return "5px";
            }else{
                return null;
            }
        })
        .attr("fill",function(d){
            if(make_source){
                return "#ffffff";
            }
            return getColor(parseInt(d.type))
        })
        .on("mouseover",function(d){
            getTagInfo(d)
        })
        .on("mouseout",function(d){
            document.getElementById("tag").style.display = "none";

        })
        .on("mousedown", function(d){
        })
        .on("mouseup",function(d){
            getGroupDirectLinks(d);
        })
        .call(force.drag);

    force.start();
}

function getGroupDirectLinks(d){
    var num = d.tag;
    var type= d.type;
    var selected_list =new Array();
    selected_list[0] = num;
    var sle_d = new Array();
    var sle_d_value = new Array();
    links.forEach(function(l){
        var include =false;
        if(contains(selected_list, l.source.tag)){
            include = true;
            if(!contains(selected_list, l.target.tag)){
                selected_list[selected_list.length] = l.target.tag;
            }
        }else if(contains(selected_list, l.target.tag)){
            include = true;
            if(!contains(selected_list, l.source.tag)){
                selected_list[selected_list.length] = l.source.tag;
            }
        }
        if(include){
            var type1 = l.source.type;
            var type2 = l.target.type;
            if(type1 ==0 || type1 == "0"){
                type1 =Math.round(Math.random()*1+1);
            }
            if(type2 ==0 || type2 == "0"){
                type2 = Math.round(Math.random()*1+1);
            }
            sle_d[sle_d.length] = {s_node:l.source.tag,
                t_node:l.target.tag,type1:type1,type2: type2};
            var times = parseInt(l.weight);
            if(times ==0){
                times = 1;
            }
            sle_d_value[sle_d_value.length] ={s_node:l.source.tag,
                t_node:l.target.tag,type1:type1,type2: type2,
                value: times};
        }
    });
    document.getElementById("matrix_panel").style.display = "inline";
    document.getElementById("num_group").innerHTML= "Group";
    addMatrix(sle_d,"matrix_chart1",false);
    addMatrix(sle_d_value,"matrix_chart2",true);
    addLegend_panel("martix_legend");
}

/*function getGroupNodes_Links(d){
    var x_range = [x0,x1];
    var y_range = [y0,y1];
    if(x1<x0){
        x_range = [x1,x0];
    }
    if(y1<y0){
        y_range = [y1,y0];
    }
    var seld_nodes = new Array();
    nodes.forEach(function(d){
        var x = d.x;
        var y = d.y;
        if(x>=x_range[0] && x<=x_range[1] && y>=y_range[0] && y<=y_range[1]){
            if(!contains(seld_nodes, d.tag)){
                seld_nodes[seld_nodes.length] = {number: d.tag,type: d.type};
                console.log("num"+d.tag);
            }
        }
    });

}*/

function contains(list, num){
    var i=0;
    for(;i<list.length;i++){
        if( num == list[i]){
            return true;
        }
    }
    return false;
}

//设置tag
function getTagInfo(d){
    //var index = parseInt(d.data.index);
    document.getElementById("tag").style.display = "inline";
    document.getElementById("tag_number").innerHTML= d.tag;
    var x = event.clientX;
    var y = event.clientY;
    document.getElementById("tag").style.left = x+"px";
    document.getElementById("tag").style.top = y+"px";
}

//根据设备类型返回颜色
function getColor(type){
    switch(type){
        case 0:
            return "rgba(255,255,255,0.6)";
            break;
        case 1:
            return "#23b7b7";
            break;
        case 2:
            return "#f5a80e";
            break;
        case 3:
            return "#f5a80e";
            break;
        case 4:
            return "#D4020F";
            break;
        default :
            return "#efefef";
    }
}

//设置权值
function showDropdown() {
    var sel = document.getElementById("dis_type").value;
    console.log(sel);
    if (sel == "1") {
        addLegend();
        link = link.data(links);
        links.forEach(function (d) {
            var l = d.tag;
            var w = parseInt(d.weight);
            var opa = 0.5;
            var line_w = 2;
            var color = getLineColorbyWeight(7);
            if (w > 100) {
                opa = 1;
                line_w = 5;
                color = getLineColorbyWeight(0);
            } else if (w > 87 && w < 100) {
                opa = 0.9;
                line_w = 4;
                color = getLineColorbyWeight(1);
            } else if (w <= 87 && w > 55) {
                opa = 0.8;
                line_w = 3;
                color = getLineColorbyWeight(2);
            } else if (w <= 55 && w > 24) {
                opa = 0.7;
                line_w = 2;
                color = getLineColorbyWeight(3);
            } else if (w <= 24 && w > 7) {
                opa = 0.6;
                line_w = 2;
                color = getLineColorbyWeight(4);
            } else if (w <= 7 && w > 5) {
                opa = 0.6;
                line_w = 2;
                color = getLineColorbyWeight(5);
            } else if (w <= 5 && w > 4) {
                opa = 0.6;
                line_w = 2;
                color = getLineColorbyWeight(6);
            }else if (w <= 4 && w > 2){
                opa = 0.6;
                line_w = 2;
                color = getLineColorbyWeight(7);
            }else if (w <= 2 && w >0){
                opa = 0.6;
                line_w = 2;
                color = getLineColorbyWeight(8);
            }else{
                opa = 0.5;
                line_w = 2;
                color = getLineColorbyWeight(8);
            }
            svg.select("#" + l).attr("style", "opacity:" + opa
                + ";stroke-width:" + line_w
                + ";stroke:" + color);
        });
        force.start();
    } else {
        link = link.data(links);
        links.forEach(function (d) {
            var l = d.tag;
            var w = d.weight;
            svg.select("#" + l).attr("style", "opacity:" + 0.5 + ";stroke-width:2"
                +";stroke:"+getColor(parseInt(d.type)));
        });
        force.start();
    }
}

function getLineColorbyWeight(level){
    var colors = ["#ffffd9","#edf8b1","#c7e9b4",
        "#7fcdbb","#41b6c4","#1d91c0",
        "#225ea8","#253494","#081d58"];
    return colors[level];
}

function setRate(){
    var sel = document.getElementById("play_type").value;
    if(sel=="1"){
        frame = 50;
    }
    if(sel=="2"){
        frame = 100;
    }
    if(sel=="3"){
        frame = 500;
    }
    if(!is_pausing){
        if(addN!== undefined){
            clearInterval(addN);
            addN = setInterval(addNode,frame);
        }
    }
}

function addLegend(){
    var buckets = 9,
        colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];
    var gridSize = 30,
        legendElementWidth = gridSize*2;
    var colorScale = d3.scale.quantile()
        .domain([0, buckets - 1, 150])
        .range(colors);
    document.getElementById("legend").innerHTML ="";
    var svg = d3.select("#legend").append("svg")
        .attr("width",legendElementWidth*9+100)
        .attr("height",100).append("g")
        .attr("transform", "translate(" + 20 + "," +20 + ")");
    var legend = svg.selectAll(".legend")
        .data([0].concat(colorScale.quantiles()), function(d) { return d; })
        .enter().append("g")
        .attr("class", "legend");

    legend.append("rect")
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", 0)
        .attr("width", legendElementWidth)
        .attr("height", gridSize / 2)
        .style("fill", function(d, i) { return colors[buckets-i-1]; });

    legend.append("text")
        .attr("class", "mono")
        .attr("font-size","0.2em")
        .attr("stroke","#ffffff")
        .text(function(d) { return "≥ " + Math.round(d); })
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", 50);
}

function addLegend_panel(name){
    var buckets = 9,
        colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];
    var gridSize = 20,
        legendElementWidth = gridSize*2;
    var colorScale = d3.scale.quantile()
        .domain([0, buckets - 1, 150])
        .range(colors);
    document.getElementById(name).innerHTML ="";
    var svg = d3.select("#"+name).append("svg")
        .attr("width",legendElementWidth*9+100)
        .attr("height",100).append("g")
        .attr("transform", "translate(" + 20 + "," +20 + ")");
    var legend = svg.selectAll(".legend")
        .data([0].concat(colorScale.quantiles()), function(d) { return d; })
        .enter().append("g")
        .attr("class", "legend");

    legend.append("rect")
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", 0)
        .attr("width", legendElementWidth)
        .attr("height", gridSize / 2)
        .style("fill", function(d, i) { return colors[buckets-i-1]; });

    legend.append("text")
        .attr("class", "mono")
        .attr("font-size","0.2em")
        .attr("stroke","#ffffff")
        .text(function(d) { return "≥ " + Math.round(d); })
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", 50);
}

//添加group 矩阵
function addMatrix(links_arr,id_name,with_weight){

    var margin = {top: 80, right: 0, bottom: 10, left:50},
        width = 250,
        height = 250;
    var column_color=["#00AEEF", "#F9D423","#FF4E50",
    "#009C69","#8739CC","#FC913A"];
    //green purple orange
    var colorScale  = ["#ffffd9","#edf8b1","#c7e9b4",
        "#7fcdbb","#41b6c4","#1d91c0",
        "#225ea8","#253494","#081d58"];;

    var x = d3.scale.ordinal().rangeBands([0, width]),
        z = d3.scale.linear().domain([0, 8]).clamp(true),
        c = d3.scale.category10().domain(d3.range(10));

    document.getElementById(id_name).innerHTML = "";
    var svg = d3.select("#"+id_name).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var matrix = [];

    var nodes=new Array(),links=new Array(); //[{index:i,number:num,type:type}] //[{source: , target:  ,value:0 }]
    links_arr.forEach(function(d){
        var s_node = d.s_node;
        var t_node = d.t_node;
        var s_index=-1,t_index = -1;
        nodes.forEach(function(n){
            if(n.number == s_node){
                //存在
                s_index = n.index;
                var type = n.type;
                if(type != d.type){
                    nodes[n.index].type = d.type;
                }
            }
            if(n.number == t_node){
                t_index = n.index;
            }
        });
        if(s_index == -1){
            s_index = nodes.length;
            var obj = {index:nodes.length,number:s_node,group: d.type1};
            nodes[nodes.length] = obj;

        }
        if(t_index == -1){
            t_index = nodes.length;
            var obj = {index:nodes.length,number:t_node,group: d.type2};
            nodes[nodes.length] = obj;

        }
        var  times = d.value;
        if(times == undefined){
            times= 1;
        }
        console.log("source:"+s_index+",target:"+t_index+",value:"+times);

        var obj = {source:s_index,target:t_index,value:times};
        links[links.length] = obj;
    });

    var n = nodes.length;
    nodes.forEach(function(node, i) {
        node.index = i;
        node.count = 0;
        matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
    });
    links.forEach(function(link) {
        console.log("link_index"+" "+link.source+":"+link.target+":"+link.value);
        var s = link.source;
        var t = link.target;
        matrix[s][t].z += link.value;
        matrix[s][s].z += 1;
        matrix[t][t].z += 1;
        nodes[s].count += link.value;
        nodes[t].count += link.value;
    });

// Precompute the orders.
    var orders = {
        name: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
        count: d3.range(n).sort(function(a, b) { return nodes[b].count - nodes[a].count; }),
        group: d3.range(n).sort(function(a, b) { return nodes[b].group - nodes[a].group; })
    };

// The default sort order.
    x.domain(orders.name);

    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height);

    var row = svg.selectAll(".row")
        .data(matrix)
        .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
        .each(row);

    row.append("line")
        .attr("x2", width);

    row.append("text")
        .attr("x", -6)
        .attr("y", x.rangeBand() / 2+5)
        .attr("dy", ".12em")
        .attr("text-anchor", "end")
        .text(function(d, i) {
            var type = nodes[i].group;
            switch(type){
                case 1:
                    return nodes[i].number;//"Album";
                    break;
                case 2:
                    return nodes[i].number;//"Mobile";
                    break;
                case 4:
                    return nodes[i].number;//"PC";
                    break;
            }
            return nodes[i].name;
        })
        .attr("stroke",function(d,i){
            var type = nodes[i].group;
            if(type == 1){
                return column_color[0];//"#3366cc";
            }
            if(type ==2){
                return column_color[1];//"#00b9e8";
            }
            if(type == 4){
                return column_color[2];//"#FFD93C";
            }
            return "#999999";
        });

    var column = svg.selectAll(".column")
        .data(matrix)
        .enter().append("g")
        .attr("class", "column")
        .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

    column.append("line")
        .attr("x1", -width);

    column.append("text")
        .attr("x", 6)
        .attr("y", x.rangeBand() / 2+5)
        .attr("dy", ".12em")
        .attr("text-anchor", "start")
        .text(function(d, i) {
            var type = nodes[i].group;
            switch(type){
                case 1:
                    return nodes[i].number;//"_Album";
                    break;
                case 2:
                    return nodes[i].number;//"_Mobile";
                    break;
                case 4:
                    return nodes[i].number;//"_PC";
                    break;
            }
        })
        .attr("stroke",function(d,i){
            var type = nodes[i].group;
            if(type == 1){
                return column_color[0];//"#3366cc";
            }
            if(type ==2){
                return column_color[1];//"#00b9e8";
            }
            if(type == 4){
                return column_color[2];//"#FFD93C";
            }
            return "#999999";
        });

    function row(row) {
        var cell = d3.select(this).selectAll(".cell")
            .data(row.filter(function(d) { return d.z; }))
            .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function(d) { return x(d.x); })
            .attr("width", x.rangeBand())
            .attr("height", x.rangeBand())
            .style("fill-opacity", function(d) {
                return 1;
                //return z(d.z);
            })
            .style("fill", function(d) {
                if(!with_weight){
                    return getRectColor(d);
                }else{
                    if(d.x == d.y){
                        return "#666";
                    }else{
                        var w = d.z;
                        var index = 0;
                        if (w > 100) {
                            index = 0
                        } else if (w > 87 && w < 100) {
                            index = 1;
                        } else if (w <= 87 && w > 55) {
                            index = 2;
                        } else if (w <= 55 && w > 24) {
                            index = 3;
                        } else if (w <= 24 && w > 7) {
                            index = 4;
                        } else if (w <= 7 && w > 5) {
                            index = 5;
                        } else if (w <= 5 && w > 4) {
                            index = 6;
                        }else if (w <= 4 && w > 2){
                            index = 7;
                        }else if (w <= 2 && w >0){
                            index = 8;
                        }else{
                            index = 8;
                        }
                        return colorScale[index];
                    }
                }
                //return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null;
            });
    }

    function order(value) {
        x.domain(orders[value]);

        var t = svg.transition().duration(2500);

        t.selectAll(".row")
            .delay(function(d, i) { return x(i) * 4; })
            .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
            .selectAll(".cell")
            .delay(function(d) { return x(d.x) * 4; })
            .attr("x", function(d) { return x(d.x); });

        t.selectAll(".column")
            .delay(function(d, i) { return x(i) * 4; })
            .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
    }

    var timeout = setTimeout(function() {
        order("group");
        //d3.select("#order").property("selectedIndex", 2).node().focus();
    }, 1000);

    function getRectColor(d){
        if(d.x == d.y){
            return "#121212";
        }
        var g_x =  nodes[d.x].group;
        var g_y =  nodes[d.y].group;

        if(g_x==1 && g_y==1){
            return column_color[0];
        }
        if(g_x==2 && g_y==2){
            return column_color[1];
        }
        if(g_x==4 && g_y==4){
            return column_color[2];
        }

        if((g_x==1 && g_y==2)||(g_x==2 && g_y==1)){
            return column_color[3];//#009C69"; //green
        }
        if((g_x==1 && g_y==4)||(g_x==4 && g_y==1)){
            return column_color[4];//"#8739CC"; //purple
        }
        if((g_x==2 && g_y==4)||(g_x==4 && g_y==2)){
            return column_color[5];//"#FC913A"; //orange
        }
        return "#121212";
    }
}