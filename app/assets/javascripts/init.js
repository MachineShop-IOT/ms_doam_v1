var monitorMap;
var monitorManagerLocation = '37.32541797504602,-121.945411';
// var deraultZoomLevelMonitorManager = '0';
var defaultMonitorCenterLat = parseFloat(monitorManagerLocation.substr(0, monitorManagerLocation.indexOf(",") - 1), 10);
var defaultMonitorCenterLon = parseFloat(monitorManagerLocation.substr(monitorManagerLocation.indexOf(",") + 1, monitorManagerLocation.length - 1), 10);

$(document).ready(function(){

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