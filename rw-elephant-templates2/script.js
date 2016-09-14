var rweUser = 'somethingvintage';
var rweAPIURL='http://'+rweUser+'.rwelephant.com/api/public_api?callback=?';
var thumbURL = 'http://images.rwelephant.com/'+rweUser+'_public_thumbnail_';
var largeThumbURL = 'http://images.rwelephant.com/'+rweUser+'_large_thumbnail_';
var noItemImg = '/wp-content/plugins/rw-elephant-inventory-gallery/images/no-item-image.png';
var key = '96c2d5e483ff1dd8a8d2edd8a5a4db3b';
var list = [];

jQuery(document).ready(function($){
  if($('#item-price').length!=0){
      if($('#item-price').data('category')=='Farm and Dining Tables' || $('#item-price').data('category')=='Church Pews' ) {
         $('#item-price').hide();
      }
  }
  $('.rwe-gallery-thumbnails li a').click(function (event) {
    event.preventDefault();
    var href = $(this).attr('href');
    var original = $(this).data('original');
    $('img.rwe-item-photo').attr("src",href);
    $('img.rwe-item-photo').closest("a").attr("href",original);
  });
  if ($('#rwe-recommend').length){
    var recommendId = $('#rwe-recommend').data('item');
    var data =  {
        action: 'rwrecommendaction',
        item_id: recommendId
    }
    $.post('http://my.somethingvintagerentals.com/wp-admin/admin-ajax.php', data, function(response){
       if (response.length) {
         $('<h3>Recommended items</h3>').insertBefore('#rwe-recommend');
	 list = response.split(',');
	 $.each(list, function(index,value) {
		$.getJSON(rweAPIURL,{action: 'item_info', api_key: key, inventory_item_id: value }, function(result){
			if (result.length){
				if (result[0].inventory_item_id) {
					var itemName =  (result[0].name != null ? result[0].name : 'Name not available' );
                                        var seourl=itemName;
                                        seourl = seourl.replace(/[^A-Za-z0-9\s-._\/]/g,"");
                                        seourl = seourl.replace(/[\/._]+/g," ");
                                        seourl = seourl.replace(/[\s-]+/g," ");
                                        seourl = seourl.trim();
                                        seourl = seourl.substr(0, 100);
                                        seourl = seourl.trim();
                                        seourl = seourl.replace(/\s/g,"-");
                                        seourl = seourl.toLowerCase();
					var imageURL =  (result[0].image_links[0].photo_hash != null ? thumbURL+result[0].image_links[0].photo_hash : noItemImg );    
					$('<li><a href="../'+seourl+'-'+value+'/"><img data-recommend-image="'+value+'" src="'+imageURL+'" title="'+itemName+'" /><span>'+itemName+'</span></a></li>').appendTo('#rwe-recommend');
				}
			} else {
				// for some reason there was no image
				$('<img data-recommend-image="'+value+'" src="'+noItemImg+'">').appendTo('#rwe-recommend');
			}
		});

	});
       }
    });
  }
});