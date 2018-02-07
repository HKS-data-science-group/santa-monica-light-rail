
LineVis = function(_parentElement, _trendData){
    this.parentElement = _parentElement;
    this.data = _trendData;
    this.displayData = _trendData;

    this.initVis();
};

LineVis.prototype.initVis = function() {
    var vis = this;
    vis.margin = {top: 40, right: 100, bottom: 50, left: 50};

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = 250 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.xScale = d3.scaleTime()
        .range([0, vis.width])
        .domain(d3.extent(vis.data, function(d) {
            return d.time;
        }));

    vis.yScale = d3.scaleLinear()
        .rangeRound([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.xScale)
        .ticks(5);

    vis.yAxis = d3.axisLeft()
        .scale(vis.yScale)
        .tickFormat(d3.format('.0%'))
        .ticks(5);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.select(".x-axis").call(vis.xAxis);

    vis.svg.append("g")
        .attr("class", "y-axis axis");

//color domain
    vis.colorPalette = d3.scaleOrdinal()
        .range(crimeColorRange)
        .domain(crimeDomain);

// draw line
    vis.line = d3.line()
        .x(function(d){ return vis.xScale(d.time);})
        .y(function(d){return vis.yScale(d.crime);})
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

    crimeDomain.forEach(function(d, i) {
        vis.svg.append('text')
        .attr('id', 'crime-tooltip-label-' + d.charAt(0))
        .attr('x', 0)
        .attr('y', 30 + 15*i)
        .attr('fill',vis.colorPalette(d))
        .text('');
    });

    vis.svg.append('text')
        .attr('class', 'chart-footnote')
        .attr('x', 0)
        .attr('y', vis.height + 40)
        .text('*90-Day rolling average as a percentage of maximum value');

    vis.wrangleData();

};

LineVis.prototype.wrangleData = function() {
    var vis = this;

    vis.displayData = vis.data;
    vis.displayData.forEach(function(d) {
       d.crime = d['crime' + selectedRadius];
    });

    vis.yScale.domain([0, d3.max(vis.displayData, function(d) {
            return d.crime;
        })]);

    vis.displayData = d3.nest()
        .key(function(d) { return d.crimeType; })
        .sortKeys(d3.ascending)
        .entries(vis.displayData);

    vis.updateVis();

};


LineVis.prototype.updateVis = function() {
    var vis = this;

    //draw line
    var crimeLine = vis.svg.selectAll(".crime-line")
        .data(vis.displayData);

    crimeLine.enter().append("path")
        .attr("class", "crime-line")
        .merge(crimeLine)
        .transition()
        .duration(1000)
        .attr("d", function(d) {
            return vis.line(d.values);
        })
        .style("stroke", function(d){
           return vis.colorPalette(d.key);
        });

    crimeLine.exit().remove();

    var lineLabel = vis.svg.selectAll(".crime-line-label")
            .data(vis.displayData);

    lineLabel.enter()
        .append('text')
        .attr('class', 'crime-line-label')
        .merge(lineLabel)
        .transition()
        .duration(1000)
        .attr('x', vis.width + 10)
        .attr('y', function(d) {
            if (selectedRadius != 'HalfMile' || d.key == 'Larceny') {
                return vis.yScale(d.values[d.values.length - 1].crime);
            } else {
                return vis.yScale(d.values[d.values.length - 1].crime) + 10;
            }
        })
        .attr('fill', function(d) {
            return vis.colorPalette(d.key);
        })
        .text(function(d) {
            return d.key;
        });

    lineLabel.exit().remove();

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


