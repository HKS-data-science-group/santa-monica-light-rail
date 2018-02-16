var mymap = L.map('map').setView([34.011271, -118.489240], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiYnJpYW5obyIsImEiOiJjamRwNWpnM2owYnV0MnJvNG04N2NibGM1In0.BNR4X5tmi6eTuVQg4L20jA'
}).addTo(mymap);

/*
d3.queue()
  .defer(d3.json, "./data/map/2640_dissolve.geojson")
  .defer(d3.json, "./data/map/5280_dissolve.geojson")
  .await(makeMyMap);
*/

d3.json('./data/map/2640_dissolve.geojson').then(function(data) {
  console.log(data);
  L.geoJSON(data).addTo(mymap);
});
