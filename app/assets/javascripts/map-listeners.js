function attachMapListeners() {
    console.log('attaching map listeners...')
    var deferred = $.Deferred();
    onShowReportsClick();
    onSelectAllDisClick();
    return deferred;
}

function onShowReportsClick() {

    $("#show_reports").click(function () {
        getDevicesLastReports();
    });
}

function onSelectAllDisClick() {

    $('#select_all_dis').click(function(event) {  //on click 
        if(this.checked) { // check select status
            $('#dis_selector li input').each(function() { //loop through each checkbox
                this.checked = true;  //select all checkboxes with class "checkbox1"               
            });
        }else{
            $('#dis_selector li input').each(function() { //loop through each checkbox
                this.checked = false; //deselect all checkboxes with class "checkbox1"                       
            });         
        }
    });
}