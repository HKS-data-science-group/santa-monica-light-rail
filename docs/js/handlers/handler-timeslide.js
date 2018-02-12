
var timeCharts;
var selectedCrimeType = $( "input[name='crimeTypeRadios']:checked" ).val();

queue()
    .defer(d3.csv, "data/timeline/timeline-data.csv")
    .await(function(error, timeData){

        var number_column_headers = Object.keys(timeData[0]).slice(1);

        timeData.forEach(function(d) {
            d.date = d3.timeParse("%Y-%m-%d")(d.date);

            for (var column in number_column_headers) {
                var column_name = number_column_headers[column];
                if (d[column_name] == "") {
                    d[column_name] = null;
                } else {
                    d[column_name] = +d[column_name];
                }
            }

        });

        var actualChart = new LineVis('timeline-chart-actual', timeData, 'actual');
        var trendChart = new LineVis('timeline-chart-trend', timeData, 'trend');
        var seasonalChart = new LineVis('timeline-chart-seasonal', timeData, 'seasonal');
        timeCharts = [actualChart, trendChart, seasonalChart];


    });

function lineToolTipShow() {

    var bisectDate = d3.bisector(function(d) { return d.date; }).left;

    var leftPosition = d3.mouse(this)[0];

    timeCharts.forEach(function(chart){

        var x0 = chart.xScale.invert(leftPosition);

        chart.lineToolTip
          .attr('x1', chart.xScale(x0))
          .attr('x2', chart.xScale(x0))
          .attr('stroke', '#09091a');

        chart.lineToolTipText
          .attr('x', chart.xScale(x0) + 5)
          .text(d3.timeFormat('%B %Y')(x0));

        var i = bisectDate(chart.displayData, x0, 1);
        var d0 = chart.displayData[i - 1];
        var d1 = chart.displayData[i];
        var dA = x0 - d0.date > d1.date - x0 ? d1 : d0;
        d3.select('#crime-tooltip-label-' + chart.chartType)
          .attr('x', chart.xScale(x0) + 5)
          .text(d3.format(",.0f")(dA[selectedCrimeType + ' - ' + chart.chartType]));

    });

};

function lineToolTipHide() {

    timeCharts.forEach(function(chart){

        chart.lineToolTip
          .attr('stroke', 'none');

        chart.lineToolTipText
          .text('');

        d3.select('#crime-tooltip-label-' + chart.chartType)
              .text('');

    });

};

$( "input[name='crimeTypeRadios']" ).on("click", function() {

    selectedCrimeType = $( "input[name='crimeTypeRadios']:checked" ).val();

    timeCharts.forEach(function(chart) {
        chart.wrangleData();
    });
});