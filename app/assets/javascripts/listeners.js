function attachListeners() {
    var deferred = $.Deferred();
    showSpinner("Attaching listeners...");
    console.log("Attaching Listeners...");
    setSidePanelMenuAnimations();
    setSidePanelMenuToggle();
    return deferred;
}

function setSidePanelMenuAnimations() {

    var position = $("#doam_app_map").offset();
    var width = $("#doam_app_map").width();
    var height = $("#doam_app_map").height();

    position = position ? position: "0";

    $(".slidePull").css({
        // "top": (position.top + 5),
        "top": 0,
        "left": (position.left + width)
    });

    $('.slidePull').click(function () {
        var width, left1, left2;
        var scrollProperty;

        if ($(this).hasClass('open-panel')) {
            width = 0;
            left1 = $("#doam_app_map").width() + 25;
            left2 = $("#doam_app_map").width() - 60;
            $(this).removeClass('open-panel');
            scrollProperty = "hidden";
        } else {
            var width = $(this).attr('open-width');
            left1 = $("#doam_app_map").width() - width + 30;
            left2 = $("#doam_app_map").width() - width - 30;
            $(this).addClass('open-panel');
            scrollProperty = "scroll";
        }
        $('#sideMenuPanel').animate({
            width: width,
            left: left1
        }, SLIDE_OPEN_CLOSE_TIME, function () {
            $(this).css({
                "overflow": scrollProperty
            });
        });
        $('.slidePull').animate({
            left: (left2)
        }, SLIDE_OPEN_CLOSE_TIME);
    });
}

function addMapEventHandler() {
  var mapEventsHandler = new MapEventsHandler();
  // mapEventsHandler.setOnClick(onMapClick);
  mapEventsHandler.setOnDoubleClick(onMapDoubleClick);
  monitorMap.addMapEventsHandler(mapEventsHandler);
}

function onMapDoubleClick(latLonPoint, pixelArray, clickedFeature) {  
    monitorMap.setCenterAndZoom(latLonPoint, monitorMap.getZoom() + 1);  
}

function setSidePanelMenuToggle(){
    $('.sidePanelHeader').click(function(){
        var sidePanelDetail = $(this).nextAll(".sidePanelDetail");
        sidePanelDetail.slideToggle("slow");
        $(this).find("span").toggleClass('glyphicon-chevron-right');
        $(this).find("span").toggleClass('glyphicon-chevron-down');
    });
}