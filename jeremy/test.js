var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


xScale.domain([d3.min(dataset, function(d) {
        return d[xValue];
    }), d3.max(dataset, function(d) {
        return d[xValue];
    })]);
    
yScale.domain([d3.min(dataset, function(d) {
        return d[yValue];
    }), d3.max(dataset, function(d) {
        return d[yValue];
    })]);

    var circles = svg.selectAll("circle").data(dataset);

circles.enter().append("circle")
    .attr({
        cx: function(d) {
            return xScale(d[xValue]);
        },
        cy: function(d) {
            return yScale(d[yValue]);
        },
        r: function(d) {
            if (d.population < 1000000) {
                return 2;
            }
            [...]
        },
        id: function(d) {
            return d.countryName;
        }
    })
    .style("stroke", "black")
    .style("fill", function(d) {
        return color(d.region);
    });