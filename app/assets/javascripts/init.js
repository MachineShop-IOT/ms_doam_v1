var monitorMap;
var monitorManagerLocation = '37.32541797504602,-121.945411';
// var deraultZoomLevelMonitorManager = '0';
var defaultMonitorCenterLat = parseFloat(monitorManagerLocation.substr(0, monitorManagerLocation.indexOf(",") - 1), 10);
var defaultMonitorCenterLon = parseFloat(monitorManagerLocation.substr(monitorManagerLocation.indexOf(",") + 1, monitorManagerLocation.length - 1), 10);

var SLIDE_OPEN_CLOSE_TIME = 400;

$(document).ready(function(){

    attachListeners();
    $('.slidePull').trigger('click');
    $('.slidePull').trigger('click');    
    initMap();
    getDevicesLastReports();
    attachMapListeners();

    buildPayloadTree();
});