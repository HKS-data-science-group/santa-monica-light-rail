var mymap = L.map('map', {
  center: [34.035760, -118.483196],
  zoom: 13,
  minZoom: 13,
  maxZoom: 14,
  maxBounds: L.latLngBounds([33.97, -118.58], [34.12, -118.38])
});

// ).setView([34.011271, -118.489240], 13);
//
// var southWest = L.latLng(33.968332, -118.569481),
//     northEast = L.latLng(34.099144, -118.393843);
//
// var bounds = L.latLngBounds(southWest, northEast);
//
// map.setMaxBounds(bounds);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1IjoiYnJpYW5obyIsImEiOiJjamRwNWpnM2owYnV0MnJvNG04N2NibGM1In0.BNR4X5tmi6eTuVQg4L20jA'
}).addTo(mymap);

/* IF WE WANT TO STREAM IN GEOMETETRY FROM DATA WITH D3
var svg = d3.select(mymap.getPanes().overlayPane).append("svg");
var g = svg.append("g").attr("class", "leaflet-zoom-hide");

function projectPoint(lat, lng) {
    return mymap.latLngToLayerPoint(new L.LatLng(lat, lng));
}

function projectStream(lat, lng) {
    var point = projectPoint(lat,lng);
    this.stream.point(point.x, point.y);
}

var transform = d3.geoTransform({point: projectStream});
var path = d3.geoPath().projection(transform);
*/

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 1,
        opacity: 1,
        dashArray: '',
        fillOpacity: 1
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

var geojson;

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    if (feature.properties.P_Value == 0) { return; }
    else {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
  }
}

color = d3.scaleSequential(d3.interpolateGreens).domain([0,1]);

d3.queue()
  .defer(d3.json, "./data/map/2640_dissolve.geojson")
  .defer(d3.json, "./data/map/5280_dissolve.geojson")
  .defer(d3.json, "./data/map/heatmap.geojson")
  .defer(d3.json, "./data/map/expo_line.geojson")
  .defer(d3.json, "./data/map/expo_stations.geojson")
  .await(makeMyMap);

function makeMyMap(error, half, mile, grid, line, stations){
  if (error) throw error;

  var outlineStyle = {
      "fillOpacity": 0,
      "weight": 3,
      "color": "black",
      "interactive": "false"
  };

  var geojsonMarkerOptions = {
    radius: 6,
    fillColor: "white",
    color: "black",
    weight: 3,
    opacity: 1,
    fillOpacity: 1
};

  geojson = L.geoJSON(grid, {
    style: function(feature) {
      if (feature.properties.P_Value == 0) { return {opacity: 0, fillOpacity: 0}; }
      else { return {fillColor : color(feature.properties.P_Value), fillOpacity: .5, opacity: 0, color: color(feature.properties.P_Value)}; };
      },
    onEachFeature: onEachFeature }).addTo(mymap);


    L.geoJSON(line, {style: outlineStyle}).addTo(mymap);

    L.geoJSON(stations, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
      }).addTo(mymap);

    L.geoJSON(half, {style: outlineStyle}).addTo(mymap);
    L.geoJSON(mile, {style: outlineStyle}).addTo(mymap);
  // L.geoJSON(before).addTo(mymap);
};

/* * IF WE WANT TO STREAM IN GEOMETETRY FROM DATA WITH D3
  var rectangles = g.selectAll("rectangle").data(grid);

  rectangles.enter()
    .append("rectangle")
    .attr("height", 5)
    .attr("width", 5)
    .attr("x", function(d) { return projectPoint(d.Latitude_round, d.Longitude_round).x; })
    .attr("y", function(d) { return projectPoint(d.Latitude_round, d.Longitude_round).y; });
};

function update() {
  console.log("update");
    var bounds = path.bounds(grid),
        topLeft = bounds[0],
        bottomRight = bounds[1];

    var buffer = 50;

    svg.attr("width", bottomRight[0] - topLeft[0] + (buffer * 2))
      .attr("height", bottomRight[1] - topLeft[1] + (buffer * 2))
      .style("left", (topLeft[0] - buffer) + "px")
      .style("top", (topLeft[1] - buffer) + "px");

    g.attr("transform", "translate(" + (-topLeft[0] + buffer) + "," + (-topLeft[1] + buffer) + ")");

    circles
        .attr("x", function(d) { return projectPoint(d.Latitude_round, d.Longitude_round).x; })
        .attr("y", function(d) { return projectPoint(d.Latitude_round, d.Longitude_round).y; });
};

update();
mymap.on("viewreset", update);

d3.json('./data/map/2640_dissolve.geojson', function(data) {
  console.log(data);
});
*/
