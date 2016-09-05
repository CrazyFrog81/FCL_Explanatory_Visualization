/**
 * Created by yuhao on 27/5/16.
 */

// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

var about_fcl_tooltip_country, about_fcl_tooltip_info, about_fcl_tooltip_connect_line;
var cluster_tooltip;

/*calculate distance between any two project locations*/

function draw_projectLayer() {
    var tier1_scale = 2;
    var tier2_scale = 2.5;
    var tier3_scale = 3;
    var tier4_scale = 3.5;
    var google_map_scale = 4;
    var tier_range = 100;
    var scale = 2;

    var s = zoom.scale();

    if (s >= tier4_scale) {
        tier_range = 3;
        scale = tier4_scale;
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
    find_last_tier(tier_range, scale, 'project_layer'); // draw tier1

    d3.selectAll(".point")
        .attr("id", "fcl_project_point")
        .style("stroke-width", 0.5 / s + 'px')
        .attr("r", function (d) {
            return Math.sqrt(area_unit * d["area"] / Math.PI) / s;
        });

    d3.selectAll(".cluster")
        .attr("id", "fcl_project_cluster")
        .style("stroke-width", 0.5 / s + 'px')
        .attr("r", function (d) {
            return Math.sqrt(area_unit * d["area"] / Math.PI) / s;
        });
}

function generate_allDistMatrix() {
    //produce project distance matrix
    SC.projectNo = 0;

    d3.csv("data/fcl/1. Projects.csv", function (err, projects) {
        var positionA = [];
        var positionB = [];
        var matrix = [];
        var distance;
        var distance_Multiplier = 1000; // km to m??
        var projectObj = {};
        var lon_unit;
        var lat_unit;

        projects.forEach(function (pointA) {
            var long = "";
            var descp = pointA.Description;
            var imgc = pointA.Image_Credit;
            if (descp.length > 0) long += "<br><br>" + descp;
            if (imgc) long += "<br><br>image credit:  <b style='font-style:italic;font-size:12px; text-decoration:underline;'>" + imgc + "</b>";

            positionA = [];
            positionA.push(pointA.Longitude, pointA.Latitude);
            matrix.push([]);
            SC.projectNo++;
            projectObj["index"] = pointA.No;
            projectObj["name"] = pointA.Index + " " + pointA.Name;
            lat_unit = Number(pointA.Latitude) >= 0 ? Math.abs(pointA.Latitude) + '°N' : Math.abs(pointA.Latitude) + '°S';
            lon_unit = Number(pointA.Longitude) >= 0 ? Math.abs(pointA.Longitude) + '°E' : Math.abs(pointA.Longitude) + '°W';
            // projectObj["text"] = "<br>" + pointA.Title + "<br>" + lat_unit + " , " + lon_unit + "<br>" + pointA.City + " , " + pointA.Country + long;
            projectObj["text"] = pointA.Country;
            projectObj["latitude"] = pointA.Latitude;
            projectObj["longitude"] = pointA.Longitude;
            projectObj["city"] = pointA.City;
            projectObj["country"] = pointA.Country;

            //---added by UnixC begin, counting project number for one country---//
            var pointA_Country = pointA.Country;

            // ZW: count starts from 0
            var projectNo_count = 0;
            projects.forEach(function (pointB) {
                if (pointA_Country == pointB.Country) {
                    projectNo_count = projectNo_count + 1;
                }
            });
            projectObj["Number"] = projectNo_count;
            //---added by UnixC end---//

            SC.projects.push(projectObj);
            projectObj = {};

            projects.forEach(function (pointB) {
                positionB = [];
                positionB.push(pointB.Longitude, pointB.Latitude);

                distance = d3.geo.distance(positionA, positionB) * distance_Multiplier;
                matrix[pointA.No - 1].push(distance);
            });
        });

        SC.project_matrix = matrix;
    });

    //produce network distance matrix
    SC.networkNo = 0;

    d3.csv("data/fcl/2. Global Network.csv", function (err, items) {
        var positionA = [];
        var positionB = [];
        var matrix = [];
        var distance;
        var distance_Multiplier = 1000; // km to m??
        var Obj = {};
        var lon_unit;
        var lat_unit;

        items.forEach(function (pointA) {
            positionA = [];
            positionA.push(pointA.Longitude, pointA.Latitude);
            matrix.push([]);
            SC.networkNo++;
            Obj["index"] = pointA.index;
            Obj["name"] = pointA.Name;
            lat_unit = Number(pointA.Latitude) >= 0 ? Math.abs(pointA.Latitude) + '°N' : Math.abs(pointA.Latitude) + '°S';
            lon_unit = Number(pointA.Longitude) >= 0 ? Math.abs(pointA.Longitude) + '°E' : Math.abs(pointA.Longitude) + '°W';
            Obj["text"] = pointA.Title + "<br>" + lat_unit + " , " + lon_unit + "<br>" + pointA.Country + "<br>";
            Obj["latitude"] = pointA.Latitude;
            Obj["longitude"] = pointA.Longitude;
            Obj["country"] = pointA.Country;
            SC.network.push(Obj);
            Obj = {};

            items.forEach(function (pointB) {
                positionB = [];
                positionB.push(pointB.Longitude, pointB.Latitude);

                distance = d3.geo.distance(positionA, positionB) * distance_Multiplier;
                matrix[pointA.No - 1].push(distance);
            })

            //---added by UnixC begin, counting project number for one country---//
            var pointA_Country = pointA.Country;

            // ZW: count starts from 0
            var collaborator_no_count = 0;
            items.forEach(function (pointB) {
                if (pointA_Country == pointB.Country) {
                    collaborator_no_count = collaborator_no_count + 1;
                }
            });
            Obj["Number"] = collaborator_no_count;
            //---added by UnixC end---//
        });

        SC.network_matrix = matrix;
    });

    //produce staff distance matrix
    SC.staffNo = 0;

    d3.csv("data/fcl/3. Academic staff.csv", function (err, items) {
        var positionA = [];
        var positionB = [];
        var matrix = [];
        var distance;
        var distance_Multiplier = 1000; // km to m??
        var Obj = {};
        var lon_unit;
        var lat_unit;

        items.forEach(function (pointA) {
            positionA = [];
            positionA.push(pointA.Longitude, pointA.Latitude);
            matrix.push([]);
            SC.staffNo++;
            Obj["index"] = pointA.No;
            Obj["name"] = pointA.Nationality;
            lat_unit = Number(pointA.Latitude) >= 0 ? Math.abs(pointA.Latitude) + '°N' : Math.abs(pointA.Latitude) + '°S';
            lon_unit = Number(pointA.Longitude) >= 0 ? Math.abs(pointA.Longitude) + '°E' : Math.abs(pointA.Longitude) + '°W';
            Obj["text"] = lat_unit + " , " + lon_unit;
            Obj["latitude"] = pointA.Latitude;
            Obj["longitude"] = pointA.Longitude;
            Obj["country"] = pointA.Nationality;
            SC.staff.push(Obj);
            Obj = {};

            items.forEach(function (pointB) {
                positionB = [];
                positionB.push(pointB.Longitude, pointB.Latitude);

                distance = d3.geo.distance(positionA, positionB) * distance_Multiplier;
                matrix[pointA.No - 1].push(distance);
            })

            //---added by UnixC begin, counting project number for one country---//
            var pointA_Country = pointA.Country;

            // ZW: count starts from 0
            var staff_no_count = 0;
            items.forEach(function (pointB) {
                if (pointA_Country == pointB.Country) {
                    staff_no_count = staff_no_count + 1;
                }
            });
            Obj["Number"] = staff_no_count;
            //---added by UnixC end---//
        });

        SC.staff_matrix = matrix;

        console.log("generate all distance matrix!");
    });


}

/*calculate distance between any two partner locations*/
function draw_networkLayer() {
    var tier1_scale = 2;
    var tier2_scale = 2.5;
    var tier3_scale = 3;
    var tier4_scale = 3.5;
    var tier_range = 100;
    var scale = 2;

    var s = zoom.scale();

    if (s >= tier4_scale) {
        tier_range = 3;
        scale = tier4_scale;
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
    find_last_tier(tier_range, scale, 'network_layer'); // draw tier1

    d3.selectAll(".point")
        .style("stroke-width", 0.5 / s + 'px')
        .attr("r", function (d) {
            return Math.sqrt(area_unit * d["area"] / Math.PI) / s;
        });

    d3.selectAll(".cluster")
        .style("stroke-width", 0.5 / s + 'px')
        .attr("r", function (d) {
            return Math.sqrt(area_unit * d["area"] / Math.PI) / s;
        });
}


/*calculate distance between any two staff country
 Nationality,Based,Latitude,Longitude*/
function draw_staffLayer() {
    var tier1_scale = 2;
    var tier2_scale = 2.5;
    var tier3_scale = 3;
    var tier4_scale = 3.5;
    var tier_range = 100;
    var scale = 2;

    var s = zoom.scale();

    if (s >= tier4_scale) {
        tier_range = 3;
        scale = tier4_scale;
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
    find_last_tier(tier_range, scale, 'staff_layer'); // draw tier1

    d3.selectAll(".point")
        .style("stroke-width", 0.5 / s + 'px')
        .attr("r", function (d) {
            return Math.sqrt(area_unit * d["area"] / Math.PI) / s;
        });

    d3.selectAll(".cluster")
        .style("stroke-width", 0.5 / s + 'px')
        .attr("r", function (d) {
            return Math.sqrt(area_unit * d["area"] / Math.PI) / s;
        });
}


var fcl_tooltip_list = [];
var area_unit = 200;
//function to add points and text to the map (used in plotting capitals)
function add_point(color, lat, lon, title, text, area, imgNo, scale, layer_name, country, project_number) {
    if (area == undefined) area = 1;
    if (imgNo == undefined) imgNo = 0;

    var country_str = country.replace(/ /g, '');//remove all blank spaces
    var country_filename = country_str.toLowerCase();
    var gpoint = g.append("g").attr("class", "items " + layer_name);
    var point = projection([lon, lat]);
    var point_x = point[0];
    var point_y = point[1];

    var img_src = [];

    switch (layer_name) {
        case 'project_layer':
        case 'staff_layer':
            img_src = "img/national_flag/" + country_filename + ".png";
            // img_src = "img/project_img/" + imgNo + "_fcl_vis.jpg";
            break;
        case 'network_layer':
            img_src = "img/network_img/" + imgNo + "_network.png";
            break;
        default:
            // img_src = "img/project_img/"+imgNo+"_fcl_vis.jpg";
            img_src = "img/national_flag/" + country_filename + ".png";
            break;
    }
    //add in picture for the project
    var country_or_network_logo_img = new Image();
    country_or_network_logo_img.src = img_src;

    gpoint.selectAll("circle")
        .data([{"area": area}])
        .enter()
        .append("svg:circle")
        .style("stroke", "#000")
        .style("stroke-width", "0.5px")
        .attr("cx", point_x)
        .attr("cy", point_y)
        .attr("class", "point")
        .style("fill", color//function () {return color_scheme[color_status];}
        ).style("opacity", 0.60)
        .attr("r", function (d) {
            return Math.sqrt(d["area"] * area_unit / Math.PI) / scale;
        })
        .on("mouseover", function () {
            var left = zoom.translate()[0];
            var top = zoom.translate()[1];
            var scale = zoom.scale();

            /*add in picture for the project
             var project_img = new Image();
             project_img.src = "img/project_img/"+imgNo+"_fcl_vis.jpg";*/

            showFCLInfoTooltip(layer_name, point_x, point_y, left, top, scale, country, country_or_network_logo_img, project_number);
        })
        .on("mouseout", function () {
            // return cluster_tooltip.attr("style","visibility: hidden");
        })
        .on("click", function () {
            var left = zoom.translate()[0];
            var top = zoom.translate()[1];
            var scale = zoom.scale();

            showFCLInfoTooltip(layer_name, point_x, point_y, left, top, scale, country, country_or_network_logo_img, project_number);
        });
}


//function to add clusters of projects
function add_zoomable_cluster(color, lat, lon, title, text, area, scale, clusterObj, className, country) {
    if (area == undefined) area = 2;

    var gpoint = g.append("g").attr("class", "items " + className);
    var point_x = projection([lon, lat])[0];
    var point_y = projection([lon, lat])[1];

    gpoint.selectAll("circle")
        .data([clusterObj])
        .enter()
        .append("svg:circle")
        .attr("cx", point_x)
        .attr("cy", point_y)
        .attr("class", "cluster")
        .style("stroke", "#000")
        .style("stroke-width", '0.5px')
        .style("fill", color//function () {return color_scheme[color_status];}
        ).style("opacity", 0.60)
        .attr("r", function (d) {
            return Math.sqrt(d["area"] * area_unit / Math.PI) / scale;
        })
        .on("mouseover", function () {
            var left = zoom.translate()[0];
            var top = zoom.translate()[1];
            var sc = zoom.scale();

            // ZW: no cluster tooltip, i.e., Number: xxx

            // cluster_tooltip.attr("style", "right:" + (innerWidth - x * sc - left) + "px;bottom:" + (innerHeight - y * sc - top) + "px;visibility: visible")
            //     .html("<div id='tooltip_holder'>" +
            //         "<div id='tooltip_text'>" + text + "</div></div>");

            // showFCLInfoTooltip(point_x, point_y, left, top, scale, country, project_img, project_number);
        })
        .on("mouseout", function () {
            return cluster_tooltip.attr("style", "visibility: hidden");
        })
        .on("click", function () {
            var shift_x = innerWidth / 2 - projection([lon, lat])[0] * scale;
            var shift_y = innerHeight / 2 - projection([lon, lat])[1] * scale;
            move([shift_x, shift_y], scale);

            var left = zoom.translate()[0];
            var top = zoom.translate()[1];
            var scale = zoom.scale();

            // showFCLInfoTooltip(point_x, point_y, left, top, scale, country, project_img, project_number);

            // ZW: no zoomable circles

            // cluster_tooltip.attr("style", "right:" + (innerWidth - x * sc - left) + "px;bottom:" + (innerHeight - y * sc - top) + "px;visibility: visible");
            //
            // //this.attr("style", "visibility: hidden");
            // draw_circles(clusterObj, className);
        });
}

/*for the last tier, to create tree-structure zoomable circles for projects with same 
 or very close coordinates*/
function find_last_tier(tier_range, scale, className) {
    var max_No;
    var items;
    var matrix;
    var color;
    switch (className) {
        case 'project_layer':
            clear_allProject_Circles();
            matrix = SC.project_matrix;
            max_No = SC.projectNo;
            items = SC.projects;
            color = 'yellow';
            break;
        case 'network_layer':
            clear_allNetwork();
            matrix = SC.network_matrix;
            max_No = SC.networkNo;
            items = SC.network;
            color = 'blue';
            break;
        case 'staff_layer':
            clear_allStaff();
            matrix = SC.staff_matrix;
            max_No = SC.staffNo;
            items = SC.staff;
            color = 'pink';
            break;
        default:
            break;
    }

    var tier_status = [];// 1 indicates the corresponding project is included in tier1 already
    var check_status = []; //1 indicates checked alr for neighbours
    var stack = [];
    var neighbours = [];
    var value;


    //to create a neighbour matrix holding neighbours to each project
    for (var index = 0; index < max_No; index++) {

        neighbours.push([]);
        for (var i = 0; i < max_No; i++) {
            value = matrix[index][i];
            if (value <= tier_range && index != i) { //index != i  to avoid same project distance
                neighbours[index].push(i);
            }
        }
    }

    //to classify projects into cluster
    for (var j = 0; j < max_No; j++) {
        tier_status.push(0);
        check_status.push(0);

    }

    var first_ofstack;
    var stack_length = 0;
    var neighbour_length;
    var neighbour_No;
    var looptime = 0;
    var clusterIndex = 1;
    var clusterNumber = [];
    var cluster_aver_lat = [];
    var cluster_aver_lon = [];

    clusterNumber.push(0, 0);
    cluster_aver_lat.push(0);
    cluster_aver_lon.push(0);

    for (index = 0; index < max_No; index++) {
        if (check_status[index] == 0) {
            if (looptime > 1) {
                clusterIndex++;
                clusterNumber.push(0);
                cluster_aver_lat.push(0);
                cluster_aver_lon.push(0);
            }
            looptime = 0;
            stack.push(index);
            stack_length++;

            while (stack_length > 0) {
                looptime++;
                first_ofstack = stack.shift();
                stack_length--;

                if (check_status[first_ofstack] == 0) {
                    check_status[first_ofstack] = 1;
                    neighbour_length = neighbours[first_ofstack].length;

                    if (neighbour_length > 0) {
                        if (tier_status[first_ofstack] == 0) {
                            tier_status[first_ofstack] = clusterIndex;
                            clusterNumber[clusterIndex]++;
                        }

                        for (i = 0; i < neighbour_length; i++) {
                            neighbour_No = neighbours[first_ofstack][i];
                            stack.push(neighbour_No);
                            stack_length++;
                            if (tier_status[first_ofstack] == 0) {
                                tier_status[neighbour_No] = clusterIndex;
                                clusterNumber[clusterIndex]++;
                            }
                        }

                    }
                }

            }

        }

    }
    clusterNumber.pop();

    var clusters = [];

    var item;

    for (i = 0; i < clusterNumber.length; i++) {
        clusters.push([]);

    }

    //sort items in tier1_status according to cluster number, clusters[0] collects all items with no cluster
    for (i = 0; i < max_No; i++) {
        index = tier_status[i];
        clusters[index].push(i + 1); //represents actual item numbers, from 1 to 55
        item = items[i];
        cluster_aver_lat[index] += Number(item["latitude"]);
        cluster_aver_lon[index] += Number(item["longitude"]);
    }


    //add in cluster objects
    var area;
    var name;
    var text;
    var clusterSort = [];
    var clusterObj = {};
    var itemObj = {};

    for (i = 1; i < clusterNumber.length; i++) {
        area = clusterNumber[i];
        cluster_aver_lat[i] = cluster_aver_lat[i] / area;
        cluster_aver_lon[i] = cluster_aver_lon[i] / area;

        clusterSort.push([i, area]);
    }
    clusterSort.sort(function (a, b) {
        return b[1] - a[1];
    });

    //draw clusters, clusterIndex start from 1
    setup_circles(className);

    for (i = 0; i < clusterSort.length; i++) {
        clusterIndex = clusterSort[i][0];
        area = clusterSort[i][1];
        name = "Cluster " + clusterIndex;
        text = "Number : " + area;
        clusterObj["name"] = name;
        clusterObj["text"] = text;
        clusterObj["longitude"] = cluster_aver_lon[clusterIndex];
        clusterObj["latitude"] = cluster_aver_lat[clusterIndex];
        clusterObj["area"] = area;
        clusterObj["children"] = [];

        //add in children for each cluster object
        for (j = 0; j < clusters[clusterIndex].length; j++) {

            itemIndex = clusters[clusterIndex][j] - 1;
            item = items[itemIndex];
            itemObj["name"] = item["name"];
            itemObj["itemIndex"] = itemIndex + 1;
            itemObj["text"] = item["text"];
            itemObj["longitude"] = item["longitude"];
            itemObj["latitude"] = item["latitude"];
            itemObj["size"] = 1;
            clusterObj["children"].push(itemObj);
            itemObj = {};
        }
        var lat = cluster_aver_lat[clusterIndex];
        var lon = cluster_aver_lon[clusterIndex];
        add_zoomable_cluster(color, lat, lon, name, text, area, scale, clusterObj, className);

        add_cluster_googleMap(color, lat, lon, text, clusterObj, className);// area
        //draw_circles(clusterObj);
        clusterObj = {};
    }

    //draw non-clustered items
    var length = clusters[0].length;
    var itemIndex;
    for (i = 0; i < length; i++) {
        itemIndex = clusters[0][i] - 1;
        item = items[itemIndex];
        var lat1 = item["latitude"];
        var lon1 = item["longitude"];
        var name1 = item["name"];
        var text1 = item["text"];
        var index1 = itemIndex + 1;
        var country = item["country"];
        var project_number = item["Number"];

        // add_point(color,lat1,lon1,name1,text1,1,index1,scale,className);
        // add_point_googleMap(color, lat1, lon1,name1,text1,index1,className);

        // function add_point(color, lat, lon, title, text, area, imgNo, scale, className, country, project_number) {
        add_point(color, lat1, lon1, name1, text1, 1, index1, scale, className, country, project_number);
        add_point_googleMap(color, lat1, lon1, name1, text1, index1, className, country);
    }
}

var diameter;
var node, circle, focus, view, text; //svg
var cg_g;

var cg;

//to setup for draw_Circles at the first use
function setup_circles(className) {

    cg = svg.append("g")
        .attr("class", className);
}

function showFCLInfoTooltip(layer_name, point_x, point_y, left, top, scale, country, country_image, number) {
    var description;

    switch (layer_name) {
        case 'project_layer':
            description = "Number of Projects:";
            break;

        case 'network_layer':
            description = "Number of Collaborators:";
            break;

        case 'staff_layer':
            description = "Number of Researchers:";
            break;
    }

    about_fcl_tooltip_country
        .attr("style", "left:" + (point_x * scale + left) + "px;bottom:" + (innerHeight - point_y * scale - top + 80) + "px;visibility: visible;")
        .attr("id", "about_fcl_tooltip_country")
        .html("<div class='tooltip_holder'><div class='tooltip_text'>" + country + "</div>" +
            "<div class='pic_holder Centerer'><img class='tooltip_pic Centered' src='" + country_image.src + "' onerror='imgErr(this)'> </div>" +
            "</div>" + ""
        );

    d3.select("#about_fcl_tooltip_connect_line").remove();

    about_fcl_tooltip_connect_line = d3.select("#svg1").append("line")
        .style("stroke", "#000000")
        .attr("id", "about_fcl_tooltip_connect_line")
        .style("stroke-width", "2px")
        .style("zIndex", "99")
        .attr("x1", point_x * scale + left + 1)
        .attr("y1", point_y * scale + top)
        .attr("x2", point_x * scale + left + 1)
        .attr("y2", point_y * scale + top - 80);

    var about_fcl_tooltip_country_width = document.getElementById("about_fcl_tooltip_country").offsetWidth;
    var tooltip_2_x = (point_x * scale + left) + about_fcl_tooltip_country_width + 50;

    about_fcl_tooltip_info.attr("style", "left:" + tooltip_2_x + "px;bottom:" + (innerHeight - point_y * scale - top + 80) + "px;visibility: visible;")
        .attr("id", "about_fcl_tooltip_info")
        .html("<div class='tooltip_holder'>" +
            "<div class='tooltip_text'>" + description + "</div>" +
            "<div class='pic_holder Centerer'><img class='tooltip_pic_logo Centered' src='" + "img/national_flag/project.png" + "' onerror='imgErr(this)'>" + "         " + number + "</div>" +
            "</div>"
        );
}

// @deprecated: add in picture for the project
function showFCLProjectImage() {
    // var project_img = new Image();
    // project_img.src = "img/project_img/"+imgNo+"_fcl_vis.jpg";
//
// return cluster_tooltip.attr("style", "right:" + (innerWidth-x*sc-left)+ "px;bottom:" +(innerHeight-y*sc-top)+ "px;visibility: visible;backgroundColor:#666666;color:#ffffff;overflow:hidden;")
//     .html("<div class='tooltip_holder' ><div class='tooltip_text'><b>" + country + "</b></div>"+
//         "<div class='pic_holder Centerer'><img class='tooltip_pic Centered' src='"+project_img.src+"' onerror='imgErr(this)'> </div>" +
//         "</div>");
//
//cluster_tooltip.style("visibility","hidden");
// var shift_x =   innerWidth/2 - projection([lon,lat])[0] *scale ;
// var shift_y = innerHeight/2 - projection([lon,lat])[1] *scale;
// var t = [shift_x,shift_y];
// move(t,scale);
//
// var name = className+imgNo;
//
//  var filtered = fcl_tooltip_list.filter(function(f){
//     return f == name;
//  });
//
//  if(filtered.length<=0){
//      /*var positionObj = {};
//      positionObj["type"] ='singleton';
//      positionObj["x"] = x;
//      positionObj["y"] = y;    */
//
//      fcl_tooltip_list.push(name);
//
//      var left = zoom.translate()[0];
//     var top= zoom.translate()[1];
//
//
//     var the = fcl_tooltip
//             /*.selectAll("div")
//             .data([positionObj])
//             .enter()         */
//             .append("div")
//             .attr("class","tooltip "+className)
//             .attr("style", "right:" + (innerWidth-x*scale-left)+ "px;bottom:" +(innerHeight - y*scale-top)+ "px;visibility: visible")
//             .html("<div class='tooltip_holder'><div class='pic_holder Centerer'><img class='tooltip_pic Centered' src='"+project_img.src+"' onerror='imgErr(this)'></div>" +
//                      "<div class='tooltip_text'><b>" + title + "</b><p>" + text + "</div></div>")
//             .on("click",function () {
//                 this.remove();
//                 var index = fcl_tooltip_list.indexOf(name);
//
//
//                 if(index != -1) {
//                     fcl_tooltip_list.splice(index, 1);
//                  }
//              });//<a href="javascript:void(0)" class="closebtn" onclick="close('+country_name+')" style="border-bottom:0px solid red;">&times;</a>
//
//
//         var width =the.node().getBoundingClientRect().width;
//         var height =the.node().getBoundingClientRect().height;
//         var area = width *height;
//
//         if(width>300){
//             height = area/300;
//             if(height>300){
//             the.attr("style", "right:" + (innerWidth-x*scale-left)+ "px;bottom:" +(innerHeight-y*scale-top)+ "px;visibility: visible;width:300px;height:300px")
//          }else{
//              the.attr("style", "right:" + (innerWidth-x*scale-left)+ "px;bottom:" +(innerHeight-y*scale-top)+ "px;visibility: visible;width:300px");
//         }
//         }
}

// @deprecated:
function zoom_Circles(d) {
    focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function (d) {
            var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
            return function (t) {
                zoomTo(i(t));
            };
        });

    transition.selectAll("text")
        .filter(function (d) {
            return d.parent === focus || this.style.display === "inline";
        })
        .style("fill-opacity", function (d) {
            return d.parent === focus ? 1 : 0;
        })
        .each("start", function (d) {
            if (d.parent === focus) this.style.display = "inline";
        })
        .each("end", function (d) {
            if (d.parent !== focus) this.style.display = "none";
        });
}

// @deprecated: implement each cluster drawing to zoomable circles
function draw_circles(root, className) {
    var color = d3.scale.linear()
        .domain([-1, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);

    diameter = Math.sqrt(root["area"] * area_unit / (Math.PI)) / zoom.scale() * 2;
    var pack = d3.layout.pack()
        .padding(2)
        .size([diameter, diameter])
        .value(function (d) {
            return d.size;
        });


    var root_x = projection([root["longitude"], root["latitude"]])[0];
    var root_y = projection([root["longitude"], root["latitude"]])[1];

    cg_g = cg.append("g")
        .attr("class", "items zoomable")
        .attr("transform", "translate(" + root_x + "," + root_y + ")")  //2
        .attr("style", "border: 1px solid #d0d0d0;");

    focus = root;
    var nodes = pack.nodes(root);


    circle = cg_g.selectAll("circle")  //svg
        .data(nodes)
        .enter()
        .append("svg:circle")
        .attr("class", function (d) {
            var res = d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
            return res;
        })
        .style("fill", function (d) {
            var res = d.children ? color(d.depth) : null;

            return res;
        })
        .style("fill-opacity", 0.9)
        .on("mouseover", function (d) {

            var left = zoom.translate()[0];
            var top = zoom.translate()[1];
            var scale = zoom.scale();

            if (d.parent == undefined) { //root
                return null;
            } else {

                var k = diameter / (root.r * 2);
                var left_adjust = (d.x - root.x) * k * scale;
                var bottom_adjust = (d.y - root.y) * k * scale;

                var img_src;

                switch (className) {
                    case 'pop_layer':
                        img_src = "img/project_img/" + d["itemIndex"] + "_fcl_vis.jpg";
                        break;
                    case 'network_layer':
                        img_src = "img/network_img/" + d["itemIndex"] + "_network.png";
                        break;
                    default:
                        img_src = "img/project_img/0_fcl_vis.jpg";
                        break;
                }
                //add in picture for the project
                var item_img = new Image();
                item_img.src = img_src;

                cluster_tooltip.attr("style", "visibility:visible;right:" + (innerWidth - root_x * scale - left - left_adjust) + "px;bottom:" + (innerHeight - root_y * scale - top - bottom_adjust) + "px")
                    .html("<div class='tooltip_holder' ><span  class='Centerer pic_holder' ><img class='Centered tooltip_pic' src='" + item_img.src + "' onerror='imgErr(this)'></span>" +
                        "<div class='tooltip_text'><b>" + d["name"] + "</b></div></div>");


                var width = cluster_tooltip.node().getBoundingClientRect().width;
                var height = cluster_tooltip.node().getBoundingClientRect().height;
                var area = width * height;

                if (width > 300) {
                    height = area / 300;
                    if (height > 300) {
                        cluster_tooltip.attr("style", "right:" + (innerWidth - root_x * scale - left - left_adjust) + "px;bottom:" + (innerHeight - root_y * scale - top - bottom_adjust) + "px;visibility: visible;width:300px;height:300px")
                    } else {
                        cluster_tooltip.attr("style", "right:" + (innerWidth - root_x * scale - left - left_adjust) + "px;bottom:" + (innerHeight - root_y * scale - top - bottom_adjust) + "px;visibility: visible;width:300px");
                    }
                }
            }

        })
        .on("mouseout", function (d, i) {
            return cluster_tooltip.attr("style", "visibility: hidden;opacity:0;transition: opacity 1s;");
        })
        .on("click", function (d) {

            if (d.parent == undefined) {
                cg_g.remove();
            } else {

                cluster_tooltip.style("visibility", "hidden");
                var name = d["name"];
                var projectNo = d["itemIndex"];

                var filtered = fcl_tooltip_list.filter(function (f) {
                    return f == projectNo;
                });

                if (filtered.length <= 0) {
                    fcl_tooltip_list.push(projectNo);

                    var left = zoom.translate()[0];
                    var top = zoom.translate()[1];
                    var sc = zoom.scale();

                    var k = diameter / (root.r * 2);
                    var left_adjust = (d.x - root.x) * k * sc;
                    var bottom_adjust = (d.y - root.y) * k * sc;

                    var img_src;
                    switch (className) {
                        case 'pop_layer':
                            img_src = "img/project_img/" + d["itemIndex"] + "_fcl_vis.jpg";
                            break;
                        case 'network_layer':
                            img_src = "img/network_img/" + d["itemIndex"] + "_network.png";
                            break;
                        default:
                            img_src = "img/project_img/0_fcl_vis.jpg";
                            break;
                    }
                    //add in picture for the project
                    var item_img = new Image();
                    item_img.src = img_src;


                    var the = fcl_tooltip
                    /*.selectAll("div")
                     .data([positionObj])
                     .enter()  */
                        .append("div")
                        .attr("class", "tooltip " + className)
                        .attr("style", "right:" + (innerWidth - root_x * sc - left - left_adjust) + "px;bottom:" + (innerHeight - root_y * sc - top - bottom_adjust) + "px;visibility: visible")
                        .html("<div class='tooltip_holder' style='vertical-align: middle'><div class='pic_holder Centerer'><img class='tooltip_pic Centered' src='" + item_img.src + "' onerror='imgErr(this)'></div>" +
                            "<div class='tooltip_text'><b>" + d["name"] + "</b><br><br><p>" + d["text"] + "</div></div>")
                        .on("mouseover", function () {
                            d3.select(this).moveToFront();

                        }).on("click", function () {
                            this.remove();
                            var index = fcl_tooltip_list.indexOf(projectNo);


                            if (index != -1) {
                                fcl_tooltip_list.splice(index, 1);
                            }
                        });//<a href="javascript:void(0)" class="closebtn" onclick="close('+country_name+')" style="border-bottom:0px solid red;">&times;</a>


                    var width = the.node().getBoundingClientRect().width;
                    var height = the.node().getBoundingClientRect().height;
                    var area = width * height;

                    if (width > 300) {
                        height = area / 300;
                        if (height > 300) {
                            the.attr("style", "right:" + (innerWidth - root_x * sc - left - left_adjust) + "px;bottom:" + (innerHeight - root_y * sc - top - bottom_adjust) + "px;visibility: visible;width:300px;height:300px");

                        } else {
                            the.attr("style", "right:" + (innerWidth - root_x * sc - left - left_adjust) + "px;bottom:" + (innerHeight - root_y * sc - top - bottom_adjust) + "px;visibility: visible;width:300px");
                        }
                    }


                }
            }

        });


    text = cg_g.selectAll("text")
        .data(nodes[0])
        .enter().append("text")
        .attr("class", "project_clustering_label")
        .style("fill-opacity", function (d) {
            return d.parent === root ? 0.8 : 0;
        })
        .style("display", function (d) {
            return d.parent === undefined ? "inline" : "none"; //root
        })
        .text(function (d) {
            return d.name;
        });

    /* cg_g
     .on("click", function () {
     zoom_Circles(root);
     });*/


    node = cg_g.selectAll("circle ,text");//

    zoomTo([root.x, root.y, root.r * 2]);

    //d3.select(self.frameElement).style("height", diameter + "px");
}

function zoomTo(v) {
    var k = diameter / v[2]; //v[0] is root.x, v[1] is root.y, v[2] is root.r, k is actual_diameter/root.r
    view = v;
    node.attr("transform", function (d) {
        return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
    });
    circle.attr("r", function (d) {
        return d.r * k;
    });
}