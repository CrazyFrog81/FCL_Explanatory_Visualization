/**
 * Created by yuhao on 27/5/16.
 */

// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

function loadFCLData() {
    d3.csv("data/fcl/1. Projects.csv", function (err, projects) {
        projects.forEach(function (pointA) {
            var projectObj = {};

            projectObj["index"] = pointA.No - 1;
            projectObj["name"] = pointA.Index + " " + pointA.Name;
            projectObj["text"] = pointA.Country;
            projectObj["latitude"] = pointA.Latitude;
            projectObj["longitude"] = pointA.Longitude;
            projectObj["city"] = pointA.City;
            projectObj["country"] = pointA.Country;

            SC.projects.push(projectObj);
        });
    });

    d3.csv("data/fcl/2. Global Network.csv", function (err, items) {
        items.forEach(function (pointA) {
            var Obj = {};
            Obj["index"] = pointA.No - 1;
            Obj["title"] = pointA.Title;
            Obj["collaborator"] = pointA.Name;
            Obj["latitude"] = pointA.Latitude;
            Obj["longitude"] = pointA.Longitude;
            Obj["country"] = pointA.Country;

            SC.network.push(Obj);
        });
    });

    d3.csv("data/fcl/3. Academic staff.csv", function (err, items) {
        items.forEach(function (pointA) {
            var Obj = {};
            Obj["index"] = pointA.No - 1;
            Obj["based"] = pointA.Based;
            Obj["latitude"] = pointA.Latitude;
            Obj["longitude"] = pointA.Longitude;
            Obj["country"] = pointA.Nationality;

            SC.staff.push(Obj);
        });
    });
}

var fcl_tooltip_list = [];
var area_unit = 200;

function draw_cluster(color, layer_name, cluster) {
    var gpoint = g.append("g").attr("class", "items " + layer_name);
    var lng = cluster["longitude"];
    var lat = cluster["latitude"];

    var point = projection([lng, lat]);
    var point_x = point[0];
    var point_y = point[1];

    var img_src = [];

    gpoint.selectAll("circle")
        .data([{"area": cluster.length}])
        .enter()
        .append("svg:circle")
        .style("stroke", "#000")
        .style("stroke-width", "0.5px")
        .attr("cx", point_x)
        .attr("cy", point_y)
        .attr("class", "point")
        .style("fill", color)
        .style("opacity", 0.60)
        .attr("r", function (d) {
            return Math.sqrt(d["area"] * area_unit / Math.PI) / zoom.scale();
        })
        .on("mouseout", function () {
            // return cluster_tooltip.attr("style","visibility: hidden");
        })
        .on("click", function () {
            showFCLInfoTooltip(layer_name, cluster);
        });
}

function generate_clusters(layer_name, color, items) {
    var size = items.length;

    var cluster_dist_thre = 30;

    var dist_matrix = [];
    var all_clusters = [];
    var item_in_cluster_index = [];
    for (var a_index = 0; a_index < size; a_index++) {
        dist_matrix[a_index] = [];
        var a = items[a_index];
        var a_viewport_pos = viewport_pos(a["longitude"], a["latitude"]);

        for (var b_index = a_index + 1; b_index < size; b_index++) {
            var b = items[b_index];
            var b_viewport_pos = viewport_pos(b["longitude"], b["latitude"]);
            var x_dist = b_viewport_pos[0] - a_viewport_pos[0];
            var y_dist = b_viewport_pos[1] - a_viewport_pos[1];

            var dist = Math.sqrt(x_dist * x_dist + y_dist * y_dist);
            dist_matrix[a_index][b_index] = dist;
        }

        item_in_cluster_index[a_index] = -1;
    }

    for (var index = 0; index < size; index++) {
        var item = items[index];
        // if the item is not assigned to any cluster
        if (item_in_cluster_index[index] == -1) {
            // check if the item is close to any item in other clusters
            for (var cluster_index = 0; cluster_index < all_clusters.length; cluster_index++) {
                var cur_cluster = all_clusters[cluster_index];
                for (var cur_item_index = 0; cur_item_index < cur_cluster.length; cur_item_index++) {
                    var cur_cluster_item = cur_cluster[cur_item_index];
                    var real_item_index = cur_cluster_item["index"];
                    var dist = index < real_item_index
                        ? dist_matrix[index][real_item_index] : dist_matrix[real_item_index][index];

                    if (dist <= cluster_dist_thre) {
                        item_in_cluster_index[index] = cluster_index;

                        cur_cluster.push(item);
                        break;
                    }
                }

                if (item_in_cluster_index[index] != -1) // found cluster
                    break;
            }
        }

        // if non cluster is found
        if (item_in_cluster_index[index] == -1) {
            var new_cluster = [];
            new_cluster.push(item);
            for (var next_index = index + 1; next_index < size; next_index++) {
                if (item_in_cluster_index[next_index] == -1 && dist_matrix[index][next_index] < cluster_dist_thre) {
                    new_cluster.push(items[next_index]);
                    item_in_cluster_index[next_index] = all_clusters.length;
                }
            }

            all_clusters.push(new_cluster);
        }
    }

    // sort clusters based on their item size
    all_clusters.sort(function (a, b) {
        return b.length - a.length;
    });

    all_clusters.forEach(function (cluster) {
        cluster["longitude"] = 0;
        cluster["latitude"] = 0;

        // sort items in cluster according to the item index
        cluster.sort(function (a, b) {
            return parseInt(a["index"]) - parseInt(b["index"]);
        });

        cluster["id"] = layer_name + "_";

        cluster["all_country_info"] = [];

        cluster.forEach(function (item) {
            cluster["id"] += item["index"] + "|" + item["country"] + "_";

            cluster["longitude"] += item["longitude"] / cluster.length;
            cluster["latitude"] += item["latitude"] / cluster.length;

            var item_country = item["country"];
            var item_country_added = false;
            for (var index = 0; index < cluster["all_country_info"].length; index++) {
                var country_info_i = cluster["all_country_info"][index];
                if (item_country == country_info_i["country"]) {
                    country_info_i["count"]++;
                    item_country_added = true;
                    break;
                }
            }
            if (!item_country_added) {
                var new_item_country = [];
                new_item_country["country"] = item_country;
                new_item_country["count"] = 1;
                cluster["all_country_info"].push(new_item_country);
            }
        });

        cluster["all_country_info"].sort(function (a, b) {
            return b["count"] - a["count"];
        });

        // cluster["all_country_info"].forEach(function (country_info) {
        //     console.log(cluster["id"] + " " + country_info["country"] + " " + country_info["count"]);
        // })
    });

    svg.append("g")
        .attr("class", layer_name)
    // console.log("form " + all_clusters.length + " clusters");
    var count = 0;
    for (var index = 0; index < all_clusters.length; index++) {
        count += all_clusters[index].length;
        var cluster = all_clusters[index];

        // console.log("cluster " + index + " has " + all_clusters[index].length + " items" + " lng: " + all_clusters[index]["longitude"] + " lat " + all_clusters[index]["latitude"]);

        draw_cluster(color, layer_name, cluster);
    }
}

var circle, focus, text; //svg

function showFCLInfoTooltip(layer_name, cluster) {
    // console.log("showFCLInfoTooltip");
    var layer_description;
    var layer_img;

    var viewport_position = viewport_pos(cluster["longitude"], cluster["latitude"]);
    var about_fcl_tooltip_dynamic_id = "about_fcl_tooltip_" + cluster["id"];

    var cluster_div =
        "<div id= '" + about_fcl_tooltip_dynamic_id + "_div' class='tooltip_country_holder'>";

    var find_tooltip = document.getElementById(about_fcl_tooltip_dynamic_id);
    if (find_tooltip != null) {
        find_tooltip.remove();
        return;
    }

    var about_fcl_tooltip = d3.select("#map_container").append("div")
        .attr("class", "about_fcl_tooltip_container")
        .attr("style", "fill: none").attr("id", about_fcl_tooltip_dynamic_id);

    switch (layer_name) {
        case 'project_layer':
            layer_description = "Num. of Projects:";
            layer_img = "img/icon_project.png";

            cluster["all_country_info"].forEach(function (country_info) {
                var country_name = country_info["country"];
                var country_name_str = country_name.replace(/ /g, ''); //remove all blank spaces
                var country_img = "img/national_flag/" + country_name_str.toLowerCase() + ".png";

                cluster_div += "<div class='tooltip_text'>" + country_name.toUpperCase() + "</div>" +
                    "<div class='pic_holder Centered'><img class='tooltip_pic Centered' src='" + country_img + "' onerror='imgErr(this)'> </div>";
            });

            break;

        case 'network_layer':
            layer_description = "Num. of Collaborators:";
            layer_img = "img/icon_network.png";

            break;

        case 'staff_layer':
            layer_description = "Num. of Researchers:";
            layer_img = "img/icon_researcher.png";

            break;
    }

    if(layer_name == "project_layer" || layer_name == "staff_layer"){
        cluster["all_country_info"].forEach(function (country_info) {
            var country_name = country_info["country"];
            var country_name_str = country_name.replace(/ /g, ''); //remove all blank spaces
            var country_img = "img/national_flag/" + country_name_str.toLowerCase() + ".png";

            cluster_div += "<div class='tooltip_text'>" + country_name.toUpperCase() + "</div>" +
                "<div class='pic_holder Centered'><img class='tooltip_pic Centered' src='" + country_img + "' onerror='imgErr(this)'> </div>";
        });
    } else{
        cluster.forEach(function (item) {
            var collaborator_name = item["collaborator"];
            var collaborator_index = item["index"] + 1;
            var collaborator_img = "img/network_img/" + collaborator_index + "_network.png";

            cluster_div += "<div class='tooltip_text'>" + collaborator_name.toUpperCase() + "</div>" +
                "<div class='pic_holder Centered'><img class='tooltip_pic Centered' src='" + collaborator_img + "' onerror='imgErr(this)'> </div>";
        });
    }
    cluster_div += "</div>";


    var y_displacement = 60;
    //---number tooltip---//
    about_fcl_tooltip.append("div")
        .attr("id", about_fcl_tooltip_dynamic_id + "_info")
        .attr("class", "about_fcl_tooltip")
        .attr("style", "left:" + viewport_position[0] + "px;bottom:" + (window.innerHeight - viewport_position[1] + y_displacement) + "px;visibility: visible;")
        .attr("data-lng", cluster["longitude"])
        .attr("data-lat", cluster["latitude"])
        .html("<div class='tooltip_info_holder'>" +
            "<div class='tooltip_text'>" + layer_description.toUpperCase() + "</div>" +
            "<div class='pic_holder Centered'><img class='tooltip_pic_logo Centered' src='" + layer_img + "' onerror='imgErr(this)'>" + "         " + cluster.length + "</div>" +
            "</div>"
        );

    var about_fcl_info_tooltip_width = document.getElementById(about_fcl_tooltip_dynamic_id + "_info").offsetWidth;
    var about_fcl_info_tooltip_height = document.getElementById(about_fcl_tooltip_dynamic_id + "_info").offsetHeight;
    var tooltip_2_x = viewport_position[0] + about_fcl_info_tooltip_width + 8;

    //---national flag tooltip---//
    about_fcl_tooltip.append("div")
        .attr("id", about_fcl_tooltip_dynamic_id + "_country")
        .attr("class", "about_fcl_tooltip")
        .attr("style", "left:" + (tooltip_2_x) + "px;bottom:" + (window.innerHeight - viewport_position[1] + y_displacement) + "px;visibility: visible;")
        .attr("data-lng", cluster["longitude"])
        .attr("data-lat", cluster["latitude"])
        .html(cluster_div);

    // change the style
    // $("#"+about_fcl_tooltip_dynamic_id+"_div").niceScroll({
    //     touchbehavior: false,
    //     cursorcolor: "#FFEEFF",
    //     cursoropacitymax: 0.7,
    //     cursorwidth: 11,
    //     cursorborder: "1px solid #2848BE",
    //     cursorborderradius: "8px",
    //     background: "#ccc",
    //     autohidemode: "auto"
    // });

    //---flagpole---//
    about_fcl_tooltip.append("div")
        .attr("id", about_fcl_tooltip_dynamic_id + "_line")
        .attr("class", "about_fcl_tooltip_line")
        .attr("style", "left:" + (viewport_position[0] - 1) + "px;bottom:" + (window.innerHeight - viewport_position[1]) + "px;visibility: visible;")
        .attr("data-lng", cluster["longitude"])
        .attr("data-lat", cluster["latitude"]);

    document.getElementById(about_fcl_tooltip_dynamic_id + "_line").style.height = (y_displacement + about_fcl_info_tooltip_height) + "px";
}