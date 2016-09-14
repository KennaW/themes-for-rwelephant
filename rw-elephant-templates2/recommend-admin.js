var rweUser = 'somethingvintage';
var rweURL='http://'+rweUser+'.rwelephant.com/api/public_api?callback=?';
var thumbURL = 'http://images.rwelephant.com/'+rweUser+'_public_thumbnail_';
var largeThumbURL = 'http://images.rwelephant.com/'+rweUser+'_large_thumbnail_';
var noItemImg = '/wp-content/plugins/rw-elephant-inventory-gallery/images/no-item-image.png';
var key = '96c2d5e483ff1dd8a8d2edd8a5a4db3b';
var list = [];
jQuery(document).ready(function($){
	var itemThumb = jQuery('#item-thumbnail').data('item-id');
	if ('null' != itemThumb && '' != itemThumb) {
		jQuery('#item-thumbnail').html('<img src="'+thumbURL+itemThumb+'" />');
	}
	else {
		jQuery('#item-thumbnail').html('<img src="'+noItemImg+'" />');
	}
	
	// get current recommended items on page load
	var recommendItems = $('#selected-rw-recommends').val();
	if ( recommendItems.length ){
		var inputList = recommendItems.split(',');
		for(var i=0, len=inputList.length; i<len; i++){
		    list[i] = parseInt(inputList[i], 10);
		}
	}

	// populate thumbnails for initial recommended images on page load
	$.each(list, function(index,value) {
		$.getJSON(rweURL,{action: 'item_info', api_key: key, inventory_item_id: value }, function(result){
			if (result.length){
				if (result[0].inventory_item_id) {
					var itemName =  (result[0].name != null ? result[0].name : 'Name not available' );
					var imageURL =  (result[0].image_links[0].photo_hash != null ? thumbURL+result[0].image_links[0].photo_hash : noItemImg );    
					$('<img data-recommend-image="'+value+'" src="'+imageURL+'" title="'+itemName+'">').appendTo('#recommended-images');
				}
			} else {
				// for some reason there was no image
				$('<img data-recommend-image="'+value+'" src="'+noItemImg+'">').appendTo('#recommended-images');
			}
		});

	});
	
	
	$.getJSON(rweURL,{action: 'list_inventory_types', api_key: key}, function(result){
		if (result.length){
			var categories = [];
			$.each(result, function(index, value) {
				if (value.inventory_type_name) {
					var category = { val: value.inventory_type_id, text:value.inventory_type_name }
					categories = categories.concat(category);
				}
			});
			var sel = $('<select class="item-category"><option> - Select category - </option>').appendTo('#item_selector');
			var sel2 = $('<select class="recommend-category"><option> - Select category - </option>').appendTo('#recommend_selector');
			$(categories).each(function() {
				sel.append($("<option>").attr('value',this.val).text(this.text));
				sel2.append($("<option>").attr('value',this.val).text(this.text));
			});
			$('<ul class="item-box">').appendTo('#item_selector');
			$('<ul class="recommend-box">').appendTo('#recommend_selector');
		}
	});
});
jQuery(document).on("change", ".item-category", function(event){
	var catId="";
	jQuery("select.item-category option:selected").each(function() {
		catId = jQuery(this).attr('value');
	});
	jQuery.getJSON(rweURL,{action: 'list_items_for_type', inclusion_mask: 'main_hash', inventory_type_id: catId, api_key: key}, function(result){
		if (result.length){
			jQuery('.item-box').html('');
			var item_list = [];
			jQuery.each(result, function(index, value) {
				if (value.inventory_item_id) {
					var imageURL =  (value.image_links[0].photo_hash != null ? thumbURL+value.image_links[0].photo_hash : noItemImg);
					var this_item = { val: value.inventory_item_id, text:value.name, image: imageURL, thumbnail: value.image_links[0].photo_hash }
					item_list = item_list.concat(this_item);
				}
			});
			var inputItem = jQuery('#selected-rw-item').val();
			jQuery(item_list).each(function() {
				if (parseInt(this.val) == parseInt(inputItem))
					jQuery('.item-box').append('<li class="selected" data-item-title="'+this.text+'" data-item-id="'+this.val+'" data-item-thumbnail="'+this.thumbnail+'"><img src="'+this.image+'"><br/>'+this.text+'</li>');
				else
					jQuery('.item-box').append('<li data-item-title="'+this.text+'" data-item-id="'+this.val+'" data-item-thumbnail="'+this.thumbnail+'"><img src="'+this.image+'"><br/>'+this.text+'</li>');
			});
		}
	});
});
jQuery(document).on("click", ".item-box li", function(event){
	jQuery('.item-box li').removeClass('selected');
	jQuery(this).addClass('selected');
	var itemId = jQuery(this).data('item-id');
        var itemTitle = jQuery(this).data('item-title');
        var itemThumbnail = jQuery(this).data('item-thumbnail');
        jQuery('#selected-rw-item').attr('value',itemId);
        jQuery('#selected-item-thumbnail').attr('value',itemThumbnail);
        if (null !== itemThumbnail  && '' != itemThumbnail) {
		jQuery('#item-thumbnail').html('<img src="'+thumbURL+itemThumbnail+'" />');
	}
	else {
		jQuery('#item-thumbnail').html('<img src="'+noItemImg+'" />');
	}
        jQuery('input#title').attr('value',itemTitle);
        jQuery('#title-prompt-text').html('');
});


(function($) {
$(document).on("change", ".recommend-category", function(event){
	var catId="";
	$("select.recommend-category option:selected").each(function() {
		catId = $(this).attr('value');
	});
	$.getJSON(rweURL,{action: 'list_items_for_type', inclusion_mask: 'main_hash', inventory_type_id: catId, api_key: key}, function(result){
		if (result.length){
			$('.recommend-box').html('');
			var recommend_list = [];
			$.each(result, function(index, value) {
				if (value.inventory_item_id) {
					var itemName =  (value.name != null ? value.name : 'Name not available' );
					var imageURL =  (value.image_links[0].photo_hash != null ? thumbURL+value.image_links[0].photo_hash : noItemImg );   
					var itemThumbnail = (value.image_links[0].photo_hash != null ? value.image_links[0].photo_hash : '' ); 
					var this_item = { val: value.inventory_item_id, text:value.name, image: imageURL, item_thumbnail: itemThumbnail, item_name: itemName }
					recommend_list = recommend_list.concat(this_item);
				}
			});
			$(recommend_list).each(function() {
				if($.inArray( parseInt(this.val), list)!==-1)  {
					$('.recommend-box').append('<li class="selected" data-item-id="'+this.val+'" data-item-thumbnail="'+this.item_thumbnail+'" title="'+this.item_name+'"><img src="'+this.image+'"><br/>'+this.text+'</li>');
				}
				else {
					$('.recommend-box').append('<li data-item-id="'+this.val+'" data-item-thumbnail="'+this.item_thumbnail+'" title="'+this.item_name+'"><img src="'+this.image+'"><br/>'+this.text+'</li>');
				}
			});

		}
	});
});
})(jQuery);

(function($) {
$(document).on("click", ".recommend-box li", function(event){

	var itemName = $(this).attr('title');
	var recommendId = $(this).data('item-id');
	var itemThumbnail = $(this).data('item-thumbnail');
	var idx = $.inArray( $(this).data('item-id') , list);

	if (idx == -1) {
		list.push( $(this).data('item-id') );
		$(this).addClass('selected');
		imageURL =  (itemThumbnail != '' ? thumbURL+itemThumbnail : noItemImg);
		$('<img data-recommend-image="'+recommendId+'" src="'+imageURL+'" title="'+itemName+'">').appendTo('#recommended-images');
	}
	else {
		list.splice(idx, 1);
		$(this).removeClass('selected');
		$("img[data-recommend-image='" + recommendId + "']").remove();
	}

	$("#selected-rw-recommends").attr('value', list.join(','));

});

})(jQuery);

(function($) {
$(document).on("click", "#recommended-images img", function(event){

	var recommendId = $(this).data('recommend-image');
	var idx = $.inArray( recommendId , list);

	list.splice(idx, 1);
	$(".recommend-box li[data-item-id='" + recommendId + "']").removeClass('selected');
	$(this).remove();

	$("#selected-rw-recommends").attr('value', list.join(','));

});

})(jQuery);