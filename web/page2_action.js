/**
 * Created by sand_yu on 14-8-28.
 */

function showDropdown(){
    var type =  $("#rank_type").find("option:selected").text();
    if(type == "Month"){
        document.getElementById("month_index").style.display="inline";
        document.getElementById("datepicker").style.display="none";
    }else{
        document.getElementById("month_index").style.display="none";
        document.getElementById("datepicker").style.display = "inline";
    }
}

//年月日
function CalWeekIndex(a, b, c) {
    var d1 = new Date(a, b-1, c);
    var d2 = new Date(a, 0, 1);
    var d = Math.round((d1 - d2) / 86400000);
    return Math.ceil((d + ((d2.getDay() + 1) - 1)) / 7);
};

function showDataChart(){
    ClearView();

    var week_s =[1,5,9,15,18,22,27,32];//1,2,3,4,5,6,7,8
    var type =  $("#rank_type").find("option:selected").text();
    //document.getElementsByName("number")[0].value;
    var file_path="";
    var title = "";
    if(type == "Month"){
        var month =  $("#month_index").val();
        document.getElementById("panel_title").innerHTML = "Manner in "+$("#month_index").find("option:selected").text();
        file_path = "data/map_by_month/heapMap_month"+month+".tsv"
        title = "Month "+month;
        setMonthView(file_path,title);
        var start_index = week_s[month-1];
        setWeekView(start_index,1);
        setWeekView(start_index+1,2);
        setWeekView(start_index+2,3);
        setWeekView(start_index+3,4);
        month = parseInt(month);
        setPanel(month);
    }else{
        /*var year = $( "#datepicker" ).datepicker().year;
         var month = $( "#datepicker" ).datepicker().month;
         var day = $( "#datepicker" ).datepicker().day;*/
        var week = $("#datepicker").val();
        //CalWeekIndex(year,month,day);
        console.log(week);
        file_path = "data/map_by_num/heapMap_week"+week+".tsv";
        title = "Week "+week;
        setMonthView(file_path,title);
    }
}
max_month=0;
function setMonthView(file_path,title){
    var margin = { top: 50, right: 0, bottom: 60, left: 30 },
        width = 1100 - margin.left - margin.right,
        height = 430 - margin.top - margin.bottom,
        gridSize = Math.floor(width / 24),
        legendElementWidth = gridSize*2,
        buckets = 9,
        colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
        days = ["Su","Mo", "Tu", "We", "Th", "Fr", "Sa"],
        times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];


    d3.tsv(file_path,
        function(d) {
            return {
                day: +d.day,
                hour: +d.hour,
                value: +d.value
            };
        },
        function(error, data) {
            var colorScale = d3.scale.quantile()
                .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
                .range(colors);
            max_month =  d3.max(data, function (d) { return d.value; });

            var svg = d3.select("#chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom).append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.append("text")
                .text(title)
                .attr("class","label_txt")
                .attr("font-size","1em")
                .attr("x",0).attr("y",-20);

            var dayLabels = svg.selectAll(".dayLabel")
                .data(days)
                .enter().append("text")
                .text(function (d) { return d; })
                .attr("x", 0)
                .attr("y", function (d, i) { return i * gridSize; })
                .style("text-anchor", "end")
                .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
                .attr("class", function (d, i) { return ((i >= 1 && i < 6) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

            var timeLabels = svg.selectAll(".timeLabel")
                .data(times)
                .enter().append("text")
                .text(function(d) { return d; })
                .attr("x", function(d, i) { return i * gridSize; })
                .attr("y", 0)
                .style("text-anchor", "middle")
                .attr("transform", "translate(" + gridSize / 2 + ", -6)")
                .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

            var heatMap = svg.selectAll(".hour")
                .data(data)
                .enter().append("rect")
                .attr("x", function(d) { return (d.hour - 1) * gridSize; })
                .attr("y", function(d) { return (d.day - 1) * gridSize; })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "hour bordered")
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("fill", colors[0])
                .on("mouseover",function(d){
                    getRectTagInfo(d.day, d.hour,d.value)
                })
                .on("mouseout",function(d){
                    document.getElementById("rect_tag").style.display="none";
                });

            heatMap.transition().duration(1000)
                .style("fill", function(d) { return colorScale(d.value); });

            heatMap.append("title").text(function(d) { return d.value; });

            var legend = svg.selectAll(".legend")
                .data([0].concat(colorScale.quantiles()), function(d) { return d; })
                .enter().append("g")
                .attr("class", "legend");

            legend.append("rect")
                .attr("x", function(d, i) { return legendElementWidth * i; })
                .attr("y", height)
                .attr("width", legendElementWidth)
                .attr("height", gridSize / 2)
                .style("fill", function(d, i) { return colors[i]; });

            legend.append("text")
                .attr("class", "mono")
                .text(function(d) { return "≥ " + Math.round(d); })
                .attr("x", function(d, i) { return legendElementWidth * i; })
                .attr("y", height + gridSize);
        });
}
<!-- get Week-->
function setWeekView(week,index){
    var file_path = "data/map_by_num/heapMap_week"+week+".tsv";
    var title = "Week "+week;
    var begin_date = getBeginDateOfWeek(2014,week-1);
    var end_date = getEndDateOfWeek(2014,week-1);
    title+=" （"+begin_date +" - "+end_date+" )";

    var margin = { top: 50, right: 0, bottom: 60, left: 30 },
        width = 550 - margin.left - margin.right,
        height = 260 - margin.top - margin.bottom,
        gridSize = Math.floor(width / 24),
        legendElementWidth = gridSize*2.5,
        buckets = 9,
        colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
        days = ["Su","Mo", "Tu", "We", "Th", "Fr", "Sa"],
        times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];


    d3.tsv(file_path,
        function(d) {
            return {
                day: +d.day,
                hour: +d.hour,
                value: +d.value
            };
        },
        function(error, data) {
            var max_week=  d3.max(data, function (d) { return d.value; });
            if(max_month !=0){
                max_week = max_month;
            }
            var colorScale = d3.scale.quantile()
                .domain([0, buckets - 1,max_week])
                .range(colors);

            var svg = d3.select("#chart"+index).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom).append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.append("text")
                .text(title).attr("class","label_txt")
                .attr("x",0).attr("y",-30);

            var dayLabels = svg.selectAll(".dayLabel")
                .data(days)
                .enter().append("text")
                .text(function (d) { return d; })
                .attr("x", 0)
                .attr("y", function (d, i) { return i * gridSize; })
                .style("text-anchor", "end")
                .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
                .attr("class", function (d, i) {
                    return ((i >=1 && i < 6) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

            var timeLabels = svg.selectAll(".timeLabel")
                .data(times)
                .enter().append("text")
                .text(function(d) { return d; })
                .attr("x", function(d, i) { return i * gridSize; })
                .attr("y", 0)
                .style("text-anchor", "middle")
                .attr("transform", "translate(" + gridSize / 2 + ", -6)")
                .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

            var heatMap = svg.selectAll(".hour")
                .data(data)
                .enter().append("rect")
                .attr("x", function(d) { return (d.hour - 1) * gridSize; })
                .attr("y", function(d) { return (d.day - 1) * gridSize; })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "hour bordered")
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("fill", colors[0]);

            heatMap.transition().duration(1000)
                .style("fill", function(d) { return colorScale(d.value); });

            heatMap.append("title").text(function(d) { return d.value; });

            var legend = svg.selectAll(".legend")
                .data([0].concat(colorScale.quantiles()), function(d) { return d; })
                .enter().append("g")
                .attr("class", "legend");

            legend.append("rect")
                .attr("x", function(d, i) { return legendElementWidth * i; })
                .attr("y", height+10)
                .attr("width", legendElementWidth)
                .attr("height", gridSize / 2)
                .style("fill", function(d, i) { return colors[i]; });

            legend.append("text")
                .attr("class", "mono")
                .attr("font-size","0.2em")
                .text(function(d) { return "≥ " + Math.round(d); })
                .attr("x", function(d, i) { return legendElementWidth * i; })
                .attr("y", height + gridSize+20);
        });
}
//获取某年某周的开始日期
function getBeginDateOfWeek(paraYear, weekIndex){
    var firstDay = GetFirstWeekBegDay(paraYear);
    //7*24*3600000 是一星期的时间毫秒数,(JS中的日期精确到毫秒)
    var time=(weekIndex-1)*7*24*3600000;
    var beginDay = firstDay;
    //为日期对象 date 重新设置成时间 time
    beginDay.setTime(firstDay.valueOf()+time-24*3600000);
    return formatDate(beginDay);
}

//获取某年某周的结束日期
function getEndDateOfWeek(paraYear, weekIndex){
    var firstDay = GetFirstWeekBegDay(paraYear);
    //7*24*3600000 是一星期的时间毫秒数,(JS中的日期精确到毫秒)
    var time=(weekIndex-1)*7*24*3600000;
    var weekTime = 6*24*3600000;
    var endDay = firstDay;
    //为日期对象 date 重新设置成时间 time
    endDay.setTime(firstDay.valueOf()+weekTime+time-24*3600000);
    return formatDate(endDay);
}

//获取某年的第一天
function GetFirstWeekBegDay(year) {
    var tempdate = new Date(year, 0, 1);
    var temp = tempdate.getDay();
    if (temp == 1){
        return tempdate;
    }
    temp = temp == 0 ? 7 : temp;
    tempdate = tempdate.setDate(tempdate.getDate() + (8 - temp));
    return new Date(tempdate);
}

function formatDate(date) {
    var myyear = date.getFullYear();
    var mymonth = date.getMonth()+1;
    var myweekday = date.getDate();

    if(mymonth < 10){
        mymonth = "0" + mymonth;
    }
    if(myweekday < 10){
        myweekday = "0" + myweekday;
    }
    return (mymonth + "/" + myweekday);//myyear+"-"+
}

function ClearView(){
    document.getElementById("chart").innerHTML ="";
    document.getElementById("chart1").innerHTML ="";
    document.getElementById("chart2").innerHTML ="";
    document.getElementById("chart3").innerHTML ="";
    document.getElementById("chart4").innerHTML ="";
    document.getElementById("panel").style.display="none";
}

//参与分享的用户数量
function setPanel(mon){
    console.log("Month"+mon);
    document.getElementById("panel").style.display="inline";
    document.getElementById("pie_chart").innerHTML = "";
    var width = 160,
        height = 160,
        radius = Math.min(width, height) / 2;

    var color = d3.scale.ordinal()
        .range(["#ffffff", "#efefef", "#23b7b7", "#f5a80e", "#D4020F", "#ffffff", "#ffffff"]);
    var block_name =  d3.scale.ordinal()
        .range(["Nan_users","Album_users","Mobile_users","Pc_users"]);

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);
    var mon_index = 6;
    var active_number=0;
    var pic_num = 0;

    var svg = d3.select("#pie_chart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    d3.csv("data/map_by_month/month_send_manner.csv", function(error, data) {
        data.forEach(function(d) {
            switch (mon){
                case 8:
                    if(d.index==0){
                        active_number= d.month8;
                    }
                    if(d.index>0 && d.index<5){
                        d.month8 = +d.month8;
                    }
                    if(d.index==5){
                        pic_num = +d.month8;
                    }
                    break;
                case 1:
                    if(d.index==0){
                        active_number= d.month1;
                    }
                    if(d.index>0 && d.index<5){
                        d.month1 = +d.month1;
                    }
                    if(d.index==5){
                        pic_num = +d.month1;
                    }
                    break;
                case 2:
                    if(d.index==0){
                        active_number= d.month2;
                    }
                    if(d.index>0 && d.index<5){
                        d.month2 = +d.month2;
                    }
                    if(d.index==5){
                        pic_num = +d.month2;
                    }
                    break;
                case 3:
                    if(d.index==0){
                        active_number= d.month3;
                    }
                    if(d.index>0 && d.index<5){
                        d.month3 = +d.month3;
                    }
                    if(d.index==5){
                        pic_num = +d.month3;
                    }
                    break;
                case 4:
                    if(d.index==0){
                        active_number= d.month4;
                    }
                    if(d.index>0 && d.index<5){
                        d.month4 = +d.month4;
                    }
                    if(d.index==5){
                        pic_num = +d.month4;
                    }
                    break;
                case 5:
                    if(d.index==0){
                        active_number= d.month5;
                    }
                    if(d.index>0 && d.index<5){
                        d.month5 = +d.month5;
                    }
                    if(d.index==5){
                        pic_num = +d.month5;
                    }
                    break;
                case 6:
                    if(d.index==0){
                        active_number= d.month6;
                    }
                    if(d.index>0 && d.index<5){
                        d.month6 = +d.month6;
                    }
                    if(d.index==5){
                        pic_num = +d.month6;
                    }
                    break;
                case 7:
                    if(d.index==0){
                        active_number= d.month7;
                    }
                    if(d.index>0 && d.index<5){
                        d.month7 = +d.month7;
                    }
                    if(d.index==5){
                        pic_num = +d.month7;
                    }
                    break;
            }

        });

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) {
                if(d.index>0 && d.index<5) {
                    switch (mon){
                        case 8:
                            return d.month8;
                            break;
                        case 1:
                            return d.month1;
                            break;
                        case 2:
                            return d.month2;
                            break;
                        case 3:
                            return d.month3;
                            break;
                        case 4:
                            return d.month4;
                            break;
                        case 5:
                            return d.month5;
                            break;
                        case 6:
                            return d.month6;
                            break;
                        case 7:
                            return d.month7;
                            break;
                    }
                }else{
                    return 0;
                }
            });

        document.getElementById("pie_title1").innerHTML = "本月活跃用户端： "+active_number+"个";
        var g = svg.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");

        g.append("path")
            .attr("d", arc)
            .attr("class","pie_block")
            .on("mouseover", function(d) {							// when the mouse leaves a circle, do the following
                //console.log(d.data.month6);
                var index = parseInt(d.data.index);
                getTagInfo(index, d.value,active_number,color(index));
            })
            .on("mouseout", function(d) {
                document.getElementById("tag").style.display = "none";
            })
            .style("fill", function(d) {
                var c = d.data.index;
                return color(d.data.index);
            });

        g.append("text")
            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .attr("stroke","#333")
            .attr("class","pie_label")
            .text(function(d) {
                var i = parseInt(d.data.index);
                if(i>0 && i<5) {
                    var t = "";//block_name(d.data.index);
                    switch (mon){
                        case 8:
                            return Math.round(parseInt(d.data.month8)*100/active_number)+"%";
                            break;
                        case 1:
                            return Math.round(parseInt(d.data.month1)*100/active_number)+"%";
                            break;
                        case 2:
                            return Math.round(parseInt(d.data.month2)*100/active_number)+"%";
                            break;
                        case 3:
                            return Math.round(parseInt(d.data.month3)*100/active_number)+"%";
                            break;
                        case 4:
                            return Math.round(parseInt(d.data.month4)*100/active_number)+"%";
                            break;
                        case 5:
                            return Math.round(parseInt(d.data.month5)*100/active_number)+"%";
                            break;
                        case 6:
                            return Math.round(parseInt(d.data.month6)*100/active_number)+"%";
                            break;
                        case 7:
                            return Math.round(parseInt(d.data.month7)*100/active_number)+"%";
                            break;
                    }
                    //return t + d.data.month6;
                }else{
                    return "";
                }
            });
    });
    setActivePanel(mon)
}

//截止此月，已被激活的用户数量
function setActivePanel(mon){
    document.getElementById("pie_chart_user").innerHTML = "";
    var width = 160,
        height = 160,
        radius = Math.min(width, height) / 2;

    var color = d3.scale.ordinal()
        .range(["#ffffff", "#efefef", "#23b7b7", "#f5a80e", "#D4020F", "#ffffff", "#ffffff"]);
    var block_name =  d3.scale.ordinal()
        .range(["Nan_users","Album_users","Mobile_users","Pc_users"]);

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);
    var mon_index = 6;
    var active_number=0;
    var pic_num = 0;

    var svg = d3.select("#pie_chart_user").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    d3.csv("data/map_by_month/month_active_user.csv", function(error, data) {
        data.forEach(function(d) {
            switch (mon){
                case 8:
                    if(d.index==0){
                        active_number= d.month8;
                    }
                    if(d.index>0 && d.index<5){
                        d.month8 = +d.month8;
                    }
                    if(d.index==5){
                        pic_num = +d.month8;
                    }
                    break;
                case 1:
                    if(d.index==0){
                        active_number= d.month1;
                    }
                    if(d.index>0 && d.index<5){
                        d.month1 = +d.month1;
                    }
                    if(d.index==5){
                        pic_num = +d.month1;
                    }
                    break;
                case 2:
                    if(d.index==0){
                        active_number= d.month2;
                    }
                    if(d.index>0 && d.index<5){
                        d.month2 = +d.month2;
                    }
                    if(d.index==5){
                        pic_num = +d.month2;
                    }
                    break;
                case 3:
                    if(d.index==0){
                        active_number= d.month3;
                    }
                    if(d.index>0 && d.index<5){
                        d.month3 = +d.month3;
                    }
                    if(d.index==5){
                        pic_num = +d.month3;
                    }
                    break;
                case 4:
                    if(d.index==0){
                        active_number= d.month4;
                    }
                    if(d.index>0 && d.index<5){
                        d.month4 = +d.month4;
                    }
                    if(d.index==5){
                        pic_num = +d.month4;
                    }
                    break;
                case 5:
                    if(d.index==0){
                        active_number= d.month5;
                    }
                    if(d.index>0 && d.index<5){
                        d.month5 = +d.month5;
                    }
                    if(d.index==5){
                        pic_num = +d.month5;
                    }
                    break;
                case 6:
                    if(d.index==0){
                        active_number= d.month6;
                    }
                    if(d.index>0 && d.index<5){
                        d.month6 = +d.month6;
                    }
                    if(d.index==5){
                        pic_num = +d.month6;
                    }
                    break;
                case 7:
                    if(d.index==0){
                        active_number= d.month7;
                    }
                    if(d.index>0 && d.index<5){
                        d.month7 = +d.month7;
                    }
                    if(d.index==5){
                        pic_num = +d.month7;
                    }
                    break;
            }

        });

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) {
                if(d.index>0 && d.index<5) {
                    switch (mon){
                        case 8:
                            return d.month8;
                            break;
                        case 1:
                            return d.month1;
                            break;
                        case 2:
                            return d.month2;
                            break;
                        case 3:
                            return d.month3;
                            break;
                        case 4:
                            return d.month4;
                            break;
                        case 5:
                            return d.month5;
                            break;
                        case 6:
                            return d.month6;
                            break;
                        case 7:
                            return d.month7;
                            break;
                    }
                }else{
                    return 0;
                }
            });

        var g = svg.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");
        document.getElementById("pie_title2").innerHTML = "本月已激活用户端： "+active_number+"个";
        g.append("path")
            .attr("d", arc)
            .on("mouseover", function(d) {							// when the mouse leaves a circle, do the following
                //console.log(d.data.month6);
                var index = parseInt(d.data.index);
                getTagInfo(index, d.value,active_number,color(index));
            })
            .on("mouseout", function(d) {
                document.getElementById("tag").style.display = "none";
            })
            .style("fill", function(d) {
                var c = d.data.index;
                return color(d.data.index);
            });

        g.append("text")
            .attr("transform", function(d) { return "translate(" + arc.centroid(d)+ ")"; })
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .attr("stroke","#333")
            .text(function(d) {
                var i = parseInt(d.data.index);
                if(i>0 && i<5) {
                    var t = "";//block_name(d.data.index);
                    switch (mon){
                        case 8:
                            return Math.round(parseInt(d.data.month8)*100/active_number)+"%";
                            break;
                        case 1:
                            return Math.round(parseInt(d.data.month1)*100/active_number)+"%";
                            break;
                        case 2:
                            return Math.round(parseInt(d.data.month2)*100/active_number)+"%";
                            break;
                        case 3:
                            return Math.round(parseInt(d.data.month3)*100/active_number)+"%";
                            break;
                        case 4:
                            return Math.round(parseInt(d.data.month4)*100/active_number)+"%";
                            break;
                        case 5:
                            return Math.round(parseInt(d.data.month5)*100/active_number)+"%";
                            break;
                        case 6:
                            return Math.round(parseInt(d.data.month6)*100/active_number)+"%";
                            break;
                        case 7:
                            return Math.round(parseInt(d.data.month7)*100/active_number)+"%";
                            break;
                    }
                    //return t + d.data.month6;
                }else{
                    return "";
                }
            });
    });
}

//设置tag
function getTagInfo(index,value,active_number,color){
    //var index = parseInt(d.data.index);
    document.getElementById("tag").style.display = "inline";
    document.getElementById("tag_percent").innerHTML = Math.round(value*100/active_number)+"%";
    document.getElementById("tag_number").innerHTML= value+"/"+active_number;
    var x = event.clientX;
    var y = event.clientY;
    document.getElementById("tag").style.left = x+"px";
    document.getElementById("tag").style.top = y+"px";
    //document.getElementById("tag").style.borderColor=color;
}
//设置tag
weekdays = ["周日","周一","周二","周三","周四","周五","周六"]
function getRectTagInfo(day,time,value){
    //var index = parseInt(d.data.index);
    document.getElementById("rect_tag").style.display = "inline";
    var x = event.clientX;
    var y = event.clientY;
    document.getElementById("rect_tag").style.left = x+"px";
    document.getElementById("rect_tag").style.top = y+"px";

    document.getElementById("cishu").innerHTML=weekdays[day]+" "+time+"点 -  分享"+value+"张";
}