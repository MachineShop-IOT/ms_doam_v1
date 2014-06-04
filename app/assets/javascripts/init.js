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

    var position = $("#doam_app_map").offset();
    var width = $("#doam_app_map").width();
    var height = $("#doam_app_map").height();

    $(".slidePull").css({
        // "top": (position.top + 5),
        "top": 0,
        "left": (position.left + width)
    });
    
    monitorMap = new mxn.Mapstraction('doam_app_map', 'openlayers');
    monitorMap.addControlsArgs.zoom = true;
    monitorMap.addLayer("GOOGLE", "Google Map");
    monitorMap.setCenter(new mxn.LatLonPoint(defaultMonitorCenterLat, defaultMonitorCenterLon), {'pan': true});
    monitorMap.updateMapSize();
    monitorMap.setZoom('0');
    // addMapEventHandler();
    // monitorMap.addControl(drawFeature);
    // drawFeature.activate();

    // var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
    // renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

    // vectors = new OpenLayers.Layer.Vector("Vector Layer", {
    //     renderers: renderer
    // });

    // monitorMap.addControl(new OpenLayers.Control.MousePosition());

    // controls = {        
    //     drag: new OpenLayers.Control.DragFeature(vectors)
    // };

    // for(var key in controls) {
    //     monitorMap.addControl(controls[key]);
    // }

    // $('#api-key-submit').click(function(){
    //     $('#ajaxSpinnerContainer').show().html('<div class="loaderBlock"><img src="assets/ajax-loader.gif" title="ajax loader workin"> Validating Api Key</div>');
    //     $.ajax({
    //         type:'POST',
    //         url:'/apiKeyCheck',        
    //         success:function(response){
    //             $('#ajaxSpinnerContainer').hide().html('');
    //             if(response){
    //                 $('.apiKeyForm').toggle(function(){
    //                     $('.user-login-form').toggle();

    //                 });                    
    //             } else {

    //             }
    //         },
    //         error: function(jqXHR, textStatus, errorThrown) {
    //             // handleErrorAjax(jqXHR, textStatus, errorThrown);
    //         }
    //     })
    // });

});

// fix side panel position after window resize
$( window ).resize(function() {
    $('.slidePull').trigger('click');
    $('.slidePull').trigger('click');
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

var hehe = "{\"jsonData\":{\"totalCount\":1,\"data\":" +
            "[{\"_id\":\"52dfc2f4b99e9cdb3a007e47\"," +
            "\"created_at\":\"2014-01-22T13:09:08Z\",\"deleted_at\":null," +
            "\"device_datetime\":\"2014-01-22T13:10:26+00:00\",\"device_instance_id\":\"52585e1d981800bab2000478\"," +
            "\"device_type\":\"lts\",\"payload\":{\"sequenceId\":1095,\"event\":" +
            "{\"eventIdx\":0,\"reportMask\":2163,\"values\":{\"fixType\":3,\"utcTime\":1390396226," +
            "\"batteryLevel\":0,\"location\":{\"latitude\":52.50181,\"longitude\":0.0822153,\"altitude\":21," +
            "\"hor_error_min\":0,\"hor_error_max\":0,\"vert_error\":0},\"speed\":{\"hor_speed\":10000," +
            "\"ver_speed\":0,\"heading\":9000},\"motion\":{\"context\":0,\"steps\":0,\"distance\":0," +
            "\"floor_change\":0}}}},\"profile_timestamps\":{\"device\":\"2014-01-22T13:10:26+00:00\"," +
            "\"worker\":\"2014-01-22 13:09:08 UTC\",\"translator\":\"2014-01-22T13:10:47+00:00\"," +
            "\"platform\":\"2014-01-22T13:10:49+00:00\"}," +
            "\"raw_data\":\"AAIAAA5SeWFuAFJ5YW4AQ1NSAARHAQAIcwEfSyPj_-yLiQAVAAAAAAAAJxAAACMoAAAAAAAAAAAAAFLfw0IAAwAAAAA\"," +
            "\"updated_at\":\"2014-01-22T13:09:08Z\"}]}}";

var obj = jQuery.parseJSON(hehe);

console.log(api_info_data[4]);
console.log(obj);