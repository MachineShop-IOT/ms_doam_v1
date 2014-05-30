var monitorManagerLocation = '37.32541797504602,-121.945411';
// var deraultZoomLevelMonitorManager = '6';
var defaultMonitorCenterLat = parseFloat(monitorManagerLocation.substr(0, monitorManagerLocation.indexOf(",") - 1), 10);
var defaultMonitorCenterLon = parseFloat(monitorManagerLocation.substr(monitorManagerLocation.indexOf(",") + 1, monitorManagerLocation.length - 1), 10);

$(document).ready(function(){

    monitorMap = new mxn.Mapstraction('doam_app_map', 'openlayers');
    monitorMap.addControlsArgs.zoom = true;
    monitorMap.addLayer("GOOGLE", "Google Map");
    monitorMap.setCenter(new mxn.LatLonPoint(defaultMonitorCenterLat, defaultMonitorCenterLon), {'pan': true});
//    monitorMap.getPoiCategories(null, mapName, onPoiCatSuccess, onPoiCatError);
    // monitorGetPoiFromMapServer();
    // addMapEventHandlers();
    // monitorMap.reorderLayers(mapLayerOrder);

    // Have to make sure this layer is added before the layer with markers,
    // or the circles will obscure the markers and they will also capture
    // clicks.
    // var vectorLayer = monitorMap.maps[monitorMap.api].getLayersByName("Vectors")[0];
    // if (!vectorLayer) {
    //     vectorLayer = monitorMap.addLayer("VECTOR", "Vectors");
    // }

    // renderIndorMapOnPageLoadMTIMI($.size(floorBuildingMTIMI) <= 0 ? 'floor_index = 0' : getWhereClausesIndoorMapMTIMI());
    monitorMap.updateMapSize();
})