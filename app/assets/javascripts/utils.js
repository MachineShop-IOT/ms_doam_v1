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