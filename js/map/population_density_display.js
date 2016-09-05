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

            display_Density1(1964); //read_popData();
            draw_colorSlider_1('pop_layer');
            break;

        case "co2_layer":                       //if(SC.layer_count>0)adjust_opacity(_category);
            color_split2 = [100, 50, 20, 10, 5, 1, 0.1, 0];//max_property=100;
            draw_co2_country();

            display_Density2(1964);//read_co2Data();
            draw_colorSlider_2('co2_layer');
            break;
        case "gdp_layer":          //if(SC.layer_count>0)adjust_opacity(_category);
            color_split3 = [100000, 75000, 50000, 10000, 5000, 1000, 500, 0];
            draw_gdp_country();
            display_Density3(1964);//read_co2Data();
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

function adjust_opacity(_cat) {
    switch (_cat) {
        case 'pop_layer':
            break;
        case 'co2_layer':
            break;
        case'gdp_layer':
            break;
        default:
            break;
    }
}


/*create or update population density on map*/
function display_Density1(cur_year) {
    if (range1 == undefined) {
        range1 = [];
        range1[0] = 0;
        range1[1] = color_split1.length;
    }
    var ticks = color_split1;
    var min = range1[0];
    var max = range1[1];


    /*modify colors of each countries based on population density*/
    var countries = g.select("#pop_countries").selectAll(".country").data(this.world_topo);

    countries.attr("fill", function (d, i) {
        var name = d.properties.name;

        var country_properties = find_country_pop(name);
        var country_size = find_country_area(name);

        if (country_properties.length > 0 && country_size.length > 0) {
            var year_property = country_properties[0][cur_year];
            var c_size = country_size[0][cur_year];

            if (c_size.length > 0 && year_property.length > 0) {
                var density = year_property / c_size;


                if (density >= color_split1[min] && density < color_split1[max]) {


                    for (var index = 0; index < color_split1.length; index++) {
                        if (density >= color_split1[index]) {

                            return colors1[index];
                        }
                    }

                    return colors1[1];
                } else {
                    return worldmap_background;
                }
            } else {
                return worldmap_background;
            }

        } else {
            return worldmap_background; //
        }

    }).on("mousemove", null);

    /*modify tooltip to add in info about population and country size*/

    var color_layer_count = 0;
    var xy_pop_data;
    var xy_co2_data;
    var xy_gdp_data;
    var country_name;


    countries
        .on("mouseover", function (d) {
            var popMultiplier = 1;
            var co2Multiplier = 1000;
            var gdpMultiplier = 1;

            color_layer_count = 0;

            var format = d3.format(',.02f');

            //this layer is pop_layer
            country_name = d.properties.name;
            var tooltip_content = "<b style='font-size:20px'>" + country_name + "</b><br>";

            var pop_properties = find_country_pop(country_name);
            var country_properties = find_country_area(country_name);
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

            if (country_properties[0] != undefined && country_properties[0][cur_year].length > 0) {

                var year_area = country_properties[0][cur_year];

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

                var co2_properties = find_country_co2(country_name);
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

                var gdp_properties = find_country_gdp(country_name);

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


            var left = d3.event.pageX + offsetL;
            var top = d3.event.pageY + offsetT;

            // country_info_tooltip
            //     .html(tooltip_content)
            //     .style("visibility","visible")
            //     .style("left", left + "px")
            //     .style("top", top + "px");

        })
        .on("mousemove", function (d, i) {
            var left = d3.event.pageX + offsetL;
            var top = d3.event.pageY + offsetT;

            var width = 338;
            var height = 100 + color_layer_count * 40;
            if (left + width > innerWidth) {
                left = left - 2 * offsetL - width;
            }

            if (height + top > innerHeight) {
                top = top - 2 * offsetT - height;
            }


            // country_info_tooltip
            //     .style("left", left  + "px")
            //     .style("top", top + "px");


        })
        .on("mouseout", function (d, i) {
            //looptime = 0;
            return country_info_tooltip.attr("style", "visibility: hidden");
        })

        .on("click", function (d, i) {

            // var res =  draw_charts(xy_pop_data,xy_co2_data,xy_gdp_data,country_name);


            //country_info_tooltip.style("visibility","hidden");

            if (chart_refresh) {

                console.log("refreshing!");
                // var width = res[0];
                // var height = res[1];
                //var left =(innerWidth-width)/2;
                //var top = (innerHeight-height)/2;
                var left = d3.event.pageX;
                var top = d3.event.pageY;

                var res = draw_charts(xy_pop_data, xy_co2_data, xy_gdp_data, country_name, left, top);

                // country_chart_tooltip
                //     .style("left", left  + "px")
                //     .style("top", top + "px");
                //chart_refresh = false;
            }

            country_chart_tooltip
                .style("visibility", "visible");


            /*if(left+width+45>innerWidth){
             left = innerWidth-45 - width;
             }

             if(height+top+45 > innerHeight){
             top =  innerHeight-45 - height;
             }*/


            //.on("click",function(){country_chart_tooltip.style("visibility","hidden");});

        });

}


/*draw co2 emission per capita on map*/
function display_Density2(cur_year) {
    if (range2 == undefined) {
        range2 = [];
        range2[0] = 0;
        range2[1] = color_split2.length;
    }

    var min = range2[0];
    var max = range2[1];

    var densityMultiplier = 1000;

    /*modify colors of each countries based on co2 density*/
    var countries = g.select("#co2_countries").selectAll(".country").data(this.world_topo);

    countries
        .attr("z-index", 4).attr("fill", function (d, i) {
        var name = d.properties.name;

        var country_properties = find_country_co2(name);
        var country_size = find_country_pop(name);

        if (country_properties != undefined && country_size != undefined && country_properties[0] != undefined && country_size[0] != undefined) {
            if (country_properties[0][cur_year].length > 0 && country_size[0][cur_year].length > 0) {
                var year_property = country_properties[0][cur_year];
                var c_size = country_size[0][cur_year];
                var density = year_property / c_size * densityMultiplier;

                if (density >= color_split2[min] && density < color_split2[max]) {
                    for (var index = 0; index < color_split2.length; index++) {
                        if (density >= color_split2[index]) {
                            return colors2[index];
                        }
                    }

                    return colors2[1];
                } else {
                    return worldmap_background;
                }
            } else {
                return worldmap_background;
            }

        } else {
            return worldmap_background; //
        }

    }).on("mousemove", null);

    //modify tooltip to add in info about population and country size
    var offsetL = document.getElementById("map_container").offsetLeft + 20;
    var offsetT = document.getElementById("map_container").offsetTop + 10;
    var color_layer_count = 0;
    var xy_pop_data;
    var xy_co2_data;
    var xy_gdp_data;
    var country_name;

    countries
        .on("mouseover", function (d) {
            var popMultiplier = 1;
            var co2Multiplier = 1000;
            var gdpMultiplier = 1;

            color_layer_count = 0;

            var format = d3.format(',.02f');

            //this layer is pop_layer
            country_name = d.properties.name;
            var tooltip_content = "<b style='font-size:20px'>" + country_name + "</b><br>";

            var pop_properties = find_country_pop(country_name);
            var country_properties = find_country_area(country_name);
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

            if (country_properties[0] != undefined && country_properties[0][cur_year].length > 0) {

                var year_area = country_properties[0][cur_year];

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

                var co2_properties = find_country_co2(country_name);
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

                var gdp_properties = find_country_gdp(country_name);

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

            var left = d3.event.pageX + offsetL;
            var top = d3.event.pageY + offsetT;

            // country_info_tooltip
            //     .html(tooltip_content)
            //     .style("visibility","visible")
            //     .style("left", left + "px")
            //     .style("top", top + "px");
        })
        .on("mousemove", function (d, i) {
            var left = d3.event.pageX + offsetL;
            var top = d3.event.pageY + offsetT;

            var width = 338;
            var height = 100 + color_layer_count * 40;
            if (left + width + 45 > innerWidth) {
                left = left - 2 * offsetL - width;
            }

            if (height + top + 45 > innerHeight) {
                top = top - 2 * offsetT - height;
            }

            country_info_tooltip
                .style("left", left + "px")
                .style("top", top + "px");
            //return country_info_tooltip.attr("style", "visibility: hidden");
        }).on("mouseout", function (d, i) {
        //looptime = 0;
        return country_info_tooltip.attr("style", "visibility: hidden");
    }).on("click", function (d, i) {
        // var res =  draw_charts(xy_pop_data,xy_co2_data,xy_gdp_data,country_name);

        //country_info_tooltip.style("visibility","hidden");

        if (chart_refresh) {
            console.log("refreshing!");
            // var width = res[0];
            // var height = res[1];
            // var left =(innerWidth-width)/2;
            // var top = (innerHeight-height)/2;
            var left = d3.event.pageX;
            var top = d3.event.pageY;
            var res = draw_charts(xy_pop_data, xy_co2_data, xy_gdp_data, country_name, left, top);

            // country_chart_tooltip
            //     .style("left", left  + "px")
            //     .style("top", top + "px");
            // chart_refresh = false;
        }

        country_chart_tooltip.style("visibility", "visible");
    });
}


/*draw co2 emission per capita on map*/
function display_Density3(cur_year) {
    if (range3 == undefined) {
        range3 = [];
        range3[0] = 0;
        range3[1] = color_split3.length;
    }

    var min = range3[0];
    var max = range3[1];

    var densityMultiplier = 1;

    /*modify colors of each countries based on co2 density*/
    var countries = g.select("#gdp_countries").selectAll(".country").data(this.world_topo);

    countries
        .attr("z-index", 4).attr("fill", function (d, i) {
        var name = d.properties.name;

        var country_properties = find_country_gdp(name);
        var country_size = find_country_pop(name);

        if (country_properties.length > 0 && country_size.length > 0) {
            if (country_properties[0][cur_year].length > 0 && country_size[0][cur_year].length > 0) {
                var year_property = country_properties[0][cur_year];
                var c_size = country_size[0][cur_year];

                var density = year_property / c_size * densityMultiplier;

                if (density >= color_split3[min] && density < color_split3[max]) {
                    for (var index = 0; index < color_split3.length; index++) {
                        if (density >= color_split3[index]) {

                            return colors3[index];
                        }
                    }

                    return colors3[1];
                } else {
                    return worldmap_background;
                }
            } else {
                return worldmap_background;
            }

        } else {
            return worldmap_background; //
        }

    }).on("mousemove", null);

    //modify tooltip to add in info about population and country size
    var offsetL = document.getElementById("map_container").offsetLeft + 20;
    var offsetT = document.getElementById("map_container").offsetTop + 10;

    var xy_pop_data;
    var xy_co2_data;
    var xy_gdp_data;
    var color_layer_count = 0;
    var country_name;


    countries
        .on("mouseover", function (d) {
            var popMultiplier = 1;
            var co2Multiplier = 1000;
            var gdpMultiplier = 1;

            color_layer_count = 0;

            var format = d3.format(',.02f');

            //this layer is pop_layer
            country_name = d.properties.name;
            var tooltip_content = "<b style='font-size:20px'>" + country_name + "</b><br>";

            var pop_properties = find_country_pop(country_name);
            var country_properties = find_country_area(country_name);
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

            if (country_properties[0] != undefined && country_properties[0][cur_year].length > 0) {
                var year_area = country_properties[0][cur_year];

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

                var co2_properties = find_country_co2(country_name);
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

                var gdp_properties = find_country_gdp(country_name);

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

            country_info_tooltip
                .html(tooltip_content);

            var left = d3.event.pageX + offsetL;
            var top = d3.event.pageY + offsetT;

            // country_info_tooltip
            //     .style("visibility","visible")
            //     .style("left", left + "px")
            //     .style("top", top + "px");
        })
        .on("mousemove", function (d, i) {

            var left = d3.event.pageX + offsetL;
            var top = d3.event.pageY + offsetT;
            var width = 338;
            var height = 100 + color_layer_count * 40;
            if (left + width + 45 > innerWidth) {
                left = left - 2 * offsetL - width;
            }

            if (height + top + 45 > innerHeight) {
                top = top - 2 * offsetT - height;
            }


            country_info_tooltip
                .style("left", left + "px")
                .style("top", top + "px");


        }).on("mouseout", function (d, i) {
        //looptime = 0;
        return country_info_tooltip.attr("style", "visibility: hidden");
    }).on("click", function (d, i) {
        // var res =  draw_charts(xy_pop_data,xy_co2_data,xy_gdp_data,country_name);


        //country_info_tooltip.style("visibility","hidden");

        if (chart_refresh) {

            console.log("refreshing!");
            // var width = res[0];
            // var height = res[1];
            // var left =(innerWidth-width)/2;
            // var top = (innerHeight-height)/2;
            var left = d3.event.pageX;
            var top = d3.event.pageY;

            // country_chart_tooltip
            //     .style("left", left  + "px")
            //     .style("top", top + "px");
            var res = draw_charts(xy_pop_data, xy_co2_data, xy_gdp_data, country_name, left, top);
            // chart_refresh = false;
        }

        country_chart_tooltip.style("visibility", "visible");

    });


}


function find_country_co2(country_name) {
    var m = country_co2_emission.filter(function (f) {
        //return f.country == country_id;
        return f.Country_Name == country_name;
    });
    return m;
}

function find_country_gdp(country_name) {

    var m = country_gdp.filter(function (f) {
        //return f.country == country_id;
        return f.Country_Name == country_name;
    });
    return m;
}


function find_country_pop(country_name) {

    var m = country_pop.filter(function (f) {
        //return f.country == country_id;
        return f.Country_Name == country_name;
    });
    return m;
}

function find_country_area(country_name) {

    var m = country_area.filter(function (f) {
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


/*draw the point charts for each country, onclick*/
function draw_charts(xy_pop_data, xy_co2_data, xy_gdp_data, country_name, left, top) {
    //clear the existing charts
    //country_chart_tooltip.style("visibility","visible");
    //country_chart_tooltip.selectAll("svg").remove();

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
            mydragg_L.stopMoving("content_holder");
            d3.select(this).style("background-color", "#ffffff");
        });

    var tooltip_dynamic = d3.select("#map_container").append("div")
        .attr("style", "fill: none");
    var chart_tooltip_dynamic_id = "chart_tooltip_" + chart_tooltip_id_counting.toString();
    var country_chart_tooltip_dynamic = tooltip_dynamic.append("div").attr("class", "tooltip")
        .attr("id", chart_tooltip_dynamic_id)
        .attr("style", "visibility:hidden;display:inline;background-color:white;overflow:hidden;")
        .attr("z-index", 2)
        .call(drag);
    //.on("move",function(){
    //    country_chart_tooltip_dynamic.style("visibility","visible");
    //    mydragg_L.startMoving(chart_tooltip_dynamic_id,"content_holder",event);
    //}).on("mouseup",function(){
    //    country_chart_tooltip_dynamic.style("visibility","visible");
    //    mydragg_L.stopMoving("content_holder");
    //});
    chart_tooltip_id_counting = chart_tooltip_id_counting + 1;

    country_chart_tooltip_dynamic.append("span")
        .attr("class", "close")
        .on("click", function () {
            //close
            country_chart_tooltip_dynamic.style("visibility", "hidden");
        });

    country_chart_tooltip_dynamic
        .style("visibility", "visible")
        .selectAll("svg").remove();
    country_chart_tooltip_dynamic
        .style("left", left + "px")
        .style("top", top + "px");

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
        //.style("position","inherit")
        //.style("left",total_width*count/2-80
        //.style("border","2px solid red")
        .attr("width", total_width)
        .attr("height", title_height)
        .append("g");
    //.attr("transform",
    //  "translate(" +50 +","+10+ ")");//total_width*count/2 + "," +total_height

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
            .text("People" +
                " per sq.km");

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
        }).on("mouseover", function (v) {
                var th = d3.select(this);
                th.style("border", "2px solid red");

                var format = d3.format(',.04f');

                country_info_tooltip
                    .html("Population Density: " + format(v.value) + "<br>Year: " + v.year)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px");

                // country_info_tooltip.style("visibility","visible")
            })
            .on("mouseout", function (d) {
                d3.select(this).style("border", "2px solid red");
                country_info_tooltip.style("visibility", "hidden");
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
            })
            .on("mouseover", function (v) {
                var format = d3.format(',.02f');

                // country_info_tooltip.style("visibility","visible")
                //     .html("CO2 Emission per capita: "+ format(v.value) + "<br>Year: "+v.year)
                //     .style("left", (d3.event.pageX ) + "px")
                //     .style("top", (d3.event.pageY) + "px");
            })
            .on("mouseout", function (d) {
                country_info_tooltip.style("visibility", "hidden");
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
            })
            .on("mouseover", function (v) {
                var format = d3.format(',.02f');
                //country_info_tooltip.style("visibility","visible")
                //    .html("GDP per Capita (US$): "+ format(v.value) + "<br>Year: "+v.year)
                //    .style("left", (d3.event.pageX) + "px")
                //    .style("top", (d3.event.pageY) + "px");
            })
            .on("mouseout", function (d) {
                country_info_tooltip.style("visibility", "hidden");
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


