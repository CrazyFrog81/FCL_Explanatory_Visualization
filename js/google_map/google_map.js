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
                { color: "#bcbcbc" },
                { lightness: 40 }
            ]
        },
        {
            featureType: "landscape",
            elementType: "geometry.fill",
            stylers: [
                { "color": "#ffffff" },
                { "lightness": 40}
            ]
        },
        {
            featureType: "landscape.man_made",
            elementType: "geometry.stroke",
            stylers: [
                { "color": "#000000" },
                { "lightness": 40}
            ]
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [
                { lightness: 71 },
                { saturation: -100 },
                {color:"#B3B6B7"},
                { visibility: "off" }//"simplified"
            ]
        }
    ];

    // Create a new StyledMapType object, passing it the array of styles,
    // as well as the name to be displayed on the map type control.
    var styledMap = new google.maps.StyledMapType(styles,
        {name: "Styled Map"});

    center = new google.maps.LatLng(42.313,0);

    // Create a map object, and include the MapTypeId to add
    // to the map type control.
    var mapOptions = {
        zoom: 12,
        center: center,//55.6468, 37.581
        mapTypeControl:false,
        streetViewControl:false,
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

        clear_allCircles();
        var s = gmap.getZoom()-1;
        zoom.scale(s); //update the zoom level in base map

        var tier1_scale = 2;
        var tier2_scale = 2.5;
        var tier3_scale = 3;
        var tier4_scale =3.5;
        var google_map_scale = 4;
        var tier_range = 100;
        var scale =2;


        if(s>= tier4_scale) {

            /*if(project_layer&&callcount>0){
             callcount=0;
             d3.select("#google_map").remove();
             }*/
            tier_range = 3;
            scale = tier4_scale;
            svg.selectAll(".items").remove();
            if(project_layer)find_last_tier(tier_range,scale,'project_layer');
            if(network_layer)find_last_tier(tier_range,scale,'network_layer');
            if(staff_layer)find_last_tier(tier_range,scale,'staff_layer');

        }else if(s>=tier3_scale){

            tier_range=5;
            scale = tier3_scale;
            svg.selectAll(".items").remove();
            if(project_layer)find_last_tier(tier_range,scale,'project_layer');
            if(network_layer)find_last_tier(tier_range,scale,'network_layer');
            if(staff_layer)find_last_tier(tier_range,scale,'staff_layer');

        }else if(s>=tier2_scale){
            tier_range = 25;
            scale = tier2_scale;
            svg.selectAll(".items").remove();
            if(project_layer)find_last_tier(tier_range,scale,'project_layer');
            if(network_layer)find_last_tier(tier_range,scale,'network_layer');
            if(staff_layer)find_last_tier(tier_range,scale,'staff_layer');

        }else if(s>=tier1_scale){

            tier_range = 50 ;
            scale = tier1_scale;
            svg.selectAll(".items").remove();
            if(project_layer)find_last_tier(tier_range,scale,'project_layer');
            if(network_layer)find_last_tier(tier_range,scale,'network_layer');
            if(staff_layer)find_last_tier(tier_range,scale,'staff_layer');

        }else{

            tier_range = 100 ;
            scale = 1;
            svg.selectAll(".items").remove();
            if(project_layer)find_last_tier(tier_range,scale,'project_layer');
            if(network_layer)find_last_tier(tier_range,scale,'network_layer');
            if(staff_layer)find_last_tier(tier_range,scale,'staff_layer');
        }

    });

    // restrict the appropriate region for users
    var initial_center = gmap.getCenter();
    console.log(initial_center.lng()+"  "+initial_center.lat());
    var lastValidCenter = initial_center;

    gmap.setOptions({minZoom:2},{maxZoom:17});
    /* var allowedBounds = new google.maps.LatLngBounds(
     new google.maps.LatLng(-82, 150),//bottom left corner
     new google.maps.LatLng(87, -139)
     );



     google.maps.event.addListener(gmap, 'center_changed', function() {
     if (allowedBounds.contains(gmap.getCenter())) {
     // still within valid bounds, so save the last valid position
     lastValidCenter = gmap.getCenter();

     return;
     }

     // not valid anymore => return to last valid position
     gmap.panTo(lastValidCenter);

     });*/

    var cur_bounds;
    google.maps.event.addListener(gmap, 'bounds_changed', function() {
        cur_bounds = gmap.getBounds();
        var cur_scale =  gmap.getZoom();

        var top_right_corner = cur_bounds.getNorthEast();
        var bottom_left_corner = cur_bounds.getSouthWest();

        var bounds_world = new google.maps.LatLngBounds(bottom_left_corner,top_right_corner) ;
        // gmap.fitBounds(bounds_world);


        if(cur_scale<=2){
            gmap.panTo(initial_center);
            return;
        }


        /*var R = top_right_corner.lng();
         var L = bottom_left_corner.lng();


         var resL_L = !(L>0 && lastValidCenter.lng()<0) ;
         var bound_range = Math.abs(R-L);
         if(!resL_L&&cur_scale<4)bound_range = Math.abs(180-L + R+180);
         console.log("bound_range = "+bound_range);
         console.log("-180"+"L="+L+"  "+(180-bound_range));


         var resL_R = L<= (180-bound_range);


         if(resL_L && resL_R){
         lastValidCenter = gmap.getCenter();
         return;
         }else{
         if(!resL_L){

         console.log("L wrong "+"BOUND_RANGE="+bound_range);

         lastValidCenter = new google.maps.LatLng(lastValidCenter.lat(),-(180-bound_range/2));
         }else{
         console.log("R wrong"+"BOUND_RANGE="+bound_range);
         lastValidCenter = new google.maps.LatLng(lastValidCenter.lat(),(180-bound_range/2));
         }
         gmap.panTo(lastValidCenter);

         }

         //console.log("top_right = "+top_right_corner+" bottom_left = "+bottom_left_corner);

         if(top_right_corner.lng()){

         }*/
        /*if ()//allowedBounds.contains(top_right_corner)&& allowedBounds.contains(bottom_left_corner)) {
         // still within valid bounds, so save the last valid position
         lastValidCenter = gmap.getCenter();

         return;
         }

         // not valid anymore => return to last valid position
         gmap.panTo(lastValidCenter);*/


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

    var info =['John','View Projects in Singapore'];
    var info_json;
    var markerPos = triangleCoords[0];
    //---draw a marker for zoom into Singapore---//

    d3.json("data/fcl/ProjectInformation.json",function(error, info_json_in){

        info_json = info_json_in;//topojson.feature(info_json_in, );
        //console.log(info_json[0].contact);
        for(var i = 0; i < info_json.length; i ++) {
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
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34));
    return markerImage;
}

var project_polygons =[];
var project_markers = [];
var project_infowindows = [];
function draw_polygon(triangleCoords,markerPos,fillcolor,info){

    // Construct the polygon.
    var bermudaTriangle = new google.maps.Polygon({
        paths: triangleCoords,
        strokeColor: fillcolor,
        strokeOpacity: 0.35,
        strokeWeight: 2,
        fillColor: fillcolor,
        fillOpacity: 0.35
    });

    bermudaTriangle.setMap(gmap);


    var project_img = new Image();
    project_img.src = "img/project_img/" + 1 + "_fcl_vis.jpg";

    var mouseover_String = " <div><div class='pic_holder Centerer'>" +
        "<img class='tooltip_pic' src='"+project_img.src+"'></div>" +
        "<div class='tooltip_text'><b style='font-size:17px;'>" + "The Singapore Project" + "</b>";

    var contentString = " <div><div class='pic_holder Centerer'>" +
        "<img class='tooltip_pic' src='"+project_img.src+"'></div>" +
        "<div class='tooltip_text'><b style='font-size:17px;'>" + "The Singapore Project" + "</b>" +
        "<br><br> <b>Contact:</b> "+info[0]+
        "<br><br> <b>Description:</b> "+info[1]+"</div></div>";

    var infowindow_mouseover = new google.maps.InfoWindow({
        maxWidth: 300,
        content: mouseover_String
    });

    var infowindow_click = new google.maps.InfoWindow({
        maxWidth: 300
    });

    var defaultIcon = makeMarkerIcon('FFFF24');
    var highlightedIcon = makeMarkerIcon('E74C3C');

    var marker = new google.maps.Marker({
        position: markerPos,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        map: gmap,
        //title: 'The Info Window'
    });

    marker.myHtmlContent = contentString;
    infowindow_click.setContent(marker.myHtmlContent);

    marker.addListener('click', function() {
        infowindow_mouseover.setMap(null);
        infowindow_click.open(gmap, marker);
    });

    marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
        bermudaTriangle.set("strokeColor",'red');
        bermudaTriangle.set("fillColor",'red');
        infowindow_mouseover.open(gmap, marker);
    });


    marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
        bermudaTriangle.set("strokeColor",fillcolor);
        bermudaTriangle.set("fillColor",fillcolor);
        infowindow_mouseover.setMap(null);

    });

    bermudaTriangle.addListener('click', function() {
        infowindow_mouseover.setMap(null);
        infowindow_click.open(gmap, marker);
    });

    bermudaTriangle.addListener('mouseover', function() {
        marker.setIcon(highlightedIcon);
        this.set("strokeColor",'red');
        this.set("fillColor",'red');
        infowindow_mouseover.open(gmap, marker);
    });

    bermudaTriangle.addListener('mouseout', function() {
        marker.setIcon(defaultIcon);
        this.set("strokeColor",fillcolor);
        this.set("fillColor",fillcolor);
        infowindow_mouseover.setMap(null);
    });

    //bermudaTriangle.bindTo('strokeColor',marker,'strokeColor');
    //bermudaTriangle.setOptions({clickable:false});

    project_polygons.push(bermudaTriangle);
    project_markers.push(marker);
    project_infowindows.push(infowindow_mouseover);
    project_infowindows.push(infowindow_click);

}

function draw_zoomin_singapore_marker(markerPos){
    var mouseover_String = " <div><div class='pic_holder Centerer'>" +
        "<div class='tooltip_text'><b style='font-size:17px;'>" + "View Projects in Singapore" + "</b>";

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

    marker.addListener('click', function() {
        console.log("gmap.setZoom(10);");
        gmap.setCenter({lat: 1.3521, lng: 103.8198});
        gmap.setZoom(12);
        infowindow_mouseover.setMap(null);
    });

    // marker.addListener("touchstart", function() {
    //     console.log("touch the marker!");
    // });

    // Dispatch/Trigger/Fire the event
    // document.dispatchEvent(event);

    marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
        infowindow_mouseover.open(gmap, marker);
    });


    marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
        infowindow_mouseover.setMap(null);

    });

    project_markers.push(marker);
    project_infowindows.push(infowindow_mouseover);

}
function getTriangleCoords(polyinfo){
    var polygon_array = polyinfo.split(",");
    var polygon_number = parseInt(polygon_array[0]);
    var polygon_point_number = parseInt(polygon_array[1]);
    var triangleCoords = [];
    for(var i = 0; i < polygon_point_number; i ++){
        var latlng = {
            lat: 0,
            lng: 0
        };
        latlng['lat'] = parseFloat(polygon_array[2+i*2]);
        latlng['lng'] = parseFloat(polygon_array[2+i*2+1]);
        triangleCoords.push(latlng);
    }
    return triangleCoords;
}
function draw_project_description(fillcolor,info){
    // get polygon coords.
    triangleCoords =  getTriangleCoords(info.polyinfo);

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
    var click_String = " <div class='project'><div class='project_text'>"+
        "<br><br> <b>Name:</b> <br>"+info.name+
        "<br><br> <b>Project:</b> <br>"+info.project.replace("\">", "\" target=\"_blank\">")+
        "<br><br> <b>Contact:</b> <br>"+info.contact.replace("\">", "\" target=\"_blank\">")+
        "<br><br> <b>Description :</b> <br>"+ info.description +
        "</div>";

    // console.log(info.project);
    // console.log("replacement: "+ info.project.replace("\">", "\" target=\"_blank\">"));

    //create images for click div
    var img_array = info.files.split(",");
    if(info.files==undefined || info.files==''){
        click_String = click_String + "</div>";
    }else{
        click_String = click_String + "<div class='project_img'>";
        for(var i = 0; i < img_array.length; i ++){
            var class_string = 'project_img' + String(i+1);
            // removed "/" at the end of image. Not working on sever
            click_String = click_String +
                    // "<div><img class='"+class_string+"' src="+img_array[i]+"></div>";
                "<img class='"+class_string+"' src="+img_array[i]+">";
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

    marker.addListener('click', function() {
        // infowindow_mouseover.setMap(null);
        infowindow_click.open(gmap, marker);
    });

    bermudaTriangle.addListener('click', function() {
        infowindow_mouseover.setMap(null);
        infowindow_click.open(gmap, marker);
    });

    bermudaTriangle.addListener('mouseover', function() {
        marker.setIcon(highlightedIcon);
        this.set("strokeColor",'red');
        this.set("fillColor",'red');
        infowindow_mouseover.open(gmap, marker);
    });
    bermudaTriangle.addListener('mouseout', function() {
        marker.setIcon(defaultIcon);
        this.set("strokeColor",fillcolor);
        this.set("fillColor",fillcolor);
        infowindow_mouseover.setMap(null);
    });
    bermudaTriangle.bindTo('strokeColor',marker,'strokeColor');
    bermudaTriangle.setOptions({clickable:false});

    project_polygons.push(bermudaTriangle);
    project_markers.push(marker);
    project_infowindows.push(infowindow_click);
}

//destruct all polygons
function clear_allProject_Poly(){

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
    d3.select("#content_holder").append("div").attr("id","googlem_holder")
        .style("visibility","hidden");
    document.getElementById("googlem_holder").style.width = innerWidth+"px";
    document.getElementById("googlem_holder").style.height = innerHeight+"px";

    var toggle_switchHolder = document.createElement('div');
    toggle_switchHolder.id = "toggle_GM";

    var text = document.createElement('div');
    text.className = 'text_box';
    text.innerHTML = 'GOOGLE MAP';

    var input = document.createElement('input');
    input.id = 'googlem_switch';
    input.type = 'checkbox';
    input.className = 'switch-input';
    input.onchange = function() {handle_switch()};

    var toggle_slider= document.createElement('div');
    toggle_slider.className = 'toggle_slider';


    var label =  document.createElement('label');
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
    if(!pop_layer && ! co2_layer && !gdp_layer)
        document.getElementById('pop_densityBtn').click();

    var center = gmap.getCenter();
    var zoom = gmap.getZoom()-2;

    if(zoom>=4)zoom=4;

    var new_map_center = projection([center.lng(),center.lat()]);
    var shift_x =   innerWidth/2 - new_map_center[0] * zoom;
    var shift_y = innerHeight/2 - new_map_center[1] *zoom;

    var t = [shift_x,shift_y];

    move(t,zoom);


    // document.getElementById("google_map").style.width = "1250px";

    //document.getElementById("googlem_holder").style.width = innerWidth+"px";
    //document.getElementById("googlem_holder").style.height = innerHeight+"px";
    d3.select("#googlem_holder").style("visibility","hidden");
}

function open_GoogleMap() {
    if(pop_layer)
        document.getElementById('pop_densityBtn').click();

    if(co2_layer)
        document.getElementById('co2_emissionBtn').click();

    if(gdp_layer)
        document.getElementById('gdp_Btn').click();

    d3.select("#googlem_holder").style("visibility","visible");

    //adjust the map to be return
    var zoomlvl = zoom.scale();
    var  translate= zoom.translate();
    var center_x =  (innerWidth/2-translate[0])/zoomlvl;
    var center_y = (innerHeight/2-translate[1])/zoomlvl;


    var map_center = projection.invert([center_x, center_y]);//
    var c = new google.maps.LatLng(map_center[1],map_center[0]);


    //google.maps.event.trigger(gmap, 'resize');

    gmap.panTo(c);
    gmap.setZoom(parseInt(zoomlvl-0.5)+3);
}

function handle_switch(){
    var input = document.getElementsByClassName('switch-input');

    var res = input[0].checked;

    if(res){

        open_GoogleMap();
    }else{

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

//function to add clusters of projects
function add_cluster_googleMap(color, lat, lon,text, clusterObj,className) {
    var area = clusterObj["area"];
    if (area == undefined) area = 2;
    //var radius_unit = 100000;
    //var radius = Math.sqrt(clusterObj["area"] / Math.PI) / scale;

    var scale_unit = 15;
    var scale = Math.sqrt(area / Math.PI) *scale_unit;

    var latLng = new google.maps.LatLng(lat, lon);

    var marker = new google.maps.Marker({
        position: latLng,
        map:gmap,
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
    /*var circle = new google.maps.Circle({
     center: latLng,
     clickable: true,
     draggable: false,
     editable: false,
     fillColor: color,
     fillOpacity: 0.27,
     map: gmap,
     radius: radius * radius_unit,
     strokeColor: '#000',
     strokeOpacity: 0.62,
     strokeWeight: 0.5
     });*/


    var project_img = new Image();
    project_img.src = "img/project_img/" + 1 + "_fcl_vis.jpg";

    var mouseover_String = " <div><div class='pic_holder Centerer'>" +
        "<img class='tooltip_pic' src='"+project_img.src+"'></div>" +
        "<div class='tooltip_text'><b style='font-size:17px;'>" + text+ "</b>";


    var infowindow_mouseover = new google.maps.InfoWindow({
        content:mouseover_String,
        maxWidth: 300
        // position:latLng
    });


    marker.addListener('mouseover', function () {
        this.set("strokeColor", 'red');
        infowindow_mouseover.open(gmap,this);
    });


    marker.addListener('click', function () {
        infowindow_mouseover.setMap(null);
        gmap.panTo(latLng);
        draw_zoomableCircles_googleMap(scale,latLng,clusterObj,className);
    });

    marker.addListener('mouseout', function () {
        this.set("strokeColor", 'black');
        infowindow_mouseover.setMap(null);
    });

    switch(className){
        case 'project_layer': project_circles.push(marker);
            project_circles_infowindows.push(infowindow_mouseover);
            break;
        case 'network_layer':  network_circles.push(marker);
            network_infowindows.push(infowindow_mouseover);
            break;
        case 'staff_layer': staff_circles.push(marker);
            staff_infowindows.push(infowindow_mouseover);
            break;

        default:
            console.log("wrong "+className);
            break;
    }


}


var circles = [];
var circles_infowindow_mouseover = [];
var circles_infowindow_click = [];
//clear all circles
function clear_allCircles(){
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
function draw_zoomableCircles_googleMap(scale,latLng,clusterObj,className) {

    clear_allCircles();
    var color ='#75dccd';

    var diameter = scale;

    var pack = d3.layout.pack()
        .padding(2)
        .size([diameter , diameter ])
        .value(function(d) { return d.size;});


    var nodes = pack.nodes(clusterObj);


    //draw the root
    var holder = new google.maps.Marker({
        position: latLng,
        map:gmap,
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

    holder.addListener('click',function(){//onclick clear all circles
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

    var root  =nodes[0];
    //convert latLng to pixel coordinates


    var pixelCoordinate = gmap.getProjection().fromLatLngToPoint(latLng);

    var root_x = pixelCoordinate.x;
    var root_y =pixelCoordinate.y;


    var k = diameter/(root.r*2);
    var translate_x ;
    var translate_y;
    var node;
    var length = nodes.length;
    var s = gmap.getZoom();
    var t = 0.2*s+0.7;
    if(s>=15)t = 0.2*s+0.5;

    var infowindows_mouseover = {};
    var infowindows_click = {};

    for(var i =1;i<length;i++){
        node = nodes[i];
        translate_x = (node.x - root.x)*k/Math.pow(s,t);
        translate_y = (node.y - root.y)*k/Math.pow(s,t);
        var pixel_x = root_x - translate_x;
        var pixel_y = root_y - translate_y;
        var point =  new google.maps.Point(pixel_x,pixel_y);
        var coordinates = gmap.getProjection().fromPointToLatLng(point);
        var radius = node.r *k*2;
        var zindex = google.maps.Marker.MAX_ZINDEX + 1;
        var marker1 = new google.maps.Marker({
            position: coordinates,//point,//
            map:gmap,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillOpacity: 0.2,
                fillColor: '#751aff',
                strokeOpacity: 0,
                strokeColor: 'black',
                strokeWeight: 1,
                scale: radius //pixels
            },
            zIndex:zindex
        });


        var img_src;
        switch (className){
            case 'pop_layer': img_src = "img/project_img/" + node.itemIndex  + "_fcl_vis.jpg";
                break;
            case 'network_layer': img_src = "img/network_img/"+ node.itemIndex +"_network.png"  ;
                break;
            default: img_src = "img/project_img/0_fcl_vis.jpg";
                break;
        }

        var project_img = new Image();
        project_img.src = img_src;
        console.log(img_src);

        var mouseover_String = " <div><div class='pic_holder Centerer'>" +
            "<img class='tooltip_pic' src='"+project_img.src+"'></div>" +
            "<div class='tooltip_text'><b style='font-size:17px;'>" + node.name+ "</b>";

        var click_String = "<div class='tooltip_holder'><div class='pic_holder Centerer'><img class='tooltip_pic Centered' src='"+project_img.src+"' onerror='imgErr(this)'></div>" +
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

        infowindows_mouseover[node.itemIndex]=infowindow_mouseover;
        infowindows_click[node.itemIndex]=infowindow_click;

        marker1.addListener('mouseover', function () {
            this.set("strokeOpacity", 1);
            infowindows_mouseover[this.myHtmlContent].open(gmap,this);

        });

        marker1.addListener('click', function () {
            //gmap.panTo(latLng);

            // draw_circles(clusterObj,className)
            //console.log();
            infowindows_click[this.myHtmlContent].setContent(this.myHtmlContent);
            infowindows_mouseover[this.myHtmlContent].setMap(null);
            infowindows_click[this.myHtmlContent].open(gmap,this);
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
function add_point_googleMap(color, lat, lon,name,text,index,className,country) {

    var area = 1;
    //var radius_unit = 100000;
    //var radius = Math.sqrt(clusterObj["area"] / Math.PI) / scale;

    var scale_unit = 15;
    var scale = Math.sqrt(area / Math.PI) *scale_unit;

    var latLng = new google.maps.LatLng(lat, lon);

    var marker = new google.maps.Marker({

        position: latLng,
        map:gmap,
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

    var img_src;

    var country_str = country.replace(/ /g,'');//remove all blank spaces
    var country_filename = country_str.toLowerCase();
    switch (className){
        case 'pop_layer': img_src = "img/project_img/" + index + "_fcl_vis.jpg";
            break;
        case 'network_layer': img_src = "img/network_img/"+index+"_network.png"  ;
            break;
        default:
            // img_src = "img/project_img/0_fcl_vis.jpg";
            img_src = "img/national_flag/"+country_filename+".png";
            break;
    }
    //add in picture for the project
    var item_img = new Image();
    item_img.src = img_src;

    // var mouseover_String = " <div><div class='pic_holder Centerer'>" +
    //     "<img class='tooltip_pic' src='"+item_img.src+"'></div>" +
    //     "<div class='tooltip_text'><b style='font-size:17px;'>" + name+ "</b>";

    var mouseover_String = "<div class='tooltip_holder' id='about_fcl_tooltip_country' ><div class='tooltip_text'>" + country + "</div>"+
        "<div class='pic_holder Centerer'><img class='tooltip_pic Centered' src='"+item_img.src+"' onerror='imgErr(this)'> </div>" +
        "</div>";

    var click_String = "<div class='tooltip_holder'><div class='pic_holder Centerer'><img class='tooltip_pic Centered' src='"+item_img.src+"'></div>" +
        "<div class='tooltip_text'><b>" + name + "</b><p>" + text + "</div></div>";


    var infowindow_mouseover = new google.maps.InfoWindow({
        content: mouseover_String,
        maxWidth: 300,
        // position:latLng
    });

    var infowindow_click = new google.maps.InfoWindow({
        maxWidth: 300
        // position:latLng
    });

    marker.myHtmlContent = click_String;
    infowindow_click.setContent(marker.myHtmlContent);

    marker.addListener('mouseover', function () {
        this.set("strokeColor", 'red');
        infowindow_mouseover.open(gmap,this);
    });

    marker.addListener('click', function () {
        // gmap.panTo(latLng);
        infowindow_mouseover.setMap(null);
        infowindow_click.open(gmap,this);
        // draw_circles(clusterObj,className)
    });

    marker.addListener('mouseout', function () {
        this.set("strokeColor", 'black');
        infowindow_mouseover.setMap(null);
    });

    switch(className){
        case 'project_layer': project_circles.push(marker);
            project_circles_infowindows.push(infowindow_mouseover);
            project_circles_infowindows.push(infowindow_click);
            break;
        case 'network_layer':  network_circles.push(marker);
            network_infowindows.push(infowindow_mouseover);
            network_infowindows.push(infowindow_click);
            break;
        case 'staff_layer': staff_circles.push(marker);
            staff_infowindows.push(infowindow_mouseover);
            staff_infowindows.push(infowindow_click);
            break;

        default: console.log("wrong layer in google map: "+className);
            break;
    }


}

//destruct all project circles on google map
function clear_allProject_Circles(){
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
function clear_allNetwork(){
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
function clear_allStaff(){
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
