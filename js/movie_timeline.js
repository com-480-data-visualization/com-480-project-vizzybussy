$(function () {

    //https://flatuicolors.com/palette/au

    colorrange1 = ["#f6e58d", "#f9ca24", "#ffbe76", "#f0932b", "#ff7979", "#eb4d4b",
        "#badc58", "#22a6b3", "#c7ecee", "#7ed6df",
        //"#e056fd", "#686de0",
        //"#4834d4", "#30336b", "#130f40", "#C994C7", "#D4B9DA", "#F1EEF6"];
    ];

    colorrange2 = ["#eb4d4b", "#ff7979", "#ffbe76", "#f9ca24", "#f0932b", "#ff7979",
        "#c7ecee", "#95afc0", "#7ed6df", "#dff9fb",
        "#ff7979", "#badc58",
        "#6ab04c", "#f9ca24", "#f0932b"];

    colorrange3 = ["#f0932b", "#f9ca24", "#6ab04c", "#22a6b3", "#7ed6df", "#badc58",
        "#c7ecee", "#95afc0", "#686de0", "#dff9fb",
        "#ff7979", "#ffbe76",
        "#eb4d4b", "#f6e58d", "#535c68"];


    colorfrench = ["#fad390", "#f8c291", "#6a89cc", "#82ccdd", "#b8e994", "#f6b93b",
        "#badc58", "#6ab04c", "#4a69bd", "#60a3bc",
        "#78e08f", "#fa983a",
        "#b71540", "#1e3799", "#0c2461"];
    //colorrange = colorfrench

    colorau = ["#f6e58d", "#ffbe76", "#ff7979", "#badc58", "#dff9fb", "#f9ca24",
        "#f0932b", "#eb4d4b", "#6ab04c", "#c7ecee",
        "#7ed6df", "#686de0",
        "#30336b", "#22a6b3", "#4834d4"];

    colorch = ["#3742fa", "#eccc68", "#ff7f50", "#2ed573", "#7bed9f", "#f1f2f6",
        "#ff6348", "#ced6e0", "#ff4757", "#dff9fb",
        "#ff6b81", "#575fcf",
        "#1e90ff", "#747d8c", "#dfe4ea"];
    
    cbsafe = ["#648FFF","#785EF0","#d81b60", "#fe6100", "#ffb000", 
    "#648FFF","#785EF0","#d81b60", "#fe6100", "#ffb000" ,"#648FFF",
    "#785EF0","#d81b60", "#fe6100", "#ffb000"  ]

    cbsafe_genres = ['#00429d', '#245fa8', '#387cb2', '#4b99bc', '#62b6c6', 
    '#81d3cf', '#adeed8', '#ffffe0', '#ffdabb', '#ffb498', 
    '#fa8c78', '#ea685f', '#d4444b', '#b8203f', '#93003a']

    cbsafe_pcs = ['#00429d', '#2c6aac', '#4793ba', '#68bcc7', '#99e4d4',
     '#ffcbad', '#fd947e', '#e6615a', '#c42e43', '#93003a']

    chartPropertiesGenreFirstLevel = { typeGenre: true, code: "gfl", y_title:"Ratio of genre production",
                                        cssClass: ".chart", stackOffset: "expand", firstLevel: true, colorrange : colorrange3 }

    chartPropertiesPHFirstLevel = { typeGenre: false, code: "pcfl" , y_title:"Ratio of production houses' movie distribution",
                                        cssClass: ".chart", stackOffset: "expand", firstLevel: true, colorrange : colorrange1 }

    chartPropertiesGenreSecondLevel = { typeGenre: true, code: "gsl", y_title:"Number of movies per genre" ,
                                        cssClass: ".secondLevelMovieTimeline", stackOffset: "silhouette", firstLevel: false, colorrange : colorrange3 } 
    
    chartPropertiesPHSecondLevel = { typeGenre: false,  code: "pcsl", y_title:"Number of movies per production house",
                                        cssClass: ".secondLevelMovieTimeline", stackOffset: "silhouette", firstLevel: false, colorrange : colorrange1 }

    currentChartProperties = chartPropertiesGenreFirstLevel                          

    chart("all_data_stream.csv");

    function chart(csvpath) {

        colorrange = currentChartProperties.colorrange

        var format = d3.time.format("%Y");

        var margin = { top: 20, right: 40, bottom: 30, left: 30 };
        var width = document.body.clientWidth - margin.left - margin.right;
        var height = 400 - margin.top - margin.bottom;

        var tooltip = d3.select(currentChartProperties.cssClass)
            .append("div")
            .attr("class", "tip")
            .style("position", "absolute")
            .style("z-index", "20")
            .style("visibility", "hidden")
            .style("top", 40 + margin.top + "px");

        var x = d3.time.scale()
            //.range([0, width]);
            .range([1, width - 1])

        var y = d3.scale.linear().domain([0, 1])
            //.range([height - 10, 10]);
            .range([height - 1, 1]);

        var z = d3.scale.ordinal()
            .range(colorrange);

        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(d3.time.years, 5)
            .tickSize(2)

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(1)
            .tickSize(2);

        var stack = d3.layout.stack()
            .offset(currentChartProperties.stackOffset)
            .values(function (d) { return d.values; })
            .x(function (d) { return d.fullyear; })
            .y(function (d) {
                if (currentChartProperties.firstLevel)
                    return d.norm_per_year;
                else return d.total_films;
            });

        var nest = d3.nest()
            .key(function (d) {
                if (currentChartProperties.typeGenre) return d.genres;
                else return d.production_companies;
            });

        var vertical = d3.select(".secondLevelMovieTimeline")
            .append("div")
            .attr("class", "remove")
            .style("position", "absolute")
            .style("z-index", "19")
            .style("width", "2px")
            .style("height", height)
            .style("top", "30px")
            .style("bottom", "30px")
            .style("left", "0px")
            .style("margin-left", "25px")
            .style("background", "#fcfcfc");

        var area = d3.svg.area()
            .interpolate("basis")
            .x(function (d) { return x(d.fullyear); })
            .y0(function (d) { return y(d.y0); })
            .y1(function (d) {
                if (currentChartProperties.firstLevel) return y(d.y0 + d.norm_per_year);
                else return y(d.y0 + d.total_films);
            });

        var svg = d3.select(currentChartProperties.cssClass).append("svg")
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
            });
            data = data.filter((d) => {
                return d.code == currentChartProperties.code
            });
            if (!currentChartProperties.firstLevel) {
                if (currentChartProperties.typeGenre) {
                    data = data.filter((d) => {
                        return d.production_companies == currentChartProperties.group
                    });
                } else {
                    data = data.filter((d) => {
                        return d.genres == currentChartProperties.group
                    });
                }
            };

            var layers = stack(nest.entries(data));
            if (!currentChartProperties.firstLevel)
                if (currentChartProperties.typeGenre) {
                    legend(layers, currentChartProperties.group, "legend-genre")
                } else {
                    legend(layers, currentChartProperties.group, "legend-ph")
                }


            x.domain(d3.extent(data, function (d) { return d.fullyear; }));
            y.domain([0, d3.max(data, function (d) { return d.y0 + d.y; })]);

            //svg.selectAll(chartType.cssClass).transition().duration(1000)
            svg.selectAll(".layer")
                .data(layers)
                .enter().append("path")
                //.transition()
                //.duration(1000)
                //.end()
                .attr("class", "layer")
                .attr("d", function (d) { return area(d.values); })
                .style("fill", function (d, i) { return z(i); });

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis.orient("bottom"));

            // text label for the x axis
            svg.append("text")
                .attr("transform",
                    "translate(" + (width / 2) + " ," +
                    (height + margin.top + 10) + ")")
                .style("text-anchor", "middle")
                .text("Year");

            svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + width + ", 0)")
                .call(yAxis.orient("right"));

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis.orient("left"));

            // text label for the y axis
            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text(currentChartProperties.y_title);

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", width + 5)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text(currentChartProperties.y_title);

            if (currentChartProperties.firstLevel & currentChartProperties.typeGenre) showGenreLabels(svg, width)
            if (currentChartProperties.firstLevel & !currentChartProperties.typeGenre) showProductionHousesLabels(svg, width)

            svg.selectAll(".layer")
                .attr("opacity", 1)

                .on("mousemove", function (d, i) {
                    mouse = d3.mouse(this);
                    var invertedx = x.invert(mouse[0]);
                    currentYear = invertedx.getFullYear()
                    d3.select(this)
                        .classed("hover", true)
                    //tooltip.html("<p>" + d.key + "<br>" + currentYear + "</p>").style("visibility", "visible");
                    var color = d3.select(this).style('fill');
                    var filmsGenreYear = d.values.find(obj => {
                        return obj.year == currentYear
                    }).total_films

                    tooltip
                        .style("left", tipX(mouse[0]) + "px")
                        .style("top", tipY(mouse[1]) + "px")
                        .html("<div class='year'>" + currentYear + "</div><div class='key'><div style='background:" + color + "' class='swatch'>&nbsp;</div>" + d.key + "</div><div class='value'>" + filmsGenreYear + " " + moviePlural((filmsGenreYear)) + "</div>")
                        .style("visibility", "visible");

                    //console.log(d3.select(this))
                    d3.select(this)
                        .style("stroke", "#535c68")
                        .style("stroke-width", "2px");

                    if (currentChartProperties.firstLevel) {
                        changeMovieDisplay(d.key, currentChartProperties.typeGenre)
                    }
                    if (!currentChartProperties.firstLevel) {
                        vertical.style("visibility", "visible")
                        vertical.style("left", mouse[0] + "px")
                        //tooltip.style("visibility","visible")
                    }

                })
                .on("mouseout", function (d, i) {
                    svg.selectAll(".layer")
                        .transition()
                        .duration(250)
                        .attr("opacity", "1");
                    d3.select(this)
                        .classed("hover", false)
                        .attr("stroke-width", "0px")
                    d3.select(this)
                        //.style("stroke","black")
                        .style("stroke-width", "0px");
                    tooltip.style("visibility", "hidden");
                    vertical.style("visibility", "hidden")

                    //tooltip.html("<p>" + d.key + "<br>" + currentYear + "</p>").style("visibility", "hidden");
                })

                .on("click", function (d, i) {
                    if (currentChartProperties.firstLevel) {
                        document.getElementById("movieTimeline").innerHTML = ""
                        tooltip.style("visibility", "hidden");
                        if (currentChartProperties.typeGenre) {
                            // Load production companies
                            currentChartProperties = chartPropertiesPHSecondLevel
                            currentChartProperties.group = d.key
                            chart("all_data_stream.csv")
                        } else {
                            // Load genres
                            currentChartProperties = chartPropertiesGenreSecondLevel
                            currentChartProperties.group = d.key
                            chart("all_data_stream.csv")
                        }
                        $("#movieTimelineHeading").html("Movie Timeline - " + d.key);
                    }

                })
        });


    }

    function showGenreLabels(svg, width) {
        var genreLabels = [
            { "percWidth": 0.65, "cy": "7.6em", "text": "Drama", fontsize: "24px" },
            { "percWidth": 0.82, "cy": "10.4em", "text": "Family", fontsize: "14px" },
            { "percWidth": 0.85, "cy": "13.5em", "text": "Comedy", fontsize: "20px" },
            { "percWidth": 0.55, "cy": "1.7em", "text": "Thriller", fontsize: "20px" },
            { "percWidth": 0.75, "cy": "4.4em", "text": "Romance", fontsize: "18px" },
            { "percWidth": 0.39, "cy": "16.5em", "text": "Action", fontsize: "20px" },
            { "percWidth": 0.28, "cy": "16.2em", "text": "Adventure", fontsize: "18px" },
            { "percWidth": 0.14, "cy": "13em", "text": "Crime", fontsize: "18px" },
            { "percWidth": 0.28, "cy": "4.1em", "text": "Science Fiction", fontsize: "18px" },
            { "percWidth": 0.24, "cy": "0.9em", "text": "War", fontsize: "14px" },
            { "percWidth": 0.065, "cy": "1.3em", "text": "Western", fontsize: "16px" },
            { "percWidth": 0.52, "cy": "9.3em", "text": "Fantasy", fontsize: "14px" },
            { "percWidth": 0.09, "cy": "7.7em", "text": "Music", fontsize: "14px" },
            { "percWidth": 0.3, "cy": "10.1em", "text": "History", fontsize: "14px" },
            { "percWidth": 0.43, "cy": "6.9em", "text": "Horror", fontsize: "16px" }];
        genreLabels.forEach(genre => {
            svg.append("text")
                .attr("x", width * genre.percWidth)
                .attr("y", genre.cy)
                .attr("text-anchor", "middle")
                .style("font-size", genre.fontsize)
                .text(genre.text);
        })
    }

    function showProductionHousesLabels(svg, width) {
        var phLabels = [
            //{ "percWidth": 0.65, "cx": "800", "cy": "9em", "text": "Drama" },
            { "percWidth": 0.4, "cx": "130", "cy": "12em", "text": "Paramount Pictures", fontsize: "20px" },
            { "percWidth": 0.75, "cx": "250", "cy": "1.7em", "text": "Warner Bros.", fontsize: "20px" },
            { "percWidth": 0.85, "cx": "550", "cy": "18.5em", "text": "Columbia Pictures", fontsize: "18px" },
            { "percWidth": 0.87, "cx": "550", "cy": "12.7em", "text": "Relativity Media", fontsize: "16px" },
            { "percWidth": 0.12, "cx": "550", "cy": "12.5em", "text": "Twenty", fontsize: "16px" },
            { "percWidth": 0.12, "cx": "550", "cy": "13.5em", "text": "Century Fox", fontsize: "16px" },
            { "percWidth": 0.65, "cy": "5.5em", "text": "Universal Pictures", fontsize: "20px" }];
        phLabels.forEach(ph => {
            svg.append("text")
                .attr("x", width * ph.percWidth)
                .attr("y", ph.cy)
                .attr("text-anchor", "middle")
                .style("font-size", ph.fontsize)
                .text(ph.text);
        })
    }

    // generate a legend
    function legend(layers, genre, className) {

        $('.secondLevelMovieTimeline').prepend('<div class="legend float-container ' + className + '"></div>');
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
            $('.secondLevelMovieTimeline .legend').append('<div class="item float-child"><div class="swatch" style="background: ' + d.color + '"></div>' + d.key + '</div>');
        });

        $('.legend').fadeIn();

    }


    function changeMovieDisplay(genre) {
        var genreDivId = "movies-" + genre
        var movieDiv = document.getElementById(genreDivId);
        if (movieDiv.style.display == "none") {
            hideAllMovieDivs()
            movieDiv.style.display = "block"
        }

        if (currentChartProperties.typeGenre) {
            //console.log(most_popular_movies_per_genre[genre])
        }
        currentData = most_popular_movies_per_genre[genre]
        for (var i = 0; i < 5; i++) {
            var movie = currentData[i];
            var currentCard = document.getElementById('movieDisplayCard' + (i + 1));
            console.log(currentCard.getElementsByClassName('card-title'))
            currentCard.getElementsByClassName('card-title')[0].textContent = movie.original_title
            currentCard.getElementsByClassName('card-subtitle')[0].textContent = movie.tagline
            currentCard.getElementsByClassName('card-text')[0].textContent = movie.overview
        }
    };

    function hideAllMovieDivs() {
        var parentDiv = document.getElementById('movieTimelineMoviesDisplay');
        var subs = parentDiv.children
        for (var i = 0; i < subs.length; i++) {
            var a = subs[i];
            a.style.display = 'none';
        }
    }

    // function to decide whether to pluralize the word "movie" in the tooltip
    function moviePlural(x) {
        return x == 1 ? 'movie' : 'movies';
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
            y = x - tipWidth * 1.2;
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
            x = y + tipHeight / 2;
            //console.log("Y left")
        }
        return y;
    }

    var most_popular_movies_per_genre;
    $.getJSON('most_popular_movies_per_genre.json', function (data) {
        most_popular_movies_per_genre = data
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

    var most_popular_movies_per_pc;
    $.getJSON('most_popular_movies_per_pc.json', function (data) {
        most_popular_movies_per_pc = data
        Object.keys(data).forEach(function (k) {
            var div = document.createElement("div");
            var pcDivId = "movies-" + k
            div.id = pcDivId;
            div.style.display = 'none'; // hide
            document.getElementById("movieTimelineMoviesDisplay").appendChild(div);

            $.each(data[k], function (index, value) {
                var movieDiv = document.createElement("div");
                movieDiv.id = pcDivId + "-movie-" + index;
                movieDiv.className = "movieDiv";
                movieDiv.innerHTML = "<div class='tip'><div class='year'>" + value.original_title + "</div><div class='key'>" + value.tagline + "</div><div class='value'> Rating:" + value.popularity + "</div></div>";
                document.getElementById(pcDivId).appendChild(movieDiv);
            });
        });

    });

    $("#movieTimelineProductionHousesButton").click(() => {
        document.getElementById("movieTimeline").innerHTML = ""
        currentChartProperties = chartPropertiesPHFirstLevel
        console.log(currentChartProperties)
        chart("all_data_stream.csv");
        $("#movieTimelineHeading").html("Movie Timeline");
    })
    $("#movieTimelineGenreButton").click(() => {
        document.getElementById("movieTimeline").innerHTML = ""
        currentChartProperties = chartPropertiesGenreFirstLevel
        chart("all_data_stream.csv");
        $("#movieTimelineHeading").html("Movie Timeline");
    })

    $("#movieTimelineHeading").html("Movie Timeline");

});