function initMap(){
    monitorMap = new mxn.Mapstraction('doam_app_map', 'openlayers');
    monitorMap.addControlsArgs.zoom = true;
    monitorMap.addLayer("GOOGLE", "Google Map");
    monitorMap.setCenter(new mxn.LatLonPoint(defaultMonitorCenterLat, defaultMonitorCenterLon), {'pan': true});
    monitorMap.updateMapSize();
    monitorMap.setZoom('0');
}

function clearLayers(){
    // monitorMap.removeAllPopups();
    // monitorMap.removeAllMarkers();
    monitorMap.removeLayer('CDP_LAYER');
}

function getDevicesReports() {
    var data = "adf";
    $.ajax({
        url: "/user/devices_reports",
        "data": data,
        beforeSend: function(jqXHR, settings) {
            jqXHR.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
        }
    }).done(function (response) {
        // alert(response);
        // console.log(reports);
        plotDevices(response);
    });
}

function plotDevices(response) {

    clearLayers();

    showSpinner("Plotting devices...");
    console.log("Plotting devices...");

    for (var i = 0; i < response.reports.length; i++) {
        plotDevice(response.reports[i]);
    }
    monitorMap.zoomToLayer('CDP_LAYER');
    hideSpinner();
}

function plotDevice(device) {

    //get selected checkbox fields from the side panel
    var selected_fields = getSelectedFields();
    // console.log(selected_fields[0]);
    // console.log(selected_fields[1]);

    console.log("Plotting device "+device.id);
    console.log(device);
    var location = device.payload.event.values.location;

    var latitude = location.latitude+Math.floor((Math.random() * 30) + 1);;
    var longitude = location.longitude+Math.floor((Math.random() * 30) + 1);;
    var altitude = location.altitude;

    var a = selected_fields[0];
    var b = selected_fields[1];

    for (var key in location) {
      if (location.hasOwnProperty(key)) {
        // alert(key + " -> " + location[key]);
        console.log(key + " -> " + location[key]);

        if(a==key){
            latitude =  location[key];
            console.log(latitude);
            // alert('a');
        }

        if(b==key){
            // alert('b');
            longitude =  location[key];
            console.log(longitude);
        }
      }
    }

    var speed = device.payload.event.values.speed.hor_speed;

    var marker = new Marker();
    var latLon = new mxn.LatLonPoint(latitude, longitude);



    marker.setLocation(latLon);

    template = Handlebars.compile(infoBubbleTemplate);
    handleBarsData = { "deviceName" : device.id, "latitude" : latitude, "longitude" : longitude, "altitude" : altitude, "speed" : speed, "reportDeviceDatetime" : device.updated_at };
    var infoBubble = template(handleBarsData);

    marker.setInfoBubble(infoBubble);


    monitorMap.addMarker(marker, 'CDP_LAYER');

}