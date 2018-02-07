
var timeChartData;
var timeVis;
var selectedRadius = 'Full';
var crimeDomain = ["Larceny", "All"];
var crimeColorRange = ["#CD6737", "#e6c276"];

queue()
    .defer(d3.csv, "data/timeline/timeline-data.csv")
    .await(function(error, timeData){

    timeChartData = [];

    timeData.forEach(function(d){

        crimeDomain.forEach(function(s) {
            var dataElement = {};
            dataElement.time = d3.timeParse("%Y-%m-%d")(d['Date Occurred']);
           dataElement.crimeType = s;
           dataElement.crimeFull = +d[s + ' - Full'];
           dataElement.crimeHalfMile = +d[s + ' - HalfMile'];
            dataElement.crimeOneMile = +d[s + ' - OneMile'];
           
           timeChartData.push(dataElement);
        });


    });

    timeChartData.sort(function(a, b) {
      return a.time - b.time;
    });

    timeVis = new LineVis("timeline-chart", timeChartData);

    geographySliderMove();

    });

function lineToolTipShow() {

    var bisectDate = d3.bisector(function(d) { return d.time; }).left;

    var x0 = timeVis.xScale.invert(d3.mouse(this)[0]);
    
    timeVis.lineToolTip
      .attr('x1', timeVis.xScale(x0))
      .attr('x2', timeVis.xScale(x0))
      .attr('stroke', '#09091a');

    timeVis.lineToolTipText
      .attr('x', timeVis.xScale(x0) + 5)
      .text(d3.timeFormat('%B %Y')(x0));

    timeVis.displayData.forEach(function(d, i) {
        var i = bisectDate(d.values, x0, 1);
        var d0 = d.values[i - 1];
        var d1 = d.values[i];
        var dA = x0 - d0.time > d1.time - x0 ? d1 : d0;
        d3.select('#crime-tooltip-label-' + d.key.charAt(0))
          .attr('x', timeVis.xScale(x0) + 5)
          .text(d3.format(".0%")(dA.crime));
    });

};

function lineToolTipHide() {

    timeVis.lineToolTip
      .attr('stroke', 'none');

    timeVis.lineToolTipText
      .text('');

    timeVis.displayData.forEach(function(d) {
        d3.select('#crime-tooltip-label-' + d.key.charAt(0))
          .text('');
    });

};

var geographyValueMapping = {3:"HalfMile", 2:"OneMile", 1:"Full"};

function geographySliderMove() {
    selectedRadius = geographyValueMapping[$('#geography-slider').slider("option", "value")];
    timeVis.wrangleData();
}