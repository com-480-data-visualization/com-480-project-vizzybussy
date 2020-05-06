function setMovieImage(destIDLocation, movieID) {
    theMovieDb.movies.getById(
        {"id":movieID },
        (d) => {
            var posterPath = JSON.parse(d).belongs_to_collection.poster_path;
            if(posterPath!=null){
                $(destIDLocation).attr("src" ,"https://image.tmdb.org/t/p/w500" + JSON.parse(d).belongs_to_collection.poster_path)
            }else{
                $(destIDLocation).attr("src", "black-chairs-in-front-of-white-projector-screen-3709369.jpg")
            }
        },
        (d) => {
            console.log(d)})
}