/**
 * Created by yuhao on 27/6/16.
 */

var gmap;
var googlem_holder;
var center;
function initMap() {
    load_google_map();
    //googlem_holder.style("visibility","hidden");

    // Create an array of styles.
    var styles = [

        {
            featureType: "water",
            elementType: "geometry",
            stylers: [
                {color: "#bcbcbc"},
                {lightness: 40}
            ]
        },
        {
            featureType: "landscape",
            elementType: "geometry.fill",
            stylers: [
                {"color": "#ffffff"},
                {"lightness": 40}
            ]
        },
        {
            featureType: "landscape.man_made",
            elementType: "geometry.stroke",
            stylers: [
                {"color": "#000000"},
                {"lightness": 40}
            ]
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [
                {lightness: 71},
                {saturation: -100},
                {color: "#B3B6B7"},
                {visibility: "off"}//"simplified"
            ]
        }
    ];

    // Create a new StyledMapType object, passing it the array of styles,
    // as well as the name to be displayed on the map type control.
    var styledMap = new google.maps.StyledMapType(styles,
        {name: "Styled Map"});

    center = new google.maps.LatLng(42.313, 0);

    // Create a map object, and include the MapTypeId to add
    // to the map type control.
    var mapOptions = {
        zoom: 12,
        center: center,//55.6468, 37.581
        mapTypeControl: false,
        streetViewControl: false,
        /* mapTypeControlOptions: {
         mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
         }*/
    };

    var g_map = document.getElementById('googlem_holder');

    gmap = new google.maps.Map(g_map, mapOptions);

    //Associate the styled map with the MapTypeId and set it to display.
    gmap.mapTypes.set('map_style', styledMap);
    gmap.setMapTypeId('map_style');

    google.maps.event.addListener(gmap, 'zoom_changed', function () {
        //if(network_layer|staff_layer){

        // clear_allCircles();
        // var s = gmap.getZoom() - 1;
        // zoom.scale(s); //update the zoom level in base map
        //
        // var tier1_scale = 2;
        // var tier2_scale = 2.5;
        // var tier3_scale = 3;
        // var tier4_scale = 3.5;
        // var google_map_scale = 4;
        // var tier_range = 100;
        // var scale = 2;
        //
        // if (s >= tier4_scale) {
        //     /*if(project_layer&&callcount>0){
        //      callcount=0;
        //      d3.select("#google_map").remove();
        //      }*/
        //     tier_range = 3;
        //     scale = tier4_scale;
        //     svg.selectAll(".items").remove();
        //     if (project_layer)generate_clusters('project_layer');
        //     if (network_layer)generate_clusters('network_layer');
        //     if (staff_layer)generate_clusters('staff_layer');
        //
        // } else if (s >= tier3_scale) {
        //     tier_range = 5;
        //     scale = tier3_scale;
        //     svg.selectAll(".items").remove();
        //     if (project_layer)generate_clusters(tier_range, scale, 'project_layer');
        //     if (network_layer)generate_clusters(tier_range, scale, 'network_layer');
        //     if (staff_layer)generate_clusters(tier_range, scale, 'staff_layer');
        //
        // } else if (s >= tier2_scale) {
        //     tier_range = 25;
        //     scale = tier2_scale;
        //     svg.selectAll(".items").remove();
        //     if (project_layer)generate_clusters(tier_range, scale, 'project_layer');
        //     if (network_layer)generate_clusters(tier_range, scale, 'network_layer');
        //     if (staff_layer)generate_clusters(tier_range, scale, 'staff_layer');
        // } else if (s >= tier1_scale) {
        //     tier_range = 50;
        //     scale = tier1_scale;
        //     svg.selectAll(".items").remove();
        //     if (project_layer)generate_clusters(tier_range, scale, 'project_layer');
        //     if (network_layer)generate_clusters(tier_range, scale, 'network_layer');
        //     if (staff_layer)generate_clusters(tier_range, scale, 'staff_layer');
        // } else {
        //     tier_range = 100;
        //     scale = 1;
        //     svg.selectAll(".items").remove();
        //     if (project_layer)generate_clusters(tier_range, scale, 'project_layer');
        //     if (network_layer)generate_clusters(tier_range, scale, 'network_layer');
        //     if (staff_layer)generate_clusters(tier_range, scale, 'staff_layer');
        // }
    });

    // restrict the appropriate region for users
    var initial_center = gmap.getCenter();
    console.log(initial_center.lng() + "  " + initial_center.lat());
    var lastValidCenter = initial_center;

    gmap.setOptions({minZoom: 3}, {maxZoom: 17});

    var pre_ne = new google.maps.LatLng(0, 0);
    google.maps.event.addListener(gmap, 'bounds_changed', function () {
        //console.log("real bound " + gmap.getBounds() + " center " + gmap.getCenter() + " zoom " + gmap.getZoom() + " viewport " + window.innerWidth + " " + window.innerHeight);

        var cur_scale = gmap.getZoom();
        if (cur_scale == 2) {
            gmap.panTo(initial_center);
            return;
        }

        var min_lat = -77, max_lat = 85;
        var min_lng = -180, max_lng = 180;

        var cur_bounds, cur_center, ne, sw;

        updateBound();

        if (sw.lat() < min_lat) {
            var lat_displacement = min_lat - sw.lat() + 1;
            var new_center = new google.maps.LatLng(cur_center.lat() + lat_displacement, cur_center.lng());
            gmap.panTo(new_center);
        }

        updateBound();
        if (ne.lat() > max_lat) {
            var lat_displacement = ne.lat() - max_lat + 1;
            var new_center = new google.maps.LatLng(cur_center.lat() - lat_displacement, cur_center.lng());
            gmap.panTo(new_center);
        }

        updateBound();
        var displacement = pre_ne.lng() - ne.lng(); //  180 > displacement > 0, move left;
                                                    // displacement < 0 or displacement > 180,  move right

        if (sw.lng() > 0 && sw.lng() > ne.lng() && displacement && displacement > 0 && displacement < 180) { // move left
            var lng_displacement = max_lng - sw.lng() + 1;
            var new_center = new google.maps.LatLng(cur_center.lat(), cur_center.lng() + lng_displacement);
            gmap.panTo(new_center);
        }

        updateBound();
        if (ne.lng() < 0 && sw.lng() > ne.lng()) {
            var lng_displacement = ne.lng() - min_lng + 1;

            var new_center = new google.maps.LatLng(cur_center.lat(), cur_center.lng() - lng_displacement);
            gmap.panTo(new_center);
        }

        pre_ne = ne;

        function updateBound(){
            cur_bounds = gmap.getBounds();
            cur_center = gmap.getCenter();

            ne = cur_bounds.getNorthEast();
            sw = cur_bounds.getSouthWest();
        }
    });

    // Define the LatLng coordinates for the polygon's path.
    var triangleCoords = [
        {lat: 1.3534, lng: 103.90}, //1.352083,103.819836
        {lat: 1.353083, lng: 103.93},
        {lat: 1.339083, lng: 103.90},
        {lat: 1.3534, lng: 103.90}
        /*{lat: 1.352083, lng: 103.82}, //1.352083,103.819836
         {lat: 1.352083, lng: 103.81},
         {lat: 1.342083, lng: 103.79},
         {lat: 1.352083, lng: 103.819836}*/
    ];

    var info = ['John', 'View Projects in Singapore'];
    var info_json;
    var markerPos = triangleCoords[0];
    //---draw a marker for zoom into Singapore---//

    d3.json("data/fcl/ProjectInformation.json", function (error, info_json_in) {
        info_json = info_json_in;//topojson.feature(info_json_in, );
        //console.log(info_json[0].contact);
        for (var i = 0; i < info_json.length; i++) {
            draw_project_description('#1E90FF', info_json[i]);
        }
    });
    draw_zoomin_singapore_marker({lat: 1.3521, lng: 103.8198});
    // draw_polygon(triangleCoords,markerPos,'#1E90FF',info);
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
// TODO: The icon should be on top of circles
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

var project_polygons = [];
var project_markers = [];
var project_infowindows = [];

function draw_zoomin_singapore_marker(markerPos) {
    var mouseover_String = "<div>" +
        "<b style='font-size:17px;'>" + "View Projects in Singapore" + "</b></div>";

    var infowindow_mouseover = new google.maps.InfoWindow({
        maxWidth: 300,
        content: mouseover_String
    });

    var defaultIcon = makeMarkerIcon('FFFF24');
    var highlightedIcon = makeMarkerIcon('E74C3C');

    var marker = new google.maps.Marker({
        position: markerPos,
        animation: google.maps.Animation.DROP,
        zIndex: 99,
        icon: defaultIcon,
        map: gmap,
        //title: 'The Info Window'
    });

    marker.addListener('click', function () {
        // console.log("gmap.setZoom(10);");
        gmap.setCenter({lat: 1.3521, lng: 103.8198});
        gmap.setZoom(12);
        infowindow_mouseover.setMap(null);
    });

    // marker.addListener("touchstart", function() {
    //     console.log("touch the marker!");
    // });

    // Dispatch/Trigger/Fire the event
    // document.dispatchEvent(event);

    marker.addListener('mouseover', function () {
        this.setIcon(highlightedIcon);
        infowindow_mouseover.open(gmap, marker);
    });


    marker.addListener('mouseout', function () {
        this.setIcon(defaultIcon);
        infowindow_mouseover.setMap(null);

    });

    project_markers.push(marker);
    project_infowindows.push(infowindow_mouseover);

}
function getTriangleCoords(polyinfo) {
    var polygon_array = polyinfo.split(",");
    var polygon_number = parseInt(polygon_array[0]);
    var polygon_point_number = parseInt(polygon_array[1]);
    var triangleCoords = [];
    for (var i = 0; i < polygon_point_number; i++) {
        var latlng = {
            lat: 0,
            lng: 0
        };
        latlng['lat'] = parseFloat(polygon_array[2 + i * 2]);
        latlng['lng'] = parseFloat(polygon_array[2 + i * 2 + 1]);
        triangleCoords.push(latlng);
    }
    return triangleCoords;
}
function draw_project_description(fillcolor, info) {
    // get polygon coords.
    triangleCoords = getTriangleCoords(info.polyinfo);

    // get marker position
    markerPos = triangleCoords[0];

    // construct polygon
    var bermudaTriangle = new google.maps.Polygon({
        paths: triangleCoords,
        strokeColor: fillcolor,
        strokeOpacity: 0.35,
        strokeWeight: 2,
        fillColor: fillcolor,
        fillOpacity: 0.35
    });
    bermudaTriangle.setMap(gmap);

    //create text for click div
    var click_String = " <div class='project'><div class='project_text'>" +
        "<br><br> <b>Name:</b> <br>" + info.name +
        "<br><br> <b>Project:</b> <br>" + info.project.replace("\">", "\" target=\"_blank\">") +
        "<br><br> <b>Contact:</b> <br>" + info.contact.replace("\">", "\" target=\"_blank\">") +
        "<br><br> <b>Description :</b> <br>" + info.description +
        "</div>";

    // console.log(info.project);
    // console.log("replacement: "+ info.project.replace("\">", "\" target=\"_blank\">"));

    //create images for click div
    var img_array = info.files.split(",");
    if (info.files == undefined || info.files == '') {
        click_String = click_String + "</div>";
    } else {
        click_String = click_String + "<div class='project_img'>";
        for (var i = 0; i < img_array.length; i++) {
            var class_string = 'project_img' + String(i + 1);
            // removed "/" at the end of image. Not working on sever
            click_String = click_String +
                // "<div><img class='"+class_string+"' src="+img_array[i]+"></div>";
                "<img class='" + class_string + "' src=" + img_array[i] + ">";
            // "<img class='project_img1' src="+img_array[i]+"/>";
        }
        click_String = click_String +
            "</div></div>";
    }

    // var infowindow_click = new google.maps.InfoWindow({
    //
    //     maxHeight: 300,
    //     content: click_String
    // });

    var infowindow_click = new google.maps.InfoWindow({
        // maxWidth: 300,
        // maxHeight: 300,
        overflow: 'scroll',
        content: click_String
    });

    var defaultIcon = makeMarkerIcon('24FF24');
    var highlightedIcon = makeMarkerIcon('E74C3C');

    var marker = new google.maps.Marker({
        position: markerPos,
        animation: google.maps.Animation.DROP,
        zIndex: 50,
        icon: defaultIcon,
        map: gmap,
        //title: 'The Info Window'
    });

    // marker.myHtmlContent = contentString;
    // infowindow_click.setContent(marker.myHtmlContent);

    marker.addListener('click', function () {
        // infowindow_mouseover.setMap(null);
        infowindow_click.open(gmap, marker);
    });

    bermudaTriangle.addListener('click', function () {
        infowindow_mouseover.setMap(null);
        infowindow_click.open(gmap, marker);
    });

    bermudaTriangle.addListener('mouseover', function () {
        marker.setIcon(highlightedIcon);
        this.set("strokeColor", 'red');
        this.set("fillColor", 'red');
        infowindow_mouseover.open(gmap, marker);
    });
    bermudaTriangle.addListener('mouseout', function () {
        marker.setIcon(defaultIcon);
        this.set("strokeColor", fillcolor);
        this.set("fillColor", fillcolor);
        infowindow_mouseover.setMap(null);
    });
    bermudaTriangle.bindTo('strokeColor', marker, 'strokeColor');
    bermudaTriangle.setOptions({clickable: false});

    project_polygons.push(bermudaTriangle);
    project_markers.push(marker);
    project_infowindows.push(infowindow_click);
}

//destruct all polygons
function clear_allProject_Poly() {

    console.log("clear all!");
    project_polygons.forEach(function (m) {
        m.setMap(null);
    });

    project_markers.forEach(function (m) {
        m.setMap(null);
    });

    project_infowindows.forEach(function (m) {
        m.setMap(null);
    });
}


function load_google_map() {
    d3.select("#content_holder").append("div").attr("id", "googlem_holder")
        .style("visibility", "hidden");
    document.getElementById("googlem_holder").style.width = innerWidth + "px";
    document.getElementById("googlem_holder").style.height = innerHeight + "px";

    var toggle_switchHolder = document.createElement('div');
    toggle_switchHolder.id = "toggle_GM";

    var text = document.createElement('div');
    text.className = 'text_box';
    text.innerHTML = 'GOOGLE MAP';

    var input = document.createElement('input');
    input.id = 'googlem_switch';
    input.type = 'checkbox';
    input.className = 'switch-input';
    input.onchange = function () {
        handle_switch()
    };

    var toggle_slider = document.createElement('div');
    toggle_slider.className = 'toggle_slider';


    var label = document.createElement('label');
    label.className = 'toggle_switch';

    label.appendChild(input);
    label.appendChild(toggle_slider);
    toggle_switchHolder.appendChild(text);
    toggle_switchHolder.appendChild(label);

    //document.getElementById("googlem_holder").appendChild(text);
    document.getElementById("content_holder").appendChild(toggle_switchHolder);
    //end of toggle switch
}

function close_GoogleMap() {
    if (!pop_layer && !co2_layer && !gdp_layer)
        document.getElementById('pop_densityBtn').click();

    var center = gmap.getCenter(); // map to (window.innerWidth / 2, window.innnerHeight / 2);
    var sw = gmap.getBounds().getSouthWest(); // map to (0, window.innerHeight)

    var center_proj = projection([center.lng(), center.lat()]);
    var sw_proj = projection([sw.lng(), sw.lat()]);

    var scale = window.innerWidth / 2 / (center_proj[0] - sw_proj[0]);

    // if scale larger than maximum scale in world map,
    // set scale to the maximum zoom - 1, and translate to the current center
    if (scale > world_map_max_zoom){
        scale = world_map_max_zoom - 1;
    }

    var translate_x = window.innerWidth / 2 - center_proj[0] * scale;
    var translate_y = window.innerHeight / 2 - center_proj[1] * scale;

    var t = [translate_x, translate_y];

    move(t, scale);

    d3.select("#googlem_holder").style("visibility", "hidden");
}

function open_GoogleMap() {
    if (pop_layer)
        document.getElementById('pop_densityBtn').click();

    if (co2_layer)
        document.getElementById('co2_emissionBtn').click();

    if (gdp_layer)
        document.getElementById('gdp_Btn').click();

    d3.select("#googlem_holder").style("visibility", "visible");
    removeAll_fcl_tooltips();

    //adjust the map to be return
    var zoomlvl = zoom.scale();

    var map_center = lnglat_pos(window.innerWidth / 2, window.innerHeight / 2);
    var c = new google.maps.LatLng(map_center[1], map_center[0]);
    gmap.panTo(c);

    if (zoomlvl < 3.5)
        gmap.setZoom(parseInt(zoomlvl - 0.5) + 3);
    else if (zoomlvl < 5)
        gmap.setZoom(parseInt(zoomlvl - 0.5) + 2);
    else {
        var map_ws = lnglat_pos(0, window.innerHeight);
        var map_en = lnglat_pos(window.innerWidth, 0);

        var bound = new google.maps.LatLngBounds(
            new google.maps.LatLng(map_ws[1], map_ws[0]),
            new google.maps.LatLng(map_en[1], map_en[0]),
            false
        );

        gmap.fitBounds(bound);
    }
}

function handle_switch() {
    var input = document.getElementsByClassName('switch-input');

    var res = input[0].checked;

    if (res) {
        open_GoogleMap();
    } else {
        close_GoogleMap();
    }
}

function formatNum(num) {
    var format = d3.format(',.02f');

    return format(num);
}

var project_circles = [];
var project_circles_infowindows = [];
var network_circles = [];
var network_infowindows = [];
var staff_circles = [];
var staff_infowindows = [];

//new function to add clusters of projects
function add_zoomable_cluster_googleMap(color, lat, lon, name, text, area, scale, layer_name, country, project_number) {
    if (area == undefined) area = 2;

    var scale_unit = 15;
    var scale = Math.sqrt(area / Math.PI) * scale_unit;

    var latLng = new google.maps.LatLng(lat, lon);

    var marker = new google.maps.Marker({
        position: latLng,
        map: gmap,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillOpacity: 0.27,
            fillColor: color,
            strokeOpacity: 1.0,
            strokeColor: 'black',
            strokeWeight: 0.5,
            scale: scale //pixels
        }
    });

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
            img_src = "img/network_img/" + scale + "_network.png";
            break;
        default:
            // img_src = "img/project_img/"+imgNo+"_fcl_vis.jpg";
            img_src = "img/national_flag/" + country_filename + ".png";
            break;
    }
    //add in picture for the project
    var country_or_network_logo_img = new Image();
    country_or_network_logo_img.src = img_src;

    marker.addListener('click', function () {
        // gmap.panTo(latLng);
        showFCLInfoTooltip_on_googlemap(layer_name, lon, lat, country, country_or_network_logo_img, project_number);
    });

    switch (layer_name) {
        case 'project_layer':
            project_circles.push(marker);
            break;
        case 'network_layer':
            network_circles.push(marker);
            break;
        case 'staff_layer':
            staff_circles.push(marker);
            break;

        default:
            console.log("wrong " + className);
            break;
    }
}


var circles = [];
var circles_infowindow_mouseover = [];
var circles_infowindow_click = [];
//clear all circles
function clear_allCircles() {
    circles.forEach(function (m) {
        m.setMap(null);
    });
    circles = [];

    circles_infowindow_mouseover.forEach(function (m) {
        m.setMap(null);
    });
    circles_infowindow_mouseover = [];

    circles_infowindow_click.forEach(function (m) {
        m.setMap(null);
    });
    circles_infowindow_click = [];
}

//draw zoomable circles when clusters onclick
function draw_zoomableCircles_googleMap(scale, latLng, clusterObj, className) {

    clear_allCircles();
    var color = '#75dccd';

    var diameter = scale;

    var pack = d3.layout.pack()
        .padding(2)
        .size([diameter, diameter])
        .value(function (d) {
            return d.size;
        });


    var nodes = pack.nodes(clusterObj);


    //draw the root
    var holder = new google.maps.Marker({
        position: latLng,
        map: gmap,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillOpacity: 0.9,
            fillColor: color,
            strokeOpacity: 1.0,
            strokeColor: 'black',
            strokeWeight: 0.5,
            scale: scale //pixels
        }
    });

    circles.push(holder);

    holder.addListener('click', function () {//onclick clear all circles
        console.log("clear the circles!");
        circles.forEach(function (m) {
            m.setMap(null);
        });

        circles_infowindow_mouseover.forEach(function (m) {
            m.setMap(null);
        });

        circles_infowindow_click.forEach(function (m) {
            m.setMap(null);
        });

        circles = [];
        circles_infowindow_mouseover = [];
        circles_infowindow_click = [];

    });

    var root = nodes[0];
    //convert latLng to pixel coordinates


    var pixelCoordinate = gmap.getProjection().fromLatLngToPoint(latLng);

    var root_x = pixelCoordinate.x;
    var root_y = pixelCoordinate.y;


    var k = diameter / (root.r * 2);
    var translate_x;
    var translate_y;
    var node;
    var length = nodes.length;
    var s = gmap.getZoom();
    var t = 0.2 * s + 0.7;
    if (s >= 15)t = 0.2 * s + 0.5;

    var infowindows_mouseover = {};
    var infowindows_click = {};

    for (var i = 1; i < length; i++) {
        node = nodes[i];
        translate_x = (node.x - root.x) * k / Math.pow(s, t);
        translate_y = (node.y - root.y) * k / Math.pow(s, t);
        var pixel_x = root_x - translate_x;
        var pixel_y = root_y - translate_y;
        var point = new google.maps.Point(pixel_x, pixel_y);
        var coordinates = gmap.getProjection().fromPointToLatLng(point);
        var radius = node.r * k * 2;
        var zindex = google.maps.Marker.MAX_ZINDEX + 1;
        var marker1 = new google.maps.Marker({
            position: coordinates,//point,//
            map: gmap,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillOpacity: 0.2,
                fillColor: '#751aff',
                strokeOpacity: 0,
                strokeColor: 'black',
                strokeWeight: 1,
                scale: radius //pixels
            },
            zIndex: zindex
        });


        var img_src;
        switch (className) {
            case 'pop_layer':
                img_src = "img/project_img/" + node.itemIndex + "_fcl_vis.jpg";
                break;
            case 'network_layer':
                img_src = "img/network_img/" + node.itemIndex + "_network.png";
                break;
            default:
                img_src = "img/project_img/0_fcl_vis.jpg";
                break;
        }

        var project_img = new Image();
        project_img.src = img_src;
        console.log(img_src);

        var mouseover_String = " <div><div class='pic_holder Centerer'>" +
            "<img class='tooltip_pic' src='" + project_img.src + "'></div>" +
            "<div class='tooltip_text'><b style='font-size:17px;'>" + node.name + "</b>";

        var click_String = "<div class='tooltip_holder'><div class='pic_holder Centerer'><img class='tooltip_pic Centered' src='" + project_img.src + "' onerror='imgErr(this)'></div>" +
            "<div class='tooltip_text'><b>" + node.name + "</b><p>" + node.text + "</div></div>";


        var infowindow_mouseover = new google.maps.InfoWindow({
            content: mouseover_String,
            maxWidth: 300
            // position:latLng
        });

        var infowindow_click = new google.maps.InfoWindow({
            content: click_String,
            maxWidth: 300
            // position:latLng
        });


        marker1.myHtmlContent = node.itemIndex;

        infowindows_mouseover[node.itemIndex] = infowindow_mouseover;
        infowindows_click[node.itemIndex] = infowindow_click;

        marker1.addListener('mouseover', function () {
            this.set("strokeOpacity", 1);
            infowindows_mouseover[this.myHtmlContent].open(gmap, this);

        });

        marker1.addListener('click', function () {
            //gmap.panTo(latLng);

            // draw_circles(clusterObj,className)
            //console.log();
            infowindows_click[this.myHtmlContent].setContent(this.myHtmlContent);
            infowindows_mouseover[this.myHtmlContent].setMap(null);
            infowindows_click[this.myHtmlContent].open(gmap, this);
        });

        marker1.addListener('mouseout', function () {
            this.set("strokeOpacity", 0);
            infowindows_mouseover[this.myHtmlContent].setMap(null);
        });

        circles.push(marker1);
        circles_infowindow_click.push(infowindow_click);
        circles_infowindow_mouseover.push(infowindow_mouseover);

    }//end of for loop


}

// The mapping between latitude, longitude and pixels is defined by the web
// mercator projection.
function project(latLng) {

    var TILE_SIZE = 256;

    var siny = Math.sin(latLng.lat() * Math.PI / 180);

    // Truncating to 0.9999 effectively limits latitude to 89.189. This is
    // about a third of a tile past the edge of the world tile.
    siny = Math.min(Math.max(siny, -0.9999), 0.9999);

    return new google.maps.Point(
        TILE_SIZE * (0.5 + latLng.lng() / 360),
        TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)));
}


//function to add clusters of projects
//color,item["latitude"],item["longitude"],item["name"],item["text"],1,itemIndex+1,scale,className
// function add_point_googleMap(color, lat, lon, name, text, index, className, country) {
function add_point_googleMap(color, lat, lon, name, text, area, imgNo, scale, layer_name, country, project_number) {
    if (area == undefined) area = 1;
    if (imgNo == undefined) imgNo = 0;

    var country_str = country.replace(/ /g, '');//remove all blank spaces
    var country_filename = country_str.toLowerCase();
    // var gpoint = g.append("g").attr("class", "items " + layer_name);
    // var point = projection([lon, lat]);
    // var point_x = point[0];
    // var point_y = point[1];

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

    var latLng = new google.maps.LatLng(lat, lon);
    var marker = new google.maps.Marker({
        position: latLng,
        map: gmap,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillOpacity: 0.27,
            fillColor: color,
            strokeOpacity: 1.0,
            strokeColor: 'black',
            strokeWeight: 0.5,
            scale: scale + 4 //pixels
        }
    });

    marker.addListener('click', function () {
        this.set("strokeColor", 'red');
        showFCLInfoTooltip_on_googlemap(layer_name, lon, lat, country, country_or_network_logo_img, project_number);
        console.log("add_point_googleMap: onclick!!!");
    });

    switch (layer_name) {
        case 'project_layer':
            project_circles.push(marker);
            break;
        case 'network_layer':
            network_circles.push(marker);
            break;
        case 'staff_layer':
            staff_circles.push(marker);
            break;

        default:
            console.log("wrong layer in google map: " + className);
            break;
    }
}

function viewport_pos_googlemap(long, lat) {

    var center = gmap.getCenter();
    var sw = gmap.getBounds().getSouthWest();

    var center_proj = projection([center.lng(), center.lat()]);
    var sw_proj = projection([sw.lng(), sw.lat()]);

    var scale = window.innerWidth / 2 / (center_proj[0] - sw_proj[0]);

    var translate_x = window.innerWidth / 2 - center_proj[0] * scale;
    var translate_y = window.innerHeight / 2 - center_proj[1] * scale;

    var t = [translate_x, translate_y];

    var proj = projection([long, lat]);

    var viewport_x = proj[0] * scale + t[0];
    var viewport_y = proj[1] * scale + t[1];

    return [viewport_x, viewport_y];
}

function removeAll_fcl_tooltips() {
    var country = ["United Kingdom", "Netherlands", "Germany", "Norway", "Russian Federation", "China", "Japan", "United States", "France", "Hong Kong", "Philippines", "Malaysia", "Brazil", "South Africa", "United Arab Emirates", "Singapore", "Australia", "Indonesia", "India", "Bangladesh", "Viet Nam", "Thailand"];
    for (var i = 0; i < country.length; i++) {
        var tooltip_project_id = "about_fcl_tooltip_project_layer_" + country[i];
        var tooltip_network_id = "about_fcl_tooltip_network_layer_" + country[i];
        var tooltip_staff_id = "about_fcl_tooltip_staff_layer_" + country[i];
        var tooltip_project = document.getElementById(tooltip_project_id);
        var tooltip_network = document.getElementById(tooltip_network_id);
        var tooltip_staff = document.getElementById(tooltip_staff_id);
        if (tooltip_project != null) {
            tooltip_project.remove();
        }
        if (tooltip_network != null) {
            tooltip_network.remove();
        }
        if (tooltip_staff != null) {
            tooltip_staff.remove();
        }

        var tooltip_project_google_map_id = "about_fcl_tooltip_google_map_project_layer_" + country[i];
        var tooltip_network_google_map_id = "about_fcl_tooltip_google_map_network_layer_" + country[i];
        var tooltip_staff_google_map_id = "about_fcl_tooltip_google_map_staff_layer_" + country[i];
        var tooltip_project_google_map = document.getElementById(tooltip_project_google_map_id);
        var tooltip_network_google_map = document.getElementById(tooltip_network_google_map_id);
        var tooltip_staff_google_map = document.getElementById(tooltip_staff_google_map_id);
        if (tooltip_project_google_map != null) {
            tooltip_project_google_map.remove();
        }
        if (tooltip_network_google_map != null) {
            tooltip_network_google_map.remove();
        }
        if (tooltip_staff_google_map != null) {
            tooltip_staff_google_map.remove();
        }
    }
}

function showFCLInfoTooltip_on_googlemap(layer_name, long, lat, country, country_image, number) {
    console.log(country);
    var description;

    switch (layer_name) {
        case 'project_layer':
            description = "Num. of Projects:";
            break;

        case 'network_layer':
            description = "Num. of Collaborators:";
            break;

        case 'staff_layer':
            description = "Num. of Researchers:";
            break;
    }

    var viewport_position = viewport_pos_googlemap(long, lat);

    var about_fcl_tooltip_dynamic_id = "about_fcl_tooltip_google_map_" + layer_name + "_" + country;

    var find_tooltip = document.getElementById(about_fcl_tooltip_dynamic_id);
    if (find_tooltip != null) {
        find_tooltip.remove();
        return;
    }

    var about_fcl_tooltip = d3.select("#map_container").append("div")
        .attr("class", "about_fcl_tooltip_container")
        .attr("style", "fill: none").attr("id", about_fcl_tooltip_dynamic_id);

    //---national flag tooltip---//
    var y_displacement = 60;
    about_fcl_tooltip.append("div")
        .attr("id", about_fcl_tooltip_dynamic_id + "_country")
        .attr("class", "about_fcl_tooltip")
        .attr("style", "left:" + (viewport_position[0]) + "px;bottom:" + (window.innerHeight - viewport_position[1] + y_displacement) + "px;visibility: visible;")
        .attr("data-lng", long)
        .attr("data-lat", lat)
        .html(
            "<div class='tooltip_holder'>" +
            "<div class='tooltip_text'>" + country.toUpperCase() + "</div>" +
            "<div class='pic_holder Centered'><img class='tooltip_pic Centered' src='" + country_image.src + "' onerror='imgErr(this)'> </div>"
            + "</div>"
        );

    //---number tooltip---//
    var about_fcl_tooltip_country_width = document.getElementById(about_fcl_tooltip_dynamic_id + "_country").offsetWidth;
    var tooltip_2_x = viewport_position[0] + about_fcl_tooltip_country_width + 8;
    about_fcl_tooltip.append("div")
        .attr("id", about_fcl_tooltip_dynamic_id + "_info")
        .attr("class", "about_fcl_tooltip")
        .attr("style", "left:" + tooltip_2_x + "px;bottom:" + (window.innerHeight - viewport_position[1] + y_displacement) + "px;visibility: visible;")
        .attr("data-lng", long)
        .attr("data-lat", lat)
        .html("<div class='tooltip_holder'>" +
            "<div class='tooltip_text'>" + description.toUpperCase() + "</div>" +
            "<div class='pic_holder Centered'><img class='tooltip_pic_logo Centered' src='" + "img/national_flag/project.png" + "' onerror='imgErr(this)'>" + "         " + number + "</div>" +
            "</div>"
        );

    //---flagpole---//
    about_fcl_tooltip.append("div")
        .attr("id", about_fcl_tooltip_dynamic_id + "_line")
        .attr("class", "about_fcl_tooltip_line")
        .attr("style", "left:" + (viewport_position[0] - 1) + "px;bottom:" + (window.innerHeight - viewport_position[1]) + "px;visibility: visible;")
        .attr("data-lng", long)
        .attr("data-lat", lat);
}

//destruct all project circles on google map
function clear_allProject_Circles() {
    project_circles.forEach(function (m) {
        m.setMap(null);
    });
    project_circles = [];

    project_infowindows.forEach(function (m) {
        m.setMap(null);
    });
    project_infowindows = [];

    clear_allCircles();
}


//destruct all network circles on google map
function clear_allNetwork() {
    network_circles.forEach(function (m) {
        m.setMap(null);
    });
    network_circles = [];

    network_infowindows.forEach(function (m) {
        m.setMap(null);
    });
    network_infowindows = [];
    clear_allCircles();
}


//destruct all staff circles on google map
function clear_allStaff() {
    staff_circles.forEach(function (m) {
        m.setMap(null);
    });
    staff_circles = [];

    staff_infowindows.forEach(function (m) {
        m.setMap(null);
    });
    staff_infowindows = [];
    clear_allCircles();
}

//Handle the onError event for the image to reassign its source using JavaScript:

function imgErr(image) {
    image.onerror = "";
    image.src = "img/project_img/0_fcl_vis.jpg";
    return true;
}
