
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

        var decompositionChartsDomain = d3.extent(timeData, function(d) {
            return d3.timeParse("%Y-%m-%d")(d.date)
        });

        var actualChart = new LineVis('timeline-chart-actual', actualChartData, "actual", decompositionChartsDomain);
        var trendChart = new LineVis('timeline-chart-trend', trendChartData, "trend", decompositionChartsDomain);
        var seasonalChart = new LineVis('timeline-chart-seasonal', seasonalChartData, "seasonal", decompositionChartsDomain);
        timeCharts = [actualChart, trendChart, seasonalChart];
        timeCharts.forEach(function(d) {
            createToolTip(d);
        });

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

        var forecastChartsDomain = d3.extent(trendData, function(d) {
            return d3.timeParse("%m/%d/%Y")(d.ds)
        });

        var diffChartsDomain = d3.extent(sarimaDiffChartData, function(d) {return d.value; })
                                .concat(d3.extent(prophetDiffChartData, function(d) {return d.value; }));

        diffChartsDomain = d3.extent(diffChartsDomain);

        var trendChart = new LineVis('trend-forecast-chart', trendChartData, "forecast", forecastChartsDomain);
        var sarimaDiffChart = new AreaVis('sarima-diff-chart', sarimaDiffChartData, "SARIMA", diffChartsDomain);
        var prophetDiffChart = new AreaVis('prophet-diff-chart', prophetDiffChartData, "Prophet", diffChartsDomain);

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

        var data = chart.displayData[0].values;

        var i = bisectDate(data, x0, 1);
        var d0 = data[i - 1];
        var d1 = data[i];
        var dA = x0 - d0.date > d1.date - x0 ? d1 : d0;
        d3.select('#crime-tooltip-label-' + chart.chartType)
          .attr('x', chart.xScale(x0) + 5)
          .text(d3.format(",.0f")(dA.value));

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

function createToolTip(chart) {
    chart.lineToolTip = chart.svg.append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', chart.height)
        .attr('y2', 5)
        .attr('stroke', 'none')
        .attr('stroke-width', '2px');

    chart.lineToolTipText = chart.svg.append('text')
        .attr('x', 0)
        .attr('y', 15)
        .attr('fill','#09091a')
        .style('font-weight', 'bold')
        .text('');

    chart.svg.append('text')
        .attr('id', 'crime-tooltip-label-' + chart.chartType)
        .attr('class', 'crime-tooltip-label')
        .attr('x', 0)
        .attr('y', 30)
        .text('');

    d3.select("#" + chart.parentElement).select("svg").append("rect")
        .attr("transform", "translate(" + chart.margin.left + "," + chart.margin.top + ")")
        .attr("class", "overlay")
        .attr("width", chart.width)
        .attr("height", chart.height)
        .on("mouseover", lineToolTipShow)
        .on("mouseout", lineToolTipHide)
        .on("mousemove", lineToolTipShow);
}