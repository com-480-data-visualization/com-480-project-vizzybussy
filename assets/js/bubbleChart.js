//https://observablehq.com/@will-r-chase/scatter-plot
// set the dimensions and margins of the graph
var margin = { top: 40, right: 30, bottom: 80, left: 70 },
    width = $("#graphContainer").width() - margin.left - margin.right,
    height = Math.max($("#movie_info").height() + margin.top + margin.bottom + 170, Math.min($(window).height(), $("#graphContainer").width() * 0.5)) - 170 - margin.top - margin.bottom;


var config = {
    opacity_data_point_hover: "0.9",
    opacity_data_point_no_hover: "0.5",
    color_no_genre_data_point: "#444444",

    graph_background_color: "#FFFFFF",

    slider_max_year: 2016,
    slider_min_year: 1966,

    //graph axis
    xaxis_min: 1000000,
    xaxis_max: 4000000000,
    yaxis_min: 1,
    yaxis_max: 1000,
    zaxis_min: 7000,
    zaxis_max: 1000000000,

    //time where the error message is displayed to user when movie is not found
    movie_not_found_display_timeout: 2000,

    //time to wait until advancing pointer
    timeline_default_speed: 450,
    timeline_max_speed: 100,
    timeliine_min_speed: 1000,
    timeline_click_spep_size: 100
}

genreColors = {
    Adventure: "#f0932b",
    Action: "#f9ca24",
    Comedy: "#6ab04c",
    Crime: "#22a6b3",
    Drama: "#7ed6df",
    Family: "#badc58",
    Fantasy: "#c7ecee",
    History: "#95afc0",
    Horror: "#686de0",
    Music: "#dff9fb",
    Romance: "#ff7979",
    "Science Fiction": "#ffbe76",
    Thriller: "#eb4d4b",
    War: "#f6e58d",
    Western: "#535c68"
}




//https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-4-user-7de7dfcae838579a18f4eebc5b8847230d154718e481c5cd01c477cfcbc85993.svg

//timer for auto advance of timeliine
$("#timelineControl").attr("onclick", "timelineAction()")

var myTimerSpeed = config.timeline_default_speed;
var myTimelineTimer = null
$("#speedIncrease").click(() => { myTimerSpeed = Math.max(myTimerSpeed - config.timeline_click_spep_size, config.timeline_max_speed); })
$("#speedDecrease").click(() => { myTimerSpeed = Math.min(myTimerSpeed + config.timeline_click_spep_size, config.timeliine_min_speed); })


var startTimelineTimer = () => {
    myTimelineTimer = setInterval(() => {
        $("#year_selector").slider("value", $("#year_selector").slider("value") + 1);
        clearInterval(myTimelineTimer)
        if ($("#year_selector").slider("value") == config.slider_max_year) {
            myTimelineTimer = null
            $("#timelineControl").text("Start")
        } else {
            startTimelineTimer()
        }
    }, myTimerSpeed)
}
var timelineAction = () => {
    if (myTimelineTimer == null) {
        $("#timelineControl").text("Stop")
        startTimelineTimer();
    } else {
        clearInterval(myTimelineTimer)
        myTimelineTimer = null
        $("#timelineControl").text("Start")
    }
}


// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

//background color
svg.append("rect")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("fill", config.graph_background_color)


svg = svg.append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")
    .style("font", "20px Montserrat");

// Add X axis
var x = d3.scaleLog()
    .domain([config.xaxis_min, config.xaxis_max])
    .range([0, width]);



let tickLabels = ['1M', '2M', '3M', '4M', '5M', '6M', '7M', '8M', '9M', '10M', '20M', '30M', '40M', '50M', '60M', '70M', '80M', '90M', '100M', '200M', '300M', '400M', '500M', '600M', '700M', '800M', '900M', '1B', '2B', '3B'];
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat((d, i) => tickLabels[i]))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");;

// Add Y axis
var y = d3.scaleLog()
    .domain([config.yaxis_min, config.yaxis_max]).nice()
    .range([height, 0]);
svg.append("g")
    .call(d3.axisLeft(y).tickFormat(d3.format(",d")));

// Add a scale for bubble size
var z = d3.scaleSqrt()
    .domain([config.zaxis_min, config.zaxis_max])
    .range([1, 60]);

//title
svg.append("text")
    .attr("class", "text")
    .attr("transform", "translate(" + (width / 2.5) + ",-" + margin.top / 2 + ")")
    .style("text-anchor", "left")
    .style("font-size", "1.2em")
    .text("Popularity vs Revenue")




//x-axis label
svg.append("text")
    .attr("class", "text")
    .attr("transform", "translate(" + (width / 2) + "," + (height + 60) + ")")
    .style("text-anchor", "middle")
    .style("font-size", "1em")
    .text("Revenue");

//y-axis label
svg.append("text")
    .attr("class", "text")
    .attr("transform", "translate(" + (0 - 40) + "," + (height / 2) + ")rotate(-90)")
    .style("text-anchor", "middle")
    .style("font-size", "1em")
    .text("Popularity");




var keepMovieInfoDisplayed = { display: false }
var displayMovieInfo = (d) => {
    if (d.datum != null) { d = d.datum }//can be called from the voronoiIntercationArea or the datapoint
    if (!keepMovieInfoDisplayed.display) {
        d3.selectAll(("#data_uid_" + d.id))
            .style("opacity", config.opacity_data_point_hover)
            .attr("stroke", "black")

        $("#tutorialDisplay").hide()

        d3.select("#tutorialDisplay")
            .attr("style", "display: none;")
        var movieDivInfo = d3.select("#movie_info")
            .append("div")
            .attr("class", "overflow-auto")
            .attr("style", "height:" + (height + margin.top + margin.bottom) + "px;")
            //.attr("style","border: 8px solid #f7f7f7;")
            .attr("id", "selectedMovieInfoDisplay")
            .append("div")
            .attr("style", "overflow-x: hidden;")

        var movieDiv = movieDivInfo
            .append("div")

        var moneyDiv = movieDivInfo
            .append("div")
            .attr("id", "budgetDiv")
            .attr("class", "row")

        var popularityDiv = movieDivInfo
            .append("div")
            .attr("class", "row")
            .attr("style", "margin-top:-0.6em")


        var creditsDiv = movieDivInfo
            .append("div")
            .attr("class", "row")
            .attr("id", "creditMovieDiv")

        movieDiv
            .append("div")
            .attr("class", "row")
            .append("div")
            .attr("class", "col")
            .append("h3")
            .attr("class", "d-flex justify-content-center text-center")
            .text(d.original_title)
        movieDiv
            .append("div")
            .attr("class", "row")
            .append("div")
            .attr("class", "col")
            .append("h5")
            .attr("class", "d-flex justify-content-center text-center")
            .text(d.realease_year)


        movieDiv
            .append("div")
            .attr("class", "row")
            .append("div")
            .attr("class", "cols-sm-1 center-block")
            .append('a')
            .attr("id", "movieInfoImgLink")
            .append("div")
            .attr("class", "d-flex justify-content-center")
            .append("img")
            .attr('class', "img-fluid rounded")
            .attr("style", "width:50%;")
            .attr("id", "movieInfoImg")

        movieDiv
            .append("div")
            .attr("class", "row")
            .append("div")
            .attr("class", "cols-sm-1 center-block")
            .append('a')
            .attr("id", "movieInfoYoutubeLink")
            .append("div")
            .attr("class", "d-flex justify-content-center")
            .append("img")
            .attr('class', "img-fluid rounded")
            .attr("style", "width:15%;")
            .attr("src", "./assets/img/youtube.svg")

        setMovieImage("#movieInfoImg", d.id, movieInfoImgLink = "#movieInfoImgLink", creditMovieDiv = "#creditMovieDiv", movieInfoYoutubeLink = "#movieInfoYoutubeLink", verbose = true)

        moneyDiv
            .append("div")
            .attr("class", "col-sm-4")
            .append("img")
            .attr("class", "img-responsive mx-auto d-block")
            .attr("src", "https://img.icons8.com/bubbles/75/000000/money.png")

        moneyDiv
            .append("div")
            .attr("class", "col-sm-8")
            .append("div")
            .attr("class", "container d-flex h-100")
            .append("div")
            .attr("class", "row align-self-center")
            .html("<div style='font-size: 80%;'>BUDGET : " + customCurrencyFormatter(d.budget) + "<p>" + "REVENUE : " + customCurrencyFormatter(d.revenue) + "</div>")

        popularityDiv
            .append("div")
            .attr("class", "col-sm-4")
            .append("img")
            .attr("class", "img-responsive mx-auto d-block")
            .attr("style", "padding-bottom:1em")
            .attr("src", "https://img.icons8.com/bubbles/75/000000/crowd.png")

        popularityDiv
            .append("div")
            .attr("class", "col-sm-8")
            .append("div")
            .attr("class", "container d-flex h-100")
            .append("div")
            .attr("class", "row  align-self-center")
            .html("<div style='font-size: 80%;'>POPULARITY : " + parseFloat(d.popularity).toFixed(1) + "</div>")


    }
}
var removeMovieInfo = (d) => {
    if (d.datum != null) { d = d.datum } //can be called from the voronoiIntercationArea or the datapoint

    if (!keepMovieInfoDisplayed.display) {

        $("div[id^='selectedMovieInfoDisplay']").each(function () {
            this.remove()
        });

        //$("#movie_info").css("font-size", "0.6em")

        $("#tutorialDisplay").show() //redisplaying the tutorial

        d3.selectAll(("#data_uid_" + d.id))
            .style("opacity", config.opacity_data_point_no_hover)
            .attr("stroke", "none")


    }
}





var permanentMovieDisplay = (d) => {
    if (d.datum != null) { d = d.datum }
    if (keepMovieInfoDisplayed.d == null) {
        keepMovieInfoDisplayed.display = !keepMovieInfoDisplayed.display
        keepMovieInfoDisplayed.d = d
        if (!keepMovieInfoDisplayed.display) {
            removeMovieInfo(keepMovieInfoDisplayed.d)
            delete keepMovieInfoDisplayed.d
        } else {
            displayMovieInfo(keepMovieInfoDisplayed.d)
        }

    } else {
        keepMovieInfoDisplayed.display = !keepMovieInfoDisplayed.display
        removeMovieInfo(keepMovieInfoDisplayed.d)
        displayMovieInfo(d)
        keepMovieInfoDisplayed.d = d
    }
}

//Read the data
d3.csv("data/bubbleData.csv", function (data) {


    //genre change when clicking on color selector
    function setGenre(genreSelected) {
        $("#genre-select").val(genreSelected)
        renderData(data)
    }

    //On click listeners for color selectors
    function addOnClickGenreListeners() {
        $("#actionColorSel").click(() => { setGenre("Action") })
        $("#adventureColorSel").click(() => { setGenre("Adventure") })
        $("#comedyColorSel").click(() => { setGenre("Comedy") })
        $("#crimeColorSel").click(() => { setGenre("Crime") })
        $("#dramaColorSel").click(() => { setGenre("Drama") })
        $("#familyColorSel").click(() => { setGenre("Family") })
        $("#fantasyColorSel").click(() => { setGenre("Fantasy") })
        $("#historyColorSel").click(() => { setGenre("History") })
        $("#horrorColorSel").click(() => { setGenre("Horror") })
        $("#musicColorSel").click(() => { setGenre("Music") })
        $("#otherColorSel").click(() => { setGenre("all") })
        $("#romanceColorSel").click(() => { setGenre("Romance") })
        $("#sciFiColorSel").click(() => { setGenre("Science Fiction") })
        $("#thrillerColorSel").click(() => { setGenre("Thriller") })
        $("#warColorSel").click(() => { setGenre("War") })
        $("#westernColorSel").click(() => { setGenre("Western") })
    }
    addOnClickGenreListeners()


    //year slider
    $(function () {
        var handle = $("#custom-handle");
        $("#year_selector").slider({
            //range: "max",
            create: function () {
                handle.text($(this).slider("value"));
            },
            //animate: "fast",
            min: config.slider_min_year,
            max: config.slider_max_year,
            value: 2000,
            change: function (event, ui) {
                if (ui.value != null) { //called from search
                    handle.text(ui.value);
                    if (keepMovieInfoDisplayed.display) { //remove movie details if displayed
                        permanentMovieDisplay(keepMovieInfoDisplayed.d)
                        removeMovieInfo(keepMovieInfoDisplayed.d)
                    }
                    renderData(data)
                }
            },
            slide: function (event, ui) {
                handle.text(ui.value);
            }
        })
    });

    //auto complete search bar
    $(function () {
        //list of all movies in dataset
        var movies = []
        for (const d in data) {
            movies.push({ label: data[d].original_title, data: data[d] })
        }
        var updateFunc = function (event, ui) {
            if (ui.item == null) { // movie not found
                this.value = ""
                if (keepMovieInfoDisplayed.display) { //remove movie details if displayed
                    permanentMovieDisplay(keepMovieInfoDisplayed.d)
                    removeMovieInfo(keepMovieInfoDisplayed.d)
                }

                $("#bubbleInstruction").hide()
                $("#movieNotFound").show()

                setTimeout(() => { $("#bubbleInstruction").show() }, config.movie_not_found_display_timeout)
                setTimeout(() => { $("#movieNotFound").hide() }, config.movie_not_found_display_timeout)
            } else {
                $("#genre-select").val("all")
                $("#year_selector").slider("value", ui.item.data.realease_year)
                $("#custom-handle").text(ui.item.data.realease_year)
                delete keepMovieInfoDisplayed.d
                keepMovieInfoDisplayed.display = false
                $("div[id^='selectedMovieInfoDisplay']").each(function () {
                    this.remove()
                });
                displayMovieInfo(ui.item.data)
                permanentMovieDisplay(ui.item.data)
            }
        }
        $("#search").autocomplete({
            source: movies,
            minLength: 3,
            delay: 0,
            change: updateFunc,
            select: updateFunc
        });
    });


    //drop down genre selection
    d3.select('#genre-select').on('change', function () {
        var f = document.getElementById('genre-select')
        selected_genre = f.options[f.selectedIndex].value
        renderData(data)
    })

    renderData(data)
})

//currency formater
const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
})

//Million and billion detector and shortener
var customCurrencyFormatter = (value) => {
    if (value / 1e9 > 1) {
        return usdFormatter.format(value / 1e9) + "B"
    }
    else if (value / 1e6) {
        return usdFormatter.format(value / 1e6) + "M"
    }
    return usdFormatter.format(value)
}


var renderData = (data) => {

    local_config = {
        action_when_entering_data_point: displayMovieInfo,
        action_when_leaving_data_point: removeMovieInfo,
        action_when_clicking_data_point: permanentMovieDisplay
    }


    var genre_selected = $("select#genre-select").val();

    var filterFuncGenre = (dat) => { return dat }
    if (genre_selected != "all") {
        filterFuncGenre = (dat) => { return dat.filter((d) => { return d.genres === genre_selected }) }
    }

    var filterFuncYear = (d) => { return d.realease_year == fromYear }
    var filterWithinDisplayRangs = (d) => { return d.revenue > config.xaxis_min && d.revenue < config.xaxis_max && d.popularity > config.yaxis_min && d.popularity < config.yaxis_max }

    var fromYear = $("#year_selector").slider("option", "value")
    var filterFunc = (dat) => { return filterFuncGenre(dat).filter(filterFuncYear).filter(filterWithinDisplayRangs) }


    // Removing previously drawn elements
    d3.selectAll("#dotGroup")
        .remove()

    d3.selectAll("#dotIntercationRegion")
        .remove()

    d3.selectAll("#yearText")
        .remove()

    svg.append("text")
        .attr("id", "yearText")
        .attr("class", "text")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
        .style("text-anchor", "middle")
        .style("font-size", "10em")
        .style("opacity", "0.2")
        .text(fromYear);

    //drawing data point
    svg.append('g')
        .attr("id", "dotGroup")
        .selectAll("dot")
        .data(filterFunc(data))
        .enter()
        .append("circle")
        .attr("id", function (d) { return "data_uid_" + d.id }) //used to change the style of that point when mouse enters and leaves
        .attr("class", function (d) { return d.genres })
        .attr("cx", function (d) { return x(d.revenue); })
        .attr("cy", function (d) { return y(d.popularity); })
        .attr("r", function (d) { return z(d.budget); })
        .style("fill", function (d) {
            return genreColors[d.genres] == undefined ? config.color_no_genre_data_point : genreColors[d.genres]
        })
        .style("opacity", config.opacity_data_point_no_hover)
        .on("mouseover", local_config.action_when_entering_data_point)
        .on("mouseleave", local_config.action_when_leaving_data_point)
        .on("click", local_config.action_when_clicking_data_point)


    //calculating Voronoi intercation area
    let limVoronoi = d3.distanceLimitedVoronoi()
        .x(d => x(d.revenue))
        .y(d => y(d.popularity))
        .limit(25)


    svg.append("g")
        .attr("id", "dotIntercationRegion")
        .selectAll(".interactive-region")
        .data(limVoronoi(filterFunc(data)))
        .enter()
        .append("path")
        .attr("d", function (d) { return d.path; })
        .style("fill", "none")
        //.style("stroke", "steelblue")
        //.style("opacity", "0.1")
        .style("pointer-events", "all")
        .on('mouseenter', local_config.action_when_entering_data_point)
        .on('mouseout', local_config.action_when_leaving_data_point)
        .on("click", local_config.action_when_clicking_data_point)
}

