$(function() {
    
chart("data/genres_timeline_data.csv");

var datearray = [];

function chart(csvpath) {

    colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9",
        "#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6",
        "#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];

    strokecolor = colorrange[0];

    var format = d3.time.format("%Y");

    var margin = { top: 20, right: 40, bottom: 30, left: 30 };
    var width = document.body.clientWidth - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var tooltip = d3.select(".secondLevelMovieTimeline")
        .append("div")
        .attr("class", "tip")
        .style("position", "absolute")
        .style("z-index", "20")
        .style("visibility", "hidden")
        .style("top", 40 + margin.top + "px");

    var x = d3.time.scale()
        .range([0, width]);

    var xlin = d3.scale.linear().domain([1966, 2016]).range([0, width])

    var y = d3.scale.linear().domain([0, 1])
        .range([height - 10, 10]);

    var z = d3.scale.ordinal()
        .range(colorrange);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.timeYears, 5);

    var yAxis = d3.svg.axis()
        .scale(y);

    var yAxisr = d3.svg.axis()
        .scale(y);

    var stack = d3.layout.stack()
        .offset("expand")
        .values(function (d) { return d.values; })
        .x(function (d) { return d.fullyear; })
        .y(function (d) { return d.norm_per_year; });

    var nest = d3.nest()
        .key(function (d) { return d.genres; });

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function (d) { return x(d.fullyear); })
        //.x0(function(d){ return xlin(d.x0)})
        .y0(function (d) { return y(d.y0); })
        .y1(function (d) { return y(d.y0 + d.norm_per_year); });

    var svg = d3.select(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var graph = d3.csv(csvpath, function (data) {
        data.forEach(function (d) {
            // Cast to date and integer
            d.fullyear = format.parse(d.year);
            d.total_films = +d.total_films;
            d.norm_per_year = +d.norm_per_year;
            d.norm_per_year = Math.round(d.norm_per_year * 1000) / 1000
            //console.log(d)
        });

        var layers = stack(nest.entries(data));

        x.domain(d3.extent(data, function (d) { return d.fullyear; }));
        y.domain([0, d3.max(data, function (d) { return d.y0 + d.y; })]);
        //x.domain([0, 51]);
        //y.domain([0, 1]);
        //console.log(d3.extent(data, function (d) { return d.fullyear; }))
        //console.log(d3.max(data, function(d) { return d.y0 + d.y; }));

        svg.selectAll(".layer")
            .data(layers)
            .enter().append("path")
            .attr("class", "layer")
            .attr("d", function (d) { return area(d.values); })
            .style("fill", function (d, i) { return z(i); });


        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + width + ", 0)")
            .call(yAxis.orient("right"));

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis.orient("left"));

        svg.selectAll(".layer")
            .attr("opacity", 1)

            .on("mousemove", function (d, i) {
                mouse = d3.mouse(this);
                mousex = mouse[0];
                var invertedx = x.invert(mousex);
                currentYear = invertedx.getFullYear()
                d3.select(this)
                    .classed("hover", true)
                //tooltip.html("<p>" + d.key + "<br>" + currentYear + "</p>").style("visibility", "visible");
                var color = d3.select(this).style('fill');
                var filmsGenreYear = d.values.find(obj => {
                    return obj.year == currentYear
                }).total_films
                tooltip
                    .style("left", tipX(mousex) + "px")
                    .style("top", tipY(mouse[1]) + "px")
                    .html("<div class='year'>" + currentYear + "</div><div class='key'><div style='background:" + color + "' class='swatch'>&nbsp;</div>" + d.key + "</div><div class='value'>" + filmsGenreYear + " " + moviePlural((d.total_films)) + "</div>")
                    .style("visibility", "visible");
                changeMovieDisplay(d.key)

            })
            .on("mouseout", function (d, i) {
                svg.selectAll(".layer")
                    .transition()
                    .duration(250)
                    .attr("opacity", "1");
                d3.select(this)
                    .classed("hover", false)
                    .attr("stroke-width", "0px"),
                    tooltip.style("visibility", "hidden");
                //tooltip.html("<p>" + d.key + "<br>" + currentYear + "</p>").style("visibility", "hidden");
            })
            .on("click", function (d, i) {
                document.getElementById("movieTimeline").innerHTML = ""
                tooltip.style("visibility", "hidden");
                createSubchart(d.key)
                changeMovieDisplay(d.key)
            })
    });

}

function createSubchart(genre) {
    colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9",
        "#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6",
        "#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];

    strokecolor = colorrange[0];

    var format = d3.time.format("%Y");

    var margin = { top: 20, right: 40, bottom: 30, left: 30 };
    var width = document.body.clientWidth - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var tooltip = d3.select(".secondLevelMovieTimeline")
        .append("div")
        .attr("class", "tip")
        .style("position", "absolute")
        .style("z-index", "20")
        .style("visibility", "hidden")
        .style("top", 40 + margin.top + "px");

    var x = d3.time.scale()
        .range([0, width]);

    var xlin = d3.scale.linear().domain([1966, 2016]).range([0, width])

    var y = d3.scale.linear().domain([0, 1])
        .range([height - 10, 10]);

    var z = d3.scale.ordinal()
        .range(colorrange);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.timeYears, 5);

    var yAxis = d3.svg.axis()
        .scale(y);

    var yAxisr = d3.svg.axis()
        .scale(y);

    var stack = d3.layout.stack()
        .offset("silhouette")
        //.order("reverse")
        .values(function (d) { return d.values; })
        .x(function (d) { return d.fullyear; })
        .y(function (d) { return d.total_films; });

    var nest = d3.nest()
        .key(function (d) { return d.production_companies; });

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function (d) { return x(d.fullyear); })
        //.x0(function(d){ return xlin(d.x0)})
        .y0(function (d) { return y(d.y0); })
        .y1(function (d) { return y(d.y0 + d.total_films); });

    var svg = d3.select("#movieTimeline").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var graph = d3.csv("data/production_companies_stream.csv", function (data) {
        data.forEach(function (d) {
            // Cast to date and integer
            d.fullyear = format.parse(d.year);
            d.total_films = +d.total_films;
            d.norm_per_year = +d.norm_per_year;
            d.norm_per_year = Math.round(d.norm_per_year * 1000) / 1000
            //console.log(d)
        });
        data = data.filter((d) => {
            return d.genres == genre
        });

        var layers = stack(nest.entries(data));
        legend(layers, genre)

        x.domain(d3.extent(data, function (d) { return d.fullyear; }));
        y.domain([0, d3.max(data, function (d) { return d.y0 + d.y; })]);
        //console.log(d3.extent(data, function (d) { return d.fullyear; }))

        svg.selectAll(".layer")
            .data(layers)
            .enter().append("path")
            .attr("class", "layer")
            .attr("d", function (d) { return area(d.values); })
            .style("fill", function (d, i) { return z(i); });


        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + width + ", 0)")
            .call(yAxis.orient("right"));

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis.orient("left"));

        var vertical = d3.select(".secondLevelMovieTimeline")
            .append("div")
            .attr("class", "remove")
            .style("position", "absolute")
            .style("z-index", "19")
            .style("width", "2px")
            .style("height", "460px")
            .style("top", "10px")
            .style("bottom", "30px")
            .style("left", "0px")
            .style("background", "#fcfcfc");

        svg.selectAll(".layer")
            .attr("opacity", 1)

            .on("mousemove", function (d, i) {
                mouse = d3.mouse(this);
                mousex = mouse[0];
                var invertedx = x.invert(mousex);
                vertical.style("left", mousex + "px")
                currentYear = invertedx.getFullYear()
                d3.select(this)
                    .classed("hover", true)
                //tooltip.html("<p>" + d.key + "<br>" + currentYear + "</p>").style("visibility", "visible");
                var color = d3.select(this).style('fill');
                var filmsGenreYear = d.values.find(obj => {
                    return obj.year == currentYear
                }).total_films
                //console.log(d)
                tooltip
                    .style("left", tipX(mousex) + "px")
                    .style("top", tipY(mouse[1]) + "px")
                    .html("<div class='year'>" + currentYear + "</div><div class='key'><div style='background:" + color + "' class='swatch'>&nbsp;</div>" + d.key + "</div><div class='value'>" + filmsGenreYear + " " + moviePlural((d.total_films)) + "</div>")
                    .style("visibility", "visible");

            })
            .on("mouseout", function (d, i) {
                vertical.style("left", mousex + "px");
                svg.selectAll(".layer")
                    .transition()
                    .duration(250)
                    .attr("opacity", "1");
                d3.select(this)
                    .classed("hover", false)
                    .attr("stroke-width", "0px"),
                    tooltip.style("visibility", "hidden");
                //tooltip.html("<p>" + d.key + "<br>" + currentYear + "</p>").style("visibility", "hidden");
            })



    });
}

// generate a legend
function legend(layers, genre) {

    $('.secondLevelMovieTimeline').prepend('<div class="legend"><div class="title">' + genre + '</div></div>');
    $('.legend').hide();
    var legend = []
    layers.forEach(function (d, i) {
        var obj = {};
        if (i < 16) {
            obj.key = d.key;
            obj.color = colorrange[i];
            legend.push(obj);
        }
    });

    legend.forEach(function (d, i) {
        $('.secondLevelMovieTimeline .legend').append('<div class="item"><div class="swatch" style="background: ' + d.color + '"></div>' + d.key + '</div>');
    });

    $('.legend').fadeIn();

}


function changeMovieDisplay(genre) {
    var genreDivId = "movies-" + genre
    var movieDiv = document.getElementById(genreDivId);
    if (movieDiv.style.display == "none") {
        hideAllMovieDivs()
        movieDiv.style.display = "block"
        //console.log(movieDiv)
    }
};

function hideAllMovieDivs() {
    var parentDiv = document.getElementById('movieTimelineMoviesDisplay');
    var subs = parentDiv.children
    //console.log(subs)
    for (var i = 0; i < subs.length; i++) {
        var a = subs[i];
        //console.log(a)
        a.style.display = 'none';
    }
}

// function to decide whether to pluralize the word "movie" in the tooltip
function moviePlural(x) {
    x == 1 ? y = 'movie' : y = 'movies';
    return y;
}

// function to ensure the tip doesn't hang off the side
function tipX(x) {
    //var winWidth = $(window).width();

    var margin = { top: 20, right: 40, bottom: 30, left: 30 };
    var winWidth = document.body.clientWidth - margin.left - margin.right;
    var tipWidth = $('.tip').width();
    //x > winWidth - tipWidth - 30 ? y = x - 45 - tipWidth : y = x + 10;
    //console.log(x)
    //console.log(winWidth - tipWidth - 30)
    if (x > winWidth / 2 - tipWidth) {
        y = x - tipWidth;
        //console.log("X desno");
    } else {
        y = x + tipWidth / 2;
        //console.log("X levo");
    };
    return y;
}

function tipY(y) {
    //var winWidth = $(window).width();

    var margin = { top: 20, right: 40, bottom: 30, left: 30 };
    var winHeight = document.body.clientHeight - margin.top - margin.bottom;
    var tipHeight = $('.tip').height();
    //x > winWidth - tipWidth - 30 ? y = x - 45 - tipWidth : y = x + 10;
    //console.log(y)
    //console.log(winHeight - tipHeight - 30)
    if (y > winHeight - tipHeight - 30) {
        x = y - tipHeight
        //console.log("Y right")
    } else {
        x = y + 45;
        //console.log("Y left")
    }
    return y;
}


    $.getJSON('data/most_popular_movies.json', function (data) {

        //console.log(data)
        Object.keys(data).forEach(function (k) {
            var div = document.createElement("div");
            var genreDivId = "movies-" + k
            div.id = genreDivId;
            div.style.display = 'none'; // hide
            //console.log(div)
            document.getElementById("movieTimelineMoviesDisplay").appendChild(div);
            //console.log(k);

            $.each(data[k], function (index, value) {
                var movieDiv = document.createElement("div");
                movieDiv.id = genreDivId + "-movie-" + index;
                movieDiv.className = "movieDiv";
                //movieDiv.style.display = "inline-block"
                //movieDiv.style.border = "thick solid #0000FF"

                //movieDiv.innerHTML = value.original_title
                movieDiv.innerHTML = "<div class='tip'><div class='year'>" + value.original_title + "</div><div class='key'>" + value.tagline + "</div><div class='value'> Rating:" + value.popularity + "</div></div>";
                //div.style.display = 'none'; // hide
                //console.log(div)
                document.getElementById(genreDivId).appendChild(movieDiv);
            });
        });

    });

    $( "#movieTimelineProductionHousesButton" ).click(()=>{
        alert("Not implemented")
    })
    $( "#movieTimelineGenreButton" ).click(()=>{
        document.getElementById("movieTimeline").innerHTML = ""
        chart("genres_timeline_data.csv");
    })

});