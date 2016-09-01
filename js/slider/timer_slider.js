/**
 * Created by Crazy Frog on 11/7/2015.
 */


var start_year, end_year, cur_year;
var handle, brush, x,slider;
var overlay,label,box;

function setup_slider(start_y, end_y){

    /*d3.select("#menu_bar").append("div")
        .attr("class","menu-item ")
        .attr("height",140)
        .attr("id","label_slider");*/
    d3.select("#label_slider").selectAll("svg").remove();
    start_year = start_y;
        end_year = end_y;

    cur_year = start_year;

    //d3.select("#time_slider").style("background-color", d3.hsl(214, .41, .78));



    var slider_margin = {top: 0, right: 7, bottom: 0, left: 9},
        slider_width = 180,//document.getElementById("map_container").offsetWidth *0.70 - slider_margin.right - slider_margin.left,
        slider_height =30;


    var year_range = d3.scale.linear().domain([start_year, end_year]);
    x = year_range
        .range([0, slider_width])
        .clamp(true);

    brush = d3.svg.brush()
        .x(x)
        //.extent([cur_year, cur_year])
        .extent([start_year, start_year])
        .on("brush", brushed);

    var body = d3.select("#label_slider"); //d3.select("#content_holder");

    
    /*Add the year label; the value is set on transition.*/
    var label_svg = body//d3.select("#year_label")
        .attr("z-index", 3)
        .append("svg")
        .attr("width",200)
        .attr("height",90)
        .append("g");

    label = label_svg.append("text")
        .attr("class", "year label")
        .attr("text-anchor", "end")
        .attr("font-weight","bold")
        .attr("y", 80)
        .attr("x", 100)
        .text(start_year);

    // Add an overlay for the year label.
    box = label.node().getBBox();


    overlay = label_svg.append("rect")
        .attr("class", "overlay")
        .attr("x", box.x)
        .attr("y", box.y)
        .attr("width", box.width)
        .attr("height", box.height)
        .on("mouseover",
            enableInteraction);


    /*implement the slider*/
    var time_slider = body.append("div")
        .attr('id','time_slider');


    var slider_svg = time_slider//d3.selectAll(".time_slider")
        .attr("z-index", 3)
        .append("svg")
        .attr("width", slider_width + slider_margin.left + slider_margin.right)
        .attr("height", slider_height  +slider_margin.top+slider_margin.bottom)
        .append("g");

    var year_interval = 10;

    slider_svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+slider_margin.left+"," + slider_height / 3 + ")")
        .attr("fill",label_color)
        .call(d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks((end_year - start_year) /year_interval)
            .tickFormat(function(d) { return d; })
            .tickSize(0)
            .tickPadding(12))
        .select(".domain")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "halo");

    slider = slider_svg.append("g")
        .attr("class", "slider")
        .call(brush);

    slider.selectAll(".extent,.resize")
        .remove();

    slider.select(".background")
        .attr("height", slider_height);

    handle = slider.append("rect")
        .attr("class", "handle")
        .style("width","7px")
        .style("height","15px")
        .style("fill",label_color)
        .attr("transform", "translate("+3.5+"," + 3 + ")");


}


function enableInteraction() {

    var yearScale = d3.scale.linear()
        .domain([start_year, end_year])
        .range([box.x + 10, box.x + box.width - 10])
        .clamp(true);


    // Cancel the current transition, if any.
   slider.transition().duration(0);
    status=0;

    overlay
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
        .on("touchmove", mousemove);

    function mouseover() {
        label.classed("active", true);
    }

    function mouseout() {
        label.classed("active", false);
    }

    function mousemove() {
        if(status ==1){
            status =0;
            stop_animateTime();

        }
        label.classed("active", true);
        cur_year = yearScale.invert(d3.mouse(this)[0]);
        brushed();
    }
}


function stop_animateTime(){

    brushed();
}

function update(value){
    cur_year = Math.round(value);
    if(pop_layer)display_Density1(cur_year);
    if(co2_layer)display_Density2(cur_year);
    if(gdp_layer)display_Density3(cur_year);
    label.text(cur_year);
}

function brushed() {

    var value = brush.extent()[0];

        if (d3.event!=undefined && d3.event.sourceEvent) { // not a programmatic event
            value = x.invert(d3.mouse(this)[0]);
            brush.extent([value, value]);
            console.log("event");
        }else{
            if(status == 0){
                value = cur_year;
                brush.extent([cur_year, cur_year]);

            }
        }
    
    handle.attr("x", x(value));

    update(value);
}

/*function animate_time() {

 slider
 .call(brush.event)
 .transition() // gratuitous intro!
 .duration(500* (end_year - start_year))
 .call(brush.extent([end_year, end_year]))
 //.call(brush.extent([end_year, end_year]))
 .call(brush.event)
 .each("end", function(){
 status =0;

 });
 }*/

