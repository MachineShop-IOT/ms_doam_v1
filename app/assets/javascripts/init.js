var monitorMap;
var monitorManagerLocation = '37.32541797504602,-121.945411';
// var deraultZoomLevelMonitorManager = '0';
var defaultMonitorCenterLat = parseFloat(monitorManagerLocation.substr(0, monitorManagerLocation.indexOf(",") - 1), 10);
var defaultMonitorCenterLon = parseFloat(monitorManagerLocation.substr(monitorManagerLocation.indexOf(",") + 1, monitorManagerLocation.length - 1), 10);

var SLIDE_OPEN_CLOSE_TIME = 400;

$(document).ready(function(){

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

    $('.slidePull').trigger('click');
    $('.slidePull').trigger('click');
    showSpinner("Loading Items...");

    var position = $("#doam_app_map").offset();
    var width = $("#doam_app_map").width();
    var height = $("#doam_app_map").height();

    position = position ? position: "0";

    $(".slidePull").css({
        // "top": (position.top + 5),
        "top": 0,
        "left": (position.left + width)
    });
    
    initMap();
    getDevicesLastReports();

    $("#show_reports").click(function () {
        getDevicesLastReports();
    });

    $('#select_all_dis').click(function(event) {  //on click 
        if(this.checked) { // check select status
            $('#dis_selector li input').each(function() { //loop through each checkbox
                this.checked = true;  //select all checkboxes with class "checkbox1"               
            });
        }else{
            $('#dis_selector li input').each(function() { //loop through each checkbox
                this.checked = false; //deselect all checkboxes with class "checkbox1"                       
            });         
        }
    });

    $('.sidePanelHeader').click(function () {
        var clickedItem = $(this);

        // if clickedItem is open, close it
        if (clickedItem.siblings('.sidePanelDetails').hasClass('open')) {
            clickedItem.siblings('.open').animate({
                height: 0,
                margin: 0
            }, SLIDE_OPEN_CLOSE_TIME, function () {
                $(this).removeClass('open');
                clickedItem.find('.glyphicon-chevron-down').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
            });
        } else {
            $('.sidePanelHeader').siblings('.open').animate({
                height: 0,
                margin: 0
            }, SLIDE_OPEN_CLOSE_TIME, function () {
                $(this).removeClass('open');
                $(this).siblings('.sidePanelHeader').find('.glyphicon-chevron-down').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
            });

            hideCreateGeofenceDiv();
            hideCreateNewRule();
            hideCreateComplexPolicy();

            var height = $(this).siblings('.sidePanelDetails').find('.row').height();

            $(this).siblings('.sidePanelDetails').animate({
                height: height,
                "margin-top": 15,
                "margin-bottom": 15
            }, SLIDE_OPEN_CLOSE_TIME, function () {
                $(this).addClass('open');
                clickedItem.find('.glyphicon-chevron-right').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
            });
        }
    });

});

// fix side panel position after window resize
$( window ).resize(function() {
    // $('.slidePull').trigger('click');
    // $('.slidePull').trigger('click');
});


function addMapEventHandler() {
  var mapEventsHandler = new MapEventsHandler();
  // mapEventsHandler.setOnClick(onMapClick);
  mapEventsHandler.setOnDoubleClick(onMapDoubleClick);
  monitorMap.addMapEventsHandler(mapEventsHandler);
}

function onMapDoubleClick(latLonPoint, pixelArray, clickedFeature) {  
    monitorMap.setCenterAndZoom(latLonPoint, monitorMap.getZoom() + 1);  
}