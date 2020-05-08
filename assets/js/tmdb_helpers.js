//https://github.com/cavestri/themoviedb-javascript-library/wiki/Movies

function setMovieImage(destIDLocation, movieID, verbose=false) {
    console.log("id : "+movieID)
    theMovieDb.movies.getById(
        {"id":movieID },
        (d) => {
            if(verbose) {console.log(d)}
            var posterPath = JSON.parse(d).poster_path;
            if(posterPath!=null){
                $(destIDLocation).attr("src" ,"https://image.tmdb.org/t/p/original" + posterPath)
            }else{
                $(destIDLocation).attr("src", "assets/img/black-chairs-in-front-of-white-projector-screen-3709369.jpg")
            }
        },
        (d) => {
            console.log(d)})
}

function getMoviePosterPath(movieID){
    theMovieDb.movies.getById(
        {"id":movieID },
        (d) => {
            var posterPath = JSON.parse(d).belongs_to_collection.poster_path;
            if(posterPath!=null){
                return "https://image.tmdb.org/t/p/w500" + JSON.parse(d).belongs_to_collection.poster_path
            }else{
               return "assets/img/black-chairs-in-front-of-white-projector-screen-3709369.jpg"
            }
        },
        (d) => {
            console.log(d)})
}