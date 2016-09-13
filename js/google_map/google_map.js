/**
 * Created by yuhao on 27/6/16.
 */

var gmap;
var googlem_holder;
var center;

// callback function for loading Google Map api
function initGoogleMap() {
    load_google_map();

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

    // restrict the appropriate region for users
    var initial_center = gmap.getCenter();
    console.log(initial_center.lng() + "  " + initial_center.lat());
    var lastValidCenter = initial_center;

    gmap.setOptions({minZoom: 3}, {maxZoom: 17});

    var pre_ne = new google.maps.LatLng(0, 0);
    google.maps.event.addListener(gmap, 'bounds_changed', function () {
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

        function updateBound() {
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
    ];

    var info_json;

    d3.json("data/fcl/ProjectInformation.json", function (error, info_json_in) {
        info_json = info_json_in;//topojson.feature(info_json_in, );
        //console.log(info_json[0].contact);
        for (var i = 0; i < info_json.length; i++) {
            draw_project_description('#1E90FF', info_json[i]);
        }
    });
    draw_zoomin_singapore_marker({lat: 1.3521, lng: 103.8198});
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
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

    marker.addListener('click', function () {
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
    if (scale > world_map_max_zoom) {
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

function removeAll_fcl_tooltips() {
    d3.selectAll(".about_fcl_tooltip_container").forEach(function (tips) {
        tips.forEach(function (tip) {
            if (tip.id == undefined || tip.id == "")
                return;

            remove_about_fcl_tooltip(tip.id);
        })
    });
}

//Handle the onError event for the image to reassign its source using JavaScript:
function imgErr(image) {
    image.onerror = "";
    image.src = "img/project_img/0_fcl_vis.jpg";
    return true;
}
