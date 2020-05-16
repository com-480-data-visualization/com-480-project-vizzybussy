//https://github.com/cavestri/themoviedb-javascript-library/wiki/Movies

//import { credits } from "assets/js/themoviedb";

function setMovieImage(destIDLocation, movieID, movieInfoImgLink=null , creditMovieDiv=null, movieInfoYoutubeLink=null, verbose=false) {
    console.log("id : "+movieID)
    theMovieDb.movies.getById(
        {"id":movieID,
        "append_to_response": "videos,credits" },
        (d) => {
            var data = JSON.parse(d)
            if(verbose) {console.log(data)}
            var posterPath = data.poster_path;
            if(posterPath!=null){
                $(destIDLocation).attr("src" ,"https://image.tmdb.org/t/p/original" + posterPath)
            }else{
                $(destIDLocation).attr("src", "assets/img/black-chairs-in-front-of-white-projector-screen-3709369.jpg")
            }
            if(data.videos.results.length != 0 && movieInfoImgLink!=null){
                $(movieInfoImgLink).attr("href", "https://www.youtube.com/watch?v="+data.videos.results[0].key).attr("target","_blank")
                $(movieInfoYoutubeLink).attr("href", "https://www.youtube.com/watch?v="+data.videos.results[0].key).attr("target","_blank")
            }
            if(data.credits != null && data.credits.cast != null && data.credits.cast.length>0 && creditMovieDiv != null){
                for(i = 0; i< 6 && data.credits.cast.length > i; i++){
                    $(creditMovieDiv).append("<div class='col-4'> <a href='https://www.themoviedb.org/person/"
                    +data.credits.cast[i].id
                    +"' target='_blank'> "
                    +"<img class='img-fluid rounded' style='width:100%;'"
                   +" src="+(data.credits.cast[i].profile_path == null ? "'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-4-user-grey-d8fe957375e70239d6abdd549fd7568c89281b2179b5f4470e2e12895792dfa5.svg'": "'https://image.tmdb.org/t/p/w600_and_h900_bestv2/"+data.credits.cast[i].profile_path)+"'>"
                    +"<p style='color:black'>"+data.credits.cast[i].name.toString()+"</p>"
                    +"</a></div>"
                    )

                    console.log(data.credits.cast[i].name.toString())
                }
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