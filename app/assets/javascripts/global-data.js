/* Author : Nishant Karki
* Scope : File contains global js variables to used in the site
* */

var policies = {};
var trackedDevices = {};
var trackedDeviceReports = {};
var trackedDeviceMarkers = {};
var selectedTrackedDevices = [];
/*for selecting tracked items to create geofences*/
var enterpriseValue = 'LTS_003';
var enterpriseNameValue = 'enterprise-id';
var map;
var template;
var handleBarsData;
var postMethodDivTemplate, itemTypeListTemplate, tableCreateTemplate, editItemTypeTemplate, attachedFenceTemplate, propertiesListTemplate, geoFenceDeleteTemplate, geoFenceAttachItemListTemplate, attchTrackItemTableTemplate, attachedItemListTemplate, itemListOptionsTemplate, itemListOptionsOddTemplate, itemListBottomPanelOptionsTemplate, itemListBottomPanelOptionsOddTemplate, itemListBottomPanelExpandedOpttionsTemplate, itemListBottomPanelExpandedOpttionsOddTemplate, monitorNotificationListTemplate, monitorNotificationListExpandedTemplate, monitorFenceOptionsTemplate, attachedFenceTemplate, itemListOptionsMonitorTrackedItemTemplate, itemListOptionsGetTrackedItemTemplate, infoBubbleTemplate, rightPanelRulesListTemplate, getInfoBubbleTemplate;

var mapLayerOrder = {
    'Google Map': 0,
    'Buildings': 1,
    'Floors': 2,
    'Rooms': 3,
    'Furniture': 4,
    'Building_Furniture': 5,
    'Building_Int_Installations': 6,
    'Building_Ext_Installations': 7,
    'TempFeature': 8,
    'Geofence': 9,
    'Geofence_icon': 10,
    'TempMarker': 11,
    'CDP_LAYER': 12,
    'Markers':13
    // 'POI': 13
};

var number_regex = /^\d+$/;

var isDeleteListenerSet = false;

var defaultGeoFenceImage = "../assets/geofence.png";
var staticResourceBaseUrl = "../assets/"

/* constants to be used in the UI section */
var SLIDE_OPEN_CLOSE_TIME = 400;

/* values for the api info popup on the map bubble */
var data = {
    menu_data: [
        {
            "api_info": [
                "GET/data/monitor/last_reports",
                "Device Reports",
                "Get the last report for a device, giving the closest approximation to a current location.",
                "List of Devices",
                "CSV list of devices",
                "",
                "headers = { :authorization => \"Basic\" + Base64.encode64('VDTzTjFftXeyinJ77RLT\"+\":X\")," +
                    ":content_type => :json," +
                    ":accept => :json } " +
                    "url = \"https://platform.machineshop.io/api/v1/data/monitor?created_at=2012-08-23\"" +
                    "reports_json = RestClient.get url,headers"
            ],
            "date": "Tue Dec 14 2013",
            "time": "10:39 AM",
            "active": true
        }
    ]
}

/* api info value for the side menu panel */
var api_info_data = [
    {"api_info": [
        "GET/data/monitor/last_reports",
        "Device Reports",
        "Get the last report for a device, giving the closest approximation to a current location.",
        "List of Devices",
        "CSV list of devices",
        "",
        ""
    ]},
    {"api_info": [
        "GET /tracking_device/:device_id/geofences",
        "Device Reports",
        "Get the last report for a device, giving the closest approximation to a current location.",
        "List of Devices",
        "CSV list of devices",
        "",
        ""
    ]},
    {"api_info": [
        "POST /user/:user_id/policy",
        "Policies",
        "Create a geofence for a device to send alerts when crossing in/out of the geofence",
        "",
        "{\"name\":\"Report location, etc. when the device enters a geofence in Denver\",\"type\":\"GEOFENCE\",\"direction\":\"ENTER\",\"urgent_report\":true,\"single_report\":true,\"grey_area_threshold\":\"22\",\"units\":\"0.1m\",\"POLYGON\":[{\"latitude\":\"39.860629\",\"longitude\":\"-104.998382\"},{\"latitude\":\"39.860547\",\"longitude\":\"-104.998202\"},{\"latitude\":\"39.8604\",\"longitude\":\"-104.99842\"},{\"latitude\":\"39.860545\",\"longitude\":\"-104.998594\"}],\"report_contents\":[\"UTC_TIME\",\"LOCATION\",\"SPEED\",\"FIX_STATUS\",\"MOTION\",\"BATTERY_STATUS\",\"TEMPERATURE\",\"PRESSURE\",\"LIGHT_STATUS\",\"HEALTH\"]}",
        "",
        "RestClient.public_send(http_verb, url, body, headers(authentication_token))"
    ]},

    {"api_info": [
        "GET /monitor/report",
        "Get Device Reports History",
        "Get reports for a device within a specified date range",
        "device_instance_id, created_at_between, per_page, page",
        "/monitor/report/?device_id=52585e1d981800bab2000478&start_date=2014-01-20T07:00:00&end_date=2014-01-27T05:00:00",
        "{\"jsonData\":{\"totalCount\":1,\"data\":" +
            "[{\"_id\":\"52dfc2f4b99e9cdb3a007e47\"," +
            "\"created_at\":\"2014-01-22T13:09:08Z\",\"deleted_at\":null," +
            "\"device_datetime\":\"2014-01-22T13:10:26+00:00\",\"device_instance_id\":\"52585e1d981800bab2000478\"," +
            "\"device_type\":\"lts\",\"payload\":{\"sequenceId\":1095,\"event\":" +
            "{\"eventIdx\":0,\"reportMask\":2163,\"values\":{\"fixType\":3,\"utcTime\":1390396226," +
            "\"batteryLevel\":0,\"location\":{\"latitude\":52.50181,\"longitude\":0.0822153,\"altitude\":21," +
            "\"hor_error_min\":0,\"hor_error_max\":0,\"vert_error\":0},\"speed\":{\"hor_speed\":10000," +
            "\"ver_speed\":0,\"heading\":9000},\"motion\":{\"context\":0,\"steps\":0,\"distance\":0," +
            "\"floor_change\":0}}}},\"profile_timestamps\":{\"device\":\"2014-01-22T13:10:26+00:00\"," +
            "\"worker\":\"2014-01-22 13:09:08 UTC\",\"translator\":\"2014-01-22T13:10:47+00:00\"," +
            "\"platform\":\"2014-01-22T13:10:49+00:00\"}," +
            "\"raw_data\":\"AAIAAA5SeWFuAFJ5YW4AQ1NSAARHAQAIcwEfSyPj_-yLiQAVAAAAAAAAJxAAACMoAAAAAAAAAAAAAFLfw0IAAwAAAAA\"," +
            "\"updated_at\":\"2014-01-22T13:09:08Z\"}]}}",
        "RestClient.public_send(http_verb, url)"
    ]},
    {"api_info": [
        "GET /monitor/report",
        "Get Device Reports History",
        "Get reports for a device within a specified date range",
        "device_instance_id, created_at_between, per_page, page",
        "/monitor/report/?device_id=52585e1d981800bab2000478&start_date=2014-01-20T07:00:00&end_date=2014-01-27T05:00:00",
        "{\"jsonData\":{\"totalCount\":1,\"data\":" +
            "[{\"_id\":\"52dfc2f4b99e9cdb3a007e47\"," +
            "\"created_at\":\"2014-01-22T13:09:08Z\",\"deleted_at\":null," +
            "\"device_datetime\":\"2014-01-22T13:10:26+00:00\",\"device_instance_id\":\"52585e1d981800bab2000478\"," +
            "\"device_type\":\"lts\",\"payload\":{\"sequenceId\":1095,\"event\":" +
            "{\"eventIdx\":0,\"reportMask\":2163,\"values\":{\"fixType\":3,\"utcTime\":1390396226," +
            "\"batteryLevel\":0,\"location\":{\"latitude\":52.50181,\"longitude\":0.0822153,\"altitude\":21," +
            "\"hor_error_min\":0,\"hor_error_max\":0,\"vert_error\":0},\"speed\":{\"hor_speed\":10000," +
            "\"ver_speed\":0,\"heading\":9000},\"motion\":{\"context\":0,\"steps\":0,\"distance\":0," +
            "\"floor_change\":0}}}},\"profile_timestamps\":{\"device\":\"2014-01-22T13:10:26+00:00\"," +
            "\"worker\":\"2014-01-22 13:09:08 UTC\",\"translator\":\"2014-01-22T13:10:47+00:00\"," +
            "\"platform\":\"2014-01-22T13:10:49+00:00\"}," +
            "\"raw_data\":\"AAIAAA5SeWFuAFJ5YW4AQ1NSAARHAQAIcwEfSyPj_-yLiQAVAAAAAAAAJxAAACMoAAAAAAAAAAAAAFLfw0IAAwAAAAA\"," +
            "\"updated_at\":\"2014-01-22T13:09:08Z\"}]}}",
        "RestClient.public_send(http_verb, url)"
    ]},

    {"api_info": [
        "GET /user/:user_id/policy",
        "Policies",
        "Get list of policies for the user_id",
        "",
        "",
        "{\"_id\":\"535545db385f7f06ac00000b\",\"active\":true,\"name\":\"Temp > 410 (urgent)\",\"operator\":\"greater_than_rule_condition\",\"report_content\":[\"UTC_TIME\",\"LOCATION\",\"SPEED\",\"FIX_STATUS\",\"MOTION\",\"BATTERY_STATUS\",\"TEMPERATURE\",\"PRESSURE\",\"LIGHT_STATUS\",\"HEALTH\"],\"single_report\":\"true\",\"type\":\"TEMPERATURE\",\"urgent_report\":\"true\",\"value\":\"410\"},{\"_id\":\"53554613385f7f06ac00000d\",\"active\":true,\"name\":\"Light < 320000 (urgent)\",\"operator\":\"less_than_rule_condition\",\"report_content\":[\"UTC_TIME\",\"LOCATION\",\"SPEED\",\"FIX_STATUS\",\"MOTION\",\"BATTERY_STATUS\",\"TEMPERATURE\",\"PRESSURE\",\"LIGHT_STATUS\",\"HEALTH\"],\"single_report\":\"true\",\"type\":\"LIGHT\",\"urgent_report\":\"true\",\"value\":\"320000\"    },",

        "RestClient.public_send(http_verb, url, body, headers(authentication_token))"
    ]},

     {"api_info": [
        "POST /user/52de32fa981800e2c5000037/policy/",
        "Policy",
        "Create different Policies i.e. LIGHT, TEMPERATURE, PRESSURE,BASE, BATTERY,TIME",
        "",
        "",
        "{\"name\":\"Report location, etc. every 5 seconds\",\"type\":\"TIME\",\"value\":\"5\",\"urgent_report\":true,\"single_report\":true,\"report_contents\":[\"UTC_TIME\",\"LOCATION\",\"SPEED\",\"FIX_STATUS\",\"MOTION\",\"BATTERY_STATUS\",\"TEMPERATURE\",\"PRESSURE\",\"LIGHT_STATUS\",\"HEALTH\"]}",
        "RestClient.public_send(http_verb, url)"
    ]},


    {"api_info": [
        "POST /csr/user/:user_id/policy/",
        "Complex Policies",
        "Combine Policies to create a complex Policies",
        "post body",
        "{\"name\":\"Report location, etc. when three rules are broken\",\"type\":\"COMPLEX\",\"urgent_report\":true,\"single_report\":true,\"concatenation_logic\":\"AND\",\"policy_component_ids\":[\"52251f1ee913c605ba00aa08\",\"52251f1ee913c605ba00ba07\",\"52251f1ee913c605ba00da09\"],\"report_contents\":[\"UTC_TIME\",\"LOCATION\",\"SPEED\",\"FIX_STATUS\",\"MOTION\",\"BATTERY_STATUS\",\"TEMPERATURE\",\"PRESSURE\",\"LIGHT_STATUS\",\"HEALTH\"]}",
        "",
        "RestClient.public_send(http_verb, url)"
    ]},

    {"api_info": [
        "POST tracking_device/:device_id/policy",
        "Policies",
        "Attach device to the single or list of policies",
        "post body",
        "{\"status\":\"active\",\"policy_id\":[\"533d95871d41c83351000002\",\"5533d95891d41c83351000003\",\"533d958d1d41c83351000004\"]}",
        "",
        "RestClient.public_send(http_verb, url)"
    ]}
];