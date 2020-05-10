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
            console.log(JSON.parse(d));
            var posterPath = JSON.parse(d).poster_path;
            if(posterPath!=null){
              console.log("https://image.tmdb.org/t/p/w500" + JSON.parse(d).poster_path)
                return "https://image.tmdb.org/t/p/w500" + JSON.parse(d).poster_path
            }else{
               return "https://as1.ftcdn.net/jpg/02/23/81/56/500_F_223815602_idMOSbp7Z3eN25V2mslRioWS68V3LNZt.jpg"
            }
        },
        (d) => {
            console.log("ERROR: " + d)})
}

function getMovieTitle(movieID) {
  theMovieDb.movies.getById(
      {"id":movieID },
      (d) => {
          console.log(JSON.parse(d));
          var posterPath = JSON.parse(d).poster_path;
          if(posterPath!=null){
            console.log("https://image.tmdb.org/t/p/w500" + JSON.parse(d).poster_path)
              return "https://image.tmdb.org/t/p/w500" + JSON.parse(d).poster_path
          }else{
             return "https://as1.ftcdn.net/jpg/02/23/81/56/500_F_223815602_idMOSbp7Z3eN25V2mslRioWS68V3LNZt.jpg"
          }
      },
      (d) => {
          console.log("ERROR: " + d)})
  }
