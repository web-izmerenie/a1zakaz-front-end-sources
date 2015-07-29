/**
 * "contacts" page scripts
 *
 * @author Viacheslav Lotsmanov
 */

define(['jquery', 'get_val'], function ($, getVal) {
$(function domReady() {

	var $page = $('html,body');
	var $maps = $('main .contacts .interactive_map');
	var $fixedHeader = $('header .fixed_part');

	var hash = window.location.hash.toString().substr(1);
	if (hash === '') hash = 'NO HASH';

	$maps.each(function (i) {

		var $wrapper = $(this);
		var $map = $wrapper.find('.map');
		var $address = $wrapper.closest('li').find('address');

		var id = 'interactive_yandex_map_n_' + i;

		$map.attr('id', id);

		require(['dynamic_api'], function (dynamicLoadApi) {

			var mapLang = (getVal('lang') === 'ru') ? 'ru-RU' : 'en-US';

			dynamicLoadApi(
				'http://api-maps.yandex.ru/2.0/?load=package.standard&lang=' + mapLang,
				'ymaps',
				function (err, ymaps) {

					if (err) throw err;

					ymaps.ready(function () {

						var map = new ymaps.Map(id, {
							center: [
								parseFloat($map.attr('data-coord-y')),
								parseFloat($map.attr('data-coord-x'))
							],
							zoom: parseInt($map.attr('data-zoom'), 10)
						});

						map.controls
							.add('zoomControl', { left: 15, top: 15 })
							.add('typeSelector', { right: 15, top: 15 });

						var mark = new ymaps.Placemark([
							$map.attr('data-coord-y'),
							$map.attr('data-coord-x')
						], {
							hintContent: $address.text()
						}, {
							iconImageHref: '/images/sheet_yamap_marker.png',
							iconImageSize: [31, 44],
						});

						map.geoObjects.add(mark);

						$(window).on('resize', function () {

							var w = $map.innerWidth();
							var h = getVal('interactiveMapRatio')[1] * w / getVal('interactiveMapRatio')[0];

							$map.css('height', h + 'px');

							map.container.fitToViewport();

						}).trigger('resize');

						if ($wrapper.attr('id') === hash) {
							$page.stop().animate({
								scrollTop: $wrapper.offset().top - 20 - $fixedHeader.height()
							}, getVal('animationSpeed') * 2);
						}

					});

				}
			); // dynamicLoadApi()

		}); // require(['dynamic_api']...

	}); // .each()

}); // domReady()
}); // define()
