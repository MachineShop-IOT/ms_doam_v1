var monitorMap;
var monitorManagerLocation = '37.32541797504602,-121.945411';
// var deraultZoomLevelMonitorManager = '0';
var defaultMonitorCenterLat = parseFloat(monitorManagerLocation.substr(0, monitorManagerLocation.indexOf(",") - 1), 10);
var defaultMonitorCenterLon = parseFloat(monitorManagerLocation.substr(monitorManagerLocation.indexOf(",") + 1, monitorManagerLocation.length - 1), 10);

var SLIDE_OPEN_CLOSE_TIME = 400;

$(document).ready(function(){

    var position = $("#doam_app_map").offset();
    var width = $("#doam_app_map").width();
    var height = $("#doam_app_map").height();

    $(".slidePull").css({
        "top": (position.top + 5),
        "left": (position.left + width)
    });

    $('.slidePull').click(function () {
        var width, left1, left2;
        var scrollProperty;

        if ($(this).hasClass('open-panel')) {
            width = 0;
            left1 = $("#doam_app_map").width();
            left2 = $("#doam_app_map").width() - 14;
            $(this).removeClass('open-panel');
            scrollProperty = "hidden";
        } else {
            var width = $(this).attr('open-width');
            left1 = $("#doam_app_map").width() - width + 14;
            left2 = $("#doam_app_map").width() - width - 14;
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


function addMapEventHandler() {
  var mapEventsHandler = new MapEventsHandler();
  // mapEventsHandler.setOnClick(onMapClick);
  mapEventsHandler.setOnDoubleClick(onMapDoubleClick);
  monitorMap.addMapEventsHandler(mapEventsHandler);
}

function onMapDoubleClick(latLonPoint, pixelArray, clickedFeature) {  
    monitorMap.setCenterAndZoom(latLonPoint, monitorMap.getZoom() + 1);  
}