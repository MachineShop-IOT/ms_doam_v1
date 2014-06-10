$(document).ready(function () {
    /*setting up hover handles*/
    setUpHover();
});

function setUpHover(){
    $('.hoverInfo').hover(
        function () {
            if (eventTimer)
                clearTimeout(eventTimer);
            showAPIInfo($(this));
        }, function () {
            eventTimer = setTimeout(hideAPIInfo, 500);
        });

    $('.api_info').hover(
        function () {
            if (eventTimer)
                clearTimeout(eventTimer);
        },
        function () {
            eventTimer = setTimeout(hideAPIInfo, 500);
        });
}

var eventTimer;

function showAPIInfo(element) {
    var api_info = $('.api_info');
    var position = element.offset();
    var windowWidth = $(window).width();

    // var apiInfoArray = JSON.parse(element.attr("api-info"));

    // alert("dsf");

    // prepareAPIInfo(api_info.find(".variable"), apiInfoArray);

    var left = (position.left+50);
    if(position.left+api_info.width()>windowWidth){
        left = position.left-api_info.width()-70;
    }

    api_info.css({
        "position": "absolute",
        "top": "20px",
        "left": left + "px",
        "display": "block"
    });

}

function hideAPIInfo() {
    eventTimer = null;
    $('.api_info').hide();
}

function prepareAPIInfo(elementsArray, apiInfoArray) {
    for (var i = 0; i < apiInfoArray.length; i++) {
        elementsArray[i].innerHTML = apiInfoArray[i];
    }
}

function resetFocus() {
    $('.deviceReportHover').triggerHandler('focus');
}
