/*
 * Copyright (C) 2015 ETH Zurich
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Zeng Wei (zeng@arch.ethz.ch)
 */

window.SC = {};

SC.projects = [];
SC.network = [];
SC.staff = [];

SC.layer_count = 0;
SC.layer_stack = [0, 0, 0]; // index 0 for pop_layer, index 1 for co2, index 2 for GDP;
//// each contains the layer stack number from 1-3, 0 stands for non-exists

var worldmap_background = "#E2E3E8";

var world_topo;

var country_pop, country_area;
var country_co2_emission;
var country_gdp;
var pop_density, co2_density, gdp_density;

d3.json("data/topo/world-topo.json", function (error, world) {
    world_topo = topojson.feature(world, world.objects.countries).features;

    var welcome = d3.select("#welcome_mask")
        .style("opacity", 0.3);
    setTimeout(function () {
        welcome.remove();
    }, 2200);

    read_popData();
});

function read_popData() {
    d3.csv("data/fitted/country_size.csv", function (error, country_size_data) {
        d3.csv("data/fitted/population.csv", function (error, pop_data) {
            d3.csv("data/fitted/population_density.csv", function (error, pop_density_data) {
                country_pop = pop_data;
                country_area = country_size_data;
                pop_density = pop_density_data;
                console.log("progress: read_pop");
                read_gdpData();
            });
        });
    });
}

function read_gdpData() {
    d3.csv("data/fitted/GDP.csv", function (error, gdp_data) {
        d3.csv("data/fitted/GDP_per_capita.csv", function (error, gdp_density_data) {

            country_gdp = gdp_data;
            gdp_density = gdp_density_data;
            console.log("progress: read_gdp");
            read_co2Data();
        });
    });
}

function read_co2Data() {
    d3.csv("data/fitted/CO2.csv", function (error, co2_data) {
        d3.csv("data/fitted/co2_per_capita.csv", function (error, co2_density_data) {
            country_co2_emission = co2_data;
            co2_density = co2_density_data;
            console.log("progress: read_co2");
            draw_worldmap();
            init_pop_layer();
        });
    });
}

var offsetL = 10, offsetT = 10;

var projection, path, svg, g;

var world_map_max_zoom = 1000;

var zoom = d3.behavior.zoom().scaleExtent([1, world_map_max_zoom]).on("zoom", move);

function init() {
    offsetL = document.getElementById("map_container").offsetLeft + 10;
    offsetT = document.getElementById("map_container").offsetTop + 10;

    projection = d3.geo.mercator()
        .translate([(map_width / 2), (map_height / 2)])
        .center([0, 42.313])
        .scale(map_width / 2 / Math.PI + 20);

    path = d3.geo.path().projection(projection);

    svg = d3.select("#map_container").append("svg")
        .attr("id", "svg1")
        .attr("width", map_width)
        .attr("height", map_height)
        .call(zoom)
        .on("click", click)
        .append("g")
        .attr("id", "map_container_g");

    g = svg.append("g").attr("id", "country_holder");

    var country = g.selectAll(".country").data(this.world_topo);

    country.enter().insert("path").attr("class", "country")
        .attr("d", path)
        .attr("id", function (d, i) {
            return d.id;
        })
        .attr("title", function (d, i) {
            return d.properties.name;
        }).attr("fill", worldmap_background);
}

function draw_worldmap() {
    removeAllChild();
    init();
    loadFCLData();

    setup_slider(1964, 2014);

    console.log("progress: draw_worldmap");
}

/* to redraw world map upon close of all three color layer*/
function redraw_worldmap() {
    var country = g.selectAll(".country").data(this.world_topo);

    country.attr("fill", worldmap_background);
}

//adjust shapes upon zoom and drag
function move(t, s) {
    if (t == undefined || s == undefined) {
        s = d3.event.scale;
        t = d3.event.translate;
    }

    var tier1_scale = 2;
    var tier2_scale = 2.5;
    var tier3_scale = 3;
    var tier4_scale = 3.5;
    var tier_range = 100;
    var scale = 2;

    if (s >= tier4_scale) {
        tier_range = 3;
        scale = tier4_scale;
        svg.selectAll(".items").remove();
    } else if (s >= tier3_scale) {
        tier_range = 5;
        scale = tier3_scale;
    } else if (s >= tier2_scale) {
        tier_range = 25;
        scale = tier2_scale;
    } else if (s >= tier1_scale) {
        tier_range = 50;
        scale = tier1_scale;
    } else {
        tier_range = 100;
        scale = 1;
    }

    svg.selectAll(".items").remove();

    if (project_layer)
        generate_clusters('project_layer', 'yellow', SC.projects);
    if (network_layer)
        generate_clusters('network_layer', 'blue', SC.network);
    if (staff_layer)
        generate_clusters('staff_layer', 'pink', SC.staff);

    var cur_scale = zoom.scale();

    var margin_x = map_width * 0.1;
    var margin_y = map_height * 0.3;

    var max_t0 = (s - 1) * map_width + 2 * margin_x;
    var max_t1 = (s - 1) * map_height + 2 * margin_y;
    if (t[0] >= 0) {
        t[0] = Math.min(t[0], margin_x);
    } else {
        t[0] = Math.max(t[0], -max_t0);
    }

    if (t[1] >= 0) {
        t[1] = Math.min(t[1], margin_y);
    } else {
        t[1] = Math.max(t[1], -(max_t1 * 1.1));
    }

    fcl_tooltip_list = [];

    svg.attr("transform", "translate(" + t + ")scale(" + s + ")");

    d3.selectAll(".tooltip").attr("transform", "translate(" + t + ")scale(" + s + ")");

    /* SET NEW ZOOM POINT */
    zoom.translate(t);
    zoom.scale(s);

    d3.selectAll(".cluster")
        .style("stroke-width", 0.5)
        .attr("r", function (d) {
            return Math.sqrt(area_unit * d["area"] / Math.PI) / zoom.scale();
        });

    svg.selectAll(".zoomable").remove();

    //adjust the country hover stroke map_width based on zoom level
    d3.selectAll(".country").style("stroke-width", 1.5);
    d3.selectAll(".text").style("font-size", 20);

    var tooltips = d3.selectAll(".tooltip").forEach(function (tips) {
        tips.forEach(function (tip) {
            if (tip.id == undefined || tip.id == "")
                return;

            var new_pos = viewport_pos(tip.dataset.lng, tip.dataset.lat);

            d3.select(tip).style("left", new_pos[0] + "px").style("top", new_pos[1] + "px");
        })
    });

    var fcl_tooltips = d3.selectAll(".about_fcl_tooltip").forEach(function (tips) {
        tips.forEach(function (tip) {
            if (tip.id == undefined || tip.id == "")
                return;

            var new_pos = viewport_pos(tip.dataset.lng, tip.dataset.lat);

            var x = new_pos[0];
            if (tip.id.includes("country")) {
                x += (document.getElementById(tip.id.replace("_country", "_info")).offsetWidth + 8);
            }

            d3.select(tip).style("left", x + "px").style("bottom", (window.innerHeight - new_pos[1] + 60) + "px");
        })
    });

    var fcl_tooltips_lines = d3.selectAll(".about_fcl_tooltip_line").forEach(function (tips) {
        tips.forEach(function (tip) {
            if (tip.id == undefined || tip.id == "")
                return;

            var new_pos = viewport_pos(tip.dataset.lng, tip.dataset.lat);

            var x = new_pos[0];

            d3.select(tip).style("left", x + "px").style("bottom", (window.innerHeight - new_pos[1]) + "px");
        })
    });
}

function click() {
    var xxx = projection.invert(d3.mouse(this));
}

function viewport_pos(long, lat) {
    var proj = projection([long, lat]);

    var viewport_x = proj[0] * zoom.scale() + zoom.translate()[0];
    var viewport_y = proj[1] * zoom.scale() + zoom.translate()[1];

    return [viewport_x, viewport_y];
}

function lnglat_pos(viewport_x, viewport_y) {
    var x = (viewport_x - zoom.translate()[0]) / zoom.scale();
    var y = (viewport_y - zoom.translate()[1]) / zoom.scale();

    return projection.invert([x, y]);
}

function removeAllChild() {
    d3.selectAll(".extra_info").remove();

    var map_container = document.getElementById("map_container");
    while (map_container.firstChild) {
        map_container.removeChild(map_container.firstChild);
    }
}

function handle_zoom(th) {
    var zoom_in = d3.select(th).classed("zoom_in");
    var min_scale = zoom.scaleExtent()[0];
    var max_scale = zoom.scaleExtent()[1];


    var cur_scale = zoom.scale();
    var new_scale;

    if (zoom_in) {//handle zoom in
        new_scale = Math.min(cur_scale + 1, max_scale);
    } else {
        new_scale = Math.max(cur_scale - 1, min_scale);
    }

    var scale_factor = new_scale / cur_scale;
    var cur_t = zoom.translate();

    var new_t0 = map_width / 2 - scale_factor * (map_width / 2 - cur_t[0]);
    var new_t1 = map_height / 2 - scale_factor * (map_height / 2 - cur_t[1]);

    move([new_t0, new_t1], new_scale);
}