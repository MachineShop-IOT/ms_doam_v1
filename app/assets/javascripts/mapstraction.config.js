// Revision: $Release 1.7.9 Patch2$

var mapstractionConfig = {
    mapServer:
	{
	    tileCachePath: "http://localhost/tileCache/",
	   // mapServerPath: "http://staging-laas-map.csrlbs.com/LTSMapServer1.7/MapServerHandler.ashx",
	    //clientProxyPath: 'http://staging-laas-map.csrlbs.com/LTSMapServer1.7/proxyPage.htm',
	    //serverProxyPath: "http://staging-laas-map.csrlbs.com/LTSMapServer1.7/Proxy.ashx?url=",
	    imagePath: "assets/",	    
        defaultMapName: "MachineShop"
	},
    symbols:
	{
	    styleMap:
	    {
	        'default':
	        {
	            strokeColor: 'gray',
	            strokeWidth: 1,
	            fillColor: 'lightyellow',
	            strokeOpacity: 1,
	            fillOpacity: 0.7,
	            strokeDashstyle: 'solid',
	            graphic: true,
	            pointRadius: 5,
	            graphicWidth: 18,
	            graphicHeight: 18,
	            externalGraphic: 'http://openlayers.org/dev/img/marker-gold.png',
	            cursor: "pointer",
	            graphicOpacity: 1
	        },
	        'select': 
	        {
	            strokeColor: 'red',
	            strokeWidth: 2,
	            fillColor: 'cyan',
	            strokeOpacity: 1,
	            fillOpacity: 0.7,
	            strokeDashstyle: 'solid',
	            graphic: true,
	            pointRadius: 5,
	            graphicWidth: 20,
	            graphicHeight: 20,
	            externalGraphic: 'http://openlayers.org/dev/img/marker-blue.png',
	            cursor: "pointer",
	            graphicOpacity: 1
	        }
	    },
	    renderers: ['SVG', 'Canvas', 'VML']
	},

    mapOptions:
	{
	    mapProjection: "EPSG:900913",
	    displayProjection: "EPSG:4326",
	    dbProjection: "EPSG:4326",
	    units: "m",
	    minZoomLevel: 0,
	    numZoomLevels: 22,
	    maxZoomLevel: 21,
		showLayerSwitcher: true,
		showMousePosition: true,
		showPanZoomBar: false,
		enablePanOnDrag: true,
		enableZoomOnDoubleClick: false,
		enableZoomWithMouseWheel: true,
		enableZoomBox: true
	},
	
}




