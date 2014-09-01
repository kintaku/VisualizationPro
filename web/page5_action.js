
var links_arr = [{s_node:"009557",t_node:"007250",type1:4,type2:1},{s_node:"007312",t_node:"007250",type1:2,type2:1},
    {s_node:"008055",t_node:"007250",type1:2,type2:1},{s_node:"008335",t_node:"007250",type1:2,type2:1},
    {s_node:"007300",t_node:"007250",type1:2,type2:1},{s_node:"007312",t_node:"007293",type1:2,type2:2},
    {s_node:"007300",t_node:"007294",type1:2,type2:2},{s_node:"007294",t_node:"007300",type1:2,type2:2},
    {s_node:"007293",t_node:"007116",type1:2,type2:1},{s_node:"007294",t_node:"007116",type1:2,type2:1},
    {s_node:"007288",t_node:"007116",type1:2,type2:1},{s_node:"010056",t_node:"007116",type1:2,type2:1}];
addMatrix(links_arr)
function addMatrix(links_arr){
    var margin = {top: 80, right: 0, bottom: 10, left: 80},
        width = 250,
        height = 250;

    var x = d3.scale.ordinal().rangeBands([0, width]),
        z = d3.scale.linear().domain([0, 8]).clamp(true),
        c = d3.scale.category10().domain(d3.range(10));

    var svg = d3.select("#matrix_chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("margin-left", margin.left + "px")
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
        console.log("source:"+s_index+",target:"+t_index+",value:0");
        var obj = {source:s_index,target:t_index,value:Math.random()*8};
        links[links.length] = obj;
    });
    var n = nodes.length;
// Compute index per node.
    nodes.forEach(function(node, i) {
        node.index = i;
        node.count = 0;
        matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
    });

// Convert links to matrix; count character occurrences.
    links.forEach(function(link) {
        console.log("link_index"+" "+link.source+":"+link.target);
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
        .attr("dy", ".16em")
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
                return "#3366cc";
            }
            if(type ==2){
                return "#00b9e8";
            }
            if(type == 4){
                return "#FFD93C";
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
        .attr("dy", ".16em")
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
                return "#3366cc";
            }
            if(type ==2){
                return "#00b9e8";
            }
            if(type == 4){
                return "#FFD93C";
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
                if(d.x == d.y){
                    return "#cccccc";
                }
                var g_x =  nodes[d.x].group;
                var g_y =  nodes[d.y].group;

                if(g_x==1 && g_y==1){
                    return "#01003A";
                }
                if(g_x==2 && g_y==2){
                    return "#4DBCE9";
                }
                if(g_x==4 && g_y==4){
                    return "#FFD93C";
                }

                if((g_x==1 && g_y==2)||(g_x==2 && g_y==1)){
                    return "#02779E";
                }
                if((g_x==1 && g_y==4)||(g_x==4 && g_y==1)){
                    return "#0D6759";
                }
                if((g_x==2 && g_y==4)||(g_x==4 && g_y==2)){
                    return "#7AB317";
                }

                return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null;
            });
            //.on("mouseover", mouseover)
            //.on("mouseout", mouseout);
    }

    function mouseover(p) {
        d3.selectAll(".row text").classed("active", function(d, i) {
            return i == p.y; });
        d3.selectAll(".column text").classed("active", function(d, i) {
            return i == p.x; });
    }

    function mouseout() {
        d3.selectAll("text").classed("active", false);
    }

    d3.select("#order").on("change", function() {
        clearTimeout(timeout);
        // order(this.value);
    });

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
}

//miserables link_matrix
/*d3.json("data/nodes/link_matrix.json", function(miserables) {

});*/