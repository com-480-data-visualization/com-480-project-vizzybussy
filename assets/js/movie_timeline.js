$(function () {

    // Define different color palette
    // https://flatuicolors.com/palette/au

    colorrange1 = ["#f6e58d", "#f9ca24", "#ffbe76", "#f0932b", "#ff7979", "#eb4d4b",
        "#badc58", "#22a6b3", "#c7ecee", "#7ed6df",];

    colorrange3 = ["#f0932b", "#f9ca24", "#6ab04c", "#22a6b3", "#7ed6df", "#badc58",
        "#c7ecee", "#95afc0", "#686de0", "#dff9fb",
        "#ff7979", "#ffbe76", "#eb4d4b", "#f6e58d", "#535c68"];

    cbsafe_genres = ['#00429d', '#245fa8', '#387cb2', '#4b99bc', '#62b6c6',
        '#81d3cf', '#adeed8', '#ffffe0', '#ffdabb', '#ffb498',
        '#fa8c78', '#ea685f', '#d4444b', '#b8203f', '#93003a']

    cbsafe_pcs = ['#00429d', '#2c6aac', '#4793ba', '#68bcc7', '#99e4d4',
        '#ffcbad', '#fd947e', '#e6615a', '#c42e43', '#93003a']


    // Define properties for each view of the vizualization
    chartPropertiesGenreFirstLevel = {
        typeGenre: true, code: "gfl", y_title: "Ratio of genre production",
        cssClass: ".chart", stackOffset: "expand", firstLevel: true, colorrange: colorrange3
    }

    chartPropertiesPHFirstLevel = {
        typeGenre: false, code: "pcfl", y_title: "Ratio of production houses' movie distribution",
        cssClass: ".chart", stackOffset: "expand", firstLevel: true, colorrange: colorrange1
    }

    chartPropertiesGenreSecondLevel = {
        typeGenre: true, code: "gsl", y_title: "Number of movies per genre",
        cssClass: ".secondLevelMovieTimeline", stackOffset: "silhouette", firstLevel: false, colorrange: colorrange3
    }

    chartPropertiesPHSecondLevel = {
        typeGenre: false, code: "pcsl", y_title: "Number of movies per production house",
        cssClass: ".secondLevelMovieTimeline", stackOffset: "silhouette", firstLevel: false, colorrange: colorrange1
    }

    // Function that draws the viz 
    function chart(csvpath) {

        colorrange = currentChartProperties.colorrange

        if (colorBlindChecked) {
            if (currentChartProperties.typeGenre) colorrange = cbsafe_genres
            else colorrange = cbsafe_pcs
        }

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

        var x = d3.time.scale().range([1, width - 1])

        var y = d3.scale.linear().domain([0, 1]).range([height - 1, 1]);

        var z = d3.scale.ordinal().range(colorrange);

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


        d3.csv(csvpath, function (data) {
            // Parse the data and filter the data needed for the graph
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

            x.domain(d3.extent(data, function (d) { return d.fullyear; }));
            y.domain([0, d3.max(data, function (d) { return d.y0 + d.y; })]);

            svg.selectAll(".layer")
                .data(layers)
                .enter().append("path")
                .attr("class", "layer")
                .attr("d", function (d) { return area(d.values); })
                .style("fill", function (d, i) { return z(i); });

            // X-axis settings
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis.orient("bottom"));

            svg.append("text")
                .attr("transform",
                    "translate(" + (width / 2) + " ," +
                    (height + margin.top + 10) + ")")
                .style("text-anchor", "middle")
                .text("Year");

            // Y-axis settings
            svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + width + ", 0)")
                .call(yAxis.orient("right"));

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis.orient("left"));

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

            // If first level display category names on the graph
            if (currentChartProperties.firstLevel & currentChartProperties.typeGenre) showGenreLabels(svg, width)
            if (currentChartProperties.firstLevel & !currentChartProperties.typeGenre) showProductionHousesLabels(svg, width)

            // If second level display legend
            if (!currentChartProperties.firstLevel)
                if (currentChartProperties.typeGenre) {
                    legend(layers, "legend-genre")
                } else {
                    legend(layers, "legend-ph")
                }

            // Define events
            svg.selectAll(".layer")
                .attr("opacity", 1)

                .on("mousemove", function (d, i) {
                    mouse = d3.mouse(this);
                    var invertedx = x.invert(mouse[0]);
                    currentYear = invertedx.getFullYear()
                    d3.select(this).classed("hover", true)
                    var color = d3.select(this).style('fill');
                    var filmsGenreYear = d.values.find(obj => {
                        return obj.year == currentYear
                    }).total_films

                    // Show tooltip
                    tooltip
                        .style("left", tipX(mouse[0]) + "px")
                        .style("top", mouse[1] + "px")
                        .html("<div class='year'>" + currentYear + "</div><div class='key'><div style='background:" + color + "' class='swatch'>&nbsp;</div>" + d.key + "</div><div class='value'>" + filmsGenreYear + " " + moviePlural((filmsGenreYear)) + "</div>")
                        .style("visibility", "visible");

                    // Highlight selection
                    d3.select(this)
                        .style("stroke", "#535c68")
                        .style("stroke-width", "2px");

                    // Change movie representatives
                    if (currentChartProperties.firstLevel) {
                        changeMovieDisplay(d.key, color)
                    }
                    // Show vertical line for second level chart
                    if (!currentChartProperties.firstLevel) {
                        vertical.style("visibility", "visible")
                        vertical.style("left", mouse[0] + "px")
                    }

                })
                .on("mouseover", function (d, i) {
                    // Highlight the selection
                    svg.selectAll(".layer").transition()
                        .duration(250)
                        .attr("opacity", function (d, j) {
                            return j != i ? 0.8 : 1;
                        })
                })
                .on("mouseout", function (d, i) {
                    // Hide tooltip, vertical line and highlighted selection
                    svg.selectAll(".layer")
                        .transition()
                        .duration(250)
                        .attr("opacity", "1");
                    d3.select(this)
                        .classed("hover", false)
                        .attr("stroke-width", "0px")
                    d3.select(this)
                        .style("stroke-width", "0px");
                    tooltip.style("visibility", "hidden");
                    vertical.style("visibility", "hidden");
                })

                .on("click", function (d, i) {
                    // Click only works if it is first level chart
                    if (currentChartProperties.firstLevel) {
                        tooltip.style("visibility", "hidden");
                        if (currentChartProperties.typeGenre) {
                            // Load production companies second level for selected genre
                            currentChartProperties = chartPropertiesPHSecondLevel
                            currentChartProperties.group = d.key
                            $("#movieTimeline").children().last().fadeOut(400, function () {
                                $("#movieTimeline").html("")
                                chart("data/all_data_stream.csv");
                            });
                        } else {
                            // Load genres second level for selected production company
                            currentChartProperties = chartPropertiesGenreSecondLevel
                            currentChartProperties.group = d.key
                            $("#movieTimeline").children().last().fadeOut(400, function () {
                                $("#movieTimeline").html("")
                                chart("data/all_data_stream.csv")
                            });

                        }
                        // Add heading to the chart
                        $("#movieTimelineHeading").html(d.key);
                    }

                })
        });


    }

    // Function for displaying the labels for genres on the graph
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
                .style("font-family", "Raleway")
                .style("font-style", "italic")
                .style("font-weight", 500)
                .style("pointer-events", "none")
                .text(genre.text);
        })
    }

    // Function for displaying the labels for production houses on the graph
    function showProductionHousesLabels(svg, width) {
        var phLabels = [
            { "percWidth": 0.45, "cy": "9.7em", "text": "Paramount Pictures", fontsize: "20px" },
            { "percWidth": 0.57, "cy": "1.7em", "text": "Warner Bros.", fontsize: "20px" },
            { "percWidth": 0.55, "cy": "16.5em", "text": "Columbia Pictures", fontsize: "18px" },
            { "percWidth": 0.86, "cy": "10.8em", "text": "Relativity Media", fontsize: "16px" },
            { "percWidth": 0.115, "cy": "17em", "text": "20th Century", fontsize: "18px" },
            { "percWidth": 0.115, "cy": "18em", "text": "Studios", fontsize: "18px" },
            { "percWidth": 0.67, "cy": "10.5em", "text": "Touchstone Pictures", fontsize: "14px" },
            { "percWidth": 0.36, "cy": "18.7em", "text": "Metro-Goldwyn-Mayer (MGM)", fontsize: "14px" },
            { "percWidth": 0.7, "cy": "16.5em", "text": "New Line Cinema", fontsize: "14px" },
            { "percWidth": 0.75, "cy": "5em", "text": "Walt Disney", fontsize: "16px" },
            { "percWidth": 0.33, "cy": "6.9em", "text": "Universal Pictures", fontsize: "18px" }];
        phLabels.forEach(ph => {
            svg.append("text")
                .attr("x", width * ph.percWidth)
                .attr("y", ph.cy)
                .attr("text-anchor", "middle")
                .style("font-size", ph.fontsize)
                .style("font-family", "Raleway")
                .style("font-style", "italic")
                .style("font-weight", 500)
                .style("pointer-events", "none")
                .text(ph.text);
        })
    }

    // Generate a legend
    function legend(layers, className) {

        $(".legend").html("")
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

    // Change display of movie representatives
    function changeMovieDisplay(key, color) {

        if (currentChartProperties.typeGenre) {
            currentData = most_popular_movies_per_genre[key]
        } else {
            currentData = most_popular_movies_per_pc[key]
        }
        for (var i = 0; i < 4; i++) {
            var movie = currentData[i];
            populateMovieDiv(i, key, movie, color)
        }
        shrinkTextWhenTooBig()

    };

    // Randomly choose movie representatives when the page is loaded
    function setInitialMovieDisplay() {
        currentData = most_popular_movies_per_genre
        for (var i = 0; i < 4; i++) {
            // get random genre
            var colorKey = genreColors[Math.floor(Math.random() * genreColors.length)]
            var key = colorKey.name
            var color = colorKey.color
            // get random movie from that genre
            var movie = currentData[key][Math.floor(Math.random() * currentData[key].length)]
            populateMovieDiv(i, key, movie, color)

        }
        shrinkTextWhenTooBig()
    }

    // Function to create a display for movie representative
    function populateMovieDiv(i, key, movie, color) {
        var currentCard = document.getElementById('movieDisplayCard' + (i + 1));
        currentCard.getElementsByClassName('card-header')[0].style.backgroundColor = color;
        currentCard.style.borderColor = color;
        if (key == "Metro-Goldwyn-Mayer (MGM)") {
            currentCard.getElementsByClassName('movie-timeline-key')[0].textContent = "MGM"
        } else {
            currentCard.getElementsByClassName('movie-timeline-key')[0].textContent = key
        }
        currentCard.getElementsByClassName('card-title')[0].textContent = movie.original_title
        currentCard.getElementsByClassName('card-subtitle')[0].textContent = movie.tagline
        currentCard.getElementsByClassName('timeline-movie-year')[0].innerHTML = new Date(movie.release_date).getFullYear()
        currentCard.getElementsByClassName('timeline-movie-year')[0].style.display = "block"
        var posterDivId = "#timeline_movie_poster_" + (i + 1)
        setMovieImage(posterDivId, movie.id)
    }

    // Function that shrinks the text so it fits the card
    function shrinkTextWhenTooBig() {
        var allCardBodies = $('.fitin')
        allCardBodies.each((i, elem) => {
            var divHeight = elem.clientHeight
            var titleHeight = elem.getElementsByClassName('card-title')[0].clientHeight
            var subtitleHeight = elem.getElementsByClassName('card-subtitle')[0].clientHeight
            var genreDivHeight = $('.card-header').children()[0].clientHeight
            if (titleHeight + subtitleHeight > divHeight - genreDivHeight) {
                console.log("Enter")
                elem.getElementsByClassName('card-subtitle')[0].innerHTML = ""
            }
        })
    }

    // Function to decide whether to pluralize the word "movie" in the tooltip
    function moviePlural(x) {
        return x == 1 ? 'movie' : 'movies';
    }

    // function to ensure the tip doesn't hang off the side
    function tipX(x) {
        var margin = { top: 20, right: 40, bottom: 30, left: 30 };
        var winWidth = document.body.clientWidth - margin.left - margin.right;
        var tipWidth = $('.tip').width();
        if (x > winWidth / 2 - tipWidth) {
            y = x - tipWidth * 1.2;
        } else {
            y = x + tipWidth / 2;
        };
        return y;
    }

    // Load colorscheme for genres
    var genreColors;
    $.getJSON('data/colors.json', function (data) {
        genreColors = data
    });

    // Load movie representatives for each genre
    var most_popular_movies_per_genre;
    $.getJSON('data/most_popular_movies_per_genre.json', function (data) {
        most_popular_movies_per_genre = data
        setInitialMovieDisplay()
    })

    
    // Load movie representatives for each production house
    var most_popular_movies_per_pc;
    $.getJSON('data/most_popular_movies_per_pc.json', function (data) {
        most_popular_movies_per_pc = data
    });

    // Generate new graph on click Production houses button
    $("#movieTimelineProductionHousesButton").click(() => {
        if (!loading) {
            loading = true
            $('.legend').fadeOut();
            $("#movieTimeline").children().last().fadeOut(400, function () {
                loading = false
                currentChartProperties = chartPropertiesPHFirstLevel
                chart("data/all_data_stream.csv");
                $("#movieTimelineHeading").html("");
            });
        }
    })
    
    // Generate new graph on click genres button
    $("#movieTimelineGenreButton").click(() => {
        if (!loading) {
            loading = true
            $('.legend').fadeOut();
            $("#movieTimeline").children().last().fadeOut(400, function () {
                loading = false
                currentChartProperties = chartPropertiesGenreFirstLevel
                chart("data/all_data_stream.csv");
                $("#movieTimelineHeading").html("");
            });
        }
    })

    // Change color palette on click
    $("#movieTimelineColorblindPalette").click(() => {
        if (!loading & !colorBlindChecked) {
            loading = true
            colorBlindChecked = !colorBlindChecked
            $("#movieTimeline").children().last().fadeOut(400, function () {
                loading = false
                chart("data/all_data_stream.csv")
            });
        }
    })
    // Change color palette on click
    $("#movieTimelineDefaultPalette").click(() => {
        if (!loading & colorBlindChecked) {
            loading = true
            colorBlindChecked = !colorBlindChecked
            $("#movieTimeline").children().last().fadeOut(400, function () {
                loading = false
                chart("data/all_data_stream.csv")
            });
        }
    })

    // Start with genres chart
    currentChartProperties = chartPropertiesGenreFirstLevel
    var colorBlindChecked = false
    var loading = false
    chart("data/all_data_stream.csv");
    $("#movieTimelineHeading").html("");

});