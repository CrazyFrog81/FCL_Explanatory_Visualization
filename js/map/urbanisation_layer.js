/**
 * Created by yuhao on 18/5/16.
 */

var color_split1, color_split2, color_split3;
var colors1 = ["#0F1F8A", "#19215C", "#08306B", "#08519C", "#2171B5", "#4292C6", "#6BAED6", "#9ECAE1", "#C6DBEF"];
var colors2 = ["#6B0707", "#940707", "#AE0B0B", "#D91313", "#FB3D3D", "#F95454", "#F37777", "#F4B5B5", "#F2D7D7"];
var colors3 = ["#2EB043", "#69A155", "#57ED00", "#63F714", "#94FF63", "#A8FF87", "#C4FFAB", "#DAFAD9"];//["#69FF1C","#5DE117","#57ED00","#63F714", "#94FF63","#A8FF87", "#C4FFAB"];//A8FF87

var status = 0;
var range1;
var range2;
var range3;

function displayUrbanizationData(_category) {
    switch (_category) {
        case "pop_layer":
            color_split1 = [1500, 500, 400, 300, 200, 100, 50, 10, 0];
            init_urbanization_layer("pop_countries", "pop_layer");

            display_urbanization_layer("#pop_countries", cur_year, color_split1, colors1, country_pop, country_area, 1);
            draw_colorSlider_1('pop_layer');
            break;

        case "co2_layer":
            color_split2 = [100, 50, 20, 10, 5, 1, 0.1, 0];
            init_urbanization_layer("co2_countries", "co2_layer");

            display_urbanization_layer("#co2_countries", cur_year, color_split2, colors2, country_co2_emission, country_pop, 1000);
            draw_colorSlider_2('co2_layer');
            break;

        case "gdp_layer":
            color_split3 = [100000, 75000, 50000, 10000, 5000, 1000, 500, 0];
            init_urbanization_layer("gdp_countries", "gdp_layer");

            display_urbanization_layer("#gdp_countries", cur_year, color_split3, colors3, country_gdp, country_pop, 1);
            draw_colorSlider_3('gdp_layer');
            break;

        case "project_layer":
            draw_project_legend('project_layer');
            SC.project_clusters = generate_clusters('project_layer', 'yellow', SC.projects);
            break;

        case "network_layer":
            draw_project_legend('network_layer');
            SC.network_clusters = generate_clusters('network_layer', 'blue', SC.network);
            break;

        case "staff_layer":
            draw_project_legend('staff_layer');
            SC.staff_clusters = generate_clusters('staff_layer', 'pink', SC.staff);
            break;

        default:
            break;
    }
}


/*to use for initializing the population density display at the first open of the map */
function init_pop_layer() {
    document.getElementById("pop_densityBtn").classList.toggle("selectedBtn");
    pop_layer = true;
    d3.select("#pop_densityHolder").selectAll("ul").style("height", "73px");
    console.log("progress: init_pop_layer!");
    SC.layer_count++;
    // SC.layer_stack[0] = SC.layer_count;
    displayUrbanizationData("pop_layer");
}

function init_urbanization_layer(layer_id, layer_class) {
    var country = g.append("g").attr("id", layer_id)
        .attr("class", layer_class).selectAll(".country").data(this.world_topo);

    country.enter().insert("path").attr("class", "country")
        .attr("z-index", 4)
        .attr("d", path)
        .attr("fill", worldmap_background)
        .style("opacity", function () {
            var res = 0.8 - 0.2 * SC.layer_count;
            return res;
        });
}

function display_urbanization_layer(country_layer, cur_year, color_splits, colors, urbanization_data_1, urbanization_data_2, multiplier) {
    var range;
    switch (country_layer) {
        case "#co2_countries":
            if (range2 == undefined) {
                range2 = [];
                range2[0] = 0;
                range2[1] = color_split2.length;

                if(cur_year >= 2013)
                    cur_year = 2013;
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

                if(year_property == undefined)
                    return "#FFFFFF";

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
        var lnglat = lnglat_pos(d3.event.pageX, d3.event.pageY);

        draw_charts(d.properties.name, lnglat[0], lnglat[1]);

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

function redraw_charts() {
    var tooltips = d3.selectAll(".tooltip").forEach(function (tips) {
        tips.forEach(function (tip) {
            if (tip.id == undefined || tip.id == "")
                return;

            var country_name = tip.dataset.country;
            var lng = tip.dataset.lng;
            var lat = tip.dataset.lat;
            d3.select(tip).remove();

            draw_charts(country_name, lng, lat);
        })
    });
}

/*draw the point charts for each country, onclick*/
function draw_charts(country_name, lng, lat) {
    if (!pop_layer && !co2_layer && !gdp_layer)
        return;

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
    var view_pos = viewport_pos(lng, lat);

    var find_tooltip = document.getElementById(chart_tooltip_dynamic_id);
    if (find_tooltip != null) {
        // reposition the tooltip if it already exists
        d3.select(find_tooltip)
            .attr("data-lng", lng)
            .attr("data-lat", lat)
            .style("left", view_pos[0] + "px")
            .style("top", view_pos[1] + "px");
        return;
    }

    var country_chart_tooltip_dynamic = d3.select("#map_container").append("div").attr("class", "tooltip")
        .attr("id", chart_tooltip_dynamic_id)
        .attr("style", "visibility:hidden;display:inline;background-color:white;overflow:hidden;")
        .attr("z-index", 2)
        .attr("data-lng", lng)
        .attr("data-lat", lat)
        .attr("data-country", country_name)
        .call(drag);

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
        .style("left", view_pos[0] + "px")
        .style("top", view_pos[1] + "px");

    // Set the dimensions of the canvas / graph
    var margin = {top: 40, right: 13, bottom: 30, left: 40},
        chart_width = 300 - margin.left - margin.right,
        chart_height = 200 - margin.top - margin.bottom;//270,top:10

    var total_height = chart_height + margin.top + margin.bottom;
    // Set the ranges
    var x = d3.scale.linear().range([0, chart_width]);
    var y = d3.scale.linear().range([chart_height, 0]);

    var total_width = chart_width + margin.left + margin.right;
    var count = 0;

    // Define the axes
    var formatAxis = d3.format("");

    var xAxis = d3.svg.axis().scale(x)
        .tickFormat(formatAxis)
        .orient("bottom").ticks(5);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left")
        .tickFormat(function (d) {
            if (d >= 10000)
                return d / 1000 + "k";
            else return d;
        })
        .ticks(5);

    // Define the line
    var valueline = d3.svg.line()
        .x(function (v) {
            return x(v.year);
        })
        .y(function (v) {
            return y(v.value);
        });

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
        .style("font-size", 21 + "px")
        .attr("transform", "translate(" + 150 + "," + 0 + ")")
        .style("text-decoration", "underline")
        .text(country_name);

    if (pop_layer) {
        xy_pop_data = convertToxy(country_name, 'pop_layer');
        draw_individual_chart(country_chart_tooltip_dynamic, total_width, total_height, chart_height, margin,
            xy_pop_data, x, y, valueline, xAxis, yAxis, "Population Density", "People per sq.km", color_split1, colors1);

        count++;
    }

    if (co2_layer) {
        xy_co2_data = convertToxy(country_name, 'co2_layer');
        draw_individual_chart(country_chart_tooltip_dynamic, total_width, total_height, chart_height, margin,
            xy_co2_data, x, y, valueline, xAxis, yAxis, "CO2 Emission Per Capita", "Tons per capita", color_split2, colors2);

        count++;
    }

    if (gdp_layer) {
        xy_gdp_data = convertToxy(country_name, 'gdp_layer');
        draw_individual_chart(country_chart_tooltip_dynamic, total_width, total_height, chart_height, margin,
            xy_gdp_data, x, y, valueline, xAxis, yAxis, "GDP Per Capita", "US$ per capita", color_split3, colors3);

        count++;
    }

    // country_chart_tooltip
    country_chart_tooltip_dynamic
        .style("width", total_width)
        .style("height", (title_height + total_height * count));

    return [total_width, total_height * count];
}

var x_ext = [1960, 2015];

function draw_individual_chart(tooltip, width, height, yaxis_height, margin, data, x, y, valueline, xAxis, yAxis, legend, y_label, color_split, colors) {
    var svg = tooltip
        .append("svg")
        .attr("class", "point-chart")
        .style("display", "block")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data
    //var x_ext = d3.extent(xy_pop_data, function (v) {return v.year; });

    var min_y = d3.min(data, function (v) {
        return v.value;
    });
    var max_y = d3.max(data, function (v) {
        return v.value;
    });

    x.domain(x_ext);
    y.domain([min_y, max_y]);

    // Add the valueline path.
    svg.append("path")
        .attr("class", "line-path")
        .style("stroke", "#000000")//stroke: steelblue;
        .attr("d", valueline(data));

    svg.append("g")
        .append("text")
        //.attr("class", "x title")
        .attr("text-anchor", "end")
        .style("font-size", 12 + "px")
        .attr("transform", "translate(" + width + "," + (height - 10 ) + ")")
        .text("Year");

    svg.append("g")
        .append("text")
        //.attr("class", "x title")
        .attr("text-anchor", "end")
        .style("font-size", 12 + "px")
        .attr("transform", "translate(" + 100 + "," + 0 + ")")
        .text(y_label);

    svg.append("g").append("text")
    //  .attr("text-anchor", "end")
        .style("fill", "black")
        .style("font-size", 14 + "px")
        .attr("transform",
            "translate(" + (width / 2 - 90) + "," + -30 + ")")
        .text(legend);

    // Add the scatterplot
    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "value-point")
        .attr("r", 3)
        .attr("cx", function (v) {
            var x_value = x(v.year);
            return x_value;
        })
        .attr("cy", function (v) {
            var y_value = y(v.value);
            return y_value;
        }).style("fill", function (v) {
            var density = v.value;
            var max = color_split[0];
            var min = color_split[color_split.length - 1];

            if (density >= min && density <= max) {
                for (var index = 0; index < color_split.length - 1; index++) {
                    if (density >= color_split[index]) {
                        return colors[index];
                    }
                }
            }

            if (density >= max)
                return colors[0];
            else return colors[colors.length - 1];
        }
    );

    // Add the X Axis
    svg.append("g")
        .attr("class", "line-axis")
        .attr("transform", "translate(0," + yaxis_height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "line-axis")
        .call(yAxis);
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


