var SAMPLE_PAYLOAD_URL = "/monitor/get_sample_payload_data";
var ADDRESS_BY_LATLON_URL = "/util/get_address_by_latlon";
var WEATHER_URL = "/util/get_weather";

function showSpinner(message){
    $('.ajax-spinner').html('<div class="loader-block"><img src="assets/ajax-loader.gif" title="ajax loader workin"> '+message+'</div>');
    $('.ajax-spinner').show();
}

function hideSpinner(){
    $('.ajax-spinner').hide();
}

function getSelectedLatField(){
	var lat_fields = [];
    $('#lat_tree li input:checked').each(function() {
        lat_fields.push($(this).attr('name'));
    });

    return lat_fields;
}

function getSelectedLonField(){
    var lon_fields = [];
    $('#lon_tree li input:checked').each(function() {
        lon_fields.push($(this).attr('name'));
    });

    return lon_fields;
}

function getSelectedDeviceInstances(){
	var selected_dis = [];
    $('#dis_selector li input:checked').each(function() {
        selected_dis.push($(this).attr('name'));
    });

    return selected_dis;
}

 function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function getRandomColors(num_colors){
    var colorsArr = new Array();
    var val = 0;
    for (i = 0; i < 360; i += (360 / num_colors)) {
        h = i/360.0;
        s = (90 + Math.floor(Math.random() * 10)) / 100.0;
        l = (((val+=8)%50)+10) / 100.0;
        rgb = hslToRgb(h,s,l);
        color = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
        colorsArr.push(color);
    }
    return colorsArr;
}

function buildPayloadTree(){
    
    console.log("Building Tree...");

    $.ajax({
        url: SAMPLE_PAYLOAD_URL
    }).done(function (response) {
        var tree_html = recursive(response.payload);
        $('#lat_tree').html(tree_html);
        $('#lon_tree').html(tree_html);
        addPayloadTreeListeners();
    });
}

var build = "";

function recursive(obj){
    for (var key in obj) {
        var child = obj[key];
        
        if (typeof child != "object") {
            build+="<li class='"+key+"'><input type='checkbox' name='"+key+"' id='"+key+"'>"+key+"</li>";
        } else {
            build+="<li class='"+key+" parent-list'>"+key+"<span class='glyphicon glyphicon-chevron-down'></span>";
            build+="<ul class='"+key+"'>";
            recursive(child);
            build+="</ul></li>";
        }
    }
    return build;
}

function addPayloadTreeListeners(){
    $("li.parent-list ul").hide(); //hide the child lists
    $("li.parent-list span").click(function () {
        $(this).toggleClass('glyphicon-chevron-down');
        $(this).toggleClass('glyphicon-chevron-up');
        $(this).next("ul").toggle(); // toggle the visibility of the child list on click
    });

    $('#lat_tree').on('change','[type=checkbox]',function(){
        if($('#lat_tree [type=checkbox]').filter(':checked').length === 1){
            $('#lat_tree [type=checkbox]').filter(':not(:checked)').prop('disabled',true);
        } else {
            $('#lat_tree [type=checkbox]').prop('disabled',false);
        }
    });

    $('#lon_tree').on('change','[type=checkbox]',function(){
        if($('#lon_tree [type=checkbox]').filter(':checked').length === 1){
            $('#lon_tree [type=checkbox]').filter(':not(:checked)').prop('disabled',true);
        } else {
            $('#lon_tree [type=checkbox]').prop('disabled',false);
        }
    });
}

function getPath(field){
    var parents = $("#lat_tree").find("."+field).parents().filter("ul");
    var pathArray = [];
    var path = "";

    for (var i = 0; i < parents.length-1; i++) {
        pathArray.push(parents[i].className);
    }
    pathArray = pathArray.reverse();
    var path = pathArray.join('.');

    if(path!=""){
        return path+"."+field;
    } else {
        return field;
    }
}

function getAddressByLatlon(lat, lon){

    var address;

    var jqXHR = $.ajax({
        url: ADDRESS_BY_LATLON_URL+"?latlon="+lat+","+lon,
        async: false,
        beforeSend: function(jqXHR, settings) {
            jqXHR.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
        }
    }).done(function (response) {
        // console.log(response.results[0].formatted_address);
    });

    var response = jqXHR.responseText;
    var o = $.parseJSON(response);

    var address = o.results[0].formatted_address;

    console.log(o);

    return address;

}

function getWeather(){

    var address;

    var jqXHR = $.ajax({
        url: WEATHER_URL+"?state=CO&city=Denver",
        async: false,
        beforeSend: function(jqXHR, settings) {
            jqXHR.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
        }
    }).done(function (response) {
        // console.log(response.results[0].formatted_address);
    });

    var response = jqXHR.responseText;
    var weather = $.parseJSON(response);

    console.log(weather);

    return address;

}