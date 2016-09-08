/**
 * Created by yuhao on 18/5/16.
 */

var color_split1, color_split2, color_split3;
var colors1 = ["#0F1F8A", "#19215C", "#08306B", "#08519C", "#2171B5", "#4292C6", "#6BAED6", "#9ECAE1", "#C6DBEF"];
var colors2 = ["#6B0707", "#940707", "#AE0B0B", "#D91313", "#FB3D3D", "#F95454", "#F37777", "#F4B5B5", "#F2D7D7"];
var colors3 = ["#2EB043", "#69A155", "#57ED00", "#63F714", "#94FF63", "#A8FF87", "#C4FFAB", "#DAFAD9"];//["#69FF1C","#5DE117","#57ED00","#63F714", "#94FF63","#A8FF87", "#C4FFAB"];//A8FF87

var status = 0; //play(1) or stop(0 ) for the time_slider
var range1;
var range2;
var range3;
var chart_tooltip_id_counting = 0;

/*load_countrySize_and_property */
function load_DData(_category) {
    switch (_category) {
        case "pop_layer":                   //if(SC.layer_count>0)adjust_opacity(_category);
            color_split1 = [1500, 500, 400, 300, 200, 100, 50, 10, 0];//max_property=1000;
            draw_pop_country();

            display_urbanization_layer("#pop_countries", cur_year, color_split1, colors1, country_pop, country_area, 1);
            // display_Density1(1964); //read_popData();
            draw_colorSlider_1('pop_layer');
            break;

        case "co2_layer":                       //if(SC.layer_count>0)adjust_opacity(_category);
            color_split2 = [100, 50, 20, 10, 5, 1, 0.1, 0];//max_property=100;
            draw_co2_country();

            display_urbanization_layer("#co2_countries", cur_year, color_split2, colors2, country_co2_emission, country_pop, 1000);
            // display_Density2(1964);//read_co2Data();
            draw_colorSlider_2('co2_layer');
            break;
        case "gdp_layer":          //if(SC.layer_count>0)adjust_opacity(_category);
            color_split3 = [100000, 75000, 50000, 10000, 5000, 1000, 500, 0];
            draw_gdp_country();

            display_urbanization_layer("#gdp_countries", cur_year, color_split3, colors3, country_gdp, country_pop, 1);
            // display_Density3(1964);//read_co2Data();
            draw_colorSlider_3('gdp_layer');
            break;

        case "project_layer":        //remove_layer();
            draw_project_legend('project_layer');
            draw_projectLayer();
            break;

        case "network_layer":
            draw_project_legend('network_layer');
            draw_networkLayer();
            break;

        case "staff_layer":
            draw_project_legend('staff_layer');
            draw_staffLayer();
            break;

        default:
            break;
    }
}

function display_urbanization_layer(country_layer, cur_year, color_splits, colors, urbanization_data_1, urbanization_data_2, multiplier) {
    var range;
    switch (country_layer) {
        case "#co2_countries":
            if (range2 == undefined) {
                range2 = [];
                range2[0] = 0;
                range2[1] = color_split2.length;
            }

            range = range2;
            break;

        case "#gdp_countries":
            if (range3 == undefined) {
                range3 = [];
                range3[0] = 0;
                range3[1] = color_split3.length;
            }
            range = range3;
            break;

        case "#pop_countries":
        default:
            if (range1 == undefined) {
                range1 = [];
                range1[0] = 0;
                range1[1] = color_split1.length;
            }
            range = range1;
            break;
    }
    var min = range[0];
    var max = range[1];

    var countries = g.select(country_layer).selectAll(".country").data(this.world_topo);

    countries
        .attr("z-index", 4).attr("fill", function (d, i) {
        var name = d.properties.name;

        var country_info_1 = find_country_info(urbanization_data_1, name);
        var country_info_2 = find_country_info(urbanization_data_2, name);

        if (country_info_1 != undefined && country_info_2 != undefined && country_info_1[0] != undefined && country_info_2[0] != undefined) {
            if (country_info_1.length > 0 && country_info_2.length > 0) {
                var year_property = country_info_1[0][cur_year];
                var c_size = country_info_2[0][cur_year];

                if (c_size.length > 0 && year_property.length > 0) {
                    var density = year_property / c_size * multiplier;

                    if (density >= color_splits[min] && density < color_splits[max]) {
                        for (var index = 0; index < color_splits.length; index++) {
                            if (density >= color_splits[index]) {
                                return colors[index];
                            }
                        }

                        return colors[1];
                    }
                }
            }
        }

        return worldmap_background;
    });

    countries.on("click", function (d, i) {
        if (chart_refresh) {
            draw_charts(d.properties.name);
        }
    });
}

function find_country_info(all_country_info, country_name) {
    var m = all_country_info.filter(function (f) {
        return f.Country_Name == country_name;
    });

    return m;
}

function remove_layer(className) {
    if (className == undefined) className = ".extra_info";
    var extra_info = d3.selectAll(className);
    extra_info.remove();
}

/*convert the csv objects into a plottable array,
 year as x axis, property as y axis*/
function convertToxy(country_name, layer) {
    var data;
    var factor = 1;
    switch (layer) {
        case 'pop_layer':
            data = pop_density;
            factor = 1;
            break;
        case 'co2_layer':
            data = co2_density;
            break;
        case 'gdp_layer':
            data = gdp_density;
            break;
        default:
            data = pop_density;
            break;
    }

    var property = data.filter(function (f) {
        return f.Country_Name == country_name;
    });

    var start_year = 1960;
    var end_year = 2016;
    var xyObjArr = [];
    var Obj = {};

    if (property != undefined && property.length > 0) {
        for (var i = start_year; i <= end_year; i++) {
            var value = property[0][i];
            if (value != undefined && value.length > 0) {
                Obj["year"] = i;
                Obj["value"] = Number(value) / factor;
                xyObjArr.push(Obj);
                Obj = {};
            }
        }
    }

    return xyObjArr;
}

function transform2(d) {
    return "translate(" + d[0] + "," + d[1] + ")";
}

/*draw the point charts for each country, onclick*/
function draw_charts(country_name) {
    var popMultiplier = 1;
    var co2Multiplier = 1000;
    var gdpMultiplier = 1;

    color_layer_count = 0;

    var format = d3.format(',.02f');

    //this layer is pop_layer
    var tooltip_content = "<b style='font-size:20px'>" + country_name + "</b><br>";

    var pop_properties = find_country_info(country_pop, country_name);
    var area_properties = find_country_info(country_area, country_name);
    var valid_popDensity = true;
    var year_pop;

    if (pop_properties != undefined && pop_properties.length > 0 && pop_properties[0][cur_year].length > 0) {
        year_pop = pop_properties[0][cur_year];
        tooltip_content += "<br><div><b>" + "Population in Total: </b>"
            + format(year_pop / 1000000) + " M people";
    } else {
        valid_popDensity = false;
        tooltip_content += "<br><div><b>Population in Total: </b>undefined";
    }

    if (area_properties[0] != undefined && area_properties[0][cur_year].length > 0) {
        var year_area = area_properties[0][cur_year];

        tooltip_content += "<br><b>Area: </b>" + year_area + " (sq.km)<hr>";
    } else {
        valid_popDensity = false;
        tooltip_content += "<br><b>Area: </b>undefined<hr>";
    }

    if (pop_layer) {
        color_layer_count++;
        xy_pop_data = convertToxy(country_name, 'pop_layer');

        if (valid_popDensity) {
            var density = year_pop / year_area * popMultiplier;
            tooltip_content += "<br><b>Population Density: </b>"
                + format(density) + " people per (sq.km)</div><hr>";
        } else {
            tooltip_content += "<br><b>Population Density: </b>undefined<hr>";
        }
    }

    //check whether the other two layers are selected
    if (co2_layer) {
        color_layer_count++;

        var co2_properties = find_country_info(country_co2_emission, country_name);
        xy_co2_data = convertToxy(country_name, 'co2_layer');
        if (co2_properties != undefined && co2_properties.length > 0 && co2_properties[0][cur_year].length > 0 && year_pop != undefined) {
            var year_co2 = co2_properties[0][cur_year];

            density = year_co2 / year_pop * co2Multiplier;

            tooltip_content += "<br><div><b>CO2 Emission Density: </b>"
                + format(density) + " tons per person</div><hr>";

        } else {
            tooltip_content += "<br><b>CO2 Density: </b>undefined<hr>";
        }
    }

    if (gdp_layer) {
        color_layer_count++;

        var gdp_properties = find_country_info(country_gdp, country_name);

        xy_gdp_data = convertToxy(country_name, 'gdp_layer');
        if (gdp_properties != undefined && gdp_properties.length > 0 && gdp_properties[0][cur_year].length > 0 && year_pop != undefined) {
            var year_gdp = gdp_properties[0][cur_year];

            density = year_gdp / year_pop * gdpMultiplier;

            tooltip_content += "<br><div><b>GDP per capita: </b>"
                + format(density) + " US$ per person</div><hr>";

        } else {
            tooltip_content += "<br><b>GDP Density: </b>undefined<hr>";
        }
    }


    var drag = d3.behavior.drag()
        .on("dragstart", function () {
            d3.select(this).style("background-color", "#eeeeee");
        })
        .on("drag", function (d) {
            var offsets = this.getBoundingClientRect();

            var new_x = offsets.left + d3.event.dx;
            var new_y = offsets.top + d3.event.dy;

            d3.select(this).style("left", new_x + "px");
            d3.select(this).style("top", new_y + "px");
        })
        .on("dragend", function () {
            mydragg.stopMoving("content_holder");
            d3.select(this).style("background-color", "#ffffff");
        });

    var chart_tooltip_dynamic_id = "chart_tooltip_" + country_name;

    var lnglat = lnglat_pos(d3.event.pageX, d3.event.pageY);

    var find_tooltip = document.getElementById(chart_tooltip_dynamic_id);
    if (find_tooltip != null) {
        // reposition the tooltip if it already exists
        d3.select(find_tooltip)
            .attr("data-lng", lnglat[0])
            .attr("data-lat", lnglat[1])
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY + "px");
        return;
    }

    var country_chart_tooltip_dynamic = d3.select("#map_container").append("div").attr("class", "tooltip")
        .attr("id", chart_tooltip_dynamic_id)
        .attr("style", "visibility:hidden;display:inline;background-color:white;overflow:hidden;")
        .attr("z-index", 2)
        .attr("data-lng", lnglat[0])
        .attr("data-lat", lnglat[1])
        .call(drag);

    chart_tooltip_id_counting = chart_tooltip_id_counting + 1;

    country_chart_tooltip_dynamic.append("span")
        .attr("class", "close")
        .on("click", function () {
            //close
            country_chart_tooltip_dynamic.remove();
        });

    country_chart_tooltip_dynamic
        .style("visibility", "visible")
        .selectAll("svg").remove();
    country_chart_tooltip_dynamic
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px");

    var mobileScreen = (window.innerWidth < 500);

    // Set the dimensions of the canvas / graph
    var margin = {top: 40, right: 13, bottom: 30, left: 40},
        width = 300 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;//270,top:10

    var total_height = height + margin.top + margin.bottom;
    // Set the ranges
    var x = d3.scale.linear().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var formatAxis = d3.format("  0");

    var xAxis = d3.svg.axis().scale(x)
        .tickFormat(formatAxis)
        .orient("bottom").ticks(5);

    var x_ext = [1960, 2015];

    var yAxis = d3.svg.axis().scale(y)
        .orient("left")
        .tickFormat(formatAxis)
        .ticks(5);

    // Define the line
    var valueline = d3.svg.line()
        .x(function (v) {
            return x(v.year);
        })
        .y(function (v) {
            return y(v.value);
        });

    var total_width = width + margin.left + margin.right;
    var count = 0;
//////////////////////////needs for each chart

    var title_height = 40;
    // Adds the country_name as title
    // var svgTxt = country_chart_tooltip
    var svgTxt = country_chart_tooltip_dynamic
        .append("svg")
        .attr("class", "country_name")
        .style("display", "block")
        .attr("width", total_width)
        .attr("height", title_height)
        .append("g");

    svgTxt.append("g").append("text")
        .style("text-anchor", "middle")//text-anchor="middle" alignment-baseline="middle"
        .style("alignment-baseline", "text-before-edge")
        .style("fill", "black")
        .style("font-size", (mobileScreen ? 17 : 21) + "px")
        .attr("transform", "translate(" + 150 + "," + 0 + ")")
        .style("text-decoration", "underline")
        .text(country_name);

    if (pop_layer) {

        // Adds the svg canvas
        // var svg = country_chart_tooltip
        var svg = country_chart_tooltip_dynamic
            .append("svg")
            .attr("class", "point-chart")
            .style("display", "block")
            .attr("width", total_width)
            .attr("height", total_height)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Scale the range of the data
        //var x_ext = d3.extent(xy_pop_data, function (v) {return v.year; });

        var min_y = d3.min(xy_pop_data, function (v) {
            return v.value;
        });
        var max_y = d3.max(xy_pop_data, function (v) {
            return v.value;
        });

        x.domain(x_ext);
        y.domain([min_y, max_y]);

        // Add the valueline path.
        svg.append("path")
            .attr("class", "line-path")
            .style("stroke", "#000000")//stroke: steelblue;
            .attr("d", valueline(xy_pop_data));


        svg.append("g")
            .append("text")
            //.attr("class", "x title")
            .attr("text-anchor", "end")
            .style("font-size", (mobileScreen ? 8 : 12) + "px")
            .attr("transform", "translate(" + width + "," + (height - 10 ) + ")")
            .text("Year");

        svg.append("g")
            .append("text")
            //.attr("class", "x title")
            .attr("text-anchor", "end")
            .style("font-size", (mobileScreen ? 8 : 12) + "px")
            .attr("transform", "translate(" + 100 + "," + 0 + ")")
            .text("People per sq.km");

        svg.append("g").append("text")
        //  .attr("text-anchor", "end")
            .style("fill", "black")
            .style("font-size", (mobileScreen ? 10 : 14) + "px")
            .attr("transform",
                "translate(" + (total_width / 2 - 90) + "," + -30 + ")")
            .text("Population Density");


        // Add the scatterplot
        svg.selectAll("dot")
            .data(xy_pop_data)
            .enter().append("circle")
            .attr("class", "value-point")
            .attr("r", 3)
            .attr("cx", function (v) {
                var x_value = x(v.year);
                return x_value;
            })
            .attr("cy", function (v) {
                var y_ = y(v.value);
                return y_;
            }).style("fill", function (v) {
            var density = v.value;
            var max = 0;
            var min = color_split1.length;

            if (density >= color_split1[min - 1] && density < color_split1[max]) {
                for (var index = 0; index < min; index++) {

                    if (density >= color_split1[index]) {
                        return colors1[index];
                    }
                }

                return colors1[1];
            }
        });

        // Add the X Axis
        svg.append("g")
            .attr("class", "line-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the Y Axis
        svg.append("g")
            .attr("class", "line-axis")
            .call(yAxis);

        count++;
    }

    if (co2_layer) {
        // Adds the svg canvas
        // var svg2 = country_chart_tooltip
        var svg2 = country_chart_tooltip_dynamic
            .append("svg")
            .style("display", "block")
            .attr("class", "point-chart")
            .attr("width", total_width)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Scale the range of the data
        var min_y2 = d3.min(xy_co2_data, function (v) {
            return v.value;
        });
        var max_y2 = d3.max(xy_co2_data, function (v) {
            return v.value;
        });

        x.domain(x_ext);
        y.domain([min_y2, max_y2]);

        // Add the valueline path.
        svg2.append("path")
            .attr("class", "line-path")
            .style("stroke", "#000000")//#A10B1C
            .attr("d", valueline(xy_co2_data));

        svg2.append("g")
            .append("text")
            //.attr("class", "x title")
            .attr("text-anchor", "end")
            .style("font-size", (mobileScreen ? 8 : 12) + "px")
            .attr("transform", "translate(" + width + "," + (height - 10 ) + ")")
            .text("Year");

        svg2.append("g")
            .append("text")
            //.attr("class", "x title")
            .attr("text-anchor", "end")
            .style("font-size", (mobileScreen ? 8 : 12) + "px")
            .attr("transform", "translate(" + (45 + margin.left) + "," + 0 + ")")
            .text("Tons per capita");

        svg2.append("g").append("text")
        //  .attr("text-anchor", "end")
            .style("fill", "black")
            .style("font-size", (mobileScreen ? 10 : 14) + "px")
            .attr("transform",
                "translate(" + (total_width / 2 - 110) + "," + -20 + ")")
            .text("CO2 Emission Per Capita");


        // Add the scatterplot
        svg2.selectAll("dot")
            .data(xy_co2_data)
            .enter().append("circle")
            .attr("class", "value-point")
            .attr("r", 3)
            .attr("cx", function (v) {
                return x(v.year);
            })
            .attr("cy", function (v) {
                return y(v.value);
            })
            .style("fill", function (v) {
                var density = v.value;
                var max = 0;
                var min = color_split2.length;

                if (density >= color_split2[min - 1] && density < color_split2[max]) {


                    for (var index = 0; index < min; index++) {
                        if (density >= color_split2[index]) {
                            return colors2[index];
                        }
                    }

                    return colors2[1];
                }
            });

        // Add the X Axis
        svg2.append("g")
            .attr("class", "line-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the Y Axis
        svg2.append("g")
            .attr("class", "line-axis")
            .call(yAxis);

        count++;
    }

    if (gdp_layer) {
        // Adds the svg canvas
        // var svg3 = country_chart_tooltip
        var svg3 = country_chart_tooltip_dynamic
            .append("svg")
            .style("display", "block")
            .attr("class", "point-chart")
            .attr("width", total_width)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Scale the range of the data
        var min_y3 = d3.min(xy_gdp_data, function (v) {
            return v.value;
        });
        var max_y3 = d3.max(xy_gdp_data, function (v) {
            return v.value;
        });

        x.domain(x_ext);
        y.domain([min_y3, max_y3]);

        // Add the valueline path.
        svg3.append("path")
            .attr("class", "line-path")
            .style("stroke", "#000000")//0DD014
            .attr("d", valueline(xy_gdp_data));

        svg3.append("g")
            .append("text")
            //.attr("class", "x title")
            .attr("text-anchor", "end")
            .style("font-size", (mobileScreen ? 8 : 12) + "px")
            .attr("transform", "translate(" + width + "," + (height - 10 ) + ")")
            .text("Year");

        svg3.append("g")
            .append("text")
            //.attr("class", "x title")
            .attr("text-anchor", "end")
            .style("font-size", (mobileScreen ? 8 : 12) + "px")
            .attr("transform", "translate(" + 85 + "," + 0 + ")")
            .text("US$ per capita");

        svg3.append("g").append("text")
        //  .attr("text-anchor", "end")
            .style("fill", "black")
            .style("font-size", (mobileScreen ? 10 : 14) + "px")
            .attr("transform",
                "translate(" + (total_width / 2 - 80) + "," + -20 + ")")
            .text("GDP Per Capita");


        // Add the scatterplot
        svg3.selectAll("dot")
            .data(xy_gdp_data)
            .enter().append("circle")
            .attr("class", "value-point")
            .attr("r", 3)
            .attr("cx", function (v) {
                return x(v.year);
            })
            .attr("cy", function (v) {
                return y(v.value)
            })
            .style("fill", function (v) {
                var density = v.value;
                var max = 0;
                var min = color_split3.length;
                if (density >= color_split3[min - 1] && density < color_split3[max]) {
                    for (var index = 0; index < min; index++) {
                        if (density >= color_split3[index]) {
                            return colors3[index];
                        }
                    }

                    return colors3[1];
                }
            });

        // Add the X Axis
        svg3.append("g")
            .attr("class", "line-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the Y Axis
        svg3.append("g")
            .attr("class", "line-axis")
            .call(yAxis);

        count++;
    }

    // country_chart_tooltip
    country_chart_tooltip_dynamic
        .style("width", total_width)
        .style("height", (title_height + total_height * count));

    return [total_width, total_height * count];
}


function draw_project_legend(className) {
    // d3.selectAll(".legend").remove();
    var color;
    switch (className) {
        case 'project_layer':
            color = 'yellow';
            break;
        case 'network_layer':
            color = 'blue';
            break;
        case 'staff_layer':
            color = 'pink';
            break;
        default:
            break;
    }

    var body = d3.select("#content_holder");

    var project_legend = body.append("div")
        .attr('class', 'legend project_legend ' + className);

    var wFactor = 10,
        hFactor = 2;

    var wBox = 1280 / wFactor,//map_width / wFactor,
        hBox = 702 / hFactor;//map_height / hFactor;

    var svg = project_legend
        .append("svg")
        .attr("width", wBox)
        .attr("height", hBox)
        .append("g")
        .attr("transform", "translate(10,100)");

    var legend = svg
        .append('g')
        .attr('width', wBox)
        .attr('height', hBox);

    var wRect = wBox / (wFactor * 0.75);
    var offsetText = wRect / 2;
    var tr = 'translate(' + offsetText + ',' + offsetText * 3 + ')';
    var sg = legend.append('g')
        .attr('transform', tr);

    var area = [5, 10, 20];

    sg.selectAll('circle').data(area).enter().append('circle')
        .attr('cx', -20)//wBox/2)
        .style("stroke", "#000")
        .style("stroke-width", "0.5px")
        .attr('cy', function (d, i) {
            switch (i) {
                case 0:
                    return 4;
                case 1:
                    return 60;
                case 2:
                    return 130;
            }
        }).attr('fill', 'none'//function (d, i) {return '#C0C0C0';}
    ).attr('r', function (d, i) {
        //var s = zoom.scale();
        return Math.sqrt(d * area_unit / (Math.PI));
    }).attr("opacity", 0.5);

    sg.selectAll('text').data(area).enter().append("text")
        .attr("dx", function (d) {

            return -18;
        })
        .attr("dy", function (d, i) {
            //var res;
            switch (i) {
                case 0:
                    return 10;
                case 1:
                    return 65;
                case 2:
                    return 135;
            }
        })
        // return (hBox/6 *i+d+4);})
        .text(function (d) {
            return d
        });
}


