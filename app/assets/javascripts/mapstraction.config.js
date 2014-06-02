// Revision: $Release 1.6.1$

var mapstractionConfig = {
  mapServer:
  {
    tileCachePath: "http://localhost/tileCache/",
    mapServerPathForWms: "http://54.241.21.217/SiRFStudioMapServer1.6/MapServerHandler.ashx",
    proxyPath: 'http://54.241.21.217/SiRFStudioMapServer1.6/proxyPage.htm',
    //serverProxyPath: "http://SiRFStudioMapServer1.6.1/MapServerHandler/Proxy.ashx?url=",
    defaultMapName: "SiRFMap"
  },

  symbols:
  {
    strokeColor: 'red',
    strokeWidth: 1,
    fillColor: 'cyan',
    strokeOpacity: 1,
    fillOpacity: 0.3,
    strokeDashstyle: 'solid',
    graphic: true,
    pointRadius: 5,
    graphicWidth: 18,
    graphicHeight: 18,
    externalGraphic: 'http://openlayers.org/dev/img/marker-gold.png',
    selected:
    {
     strokeColor: 'yellow',
     strokeWidth: 2,
     fillColor: 'yellow',
     strokeOpacity: 1,
     fillOpacity: 0.6,
     strokeDashstyle: 'solid',
     graphic: true,
     pointRadius: 5,
     graphicWidth: 20,
     graphicHeight: 20,
     externalGraphic: 'http://openlayers.org/dev/img/marker-gold.png'
    },
    renderers: ['SVG', 'VML', 'Canvas']
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
    enableZoomOnDblClick: false
  },

  misc:
  {
    earthRadiusKm: 6371.0088,
    fontColor: "black",
    activeColor: "green"
  }
}
