/*
Copyright (c) 2009-10,  Inc


Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of the Mapstraction nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// Version: $Release 1.7.10 Patch 3$

/*
Changes in Version 1.7.9 Patch 3:
1.	Geofence edit issue fixed
2.	POI creation issue fixed
3.	POI type issue fixed
4.	Made indoor-map caching work for asset-tracking
5.	Enhancements in feature.setStyle API for ios (already gone on staging as patch 2)

Changes in Version 1.7.9 Patch 4:
1. Layer-to-map ratio introduced, to render layer-data around edges (for improved panning)
2. Rotate Layer if screen height > screen width
3. feature.setStyle modified for Canvas Renderer for improved performance
4. Error sent to layer.onloaderror if caching fails

Changes in Version 1.7.10:
1. Fixed bug in removing feature-style

Changes in Version 1.7.10 Patch 1:
1. Set DOM objects to null for improving memory loss

Changes in Version 1.7.10 Patch 2:
1. Set more DOM objects to null for improving memory loss
2. feature.getCentroid() works even when feature is not added to map

Changes in Version 1.7.10 Patch 3:
1. Bug fixes in indoorMapOverlay.switchfloor & indoorMapOverlay.getCurrentFloorIndex
2. Datasource supports single layer only
3. New API: indoorMapOverlay.getInfo to get detailed list of buildings (all or visible-only)
4. New API: layer.removeFeaturesByAttribute
//Commented for now, bcoz it conflicts with withCredentials: 5. Check for server-updates before picking from cache (this will only work if server supports 304 response & returns lastModified in response-header)
6. Support Restful API of platform, mapstraction now moving to platform
7. Fixed bug in feature.getCentroid

/** @mapstraction */
/////////////////////////////
//
// Mapstraction proper begins here
//
/////////////////////////////

/**
* Mapstraction instantiates a map with some API choice into the HTML element given
* @param {String} element The HTML element to replace with a map
* @param {String} api The API to use, one of 'google',  'openlayers'
* @param {Bool} debug optional parameter to turn on debug support - this uses alert panels for unsupported actions
* @constructor
*/
(function() {
    function Mapstraction(divID, api) {
        this.api = api;
        this.previousApi = null;
        this.maps = {};
        this.mapElement = document.getElementById(divID);
        this.eventListeners = [];
        this.loaded = {};
        this.onload = {};
        this.defaultVectorLayer = 'Vectors';
        this.defaultMarkerLayer = 'Markers';
        this.uniqueSessionID = new Date().getTime() + '_' + (Math.floor(Math.random() * Math.pow(2, 16)));
        this.getCoordinateCallback = null;
        this.addControlsArgs = {};
        this.layers = {};

        this.switchApi = function(newApi) {
            if (this.api != newApi) this.previousApi = this.api;
            this.api = newApi;
            this.loaded[newApi] = true;
        };

        this.addApi = function(divID, api) {
            if (!api || !divID) return;
            this.loaded[api] = false;
            this.onload[api] = [];
            var me = this;
            switch (api) {
                case 'openlayers':
                    shift = new OpenLayers.Pixel(625, -295);
                    var options = {
                        div: divID,
                        projection: new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection),
                        displayProjection: new OpenLayers.Projection(mapstractionConfig.mapOptions.displayProjection),
                        units: mapstractionConfig.mapOptions.units,
                        Z_INDEX_BASE: { BaseLayer: 100, Overlay: 325, Popup: 550, Control: 1000, Feature: 725 },
                        controls: [],
                        allOverlays: true,
                        fractionalZoom: true,
                        center: new OpenLayers.LonLat(0, 0),
                        zoom: 1
                    };
                    if (mapstractionConfig.mapOptions.minX != undefined && mapstractionConfig.mapOptions.minY != undefined && mapstractionConfig.mapOptions.maxX != undefined && mapstractionConfig.mapOptions.maxY != undefined) {
                        var bounds = new OpenLayers.Bounds(mapstractionConfig.mapOptions.minX, mapstractionConfig.mapOptions.minY, mapstractionConfig.mapOptions.maxX, mapstractionConfig.mapOptions.maxY);
                        bounds.transform(new OpenLayers.Projection(mapstractionConfig.mapOptions.dbProjection), new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection));
                        options.restrictedExtent = bounds;
                    }
                    if (mapstractionConfig.mapOptions.centerX != undefined && mapstractionConfig.mapOptions.centerY != undefined) {
                        var center = new OpenLayers.LonLat(mapstractionConfig.mapOptions.centerX, mapstractionConfig.mapOptions.centerY);
                        center.transform(new OpenLayers.Projection(mapstractionConfig.mapOptions.dbProjection), new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection));
                        options.center = center;
                    }
                    if (mapstractionConfig.mapOptions.zoom != undefined) {
                        options.zoom = zoom;
                    }
                    if (mapstractionConfig.mapOptions.minZoomLevel && mapstractionConfig.mapOptions.minZoomLevel != null) {
                        options.minZoomLevel = mapstractionConfig.mapOptions.minZoomLevel;
                    }
                    if (mapstractionConfig.mapOptions.maxZoomLevel && mapstractionConfig.mapOptions.maxZoomLevel != null) {
                        options.maxZoomLevel = mapstractionConfig.mapOptions.maxZoomLevel;
                    }
                    if (mapstractionConfig.mapOptions.numZoomLevels && mapstractionConfig.mapOptions.numZoomLevels != null) {
                        options.numZoomLevels = mapstractionConfig.mapOptions.numZoomLevels;
                    }
                    if (mapstractionConfig.mapOptions.minResolution && mapstractionConfig.mapOptions.minResolution != null) {
                        options.minResolution = mapstractionConfig.mapOptions.minResolution;
                    }
                    if (mapstractionConfig.mapOptions.maxResolution && mapstractionConfig.mapOptions.maxResolution != null) {
                        options.maxResolution = mapstractionConfig.mapOptions.maxResolution;
                    }
                    if (mapstractionConfig.mapOptions.showLayerSwitcher == true) {
                        if (typeof OpenLayers.Control.LayerSwitcher === 'function') {
                            options.controls.push(new OpenLayers.Control.LayerSwitcher());
                        }
                    }
                    if (mapstractionConfig.mapOptions.showMousePosition == true) {
                        if (typeof OpenLayers.Control.MousePosition === 'function') {
                            options.controls.push(new OpenLayers.Control.MousePosition());
                        }
                    }
                    if (mapstractionConfig.mapOptions.showPanZoomBar == true) {
                        options.controls.push(new OpenLayers.Control.PanZoomBar());
                    }
                    else if (mapstractionConfig.mapOptions.showZoomButtons == true) {
                        options.controls.push(new OpenLayers.Control.Zoom());
                    }
                    var navControls = [];
                    if (mapstractionConfig.mapOptions.enableTouchNavigation) {
                        navControls.push(new OpenLayers.Control.TouchNavigation({
                            dragPanOptions: { enableKinetic: true }
                        }));
                    }
                    if (mapstractionConfig.mapOptions.enableDefaultNavigation || navControls.length == 0) {
                        navControls.push(new OpenLayers.Control.Navigation());
                    }

                    for (var ndx = 0; ndx < navControls.length; ++ndx) {
                        if (mapstractionConfig.mapOptions.enableZoomOnDoubleClick !== true) {
                            navControls[ndx].defaultDblClick = function(event) { return true; };
                        }
                        if (mapstractionConfig.mapOptions.enableZoomOutOnRightDblClick !== true) {
                            if (navControls[ndx].defaultDblRightClick) navControls[ndx].defaultDblRightClick = function(event) { return; };
                        }
                        if (mapstractionConfig.mapOptions.enableZoomWithMouseWheel !== true) {
                            navControls[ndx].zoomWheelEnabled = false;
                        }
                        if (mapstractionConfig.mapOptions.enableZoomBox !== true) {
                            navControls[ndx].zoomBoxEnabled = false;
                        }
                        options.controls.push(navControls[ndx]);
                    }

                    //Create map
                    this.maps[api] = new OpenLayers.Map(options);

                    //Allow further propagation of mouse-down events
                    for (var ndx = 0; ndx < navControls.length; ++ndx) {
                        if (navControls[ndx].dragPan) {
                            navControls[ndx].dragPan.handler.stopDown = false;
                            if (mapstractionConfig.mapOptions.enablePanOnDrag !== true) {
                                navControls[ndx].dragPan.deactivate();
                            }
                        }
                    }
                    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
                    OpenLayers.Util.onImageLoadErrorColor = "transparent";
                    OpenLayers.Util.onImageLoadError = function() {
                        this.style.display = 'none';
                        //me.sirfRequestHandler.updateUrlWithServiceAccessor(this.src);
                    }
                    OpenLayers.Util.onImageLoad = function() {
                        if (!this.viewRequestID || (this.map && this.viewRequestID == this.map.viewRequestID)) {
                            this.style.backgroundColor = "transparent";
                            this.style.display = "";
                            //Check if image URL matches History URL
                            //me.sirfRequestHandler.updateUrlWithServiceAccessor(this.src);
                        }
                    };

                    this.loaded[api] = true;
                    break;
                default:
                    if (this.debug) {
                        alert(api + ' not supported by mapstraction');
                    }
            }
        };
        this.addApi(divID, api);
    }

    Mapstraction.prototype.updateMapSize = function() {
        try {
            var mapObj = this.maps[this.api];
            mapObj.updateSize();
            mapObj = null;
        }
        catch (e) { }
    }

    /**
    * Adds a marker pin to the map
    * @param {Marker} marker The marker to add
    * @param {Boolean} old If true, doesn't add this marker to the markers array.
    */
    Mapstraction.prototype.addMarker = function(marker, layerName, zoomToLocation) {
        marker.api = this.api;
        marker.map = this.maps[this.api];

        if (this.loaded[this.api] === false) {
            var me = this;
            this.onload[this.api].push(function() {
                me.addMarker(marker, layerName);
            });
            return;
        }

        switch (this.api) {
            case 'openlayers':
                var olMarker = marker.toOpenLayers();
                marker.proprietary_marker = olMarker;
                if (!layerName) layerName = this.defaultMarkerLayer;
                var markerLayer = this.maps[this.api].getLayersByName(layerName)[0];
                if (!markerLayer) {
                    markerLayer = this.addLayer('MARKER', layerName);
                }
                markerLayer.addMarker(olMarker);
                if (zoomToLocation) {
                    this.zoomToLocation(marker.location);
                }
                break;
            case 'micello':
                var indoorMap = this.maps['micello'];
                if (indoorMap == null) return;
                var mMarker = marker.toMicello();
                mMarker.anm = layerName;
                marker.proprietary_marker = mMarker;
                marker.map.addMarkerOverlay(mMarker, true);
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.addMarker');
                }
        }
        mapObj = null;
    };

    /**
    * addMarkerWithData will addData to the marker, then add it to the map
    * @param {Marker} marker The marker to add
    * @param {Object} data A data has to add
    */
    Mapstraction.prototype.addMarkerWithData = function(marker, data) {
        marker.addData(data);
        this.addMarker(marker, false);
    };

    /**
    * removeMarker removes a Marker from the map
    * @param {Marker} marker The marker to remove
    */

    Mapstraction.prototype.removeMarker = function(marker, layerName) {
        if (!marker || marker == null) return;
        if (this.loaded[this.api] === false) {
            var me = this;
            this.onload[this.api].push(function() {
                me.removeMarker(marker);
            });
            return;
        }

        switch (marker.api) {
            case 'openlayers':
                if (!layerName) layerName = this.defaultMarkerLayer;
                var layer = this.maps[marker.api].getLayersByName(layerName)[0];
                if (layer) {
                    var olMarker = marker.proprietary_marker;
                    if (olMarker.popup) this.maps[marker.api].removePopup(olMarker.popup);
                    olMarker.popup = null;
                    layer.removeMarker(olMarker);
                    olMarker = null;
                }
                layer = null;
                break;
            case 'micello':
                var indoorMap = this.maps[marker.api];
                if (indoorMap != null) indoorMap.removeMarkerOverlay(marker.proprietary_marker.aid);
                break;
            default:
                if (this.debug) {
                    alert(marker.api + ' not supported by Mapstraction.removeMarker');
                }
                break;
        }
    };

    /**
    * removeAllMarkers removes all the Markers on a map
    */
    Mapstraction.prototype.removeAllMarkers = function(layerName) {
        if (this.loaded[this.api] === false) {
            var me = this;
            this.onload[this.api].push(function() {
                me.removeAllMarkers();
            });
            return;
        }

        switch (this.api) {
            case 'openlayers':
                if (!layerName) layerName = this.defaultMarkerLayer;
                var layer = this.maps[this.api].getLayersByName(layerName)[0];
                if (layer) {
                    var olMarkers = layer.markers;
                    while (olMarkers.length > 0) {
                        var olMarker = olMarkers[0];
                        if (olMarker.popup) this.maps[this.api].removePopup(olMarker.popup);
                        olMarker.popup = null;
                        layer.removeMarker(olMarker);
                        olMarker = null;
                    }
                    olMarkers = null;
                }
                break;
            case 'micello':
                var indoorMap = this.maps['micello'];
                if (indoorMap != null) indoorMap.removeAnnotation(layerName);
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.removeAllMarkers');
                }
                break;
        }
    };

    /**
    * Add a feature to the map
    * @param {feature} feature The feature to add to the map
    * @param {layerName} layerName Layer to which feature will be added
    * @param {Boolean} Whether to zoom to feature
    */
    Mapstraction.prototype.addFeature = function(feature, layerName, zoomToFeature) {
        if (this.loaded[this.api] === false) {
            var me = this;
            this.onload[this.api].push(function() {
                me.addFeature(feature);
            });
            return;
        }

        if (!layerName) layerName = feature.layerName || this.defaultVectorLayer;
        feature.api = this.api;
        feature.map = this.maps[this.api];
        feature.layerName = layerName;
        if (!this.isLayerPresent(layerName)) {
            this.addLayer('VECTOR', layerName);
        }
        switch (this.api) {
            case 'openlayers':
                var olfeature = feature.toOpenLayers();
                feature.proprietary_feature = olfeature;
                var featureLayer = this.maps[this.api].getLayersByName(layerName)[0];
                featureLayer.addFeatures([olfeature]);
                if (zoomToFeature) {
                    this.maps[this.api].zoomToExtent(olfeature.geometry.getBounds());
                }
                var featureId = olfeature.id;
                olfeature = null;
                return featureId;
                break;
            case 'micello':
                var mGeometry = feature.toMicello();
                mGeometry.anm = layerName;
                mGeometry.t = layerName + ((mGeometry.gt == 1) ? "_Line" : "_Poly");
                mGeometry.lid = this.maps[this.api].getCurrentLevel().id;
                this.maps[this.api].addGeometryOverlay(mGeometry);
                if (feature.style) {
                    var featureStyle = 'Feature_' + mGeometry.aid;
                    this.addLayer('VECTOR', featureStyle, '', { style: feature.style });
                    var themeName = featureStyle + ((mGeometry.gt == 1) ? "_Line" : "_Poly");
                    var inlay = { "id": mGeometry.aid, "t": themeName, "anm": layerName };
                    this.maps[this.api].addInlay(inlay);
                }
                feature.proprietary_feature = mGeometry;
                var geomId = mGeometry.id;
                mGeometry = null;
                return geomId;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.addFeature');
                }
        }
    };

    /**
    * Remove the feature from the map
    * @param {feature} feature The feature to remove from the map
    */
    Mapstraction.prototype.removeFeature = function(feature) {
        if (feature && feature != null) {
            switch (feature.api) {
                case 'openlayers':
                    var layerName = feature.proprietary_feature.layer.name;
                    var layer = this.maps[feature.api].getLayersByName(layerName)[0];
                    if (layer) layer.removeFeatures(feature.proprietary_feature);
                    layer = null;
                    break;
                case 'micello':
                    this.maps[feature.api].removeGeometryOverlay(feature.proprietary_feature.aid);
                    break;
                default:
                    if (this.debug) {
                        alert(this.api + ' not supported by Mapstraction.removeFeature');
                    }
            }
        }
    };

    /**
    * Removes all polylines from the map (deprecated)
    */
    Mapstraction.prototype.removeAllPolylines = function(layerName) {
        this.removeAllFeatures();
    };

    /**
    * Removes all features from the map
    */
    Mapstraction.prototype.removeAllFeatures = function(layerName) {
        if (!layerName) layerName = this.defaultVectorLayer;
        switch (this.api) {
            case 'openlayers':
                var layer = this.maps[this.api].getLayersByName(layerName)[0];
                layerName.removeAllFeatures();
                layer = null;
                break;
            case 'micello':
                this.maps[this.api].removeAnnotation(layerName);
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.removeAllFeatures');
                }
        }
    };

    /**
    * Select a feature on map
    * @param {feature} feature The feature to select on map
    */
    Mapstraction.prototype.selectFeature = function(feature) {
        if (feature) {
            switch (this.api) {
                case 'openlayers':
                    var olFeature = feature.proprietary_feature;
                    var layer = olFeature.layer;
                    if (!layer) return;
                    layer.drawFeature(olFeature, 'select');
                    layer.selectedFeatures.push(olFeature);
                    olFeature.renderIntent = 'select';
                    olFeature = null;
                    layer = null;
                    break;
                case 'micello':
                    var themeName = 'Selected_' + ((feature.gt == 1) ? 'Line' : 'Poly');
                    var inlay = { "id": (feature.proprietary_feature.aid) ? feature.proprietary_feature.aid : feature.proprietary_feature.id, "t": themeName, "anm": "Selected" };
                    this.maps[this.api].addInlay(inlay);
                    break;
                default:
                    if (this.debug) {
                        alert(this.api + ' not supported by Mapstraction.selectFeature');
                    }
            }
        }
    };

    /**
    * Unselect a feature on map
    * @param {feature} feature The feature to unselect on map
    */
    Mapstraction.prototype.unselectAllFeatures = function(layerName) {
        switch (this.api) {
            case 'openlayers':
                var layers = (layerName) ? this.maps[this.api].getLayersByName(layerName) : this.maps[this.api].getLayersByClass('OpenLayers.Layer.Vector');
                for (var idx = 0; idx < layers.length; idx++) {
                    var layer = layers[idx];
                    for (var jdx = layer.selectedFeatures.length - 1; jdx >= 0; --jdx) {
                        var olfeature = layer.selectedFeatures[jdx];
                        if (olfeature.layer == layer) {
                            layer.drawFeature(olfeature, 'default');
                        }
                        OpenLayers.Util.removeItem(layer.selectedFeatures, olfeature);
                        olfeature.renderIntent = 'default';
                        olfeature = null;
                    }
                    layer = null;
                }
                layers = null;
                break;
            case 'micello':
                this.maps[this.api].removeInlay("Selected", true);
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.unselectAllFeatures');
                }
        }
    };

    /**
    * Unselect a feature on map
    * @param {feature} feature The feature to unselect on map
    */
    Mapstraction.prototype.unselectFeature = function(feature) {
        if (feature) {
            switch (this.api) {
                case 'openlayers':
                    var olfeature = feature.proprietary_feature;
                    if (!olfeature.layer) return;
                    olfeature.layer.drawFeature(olfeature, 'default');
                    OpenLayers.Util.removeItem(olfeature.layer.selectedFeatures, olfeature);
                    olfeature.renderIntent = 'default';
                    olfeature = null;
                    break;
                case 'micello':
                    this.maps[this.api].removeInlay("Selected", true);
                    break;
                default:
                    if (this.debug) {
                        alert(this.api + ' not supported by Mapstraction.unselectAllFeatures');
                    }
            }
        }
    };

    Mapstraction.prototype.getFeatures = function(layerName) {
        var msFeatureArray = [];
        if (!layerName || layerName == '' || layerName == null) layerName = this.defaultVectorLayer;
        switch (this.api) {
            case 'openlayers':
                var layer = this.maps[this.api].getLayersByName(layerName)[0];
                if (layer) {
                    var olFeatureArray = layer.features;
                    for (var idx = 0; idx < olFeatureArray.length; idx++) {
                        var olFeature = olFeatureArray[idx];
                        if (!olFeature.childFeatures && olFeature.onScreen(true)) {
                            var msFeature = Feature.fromOpenLayers(olFeature);
                            msFeatureArray.push(msFeature);
                        }
                        olFeature = null;
                        msFeature = null;
                    }
                }
                layer = null;
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.getFeatures');
                }
        }
        return msFeatureArray;
    };


    Mapstraction.prototype.getFeatureById = function(featureId, layerName) {
        if (!layerName || layerName == '' || layerName == null) layerName = this.defaultVectorLayer;
        switch (this.api) {
            case 'openlayers':
                var layer = this.maps[this.api].getLayersByName(layerName)[0];
                if (layer) {
                    var olFeature = layer.getFeatureById(featureId);
                    var mxnFeature = Feature.fromOpenLayers(olFeature);
                    olFeature = null;
                    return mxnFeature;
                }
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.getFeatureById');
                }
        }
        return null;
    };

    Mapstraction.prototype.getFeaturesByAttribute = function(layerName, attributeName, attributeValue, options) {
        var msFeatureArray = [];
        if (!layerName || layerName == '' || layerName == null) layerName = this.defaultVectorLayer;
        switch (this.api) {
            case 'openlayers':
                var layer = this.layers[layerName];
                if (layer) {
                    msFeatureArray = layer.getFeaturesByAttribute(attributeName, attributeValue, options);
                }
                layer = null;
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.getFeaturesByAttribute');
                }
        }
        return msFeatureArray;
    };

    /**
    * Get features at given location
    * @param {latLonPoint} location at which feature will be searched.
    */
    Mapstraction.prototype.getFeaturesAtLocation = function(location, layerName, e) {
        if (location && location != null) {
            switch (this.api) {
                case 'openlayers':
                    var olPixel = this.getPixelFromLatLon(location);
                    var viewPortDiv = this.maps[this.api].getViewport();
                    var x = olPixel[0] - viewPortDiv.offsetLeft;
                    var y = olPixel[1] - viewPortDiv.offsetTop;
                    var el = viewPortDiv;
                    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
                        x += el.offsetLeft - el.scrollLeft;
                        y += el.offsetTop - el.scrollTop;
                        el = el.offsetParent;
                    }
                    var features = [], targets = [], layers = [];
                    var layer, target, feature, i, len;
                    var vectorLayers = this.maps[this.api].getLayersByClass('OpenLayers.Layer.Vector');
                    //Loop from top-most layer to bottom-most layer
                    for (i = vectorLayers.length - 1; i >= 0; --i) {
                        layer = vectorLayers[i];
                        if (layer.div.style.display !== "none") {
                            if ((!layerName || layerName == layer.name) && (layer.name != '__selected')) {
                                if (layer.renderer instanceof OpenLayers.Renderer.Canvas) {
                                    var data = layer.renderer.hitContext.getImageData(x, y, 1, 1).data;
                                    if (data[3] === 255) { // antialiased
                                        var id = data[2] + (256 * (data[1] + (256 * data[0])));
                                        if (id) {
                                            featureId = "OpenLayers.Feature.Vector_" + (id - 1 + layer.renderer.hitOverflow);
                                            try {
                                                feature = layer.renderer.features[featureId][0];
                                                var msFeature = Feature.fromOpenLayers(feature, this.maps[this.api])
                                                features.push(msFeature);
                                            } catch (err) {
                                            }
                                        }
                                    }
                                }
                                else {
                                    target = document.elementFromPoint(x, y);
                                    while (target && target._featureId) {
                                        feature = layer.getFeatureById(target._featureId);
                                        if (feature) {
                                            var msFeature = mxn.Feature.fromOpenLayers(feature, this.maps[this.api])
                                            features.push(msFeature);
                                            target.style.display = "none";
                                            targets.push(target);
                                            target = document.elementFromPoint(x, y);
                                        } else {
                                            // sketch, all bets off
                                            target = false;
                                        }
                                    }
                                }
                            }
                            layers.push(layer);
                            layer.div.style.display = "none";
                        }
                    }
                    // restore feature visibility
                    for (i = 0, len = targets.length; i < len; ++i) {
                        targets[i].style.display = "";
                    }
                    // restore layer visibility
                    for (i = layers.length - 1; i >= 0; --i) {
                        layers[i].div.style.display = "block";
                    }
                    return features;
                default:
                    if (this.debug) {
                        alert(this.api + ' not supported by Mapstraction.getFeaturesAtLocation');
                    }
            }
        }
    };


    Mapstraction.prototype.removeFeatures = function(layerName, featureArray) {
        if (!layerName || layerName == '' || layerName == null) layerName = this.defaultVectorLayer;
        switch (this.api) {
            case 'openlayers':
                var layer = this.maps[this.api].getLayersByName(layerName)[0];
                if (layer) {
                    if (featureArray && featureArray.length > 0) {
                        if (!(featureArray instanceof Array)) { featureArray = [featureArray] };
                        var olFeatureArray = [];
                        for (var idx = 0; idx < featureArray.length; idx++) {
                            olFeatureArray.push(featureArray[idx].proprietary_feature);
                        }
                        layer.destroyFeatures(olFeatureArray);
                    }
                    else {
                        layer.destroyFeatures();
                    }
                    layer.redraw();
                }
                layer = null;
                break;
            case 'micello':
                if (featureArray && featureArray.length > 0) {
                    for (var idx = 0; idx < featureArray.length; idx++) {
                        this.maps[this.api].removeGeometryOverlay(featureArray[idx].proprietary_feature.aid);
                    }
                }
                else {
                    this.maps[this.api].removeAnnotation(layerName);
                }
                break;
            default:
                break;
        }
    };

    Mapstraction.prototype.deleteFeatureById = function(featureId, layerName) {
        this.removeFeatureById(featureId, layerName);
    };

    Mapstraction.prototype.removeFeatureById = function(featureId, layerName) {
        if (!featureId || featureId == '' || featureId == null) return;
        if (!layerName || layerName == '' || layerName == null) layerName = this.defaultVectorLayer;
        switch (this.api) {
            case 'openlayers':
                var layer = this.maps[this.api].getLayersByName(layerName)[0];
                if (layer) {
                    var featureToDelete = layer.getFeatureById(featureId);
                    layer.destroyFeatures(featureToDelete);
                    layer.redraw();
                }
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.removeFeatureById');
                }
        }
    };

    /**
    * Centers the map to some place and zoom level
    * @param {LatLonPoint} point Where the center of the map should be
    * @param {Integer} zoomLevel The zoom level where 0 is all the way out.
    */
    Mapstraction.prototype.setCenterAndZoom = function(location, zoomLevel) {
        if (this.loaded[this.api] === false) {
            var me = this;
            this.onload[this.api].push(function() {
                me.setCenterAndZoom(location, zoomLevel);
            });
            return;
        }
        var mapObj = this.maps[this.api];

        switch (this.api) {
            case 'openlayers':
                var olPoint = location.toOpenLayers();
                mapObj.setCenter(olPoint, zoomLevel);
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.setCenterAndZoom');
                }
        }
        mapObj = null;
    };


    /**
    * getCenter gets the central point of the map
    * @type {LatLonPoint} The center point of the map
    */
    Mapstraction.prototype.getCenter = function() {
        if (this.loaded[this.api] === false) {
            return null;
        }

        var mapObj = this.maps[this.api];
        var point;
        var pt;
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                pt = mapObj.getCenter();
                point = new LatLonPoint(pt.lat(), pt.lng());
                break;
            case 'openlayers':
                if (!mapObj.baseLayer) return;
                pt = mapObj.getCenter();
                pt.transform(new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection), new OpenLayers.Projection(mapstractionConfig.mapOptions.displayProjection));
                point = new mxn.LatLonPoint(pt.lat, pt.lon);
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.getCenter');
                }
        }
        mapObj = null;
        return point;
    };

    /**
    * setCenter sets the central point of the map
    * @param {LatLonPoint} point The point at which to center the map
    * @options {hash} optional parameters, such as {pan:true}
    */
    Mapstraction.prototype.setCenter = function(location, options) {
        if (this.loaded[this.api] === false) {
            var me = this;
            this.onload[this.api].push(function() {
                me.setCenter(location, options);
            });
            return;
        }

        var mapObj = this.maps[this.api];

        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                if (options != null && options['pan']) { mapObj.panTo(location.toGoogle()); }
                else { mapObj.setCenter(location.toGoogle()); }
                break;
            case 'openlayers':
                var point = location.toOpenLayers();
                mapObj.setCenter(point);
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.setCenter');
                }
        }
        mapObj = null;
    };


    /**
    * setZoom sets the zoom level for the map
    * MS doesn't seem to do zoom=0, and Gg's sat goes closer than it's maps, and MS's sat goes closer than Y!'s
    * TODO: Mapstraction.prototype.getZoomLevels or something.
    * @param {int} zoom The (native to the map) level zoom the map to.
    */
    Mapstraction.prototype.setZoom = function(zoom) {
        if (this.loaded[this.api] === false) {
            var me = this;
            this.onload[this.api].push(function() {
                me.setZoom(zoom);
            });
            return;
        }

        var mapObj = this.maps[this.api];

        switch (this.api) {

            case 'google':
            case 'openstreetmap':
                mapObj.setZoom(zoom);
                break;
            case 'openlayers':
                mapObj.zoomTo(zoom);
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.setZoom');
                }
        }
        mapObj = null;
    };

    /**
    * autoCenterAndZoom sets the center and zoom of the map to the smallest bounding box
    * containing all markers
    */
    Mapstraction.prototype.autoCenterAndZoom = function() {
        if (this.loaded[this.api] === false) {
            var me = this;
            this.onload[this.api].push(function() {
                me.autoCenterAndZoom();
            });
            return;
        }

        switch (this.api) {
            case 'openlayers':
                var bounds = null;
                for (var idx = 0; idx < this.maps[this.api].layers.length; idx++) {
                    var layer = this.maps[this.api].layers[idx];
                    if (layer.CLASS_NAME == 'OpenLayers.Layer.Vector' || layer.CLASS_NAME == 'OpenLayers.Layer.Markers') {
                        if (bounds == null) {
                            bounds = layer.getDataExtent();
                        }
                        else {
                            bounds.extend(layer.getDataExtent());
                        }
                    }
                }

                if (bounds != null) {
                    this.maps[this.api].zoomToExtent(bounds);
                }
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.autoCenterAndZoom');
                }
        }
    };

    /**
    * zoomToPoints sets the center and zoom of the map from an array of points
    *
    * This is useful if you don't want to have to add markers to the map
    */
    Mapstraction.prototype.zoomToPoints = function(points) {
        var bounds = new ABoundingBox(points[0].lat, points[0].lon, points[0].lat, points[0].lon);

        for (var idx = 1, len = points.length; idx < len; idx++) {
            bounds.extend(points[idx]);
        }

        this.setBounds(bounds);
    };

    /**
    * Sets the center and zoom of the map to the smallest bounding box
    * containing all visible markers and features
    * will only include markers and features with an attribute of "visible"
    */
    Mapstraction.prototype.visibleCenterAndZoom = function() {
        if (this.loaded[this.api] == false) {
            myself = this;
            this.onload[this.api].push(function() {
                myself.autoCenterAndZoom();
            });
            return;
        }

        this.autoCenterAndZoom();
    };


    Mapstraction.prototype.isValidZoomLevel = function(zoom) {
        if (this.loaded[this.api] === false) {
            var me = this;
            return -1;
        }

        var mapObj = this.maps[this.api];

        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                return true;
            case 'openlayers':
                return mapObj.isValidZoomLevel(zoom);
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.isValidZoomLevel');
                }
        }
        mapObj = null;
    }


    /**
    * getZoom returns the zoom level of the map
    * @type {Integer} The zoom level of the map
    */
    Mapstraction.prototype.getZoom = function() {
        if (this.loaded[this.api] === false) {
            var me = this;
            return -1;
        }

        var mapObj = this.maps[this.api];

        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                return mapObj.getZoom();
            case 'openlayers':
                return mapObj.zoom;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.getZoom');
                }
        }
        mapObj = null;
    };

    /**
    * getZoomLevelForABoundingBox returns the best zoom level for bounds given
    * @param ABoundingBox the bounds to fit
    * @type {Integer} The closest zoom level that contains the bounding box
    */
    Mapstraction.prototype.getZoomLevelForBoundingBox = function(bbox) {
        if (this.loaded[this.api] === false) {
            var me = this;
            return -1;
        }

        var mapObj = this.maps[this.api];

        // NE and SW points from the bounding box.
        var ne = bbox.getNorthEast();
        var sw = bbox.getSouthWest();
        var zoom;

        switch (this.api) {
            case 'google':
                // no break statement here intentionally       
            case 'openlayers':
                //  FIXME: ABoundingBox.toOpenLayers is missing
                // var olbox = bbox.toOpenLayers();
                // zoom = mapObj.getZoomForExtent(olbox);
                return zoom;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.getZoomLevelForBoundingBox');
                }
        }
        mapObj = null;
    };

    /**
    * getBounds gets the ABoundingBox of the map
    * @returns the bounding box for the current map state
    * @type ABoundingBox
    */
    Mapstraction.prototype.getBounds = function() {
        if (this.loaded[this.api] === false) {
            return null;
        }

        var mapObj = this.maps[this.api];
        var ne, sw, nw, se;
        switch (this.api) {

            case 'google':
            case 'openstreetmap':
                var gbox = mapObj.getBounds();
                sw = gbox.getSouthWest();
                ne = gbox.getNorthEast();
                return new ABoundingBox(sw.lat(), sw.lng(), ne.lat(), ne.lng());

            case 'openlayers':
                var mapBounds = mapObj.calculateBounds();
                mapBounds.transform(new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection), new OpenLayers.Projection(mapstractionConfig.mapOptions.dbProjection));
                return new mxn.ABoundingBox(mapBounds.bottom, mapBounds.left, mapBounds.top, mapBounds.right);
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.getBounds');
                }
        }
        mapObj = null;
    };

    /**
    * setBounds sets the map to the appropriate location and zoom for a given ABoundingBox
    * @param {ABoundingBox} the bounding box you want the map to show
    */
    Mapstraction.prototype.setBounds = function(bounds) {
        if (this.loaded[this.api] === false) {
            var me = this;
            this.onload[this.api].push(function() {
                me.setBounds(bounds);
            });
            return;
        }
        var mapObj = this.maps[this.api];

        switch (this.api) {

            case 'google':
            case 'openstreetmap':
            case 'openlayers':
                var obounds = bounds.toOpenLayers();
                mapObj.zoomToExtent(obounds);
                break;

            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.setBounds');
                }
        }
        mapObj = null;
    };


    /**
    * getMap returns the native map object that mapstraction is talking to
    * @returns the native map object mapstraction is using
    */
    Mapstraction.prototype.getMap = function() {
        // FIXME in an ideal world this shouldn't exist right?
        return this.maps[this.api];
    };


    /**
    * Enable scroll wheel zooming
    * Currently only supported by Google
    */
    Mapstraction.prototype.enableScrollWheelZoom = function() {
        if (this.loaded[this.api] == false) {
            myself = this;
            this.onload[this.api].push(function() {
                myself.enableScrollWheelZoom();
            });
            return;
        }

        var mapObj = this.maps[this.api];

        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                mapObj.enableContinuousZoom();
                mapObj.enableScrollWheelZoom();
                break;
            default:
                if (this.debug) {
                    alert(api + ' not supported by Mapstration.enableScrollWheelZoom');
                }
                break;
        }
        mapObj = null;
    };

    Mapstraction.prototype.removeLayer = function(layerName) {
        switch (this.api) {
            case 'openlayers':
                if (this.layers[layerName]) {
                    this.removeLayers(this.layers[layerName]);
                    return;
                }
                var olLayers = this.maps[this.api].getLayersByName(layerName);
                for (var ldx = 0; ldx < olLayers.length; ldx++) {
                    if (olLayers[ldx].map) {
                        this.maps[this.api].removeLayer(olLayers[ldx]);
                    }
                }
                if (this.maps[this.api].baseLayer == null) {
                    this.maps[this.api].allOverlays = true;
                    if (this.maps[this.api].layers.length > 0) {
                        this.maps[this.api].baseLayer = this.maps[this.api].layers[0];
                    }
                }
                olLayers = null;
                break;
            case 'micello':
                if (layerName == undefined || layerName == null) layerName = "Unknown_MICELLO";
                var micelloDiv = document.getElementById(layerName);
                if (micelloDiv != null) {
                    micelloDiv.style.display = 'none';
                    micelloDiv = null;
                    this.switchApi(this.previousApi);
                }
                else if (this.isLayerPresent(layerName)) {
                    this.maps[this.api].mapCanvas.mapTheme.themes[0].s[layerName + "_Poly"] = undefined;
                    this.maps[this.api].mapCanvas.mapTheme.themes[0].s[layerName + "_Line"] = undefined;
                }
                break;
            default:
                if (this.debug) {
                    alert(api + ' not supported by Mapstraction.removeLayer');
                }
                break;
        }
    };

    Mapstraction.prototype.removeLayers = function(layers) {
        switch (this.api) {
            case 'openlayers':
                if (layers) {
                    if (!(layers instanceof Array)) layers = [layers];
                    for (var idx = 0; idx < layers.length; idx++) {
                        var layer = layers[idx];
                        if (layer.childLayers) {
                            for (var childLayerName in layer.childLayers) {
                                var childLayer = layer.childLayers[childLayerName];
                                var childOlLayer = childLayer.proprietary_layer;
                                if (childOlLayer && childOlLayer.map) {
                                    this.maps[this.api].removeLayer(childOlLayer);
                                    this.layers[childLayer.name] = undefined;
                                }
                                childLayer.isFirstLoad = true;
                                childOlLayer = null;
                                childLayer = null;
                            }
                        }
                        var olLayer = layer.proprietary_layer;
                        if (olLayer && olLayer.map) {
                            this.maps[this.api].removeLayer(olLayer);
                            this.layers[layer.name] = undefined;
                        }
                        layer.isFirstLoad = true;
                        olLayer = null;
                        layer = null;
                    }
                    if (this.maps[this.api].baseLayer == null) {
                        this.maps[this.api].allOverlays = true;
                        if (this.maps[this.api].layers.length > 0) {
                            this.maps[this.api].baseLayer = this.maps[this.api].layers[0];
                        }
                    }
                }
                break;
            default:
                if (this.debug) {
                    alert(api + ' not supported by Mapstraction.removeLayers');
                }
                break;
        }
    };

    Mapstraction.prototype.isLayerPresent = function(layerName) {
        switch (this.api) {
            case 'openlayers':
                if (this.layers[layerName]) return true;
                var layer = this.maps[this.api].getLayersByName(layerName)[0];
                if (layer) {
                    return true;
                }
                break;
            case 'micello':
                if (this.maps[this.api].mapCanvas.mapTheme && this.maps[this.api].mapCanvas.mapTheme.themes.length > 0 && this.maps[this.api].mapCanvas.mapTheme.themes[0].s[layerName + "_Poly"]) {
                    return true;
                }
                break;
            default:
                if (this.debug) {
                    alert(api + ' not supported by Mapstraction.isLayerPresent');
                }
                break;
        }
        return false;
    };

    Mapstraction.prototype.getSupportedLayers = function() {
        var layerInfo = {};
        for (var layerName in mapstractionConfig.layers) {
            var layerSettings = mapstractionConfig.layers[layerName];
            if (layerSettings.dataSource) {
                layerInfo[layerName] = layerSettings.dataSource.layerName;
            }
            if (layerSettings.childLayers) {
                for (var childLayerName in layerSettings.childLayers) {
                    var childLayerSettings = layerSettings.childLayers[childLayerName];
                    if (childLayerSettings.dataSource) {
                        layerInfo[childLayerName] = childLayerSettings.dataSource.layerName;
                    }
                }
            }
        }
        return layerInfo;
    }

    /*
    *   Mapstraction.prototype.addLayer = function(type, layerDisplayName, mapName, options)
    *
    *   type :              WMS, GOOGLE, TMS, YAHOO, BING,VECTOR
    *   layerDisplayName:   Name of layer to be displayed in layer-switcher
    *   mapName :           mapName for WMS layers
    *   options :           options JSON containing layerNames, isTransparent, format, isBaseLayer, 
    whereClauses, isVisible, isSingleTile, isAnimated, arePointsConnected, hidePoints, micelloKey, map_id, level_id, style
    */
    Mapstraction.prototype.addLayer = function(type, layerDisplayName, mapName, options) {
        //Reformat options as per new mxn.Layer API
        if (!options) options = {};
        if (type == 'VECTOR' || type == 'WMS' || type == 'MARKER') {
            if (options.layerNames) {
                options.dataSource = {
                    layerName: options.layerNames,
                    queryFilter: options.whereClauses,
                    sortByField: options.sortByFields,
                    outputFields: options.outputFields,
                    mapName: mapName
                };
            }
            if (options.isBaseLayer == undefined) {
                options.isBaseLayer = false;
            }
        }
        options.name = layerDisplayName;
        options.type = type;
        options.onLoadEnd = options.onLayerLoad;
        options.onZoomPanEnd = options.onLayerLoad;
        options.onLoadError = options.onLayerLoadError;

        //Apply remaining layer-options from config.
        var layerSettingsInConfig;
        var parentLayerName = null;
        for (var layerName in mapstractionConfig.layers) {
            var layerSettings = mapstractionConfig.layers[layerName];
            if (layerDisplayName.indexOf(layerName) > -1) {
                layerSettingsInConfig = layerSettings;
                break;
            }
            else if (layerSettings.dataSource && !layerSettings.dataSource.layerName && options.dataSource &&
                                                    layerSettings.dataSource.layerName == options.dataSource.layerName) {
                layerSettingsInConfig = mapstractionConfig.layers[layerName];
                break;
            }
            else if (layerSettings.childLayers) {
                for (var childLayerName in layerSettings.childLayers) {
                    var childLayerSettings = layerSettings.childLayers[childLayerName];
                    if (layerDisplayName.indexOf(childLayerName) > -1) {
                        layerSettingsInConfig = childLayerSettings;
                        parentLayerName = layerName;
                        break;
                    }
                    else if (childLayerSettings.dataSource && options.dataSource && !childLayerSettings.dataSource.layerName &&
                                                    childLayerSettings.dataSource.layerName == options.dataSource.layerName) {
                        layerSettingsInConfig = childLayerSettings;
                        parentLayerName = layerName;
                        break;
                    }
                }
                if (layerSettingsInConfig) break;
            }
        }

        //Apply layerSettings in config to layer-options, w/o overwriting existing values
        if (layerSettingsInConfig) {
            OpenLayers.Util.applyDefaults(options, layerSettingsInConfig);
            OpenLayers.Util.applyDefaults(options.dataSource, layerSettingsInConfig.dataSource);
            delete options.childLayers;
        }

        //Create layer from options
        var layer = new mxn.Layer(options);

        //If parent layer exists, add layer to its parent-layer
        if (parentLayerName && this.layers[parentLayerName]) {
            this.layers[parentLayerName].addChildLayer(layer, layer.name);
        }

        //Add layer to map. Also load data and activate zoom-pan events
        this.addLayers([layer]);

        return layer.proprietary_layer;
    };

    Mapstraction.prototype.addLayers = function(layers) {
        if (!layers || layers.length == 0) return;
        if (!(layers instanceof Array)) layers = [layers];
        switch (this.api) {
            case 'openlayers':
                for (var idx = 0; idx < layers.length; idx++) {
                    try {
                        var layer = layers[idx];

                        //Create child layers if any
                        var olChildLayersToAdd = [];
                        for (var childLayerName in layer.childLayers) {
                            var childLayer = layer.childLayers[childLayerName];
                            childLayer.isFirstLoad = true;
                            var childOlLayer = childLayer.toOpenLayers();
                            if (childOlLayer.isBaseLayer == true) {
                                this.maps[this.api].allOverlays = false;
                                this.maps[this.api].fractionalZoom = false;
                            }
                            if (childOlLayer.isBaseLayer == false && this.maps[this.api].baseLayer == null) {
                                this.maps[this.api].allOverlays = true;
                                this.maps[this.api].fractionalZoom = true;
                            }
                            olChildLayersToAdd.push(childOlLayer);
                            childLayer = null;
                            childOlLayer = null;
                        }

                        //Create main layer
                        layer.isFirstLoad = true;
                        var olLayer = layer.toOpenLayers();
                        if (olLayer.isBaseLayer == true) {
                            this.maps[this.api].allOverlays = false;
                            this.maps[this.api].fractionalZoom = false;
                        }
                        if (olLayer.isBaseLayer == false && this.maps[this.api].baseLayer == null) {
                            this.maps[this.api].allOverlays = true;
                            this.maps[this.api].fractionalZoom = true;
                        }
                        if (olLayer.isBaseLayer == true && this.maps[this.api].baseLayer != null && !this.maps[this.api].baseLayer.isBaseLayer) {
                            var overlayAsPrevBaseLayer = this.maps[this.api].baseLayer;
                            //Check if overlay is acting as base-layer
                            var isOverlayVisible = overlayAsPrevBaseLayer.visibility;
                        }
                        this.maps[this.api].addLayer(olLayer);

                        //Add child-layers to map
                        this.maps[this.api].addLayers(olChildLayersToAdd);

                        //Set new baselayer
                        if (overlayAsPrevBaseLayer) {
                            this.maps[this.api].setBaseLayer(olLayer);
                            if (isOverlayVisible) overlayAsPrevBaseLayer.setVisibility(true);
                        }
                        olLayer = null;
                        olChildLayersToAdd = null;

                        //Store in mapstraction
                        this.layers[layer.name] = layer;
                        for (var childLayerName in layer.childLayers) {
                            var childLayer = layer.childLayers[childLayerName];
                            this.layers[childLayer.name] = childLayer;
                        }

                        try { if (!layer.dataSource && layer.onLoadEnd) layer.onLoadEnd(); } catch (e) { }
                    }
                    catch (e) {
                        try { if (layers[idx].onLoadError) layers[idx].onLoadError(e.message, 101); } catch (e) { }
                        olLayer = null;
                    }
                    layer = null;
                }
                break;
            case 'micello':
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.addLayers');
                }
        }
    };

    Mapstraction.prototype.addIndoorMapOverlay = Mapstraction.prototype.addIndoorMap = function(indoorMap) {
        try {
            if (!indoorMap || (!indoorMap instanceof mxn.IndoorMapOverlay) || !indoorMap.buildingLayer) return;
            this.addLayers(indoorMap.buildingLayer);
        }
        catch (e) {
            try { if (indoorMap && indoorMap.onLoadError) indoorMap.onLoadError(e.message, 101); } catch (e) { }
        }
    };

    Mapstraction.prototype.removeIndoorMapOverlay = Mapstraction.prototype.removeIndoorMap = function(indoorMap) {
        if (!indoorMap || (!indoorMap instanceof mxn.IndoorMapOverlay)) return;
        var buildingLayer = indoorMap.buildingLayer;
        this.removeLayers(buildingLayer);
        buildingLayer = null;
    };

    Mapstraction.prototype.reorderLayers = function(layerOrder) {
        switch (this.api) {
            case 'openlayers':
                for (var layerName in layerOrder) {
                    var layers = this.maps[this.api].getLayersByName(layerName);
                    for (var idx = 0; idx < layers.length; idx++) {
                        this.maps[this.api].setLayerIndex(layers[idx], layerOrder[layerName]);
                    }
                    layers = null;
                }
                break;
            case 'micello':

                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.reorderLayers');
                }
        }
    };

    Mapstraction.prototype.redrawLayer = function(layerName) {
        switch (this.api) {
            case 'openlayers':
                var layer = this.maps[this.api].getLayersByName(layerName)[0];
                if (layer) {
                    layer.redraw();
                    layer = null;
                }
                break;
            case 'micello':
                var mapCanvas = this.maps[this.api].mapCanvas;
                if (mapCanvas.data.community) {
                    mapCanvas.data.loadCommunity(mapCanvas.data.community.cid, mapCanvas.data.currentDrawing.id, mapCanvas.data.currentLevel.id);
                }
                mapCanvas = null;
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.redrawLayer');
                }
        }
    };

    Mapstraction.prototype.showLayer = function(layerName) {
        switch (this.api) {
            case 'openlayers':
                var layer = this.maps[this.api].getLayersByName(layerName)[0];
                if (layer) {
                    layer.setVisibility(true);
                    layer = null;
                }
                break;
            case 'micello':
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.showLayer');
                }
        }
    };

    Mapstraction.prototype.hideLayer = function(layerName) {
        switch (this.api) {
            case 'openlayers':
                var layer = this.maps[this.api].getLayersByName(layerName)[0];
                if (layer) {
                    layer.setVisibility(false);
                    layer = null;
                }
                break;
            case 'micello':
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.hideLayer');
                }
        }
    };

    Mapstraction.prototype.getLayer = function(layerName) {
        if (!layerName || layerName.length == 0) return null;
        var layer = this.layers[layerName];
        if (layer) return layer;
        return null;
    }

    Mapstraction.prototype.zoomToLayer = function(layerNames) {
        switch (this.api) {
            case 'openlayers':
                var getDataExtent = function(layer) {
                    if (layer.CLASS_NAME == 'OpenLayers.Layer.Vector') {
                        var maxExtent = null;
                        var features = layer.features;
                        if (features && (features.length > 0)) {
                            var geometry = null;
                            for (var idx = 0; idx < features.length; idx++) {
                                geometry = features[idx].data['__originalgeom'] || features[idx].geometry;
                                if (geometry) {
                                    if (maxExtent === null) {
                                        maxExtent = new OpenLayers.Bounds();
                                    }
                                    maxExtent.extend(geometry.getBounds());
                                }
                            }
                        }
                        return maxExtent;
                    }
                    else {
                        return layer.getDataExtent();
                    }
                };
                var bounds = null;
                if (!(layerNames instanceof Array)) layerNames = layerNames.split(',');
                for (var idx = 0; idx < layerNames.length; idx++) {
                    var layers = this.maps[this.api].getLayersByName(layerNames[idx]);
                    if (layers) {
                        for (var jdx = 0; jdx < layers.length; jdx++) {
                            if (layers[jdx] && (layers[jdx].CLASS_NAME == 'OpenLayers.Layer.Vector' || layers[jdx].CLASS_NAME == 'OpenLayers.Layer.Markers')) {
                                if (bounds == null) {
                                    bounds = getDataExtent(layers[jdx]);
                                }
                                else {
                                    bounds.extend(getDataExtent(layers[jdx]));
                                }
                            }
                        }
                    }
                }

                if (bounds != null) {
                    this.maps[this.api].zoomToExtent(bounds);
                }
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.zoomToLayer');
                }
        }
    };

    Mapstraction.prototype.addHistoryLayer = function(mapName, layerName, userID, startTime, endTime, minSpeed, maxSpeed, zoomToLayer, showDirection, hidePoints, onError) {
        var mapstr = this;
        if (userID == '')
            return;
        if (startTime != '' && endTime == '')
            return;
        if (endTime != '' && startTime == '')
            return;
        if (minSpeed != '' && maxSpeed == '')
            return;
        if (maxSpeed != '' && minSpeed == '')
            return;

        var whereClause = "";
        if (userID != '') {
            whereClause += "user_id='" + userID + "'";
        }
        if (startTime != null && endTime != null && startTime != '' && endTime != '') {
            whereClause += " and timestamp between '" + startTime + "' and '" + endTime + "'";
        }
        if (minSpeed != null && maxSpeed != null && minSpeed != '' && maxSpeed != '') {
            whereClause += " and avgspeed between '" + minSpeed + "' and '" + maxSpeed + "'";
        }
        this.removeAllOpenInfoWindow();

        var historyOptions = {
            layerNames: layerName,
            isTransparent: true,
            format: 'image/png',
            isBaseLayer: true,
            isVisible: true,
            whereClauses: whereClause,
            showDirection: showDirection,
            hidePoints: hidePoints,
            isSingleTile: true
        };

        var historyLayer;
        var historyLayers = this.maps[this.api].getLayersByName(layerName);
        for (var idx = 0; idx < historyLayers.length; idx++) {
            if (historyLayers[idx].CLASS_NAME == 'OpenLayers.Layer.WMS') {
                historyLayer = historyLayers[idx];
            }
        }
        if (historyLayer) historyLayer.getURL = function(bounds) { };

        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
                if (zoomToLayer == true) {
                    this.getLayerBounds(mapName, layerName, whereClause, null, null,
                                    function(bounds) {
                                        if (bounds != null && bounds.IsEmpty == false) {
                                            var addHistoryLayer = function(evt) {
                                                mapstr.removeLayer(layerName);
                                                mapstr.addLayer('WMS', layerName, mapName, historyOptions);
                                                mapstr.maps[mapstr.api].events.unregister("zoomend", mapstr, addHistoryLayer);
                                            }
                                            mapstr.maps[mapstr.api].events.register("zoomend", mapstr, addHistoryLayer);
                                            var historyExtent = new OpenLayers.Bounds(bounds.XMin, bounds.YMin, bounds.XMax, bounds.YMax);
                                            historyExtent.transform(new OpenLayers.Projection(mapstractionConfig.mapOptions.dbProjection), new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection));
                                            var center = historyExtent.getCenterLonLat();
                                            mapstr.maps[mapstr.api].setCenter(center, mapstr.maps[mapstr.api].getZoomForExtent(historyExtent), undefined, true);
                                        }
                                        else {
                                            mapstr.removeLayer(layerName);
                                            mapstr.addLayer('WMS', layerName, mapName, historyOptions);
                                        }
                                    },
                                    function(errorDesc, errorCode) {
                                        try { onError(errorDesc, errorCode); } catch (e) { }
                                        mapstr.removeLayer(layerName);
                                        mapstr.addLayer('WMS', layerName, mapName, historyOptions);
                                    }
                           );
                }
                else {
                    this.removeLayer(layerName);
                    this.addLayer('WMS', layerName, mapName, historyOptions);
                }

                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.addDynamicLayer');
                }
        }
    };

    Mapstraction.prototype.pointInPoly = function(polygonGeom, pointGeom) {
        if (typeof polygonGeom == 'string') {
            polygonGeom = new OpenLayers.Geometry.fromWKT(polygonGeom);
        }
        if (typeof pointGeom == 'string') {
            pointGeom = new OpenLayers.Geometry.fromWKT(pointGeom);
        }
        return polygonGeom.intersects(pointGeom);
    };

    Mapstraction.prototype.lonLatInBounds = function(lon, lat) {
        var pointToCheck = new OpenLayers.Geometry.Point(lon, lat);
        pointToCheck.transform(new OpenLayers.Projection(mapstractionConfig.mapOptions.dbProjection), new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection));
        var bounds = this.maps[this.api].calculateBounds();
        if (bounds == null) return false;
        var boundsPoly = this.maps[this.api].calculateBounds().toGeometry();
        return pointToCheck.intersects(boundsPoly);
    };

    Mapstraction.prototype.zoomToLocation = function(latLonPoint) {
        if (!latLonPoint || !latLonPoint instanceof mxn.LatLonPoint) return;
        var geometry = 'POINT (' + latLonPoint.lon + ' ' + latLonPoint.lat + ')';
        this.zoomToGeometry(geometry);
    };


    Mapstraction.prototype.zoomToGeometry = function(wktGeometry) {
        if (!wktGeometry || wktGeometry.trim().length == 0) return;
        var options = { 'internalProjection':
                new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection),
            'externalProjection': new OpenLayers.Projection(mapstractionConfig.mapOptions.displayProjection)
        };
        var wktformat = new OpenLayers.Format.WKT(options);
        if (wktGeometry.indexOf('MULTIPOINT') == 0) {
            wktGeometry = wktGeometry.replace('MULTIPOINT', 'POINT').replace('((', '(').replace('))', ')');
        }
        var olFeature = wktformat.read(wktGeometry);
        if (olFeature) {
            var olBounds = olFeature.geometry.getBounds();
            this.maps[this.api].zoomToExtent(olBounds);
        }
    };

    Mapstraction.prototype.zoomToFeature = function(feature) {
        this.setBounds(feature.getBounds());
    };

    Mapstraction.prototype.getLatLonFromPixel = function(x, y) {
        switch (this.api) {
            case 'openlayers':
                x = x - this.maps[this.api].getViewport().offsetLeft;
                y = y - this.maps[this.api].getViewport().offsetTop;
                var lonlat = this.maps[this.api].getLonLatFromPixel(new OpenLayers.Pixel(x, y));
                lonlat.transform(new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection), new OpenLayers.Projection(mapstractionConfig.mapOptions.displayProjection));
                return new LatLonPoint(lonlat.lat, lonlat.lon);
                break;
            case 'micello':
                x = x - this.maps[this.api].view.mapElement.offsetLeft - this.maps[this.api].view.mapElement.parentNode.parentNode.parentNode.offsetLeft;
                y = y - this.maps[this.api].view.mapElement.offsetTop - this.maps[this.api].view.mapElement.parentNode.parentNode.parentNode.offsetTop;
                var mx = this.maps[this.api].view.canvasToMapX(x, y);
                var my = this.maps[this.api].view.canvasToMapY(x, y);
                var latLon = this.maps[this.api].mxyToLatLon(mx, my);
                return new LatLonPoint(latLon[0], latLon[1]);
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.getLatLonFromPixel');
                }
        }
    };

    Mapstraction.prototype.getPixelFromLatLon = function(latLonPoint) {
        switch (this.api) {
            case 'openlayers':
                var olLonLat = latLonPoint.toOpenLayers();
                var olPixel = this.maps[this.api].getPixelFromLonLat(olLonLat);
                olPixel.x = olPixel.x + this.maps[this.api].getViewport().offsetLeft;
                olPixel.y = olPixel.y + this.maps[this.api].getViewport().offsetTop;
                return [olPixel.x, olPixel.y];
                break;
            case 'micello':
                var mxy = this.maps[this.api].latLonToMxy(latLonPoint.lat, latLonPoint.lon);
                var mx = mxy[0]; var my = mxy[1];
                var x = this.maps[this.api].view.mapToCanvasX(mx, my) + this.maps[this.api].view.mapElement.offsetLeft + this.maps[this.api].view.mapElement.parentNode.parentNode.parentNode.offsetLeft;
                var y = this.maps[this.api].view.mapToCanvasY(mx, my) + this.maps[this.api].view.mapElement.offsetTop + this.maps[this.api].view.mapElement.parentNode.parentNode.parentNode.offsetTop;
                return [x, y];
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.getPixelFromLatLon');
                }
        }
    };

    Mapstraction.prototype.addMapEventsHandler = function(mapEventsHandler) {
        mapEventsHandler.api = this.api;
        mapEventsHandler.isActive = true;
        switch (this.api) {
            case 'openlayers':
                mapEventsHandler.configureOpenLayersMapEvents(this.maps[this.api]);
                break;
            case 'micello':
                mapEventsHandler.configureMicelloMapClick(this.maps[this.api]);
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.addMapEventsHandler');
                }
        }
    };

    Mapstraction.prototype.removeMapEventsHandler = function(mapEventsHandler) {
        mapEventsHandler.isActive = false;
    };

    Mapstraction.prototype.getHistoryLayerInfo = function(lon, lat, mapName, layerName, userID, startTime, endTime, minSpeed, maxSpeed, onSuccess, onError) {
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
                if (userID == '')
                    return;
                if (startTime != '' && endTime == '')
                    return;
                if (endTime != '' && startTime == '')
                    return;
                if (minSpeed != '' && maxSpeed == '')
                    return;
                if (maxSpeed != '' && minSpeed == '')
                    return;

                //Create whereclause
                var whereClause = '';
                if (userID != '') {
                    whereClause = "user_id='" + userID + "'";
                }
                if (startTime != '' && endTime != '') {
                    whereClause += " and timestamp between '" + startTime + "' and '" + endTime + "'";
                }
                if (minSpeed != '' && maxSpeed != '') {
                    whereClause += " and avgspeed between '" + minSpeed + "' and '" + maxSpeed + "'";
                }

                //Get  buffer
                var historyLayer;
                var historyLayers = this.maps[this.api].getLayersByName(layerName);
                for (var idx = 0; idx < historyLayers.length; idx++) {
                    if (historyLayers[idx].CLASS_NAME == 'OpenLayers.Layer.WMS') {
                        historyLayer = historyLayers[idx];
                    }
                }
                if (historyLayer == undefined) return;
                var mapBounds = historyLayer.getExtent();
                var imageSize = historyLayer.getImageSize();
                var radiusInMeters = (3 * mapBounds.getWidth()) / (imageSize.w);
                historyLayer = null;
                //Query layer at given position.
                var pointGeom = "POINT (" + lon + " " + lat + ")";
                this.getLayerData(mapName, layerName, "location,timestamp,avgspeed", whereClause, pintGeom, radiusInMeters, "timestamp asc", 10, null,
                     function(info) {
                         info = info[layerName];
                         onSuccess(info, lon, lat);
                     },
                     onError
                );
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.getHistoryLayerInfo');
                }
        }
    };

    Mapstraction.prototype.addPopup = function(popup) {
        if (!popup.location || !(popup.location instanceof mxn.LatLonPoint)) return;
        if (popup.htmlContent == null || popup.htmlContent == '') {
            popup.htmlContent = ' ';
        }
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
                var olPopup = popup.toOpenLayers();
                this.maps[this.api].addPopup(olPopup);
                break;
            case 'micello':
                var mapData = this.maps[this.api];
                var mxy = mapData.latLonToMxy(popup.location.lat, popup.location.lon);
                var markerOverlay = { "mx": mxy[0], "my": mxy[1], "lid": mapData.getCurrentLevel().id,
                    "mt": micello.maps.markertype.NAMED, "mr": "PinMarker"
                };
                mapData.addMarkerOverlay(markerOverlay);
                mapData.mapControl.showInfoWindow(markerOverlay, popup.htmlContent);
                mapData.removeMarkerOverlay(markerOverlay.aid);

                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.addPopup');
                }
        }
    };

    Mapstraction.prototype.removePopup = function(popup) {
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
                if (popup.proprietary_popup) {
                    this.maps[this.api].removePopup(popup.proprietary_popup);
                }
                break;
            case 'micello':


                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.addPopup');
                }
        }
    };

    Mapstraction.prototype.removeAllPopups = function() {
        var mapObj = this.maps[this.api];
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
                while (mapObj.popups.length > 0) {
                    mapObj.removePopup(mapObj.popups[0]);
                }
                break;
            case 'micello':
                mapObj.mapControl.hideInfoWindow();
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.removeAllPopups');
                }
        }
        mapObj = null;
    };


    Mapstraction.prototype.getPoiCategories = function(name, mapName, onSuccess, onError) {
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
            case 'micello':
                var params =
                {
                    "Name": name,
                    "MapName": mapName
                }
                var mapServerRequest = new mxn.MapServerRequest({ operationName: 'GetPoiCategories', params: params, onSuccess: onSuccess, onError: onError });
                mapServerRequest.send();
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.getPoiCategories');
                }
        }
    };

    Mapstraction.prototype.getPoiCategoryByIds = function(ids, mapName, onSuccess, onError) {
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
            case 'micello':
                if (ids == undefined || ids == null || ids == "") ids = [];
                if (!(ids instanceof Array)) ids = [ids];
                if (ids.length == 0) {
                    if (onError != undefined && onError != null) {
                        onError('POI Category IDs are mandatory', 107);
                        return;
                    }
                }
                var params =
                {
                    "IDs": ids,
                    "MapName": mapName
                }
                var mapServerRequest = new mxn.MapServerRequest({ operationName: 'GetPoiCategories', params: params, onSuccess: onSuccess, onError: onError });
                mapServerRequest.send();
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.getPoiCategoryByIds');
                }
        }
    };

    Mapstraction.prototype.getPoi = function(location, radiusInMetres, name, categories, mapName, onSuccess, onError) {
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
            case 'micello':
                if (categories == undefined || categories == null || categories == "") categories = [];
                if (!(categories instanceof Array)) categories = [categories];
                if (location == null || location == undefined || location.length == 0) {
                    if (onError != undefined && onError != null) {
                        onError('POI location is mandatory', 107);
                        return;
                    }
                }
                var params =
                {
                    "MapName": mapName,
                    "Name": name,
                    "Categories": categories,
                    "Location": location,
                    "Radius": radiusInMetres
                }
                var mapServerRequest = new mxn.MapServerRequest({ operationName: 'GetPoi', params: params, onSuccess: onSuccess, onError: onError });
                mapServerRequest.send();
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.getPOI');
                }
        }
    };

    Mapstraction.prototype.getPoiByIDs = function(ids, mapName, onSuccess, onError) {
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
            case 'micello':
                if (ids == undefined || ids == null || ids == "") ids = [];
                if (!(ids instanceof Array)) ids = [ids];
                if (ids.length == 0) {
                    if (onError != undefined && onError != null) {
                        onError('POI IDs are mandatory', 107);
                        return;
                    }
                }
                var params =
                {
                    "MapName": mapName,
                    "IDs": ids
                }
                var mapServerRequest = new mxn.MapServerRequest({ operationName: 'GetPoi', params: params, onSuccess: onSuccess, onError: onError });
                mapServerRequest.send();
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.getPoiByIds');
                }
        }
    };

    Mapstraction.prototype.getAddressFromLocation = function(location, radiusInMetres, mapName, onSuccess, onError) {
        if (!location) {
            if (onError != undefined && onError != null) {
                onError('Location not given', 107);
                return;
            }
        }
        if (this.api == 'google' || mapName == 'google') {
            var gLatLng = new google.maps.LatLng(location.lat, location.lon);
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'latLng': gLatLng }, function(googleResults, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var locationResults = [];
                    for (var idx = 0; idx < googleResults.length; idx++) {
                        var location = googleResults[idx].geometry.location;
                        locationResults.push({ Location: new LatLonPoint(location.lat(), location.lng()), Address: googleResults[idx].formatted_address });
                    }

                    if (onSuccess) onSuccess(locationResults);
                } else {
                    if (onError) try { onError("Address not found. " + status, 105); } catch (e) { }
                }
            });
        }
        else if (this.api == 'openlayers') {
            if (location instanceof LatLonPoint) location = 'POINT (' + location.lon + ' ' + location.lat + ')';
            var params =
            {
                "MapName": mapName,
                "Location": location,
                "Radius": radiusInMetres
            }
            var mapServerRequest = new mxn.MapServerRequest({ operationName: 'GetAddressFromLocation', params: params, onSuccess: onSuccess, onError: onError });
            mapServerRequest.send();
        }
        else {
            if (this.debug) {
                alert(this.api + ' not supported by Mapstraction.getAddressFromLocation');
            }
        }
    };

    Mapstraction.prototype.getLayerData = function(mapName, layerNames, queryFilters, outputFields, sortByFields, geomFilters, geomRadius, maximumRows, outputFormat, onSuccess, onError) {
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
            case 'micello':
                if (!layerNames) layerNames = [];
                if (!(layerNames instanceof Array)) layerNames = [layerNames];
                if (layerNames.length == 0) {
                    if (onError != undefined && onError != null) {
                        onError('Layernames are mandatory', 107);
                        return;
                    }
                }
                if (!queryFilters) queryFilters = [];
                if (!(queryFilters instanceof Array)) queryFilters = [queryFilters];
                if (!outputFields) outputFields = [];
                if (!(outputFields instanceof Array)) outputFields = [outputFields];
                if (!sortByFields) sortByFields = [];
                if (!(sortByFields instanceof Array)) sortByFields = [sortByFields];
                if (!geomFilters) geomFilters = [];
                if (!(geomFilters instanceof Array)) geomFilters = [geomFilters];
                if (!geomRadius || geomRadius == '') geomRadius = [];
                if (!(geomRadius instanceof Array)) geomRadius = [geomRadius];
                if (!maximumRows || maximumRows == '') maximumRows = undefined;
                if (!outputFormat || outputFormat == '' || outputFormat.toUpperCase() == 'JSON') outputFormat = '0';
                if (outputFormat.toUpperCase() == 'GEOJSON') outputFormat = '1';
                if (outputFormat.toUpperCase() == 'XML') outputFormat = '2';
                var params = {
                    "MapName": mapName,
                    "LayerNames": layerNames,
                    "QueryFilters": queryFilters,
                    "OutputFields": outputFields,
                    "SortByFields": sortByFields,
                    "GeomFilters": geomFilters,
                    "GeomRadius": geomRadius,
                    "MaximumRows": maximumRows
                };

                var mapServerRequest = new mxn.MapServerRequest({ operationName: 'GetLayerData', params: params, onSuccess: onSuccess, onError: onError });
                mapServerRequest.send();
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.getLayerData');
                }
        }
    };

    Mapstraction.prototype.getLayerBounds = function(mapName, layerNames, queryFilters, geomFilters, geomRadius, onSuccess, onError) {
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
            case 'micello':
                if (!layerNames) layerNames = [];
                if (!(layerNames instanceof Array)) layerNames = [layerNames];
                if (layerNames.length == 0) {
                    if (onError != undefined && onError != null) {
                        onError('Layernames are mandatory', 107);
                        return;
                    }
                }
                if (!queryFilters) queryFilters = [];
                if (!(queryFilters instanceof Array)) queryFilters = [queryFilters];
                if (!geomFilters) geomFilters = [];
                if (!(geomFilters instanceof Array)) geomFilters = [geomFilters];
                if (!geomRadius || geomRadius == '') geomRadius = [];
                if (!(geomRadius instanceof Array)) geomRadius = [geomRadius];
                var params = {
                    "MapName": mapName,
                    "LayerNames": layerNames,
                    "QueryFilters": queryFilters,
                    "GeomFilters": geomFilters,
                    "GeomRadius": geomRadius
                };
                var mapServerRequest = new mxn.MapServerRequest({ operationName: 'GetLayerBounds', params: params, onSuccess: onSuccess, onError: onError });
                mapServerRequest.send();
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.getLayerBounds');
                }
        }
    };


    Mapstraction.prototype.addLayerData = function(mapName, layerName, data, onSuccess, onError) {
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
            case 'micello':
                if (!(data instanceof Array)) data = [data];
                if (!layerName || layerName == '') {
                    if (onError) {
                        onError('LayerName is mandatory', 107);
                        return;
                    }
                }
                if (data.length == 0) {
                    if (onError) {
                        onError('Data is mandatory', 107);
                        return;
                    }
                }
                var params =
                {
                    "MapName": mapName,
                    "LayerName": layerName,
                    "Data": data
                }
                var mapServerRequest = new mxn.MapServerRequest({ operationName: 'AddLayerData', params: params, method: 'POST', onSuccess: onSuccess, onError: onError });
                mapServerRequest.send();
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.addLayerData');
                }
        }
    };

    Mapstraction.prototype.addPoi = function(poiData, mapName, onSuccess, onError) {
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
            case 'micello':
                if (!(poiData instanceof Array)) poiData = [poiData];
                if (poiData.length == 0) {
                    if (onError) {
                        onError('POI data is mandatory', 107);
                        return;
                    }
                }
                var params =
                {
                    "MapName": mapName,
                    "PoiData": poiData
                }
                var mapServerRequest = new mxn.MapServerRequest({ operationName: 'AddPoi', method: 'POST', params: params, onSuccess: onSuccess, onError: onError });
                mapServerRequest.send();
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.addPois');
                }
        }
    };

    Mapstraction.prototype.addPoiCategories = function(categoryData, mapName, onSuccess, onError) {
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
            case 'micello':
                if (!(categoryData instanceof Array)) categoryData = [categoryData];
                var params =
                {
                    "MapName": mapName,
                    "CategoryData": categoryData
                }
                var mapServerRequest = new mxn.MapServerRequest({ operationName: 'AddPoiCategory', method: 'POST', params: params, onSuccess: onSuccess, onError: onError });
                mapServerRequest.send();
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.addPoiCategory');
                }
        }
    };

    Mapstraction.prototype.updateLayerData = function(mapName, layerName, data, onSuccess, onError) {
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
                var params =
                {
                    "MapName": mapName,
                    "LayerName": layerName,
                    "Data": data
                }
                if (!(params.Data instanceof Array)) params.Data = [params.Data];

                var mapServerRequest = new mxn.MapServerRequest({ operationName: 'UpdateLayerData', method: 'POST', params: params, onSuccess: onSuccess, onError: onError });
                mapServerRequest.send();
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.updateLayerData');
                }
        }
    };

    Mapstraction.prototype.updatePoi = function(poiData, mapName, onSuccess, onError) {
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
                if (!(poiData instanceof Array)) poiData = [poiData];
                var params =
                {
                    "MapName": mapName,
                    "PoiData": poiData
                }

                var mapServerRequest = new mxn.MapServerRequest({ operationName: 'UpdatePoi', method: 'POST', params: params, onSuccess: onSuccess, onError: onError });
                mapServerRequest.send();
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.updatePois');
                }
        }
    };

    Mapstraction.prototype.updatePoiCategories = function(categoryData, mapName, onSuccess, onError) {
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
                if (!(categoryData instanceof Array)) categoryData = [categoryData];
                var params =
                {
                    "MapName": mapName,
                    "CategoryData": categoryData
                }
                var mapServerRequest = new mxn.MapServerRequest({ operationName: 'UpdatePoiCategory', method: 'POST', params: params, onSuccess: onSuccess, onError: onError });
                mapServerRequest.send();
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.updatePoiCategories');
                }
        }
    };

    Mapstraction.prototype.deleteLayerData = function(mapName, layerName, ids, onSuccess, onError) {
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
                var params = {
                    "MapName": mapName,
                    "LayerName": layerName,
                    "IDs": ids
                };
                if (!(params.IDs instanceof Array)) params.IDs = [params.IDs];
                var mapServerRequest = new mxn.MapServerRequest({ operationName: 'DeleteLayerData', method: 'POST', params: params, onSuccess: onSuccess, onError: onError });
                mapServerRequest.send();
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.deleteLayerData');
                }
        }
    };

    Mapstraction.prototype.deletePoi = function(ids, mapName, onSuccess, onError) {
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
                var params = {
                    "MapName": mapName,
                    "IDs": ids
                };
                if (!(params.IDs instanceof Array)) params.IDs = [params.IDs];
                var mapServerRequest = new mxn.MapServerRequest({ operationName: 'DeletePoi', method: 'POST', params: params, onSuccess: onSuccess, onError: onError });
                mapServerRequest.send();

                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.deletePois');
                }
        }
    };

    Mapstraction.prototype.deletePoiCategories = function(ids, mapName, onSuccess, onError) {
        switch (this.api) {
            case 'google':
            case 'openstreetmap':
                break;
            case 'openlayers':
                var params = {
                    "MapName": mapName,
                    "IDs": ids
                };
                if (!(params.IDs instanceof Array)) params.IDs = [params.IDs];
                var mapServerRequest = new mxn.MapServerRequest({ operationName: 'DeletePoiCategory', method: 'POST', params: params, onSuccess: onSuccess, onError: onError });
                mapServerRequest.send();
                break;
            default:
                if (this.debug) {
                    alert(this.api + ' not supported by Mapstraction.deletePoiCategories');
                }
        }
    };

    Mapstraction.prototype.getNamedRoute = function(routeNo, returnSteps, returnStoppages, sliceLocation, mapName, onSuccess, onError) {
        var params = {
            "RouteNo": routeNo,
            "ReturnStoppages": returnStoppages,
            "ReturnSteps": returnSteps,
            "MapName": mapName
        }

        if (sliceLocation != undefined && sliceLocation != null) {
            params.SliceLocation = sliceLocation;
        }

        var mapServerRequest = new mxn.MapServerRequest({ operationName: 'GetNamedRoute', params: params, onSuccess: onSuccess, onError: onError });
        mapServerRequest.send()
    };

    Mapstraction.prototype.getRoute = function(viaPointArray, options, mapName, onSuccess, onError) {
        try {
            if (this.api == 'micello') mapName = 'micello';
            if (this.api == 'google') mapName = 'google';

            //Convert via-points to lat-lon format, in case they are not.
            for (var idx = 0; idx < viaPointArray.length; idx++) {
                if (!(viaPointArray[idx] instanceof LatLonPoint)) {
                    if (!(viaPointArray[idx] instanceof Array)) viaPointArray[idx] = viaPointArray[idx].replace('POINT', '').replace('(', '').replace(')', '').trim(), split(' ');
                    viaPointArray[idx] = new LatLonPoint(point[1], point[0]);
                }
            }

            switch (mapName) {
                case 'google':
                    //Routing using Google maps API
                    var directionsService = new google.maps.DirectionsService();
                    var request = {};
                    if (!options.travelMode) options.travelMode = 'DRIVING';
                    if (options.travelMode) request.travelMode = google.maps.DirectionsTravelMode[options.travelMode.toUpperCase()];
                    if (options.provideRouteAlternatives) request.provideRouteAlternatives = options.provideRouteAlternatives;
                    if (options.avoidHighways) request.avoidHighways = options.avoidHighways;
                    if (options.avoidTolls) request.avoidTolls = options.avoidTolls;

                    for (var idx = 0; idx < viaPointArray.length; idx++) {
                        var latLng = viaPointArray[idx].toGoogle();
                        if (idx == 0) {
                            request.origin = latLng;
                        }
                        else if (idx == viaPointArray.length - 1) {
                            request.destination = latLng;
                        }
                        else {
                            if (idx == 1) {
                                request.waypoints = [];
                                if (options.optimizeWaypoints) request.optimizeWaypoints = options.optimizeWaypoints;
                            }
                            request.waypoints.push({ location: latLng }); //Via-point between origin and destination.. this is optional
                        }
                    }

                    directionsService.route(request, function(response, status) {
                        try {
                            if (status == google.maps.DirectionsStatus.OK) {
                                //Read Google result to output result in our format.
                                var outputRouteArray = [];
                                for (var r = 0; r < response.routes.length; r++) {
                                    var route = response.routes[r];
                                    var routeDistance = 0;
                                    var routeDuration = 0;
                                    var outputLegArray = [];
                                    for (var k = 0; k < route.legs.length; k++) {
                                        var leg = route.legs[k];
                                        var outputStepArray = [];
                                        for (var s = 0; s < leg.steps.length; s++) {
                                            var step = leg.steps[s];
                                            var latlngArray = step.lat_lngs;
                                            var polyline = new google.maps.Polyline({
                                                path: latlngArray
                                            });

                                            var coordsArray = polyline.getPath().getArray();
                                            var stepWkt = "LINESTRING (";
                                            for (var m = 0; m < coordsArray.length; m++) {
                                                stepWkt += coordsArray[m].lng() + " " + coordsArray[m].lat();
                                                if (m != coordsArray.length - 1) stepWkt += ",";
                                            }
                                            stepWkt += ")";

                                            var tmp = document.createElement("DIV");
                                            tmp.innerHTML = step.instructions;
                                            var instructions = tmp.textContent || tmp.innerText;
                                            tmp = null;

                                            var outputStep = {
                                                Geom: stepWkt,
                                                Distance: step.distance.value,
                                                Duration: step.duration.value,
                                                Instructions: instructions
                                            };
                                            outputStepArray.push(outputStep);
                                        }
                                        var outputLeg = {
                                            Steps: outputStepArray,
                                            Distance: leg.distance.value,
                                            Duration: leg.duration.value,
                                            StartAddress: leg.start_address,
                                            EndAddress: leg.end_address
                                        };
                                        outputLegArray.push(outputLeg);
                                        routeDistance += outputLeg.Distance;
                                        routeDuration += outputLeg.Duration;
                                    }


                                    var overviewCoordsArray = route.overview_path;
                                    var overviewGeomWkt = "LINESTRING (";
                                    for (var m = 0; m < overviewCoordsArray.length; m++) {
                                        overviewGeomWkt += overviewCoordsArray[m].lng() + " " + overviewCoordsArray[m].lat();
                                        if (m != overviewCoordsArray.length - 1) overviewGeomWkt += ",";
                                    }
                                    overviewGeomWkt += ")";

                                    var outputRoute =
                                    {
                                        Geom: overviewGeomWkt,
                                        Legs: outputLegArray,
                                        Distance: routeDistance,
                                        Duration: routeDuration,
                                        Summary: route.summary
                                    };

                                    outputRouteArray.push(outputRoute);
                                }

                                var output = { Routes: outputRouteArray };
                                if (onSuccess != undefined && onSuccess != null) { onSuccess(output); }
                            }
                            else {
                                if (onError != undefined && onError != null) { onError("Unable to get route from Google", 101); }
                            }
                        }
                        catch (e) {
                            if (onError != undefined && onError != null) { onError(e.message, e.number); }
                        }
                    });
                    break;
                case 'micello':
                    var tempLayers = [];
                    try {
                        var mapstr = this;
                        var routeLegs = [];

                        var startRoute = function() {
                            try {
                                var mapData = mapstr.maps['micello'];
                                if (viaPointArray[routeLegs.length] && viaPointArray[routeLegs.length + 1]) {
                                    var fromPoint = viaPointArray[routeLegs.length].toArray();
                                    fromPoint = mapData.latLonToMxy(fromPoint[0], fromPoint[1]);
                                    mapData.mapControl.requestNavFrom([{ "t": "mc", "mx": fromPoint[0], "my": fromPoint[1], "lid": mapData.getCurrentLevel().id}]);
                                    endRoute();
                                }
                                else {
                                    finishRoute();
                                }
                            }
                            catch (e) {
                                onFinish(null, e.message);
                            }
                        }


                        window['afterRouteCreation'] = function() {
                            try {
                                var mapData = mapstr.maps['micello'];
                                for (var idx = -1; idx > -100; idx--) {
                                    if (mapData.geomMap[idx] && mapData.geomMap[idx].g.anm == 'route') {
                                        var coordsArray = mapData.geomMap[idx].g.shp;
                                        var wkt = 'LINESTRING (';
                                        for (var idx = 0; idx < coordsArray.length; idx++) {
                                            if (coordsArray[idx][0] < 2) {
                                                var latLonArray = mapData.mxyToLatLon(coordsArray[idx][1], coordsArray[idx][2]);
                                                wkt += latLonArray[1] + ' ' + latLonArray[0] + ',';
                                            }
                                        }
                                        if (wkt.lastIndexOf(',') == wkt.length - 1) wkt = wkt.substr(0, wkt.length - 1); //Remove trailing comma
                                        wkt += ')';
                                        var fromPoint = viaPointArray[routeLegs.length].toArray();
                                        var fromLatLng = new LatLonPoint(fromPoint[0], fromPoint[1]);
                                        var toPoint = viaPointArray[routeLegs.length + 1].toArray();
                                        var toLatLng = new LatLonPoint(toPoint[0], toPoint[1]);
                                        var distance = fromLatLng.distance(toLatLng) * 1000;
                                        routeLegs.push({
                                            Geom: wkt,
                                            Distance: distance
                                        });
                                        mapData.mapControl.clearRoute();
                                        startRoute();
                                        return;
                                    }
                                }
                                window.setTimeout('afterRouteCreation();', 1000);
                                //onFinish(null, 'No route created');
                            }
                            catch (e) {
                                onFinish(null, e.message);
                            }
                        }

                        var endRoute = function() {
                            try {
                                var mapData = mapstr.maps['micello'];
                                if (viaPointArray[routeLegs.length + 1]) {
                                    var toPoint = viaPointArray[routeLegs.length + 1].toArray();
                                    toPoint = mapData.latLonToMxy(toPoint[0], toPoint[1]);
                                    mapData.mapControl.requestNavTo([{ "t": "mc", "mx": toPoint[0], "my": toPoint[1], "lid": mapData.getCurrentLevel().id}]);
                                    window.setTimeout('afterRouteCreation();', 3000);
                                }
                                else {
                                    finishRoute();
                                }
                            }
                            catch (e) {
                                onFinish(null, e.message);
                            }
                        }

                        var finishRoute = function() {
                            var distanceUnion = 0;
                            var wktUnion = 'MULTILINESTRING (';
                            for (var idx = 0; idx < routeLegs.length; idx++) {
                                wktUnion += routeLegs[idx].Geom.replace('LINESTRING', '');
                                if (idx < routeLegs.length - 1) wktUnion += ',';
                                distanceUnion += routeLegs[idx].Distance;
                            }
                            wktUnion += ')';
                            var route = {
                                Geom: wktUnion,
                                Distance: distanceUnion
                            }
                            onFinish({ 'Routes': [route] });
                        }

                        var onFinish = function(successResponse, errorResponse) {
                            delete window['afterRouteCreation'];
                            if (tempLayers.length > 0) {
                                mapstr.removeLayer(tempLayers[0]);
                            }
                            if (successResponse) {
                                if (onSuccess != undefined && onSuccess != null) onSuccess(successResponse);
                            }
                            else if (errorResponse) {
                                if (onError != undefined && onError != null) onError(errorResponse, 101);
                            }
                        }

                        if (this.api == 'micello') {
                            startRoute();
                        }
                        else {
                            var options = {
                                mapID: options.mapID || options.community_id,
                                levelIndex: options.levelIndex || options.floor_index,
                                micelloKey: options.micelloKey || options.micello_key,
                                onLayerLoad: startRoute,
                                isVisible: false
                            };

                            var indoorLayerName = 'Temp_Indoor_Map';
                            this.addLayer('MICELLO', indoorLayerName, '', options);
                            tempLayers.push(indoorLayerName);
                        }
                    }
                    catch (e) {
                        onFinish(null, e.message);
                    }
                    break;
                default:
                    var getRouteInput = {
                        "MapName": (!mapName || mapName == null || mapName == '') ? mapstractionConfig.mapServer.defaultMapName : mapName,
                        "routeType": (!options.routeTypes || options.routeTypes == null || options.routeTypes.toLowerCase() == 'shortest') ? 0 : 1
                    };

                    var viaPointList = [];
                    for (var idx = 0; idx < viaPointArray.length; idx++) {
                        viaPointList.push({ 'geom': 'POINT (' + viaPointArray[idx].lon + ' ' + viaPointArray[idx].lat + ')' });
                    }
                    getRouteInput.ViaPoints = viaPointList;

                    var roadTypesBitField = 0;
                    var roadTypesArray = [];
                    if (options.roadTypes && options.roadTypes != null && options.roadTypes != '') {
                        roadTypesArray = options.roadTypes.split(',');
                        for (idx = 0; idx < roadTypesArray.length; idx++) {
                            roadTypesBitField += parseInt(roadTypesArray[idx]);
                        }
                    }
                    getRouteInput.RoadTypes = roadTypesBitField;

                    var mapServerRequest = new mxn.MapServerRequest({ operationName: 'GetRoute', params: getRouteInput, onSuccess: onSuccess, onError: onError });
                    mapServerRequest.send();
                    break;

            }
        }
        catch (e) {
            if (onError != undefined && onError != null) { onError(e.message, e.number); }
        }
    }

    Mapstraction.prototype.saveNamedRoute = function(routeNo, overwriteExisting, steps, stoppages, mapName, onSuccess, onError) {
        var mapstr = this;

        if (routeNo == null || routeNo == '') {
            if (onError)
                try { onError('No route number provided.', 107); } catch (e) { }
            return;
        }

        if (!steps) steps = null;
        if (!stoppages) stoppages = null;
        if (steps == null) {
            try { onError('No route steps provided.', 107); } catch (e) { }
        }

        var params = {
            "RouteNo": routeNo,
            "OverwriteExisting": overwriteExisting,
            "Steps": steps,
            "Stoppages": stoppages,
            "MapName": (!mapName || mapName == null || mapName == '') ? mapstractionConfig.mapServer.defaultMapName : mapName
        }

        var mapServerRequest = new mxn.MapServerRequest({ operationName: 'SaveNamedRoute', method: 'POST', params: params, onSuccess: onSuccess, onError: onError });
        mapServerRequest.send();
    };

    Mapstraction.prototype.getLocationFromAddress = function(address, onSuccess, onError) {
        if (address == null || address == '') {
            if (onError) try { onError('No address provided.', 107); } catch (e) { }
            return;
        }
        var geocoder = new google.maps.Geocoder();

        geocoder.geocode({ 'address': address }, function(googleResults, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var locationResults = [];
                for (var idx = 0; idx < googleResults.length; idx++) {
                    var location = googleResults[idx].geometry.location;
                    locationResults.push({ Location: new LatLonPoint(location.lat(), location.lng()), Address: googleResults[idx].formatted_address });
                }

                if (onSuccess) onSuccess(locationResults);
            } else {
                if (onError) try { onError(address + " not found. " + status, 105); } catch (e) { }
            }
        });
    };


    //////////////////////////////
    //
    //   LatLonPoint
    //
    /////////////////////////////

    /**
    * LatLonPoint is a point containing a latitude and longitude with helper methods
    * @param {double} lat is the latitude
    * @param {double} lon is the longitude
    * @returns a new LatLonPoint
    * @type LatLonPoint
    */
    function LatLonPoint(lat, lon) {
        lat = parseFloat(lat);
        lon = parseFloat(lon);
        this.lat = lat;
        this.lon = lon;
        this.lng = lon; // lets be lon/lng agnostic
    }

    /**
    * Sets a point based on a google point
    * @param {Object} googlePoint
    */
    LatLonPoint.fromGoogle = function(googlePoint) {
        return new LatLonPoint(googlePoint.lat(), googlePoint.lng());
    };

    LatLonPoint.fromOpenLayersPixels = function(xy, map) {
        var olLonLat = map.getLonLatFromPixel(xy);
        if (olLonLat) {
            olLonLat.transform(new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection), new OpenLayers.Projection(mapstractionConfig.mapOptions.displayProjection));
            return new LatLonPoint(olLonLat.lat, olLonLat.lon);
        }
        return null;
    }

    /**
    * fromOpenLayers converts an OpenLayers point to Mapstraction LatLonPoint
    * @returns a LatLonPoint
    */
    LatLonPoint.fromOpenLayers = function(olLonLat) {
        olLonLat = olLonLat.clone();
        olLonLat.transform(new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection), new OpenLayers.Projection(mapstractionConfig.mapOptions.displayProjection));
        return new LatLonPoint(olLonLat.lat, olLonLat.lon);
    };

    /**
    * toGoogle returns a Google maps point
    * @returns a GLatLng
    */
    LatLonPoint.prototype.toGoogle = function() {
        return new google.maps.LatLng(this.lat, this.lon);
    };

    /**
    * 11/30/2009 returns an OpenLayers point
    * Does a conversion from Latitude/Longitude to projected coordinates
    * @returns a OpenLayers. LonLat
    */
    LatLonPoint.prototype.toOpenLayers = function() {
        var olLonLat = new OpenLayers.LonLat(this.lon, this.lat);
        olLonLat.transform(new OpenLayers.Projection(mapstractionConfig.mapOptions.displayProjection), new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection));
        return olLonLat;
    };

    /**
    * toString returns a string represntation of a point
    * @returns a string like '51.23, -0.123'
    * @type String
    */
    LatLonPoint.prototype.toString = function() {
        return this.lat + ', ' + this.lon;
    };

    LatLonPoint.prototype.toArray = function() {
        return [this.lat, this.lon];
    };

    /**
    * distance returns the distance in kilometers between two points
    * @param {LatLonPoint} otherPoint The other point to measure the distance from to this one
    * @returns the distance between the points in kilometers
    * @type double
    */
    LatLonPoint.prototype.getDistance = function(otherPoint) {
        // Uses Haversine formula from http://www.movable-type.co.uk
        var rads = Math.PI / 180;
        var diffLat = (this.lat - otherPoint.lat) * rads;
        var diffLon = (this.lon - otherPoint.lon) * rads;
        var a = Math.sin(diffLat / 2) * Math.sin(diffLat / 2) +
        Math.cos(this.lat * rads) * Math.cos(otherPoint.lat * rads) *
        Math.sin(diffLon / 2) * Math.sin(diffLon / 2);
        return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 6371; // Earth's mean radius in km
    };

    /**
    * equals tests if this point is the same as some other one
    * @param {LatLonPoint} otherPoint The other point to test with
    * @returns true or false
    * @type boolean
    */
    LatLonPoint.prototype.equals = function(otherPoint) {
        return this.lat == otherPoint.lat && this.lon == otherPoint.lon;
    };

    /**
    * Returns latitude conversion based on current projection
    * @returns {Float} conversion
    */
    LatLonPoint.prototype.latConv = function() {
        return this.distance(new LatLonPoint(this.lat + 0.1, this.lon)) * 10;
    };

    /**
    * Returns longitude conversion based on current projection
    * @returns {Float} conversion
    */
    LatLonPoint.prototype.lonConv = function() {
        return this.distance(new LatLonPoint(this.lat, this.lon + 0.1)) * 10;
    };

    //////////////////////////
    //
    //  ABoundingBox
    //
    //////////////////////////

    /**
    * ABoundingBox creates a new bounding box object
    * @param {double} swlat the latitude of the south-west point
    * @param {double} swlon the longitude of the south-west point
    * @param {double} nelat the latitude of the north-east point
    * @param {double} nelon the longitude of the north-east point
    * @returns a new ABoundingBox
    * @type ABoundingBox
    * @constructor
    * @classDescription ABoundingBox
    */
    function ABoundingBox(swlat, swlon, nelat, nelon) {
        //FIXME throw error if box bigger than world
        swlat = parseFloat(swlat);
        swlon = parseFloat(swlon);
        nelat = parseFloat(nelat);
        nelon = parseFloat(nelon);
        this.sw = new LatLonPoint(swlat, swlon);
        this.ne = new LatLonPoint(nelat, nelon);
    }

    ABoundingBox.fromOpenLayers = function(olBounds) {
        var olSW = new OpenLayers.LonLat(olBounds.left, olBounds.bottom);
        var sw = LatLonPoint.fromOpenLayers(olSW);
        var olNE = new OpenLayers.LonLat(olBounds.right, olBounds.top);
        var ne = LatLonPoint.fromOpenLayers(olNE);
        return new ABoundingBox(sw.lat, sw.lon, ne.lat, ne.lon);
    };

    ABoundingBox.prototype.toOpenLayers = function() {
        var obounds = new OpenLayers.Bounds();
        obounds.extend(this.sw.toOpenLayers());
        obounds.extend(this.ne.toOpenLayers());
        return obounds;
    };

    /**
    * getSouthWest returns a LatLonPoint of the south-west point of the bounding box
    * @returns the south-west point of the bounding box
    * @type LatLonPoint
    */
    ABoundingBox.prototype.getSouthWest = function() {
        return this.sw;
    };

    /**
    * getNorthEast returns a LatLonPoint of the north-east point of the bounding box
    * @returns the north-east point of the bounding box
    * @type LatLonPoint
    */
    ABoundingBox.prototype.getNorthEast = function() {
        return this.ne;
    };

    /**
    * isEmpty finds if this bounding box has zero area
    * @returns whether the north-east and south-west points of the bounding box are the same point
    * @type boolean
    */
    ABoundingBox.prototype.isEmpty = function() {
        return this.ne == this.sw; // is this right? FIXME
    };

    /**
    * contains finds whether a given point is within a bounding box
    * @param {LatLonPoint} point the point to test with
    * @returns whether point is within this bounding box
    * @type boolean
    */
    ABoundingBox.prototype.contains = function(point) {
        return point.lat >= this.sw.lat && point.lat <= this.ne.lat && point.lon >= this.sw.lon && point.lon <= this.ne.lon;
    };

    /**
    * toSpan returns a LatLonPoint with the lat and lon as the height and width of the bounding box
    * @returns a LatLonPoint containing the height and width of this bounding box
    * @type LatLonPoint
    */
    ABoundingBox.prototype.toSpan = function() {
        return new LatLonPoint(Math.abs(this.sw.lat - this.ne.lat), Math.abs(this.sw.lon - this.ne.lon));
    };

    ABoundingBox.prototype.toWkt = function() {
        return "POLYGON ((" + this.sw.lon + " " + this.sw.lat + ", " +
                                        this.ne.lon + " " + this.sw.lat + ", " +
                                        this.ne.lon + " " + this.ne.lat + ", " +
                                        this.sw.lon + " " + this.ne.lat + ", " +
                                        this.sw.lon + " " + this.sw.lat + "))";
    };


    /**
    * extend extends the bounding box to include the new point
    */
    ABoundingBox.prototype.extend = function(obj) {
        if (obj instanceof mxn.LatLonPoint) {
            if (this.sw.lat > obj.lat) {
                this.sw.lat = obj.lat;
            }
            if (this.sw.lon > obj.lon) {
                this.sw.lon = obj.lon;
                this.sw.lng = obj.lng;
            }
            if (this.ne.lat < obj.lat) {
                this.ne.lat = obj.lat;
            }
            if (this.ne.lon < obj.lon) {
                this.ne.lon = obj.lon;
                this.ne.lng = obj.lng;
            }
        }
        else if (obj instanceof mxn.ABoundingBox) {
            var olBounds = this.toOpenLayers();
            olBounds.extend(obj.toOpenLayers());
            var olSW = new OpenLayers.LonLat(olBounds.left, olBounds.bottom);
            this.sw = LatLonPoint.fromOpenLayers(olSW);
            var olNE = new OpenLayers.LonLat(olBounds.right, olBounds.top);
            this.ne = LatLonPoint.fromOpenLayers(olNE);
        }
        return this;
    };

    ABoundingBox.prototype.expand = function(percentage) {
        var olBounds = this.toOpenLayers();
        var minusBy = 1 - percentage / 100;
        var addBy = 1 + percentage / 100;
        olBounds = new OpenLayers.Bounds(minusBy * olBounds.left, minusBy * olBounds.bottom, addBy * olBounds.right, addBy * olBounds.top);
        var olSW = new OpenLayers.LonLat(olBounds.left, olBounds.bottom);
        this.sw = LatLonPoint.fromOpenLayers(olSW);
        var olNE = new OpenLayers.LonLat(olBounds.right, olBounds.top);
        this.ne = LatLonPoint.fromOpenLayers(olNE);
        return this;
    }

    function CacheProvider() {
        // values will be stored here
        CacheProvider.cache = {};

        try {
            CacheProvider.hasLocalStorage = ('localStorage' in window) && window['localStorage'] !== null;
        } catch (ex) {
            CacheProvider.hasLocalStorage = false;
        }
    }

    CacheProvider.prototype = {
        /**
        * {String} k - the key
        * {Boolean} local - get this from local storage?
        * {Boolean} o - is the value you put in local storage an object?
        */
        get: function(k) {
            if (CacheProvider.hasLocalStorage) {
                var action = 'getItem';
                return localStorage[action](k) || undefined;
            } else {
                return CacheProvider.cache[k] || undefined;
            }
        },


        /**
        * {String} k - the key
        * {Object} v - any kind of value you want to store
        * however only objects and strings are allowed in local storage
        * {Boolean} local - put this in local storage
        */
        set: function(k, v) {
            if (CacheProvider.hasLocalStorage) {
                try {
                    if (typeof v !== "string") {
                        console.error('Cache only supports string types');
                        return;
                    }
                    localStorage.setItem(k, v);
                } catch (ex) {
                    if (ex.name == 'QUOTA_EXCEEDED_ERR' || ex.name == "QuotaExceededError") {
                        console.error('Cache quota exceeded');
                        this.clear();
                        this.set(k, v);
                        return;
                    }
                }
            } else {
                // put in our local object
                CacheProvider.cache[k] = v;
            }
            // return our newly cached item
            return v;
        },


        /**
        * {String} k - the key
        * {Boolean} local - put this in local storage
        * {Boolean} o - is this an object you want to put in local storage?
        */
        clear: function(k) {
            if (CacheProvider.hasLocalStorage) {
                if (k)
                    localStorage.removeItem(k);
                else
                    localStorage.clear();
            }
            // delete in both caches - doesn't hurt.
            if (k)
                delete CacheProvider.cache[k];
            else
                CacheProvider.cache = {};
        }
    };


    //////////////////////////
    //
    //  Layer
    //
    //////////////////////////

    /**
    * Layer creates a new layer
    * @param {string} type the type of layer
    * @param {string} name name of layer
    * @param {string} type-based options
    * @param {string} layer-events
    * @type Layer
    * @constructor
    * @classDescription Layer
    */
    function Layer(options) {
        this.name;
        this.type;
        this.onLoadEnd;
        this.onZoomPanEnd;
        this.onLoadError;
        this.isBaseLayer = true;
        this.isTransparent = false;
        this.isVisible = true;
        this.displayInLegend = true;
        this.isFirstLoad = true;
        this.zoomToLayer;
        this.restrictZoomToBounds;
        this.rotateToFitScreen;
        //Google
        this.mapType;
        //WMS
        this.isSingleTile = true;
        this.format;
        //WMS and Vector
        this.dataSource;
        //Vector
        this.styleMap;
        this.childLayers = {};
        this.parentLayer = null;
        this.clusterDisplayThreshold;
        this.polygonDisplayThreshold;
        this.applyLayerBounds;
        this.layerRatioToMap; //This leads to rendering around edges
        this.enableCaching;
        this.cache = {};

        //Copy from options
        try {
            var dataSource, styleMap;
            if (options.dataSource) dataSource = OpenLayers.Util.extend(dataSource, options.dataSource);
            if (options.styleMap)
                styleMap = OpenLayers.Util.extend(styleMap, options.styleMap);
            else if (options.style)
                styleMap = { 'default': options.style };
            OpenLayers.Util.extend(this, options);
            this.styleMap = new mxn.StyleMap(styleMap);
            if (dataSource) this.dataSource = new mxn.DataSource(dataSource);
            dataSource = null;
            styleMap = null;
        }
        catch (e) {
            try { if (this.onLoadError) this.onLoadError('Invalid options for Layer object'); } catch (e) { }
        }

        //Internal properties
        this.proprietary_layer;
        this.loadCounters = {};
        this.clusters = [];
    }

    Layer.prototype.getPixelFromLatLon = function(latLonPoint) {
        var olLonLat = latLonPoint.toOpenLayers();
        var olLayer = this.proprietary_layer;
        var olPixel = olLayer.map.getPixelFromLonLat(olLonLat);
        olPixel.x = olPixel.x + olLayer.map.getViewport().offsetLeft;
        olPixel.y = olPixel.y + olLayer.map.getViewport().offsetTop;
        return [olPixel.x, olPixel.y];
        olPixel = null;
        olLonLat = null;
        olLayer = null;
    };

    Layer.prototype.getBounds = function() {
        if (!this.proprietary_layer) return null;
        var layerBounds = this.proprietary_layer.map.getExtent().clone();
        layerBounds.transform(new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection), new OpenLayers.Projection(mapstractionConfig.mapOptions.displayProjection));
        var mxnBounds = new ABoundingBox(layerBounds.bottom, layerBounds.left, layerBounds.top, layerBounds.right);
        layerBounds = null;
        return mxnBounds;
    }

    Layer.prototype.getDataBounds = function() {
        if (!this.proprietary_layer) return null;
        var layerBounds = null;
        var olLayer = this.proprietary_layer;
        if (olLayer.CLASS_NAME == 'OpenLayers.Layer.Vector') {
            var olFeatures = olLayer.features;
            if (olFeatures && (olFeatures.length > 0)) {
                var geometry = null;
                for (var idx = 0; idx < olFeatures.length; idx++) {
                    geometry = olFeatures[idx].data['__originalgeom'] || olFeatures[idx].geometry;
                    if (geometry) {
                        if (layerBounds === null) {
                            layerBounds = new OpenLayers.Bounds();
                        }
                        layerBounds.extend(geometry.getBounds());
                    }
                }
                geometry = null;
            }
            olFeatures = null;
            layerBounds = ABoundingBox.fromOpenLayers(layerBounds);
        }
        else if (olLayer.CLASS_NAME === 'OpenLayers.Layer.Marker') {
            layerBounds = olLayer.getDataExtent();
            layerBounds.clone().transform(new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection), new OpenLayers.Projection(mapstractionConfig.mapOptions.displayProjection));
            layerBounds = new ABoundingBox(layerBounds.bottom, layerBounds.left, layerBounds.top, layerBounds.right);
        }
        olLayer = null;
        return layerBounds;
    }

    Layer.createFromConfig = function(layerName) {
        var layerSettings = {};
        for (var attr in mapstractionConfig.layers[layerName]) {
            if (attr != 'childLayers') {
                layerSettings[attr] = mapstractionConfig.layers[layerName][attr];
            }
        }
        if (!layerSettings.name) layerSettings.name = layerName;
        var layer = new mxn.Layer(layerSettings);
        layerSettings = null;
        for (var childlLayerName in mapstractionConfig.layers[layerName].childLayers) {
            var childLayerSettings = {};
            for (var attr in mapstractionConfig.layers[layerName].childLayers[childlLayerName]) {
                childLayerSettings[attr] = mapstractionConfig.layers[layerName].childLayers[childlLayerName][attr];
            }
            if (!childLayerSettings.name) childLayerSettings.name = childlLayerName;
            var childLayer = new mxn.Layer(childLayerSettings);
            layer.addChildLayer(childLayer, childlLayerName);
            childLayer = null;
        }
        return layer;
    };

    Layer.prototype.getFeatures = function(options) {
        var features = [];
        var olFeatures = this.proprietary_layer.features;
        if (options && options.selected == true) {
            olFeatures = this.proprietary_layer.selectedFeatures;
        }
        if (options && options.visible == true) {

        }
        for (var idx = 0; idx < olFeatures.length; idx++) {
            if (!olFeatures[idx].childFeatures) {
                features.push(Feature.fromOpenLayers(olFeatures[idx]));
            }
        }
        olFeatures = null;
        return features;
    };

    Layer.prototype.getFeatureAttributes = function() {
        var attributes = [];
        var olFeatures = this.proprietary_layer.feature;
        for (var idx = 0; idx < olFeatures.length; idx++) {
            attributes.push(olFeatures[idx].attributes);
        }
        olFeatures = null;
        return attributes;
    };

    Layer.prototype.getFeaturesByAttribute = function(attributeName, attributeValue, options) {
        var msFeatureArray = [];
        if (!options) options = {};
        if (options == true) options = { 'ignoreCase': true, 'exactMatch': false };
        if (options.maxCount == 0) return msFeatureArray;
        if (attributeName && attributeValue) {
            var olFeatures = this.proprietary_layer.features;
            for (var idx = 0; idx < olFeatures.length; idx++) {
                var olFeature = olFeatures[idx];
                var featureAttribute = olFeature.attributes[attributeName];
                if (featureAttribute) {
                    featureAttribute = featureAttribute.toString();
                    attributeValue = attributeValue.toString();
                    if (options.ignoreCase) {
                        featureAttribute = featureAttribute.toUpperCase();
                        attributeValue = attributeValue.toUpperCase();
                    }
                    if (options.exactMatch) {
                        if (featureAttribute == attributeValue) {
                            var msFeature = Feature.fromOpenLayers(olFeature);
                            msFeatureArray.push(msFeature);
                            msFeature = null;
                        }
                    }
                    else {
                        if (featureAttribute.indexOf(attributeValue) > -1) {
                            var msFeature = Feature.fromOpenLayers(olFeature);
                            msFeatureArray.push(msFeature);
                            msFeature = null;
                        }
                    }
                    if (msFeatureArray.length == options.maxCount) break;
                }
                olFeature = null;
            }
        }
        return msFeatureArray;
    };

    Layer.prototype.doFeaturesExist = function(attributeName, attributeValue, options) {
        if (!options) options = {};
        if (options == true) options = { 'ignoreCase': true };
        options.maxCount = 1;
        return (this.getFeaturesByAttribute(attributeName, attributeValue, options) > 0);
    };

    Layer.prototype.removeFeaturesByAttribute = function(attributeName, attributeValue, options) {
        var olFeatureArray = [];
        if (!options) options = {};
        if (options == true) options = { 'ignoreCase': true, 'exactMatch': false };
        if (attributeName && attributeValue) {
            var olFeatures = this.proprietary_layer.features;
            for (var idx = 0; idx < olFeatures.length; idx++) {
                var olFeature = olFeatures[idx];
                var featureAttribute = olFeature.attributes[attributeName];
                if (featureAttribute) {
                    featureAttribute = featureAttribute.toString();
                    attributeValue = attributeValue.toString();
                    if (options.ignoreCase) {
                        featureAttribute = featureAttribute.toUpperCase();
                        attributeValue = attributeValue.toUpperCase();
                    }
                    if (options.exactMatch) {
                        if (featureAttribute == attributeValue) {
                            olFeatureArray.push(olFeature);
                        }
                    }
                    else {
                        if (featureAttribute.indexOf(attributeValue) > -1) {
                            olFeatureArray.push(olFeature);
                        }
                    }
                }
                olFeature = null;
            }
        }
        this.proprietary_layer.destroyFeatures(olFeatures);
        olFeatures = null;
    };

    Layer.prototype.removeFeatures = function(features) {
        var olFeatures;
        if (features) {
            olFeatures = [];
            for (var idx = 0; idx < features.length; idx++) {
                olFeatures.push(features[idx].proprietary_feature);
            }
        }
        this.proprietary_layer.destroyFeatures(olFeatures);
    };

    Layer.prototype.getFeatureById = function(featureID) {
        var feature = null;
        var olFeatures = this.proprietary_layer.feature;
        for (var idx = 0, len = olFeatures.length; idx < len; ++idx) {
            if (olFeatures[idx]["id"] == featureID) {
                feature = Feature.fromOpenLayers(olFeatures[idx]);
                break;
            }
        }
        return feature;
    };

    Layer.prototype.removeFeatureById = function(featureID) {
        var olFeature = this.getFeatureById(featureId).proprietary_feature;
        this.proprietary_layer.destroyFeatures(olFeature);
        olFeature = null;
    };

    Layer.prototype.selectFeature = function(feature) {
        var olFeature = feature.proprietary_feature;
        var olLayer = this.proprietary_layer;
        if (!olLayer || !olFeature || !olFeature.layer == olLayer) return;
        olLayer.drawFeature(olFeature, 'select');
        olLayer.selectedFeatures.push(olFeature);
        olFeature.renderIntent = 'select';
        olFeature = null;
        olLayer = null;
    }

    Layer.prototype.unselectFeature = function(feature) {
        var olFeature = feature.proprietary_feature;
        var olLayer = this.proprietary_layer;
        if (!olLayer || !olFeature || !olFeature.layer == olLayer) return;
        olLayer.drawFeature(olfeature, 'default');
        OpenLayers.Util.removeItem(olLayer.selectedFeatures, olFeature);
        olFeature.renderIntent = 'default';
        olFeature = null;
        olLayer = null;
    }

    Layer.prototype.unselectAllFeatures = function() {
        var olLayer = this.proprietary_layer;
        if (!olLayer) return;
        for (var jdx = olLayer.selectedFeatures.length - 1; jdx >= 0; --jdx) {
            var olFeature = olLayer.selectedFeatures[jdx];
            if (olFeature.layer == olLayer) {
                olLayer.drawFeature(olFeature, 'default');
            }
            OpenLayers.Util.removeItem(olLayer.selectedFeatures, olFeature);
            olFeature.renderIntent = 'default';
            olFeature = null;
        }
        olLayer = null;
    }

    Layer.prototype.toOpenLayers = function() {
        var olLayer = null;
        switch (this.type.toUpperCase()) {
            case 'GOOGLE':
                var mapOptions = {
                    sphericalMercator: (mapstractionConfig.mapOptions.mapProjection == "EPSG:900913"),
                    isBaseLayer: this.isBaseLayer,
                    strategies: [new OpenLayers.Strategy.Fixed({ preload: false })],
                    projection: new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection),
                    maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34)
                };
                if (google.maps.MapTypeId) {
                    mapOptions.type = google.maps.MapTypeId.ROADMAP;
                    if (this.mapType) {
                        if (this.mapType.toUpperCase() == 'HYBRID') mapOptions.type = google.maps.MapTypeId.HYBRID;
                        if (this.mapType.toUpperCase() == 'SATELLITE') mapOptions.type = google.maps.MapTypeId.SATELLITE;
                        if (this.mapType.toUpperCase() == 'TERRAIN') mapOptions.type = google.maps.MapTypeId.TERRAIN;
                    }
                }
                olLayer = new OpenLayers.Layer.Google(this.name, mapOptions);
                if (google.maps.MapTypeId && (mapOptions.type == google.maps.MapTypeId.SATELLITE || mapOptions.type == google.maps.MapTypeId.HYBRID)) {
                    window['googleLayer'] = olLayer;
                    window['setTilt'] = function() {
                        if (window['googleLayer']) {
                            if (window['googleLayer'].mapObject) {
                                window['googleLayer'].mapObject.setTilt(0);
                            }
                            window['googleLayer'] = undefined;
                            window['setTilt'] = undefined;
                        }
                    }
                    window.setTimeout('setTilt();', 2000);
                }
                mapOptions = null;
                if (this.isAnimated == true) olLayer.animationEnabled = true;
                break;
            case 'YAHOO':
                olLayer = new OpenLayers.Layer.Yahoo(this.name, {
                    'sphericalMercator': (mapstractionConfig.mapOptions.mapProjection == "EPSG:900913"),
                    isBaseLayer: this.isBaseLayer,
                    strategies: [new OpenLayers.Strategy.Fixed({ preload: false })]
                });
                if (this.isAnimated == true) olLayer.transitionEffect = 'resize';
                break;
            case 'BING':
                olLayer = new OpenLayers.Layer.VirtualEarth(this.name, { type: VEMapStyle.Shaded,
                    'sphericalMercator': (mapstractionConfig.mapOptions.mapProjection == "EPSG:900913"),
                    strategies: [new OpenLayers.Strategy.Fixed({ preload: false })]
                });
                if (this.isAnimated == true) olLayer.animationEnabled = 'resize';
                break;
            case 'MARKER':
                olLayer = new OpenLayers.Layer.Markers(this.name);
                break;
            case 'WMS':
                var dataSource = this.dataSource;
                olLayer = new OpenLayers.Layer.WMS(name, mapstractionConfig.mapServer.mapServerPath,
                { layers: dataSource.layerName, transparent: this.isTransparent, format: this.format,
                    isBaseLayer: this.isBaseLayer, //TimeStamp: new Date().getMilliseconds(),
                    strategies: [new OpenLayers.Strategy.Fixed({ preload: false })]
                },
                { singleTile: this.isSingleTile, ratio: 1, buffer: 0, visibility: this.isVisible });

                //Update parameters for getURL function of WMS layer. This URL will be used to fetch WMS data.
                olLayer.getURL = function(bounds) {
                    bounds = this.adjustBounds(bounds);
                    var imageSize = this.getImageSize();
                    var boundsArray = bounds.toArray();
                    var llBounds = new OpenLayers.Bounds(boundsArray[0], boundsArray[1], boundsArray[2], boundsArray[3]);
                    llBounds.transform(new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection), new OpenLayers.Projection(mapstractionConfig.mapOptions.dbProjection)).toBBOX();
                    var llBoundsArray = llBounds.toArray();
                    var mappingInput = {
                        "MapName": dataSource.mapName,
                        "LayerNames": [dataSource.layerName],
                        "QueryFilters": [dataSource.queryFilter],
                        "ShowDirection": [dataSource.showMarkerDirection ? dataSource.showMarkerDirection : false],
                        "HideMarkers": [dataSource.hideMarkers ? dataSource.hideMarkers : false],
                        "MapExtent": { "XMin": llBoundsArray[0], "XMax": llBoundsArray[2], "YMin": llBoundsArray[1], "YMax": llBoundsArray[3] },
                        "ImageWidth": imageSize.w,
                        "ImageHeight": imageSize.h,
                        "ImageFormat": this.options.format
                    }
                    var mappingInputStr = new OpenLayers.Format.JSON().write(mappingInput);
                    var newBaseUrl = mapstractionConfig.mapServer.mapServerPath;
                    var requestString = this.getFullRequestString({ 'GetLayerDataAsRasterInput': mappingInputStr }, newBaseUrl);
                    if (self.isFirstLoad == true) {
                        try { if (this.onLoadEnd) this.onLoadEnd(); } catch (e) { }
                        self.isFirstLoad = false;
                    }
                    else {
                        try { if (this.onZoomPanEnd) this.onZoomPanEnd(); } catch (e) { }
                    }
                    llBoundsArray = null;
                    llBounds = null;
                    boundsArray = null;
                    imageSize = null;
                    return requestString;
                };
                if (this.isAnimated == true) olLayer.transitionEffect = 'resize';
                break;
            case 'GML':
                olLayer = new OpenLayers.Layer.GML(this.name, {},
                   {
                       projection: new OpenLayers.Projection(mapstractionConfig.mapOptions.displayProjection),
                       format: OpenLayers.Format.KML,
                       formatOptions: {
                           extractStyles: true,
                           extractAttributes: true,
                           maxDepth: 2
                       }
                   });
                break;
            case 'TMS':
                var getTmsUrl = function(bounds) {
                    var res = this.map.getResolution();
                    var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
                    var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
                    var z = this.map.getZoom() + mapstractionConfig.mapOptions.minZoomLevel;

                    var path = z + "/" + x + "/" + y + "." + type;

                    var url = this.url;
                    if (url instanceof Array) {
                        url = this.selectUrl(path, url);
                    }
                    var completePath = url + path;
                    return completePath;
                }

                olLayer = new OpenLayers.Layer.TMS(this.name, mapstractionConfig.mapServer.tileCachepath,
                { 'type': 'png', 'getURL': getTmsUrl,
                    strategies: [new OpenLayers.Strategy.Fixed({ preload: false })]
                });

                if (this.isAnimated == true) olLayer.transitionEffect = 'resize';
                break;
            case 'VECTOR':
                var self = this;
                var vLayerOptions = {
                    renderers: (this.renderers && this.renderers.length > 0) ? this.renderers : mapstractionConfig.symbols.renderers,
                    isBaseLayer: this.isBaseLayer,
                    strategies: []
                };

                olLayer = new OpenLayers.Layer.Vector(this.name, vLayerOptions);
                //Ratio of the size of the visiblity of the Vector Layer features to the size of the map
                if (self.layerRatioToMap) olLayer.ratio = self.layerRatioToMap;
                olLayer.styleMap = this.styleMap.toOpenLayers();
                //Put text and vectors in the same container, so that they appear as per rendering order
                olLayer.renderer.textRoot = olLayer.renderer.vectorRoot;

                var applyDisplayThresholds = function(e) {
                    if (!self.clusterDisplayThreshold && !self.polygonDisplayThreshold) return;
                    var olLayer = self.proprietary_layer;
                    var olFeatures = e.features;
                    if (self.clusterDisplayThreshold) {
                        //Clear previous clusters
                        olLayer.destroyFeatures(self.clusters);
                        self.clusters = [];
                    }

                    //Apply fresh display thresholds
                    for (var idx = 0; idx < olFeatures.length; idx++) {
                        var olFeature = olFeatures[idx];
                        //If this feaure is within map-extent
                        //if (olFeature.onScreen(true)){ 
                        var featureStyle = ((olFeature.data['__originalstyle'] !== undefined) ? olFeature.data['__originalstyle'] : olFeature.style) || olLayer.style || olLayer.styleMap.createSymbolizer(olFeature, olFeature.renderIntent);
                        //ICONS FOR SMALL POLYGON-FEATURE
                        if (self.polygonDisplayThreshold) {
                            var featureGeom = olFeature.data['__originalgeom'] || olFeature.geometry;
                            var featureBounds = featureGeom.getBounds();
                            if (featureBounds) {
                                var pixelWidth = featureBounds.getWidth() / olLayer.getResolution();
                                var pixelHeight = featureBounds.getHeight() / olLayer.getResolution();
                                if (pixelWidth < self.polygonDisplayThreshold && pixelHeight < self.polygonDisplayThreshold) {
                                    //Polygon very small
                                    if (featureStyle.externalGraphic) {
                                        if (!olFeature.data['__originalgeom']) {
                                            olFeature.data['__originalgeom'] = olFeature.geometry;
                                        }
                                        var center = olFeature.geometry.getBounds().getCenterLonLat();
                                        olFeature.data['__newgeom'] = new OpenLayers.Geometry.Point(center.lon, center.lat);
                                        center = null;
                                    }
                                    else {
                                        //No external-graphic provided in feature-style. So simply hide feature
                                        if (olFeature.data['__originalstyle'] === undefined) {
                                            olFeature.data['__originalstyle'] = olFeature.style;
                                        }
                                        olFeature.data['__newstyle'] = { 'display': 'none' };
                                    }
                                }
                                else {
                                    //Change feature's geometry back to original geometry.
                                    if (olFeature.data['__originalgeom']) {
                                        olFeature.data['__newgeom'] = olFeature.data['__originalgeom'];
                                        delete olFeature.data['__originalgeom'];
                                    }
                                }
                            }
                            featureGeom = null;
                            featureBounds = null;
                        }

                        //CLUSTERING
                        if (self.clusterDisplayThreshold) {
                            //Check if there are any closeby features
                            var clustered = false;
                            var featureBounds = olFeature.geometry.getBounds();
                            if (featureBounds) {
                                var fCenter = featureBounds.getCenterLonLat();
                                for (var cdx = 0; cdx < self.clusters.length; cdx++) {
                                    var clusterFeature = self.clusters[cdx];
                                    var cCenter = clusterFeature.geometry.getBounds().getCenterLonLat();
                                    var distance = (Math.sqrt(Math.pow((cCenter.lon - fCenter.lon), 2) + Math.pow((cCenter.lat - fCenter.lat), 2)) / olLayer.getResolution());
                                    if (distance <= self.clusterDisplayThreshold) {
                                        //ADD TO CLUSTER: Distance between olFeature and clustered-olFeature is less. Hence add olFeature to clustered-olFeature.
                                        clusterFeature.childFeatures.push(olFeature);
                                        clusterFeature.attributes.count += 1;
                                        if (clusterFeature.style.externalGraphic) {
                                            clusterFeature.style.graphicHeight = Math.min(clusterFeature.style.graphicHeight + 2, 50);
                                            clusterFeature.style.graphicWidth = Math.min(clusterFeature.style.graphicWidth + 2, 50);
                                        }
                                        else {
                                            clusterFeature.style.pointRadius = Math.min(((clusterFeature.style.pointRadius) ? clusterFeature.style.pointRadius : 0) + 2, 10);
                                        }
                                        clusterFeature.style.label = "" + clusterFeature.attributes.count + "";
                                        if (olFeature.data['__originalstyle'] === undefined) {
                                            olFeature.data['__originalstyle'] = olFeature.style;
                                        }
                                        olFeature.data['__newstyle'] = { 'display': 'none' };
                                        clustered = true;
                                    }
                                    cCenter = null;
                                    clusterFeature = null;
                                }
                                if (!clustered) {
                                    //CREATE NEW CLUSTER: If no closeby-feature was found, then create a new cluster. Since it only has 1 olFeature, dont change its geometry.
                                    var clusterFeature = new OpenLayers.Feature.Vector();
                                    clusterFeature.geometry = new OpenLayers.Geometry.Point(fCenter.lon, fCenter.lat);
                                    clusterFeature.attributes = { 'count': 1 };
                                    clusterFeature.style = olLayer.style || olLayer.styleMap.createSymbolizer(olFeature, olFeature.renderIntent);
                                    if (clusterFeature.style.externalGraphic) {
                                        clusterFeature.style.graphicHeight = Math.min(((clusterFeature.style.graphicHeight) ? clusterFeature.style.graphicHeight : 0) + 2, 50);
                                        clusterFeature.style.graphicWidth = Math.min(((clusterFeature.style.graphicWidth) ? clusterFeature.style.graphicWidth : 0) + 2, 50);
                                    }
                                    else {
                                        clusterFeature.style.pointRadius = Math.min(((clusterFeature.style.pointRadius) ? clusterFeature.style.pointRadius : 0) + 2, 10);
                                    }
                                    clusterFeature.style.label = "" + clusterFeature.attributes.count + "";
                                    clusterFeature.style.labelAlign = "cb";
                                    clusterFeature.style.labelYOffset = "-8";
                                    clusterFeature.data = { 'count': 1 };
                                    if (olFeature.data['__originalstyle'] === undefined) {
                                        olFeature.data['__originalstyle'] = olFeature.style;
                                    }
                                    olFeature.data['__newstyle'] = { 'display': 'none' };
                                    clusterFeature.childFeatures = [olFeature];
                                    self.clusters.push(clusterFeature);
                                    clusterFeature = null;
                                }
                            }
                            fCenter = null;
                            featureBounds = null;
                        }
                        olFeature = null;
                        //}
                    } //for loop end

                    if (self.clusterDisplayThreshold || self.polygonDisplayThreshold) {
                        if (self.clusterDisplayThreshold) {
                            //Remove clusters which have only one feature. Also reset the original-style of child-features
                            for (var cdx = 0; cdx < self.clusters.length; cdx++) {
                                if (self.clusters[cdx].attributes['count'] == 1) {
                                    var firstOlFeature = self.clusters[cdx].childFeatures[0];
                                    firstOlFeature.data['__newstyle'] = firstOlFeature.data['__originalstyle'];
                                    delete firstOlFeature.data['__originalstyle'];
                                    firstOlFeature = null;
                                    self.clusters.splice(cdx, 1);
                                    cdx--;
                                }
                            }
                            //Add remaining clusters to map
                            olLayer.addFeatures(self.clusters);
                        }

                        for (var fdx = 0; fdx < olFeatures.length; fdx++) {
                            var olFeature = olFeatures[fdx];
                            var newGeom = olFeature.data['__newgeom'];
                            var newStyle = olFeature.data['__newstyle'];

                            if (newGeom != undefined) {
                                olLayer.renderer.eraseGeometry(olFeature.geometry, olFeature.id);
                                olFeature.geometry = newGeom;
                                olFeature.style = newStyle;
                                olLayer.drawFeature(olFeature);
                            }
                            else if (newStyle !== undefined) { //style can be null if feature is not provided any individual style
                                olFeature.style = newStyle;
                                olLayer.drawFeature(olFeature);
                            }
                            delete olFeature.data['__newstyle'];
                            delete olFeature.data['__newgeom'];
                            newGeom = null;
                            newStyle = null;
                            olFeature = null;
                        }
                    }
                    olFeatures = null;
                    olLayer = null;
                };

                var getDataBounds = function(olFeatures) {
                    var olBounds = new OpenLayers.Bounds();
                    for (var idx = 0; idx < olFeatures.length; idx++) {
                        if (olFeatures[idx] && olFeatures[idx].geometry) {
                            olBounds.extend(olFeatures[idx].geometry.getBounds());
                        }
                    }
                    return olBounds;
                };

                var onLayerLoadEnd = function() {
                    var olLayer = self.proprietary_layer;
                    var scale = 1.25;

                    //Check if load-end is called first time or second time
                    if (self.isFirstLoad == true) {
                        var dataBounds = {};

                        //Get databounds for setting map-extent
                        var olExtentForZoom = null;
                        if (self.zoomToLayer) {
                            if (dataBounds[self.name] == null) dataBounds[self.name] = getDataBounds(olLayer.features);
                            olExtentForZoom = dataBounds[self.name].clone().scale(scale);
                        }
                        for (var childLayerName in self.childLayers) {
                            var childLayer = self.childLayers[childLayerName];
                            if (childLayer.zoomToLayer) {
                                var childOlLayer = childLayer.proprietary_layer;
                                if (dataBounds[childLayerName] == null) dataBounds[childLayerName] = getDataBounds(childOlLayer.features);
                                var childLayerExtent = dataBounds[childLayerName].clone().scale(scale);
                                if (olExtentForZoom == null)
                                    olExtentForZoom = childLayerExtent;
                                else
                                    olExtentForZoom.extend(childLayerExtent);
                                childOlLayer = null;
                            }
                            childLayer = null;
                        }



                        //Get databounds for setting restricted-extent
                        var olRestrictedExtent = null;
                        if (self.restrictZoomToBounds) {
                            if (dataBounds[self.name] == null) dataBounds[self.name] = getDataBounds(olLayer.features);
                            olRestrictedExtent = dataBounds[self.name].clone().scale(scale);
                        }
                        for (var childLayerName in self.childLayers) {
                            var childLayer = self.childLayers[childLayerName];

                            if (childLayer.restrictZoomToBounds) {
                                var childOlLayer = childLayer.proprietary_layer;
                                if (dataBounds[childLayerName] == null) dataBounds[childLayerName] = getDataBounds(childOlLayer.features);
                                var childLayerExtent = dataBounds[childLayerName].clone().scale(scale);
                                if (olRestrictedExtent == null)
                                    olRestrictedExtent = childLayerExtent;
                                else
                                    olRestrictedExtent.extend(childLayerExtent);
                                childOlLayer = null;
                            }
                            childLayer = null;
                        }

                        //Set restricted-extent
                        var olMap = olLayer.map;
                        if (olRestrictedExtent != null) {
                            if (olExtentForZoom != null) {
                                olMap.restrictedExtent = olRestrictedExtent;
                                olMap.maxExtent = olRestrictedExtent;
                            }
                            else
                                olMap.setOptions({ restrictedExtent: olBounds, maxExtent: olRestrictedExtent });
                        }

                        //Set map-extent
                        if (olExtentForZoom != null) {
                            olMap.zoomToExtent(olExtentForZoom);
                        }

                        //Rotate map if required
                        if (self.rotateToFitScreen && olExtentForZoom != null) {
                            var screenBounds = olLayer.map.getExtent();
                            if (screenBounds) {
                                if ((screenBounds.getHeight() > screenBounds.getWidth() && olExtentForZoom.getWidth() > olExtentForZoom.getHeight())
                                || (screenBounds.getWidth() > screenBounds.getHeight() && olExtentForZoom.getHeight() > olExtentForZoom.getWidth())) {
                                    olLayer.div.childNodes[0].style.webkitTransform = "rotate(270deg)";
                                    for (var childLayerName in self.childLayers) {
                                        var childOlLayer = self.childLayers[childLayerName].proprietary_layer;
                                        childOlLayer.div.childNodes[0].style.webkitTransform = "rotate(270deg)";
                                        childOlLayer = null;
                                    }
                                }
                            }
                            screenBounds = null;
                        }

                        try { if (self.onLoadEnd) self.onLoadEnd(); } catch (e) { }
                        self.isFirstLoad = false;
                        olExtentForZoom = null;
                        olRestrictedExtent = null;
                        dataBounds = null;
                        olMap = null;
                    }
                    else {
                        try { if (self.onZoomPanEnd) self.onZoomPanEnd(); } catch (e) { }
                    }
                    olLayer = null;
                }

                var onChildLayerLoadEnd = function(childLayer, parentFeatureCount) {
                    if (childLayer.isFirstLoad == true) {
                        try { if (childLayer.onLoadEnd) childLayer.onLoadEnd(); } catch (e) { }
                        childLayer.isFirstLoad = false;
                    }
                    else {
                        try { if (childLayer.onZoomPanEnd) childLayer.onZoomPanEnd(); } catch (e) { }
                    }

                    //Check if all child-layers have loaded for all parent-features
                    var allChildLayersLoaded = true;
                    for (var childLayerName in self.childLayers) {
                        if (self.loadCounters[childLayerName] != parentFeatureCount) {
                            //child-layer has not yet loaded
                            allChildLayersLoaded = false;
                            break;
                        }
                    }
                    if (allChildLayersLoaded) {
                        onLayerLoadEnd();
                    }
                };

                var onScreen = function(olFeature) {
                    var olLayer = self.proprietary_layer;
                    var screenBounds = olLayer.map.getExtent();
                    var output = false;
                    if (!screenBounds) return false;
                    var featureBounds = olFeature.geometry.getBounds();
                    if (featureBounds) {
                        output = screenBounds.intersectsBounds(featureBounds);
                    }
                    featureBounds = null;
                    screenBounds = null;
                    olLayer = null;
                    return output;
                };

                var renderChildLayer = function(childLayerName, parentOlFeature, isParentOnScreen, parentFeatureCount) {
                    try {
                        var childLayer = self.childLayers[childLayerName];
                        var childOlLayer = childLayer.proprietary_layer;
                        var parentFeatureID = parentOlFeature.attributes[self.dataSource.idField];
                        if (!childLayer.dataSource || !parentFeatureID || parentOlFeature.childFeatures) {
                            self.loadCounters[childLayerName]++;
                            if (self.loadCounters[childLayerName] == parentFeatureCount) {
                                onChildLayerLoadEnd(childLayer, parentFeatureCount);
                            }
                            return;
                        }

                        //Initialise cache for parent-feature
                        if (self.cache == null) self.cache = {};
                        if (!self.cache[parentFeatureID]) self.cache[parentFeatureID] = {};
                        if (!self.cache[parentFeatureID][childLayerName]) self.cache[parentFeatureID][childLayerName] = {};

                        //Display child-layer data if parent feature is visible, and child-layer is also displayable at current-scale.
                        if (self.proprietary_layer.features.length == 1 || (isParentOnScreen && childLayer.getDisplayAtCurrentScale())) {
                            //Check if child-features are already loaded for this parentID
                            if (self.cache[parentFeatureID][childLayerName].renderedOnMap) {
                                self.loadCounters[childLayerName]++;
                                if (self.loadCounters[childLayerName] == parentFeatureCount) {
                                    onChildLayerLoadEnd(childLayer, parentFeatureCount);
                                }
                                return;
                            }

                            var onRequestSuccess = function(newFeatures) {
                                //Add child-features to map
                                var childLayer = self.childLayers[childLayerName];
                                var childOlLayer = childLayer.proprietary_layer;
                                if (newFeatures && newFeatures.length > 0) {
                                    childOlLayer.addFeatures(newFeatures, { 'silent': true });
                                }
                                self.cache[parentFeatureID][childLayerName].renderedOnMap = true;
                                self.loadCounters[childLayerName]++;
                                if (self.loadCounters[childLayerName] == parentFeatureCount) {
                                    onChildLayerLoadEnd(childLayer, parentFeatureCount);
                                }
                                childOlLayer = null;
                                childLayer = null;
                            };

                            //Get child-features for current parentFeatureID
                            var childDataSource = childLayer.dataSource;
                            var parentQueryFilter = childDataSource.parentIDField + " = '" + parentFeatureID + "'";
                            //For the sake of backward compatibility
                            var childQueryFilter = null;
                            var qf = childDataSource.queryFilter;
                            if (qf != null && qf.length > 0) {
                                var pqf = childDataSource.parentIDField + " = " + parentFeatureID;
                                if (qf.indexOf(pqf) >= 0) {
                                    var qfSubstr = qf.substring(qf.indexOf(pqf) + pqf.length);
                                    qfSubstr = qfSubstr.substring(0, qfSubstr.indexOf(')'));
                                    childQueryFilter = parentQueryFilter + qfSubstr;
                                }
                            }
                            if (childQueryFilter == null) {
                                childQueryFilter = mxn.DataSource.prependToQueryFilter(childDataSource, parentQueryFilter);
                            }
                            childDataSource.getFeatures(onRequestSuccess, childLayer.onLoadError, { 'queryFilter': childQueryFilter }, self.enableCaching);
                            childDataSource = null;
                        }
                        else {
                            //Parent feature not visible. 
                            if (self.cache[parentFeatureID][childLayerName].renderedOnMap) {
                                //Remove child features from map if present
                                var childFeaturesToRemove = childOlLayer.getFeaturesByAttribute(childLayer.dataSource.parentIDField, parentFeatureID);
                                childOlLayer.removeFeatures(childFeaturesToRemove, { 'silent': true });
                                delete self.cache[parentFeatureID][childLayerName].renderedOnMap;
                                childFeaturesToRemove = null;
                            }
                            self.loadCounters[childLayerName]++;
                            if (self.loadCounters[childLayerName] == parentFeatureCount) {
                                onChildLayerLoadEnd(childLayer, parentFeatureCount);
                            }
                        }
                        childOlLayer = null;
                        childLayer = null;
                    }
                    catch (e) {
                        try { if (childLayer.onLoadError) childLayer.onLoadError(e.message, 101); } catch (e) { }
                    }
                };

                var renderLayerData = function(newFeatures) {
                    var olLayer = self.proprietary_layer;
                    if (newFeatures && newFeatures.length > 0) {
                        //Add features to layer
                        olLayer.addFeatures(newFeatures, { 'silent': true });
                    }

                    //Apply display-thresholds
                    applyDisplayThresholds({ 'features': olLayer.features });

                    //Render child-layers
                    if (!self.getChildLayer() || olLayer.features.length == 0) {
                        onLayerLoadEnd();
                    }
                    else {
                        //Initialise load-counters for child-layers. 
                        //Note: This load-counter will later increase when we render child-data for each parent-feature
                        for (var childLayerName in self.childLayers) {
                            self.loadCounters[childLayerName] = 0;
                        }

                        //Render child-data for each parent-feature
                        var parentOlFeatures = olLayer.features;
                        for (var idx = 0; idx < parentOlFeatures.length; idx++) {
                            var parentOlFeature = parentOlFeatures[idx];
                            var parentOnScreen = self.zoomToLayer == true || onScreen(parentOlFeature);
                            for (var childLayerName in self.childLayers) {
                                renderChildLayer(childLayerName, parentOlFeature, parentOnScreen, parentOlFeatures.length);
                            }
                            parentOlFeature = null;
                        }
                    }
                    parentOlFeatures = null;
                    olLayer = null;
                };

                var requestAndRenderLayerData = function() {
                    var onRequestSuccess = function(features) {
                        //Render layer data on map
                        if (!features) features = [];
                        renderLayerData(features);
                        //Remove zooming-panning if feature-count = 1
                        var olLayer = self.proprietary_layer;
                        if (olLayer.features.length == 1) {
                            olLayer.events.un({
                                "moveend": onExtentChangedWithDelay,
                                scope: self
                            });
                        }
                        olLayer = null;
                        features = null;
                    };

                    //Get data from server
                    var queryBounds = (self.applyLayerBounds == true) ? self.getBounds() : undefined;
                    self.dataSource.getFeatures(onRequestSuccess, self.onLoadError, { 'queryBounds': queryBounds }, self.enableCaching);
                };

                var onExtentChanged = function() {
                    try {
                        if (self.dataSource && self.dataSource.layerName) {
                            if (self.isFirstLoad == true || self.applyLayerBounds == true) {
                                //Request for data and render on map
                                requestAndRenderLayerData();
                            }
                            else {
                                //Re-render data on map
                                renderLayerData();
                            }
                        }
                        else {
                            applyDisplayThresholds(e.object);
                            try { if (self.onZoomPanEnd) self.onZoomPanEnd(); } catch (e) { }
                        }
                    }
                    catch (e) {
                        try { if (self.onLoadError) self.onLoadError(e.message, 101); } catch (e) { }
                    }
                };

                var onExtentChangedWithDelay = function(e) {
                    //Add some delay to avoid drawing on fast zoom-pans.
                    var uniqueID = 'draw_' + self.name;
                    if (window[uniqueID]) {
                        window.clearTimeout(window[uniqueID]);
                    }
                    window[uniqueID] = window.setTimeout(function() {
                        window[uniqueID] = undefined;
                        onExtentChanged();
                    }, 500);
                };

                //Apply this only for parent-layers
                if (!this.parentLayer && ((this.dataSource && this.dataSource.layerName) || this.clusterDisplayThreshold || this.polygonDisplayThreshold)) {
                    olLayer.events.on({
                        "moveend": onExtentChangedWithDelay,
                        scope: this
                    });
                    //window.setTimeout(function () { onExtentChanged(true); }, 0);
                }
                if (this.isAnimated == true) olLayer.transitionEffect = 'resize';
                break;
            default:
                alert('This  layer type is not supported currently in OpenLayers api');
                break;
        }

        if (this.isVisible == false) olLayer.visibility = false;
        if (this.displayInLegend == false) olLayer.displayInLayerSwitcher = false;
        this.proprietary_layer = olLayer;
        olLayer = null;
        return this.proprietary_layer;
    };

    Layer.prototype.getChildLayer = function(name) {
        var childLayer = null;
        for (var childLayerName in this.childLayers) {
            if (!name) name = childLayerName;
            if (name == childLayerName) {
                childLayer = this.childLayers[childLayerName];
                break;
            }
        }
        return childLayer;
    };

    Layer.prototype.addFeature = function(feature, zoomToFeature) {
        if (!feature || (!(feature instanceof mxn.Feature))) return;
        feature.api = this.api;
        feature.map = this.map;
        feature.layerName = this.name;
        var olfeature = feature.toOpenLayers();
        feature.proprietary_feature = olfeature;
        this.proprietary_layer.addFeatures([olfeature]);
        if (zoomToFeature) {
            this.proprietary_layer.map.zoomToExtent(olfeature.geometry.getBounds());
        }
        var id = olfeature.id;
        olfeature = null;
        return id;
    }

    Layer.prototype.addFeatures = function(features) {
        var featureIDs = [];
        var olFeatures = [];
        if (!features) return;
        if (!(features instanceof Array)) features = [features];
        for (var idx = 0; idx < features.length; idx++) {
            var feature = features[idx];
            if (feature && (feature instanceof mxn.Feature)) {
                feature.api = this.api;
                feature.map = this.proprietary_layer.map;
                feature.layerName = this.name;
                var olfeature = feature.toOpenLayers();
                feature.proprietary_feature = olfeature;
                featureIDs.push(olfeature.id);
                olFeatures.push(olfeature);
                olfeature = null;
            }
            feature = null;
        }
        this.proprietary_layer.addFeatures(olFeatures);
        olFeatures = null;
        return featureIDs;
    }

    Layer.prototype.addChildLayer = function(childLayer, childLayerName) {
        if (!(childLayer instanceof mxn.Layer)) return;
        childLayer.parentLayer = this;
        this.childLayers[childLayerName] = childLayer;
    }

    Layer.prototype.setParentLayer = function(parentLayer) {
        if (!(parentLayer instanceof mxn.Layer)) return;
        this.parentLayer = parentLayer;
        parentLayer.childLayers[this.name] = this;
    };

    Layer.prototype.getDisplayAtCurrentScale = function() {
        if (!this.proprietary_layer || !this.proprietary_layer.map) return false;
        var style = this.styleMap['default'];
        var rules = style.rules;
        if (!rules || rules.length == 0) return true;
        var scale = this.proprietary_layer.map.getScale();
        var anyRuleVisible = false;
        for (var idx = 0; idx < rules.length; idx++) {
            var rule = rules[idx];
            if (rule.minScale || rule.maxScale) {
                if (scale >= rule.minScale && scale <= rule.maxScale) {
                    anyRuleVisible = true;
                    break;
                }
            }
            else {
                anyRuleVisible = true;
                break;
            }
            rule = null;
        }
        isVisible = anyRuleVisible;
        rules = null;
        style = null;
        return isVisible;
    };

    Layer.prototype.getVisibility = function() {
        if (!this.proprietary_layer || !this.proprietary_layer.map) return false;
        return this.proprietary_layer.getVisibility();
    };

    Layer.prototype.show = function(name) {
        var olLayer = this.proprietary_layer;
        olLayer.setVisibility(true);
        olLayer = null;
    };

    Layer.prototype.hide = function(name) {
        var olLayer = this.proprietary_layer;
        olLayer.setVisibility(false);
        olLayer = null;
    };

    //////////////////////////////
    //
    //  IndoorMapOverlay
    //
    ///////////////////////////////

    /**
    * IndoorMapOverlay creates an Indoor map overlay. This can be  overlay or a Micello map.
    * @constructor
    */
    function IndoorMapOverlay(options) {
        this.type = 'openlayers'; //or micello

        this.onLoadEnd;
        this.onZoomPanEnd;
        this.onLoadError;

        //Openlayers params
        this.buildingLayerKeyInConfig = 'Buildings';
        this.buildingLayer;
        this.buildingFilter;
        this.zoomToOverlay;
        this.restrictZoomToBounds;
        this.rotateToFitScreen;
        this.enableCaching;

        //Openlayers and Micello params
        this.floorIndex = 0;

        //Micello params
        this.divID;
        this.micelloKey;
        this.communityID;
        this.drawingID;
        this.levelID;
        this.mapData;

        OpenLayers.Util.extend(this, options);
        this.floorCache = {};
        this.floorIndexField = 'floor_index';

        //Load indoor map
        this.load = function() {
            switch (this.type.toLowerCase()) {
                case 'openlayers':
                    if (!this.buildingLayer) {
                        this.buildingLayer = Layer.createFromConfig(this.buildingLayerKeyInConfig);
                    }
                    if (this.buildingFilter && this.buildingLayer.dataSource) {
                        this.buildingLayer.dataSource.queryFilter = this.buildingFilter;
                    }
                    if (this.floorIndex != undefined) {
                        for (var childLayerName in this.buildingLayer.childLayers) {
                            var childLayer = this.buildingLayer.childLayers[childLayerName];
                            if (childLayer.dataSource && childLayer.dataSource.outputFields &&
                                        childLayer.dataSource.outputFields.split(',').indexOf(this.floorIndexField) >= 0) {
                                var floorIndexFilter = {}; floorIndexFilter[this.floorIndexField] = this.floorIndex;
                                childLayer.dataSource.originalQueryFilter = childLayer.dataSource.queryFilter;
                                childLayer.dataSource.queryFilter = mxn.DataSource.prependToQueryFilter(childLayer.dataSource, floorIndexFilter);
                            }
                            childLayer = null;
                        }
                    }
                    if (this.zoomToOverlay != undefined) {
                        if (this.buildingLayer.zoomToLayer == undefined) {
                            this.buildingLayer.zoomToLayer = this.zoomToOverlay;
                        }
                        for (var childLayerName in this.buildingLayer.childLayers) {
                            var childLayer = this.buildingLayer.childLayers[childLayerName];
                            if (childLayer.zoomToLayer == undefined) {
                                childLayer.zoomToLayer = this.zoomToOverlay;
                            }
                            childLayer = null;
                        }
                    }

                    if (this.rotateToFitScreen != undefined) {
                        if (this.buildingLayer.rotateToFitScreen == undefined) {
                            this.buildingLayer.rotateToFitScreen = this.rotateToFitScreen;
                        }
                    }

                    if (this.enableCaching != undefined) {
                        if (this.buildingLayer.enableCaching == undefined) {
                            this.buildingLayer.enableCaching = this.enableCaching;
                        }
                    }

                    if (this.ratioToMap != undefined) {
                        if (this.buildingLayer.layerRatioToMap == undefined) {
                            this.buildingLayer.layerRatioToMap = this.ratioToMap;
                        }
                        for (var childLayerName in this.buildingLayer.childLayers) {
                            var childLayer = this.buildingLayer.childLayers[childLayerName];
                            if (childLayer.layerRatioToMap == undefined) {
                                childLayer.layerRatioToMap = this.ratioToMap;
                            }
                            childLayer = null;
                        }
                    }
                    if (this.restrictZoomToBounds != undefined) {
                        if (this.buildingLayer.restrictZoomToBounds == undefined) {
                            this.buildingLayer.restrictZoomToBounds = this.restrictZoomToBounds;
                        }
                        for (var childLayerName in this.buildingLayer.childLayers) {
                            var childLayer = this.buildingLayer.childLayers[childLayerName];
                            if (childLayer.restrictZoomToBounds == undefined) {
                                childLayer.restrictZoomToBounds = this.restrictZoomToBounds;
                            }
                            childLayer = null;
                        }
                    }

                    //Call indoor-map load-end after all layers have been loaded
                    if (this.onLoadEnd) {
                        this.buildingLayer.onLoadEnd = this.onLoadEnd;
                    }

                    //Call indoor-map zoom-end after all layers have been zoomed
                    if (this.onZoomPanEnd) {
                        this.buildingLayer.onZoomPanEnd = this.onZoomPanEnd;
                    }

                    //Call indoor-map load-error if any layer gets an error
                    if (this.onLoadError) {
                        this.buildingLayer.onLoadError = this.onLoadError;
                        for (var childLayerName in this.buildingLayer.childLayers) {
                            this.buildingLayer.childLayers[childLayerName].onLoadError = this.onLoadError;
                        }
                    }
                    break;
                case 'micello':
                    var indoorMap = this;
                    var micelloDiv = document.getElementById(this.divID);
                    if (micelloDiv == null && this.onLoadError) { this.onLoadError("Div with id " + this.divID + " not found."); return; }
                    var mapChanged = function(e) {
                        if (e.comLoad && e.drawChange) {
                            e.comLoad = 0;
                            if (mapstractionObj) mapstractionObj.maps['micello'] = indoorMap.mapData;
                            indoorMap.mapData.mapChanged = function(e) { };
                            var mapDrawing = indoorMap.mapData.getCurrentDrawing();
                            if (indoorMap.floorIndex && indoorMap.floorIndex < mapDrawing.l.length) {
                                indoorMap.mapData.setLevel(mapDrawing.l[indoorMap.floorIndex]);
                            }
                            if (mapstractionObj) mapstractionObj.switchApi('micello');
                            if (indoorMap.onBuildingDataChange) indoorMap.onBuildingDataChange();
                        }
                    };

                    if (!this.mapData || micello.maps.key != this.micelloKey) {
                        if (micelloDiv) micelloDiv.innerHTML = '';
                        var mapInit = function() {
                            var mapControl = new micello.maps.MapControl(micelloDiv.id);
                            indoorMap.mapData = mapControl.getMapData();
                            indoorMap.mapData.mapChanged = mapChanged;
                            indoorMap.mapData.loadCommunity(indoorMap.communityID, indoorMap.drawingID, indoorMap.levelID);
                        }

                        micello.maps.init(this.micelloKey, mapInit);
                    }
                    else {
                        micelloDiv.style.display = '';
                        this.mapData.mapChanged = mapChanged;
                        this.mapData.loadCommunity(this.communityID, this.drawingID, this.levelID);
                    }
                    break;
                default:
                    break;
            }
        };

        this.load();
    };

    IndoorMapOverlay.prototype.getBuildingLayer = function() {
        return this.buildingLayer;
    };

    IndoorMapOverlay.prototype.getInfo = function(visibleOnly) {
        var buildingsInfo = [];
        var bldgLayer = this.buildingLayer;
        var olBldgLayer = this.buildingLayer.proprietary_layer;
        var detailLayer = this.buildingLayer.getChildLayer();
        var olDetailLayer = detailLayer.proprietary_layer;
        var olBldgFeatures = olBldgLayer.features;
        var getTopLeftCorner = function(bounds) {
            var lat = (bounds.ne.lat > bounds.sw.lat) ? bounds.ne.lat : bounds.sw.lat;
            var lon = (bounds.ne.lon < bounds.sw.lon) ? bounds.ne.lon : bounds.sw.lon;
            var topLeftLatLon = new mxn.LatLonPoint(lat, lon);
            return bldgLayer.getPixelFromLatLon(topLeftLatLon);
        };
        var layerTopLeft = getTopLeftCorner(bldgLayer.getBounds());
        for (var idx = 0; idx < olBldgFeatures.length; idx++) {
            var olBldgFeature = olBldgFeatures[idx];
            if (!olBldgFeature.childFeatures) {
                var isBldgVisible = olBldgFeature.onScreen(true);
                if (!visibleOnly || (visibleOnly && isBldgVisible)) {
                    var buildingInfo = olBldgFeature.attributes;
                    buildingInfo.bounds = ABoundingBox.fromOpenLayers(olBldgFeature.geometry.getBounds());
                    var buildingTopLeft = getTopLeftCorner(buildingInfo.bounds);
                    if (buildingTopLeft[0] < 0) buildingTopLeft[0] = layerTopLeft[0];
                    if (buildingTopLeft[1] < 0) buildingTopLeft[1] = layerTopLeft[1];
                    buildingInfo.topLeft = buildingTopLeft;
                    var buildingGeom = olBldgFeature.data['__originalgeom'] || olBldgFeature.geometry;
                    buildingInfo.geometry = buildingGeom.clone().transform(new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection), new OpenLayers.Projection(mapstractionConfig.mapOptions.displayProjection)).toString();
                    buildingInfo.centroid = mxn.LatLonPoint.fromOpenLayers(buildingGeom.getCentroid());
                    var floors = olBldgFeature.attributes['floors'];
                    if (!floors) floors = 1; //single storeyed
                    var floorNames = olBldgFeature.attributes['floor_names'];
                    if (floorNames) floorNames = floorNames.split(',');
                    var floorArray = [];
                    var selectedFloorIndex = this.getCurrentFloorIndex(buildingInfo[this.buildingLayer.dataSource.idField]);
                    for (var jdx = 0; jdx < floors; jdx++) {
                        var floorItem = {};
                        floorItem['name'] = (floorNames) ? floorNames[jdx] : eval(jdx + 1);
                        floorItem[this.floorIndexField] = jdx;
                        floorItem['isActive'] = (selectedFloorIndex == jdx) ? true : false;
                        floorArray.push(floorItem);
                    }
                    buildingInfo.floorList = floorArray;
                    buildingInfo.isVisible = isBldgVisible;
                    buildingInfo.areDetailsVisible = detailLayer.getVisibility() && detailLayer.getDisplayAtCurrentScale();
                    buildingsInfo.push(buildingInfo);
                }
            }
            olBldgFeature = null;
        }
        olBldgFeatures = null;
        olBldgLayer = null;
        detailLayer = null;
        olDetailLayer = null;
        bldgLayer = null;
        return buildingsInfo;
    };

    IndoorMapOverlay.prototype.getBounds = function() {
        return this.buildingLayer.getBounds();
    };

    IndoorMapOverlay.prototype.getDataBounds = function() {
        return this.buildingLayer.getDataBounds();
    };

    IndoorMapOverlay.prototype.getCurrentFloorIndex = function(buildingID) {
        if (!this.buildingLayer) return -1;
        var floorIndexField = this.floorIndexField;
        for (var childLayerName in this.buildingLayer.childLayers) {
            if (this.buildingLayer.cache[buildingID]) {
                var childCache = this.buildingLayer.cache[buildingID][childLayerName];
                if (childCache.renderedOnMap) {
                    var childLayer = this.buildingLayer.childLayers[childLayerName];
                    var childOLLayer = childLayer.proprietary_layer;
                    var features = childOLLayer.getFeaturesByAttribute(childLayer.dataSource.parentIDField, buildingID);
                    if (features.length > 0) {
                        return features[0].attributes[floorIndexField];
                    }
                    childLayer = null;
                    childOLLayer = null;
                    features = null;
                }
                childCache = null;
            }
        }
        if (this.floorIndex != undefined) return this.floorIndex;
        return 0;
    };

    IndoorMapOverlay.prototype.switchFloor = function(buildingID, floorIndex, onSuccess, onError) {
        try {
            //Get building-feature for given building-id
            if (!this.buildingLayer) return;
            var floorIndexField = this.floorIndexField;
            var idField = this.buildingLayer.dataSource.idField;
            var buildingFeatures = this.buildingLayer.getFeaturesByAttribute(idField, buildingID, { 'exactMatch': true, 'maxCount': 1 });
            if (buildingFeatures.length == 0) {
                onError('Building with id ' + buildingID + ' not found', 107);
                return;
            }
            buildingFeatures = null;

            //Get total child-layer count where floor will be changed.
            var childLayerCount = 0;
            for (var childLayerName in this.buildingLayer.childLayers) {
                var childDataSource = this.buildingLayer.childLayers[childLayerName].dataSource;
                if (childDataSource && childDataSource.outputFields &&
                                        childDataSource.outputFields.split(',').indexOf(this.floorIndexField) >= 0) {
                    childLayerCount++;
                }
                childDataSource = null;
            }

            var loadCounter = 0;
            var switchFloorForChildLayer = function(childLayerName, buildingLayer, floorIndexField) {
                //Get child-layer
                var childLayer = buildingLayer.childLayers[childLayerName];

                //Remove existing child-features from map for given building-id
                if (buildingLayer.cache[buildingID][childLayerName].renderedOnMap) {
                    childLayer.removeFeaturesByAttribute(childLayer.dataSource.parentIDField, buildingID);
                    delete buildingLayer.cache[buildingID][childLayerName].renderedOnMap;
                }

                //Get child-features for given building-id and floorIndex
                var childDataSource = childLayer.dataSource;
                if (childDataSource && childDataSource.outputFields &&
                                        childDataSource.outputFields.split(',').indexOf(floorIndexField) >= 0) {
                    //Append floor-index filter to original child-layer query-filter
                    childDataSource.queryFilter = childLayer.dataSource.originalQueryFilter;
                    var floorIndexFilter = {}; floorIndexFilter[floorIndexField] = floorIndex;
                    childDataSource.queryFilter = mxn.DataSource.prependToQueryFilter(childDataSource, floorIndexFilter);

                    //Append building-id
                    var parentQueryFilter = childDataSource.parentIDField + " = '" + buildingID + "'";
                    var childQueryFilter = mxn.DataSource.prependToQueryFilter(childDataSource, parentQueryFilter);

                    var addFeatures = function(newFeatures) {
                        try {
                            //Add child-features to map
                            if (newFeatures && newFeatures.length > 0) {
                                var childOlLayer = buildingLayer.childLayers[childLayerName].proprietary_layer;
                                childOlLayer.addFeatures(newFeatures, { 'silent': true });
                                childOlLayer = null;
                            }

                            //Update cache
                            buildingLayer.cache[buildingID][childLayerName].renderedOnMap = true;

                            //Check if all layers have got loaded
                            loadCounter++;
                            if (loadCounter == childLayerCount) {
                                if (onSuccess) onSuccess();
                            }
                            newFeatures = null;
                        }
                        catch (e) {
                            if (onError) onError(e.message, 101);
                            newFeatures = null;
                        }
                    }

                    //Get child-features
                    childDataSource.getFeatures(addFeatures, onError, { 'queryFilter': childQueryFilter }, buildingLayer.enableCaching);
                }
                else {
                    loadCounter++;
                    if (loadCounter == childLayerCounter) {
                        if (onSuccess) onSuccess();
                    }
                }
                childDataSource = null;
                childLayer = null;
            };

            for (var childLayerName in this.buildingLayer.childLayers) {
                switchFloorForChildLayer(childLayerName, this.buildingLayer, this.floorIndexField);
            }
        }
        catch (e) {
            if (onError) onError(e.message, 101);
        }
    };

    //////////////////////////////
    //
    //  Marker
    //
    ///////////////////////////////

    /**
    * Marker create's a new marker pin
    * @param {LatLonPoint} point the point on the map where the marker should go
    * @constructor
    */
    function Marker(point) {
        this.location = point;
        this.proprietary_marker = null;
        this.attributes = {};
        this.onclick = function() { };
        this.ondoubleclick = function() { };
        this.id = "mspin-" + new Date().getTime() + '-' + (Math.floor(Math.random() * Math.pow(2, 16)));
        this.api = 'openlayers';
        this.map = null;
        this.duplicateEventTolerance = 300;
        this.clickTimer = null;
        var me = this;

        this.toOpenLayers = function() {
            var size, anchor, icon;
            if (this.iconSize) {
                size = new OpenLayers.Size(this.iconSize[0], this.iconSize[1]);
            }
            else {
                size = new OpenLayers.Size(21, 25);
            }

            if (this.iconAnchor) {
                anchor = new OpenLayers.Pixel(this.iconAnchor[0], this.iconAnchor[1]);
            }
            else {
                // FIXME: hard-coding the anchor point
                anchor = undefined;
            }
            if (this.iconUrl) {
                icon = new OpenLayers.Icon(this.iconUrl, size, anchor);
            }
            else {
                icon = new OpenLayers.Icon('http://openlayers.org/dev/img/marker-gold.png', size, anchor);
            }
            var olPoint = this.location.toOpenLayers();
            var olMarker = new OpenLayers.Marker(olPoint, icon);
            var theMarker = this;

            if (theMarker.onclick || theMarker.ondoubleclick) {
                olMarker.events.register("click", olMarker, function(e) {
                    if (theMarker.isDoubleClick(e.clientX, e.clientY)) {
                        if (theMarker.clickTimer) window.clearTimeout(theMarker.clickTimer);
                        if (theMarker.ondoubleclick) theMarker.ondoubleclick([e.clientX, e.clientY]);
                    }
                    else {
                        var onclickfunction = function() {
                            if (theMarker.onclick) theMarker.onclick([e.clientX, e.clientY]);
                            if (theMarker.clickTimer) theMarker.clickTimer = null;
                        };
                        theMarker.clickTimer = window.setTimeout(onclickfunction, theMarker.duplicateEventTolerance);
                    }
                });
            }

            if (this.infoBubble) {
                olMarker.events.register("click", olMarker, function(e) {
                    var popup = new OpenLayers.Popup.FramedCloud(
                        "popup",
                        olPoint,
                        null,
                        theMarker.infoBubble,
                        null,
                        true
                    );
                    popup.panMapIfOutOfView = true;
                    popup.autoSize = true;
                    theMarker.proprietary_marker.popup = popup;
                    theMarker.map.addPopup(popup);
                    popup = null;
                });
            }
            olMarker.infoBubble = this.infoBubble;
            this.proprietary_marker = olMarker;
            return olMarker;
        };

        this.toMicello = function() {
            var icon = {};
            if (this.iconUrl) {
                icon.src = this.iconUrl;
            }
            else {
                icon.src = 'http://openlayers.org/dev/img/marker-gold.png';
            }

            if (this.iconSize) {
                icon.ox = this.iconSize[0];
                icon.oy = this.iconSize[1];
            }
            else {
                icon.ox = 21;
                icon.oy = 25;
            }

            var currLevelID = this.map.getCurrentLevel().id;
            var mxy = this.map.latLonToMxy(this.location.lat, this.location.lng);
            var overlay = { "mx": mxy[0] + icon.ox, "my": mxy[1] + icon.oy, "lid": currLevelID,
                "mt": micello.maps.markertype.IMAGE, "mr": icon,
                "idat": this.infoBubble
            };
            return overlay;
        };

        this.prevClick = { clickTime: null, x: null, y: null };
        this.isDoubleClick = function(x, y) {
            var currTime = new Date().getTime();
            if ((currTime - me.prevClick.clickTime < me.duplicateEventTolerance) && (me.prevClick.x == x && me.prevClick.y == y)) {
                return true;
            }
            else {
                me.prevClick.clickTime = new Date().getTime();
                me.prevClick.x = x;
                me.prevClick.y = y;
                return false;
            }
        }
    }

    Marker.prototype.setOnClick = function(clickEvent) {
        this.onclick = clickEvent;
    };

    Marker.prototype.setOnDoubleClick = function(doubleClickEvent) {
        this.ondoubleclick = doubleClickEvent;
    };

    Marker.prototype.setLocation = function(location) {
        this.location = location;
    };

    Marker.prototype.getLocation = function() {
        return this.location;
    };


    /**
    * setInfoBubble sets the html/text content for a bubble popup for a marker
    * @param {String} infoBubble the html/text you want displayed
    */
    Marker.prototype.setInfoBubble = function(infoBubble) {
        this.infoBubble = infoBubble;
    };

    /**
    * setIcon sets the icon for a marker
    * @param {String} iconUrl The URL of the image you want to be the icon
    */
    Marker.prototype.setIcon = function(iconUrl, iconSize, iconAnchor) {
        this.iconUrl = iconUrl;
        if (iconSize) {
            this.iconSize = iconSize;
        }
        if (iconAnchor) {
            this.iconAnchor = iconAnchor;
        }
    };

    /**
    * setIconSize sets the size of the icon for a marker
    * @param {String} iconSize The array size in pixels of the marker image
    */
    Marker.prototype.setIconSize = function(iconSize) {
        if (iconSize) {
            this.iconSize = iconSize;
        }
    };

    /**
    * setIconAnchor sets the anchor point for a marker
    * @param {String} iconAnchor The array offset of the anchor point
    */
    Marker.prototype.setIconAnchor = function(iconAnchor) {
        if (iconAnchor) {
            this.iconAnchor = iconAnchor;
        }
    };

    /**
    * setShadowIcon sets the icon for a marker
    * @param {String} iconUrl The URL of the image you want to be the icon
    */
    Marker.prototype.setShadowIcon = function(iconShadowUrl, iconShadowSize) {
        this.iconShadowUrl = iconShadowUrl;
        if (iconShadowSize) {
            this.iconShadowSize = iconShadowSize;
        }
    };

    Marker.prototype.setHoverIcon = function(hoverIconUrl) {
        this.hoverIconUrl = hoverIconUrl;
    };

    /**
    * setDraggable sets the draggable state of the marker
    * @param {Bool} draggable set to true if marker should be draggable by the user
    */
    Marker.prototype.setDraggable = function(draggable) {
        this.draggable = draggable;
    };

    /**
    * setHover sets that the marker info is displayed on hover
    * @param {Bool} hover set to true if marker should display info on hover
    */
    Marker.prototype.setHover = function(hover) {
        this.hover = hover;
    };

    /**
    * Markers are grouped up by this name. declutterGroup makes use of this.
    */
    Marker.prototype.setGroupName = function(sGrpName) {
        this.groupName = sGrpName;
    };

    Marker.prototype.setAttributes = function(attributes) {
        this.attributes = attributes;
    };


    /**
    * setAttribute: set an arbitrary key/value pair on a marker
    * @arg(String) key
    * @arg value
    */
    Marker.prototype.setAttribute = function(key, value) {
        this.attributes[key] = value;
    };

    /**
    * getAttribute: gets the value of "key"
    * @arg(String) key
    * @returns value
    */
    Marker.prototype.getAttribute = function(key) {
        return this.attributes[key];
    };

    //////////////////////////////
    //
    //  OpenLayers Customizations
    //
    ///////////////////////////////
    OpenLayers.Renderer.SVG.prototype.drawText = function(featureId, style, location) {
        var drawOutline = (!!style.labelOutlineWidth);
        // First draw text in halo color and size and overlay the
        // normal text afterwards
        if (drawOutline) {
            var outlineStyle = OpenLayers.Util.extend({}, style);
            outlineStyle.fontColor = outlineStyle.labelOutlineColor;
            outlineStyle.fontStrokeColor = outlineStyle.labelOutlineColor;
            outlineStyle.fontStrokeWidth = style.labelOutlineWidth;
            delete outlineStyle.labelOutlineWidth;
            this.drawText(featureId, outlineStyle, location);
            outlineStyle = null;
        }

        var resolution = this.getResolution();

        var x = ((location.x - this.featureDx) / resolution + this.left);
        var y = (location.y / resolution - this.top);

        var suffix = (drawOutline) ? this.LABEL_OUTLINE_SUFFIX : this.LABEL_ID_SUFFIX;
        var label = this.nodeFactory(featureId + suffix, "text");

        label.setAttributeNS(null, "x", x);
        label.setAttributeNS(null, "y", -y);

        if (style.angle || style.angle == 0) {
            var rotate = 'rotate(' + style.angle + ',' + x + "," + -y + ')';
            label.setAttributeNS(null, "transform", rotate);
        }
        else {
            label.removeAttributeNS(null, "transform");
        }

        if (style.fontColor) {
            label.setAttributeNS(null, "fill", style.fontColor);
        }
        if (style.fontStrokeColor) {
            label.setAttributeNS(null, "stroke", style.fontStrokeColor);
        }
        if (style.fontStrokeWidth) {
            label.setAttributeNS(null, "stroke-width", style.fontStrokeWidth);
        }
        if (style.fontOpacity) {
            label.setAttributeNS(null, "opacity", style.fontOpacity);
        }
        if (style.fontFamily) {
            label.setAttributeNS(null, "font-family", style.fontFamily);
        }
        if (style.fontSize) {
            label.setAttributeNS(null, "font-size", style.fontSize);
        }
        if (style.fontWeight) {
            label.setAttributeNS(null, "font-weight", style.fontWeight);
        }
        if (style.fontStyle) {
            label.setAttributeNS(null, "font-style", style.fontStyle);
        }
        if (style.labelSelect === true) {
            label.setAttributeNS(null, "pointer-events", "visible");
            label._featureId = featureId;
        } else {
            label.setAttributeNS(null, "pointer-events", "none");
        }
        var align = style.labelAlign || OpenLayers.Renderer.defaultSymbolizer.labelAlign;
        label.setAttributeNS(null, "text-anchor",
            OpenLayers.Renderer.SVG.LABEL_ALIGN[align[0]] || "middle");

        if (OpenLayers.IS_GECKO === true) {
            label.setAttributeNS(null, "dominant-baseline",
                OpenLayers.Renderer.SVG.LABEL_ALIGN[align[1]] || "central");
        }

        var labelRows = style.label.split('\n');
        var numRows = labelRows.length;
        while (label.childNodes.length > numRows) {
            label.removeChild(label.lastChild);
        }
        for (var i = 0; i < numRows; i++) {
            var tspan = this.nodeFactory(featureId + suffix + "_tspan_" + i, "tspan");
            if (style.labelSelect === true) {
                tspan._featureId = featureId;
                tspan._geometry = location;
                tspan._geometryClass = location.CLASS_NAME;
            }
            if (OpenLayers.IS_GECKO === false) {
                tspan.setAttributeNS(null, "baseline-shift",
                    OpenLayers.Renderer.SVG.LABEL_VSHIFT[align[1]] || "-35%");
            }
            tspan.setAttribute("x", x);
            if (i == 0) {
                var vfactor = OpenLayers.Renderer.SVG.LABEL_VFACTOR[align[1]];
                if (vfactor == null) {
                    vfactor = -.5;
                }
                tspan.setAttribute("dy", (vfactor * (numRows - 1)) + "em");
            } else {
                tspan.setAttribute("dy", "1em");
            }
            tspan.textContent = (labelRows[i] === '') ? ' ' : labelRows[i];
            if (!tspan.parentNode) {
                label.appendChild(tspan);
            }
            tspan = null;
        }

        if (!label.parentNode) {
            this.textRoot.appendChild(label);
        }
        label = null;
    };

    OpenLayers.Layer.Vector.prototype.drawFeature = function(feature, style) {
        // don't try to draw the feature with the renderer if the layer is not 
        // drawn itself
        if (!this.drawn) {
            return;
        }
        if (typeof style != "object") {
            if (!style && feature.state === OpenLayers.State.DELETE) {
                style = "delete";
            }
            var renderIntent = style || feature.renderIntent;
            style = this.style;
            if (!style) {
                style = this.styleMap.createSymbolizer(feature, renderIntent);
            }
            if (style && feature.style) {
                for (var key in feature.style) {
                    style[key] = feature.style[key];
                }
            }
        }

        var drawn = this.renderer.drawFeature(feature, style);
        //TODO remove the check for null when we get rid of Renderer.SVG
        if (drawn === false || drawn === null) {
            this.unrenderedFeatures[feature.id] = feature;
        } else {
            delete this.unrenderedFeatures[feature.id];
        }
    };

    OpenLayers.Renderer.prototype.drawLabel = function(feature, style, rendered) {
        var renderer = this;
        var getGeomWidthInPixels = function(geomBounds) {
            var right = renderer.map.getPixelFromLonLat(new OpenLayers.LonLat(geomBounds.right, 0)).x;
            var left = renderer.map.getPixelFromLonLat(new OpenLayers.LonLat(geomBounds.left, 0)).x;
            return right - left;
        };

        var getGeomHeightInPixels = function(geomBounds) {
            var bottom = renderer.map.getPixelFromLonLat(new OpenLayers.LonLat(0, geomBounds.bottom)).y;
            var top = renderer.map.getPixelFromLonLat(new OpenLayers.LonLat(0, geomBounds.top)).y;
            return bottom - top;
        };

        var getMeasurementCanvas = function(textStyle) {
            if (renderer.canvas) {
                return renderer.canvas;
            }
            else {
                var canvasObj = document.getElementById('tempTextCanvas');
                if (!canvasObj) {
                    canvasObj = document.createElement('canvas');
                    canvasObj.id = 'tempTextCanvas';
                    renderer.map.viewPortDiv.appendChild(canvasObj);
                }
                var ctx = canvasObj.getContext("2d");
                var fontStyle = [textStyle.fontStyle ? textStyle.fontStyle : "normal",
                         "normal", // "font-variant" not supported
                         textStyle.fontWeight ? textStyle.fontWeight : "normal",
                         textStyle.fontSize ? textStyle.fontSize : "1em",
                         textStyle.fontFamily ? textStyle.fontFamily : "sans-serif"].join(" ");
                ctx.font = fontStyle;
                canvasObj = null;
                return ctx;
            }
        };

        var getLabelFromAttributes = function(text) {
            var attributes = feature.attributes;
            if (!text || text == null || text == "null" || text.trim().length == 0) {
                return null;
            }
            if (typeof text == "string" && text.indexOf("${") != -1) {
                //Get text-value from feature attributes
                text = OpenLayers.String.format(text, attributes, [feature, 'label']);
            }
            if (!text || text == null || text == "null" || text.trim().length == 0) {
                return null;
            }
            if (style.labelMinus) {
                text = text.replace(style.labelMinus, '');
                if (text.indexOf("0") == 0) text = text.substring(1);
            }
            return text.trim();
        };

        var replaceSpacesWithLineBreaks = function(text) {
            //Replace spaces with line-break
            var lengthLimit = (style.maxLabelLength) ? style.maxLabelLength : 15;
            if (text.length > lengthLimit) text = text.replace(/\ /g, '\n');
            return text;
        };

        var handleTextOverflow = function(styleClone, geomWidth, geomHeight) {
            var marginPercent = 0.3;
            geomWidth = geomWidth - marginPercent * geomWidth;
            geomHeight = geomHeight - marginPercent * geomHeight;
            if (!styleClone.fontSize) styleClone.fontSize = "10px";
            var overflowPolicy = styleClone.textOverflow;
            var text = styleClone.label;
            if (overflowPolicy == 'allow') {
                styleClone.label = text;
            }
            else if (!overflowPolicy || overflowPolicy == 'hide' || OpenLayers.String.numberRegEx.test(text)) {
                var canvas = getMeasurementCanvas(styleClone);
                var textDim = canvas.measureText(text);
                canvas = null;
                var textWidth = textDim.width;
                var textHeight = parseInt(styleClone.fontSize.replace("px", ""));
                if (geomWidth > textWidth && geomHeight > textHeight) {
                    styleClone.label = text;
                }
                else if (renderer instanceof OpenLayers.Renderer.SVG && geomHeight > textWidth && geomWidth > textHeight) {
                    styleClone.label = text;
                    styleClone.angle = 270;
                }
                else {

                    styleClone.label = null;
                }
            }
            else if (overflowPolicy == 'clip' || overflowPolicy == 'ellipsis') {
                while (1 == 1) {
                    if (text == null) {
                        styleClone.label = text;
                        return;
                    }
                    var canvas = getMeasurementCanvas(styleClone);
                    var textDim = canvas.measureText(text);
                    canvas = null;
                    var textWidth = textDim.width;
                    var textHeight = parseInt(styleClone.fontSize.replace("px", ""));
                    if (geomWidth > textWidth && geomHeight > textHeight) {
                        styleClone.label = text;
                        return;
                    }
                    else if (renderer instanceof OpenLayers.Renderer.SVG && geomHeight > textWidth && geomWidth > textHeight) {
                        styleClone.label = text;
                        styleClone.angle = 270;
                        return;
                    }
                    if (overflowPolicy == 'clip') {
                        if (text.length < 2) text = null;
                        text = text.substring(0, text.length - 2);
                    }
                    else {
                        if (text.length < 3) {
                            text = null;
                        }
                        else if (text.length == 3) {
                            text = text.substring(0, 1) + '.';
                        }
                        else if (text.length == 4) {
                            text = text.substring(0, 2) + '.';
                        }
                        else {
                            text = text.substring(0, text.length - 4) + '..';
                        }
                    }
                }
            }
        };

        var drawLabelForGeomComponent = function(geom, counter) {
            if (style.display != "none" && style.label && rendered !== false) {
                var styleClone = OpenLayers.Util.extend({}, style);
                styleClone.label = getLabelFromAttributes(styleClone.label);
                if (styleClone.label) {
                    //var centerLonLat = geomBounds.getCenterLonLat();
                    //var location = new OpenLayers.Geometry.Point(centerLonLat.lon, centerLonLat.lat);
                    var location = geom.getCentroid();
                    if (styleClone.labelXOffset || styleClone.labelYOffset) {
                        var xOffset = isNaN(styleClone.labelXOffset) ? 0 : styleClone.labelXOffset;
                        var yOffset = isNaN(styleClone.labelYOffset) ? 0 : styleClone.labelYOffset;
                        var res = renderer.getResolution();
                        location.move(xOffset * res, yOffset * res);
                    }
                    var geomBoundsLocal = geom.getBounds();
                    var geomWidth = getGeomWidthInPixels(geomBoundsLocal);
                    var geomHeight = getGeomHeightInPixels(geomBoundsLocal);
                    handleTextOverflow(styleClone, geomWidth, geomHeight);
                    if (styleClone.label) {
                        if (renderer instanceof OpenLayers.Renderer.SVG) {
                            renderer.drawText(feature.id + counter, styleClone, location);
                        }
                        else if (renderer instanceof OpenLayers.Renderer.Canvas) {
                            renderer.drawText(location, styleClone);
                        }
                    }
                    else if (renderer instanceof OpenLayers.Renderer.SVG) {
                        renderer.removeText(feature.id + counter);
                    }
                    location = null;
                }
                else if (renderer instanceof OpenLayers.Renderer.SVG) {
                    renderer.removeText(feature.id + counter);
                }
            }
            else if (renderer instanceof OpenLayers.Renderer.SVG) {
                renderer.removeText(feature.id + counter);
            }
        };

        var geomComponents = feature.geometry.components;
        if (!geomComponents) geomComponents = [feature.geometry];
        if (geomComponents) {
            for (var idx = 0; idx < geomComponents.length; idx++) {
                if (geomComponents[idx]) {
                    drawLabelForGeomComponent(geomComponents[idx], idx);
                }
            }
        }
        geomComponents = null;
        renderer = null;
    };

    /**
    1. put label on all geom-components
    2. put label at centerlonlat instead of centroid. Centroid doesnt work well for tilted and/or complex geometries
    3. put label after splitting 
    */
    OpenLayers.Renderer.prototype.drawFeature = function(feature, style) {
        var renderer = this;
        if (style == null) {
            style = feature.style;
        }
        if (feature.geometry) {
            var geomBounds = feature.geometry.getBounds();
            if (geomBounds) {
                var worldBounds;
                if (renderer.map.baseLayer && renderer.map.baseLayer.wrapDateLine) {
                    worldBounds = renderer.map.getMaxExtent();
                }
                if (!geomBounds.intersectsBounds(renderer.extent, { worldBounds: worldBounds })) {
                    style = { display: "none" };
                } else {
                    renderer.calculateFeatureDx(geomBounds, worldBounds);
                }
                var rendered = renderer.drawGeometry(feature.geometry, style, feature.id);
                this.drawLabel(feature, style, rendered);
                return rendered;
            }
        }
    };

    OpenLayers.Renderer.prototype.eraseFeatures = function(features) {
        if (!(OpenLayers.Util.isArray(features))) {
            features = [features];
        }
        for (var i = 0, len = features.length; i < len; ++i) {
            var feature = features[i];
            this.eraseGeometry(feature.geometry, feature.id);
            var geomComponents = feature.geometry.components;
            if (!geomComponents) geomComponents = [feature.geometry];
            if (geomComponents) {
                for (var idx = 0; idx < geomComponents.length; idx++) {
                    if (geomComponents[idx]) {
                        this.removeText(feature.id + idx);
                    }
                }
            }
            geomComponents = null;
        }
    };

    OpenLayers.Renderer.Canvas.prototype.setCanvasStyle = function(type, style) {
        if (type === "fill") {
            delete this.canvas.shadowColor;
            delete this.canvas.shadowOffsetX;
            delete this.canvas.shadowOffsetY;
            delete this.canvas.shadowBlur;
            if (style['shadowColor']) this.canvas.shadowColor = style['shadowColor'];
            if (style['shadowOffsetX']) this.canvas.shadowOffsetX = style['shadowOffsetX'];
            if (style['shadowOffsetY']) this.canvas.shadowOffsetY = style['shadowOffsetY'];
            if (style['shadowBlur']) this.canvas.shadowBlur = style['shadowBlur'];
            this.canvas.globalAlpha = style['fillOpacity'];
            this.canvas.fillStyle = style['fillColor'];
        } else if (type === "stroke") {
            this.canvas.globalAlpha = style['strokeOpacity'];
            this.canvas.strokeStyle = style['strokeColor'];
            this.canvas.lineWidth = style['strokeWidth'];
        } else {
            this.canvas.globalAlpha = 0;
            this.canvas.lineWidth = 1;
        }
    };

    OpenLayers.Renderer.Canvas.prototype.redraw = function() {
        if (!this.locked) {
            var height = this.root.height;
            var width = this.root.width;
            this.canvas.clearRect(0, 0, width, height);
            if (this.hitDetection) {
                this.hitContext.clearRect(0, 0, width, height);
            }
            var labelMap = [];
            var feature, geometry, style;
            var worldBounds = (this.map.baseLayer && this.map.baseLayer.wrapDateLine) && this.map.getMaxExtent();
            for (var id in this.features) {
                if (!this.features.hasOwnProperty(id)) { continue; }
                feature = this.features[id][0];
                geometry = feature.geometry;
                this.calculateFeatureDx(geometry.getBounds(), worldBounds);
                style = this.features[id][1];
                this.drawGeometry(geometry, style, feature.id);
                this.drawLabel(feature, style, true);
            }
            style = null;
            geometry = null;
            feature = null;
        }
    };

    //////////////////////////////
    //
    //  Vector Feature
    //
    ///////////////////////////////

    /**
    * Feature create's a new vector Feature
    * @constructor
    */
    function Feature(geometry) {
        this.geometry = geometry;
        this.proprietary_feature = null;
        this.id;
        this.api = 'openlayers';
        this.attributes = {};
        this.arePointsInMapProjection = true;
        this.layerName = null;
    }

    Feature.prototype.toOpenLayers = function() {
        var olfeature;
        var olpoints = [];
        var geometry;

        if (this.geometry) {
            if (this.geometry.indexOf('MULTIPOINT ((') > -1) {
                this.geometry = this.geometry.replace('MULTIPOINT ((', 'POINT (').replace('))', ')');
            }
            var options = { 'internalProjection':
                new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection),
                'externalProjection': new OpenLayers.Projection(mapstractionConfig.mapOptions.displayProjection)
            };

            var wktformat = new OpenLayers.Format.WKT(options);
            olfeature = wktformat.read(this.geometry);
        }
        else if (this.points) {
            for (var idx = 0; idx < this.points.length; idx++) {
                var point = this.points[idx];
                if (!(point instanceof LatLonPoint)) {
                    if (!(point instanceof Array)) point = point.replace('POINT', '').replace('(', '').replace(')', '').trim().split(' ');
                    point = new LatLonPoint(point[1], point[0]);
                }
                var olpoint = new OpenLayers.Geometry.Point(point.lon, point.lat);
                if (this.arePointsInMapProjection == undefined || this.arePointsInMapProjection == false) {
                    olpoint.transform(new OpenLayers.Projection(mapstractionConfig.mapOptions.displayProjection), new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection));
                }
                olpoints.push(olpoint);
                olpoint = null;
            }

            if (olpoints.length == 1) {
                geometry = olpoints[0];
            }
            else if (this.closed) {
                // a closed polygon
                geometry = new OpenLayers.Geometry.Polygon(new OpenLayers.Geometry.LinearRing(olpoints));

            } else {
                // a line
                geometry = new OpenLayers.Geometry.LineString(olpoints);
            }

            olfeature = new OpenLayers.Feature.Vector(geometry, null);
        }

        if (olfeature) {
            olfeature.attributes = this.attributes;
            if (this.style) {
                olfeature.style = this.style;
            }
        }
        geometry = null;
        olpoints = null;
        return olfeature;
    }

    Feature.prototype.toMicello = function() {
        var points = [];
        if (this.geometry) {
            if (this.geometry.indexOf('POLYGON') > -1 || this.geometry.indexOf('POINT') > -1) this.closed = true;
            var wkt = this.geometry;
            while (wkt.indexOf('(') > -1 || wkt.indexOf(')') > -1) {
                wkt = wkt.replace('(', '').replace(')', '');
            }
            wkt = wkt.replace('LINESTRING', '').replace('POLYGON', '').replace('POINT', '').trim();
            wkt = wkt.replace('MULTILINESTRING', '').replace('MULTIPOLYGON', '').replace('MULTIPOINT', '').trim();
            points = wkt.split(',');
            this.arePointsInMapProjection = false;
        }
        else if (this.points) {
            points = this.points;
        }

        if (points) {
            var mapDrawing = this.map.getCurrentDrawing();
            var micelloCoordsArray = [];
            for (var idx = 0; idx < points.length; idx++) {
                var m = (idx == 0) ? 0 : 1;
                var point = points[idx];
                if (!(point instanceof LatLonPoint)) {
                    if (!(point instanceof Array)) point = point.replace('POINT', '').replace('(', '').replace(')', '').trim().split(' ');
                    point = new LatLonPoint(point[1], point[0]);
                }
                var micelloCoords = (!this.arePointsInMapProjection) ? this.map.latLonToMxy(point.lat, point.lon) : [point.lon, point.lat];
                if (((micelloCoords[0] > 0) && (micelloCoords[0] < mapDrawing.w)) && ((micelloCoords[1] > 0) && (micelloCoords[1] < mapDrawing.h))) {
                    micelloCoordsArray.push([m, micelloCoords[0], micelloCoords[1]]);
                }
            }
            if (this.closed) {
                micelloCoordsArray.push([4]);
            }

            var micelloGeom = {
                shp: micelloCoordsArray,
                gt: (this.closed) ? 2 : 1
            }
            mapDrawing = null;
            points = null;
            return micelloGeom;
        }
        points = null;
        return null;
    }

    Feature.fromMicello = function(micelloGeom, indoorMap) {
        if (!micelloGeom) return null;
        var msFeature = new Feature();
        msFeature.setAttribute('name', (micelloGeom.nm) ? micelloGeom.nm.replace(/[^a-zA-Z 0-9]+/g, '') : undefined);
        msFeature.setAttribute('type', micelloGeom.t);
        msFeature.setAttribute('level_index', indoorMap.getCurrentLevel().id);
        var comm = indoorMap.community;
        msFeature.setAttribute('map_name', comm.nm);
        msFeature.setAttribute('map_id', comm.cid);
        msFeature.layerName = (micelloGeom.anm) ? micelloGeom.anm : comm.cid;
        msFeature.proprietary_feature = micelloGeom;
        msFeature.map = indoorMap;
        msFeature.api = 'micello';
        return msFeature;
    };

    Feature.fromOpenLayers = function(olFeature, layer) {
        if (!olFeature) return null;
        var msFeature = new mxn.Feature();
        msFeature.id = olFeature.id;
        msFeature.setStyle(olFeature.style);
        msFeature.setAttributes(olFeature.attributes);
        msFeature.layerName = (olFeature.layer) ? olFeature.layer.name : undefined;
        msFeature.proprietary_feature = olFeature;
        var olGeom = olFeature.clone().geometry;
        olGeom.transform(new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection), new OpenLayers.Projection(mapstractionConfig.mapOptions.displayProjection));
        msFeature.setGeometry(olGeom.toString());
        olGeo = null;
        msFeature.map = (olFeature.layer) ? olFeature.layer.map : undefined;
        msFeature.api = 'openlayers';
        olGeom = null;
        return msFeature;
    };

    /**
    * setGeometry sets the WKT geometry
    * @param {String} WKT geometry
    */
    Feature.prototype.setGeometry = function(geometry) {
        this.geometry = geometry;
    };

    /**
    * setGeometry sets the WKT geometry
    * @param {String} WKT geometry
    */
    Feature.prototype.setPoints = function(pointList, arePointsInMapProjection) {
        this.points = pointList;
        this.arePointsInMapProjection = arePointsInMapProjection;
    };


    /**
    * setGeometry sets the WKT geometry
    * @param {String} WKT geometry
    */
    Feature.prototype.getPoints = function() {
        return this.points;
    };

    Feature.prototype.setAttributes = function(attributes) {
        this.attributes = attributes;
        var olFeature = this.proprietary_feature;
        if (olFeature && olFeature.layer) olFeature.layer.drawFeature(olFeature);
        olFeature = null;
    };

    Feature.prototype.setAttribute = function(key, value) {
        this.attributes[key] = value;
        var olFeature = this.proprietary_feature;
        if (olFeature && olFeature.layer) olFeature.layer.drawFeature(olFeature);
        olFeature = null;
    };

    Feature.prototype.setStyle = function(style) {
        this.style = style;
        //Update style if feature is already drawn on map
        var olFeature = this.proprietary_feature;
        if (olFeature && olFeature.layer) {
            if (olFeature.layer.renderer.CLASS_NAME = 'OpenLayers.Renderer.Canvas') {
                var tempLayerName = 'temp_' + olFeature.layer.name;
                var tempLayers = olFeature.layer.map.getLayersByName(tempLayerName);
                var tempLayer;
                if (tempLayers.length > 0) {
                    tempLayer = tempLayers[0];
                }
                else {
                    var vLayerOptions = {
                        renderers: ['SVG'],
                        isBaseLayer: false,
                        strategies: [],
                        styleMap: olFeature.layer.styleMap,
                        style: olFeature.layer.style
                    };
                    tempLayer = new OpenLayers.Layer.Vector(tempLayerName, vLayerOptions);
                    olFeature.layer.map.addLayer(tempLayer);
                }
                templLayers = null;
                vLayerOptions = null;
                var linkColumn = '__baseId';
                if (style != undefined && style != null) {
                    var tempFeature = new OpenLayers.Feature.Vector(olFeature.geometry.clone(), {}, style);
                    for (var key in olFeature.attributes) {
                        tempFeature.attributes[key] = olFeature.attributes[key];
                    }
                    tempFeature.attributes[linkColumn] = olFeature.id;
                    tempLayer.addFeatures([tempFeature], { 'silent': true });
                    tempFeature = null;
                }
                else {
                    var tempFeatures = tempLayer.getFeaturesByAttribute(linkColumn, olFeature.id);
                    for (var idx = 0; idx < tempFeatures.length; idx++) {
                        tempLayer.renderer.removeText(tempFeatures[idx].id + 0);
                    }

                    tempLayer.destroyFeatures(tempFeatures, { 'silent': true });
                    tempFeatures = null;
                }
                tempLayer = null;
            }
            else {
                olFeature.style = style;
                olFeature.layer.drawFeature(olFeature);
            }
        }
        olFeature = null;
    };

    /**
    * getAttribute: gets the value of "key"
    * @arg(String) key
    * @returns value
    */
    Feature.prototype.getAttribute = function(key) {
        return this.attributes[key];
    };

    Feature.prototype.getBounds = function() {
        var bounds;
        if (this.api == 'openlayers') {
            if (this.proprietary_feature && this.proprietary_feature.geometry) {
                var olBounds = this.proprietary_feature.geometry.getBounds();
                if (olBounds == null) return null;
                bounds = mxn.ABoundingBox.fromOpenLayers(olBounds);
                olBounds = null;
            }
        }

        if (!bounds) {
            var wktMod = this.getGeometry();
            wktMod = wktMod.replace('MULTILINESTRING', '').replace('MULTIPOLYGON', '').replace('MULTIPOINT', '');
            wktMod = wktMod.replace('LINESTRING', '').replace('POLYGON', '').replace('POINT', '');

            while (wktMod.indexOf('(') > -1 || wktMod.indexOf(')') > -1) {
                wktMod = wktMod.replace('(', '').replace(')', '');
            }
            var wktPointsArray = wktMod.trim().split(',');

            for (var idx = 0; idx < wktPointsArray.length; idx++) {
                var lonLatArray = wktPointsArray[idx].trim().split(' ');
                var point = new mxn.LatLonPoint(lonLatArray[1], lonLatArray[0]);
                if (!bounds) {
                    bounds = new mxn.ABoundingBox(point.lat, point.lon, point.lat, point.lon);
                }
                else {
                    bounds.extend(point);
                }
                point = null;
                lonLatArray = null;
            }
        }
        return bounds;
    };

    /**
    * getAttribute: gets the value of "key"
    * @arg(String) key
    * @returns value
    */
    Feature.prototype.getChildFeatures = function() {
        var children = [];
        var proprietaryChildren = this.proprietary_feature.childFeatures;
        if (proprietaryChildren) {
            for (var idx = 0; idx < proprietaryChildren.length; idx++) {
                children.push(Feature.fromOpenLayers(proprietaryChildren[idx]));
            }
        }
        proprietaryChildren = null;
        return children;
    };

    Feature.prototype.getCentroid = function() {
        var olFeature = (this.proprietary_feature) ? this.proprietary_feature : this.toOpenLayers();
        if (olFeature) {
            var olCentroid = olFeature.geometry.getCentroid();
            var centroid = new mxn.LatLonPoint(olCentroid.y, olCentroid.x);
            olCentroid = null;
            olFeature = null;
            return centroid;
        }
    };

    /**
    * Marks the feature as a closed polygon
    * @param {Boolean} bClosed
    */
    Feature.prototype.setClosed = function(bClosed) {
        this.closed = bClosed;
    };


    Feature.prototype.getGeometry = function() {
        var geomStr = null;
        if (this.geometry) {
            if (this.api == 'openlayers' && this.proprietary_feature && this.proprietary_feature.data['__originalgeom']) {
                var olGeom = this.proprietary_feature.data['__originalgeom'].clone();
                olGeom.transform(new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection), new OpenLayers.Projection(mapstractionConfig.mapOptions.displayProjection));
                geomStr = olGeom.toString();
                olGeom = null;
            }
            else {
                geomStr = this.geometry;
            }
        }
        else if (this.api == 'openlayers' && this.proprietary_feature) {
            var olFeature = this.proprietary_feature;
            var olGeom = (olFeature.data['__originalgeom'] != null) ? olFeature.data['__originalgeom'].clone() : olFeature.geometry.clone();
            olGeom.transform(new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection), new OpenLayers.Projection(mapstractionConfig.mapOptions.displayProjection));
            geomStr = olGeom.toString();
            olGeom = null;
            olFeature = null;
        }
        else if (this.api == 'micello' && this.proprietary_feature) {
            var coordsArray = this.proprietary_feature.shp;
            var isPoint = (coordsArray.length == 1);
            var isPoly = (coordsArray[coordsArray.length - 1][0] == 4);
            if (isPoly) {
                coordsArray.slice(0, coordsArray.length - 1);
            }

            var wkt = '';
            for (var idx = 0; idx < coordsArray.length; idx++) {
                if (coordsArray[idx][0] < 2) {
                    var latLonArray = this.map.mxyToLatLon(coordsArray[idx][1], coordsArray[idx][2]);
                    wkt += latLonArray[1] + ' ' + latLonArray[0] + ',';
                }
            }

            if (isPoly) {
                var latLonArray = this.map.mxyToLatLon(coordsArray[0][1], coordsArray[0][2]);
                wkt += latLonArray[1] + ' ' + latLonArray[0] + ',';
            }

            if (wkt.lastIndexOf(',') == wkt.length - 1) wkt = wkt.substr(0, wkt.length - 1); //Remove trailing comma

            if (isPoint) {
                wkt = 'POINT (' + wkt + ')';
            }
            else if (isPoly) {
                wkt = 'POLYGON ((' + wkt + '))';
            }
            else {
                wkt = 'LINESTRING (' + wkt + ')';
            }
            coordsArray = null;
            geomStr = wkt;
        }
        return geomStr;
    };

    Feature.prototype.getLayerName = function() {
        if (this.proprietary_feature.layer) return this.proprietary_feature.layer.name;
        return this.layerName;
    };

    //////////////////////////////
    //
    //  MapServerRequest
    //
    ///////////////////////////////

    /**
    * MapServerRequest is used to send request to mapserver
    * @constructor
    */
    function MapServerRequest(options) {
        this.operationName;
        this.params;
        this.onSuccess;
        this.onError;
        this.method = 'GET';
        this.requestTimeOut = 300000;
        this.sendAsyncRequest = true;
        this.allowRequestCaching = false;
        this.withCredentials = true;
        this.url = mapstractionConfig.mapServer.mapServerPath;
        this.serverProxyPath = mapstractionConfig.mapServer.serverProxyPath;
        this.clientProxyPath = mapstractionConfig.mapServer.clientProxyPath;
        OpenLayers.Util.extend(this, options);

        if (!MapServerRequest.cache) MapServerRequest.cache = new mxn.CacheProvider();
    }

    MapServerRequest.prototype.convertParamsToString = function() {
        try {
            var jsonFormat = new OpenLayers.Format.JSON();
            var jsonString = jsonFormat.write(this.params);
            if (jsonString == '' || jsonString == null) {
                if (this.onError) this.onError('Invalid JSON input', 105);
                return null;
            }
            jsonFormat = null;
            return jsonString;
        }
        catch (e) {
            if (this.onError) this.onError('Invalid JSON input', 105);
            return null;
        }
    };

    MapServerRequest.prototype.encodeUriParams = function(url) {
        var urlParams = '';
        var pArray = url.substring(url.indexOf('?') + 1).split('&');
        for (idx = 0; idx < pArray.length; idx++) {
            var paramName = pArray[idx].substring(0, pArray[idx].indexOf('='));
            var paramValue = pArray[idx].substring(pArray[idx].indexOf('=') + 1);
            urlParams += paramName + '=' + encodeURIComponent(paramValue);
            if (idx < pArray.length - 1) urlParams += '&';
        }
        return url.substring(0, url.indexOf('?') + 1) + urlParams;
    };

    MapServerRequest.prototype.send = function() {
        //Get request info 
        var url = this.url;
        var onSuccess = this.onSuccess;
        var onError = this.onError;
        var allowRequestCaching = this.allowRequestCaching;
        var method = this.method.toUpperCase();

        //Append server-side proxy if available
        if (this.serverProxyPath) {
            url = this.serverProxyPath + encodeURIComponent(url);
        }

        //Set request params
        var requestParams = '';
        if (this.operationName && this.params) {
            if (!this.params.MapName || this.params.MapName == '') {
                this.params.MapName = mapstractionConfig.mapServer.defaultMapName;
            }
            var paramsAsString = this.convertParamsToString(this.params);
            requestParams = this.encodeUriParams("OperationName=" + this.operationName + "&" + this.operationName + "Input=" + paramsAsString);
        }

        //Try and get from cache first
        var urlCacheKey = url + ((requestParams) ? '?' + requestParams : '');
        var cachedResponse;
        if (this.allowRequestCaching) {
            cachedResponse = MapServerRequest.cache.get(urlCacheKey);
            if (cachedResponse) {
                cachedResponse = eval('(' + cachedResponse + ')');
                if (navigator.onLine == false || !cachedResponse.lastModified) {
                    if (onSuccess) onSuccess(cachedResponse.data);
                    return;
                }
            }
        }

        //Create request
        var requestObj = (window.XMLHttpRequest) ? new window.XMLHttpRequest() : new window.ActiveXObject('Microsoft.XMLHTTP');
        requestObj.withCredentials = this.withCredentials;

        requestObj.open(method, (method == "GET") ? url + '?' + requestParams : url, this.sendAsyncRequest);

        //Add request headers
        if (method == "GET") {
            var lastModified = new Date(0).toLocaleString();
            if (cachedResponse && cachedResponse.lastModified) lastModified = cachedResponse.lastModified;
            //requestObj.setRequestHeader('If-Modified-Since', lastModified);
            try { requestObj.setRequestHeader('Accept-Encoding', 'gzip, deflate'); } catch (e) { }
        }
        else if (method == "POST") {
            requestObj.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }

        //Handle response
        var hasRequestTimedOut = false;
        requestObj.onreadystatechange = function() {
            if (hasRequestTimedOut) return;
            if (this.readyState == 4) {
                try {
                    this.ontimeout = null;
                    this.onreadystatechange = null;
                    if (this.status == 200 || (method == 'GET' && this.status == 304) ||
                            (method == 'POST' && this.status == 201) ||
                            (method == 'DELETE' && this.status == 204)) {
                        if (this.status == 304 && cachedResponse) {
                            //Response has not modified on server, so use cached reponse.
                            //Call onSuccess function
                            if (onSuccess) onSuccess(cachedResponse.data);
                        }
                        else {
                            //Get response from server
                            var rawResponse = (this.responseText !== "") ? this.responseText : this.responseXML;
                            var response = eval('(' + rawResponse + ')');
                            if (response.Status && response.Status > 0) {
                                //Case when server-response contains error
                                response = response.Result.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/'/g, "&apos;"); //.replace(/"/g, "&quot;");
                                if (onError) { onError(response, response.Status); }
                            }
                            else {
                                response = response.Result || response;
                                if (allowRequestCaching) {
                                    //Update cache
                                    var lastModified = this.getResponseHeader('Last-Modified');
                                    var dataToCache = { 'lastModified': lastModified, 'data': response };
                                    dataToCache = new OpenLayers.Format.JSON().write(dataToCache);
                                    MapServerRequest.cache.set(urlCacheKey, dataToCache);
                                }
                                //Call onSuccess function
                                if (onSuccess) onSuccess(response);
                            }
                        }
                    }
                    else {
                        //Status-code indicates error
                        if (this.status == 0) {
                            //is offline
                            if (cachedResponse) {
                                if (onSuccess) onSuccess(cachedResponse.data);
                            }
                            else {
                                if (onError) onError('Unable to connect to server', 101);
                            }
                        }
                        else {
                            if (onError) onError(this.statusText, 101);
                        }
                    }
                }
                catch (e) {
                    if (onError) onError(e.message || e.name, 101);
                }
            }
        };

        //Handle request timeout
        if (this.requestTimeOut && this.sendAsyncRequest) {
            requestObj.timeout = this.requestTimeOut;
            requestObj.ontimeout = function() {
                if (onError) onError('Request timed out', 101);
                this.onreadystatechange = null; //not working somehow, so using hasRequestTimedOut boolean
                hasRequestTimedOut = true;
            };
        }

        //Send request
        requestObj.send((method == 'POST') ? requestParams : null);
        requestObj = null;
    }

    ///////////////////////////////
    //
    //  StyleMap
    //
    ///////////////////////////////

    /**
    * StyleMap is used to set and get style-map for vector layers
    * @constructor
    */
    function StyleMap(options) {
        this['default'] = mapstractionConfig.symbols.styleMap['default'];
        this['select'] = mapstractionConfig.symbols.styleMap['select'];

        OpenLayers.Util.extend(this, options);
        if (options && !this['default']) OpenLayers.Util.extend(this['default'], options); //In case user directly-sends the default style
        this['default'] = new mxn.Style(this['default']);
        this['select'] = new mxn.Style(this['select']);
    }

    StyleMap.prototype.toOpenLayers = function() {
        var olStyleMap = new OpenLayers.StyleMap({
            "default": this['default'].toOpenLayers(),
            "select": this['select'].toOpenLayers()
        });
        return olStyleMap;
    }

    ///////////////////////////////
    //
    //  Style
    //
    ///////////////////////////////

    /**
    * Style is used to set and get styles in a stylemap
    * @constructor
    */
    function Style(options) {
        this.defaultStyle;
        this.rules;

        if (options.defaultStyle || options.rules) {
            OpenLayers.Util.extend(this, options);
        }
        else {
            this.defaultStyle = options;
        }

        if (this.rules) {
            for (var idx = 0; idx < this.rules.length; idx++) {
                this.rules[idx] = new mxn.Rule(this.rules[idx]);
            }
        }
    }

    Style.prototype.toOpenLayers = function() {
        var olStyle = new OpenLayers.Style(this.defaultStyle);

        if (this.rules) {
            for (var idx = 0; idx < this.rules.length; idx++) {
                olStyle.rules.push(this.rules[idx].toOpenLayers());
            }
        }
        return olStyle;
    }

    ///////////////////////////////
    //
    //  Rule
    //
    ///////////////////////////////

    /**
    * Rule is used to set and get rules in a style
    * @constructor
    */
    function Rule(options) {
        this.minScale;
        this.maxScale;
        this.filter;
        this.style;

        OpenLayers.Util.extend(this, options);
    }

    Rule.prototype.toOpenLayers = function() {
        var olRule = new OpenLayers.Rule();
        if (this.filter) {
            var filter = this.filter;
            olRule.filter = new OpenLayers.Filter.Function({
                evaluate: function(attributes) {
                    var applies = true;
                    for (var property in filter) {
                        if (!attributes[property]) {
                            applies = false;
                            break;
                        }
                        else if (filter[property] && attributes[property].toUpperCase() != filter[property].toUpperCase()) {
                            applies = false;
                            break;
                        }
                    }
                    return applies;
                }
            });
        }
        olRule.symbolizer = this.style;
        olRule.minScaleDenominator = this.minScale;
        olRule.maxScaleDenominator = this.maxScale;
        return olRule;
    }

    //////////////////////////////
    //
    //  DataSource
    //
    ///////////////////////////////

    /**
    * DataSource is used to set and get datasource for MapServer layers
    * @constructor
    */
    function DataSource(options) {
        this.mapName = mapstractionConfig.mapServer.defaultMapName;
        this.layerName;
        this.outputFields;
        this.sortByField;
        this.queryFilter;
        this.geomFilter;
        this.geomRadius;
        this.queryBounds;
        this.maximumRows;
        this.outputFormat;
        this.queryBounds;
        this.idField = 'id';
        this.parentIDField = 'parent_id';
        OpenLayers.Util.extend(this, options);
    }

    DataSource.prependToQueryFilter = function(dataSource, filterToAppend) {
        var queryFilter = DataSource.convertQueryFilterToString(dataSource.queryFilter);
        if (!queryFilter || queryFilter.length == 0) {
            queryFilter = filterToAppend;
        }
        else {
            filterToAppend = DataSource.convertQueryFilterToString(filterToAppend);
            queryFilter = ('(' + filterToAppend + ') and (' + queryFilter + ')');
        }
        return queryFilter;
    }

    DataSource.convertQueryFilterToString = function(queryFilter) {
        if (typeof queryFilter != "string") {
            var whereClause = '';
            for (var key in queryFilter) {
                var value = queryFilter[key].toString().trim();
                if (key == 'operator') {
                    whereClause += ' ' + value + ' '; //append the operator-value
                }
                else {
                    //Append key as field-name and key-value as field-value
                    var isVarchar = key == 'id' || key == 'tenant_id' || OpenLayers.String.numberRegEx.test(value) == false;
                    whereClause += key + " = ";
                    if (isVarchar && value.indexOf("'") != 0) {
                        whereClause += "'";
                    }
                    whereClause += value;
                    if (isVarchar && value.indexOf("'") != value.length - 1) {
                        whereClause += "'";
                    }
                }
            }
            return whereClause;
        }
        else {
            return queryFilter;
        }
    };

    DataSource.prototype.getData = function(onSuccess, onError, options, doCaching) {
        if (!options) options = {};
        var layerName = options.layerName || this.layerName;
        if (layerName.length == 0) {
            if (onError != undefined && onError != null) {
                onError('Layername is mandatory', 107);
                return;
            }
        }
        var queryFilter = DataSource.convertQueryFilterToString(options.queryFilter || this.queryFilter);
        var outputFields = options.outputFields || this.outputFields;
        var sortByField = options.sortByField || this.sortByField;
        var geomFilter = options.geomFilter || this.geomFilter;
        var queryBounds = this.queryBounds || options.queryBounds;
        if (queryBounds) geomFilter = queryBounds.toWkt();
        var geomRadius = options.geomRadius || this.geomRadius || 0;
        var maximumRows = options.maximumRows || this.maximumRows;
        if (!maximumRows || maximumRows == '') maximumRows = undefined;
        var outputFormat = options.outputFormat || this.outputFormat;
        if (!outputFormat || outputFormat == '' || outputFormat.toLowerCase() == 'json') outputFormat = '0';
        if (outputFormat.toLowerCase() == 'geojson') outputFormat = '1';
        if (outputFormat.toLowerCase() == 'xml') outputFormat = '2';

        //Request layer-data from server
        var params = {
            'MapName': this.mapName,
            'LayerNames': [layerName],
            'QueryFilters': [queryFilter],
            'OutputFields': [outputFields],
            'SortByFields': [sortByField],
            'GeomFilters': [geomFilter],
            'GeomRadius': [geomRadius],
            'MaximumRows': maximumRows,
            'OutputFormat': outputFormat,
            'SuppressNoDataFoundError': true
        };

        var mapServerRequest = new mxn.MapServerRequest({ operationName: 'GetLayerData', params: params, onSuccess: onSuccess, onError: onError, allowRequestCaching: doCaching });
        mapServerRequest.send();
    }

    DataSource.prototype.getFeatures = function(onSuccess, onError, options, doCaching) {
        options.outputFormat = 'geojson';
        var onSuccessExtended = function(response) {
            try {
                //Convert output to features
                var projOptions = {
                    'internalProjection': new OpenLayers.Projection(mapstractionConfig.mapOptions.mapProjection),
                    'externalProjection': new OpenLayers.Projection(mapstractionConfig.mapOptions.dbProjection)
                };
                var geoJsonFormat = new OpenLayers.Format.GeoJSON(projOptions);
                var features = [];
                if (response instanceof Array) {
                    features = geoJsonFormat.read(response);
                }
                else {
                    for (var layerName in response) {
                        Array.prototype.push.apply(features, geoJsonFormat.read(response[layerName]));
                    }
                }
                if (onSuccess) onSuccess(features);
            }
            catch (e) {
                if (onError) onError(e.message, 101);
            }
        };
        this.getData(onSuccessExtended, onError, options, doCaching);
    }

    //////////////////////////////
    //
    //  Popup
    //
    ///////////////////////////////

    /**
    * Popup is used to display popup on map
    * @constructor
    */
    function Popup() {
        this.location = null;
        this.htmlContent = null;
        this.showCloseOption = true;
        this.onCloseCallback = undefined;
        this.autoSize = true;
        this.height;
        this.width;
        this.proprietary_popup = null;
    }

    Popup.prototype.toOpenLayers = function() {
        var lonlat = this.location.toOpenLayers();
        var popupSize = (!this.autoSize && this.height && this.width) ? new OpenLayers.Size(this.width, this.height) : null;
        var olPopup = new OpenLayers.Popup.FramedCloud(
                "popup",
                lonlat,
                popupSize,
                this.htmlContent,
                null,
                this.showCloseOption,
                this.onCloseCallback
        );
        olPopup.panMapIfOutOfView = true;
        olPopup.autoSize = this.autoSize;
        this.proprietary_popup = olPopup;
        return olPopup;
    }

    Popup.prototype.setLocation = function(location) {
        this.location = location;
    }
    Popup.prototype.setHtmlContent = function(htmlContent) {
        this.htmlContent = htmlContent;
    }
    Popup.prototype.setShowCloseOption = function(showCloseOption) {
        this.showCloseOption = showCloseOption;
    }
    Popup.prototype.setOnCloseCallback = function(onCloseCallback) {
        this.onCloseCallback = onCloseCallback;
    }
    Popup.prototype.setAutoSize = function(autosize) {
        this.autoSize = autosize;
    }
    Popup.prototype.setSize = function(width, height) {
        this.height = height;
        this.width = width;
    }

    //////////////////////////////
    //
    //  MapEventsHandler
    //
    ///////////////////////////////

    /**
    * MapEventsHandler is used to register map-events
    * @constructor
    */
    function MapEventsHandler() {
        var me = this;
        this.isActive = false;
        this.onClick;
        this.onDoubleClick;
        this.onRightClick;
        this.onRightDoubleClick;
        this.onChangeLayer;
        this.onZoomEnd;
        this.onPanEnd;
        this.onMouseDown;
        this.onMouseMove;
        this.onMouseDrag;
        this.onMouseUp;
        this.onMouseHover;
        this.map;
        this.api;
        this.isMouseDown = false;
        this.duplicateEventTolerance = 300;
        this.hoverDelay = 500;

        this.configureMicelloMapClick = function(mapObj) {
            if (mapEventsHandler.onClick || mapEventsHandler.onDoubleClick) {
                mapObj.mapCanvas.onMapClick = function(mx, my, clickedGeom) {
                    if (!me.isActive) return;
                    if (me.api != 'micello') return;
                    //Get click-location
                    var latLon = mapObj.mxyToLatLon(mx, my);
                    var latLonPoint = new LatLonPoint(latLon[0], latLon[1]);
                    //Get clicked-feature
                    var clickedFeature = null;
                    if (me.returnFeatureOnClick && clickedGeom) {
                        clickedFeature = Feature.fromMicello(clickedGeom, mapstr.maps[mapstr.api]);
                    }
                    var pixelArray = mapObj.getPixelFromLonLat(latLonPoint.toOpenLayers());
                    if (mapEventsHandler.isEventDuplicate(mx, my, click)) {
                        if (me.onDoubleClick) try { me.onDoubleClick(latLonPoint, pixelArray, clickedFeature); } catch (e) { }
                    }
                    else {
                        if (me.onClick) try { me.onClick(latLonPoint, pixelArray, clickedFeature); } catch (e) { }
                    }
                };
            }
        };

        this.configureOpenLayersMapEvents = function(mapObj) {
            if (this.onChangeLayer) {
                mapObj.events.on({
                    changelayer: function(e) {
                        if (!me.isActive) return;
                        var layerName = e.layer.name;
                        var isBaseLayer = e.layer.isBaseLayer;
                        var isVisible = e.layer.visibility;
                        if (isBaseLayer == false && me.onChangeLayer) me.onChangeLayer(layerName, isBaseLayer, isVisible, e);
                        return true;
                    },
                    changebaselayer: function(e) {
                        if (!me.isActive) return;
                        var layerName = e.layer.name;
                        if (me.onChangeLayer) me.onChangeLayer(layerName, true, true, e);
                        return true;
                    },
                    scope: this
                });
            }

            if (this.onPanEnd) {
                mapObj.events.on({
                    moveend: function(e) {
                        if (!me.isActive) return;
                        if (e.zoomChanged) return;
                        if (me.onPanEnd) me.onPanEnd(e);
                        return true;
                    },
                    scope: this
                });
            }

            if (this.onZoomEnd) {
                mapObj.events.on({
                    zoomend: function(e) {
                        if (!me.isActive) return;
                        if (me.onZoomEnd) me.onZoomEnd(e);
                        return true;
                    },
                    scope: this
                });
            }

            if (this.onClick || this.onDoubleClick) {
                this.clickEventID;
                mapObj.events.on({
                    click: function(e) {
                        if (!me.isActive) return;
                        var latLonPoint = LatLonPoint.fromOpenLayersPixels(e.xy, e.object);
                        if (me.isEventDuplicate(e.clientX, e.clientY, 'click')) {
                            if (me.clickEventID) { window.clearTimeout(me.clickEventID); me.clickEventID = null; }
                            try { if (me.onDoubleClick) me.onDoubleClick(latLonPoint, e); } catch (e) { }
                        }
                        else {
                            me.clickEventID = window.setTimeout(function() {
                                try { if (me.onClick) me.onClick(latLonPoint, e); } catch (e) { }
                                window.clearTimeout(me.clickEventID); me.clickEventID = null;
                            }, me.duplicateEventTolerance);
                        }
                        return true;
                    },
                    scope: this
                });
            }

            this.rightClickEventID;
            if (this.onRightClick || this.onRightDoubleClick) {
                mapObj.viewPortDiv.oncontextmenu = OpenLayers.Function.False;
            }

            if (this.onMouseUp) {
                this.mouseUpEventID;
                mapObj.events.on({
                    mouseup: function(e) {
                        if (!me.isActive) return;
                        var latLonPoint = LatLonPoint.fromOpenLayersPixels(e.xy, e.object);
                        var isRightClick = (e.button == 3 || e.which == 3);
                        if (me.isEventDuplicate(e.clientX, e.clientY, 'mouseup', isRightClick)) {
                            if (isRightClick) {
                                if (me.rightClickEventID) { window.clearTimeout(me.rightClickEventID); me.clickEventID = null; }
                                try { if (me.onRightDoubleClick) me.onRightDoubleClick(latLonPoint, e); } catch (e) { }
                            }
                            else {
                                if (me.mouseUpEventID) { window.clearTimeout(me.mouseUpEventID); me.mouseUpEventID = null; }
                            }
                        }
                        else {
                            if (isRightClick) {
                                me.rightClickEventID = window.setTimeout(function() {
                                    try { if (me.onRightClick) me.onRightClick(latLonPoint, e); } catch (e) { }
                                    window.clearTimeout(me.rightClickEventID); me.rightClickEventID = null;
                                }, me.duplicateEventTolerance);
                            }
                            else {
                                me.isMouseDown = false;
                                me.mouseUpEventID = window.setTimeout(function() {
                                    try { if (me.onMouseUp) me.onMouseUp(latLonPoint, e); } catch (e) { }
                                    window.clearTimeout(me.mouseUpEventID); me.mouseUpEventID = null;
                                }, me.duplicateEventTolerance);
                            }
                        }
                        return true;
                    },
                    scope: this
                });
            }

            if (this.onMouseDown) {
                this.mouseDownEventID;
                mapObj.events.on({
                    mousedown: function(e) {
                        if (!me.isActive) return;
                        var latLonPoint = LatLonPoint.fromOpenLayersPixels(e.xy, e.object);
                        var isRightClick = (e.button == 3 || e.which == 3);
                        if (me.isEventDuplicate(e.clientX, e.clientY, 'mousedown')) {
                            if (!isRightClick) {
                                window.clearTimeout(me.mouseDownEventID); me.mouseDownEventID = null;
                            }
                        }
                        else {
                            if (!isRightClick) {
                                me.isMouseDown = true;
                                me.mouseDownEventID = window.setTimeout(function() {
                                    try { if (me.onMouseDown) me.onMouseDown(latLonPoint, e); } catch (e) { }
                                    window.clearTimeout(me.mouseDownEventID); me.mouseDownEventID = null;
                                }, me.duplicateEventTolerance);
                            }
                        }
                        return true;
                    },
                    scope: this
                });
            }

            if (this.onMouseMove || this.onMouseDrag || this.onMouseHover) {
                mapObj.events.on({
                    mousemove: function(e) {
                        if (!me.isActive) return;
                        if (me.isMouseDown) {
                            var latLonPoint = LatLonPoint.fromOpenLayersPixels(e.xy, e.object);
                            try { if (me.onMouseDrag) me.onMouseDrag(latLonPoint, e); } catch (e) { }
                        }
                        if (me.onMouseHover) {
                            var hoverStartEvent = me.prevEvents['mousemove'];
                            if (!hoverStartEvent || e.clientX != hoverStartEvent.x || e.clientY != hoverStartEvent.y) {
                                me.prevEvents['mousemove'] = { x: e.clientX, y: e.clientY, timestamp: new Date().getTime() };
                                if (me.hoverEventID) { window.clearTimeout(me.hoverEventID); me.hoverEventID = null; }
                                me.hoverEventID = window.setTimeout(function() {
                                    var hoverStartEvent = me.prevEvents['mousemove'];
                                    if (new Date().getTime() - hoverStartEvent.timestamp >= me.hoverDelay && e.clientX == hoverStartEvent.x && e.clientY == hoverStartEvent.y) {
                                        var latLonPoint = LatLonPoint.fromOpenLayersPixels(e.xy, e.object);
                                        try { if (me.onMouseHover) me.onMouseHover(latLonPoint, e); } catch (e) { }
                                    }
                                    window.clearTimeout(me.hoverEventID); me.hoverEventID = null;
                                }, me.hoverDelay);
                            }
                        }
                        if (this.onMouseMove) {
                            var latLonPoint = LatLonPoint.fromOpenLayersPixels(e.xy, e.object);
                            try { if (me.onMouseMove) me.onMouseMove(latLonPoint, e); } catch (e) { }
                        }
                        return true;
                    },
                    scope: this
                });
            }
        };

        this.prevEvents = {};
        this.isEventDuplicate = function(x, y, type, isRightClick, duplicateEventTolerance) {
            if (!duplicateEventTolerance) duplicateEventTolerance = this.duplicateEventTolerance;
            var currTime = new Date().getTime();
            if (me.prevEvents[type] && (currTime - me.prevEvents[type].timestamp < duplicateEventTolerance) && (me.prevEvents[type].x == x && me.prevEvents[type].y == y && me.prevEvents[type].isRightClick == isRightClick)) {
                me.prevEvents[type].timestamp = currTime;
                return true;
            }
            else {
                me.prevEvents[type] = {
                    timestamp: currTime,
                    x: x,
                    y: y,
                    isRightClick: isRightClick
                }
                return false;
            }
        };
    }

    MapEventsHandler.prototype.setOnDoubleClick = function(onDoubleClickFunction) {
        this.onDoubleClick = onDoubleClickFunction;
    }
    MapEventsHandler.prototype.setOnClick = function(onClickFunction) {
        this.onClick = onClickFunction;
    }
    MapEventsHandler.prototype.setOnRightDoubleClick = function(onRightDoubleClickFunction) {
        this.onRightDoubleClick = onRightDoubleClickFunction;
    }
    MapEventsHandler.prototype.setOnRightClick = function(onRightClickFunction) {
        this.onRightClick = onRightClickFunction;
    }
    MapEventsHandler.prototype.setOnChangeLayer = function(onChangeLayer) {
        this.onChangeLayer = onChangeLayer;
    }
    MapEventsHandler.prototype.setOnZoomEnd = function(onZoomEnd) {
        this.onZoomEnd = onZoomEnd;
    }
    MapEventsHandler.prototype.setOnPanEnd = function(onPanEnd) {
        this.onPanEnd = onPanEnd;
    }
    MapEventsHandler.prototype.setOnMouseDown = function(onMouseDown) {
        this.onMouseDown = onMouseDown;
    }
    MapEventsHandler.prototype.setOnMouseMove = function(onMouseMove) {
        this.onMouseMove = onMouseMove;
    }
    MapEventsHandler.prototype.setOnMouseDrag = function(onMouseDrag) {
        this.onMouseDrag = onMouseDrag;
    }
    MapEventsHandler.prototype.setOnMouseHover = function(onMouseHover) {
        this.onMouseHover = onMouseHover;
    }
    MapEventsHandler.prototype.setOnMouseUp = function(onMouseUp) {
        this.onMouseUp = onMouseUp;
    }

    OpenLayers.Util.removeDiv = function(divObj) {
        if (divObj == null) return;
        OpenLayers.Util.removeAllNodes(divObj);
        divObj.parentNode.removeChild(divObj);
        divObj = null;
    };

    OpenLayers.Util.removeAllNodes = function(divObj) {
        if (divObj == null) return;
        while (divObj.hasChildNodes()) {
            if (divObj.firstChild.hasChildNodes()) {
                OpenLayers.Util.removeAllNodes(divObj.firstChild);
            }
            var firstChild = divObj.firstChild;
            try { firstChild.innerHTML = ''; } catch (e) { }
            divObj.removeChild(firstChild);
            try { firstChild.outerHTML = ''; } catch (e) { }
            firstChild = null;
        }
    };

    if (typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        }
    }

    /*
    * Expose classes through mxn namespace
    */
    window.mxn = {
        'ABoundingBox': ABoundingBox,
        'LatLonPoint': LatLonPoint,
        'Mapstraction': Mapstraction,
        'Layer': Layer,
        'IndoorMap': IndoorMapOverlay,
        'IndoorMapOverlay': IndoorMapOverlay,
        'DataSource': DataSource,
        'StyleMap': StyleMap,
        'Style': Style,
        'Rule': Rule,
        'Marker': Marker,
        'Feature': Feature,
        'Popup': Popup,
        'MapEventsHandler': MapEventsHandler,
        'MapServerRequest': MapServerRequest,
        "CacheProvider": CacheProvider,
        /**
        * Allow spillage of classes for backward compatibility with
        * non-namespaced versions. NOTE: Doesn't expose loose utility
        * functions.
        */
        activatePolluteMode: function() {
            if (window.ABoundingBox || window.LatLonPoint || window.Mapstraction || window.Layer || window.IndoorMap || window.DataSource || window.Style || window.Rule || window.Marker || window.Feature || window.MapEventsHandler || window.Popup || window.MapServerRequest || window.CacheProvider) {
                alert('Warning: Mapstraction pollute mode naming clash.');
            }
            window['ABoundingBox'] = ABoundingBox;
            window['LatLonPoint'] = LatLonPoint;
            window['Mapstraction'] = Mapstraction;
            window['Layer'] = Layer;
            window['IndoorMap'] = IndoorMapOverlay;
            window['IndoorMapOverlay'] = IndoorMapOverlay;
            window['DataSource'] = DataSource;
            window['StyleMap'] = StyleMap;
            window['Style'] = Style;
            window['Rule'] = Rule;
            window['Marker'] = Marker;
            window['Feature'] = Feature;
            window['Popup'] = Popup;
            window['MapEventsHandler'] = MapEventsHandler;
            window['MapServerRequest'] = MapServerRequest;
            window['CacheProvider'] = CacheProvider;
        }
    };
})();
mxn.activatePolluteMode();