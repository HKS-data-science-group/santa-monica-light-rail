var mymap = L.map('map', {
  center: [33.99, -118.483196],
  zoom: 12,
  minZoom: 12,
  maxZoom: 13,
  maxBounds: L.latLngBounds([33.98, -118.58], [34.12, -118.38])
});

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1IjoiYnJpYW5obyIsImEiOiJjamRwNWpnM2owYnV0MnJvNG04N2NibGM1In0.BNR4X5tmi6eTuVQg4L20jA'
}).addTo(mymap);
/*
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
*/
color = d3.scaleLinear()
  .domain([0,1])
  .range([d3.rgb(240,179,66,1),d3.rgb(9,114,179,.1)]);
// color = d3.scaleSequential(d3.interpolateGreens).domain([0,1]);

d3.queue()
  .defer(d3.json, "./data/map/2640_dissolve.geojson")
  .defer(d3.json, "./data/map/5280_dissolve.geojson")
  .defer(d3.json, "./data/map/heatmap.geojson")
  .defer(d3.json, "./data/map/expo_line.geojson")
  .defer(d3.json, "./data/map/expo_stations.geojson")
  .await(makeMyMap);

function makeMyMap(error, half, mile, grid, line, stations){
  if (error) throw error;

  var areaStyle = {
      fillOpacity: 0,
      weight: 1,
      color: "#005391",
      dashArray: "1, 2",
      interactive: "false"
  };

  var lineStyle = {
      fillOpacity: 0,
      weight: 3,
      color: "#0099cb",
      interactive: "false"
  };

  var geojsonMarkerOptions = {
    radius: 6,
    fillColor: "white",
    color: "#0099cb",
    weight: 3,
    opacity: 1,
    fillOpacity: 1
};

  geojson = L.geoJSON(grid, {
    style: function(feature) {
      if (feature.properties.P_Value == 0) { return {opacity: 0, fillOpacity: 0}; }
      else { return {fillColor : color(feature.properties.P_Value), fillOpacity: .5, opacity: 0, color: color(feature.properties.P_Value)}; };
      },
    // onEachFeature: onEachFeature
  }).addTo(mymap);

    L.geoJSON(line, {style: lineStyle}).addTo(mymap);
    L.geoJSON(stations, {
        pointToLayer: function (feature, latlng) {
            label = String(feature.properties.name)
            return L.circleMarker(latlng, geojsonMarkerOptions).bindTooltip(label, {permanent:true, className: 'map-label'}).openTooltip();
        }
      }).addTo(mymap);

    L.geoJSON(half, {style: areaStyle}).addTo(mymap);
    L.geoJSON(mile, {style: areaStyle}).addTo(mymap);
};
