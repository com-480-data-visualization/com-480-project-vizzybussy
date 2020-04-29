var bubbleChartCnt;
        var resizeFunc = () => {$("#bubbleChart").attr('src', $('#bubbleChart').attr('src'))}
        $(window).resize(function() {
            clearTimeout(bubbleChartCnt)
            bubbleChartCnt = setTimeout(resizeFunc, 400)
        })