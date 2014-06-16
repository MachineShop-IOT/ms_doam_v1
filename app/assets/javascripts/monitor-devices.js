function initMap(){
    showSpinner("Initializing Map...");
    console.log("Initializing Map..."); 
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

function getDevicesLastReports() {
    showSpinner("Receiving Device Last Reports...");
    var data = "adf";
    $.ajax({
        url: "/monitor/get_last_reports",
        "data": data,
        beforeSend: function(jqXHR, settings) {
            jqXHR.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
        }
    }).done(function (response) {
        // console.log(response);
        plotDevices(response);
    });
}

function plotDevices(response) {

    clearLayers();

    showSpinner("Plotting devices...");
    console.log("Plotting devices...");

    for (var i = 0; i < response.last_reports.length; i++) {
        plotDevice(response.last_reports[i], i);
    }

    monitorMap.zoomToLayer('CDP_LAYER');
    hideSpinner();
}

function plotDevice(device, index) {

    colorArray = getRandomColors(50);
    var cdpImages = [];
    for(var i = 0; i < colorArray.length; ++i) {
        cdpImages.push("/monitor/get_colored_image_for_device?color=" + colorArray[i]);
    }

    var selected_dis = getSelectedDeviceInstances();
    var drawable = false;

    //do we need to plot the device?
    if (selected_dis.indexOf(device._id) > -1) { drawable = true; }

    if(device.last_report && device.last_report.payload && device.last_report.payload.event && device.last_report.payload.event.values && device.last_report.payload.event.values.location && drawable){

        var location = device.last_report.payload.event.values.location;

        var latitude = location.latitude;
        var longitude = location.longitude;
        var altitude = location.altitude;
        var speed;

        //get selected checkbox fields from the side panel
        var lat_fields = getSelectedLatField();
        var lon_fields = getSelectedLonField();

        if((lat_fields.length + lon_fields.length) >= 2){

            var payload = device.last_report.payload;

            var c = getPath(lat_fields[0]);
            var d = getPath(lon_fields[0]);

            var latarr = c.split(".");
            var lonarr = d.split(".");

            var lat_build = payload[latarr[0]];
            var lon_build = payload[lonarr[0]];

            for (var i = 1; i < latarr.length; i++) {
                lat_build= lat_build[latarr[i]];
            }
            latitude = lat_build;

            for (var i = 1; i < lonarr.length; i++) {
                lon_build= lon_build[lonarr[i]];
            }
            longitude = lon_build;
        }

        if(device.last_report.payload.event.values.speed){
            speed = device.last_report.payload.event.values.speed;
        } else {
            speed = 0;
        }        

        var marker = new Marker();
        var latLon = new mxn.LatLonPoint(latitude, longitude);

        marker.setLocation(latLon);
        marker.setIcon(cdpImages[index % 50], [12, 12]);

        template = Handlebars.compile(infoBubbleTemplate);
        handleBarsData = { "deviceName" : device.name, "latitude" : latitude, "longitude" : longitude, "altitude" : altitude, "speed" : speed, "reportDeviceDatetime" : device.updated_at };
        var infoBubble = template(handleBarsData);

        marker.setInfoBubble(infoBubble);

        monitorMap.addMarker(marker, 'CDP_LAYER');
        console.log("Plotting device "+device._id + " at ("+latitude+", "+longitude+")");
    } else {
        console.log("No data in payload field, ignoring device "+device._id);

        if(drawable){

            var latitude = Math.floor(Math.random() * 120) - 100;
            var longitude = Math.floor(Math.random() * 120) - 100;

            var marker = new Marker();
            var latLon = new mxn.LatLonPoint(latitude, longitude);

            marker.setLocation(latLon);
            marker.setIcon(cdpImages[index % 50], [12, 12]);

            console.log("Added fake marker at ("+latitude+", "+longitude+")");

            // monitorMap.addMarker(marker, 'CDP_LAYER');
        }
    }    

}