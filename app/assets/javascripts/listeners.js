function attachListeners() {
    var deferred = $.Deferred();
    showSpinner("Attaching listeners...");
    console.log("Attaching Listeners...");
    setSidePanelMenuAnimations();
    setSidePanelMenuToggle();
    setWindowResizeHandlers();
    adjustMapSize();
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

        $(".sidePanelHeader").each(function() {
            var sidePanelDetail = $(this).nextAll(".sidePanelDetail");
            $(this).find("span").addClass('glyphicon-chevron-right');
            $(this).find("span").removeClass('glyphicon-chevron-down');
            sidePanelDetail.hide("slow");
        });
        var sidePanelDetail = $(this).nextAll(".sidePanelDetail");

        if(sidePanelDetail.css('display') != 'block'){
            sidePanelDetail.slideToggle("slow");
            $(this).find("span").toggleClass('glyphicon-chevron-right');
            $(this).find("span").toggleClass('glyphicon-chevron-down');
        }
        
    });
}

function adjustMapSize(){
    var win_height = $(window).height();
    var head_height = $("#header").height();
    var nav_height = $("#navbar").height();
    var foot_height = $("#footer").height();

    map_height = win_height - head_height - nav_height - foot_height;
    $("#doam_app_map").height(map_height+"px");
}

function setWindowResizeHandlers(){
    $(window).resize(function() {
        adjustMapSize();
    });
}