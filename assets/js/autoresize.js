var bubbleChartCnt;
        var resizeFunc = () => {$("#bubbleChart").attr('src', $('#bubbleChart').attr('src'))}
        $(window).resize(function() {
            clearTimeout(bubbleChartCnt)
            bubbleChartCnt = setTimeout(resizeFunc, 400)
        })


if(! $("#network_actor").is(':visivle')){
    $("#network_actor").hide()
}else{
    $("#network_actor").show()
}