function showSpinner(message){
    $('.ajax-spinner').html('<div class="loader-block"><img src="assets/ajax-loader.gif" title="ajax loader workin"> '+message+'</div>');
    $('.ajax-spinner').show();
}

function hideSpinner(){
    $('.ajax-spinner').hide();
}

function getSelectedFields(){
	var selected_fields = [];
    $('#fields_selector li input:checked').each(function() {
        selected_fields.push($(this).attr('name'));
    });

    return selected_fields;
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
    var jsonData = "{\"jsonData\":{\"totalCount\":1,\"data\":" +
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
            "\"updated_at\":\"2014-01-22T13:09:08Z\"}]}}";

    var obj = JSON.parse(jsonData);
    var payload = obj.jsonData.data[0].payload;

    var a = recursive(payload);
    console.log(a);
    $('#tree').html(a);

    addPayloadTreeListeners();


}

var build = "";

function recursive(obj){
    for (var key in obj) {
        var child = obj[key];
        
        if (typeof child != "object") {
            build+="<li class='"+key+"'><input type='checkbox' name='"+key+"' id='"+key+"'>"+key+": "+child+"</li>";
        }

        if(typeof child == "object"){
            build+="<li class='parent-list'><input type='checkbox' name='"+key+"' id='"+key+"'>"+key+"<span class='glyphicon glyphicon-chevron-down'></span>";
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
}