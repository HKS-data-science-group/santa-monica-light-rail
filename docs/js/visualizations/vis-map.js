var mymap = L.map('map', {
  center: [34.035760, -118.483196],
  zoom: 13,
  minZoom: 13,
  maxZoom: 14,
  maxBounds: L.latLngBounds([33.97, -118.58], [34.12, -118.38])
});

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1IjoiYnJpYW5obyIsImEiOiJjamRwNWpnM2owYnV0MnJvNG04N2NibGM1In0.BNR4X5tmi6eTuVQg4L20jA'
}).addTo(mymap);

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
      fillOpacity: 0,
      weight: 3,
      color: "black",
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
    onEachFeature: onEachFeature }).addTo(mymap);


    L.geoJSON(line, {style: outlineStyle}).addTo(mymap);

    L.geoJSON(stations, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
      }).addTo(mymap);

    L.geoJSON(half, {style: outlineStyle}).addTo(mymap);
    L.geoJSON(mile, {style: outlineStyle}).addTo(mymap);
};
