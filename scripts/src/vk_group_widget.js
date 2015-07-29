/**
 * VK group widget
 *
 * @author Viacheslav Lotsmanov
 */

define(['jquery'], function ($) {
$(function domReady() {

	var groupId = 21124038;
	var ratio = [ 200, 290 ];
	var className = 'vk_group_widget';

	$('.' + className).each(function (i) {

		var $el = $(this);

		var elId = className + '_n_' + i;

		var w = ratio[0];
		var h = ratio[1];
		var elW = $el.innerWidth();

		if (elW > 0) {
			w = elW;
			h = w * ratio[1] / ratio[0];
		}

		$el.attr('id', elId);

		require(['dynamic_api'], function (dynamicLoadApi) {

			dynamicLoadApi('http://userapi.com/js/api/openapi.js?48', 'VK', function (err, VK) {

				if (err) throw err;

				VK.Widgets.Group(elId, {
					mode: 0,
					width: w,
					height: h
				}, groupId);

			});

		});

	});

}); // domReady()
}); // define()
