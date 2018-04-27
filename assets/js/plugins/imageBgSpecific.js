(function( $ ) {
$.fn.imageBgSpecific = function(options) {
  var $this = this;

  var settings = $.extend({
    backgroundSize: 'cover',
    imageSource: $this,
    backgroundPosition: '50% 50%'
  }, options );

  return $($this).each(function(){
	var image = $(settings.imageSource).find("img");
    var source = image.attr("src");
    $(this).css({

      'background-image': 'url(' + source + ')',
      'background-repeat': 'no-repeat',
      'background-size': settings.backgroundSize,
      'background-position': settings.backgroundPosition
    });

    $(settings.imageSource).find("img").css('display', 'none');

  });
};
}( jQuery ));
