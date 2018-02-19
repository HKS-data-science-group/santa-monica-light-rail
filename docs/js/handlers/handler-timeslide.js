
var timeCharts;
var selectedCrimeType = $( "input[name='crimeTypeRadios']:checked" ).val();
var trendModels = ["original", "SARIMA", "Prophet"];

var lineColorMapping = {
    "all": "#CD6737",
    "larceny": "#CD6737",
    "original": "#CD6737",
    "SARIMA": "#4a0073",
    "Prophet": "#e6c276"
};

queue()
    .defer(d3.csv, "data/timeline/timeline-data.csv")
    .defer(d3.csv, "data/trend_analysis/trend_prediction.csv")
    .await(function(error, timeData, trendData){

        var number_column_headers = Object.keys(timeData[0]).slice(1);

        var actualChartData = [];
        var trendChartData = [];
        var seasonalChartData = [];
        timeData.forEach(function(d) {
            var date = d3.timeParse("%Y-%m-%d")(d.date);

            number_column_headers.forEach(function(c) {
                var crimeType = c.split(" - ")[0];
                var decomposeType = c.split(" - ")[1];

                if (d[c] != "") {
                    var val = +d[c];

                    switch (decomposeType) {
                        case val === null:
                            break;
                        case "actual":
                            actualChartData.push({date:date, value:val, model:crimeType, decomposeType: decomposeType});
                            break;
                        case "trend":
                            trendChartData.push({date:date, value:val, model:crimeType, decomposeType: decomposeType});
                            break;
                        case "seasonal":
                            seasonalChartData.push({date:date, value:val, model:crimeType, decomposeType: decomposeType});
                            break;
                    }
                }

            });


        });

        actualChartData = d3.nest()
            .key(function(d) { return d.model; })
            .sortKeys(d3.ascending)
            .entries(actualChartData);

        trendChartData = d3.nest()
            .key(function(d) { return d.model; })
            .sortKeys(d3.ascending)
            .entries(trendChartData);

        seasonalChartData = d3.nest()
            .key(function(d) { return d.model; })
            .sortKeys(d3.ascending)
            .entries(seasonalChartData);

        var actualChart = new LineVis('timeline-chart-actual', actualChartData, "actual");
        var trendChart = new LineVis('timeline-chart-trend', trendChartData, "trend");
        var seasonalChart = new LineVis('timeline-chart-seasonal', seasonalChartData, "seasonal");
        timeCharts = [actualChart, trendChart, seasonalChart];

        var trendChartData = [];
        var sarimaDiffChartData = [];
        var prophetDiffChartData = [];
        trendData.forEach(function(d, i) {
            var date = d3.timeParse("%m/%d/%Y")(d.ds);

            var sarVal = +d.original - +d.SARIMA;
            sarimaDiffChartData.push({date:date, value:sarVal});

            var prophetVal = +d.original - +d.Prophet;
            prophetDiffChartData.push({date:date, value:prophetVal});

            trendModels.forEach(function(m) {
                var val = +d[m];
                if (isNaN(val)) {
                    trendChartData.push({date:date, model:m , value:null});
                } else {
                    trendChartData.push({date:date, model:m, value:val});
                }

            });
        });

        trendChartData = d3.nest()
            .key(function(d) { return d.model; })
            .sortKeys(d3.ascending)
            .entries(trendChartData);

        var trendChart = new LineVis('trend-forecast-chart', trendChartData, "forecast");
        var sarimaDiffChart = new AreaVis('sarima-diff-chart', sarimaDiffChartData, "SARIMA")
        var prophetDiffChart = new AreaVis('prophet-diff-chart', prophetDiffChartData, "Prophet")


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