/**
 * Created by yuhao on 23/6/16.
 */
var widthOfcontainer = 200;
var color_handleL1, color_handleR1;
var color_brush1;
var selection_bar1;
var color_x1,color_y1;
var ticks1;
var label_color = "#cccccc";

function draw_colorSlider_1(className){
    ticks1 = color_split1.length-1;

    var unit_height = 10;
    var data = [], obj = {};

   /* //add in the zero th color
    obj["color"] = '#DEEBF7'; 
    obj["x"] = 0;
    obj["label"] = 0;
    obj["height"] = unit_height;
    data.push(obj);
    obj = {};
    */

    for(var i =ticks1;i>=0; i--){
        obj["color"] = colors1[i];
        obj["x"] = ticks1 -i;
        obj["label"] = color_split1[i];
        obj["height"] = unit_height;
        data.push(obj);
        obj = {};
    }

    var margin = {top: 7, right: 10, bottom: 0, left: 10};
    var color_slider_width = widthOfcontainer - margin.left - margin.right,
        color_slider_height = 15;

    var tick_height = 1;

    color_x1 = d3.scale.linear().range([0, color_slider_width]);
    color_y1 = d3.scale.linear().range([color_slider_height, 0]);

    var xAxis = d3.svg.axis().scale(color_x1).orient("bottom")
        .ticks(ticks1);
    //.tickFormat(function(d) { return d.label; })
    //.tickSize(15)
    //.tickPadding(20);
    var yAxis = d3.svg.axis().scale(color_y1).orient("left");

    color_brush1 = d3.svg.brush()
        .x(color_x1)
        .on("brush", color_brushed1);

    var area = d3.svg.area()
        .interpolate("monotone")
        .x(function(d) { return color_x1(d.x); })
        .y0(color_slider_height)
        .y1(function(d) { return color_y1(d.height); });

    var body = d3.select("#pop_densityHolder").selectAll("li").append("div")
                                    .attr("class","menu "+className);

    var svg = body.append("svg")
        .attr("width", color_slider_width + margin.left + margin.right)
        .attr("height", color_slider_height + margin.top + margin.bottom+20);

    /*svg.append("defs")
     .append("clipPath")
     .attr("id", "clip")
     .append("rect")
     .attr("width", width)
     .attr("height", height);*/

    var context = svg.append("g")
        .attr("id", "pop_color_bar_context")
        .attr("class", "context")
        .attr("transform", "translate(" + margin.left + "," + (margin.top+10) + ")");

    color_x1.domain([0,ticks1]);
    color_y1.domain([0,unit_height]);

    var grad = svg.append("defs")
        .append("linearGradient")
        .attr("id", "grad");

    var perc_interval = 100/ticks1;

    data.forEach(function(d,i){
        grad.append("stop").attr("offset", i*perc_interval+"%").attr("stop-color", d.color);
        grad.append("stop").attr("offset", (i+1)*perc_interval+"%").attr("stop-color", d.color);
    });

    context.append("path")
        .datum(data)
        .style("fill", "url(#grad)")
        .attr("class", "area")
        .attr("d", area);

    context.append("g")
        //.attr("class", "x axis")
        .attr("transform", "translate(0," + tick_height + ")")
        .attr("fill","none")
        .call(xAxis);

    context.append("g")
        .attr("class", "x color_brush")
        .call(color_brush1);
    /*.selectAll("rect")
     .attr("y", -6)
     .attr("height", height + 7);*/

    var labels = body.append("svg").attr("id", "pop_labels")
        .attr("width",widthOfcontainer+20)
        .attr("height",17)
        .attr("transform","translate(12,0)")
        .append("g")
        .attr("transform","translate(12,0)");

    labels.selectAll("text").data(data)
        .enter()
        .append("text")
        .text(function(d){
            return d.label;
        }).attr("fill",label_color)
        .attr("x",function(d){
            if(d.label == 0)
                return color_x1(d.x) + 8;

            return color_x1(d.x);
        }).attr("y",7)
        .attr("font-size","9px");

    selection_bar1 = context.append("rect")//.attr("class","color_brush")
        .style("height",color_slider_height+'px')
        .style("fill","gold")
        .style("opacity",".125");
       // .attr("transform", "translate("+0+"," +0 + ")");//t x="0" y="0" width="50" height="50" fill="green"

    context.append("g")
       // .attr("class", "y axis")
        .attr("fill","none")
        .call(yAxis);

    var drag = d3.behavior.drag()
        .on("dragstart", drag_start1)
        .on("drag", drag_handler1)
        .on("dragend", drop_handler1);
    //var drop = d3.behavior.drop
    //    .on("drop", drop_handler1);

    color_handleL1 = context.append("rect")
        //.attr("points","00,00 05,10 10,00")
        .attr("class", "L handle")
        .style("fill",label_color)
        .style("opacity",0.75)
        .style("width","9px")
        .style("height","25px")
        .attr("transform", "translate(-4.5,-5)")//.attr("transform", "translate("+4.5+"," +0 + ")")
        .call(drag);

    color_handleR1 = context.append("rect")
        .attr("class", "R handle")
        .style("fill",label_color)
        .style("opacity",0.75)
        .style("width","9px")
        .style("height","25px")
        .attr("transform", "translate(-4.5,-5)")//.attr("transform", "translate("+4.5+"," +0 + ")")
        .call(drag);

    color_brush1.extent([0,ticks1]);

    body.append("svg")
        .attr("width",widthOfcontainer+20)
        .attr("height",17)
        .append("g")
        .append("text")
        .text("People per sq.km")
        .style("font-size","10px")
        .attr("fill",label_color)
        .attr("x",12)
        .attr("y",7);

    color_brushed1();
}

function color_brushed1(ext) {
    if(ext == undefined){
        ext = color_brush1.extent();
        ext[0] = Math.ceil(ext[0]);
        ext[1] = Math.ceil(ext[1]);
    }

    var L = Math.min(ext[0],ext[1]);
    var R = Math.max(ext[0],ext[1]);
    
    var left = color_x1(L);
    var right = color_x1(R);
    var width = right - left;

    color_handleL1.attr("x",left );
    color_handleR1.attr("x",right) ;

    selection_bar1.attr("x",left)
        .style("width",width+'px');

    range1 = [ticks1-L, ticks1-R];

    display_urbanization_layer("#pop_countries", cur_year, color_split1, colors1, country_pop, country_area, 1);
    // display_Density1(cur_year);
}

function drag_handler1(){
    var tmp = color_x1.invert(d3.mouse(this)[0]);

    var x_value = Math.ceil(tmp);

    if(x_value<0)x_value = 0;
    if(x_value>ticks1)x_value = ticks1;

    var ext = color_brush1.extent();
    if(d3.select(this).classed("L")){
        if(color_handleL1 != undefined){
            color_brush1.extent([x_value,ext[1]]);
            color_handleL1.style("fill", "#666666");
        }
    }else if(d3.select(this).classed("R")){
        if(color_handleR1 != undefined){
            color_brush1.extent([ext[0],x_value]);
            color_handleR1.style("fill", "#666666");
        }
    }else{
        alert("something wrong: "+ x_value);
    }

    color_brushed1();
}


function drag_start1(){
    if(d3.select(this).classed("L") && color_handleL1 != undefined){
        color_handleL1.style("fill", "#666666");
    }

    if(d3.select(this).classed("R") && color_handleR1 != undefined){
        color_handleR1.style("fill", "#666666");
    }
}

function drop_handler1(){
    if(color_handleL1 != undefined){
        color_handleL1.style("fill", "#cccccc");
    }

    if(color_handleR1 != undefined){
        color_handleR1.style("fill", "#cccccc");
    }
}

var color_handleL2, color_handleR2;
var color_brush2;
var selection_bar2;
var color_x2,color_y2;
var ticks2;

function draw_colorSlider_2(className){
    ticks2 = color_split2.length-1;

    var unit_height = 10;
    var data = [], obj = {};

    for(var i =ticks2;i>=0; i--){
        obj["color"] = colors2[i];
        obj["x"] = ticks2 -i;
        obj["label"] = color_split2[i];
        obj["height"] = unit_height;
        data.push(obj);
        obj = {};
    }


    var margin = {top: 7, right: 10, bottom: 0, left: 10}, //{top: 7, right: 10, bottom: 0, left: 10},
        width = widthOfcontainer - margin.left - margin.right,
        height = 15;//200 - margin.top - margin.bottom;



    color_x2 = d3.scale.linear().range([0, width]);
    color_y2 = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(color_x2).orient("bottom")
        .ticks(ticks2);

    var yAxis = d3.svg.axis().scale(color_y2).orient("left");

    color_brush2 = d3.svg.brush()
        .x(color_x2)
        .on("brush", color_brushed2);

    var area = d3.svg.area()
        .interpolate("monotone")
        .x(function(d) { return color_x2(d.x); })
        .y0(height)
        .y1(function(d) { return color_y2(d.height); });

    var body = d3.select("#co2_emissionHolder").selectAll("li").append("div")
        .attr("class","legend "+className);


    var svg = body.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom+20);


    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin.left + "," + (margin.top+10) + ")");


    color_x2.domain([0,ticks2]);
    color_y2.domain([0,unit_height]);

    var grad = svg.append("defs")
        .append("linearGradient")
        .attr("id", "grad2");


    var perc_interval = 100/ticks2;

    data.forEach(function(d,i){
        grad.append("stop").attr("offset", i*perc_interval+"%").attr("stop-color", d.color);
        grad.append("stop").attr("offset", (i+1)*perc_interval+"%").attr("stop-color", d.color);
    });


    context.append("path")
        .datum(data)
        .style("fill", "url(#grad2)")
        .attr("class", "area")
        .attr("d", area);

    context.append("g")
    //.attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .attr("fill","none")
        .call(xAxis);


    context.append("g")
        .attr("class", "x color_brush")
        .call(color_brush2);
    /*.selectAll("rect")
     .attr("y", -6)
     .attr("height", height + 7);*/


    var labels = body.append("svg").attr("id", "co2_label")
        .attr("width",widthOfcontainer+20)
        .attr("height",17)
        .append("g")
        .attr("transform","translate(10,0)");

    labels.selectAll("text").data(data)
        .enter()
        .append("text")
        .text(function(d){
            return d.label;
        }).attr("fill",label_color)
        .attr("x",function(d){
            if(d.label == 0)
                return color_x2(d.x) + 10;

            return color_x2(d.x)+6.5;
        }).attr("y",7).attr("font-size","9px");


    selection_bar2 = context.append("rect")//.attr("class","color_brush")
        .style("height",height+'px')
        .style("fill","gold")
        .style("opacity",".125");
    // .attr("transform", "translate("+0+"," +0 + ")");//t x="0" y="0" width="50" height="50" fill="green"

    context.append("g")
    // .attr("class", "y axis")
        .attr("fill","none")
        .call(yAxis);

    var drag = d3.behavior.drag()
        .on("dragstart", drag_start2)
        .on("drag", drag_handler2)
        .on("dragend", drop_handler2);

    color_handleL2 = context.append("rect")
    //.attr("points","00,00 05,10 10,00")
        .attr("class", "L handle")
        .style("fill",label_color)
        .style("opacity",0.75)
        .style("width","9px")
        .style("height","25px")
        .attr("transform", "translate(-4.5,-5)")//.attr("transform", "translate("+4.5+"," +0 + ")")
        .call(drag);

    color_handleR2 = context.append("rect")
        .attr("class", "R handle")
        .style("fill",label_color)
        .style("opacity",0.75)
        .style("width","9px")
        .style("height","25px")
        .attr("transform", "translate(-4.5,-5)")//.attr("transform", "translate("+4.5+"," +0 + ")")
        .call(drag);

    color_brush2.extent([0,ticks2]);

    body.append("svg")
        .attr("width",widthOfcontainer+20)
        .attr("height",17)
        .append("g")
        .append("text")
        .text("Tons per capita")
        .style("font-size","10px")
        .attr("fill",label_color)
        .attr("x",12)
        .attr("y",7);

    color_brushed2();
}

function color_brushed2(ext) {

    if(ext == undefined){
        ext = color_brush2.extent();
        ext[0] = Math.ceil(ext[0]);
        ext[1] = Math.ceil(ext[1]);
    }

    var L = Math.min(ext[0],ext[1]);
    var R = Math.max(ext[0],ext[1]);

    var left = color_x2(L);
    var right = color_x2(R);
    var width = right - left;

    color_handleL2.attr("x",left );
    color_handleR2.attr("x",right) ;

    selection_bar2.attr("x",left)
        .style("width",width+'px');

    range2 = [ticks2-L,ticks2-R];

    display_urbanization_layer("#co2_countries", cur_year, color_split2, colors2, country_co2_emission, country_pop, 1000);
}

function drag_handler2(){
    var tmp = color_x2.invert(d3.mouse(this)[0]);

    var x_value = Math.ceil(tmp);

    if(x_value<0)x_value = 0;
    if(x_value>ticks2)x_value = ticks2;

    var ext = color_brush2.extent();
    if(d3.select(this).classed("L")){
        color_brush2.extent([x_value,ext[1]]);

        if(color_handleL2 != undefined){
            color_handleL2.style("fill", "#666666");
        }
    }else if(d3.select(this).classed("R")){
        color_brush2.extent([ext[0],x_value]);

        if(color_handleR2 != undefined){
            color_handleR2.style("fill", "#666666");
        }
    }else{
        alert("something wrong: "+ x_value);
    }

    color_brushed2();
}

function drag_start2(){
    if(d3.select(this).classed("L") && color_handleL2 != undefined){
        color_handleL2.style("fill", "#666666");
    }

    if(d3.select(this).classed("R") && color_handleR2 != undefined){
        color_handleR2.style("fill", "#666666");
    }
}

function drop_handler2(){
    if(color_handleL2 != undefined){
        color_handleL2.style("fill", "#cccccc");
    }

    if(color_handleR2 != undefined){
        color_handleR2.style("fill", "#cccccc");
    }
}

var color_handleL3, color_handleR3;
var color_brush3;
var selection_bar3;
var color_x3,color_y3;
var ticks3;

function draw_colorSlider_3(className){
    ticks3 = color_split3.length-1;

    var unit_height = 10;
    var data = [], obj = {};

    for(var i =ticks3;i>=0; i--){
        obj["color"] = colors3[i];
        obj["x"] = ticks3 - i;
        obj["label"] = color_split3[i];
        obj["height"] = unit_height;
        data.push(obj);
        obj = {};
    }

    var margin = {top: 7, right: 10, bottom: 0, left: 10},
        width = widthOfcontainer - margin.left - margin.right,
        height = 15;//200 - margin.top - margin.bottom;

    color_x3 = d3.scale.linear().range([0, width]);
    color_y3 = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(color_x3).orient("bottom")
        .ticks(ticks3);
//.tickFormat(function(d) { return d.label; })
//.tickSize(15)
//.tickPadding(20);
    var yAxis = d3.svg.axis().scale(color_y3).orient("left");


    color_brush3 = d3.svg.brush()
        .x(color_x3)
        .on("brush", color_brushed3);

    var area = d3.svg.area()
        .interpolate("monotone")
        .x(function(d) { return color_x3(d.x); })
        .y0(height)
        .y1(function(d) { return color_y3(d.height); });

    var body = d3.select("#gdpHolder").selectAll("li").append("div")
        .attr("class","legend "+className);


    var svg = body.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom+20);

    /*svg.append("defs")
     .append("clipPath")
     .attr("id", "clip")
     .append("rect")
     .attr("width", width)
     .attr("height", height);*/


    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin.left + "," + (margin.top+10) + ")");

    color_x3.domain([0,ticks3]);
    color_y3.domain([0,unit_height]);

    var grad = svg.append("defs")
        .append("linearGradient")
        .attr("id", "grad3");

    var perc_interval = 100/ticks3;

    data.forEach(function(d,i){
        grad.append("stop").attr("offset", i*perc_interval+"%").attr("stop-color", d.color);
        grad.append("stop").attr("offset", (i+1)*perc_interval+"%").attr("stop-color", d.color);
    });

    context.append("path")
        .datum(data)
        .style("fill", "url(#grad3)")
        .attr("class", "area")
        .attr("d", area);

    context.append("g")
    //.attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .attr("fill","none")
        .call(xAxis);

    context.append("g")
        .attr("class", "x color_brush")
        .call(color_brush3);
    /*.selectAll("rect")
     .attr("y", -6)
     .attr("height", height + 7);*/

    var labels = body.append("svg").attr("id", "gdp_label")
        .attr("width",widthOfcontainer+20)
        .attr("height",17)
        .append("g")
        .attr("transform","translate(10,0)");

    labels.selectAll("text").data(data)
        .enter()
        .append("text")
        .text(function(d){
            if(d.label > 1000)
                return d.label/1000+"k";

            return d.label;
        }).attr("fill",label_color)
        .attr("x",function(d){
            if(d.label == 0)
                return color_x3(d.x) + 10;

            return color_x3(d.x);
        }).attr("y",7).attr("font-size","9px");

    selection_bar3 = context.append("rect")//.attr("class","color_brush")
        .style("height",height+'px')
        .style("fill","gold")
        .style("opacity",".125");
    // .attr("transform", "translate("+0+"," +0 + ")");//t x="0" y="0" width="50" height="50" fill="green"

    context.append("g")
    // .attr("class", "y axis")
        .attr("fill","none")
        .call(yAxis);

    var drag = d3.behavior.drag()
        .on("dragstart", drag_start3)
        .on("drag", drag_handler3)
        .on("dragend", drop_handler3);

    color_handleL3 = context.append("rect")
    //.attr("points","00,00 05,10 10,00")
        .attr("class", "L handle")
        .style("fill",label_color)
        .style("opacity",0.75)
        .style("width","9px")
        .style("height","25px")
        .attr("transform", "translate(-4.5,-5)")//.attr("transform", "translate("+4.5+"," +0 + ")")
        .call(drag);

    color_handleR3 = context.append("rect")
        .attr("class", "R handle")
        .style("fill",label_color)
        .style("opacity",0.75)
        .style("width","9px")
        .style("height","25px")
        .attr("transform", "translate(-4.5,-5)")//.attr("transform", "translate("+4.5+"," +0 + ")")
        .call(drag);

    color_brush3.extent([0,ticks3]);

    body.append("svg")
        .attr("width",widthOfcontainer+20)
        .attr("height",20)
        .append("g")
        .append("text")
        .text("US$ per capita")
        .style("font-size","10px")
        .attr("fill",label_color)
        .attr("x",12)
        .attr("y",7);

    color_brushed3();
}

function color_brushed3(ext) {
    if(ext == undefined){
        ext = color_brush3.extent();
        ext[0] = Math.ceil(ext[0]);
        ext[1] = Math.ceil(ext[1]);
    }

    var L = Math.min(ext[0],ext[1]);
    var R = Math.max(ext[0],ext[1]);

    var left = color_x3(L);
    var right = color_x3(R);
    var width = right - left;

    color_handleL3.attr("x",left );
    color_handleR3.attr("x",right) ;

    selection_bar3.attr("x",left)
        .style("width",width+'px');

    range3 = [ticks3-L,ticks3-R];

    display_urbanization_layer("#gdp_countries", cur_year, color_split3, colors3, country_gdp, country_pop, 1);
}

function drag_handler3(){
    var tmp = color_x3.invert(d3.mouse(this)[0]);

    var x_value = Math.ceil(tmp);

    if(x_value<0)x_value = 0;
    if(x_value>ticks3)x_value = ticks3;

    var ext = color_brush3.extent();
    if(d3.select(this).classed("L")){
        color_brush3.extent([x_value,ext[1]]);

        if(color_handleL3 != undefined){
            color_handleL3.style("fill", "#666666");
        }
    }else if(d3.select(this).classed("R")){
        color_brush3.extent([ext[0],x_value]);

        if(color_handleR3 != undefined){
            color_handleR3.style("fill", "#666666");
        }
    }else{
        alert("something wrong: "+ x_value);
    }

    color_brushed3();
}


function drag_start3(){
    if(d3.select(this).classed("L") && color_handleL3 != undefined){
        color_handleL3.style("fill", "#666666");
    }

    if(d3.select(this).classed("R") && color_handleR3 != undefined){
        color_handleR3.style("fill", "#666666");
    }
}

function drop_handler3(){
    if(color_handleL3 != undefined){
        color_handleL3.style("fill", "#cccccc");
    }

    if(color_handleR3 != undefined){
        color_handleR3.style("fill", "#cccccc");
    }
}

