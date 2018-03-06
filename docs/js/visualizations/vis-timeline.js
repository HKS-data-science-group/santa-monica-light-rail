
LineVis = function(_parentElement, _data, _chartType, _xScaleDomain){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.chartType = _chartType;
    this.xScaleDomain = _xScaleDomain;

    this.initVis();
};

LineVis.prototype.initVis = function() {
    var vis = this;
    vis.margin = {top: 40, right: 40, bottom: 50, left: 40};

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;

    vis.height = 150 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.xScale = d3.scaleTime()
        .range([0, vis.width])
        .domain(vis.xScaleDomain);

    vis.yScale = d3.scaleLinear()
        .rangeRound([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.xScale)
        .ticks(5);

    vis.yAxis = d3.axisLeft()
        .scale(vis.yScale)
        .ticks(4);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.select(".x-axis").call(vis.xAxis);

    vis.svg.append("g")
        .attr("class", "y-axis axis");

// draw line
    vis.line = d3.line()
        .x(function(d){ return vis.xScale(d.date);})
        .y(function(d){return vis.yScale(d.value);})
        .curve(d3.curveLinear);

    if (vis.chartType != 'forecast') {
        vis.svg.append('text')
            .attr('class', 'axis-label')
            //.attr('transform', "translate(" + vis.margin.left + "," + vis.margin.top + "), rotate(270)")
            .attr('x', 0)
            .attr('y', -10)
            .text(vis.chartType);
    }

    vis.wrangleData();

};

LineVis.prototype.wrangleData = function() {
    var vis = this;

    if (vis.chartType == "forecast") {
        vis.displayData = vis.data;
    } else {
        vis.displayData = vis.data.filter(function(d) {
            return d.key == selectedCrimeType;
        });
    }


    vis.yScale.domain([d3.min(vis.displayData, function(d) {
        return d3.min(d.values, function(b) { return b.value; });
    }), d3.max(vis.displayData, function(d) {
        return d3.max(d.values, function(b) { return b.value; });
    })]);

    vis.updateVis();

};


LineVis.prototype.updateVis = function() {
    var vis = this;

    //draw line
    var crimeLine = vis.svg.selectAll(".chart-line-" + vis.chartType)
        .data(vis.displayData);

    crimeLine.enter().append("path")
        .attr("class", "chart-line chart-line-" + vis.chartType)
        .merge(crimeLine)
        .transition()
        .duration(1000)
        .attr("d", function(d) {
            return vis.line(d.values);
        })
        .attr("stroke", function(d) {
            return lineColorMapping[d.key];
        });

    crimeLine.exit().remove();

    var metroLine = vis.svg.selectAll(".expo-opening-line")
        .data([{time:d3.timeParse("%Y-%m-%d")("2016-05-20")}]);

    metroLine.enter()
        .append('line')
        .attr('class', 'expo-opening-line')
        .merge(metroLine)
        .transition()
        .duration(1000)
        .attr('x1', function(d) {
            return vis.xScale(d.time);
        })
        .attr('x2', function(d) {
            return vis.xScale(d.time);
        })
        .attr('y1', -30)
        .attr('y2', vis.height);

    metroLine.exit().remove();

    var metroLineLabel = vis.svg.selectAll(".expo-opening-line-label")
        .data([{time:d3.timeParse("%Y-%m-%d")("2016-05-20"), value: "Expo Line Opens"}]);

    metroLineLabel.enter()
        .append('text')
        .attr('class', 'expo-opening-line-label')
        .merge(metroLineLabel)
        .transition()
        .duration(1000)
        .attr('x', function(d) {
            return vis.xScale(d.time) - 5;
        })
        .attr('y', -20)
        .text(function(d) {
            return d.value;
        });

    metroLineLabel.exit().remove();

    vis.svg.select(".y-axis").transition().duration(1000).call(vis.yAxis);

};
