
AreaVis = function(_parentElement, _data, _chartType, _yScaleDomain){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.chartType = _chartType;
    this.yScaleDomain = _yScaleDomain;

    this.initVis();
};

AreaVis.prototype.initVis = function() {
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
        .domain(d3.extent(vis.data, function(d) {
            return d.date;
        }));

    vis.yScale = d3.scaleLinear()
        .rangeRound([vis.height, 0])
        .domain(vis.yScaleDomain);

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
    vis.area = d3.area()
        .x(function(d){ return vis.xScale(d.date);})
        .y0(function (d) {
            var val = Math.min(0, d.value);
            return vis.yScale(val);
        })
        .y1(function(d){
            var val = Math.max(0, d.value);
            return vis.yScale(val);
        })
        .curve(d3.curveLinear);

    d3.select("#" + vis.parentElement).select("svg").append("rect")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
        .attr("class", "overlay")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .on("mouseover", lineToolTipShow)
        .on("mouseout", lineToolTipHide)
        .on("mousemove", lineToolTipShow);

    vis.lineToolTip = vis.svg.append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', vis.height)
        .attr('y2', 5)
        .attr('stroke', 'none')
        .attr('stroke-width', '2px');

    vis.lineToolTipText = vis.svg.append('text')
        .attr('x', 0)
        .attr('y', 15)
        .attr('fill','#09091a')
        .style('font-weight', 'bold')
        .text('');

    vis.svg.append('text')
        .attr('id', 'crime-tooltip-label-' + vis.chartType)
        .attr('class', 'crime-tooltip-label')
        .attr('x', 0)
        .attr('y', 30)
        .text('');

    vis.svg.append('text')
        .attr('class', 'axis-label')
        //.attr('transform', "translate(" + vis.margin.left + "," + vis.margin.top + "), rotate(270)")
        .attr('x', 0)
        .attr('y', -10)
        .text(vis.chartType + " difference");

    vis.wrangleData();

};

AreaVis.prototype.wrangleData = function() {
    var vis = this;

    vis.displayData = vis.data;

    vis.updateVis();

};


AreaVis.prototype.updateVis = function() {
    var vis = this;

    //draw line
    var crimePath = vis.svg.selectAll(".chart-path-" + vis.chartType)
        .data([vis.displayData]);

    crimePath.enter().append("path")
        .attr("class", "chart-path chart-path-" + vis.chartType)
        .merge(crimePath)
        .transition()
        .duration(1000)
        .attr("d", vis.area)
        .attr("fill", lineColorMapping[vis.chartType]);

    crimePath.exit().remove();

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
