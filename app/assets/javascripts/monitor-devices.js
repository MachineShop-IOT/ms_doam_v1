var map;
var markers_layer;
var controls;

function initMap(){
    showSpinner("Initializing Map...");
    console.log("Initializing Map...");

    map = new OpenLayers.Map('doam_app_map', {
        projection: 'EPSG:3857',
        layers: [
            new OpenLayers.Layer.Google(
                "Google Streets", // the default
                {numZoomLevels: 20}
            )
        ],
        center: new OpenLayers.LonLat(defaultMonitorCenterLat, defaultMonitorCenterLon)
            // Google.v3 uses web mercator as projection, so we have to
            // transform our coordinates
            .transform('EPSG:4326', 'EPSG:3857'),
        zoom: 0
    });
    map.addControl(new OpenLayers.Control.LayerSwitcher());
    markers_layer = new OpenLayers.Layer.Vector("Devices");
    map.addLayer(markers_layer);
}

function clearLayers(){
    markers_layer.destroyFeatures();
}

function getDevicesLastReports() {
    showSpinner("Plotting devices...");
    console.log("Plotting devices...");
    
    $.ajax({
        url: "/monitor/get_last_reports",
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

    for (var i = 0; i < response.last_reports.length; i++) {
        plotDevice(response.last_reports[i], i);
    }

    var bounds = markers_layer.getDataExtent();
    map.zoomToExtent(bounds);

    hideSpinner();
}

function plotDevice(device, index) {

    var drawable = false;

    colorArray = getRandomColors(50);
    var cdpImages = [];
    for(var i = 0; i < colorArray.length; ++i) {
        cdpImages.push("/util/get_colored_image_for_device?color=" + colorArray[i]);
    }
    var colored_marker = cdpImages[index % 50]; 

    var selected_dis = getSelectedDeviceInstances(); 

    //do we need to plot the device?
    if (selected_dis.indexOf(device._id) > -1) { drawable = true; }

    if(device.last_report && drawable){

        var location, latitude, longitude, address, weather;

        //trying to set default location data as "payload.event.values.location"
        try{
            location = device.last_report.payload.event.values.location;
            latitude = location.latitude;
            longitude = location.longitude;
            altitude = location.altitude;

        } catch(e){
            latitude = null;
            longitude = null;
            altitude = 0;
        }

        //do we have both lat and lon fields checked?
        if(latAndLongBothSelected()){
            var payload = device.last_report.payload;
            latitude = getLatitude(payload);
            longitude = getLongitude(payload);
        }

        // var latitude = Math.floor(Math.random() * 40) - 39 + 58;
        // var longitude = Math.floor(Math.random() * 30) - 29 - 87;

        addressObj= getAddressByLatlon(latitude, longitude);
        address = addressObj.full_address;
        weather = getWeather(addressObj.state, addressObj.city);
        
        template = Handlebars.compile(infoBubbleTemplate);
        handleBarsData = { "deviceName" : device.name, "latitude" : latitude, "longitude" : longitude, "address" : address, "weather" : weather, "reportDeviceDatetime" : device.updated_at };
        var infoBubble = template(handleBarsData);

        var lonLat = new OpenLayers.LonLat(latitude , longitude).transform('EPSG:4326', 'EPSG:3857');
        
        // Define markers as "features" of the vector layer:
        var feature = new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.Point(longitude, latitude).transform('EPSG:4326', 'EPSG:3857'),
                {description: infoBubble} ,
                {externalGraphic: colored_marker, graphicHeight: 12, graphicWidth: 12, graphicXOffset:-6, graphicYOffset:-6  }
            );

        if(longitude==null || latitude==null){
            console.log("Selected field doesnot exist in the device report... ignoring....");
        } else {
            markers_layer.addFeatures(feature);
            console.log("Plotting device "+device._id + " at ("+latitude+", "+longitude+")");
        }

    } else {
        console.log("No data in payload field, ignoring device "+device._id);

        if(drawable){

            var latitude = Math.floor(Math.random() * 60) - 50;
            var longitude = Math.floor(Math.random() * 60) - 50;

            var lonLat = new OpenLayers.LonLat(latitude , longitude).transform('EPSG:4326', 'EPSG:3857');                 
            
            // Define markers as "features" of the vector layer:
            var feature = new OpenLayers.Feature.Vector(
                    new OpenLayers.Geometry.Point(longitude, latitude).transform('EPSG:4326', 'EPSG:3857'),
                    {description:'Dummy'} ,
                    {externalGraphic: colored_marker, graphicHeight: 12, graphicWidth: 12, graphicXOffset:-6, graphicYOffset:-6  }
                );    
            // markers_layer.addFeatures(feature);
        }
    }

    //Add a selector control to the markers_layer with popup functions
    controls = {
      selector: new OpenLayers.Control.SelectFeature(markers_layer, { onSelect: createPopup, onUnselect: destroyPopup })
    };

    map.addControl(controls['selector']);
    controls['selector'].activate();

}


function createPopup(feature) {
  feature.popup = new OpenLayers.Popup.FramedCloud("pop",
      feature.geometry.getBounds().getCenterLonLat(),
      null,
      '<div class="markerContent">'+feature.attributes.description+'</div>',
      null,
      true,
      function() { 
        controls['selector'].unselectAll();
       }
  );
  //feature.popup.closeOnMove = true;
  map.addPopup(feature.popup);
}

function destroyPopup(feature) {
  feature.popup.destroy();
  feature.popup = null;
}

$(document).ready(function(){
  $('.device-check').click(function(){
    console.log('device check clicked');
    if($(this).is(':checked')){
        console.log('it was checked');
        buildPayloadTree($(this).val());
    }
  });
});