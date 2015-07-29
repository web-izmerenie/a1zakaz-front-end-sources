/**
 * Error 404 page scripts
 *
 * @author Viacheslav Lotsmanov
 */

define(['jquery'], function ($) {
$(function domReady() {

	var $doc = $(document);
	var $header = $('header');
	var $footer = $('footer');

	var headerHeight = $header.height();
	var footerHeight = $footer.height();

	$('html.error_404 main .error_404').each(function () {

		var bindSuffix = '.error_404_centering';

		var $error404 = $(this);

		$error404.css({
			'padding-top': 0,
			'padding-bottom': 0
		});

		var eh = $error404.innerHeight();

		$(window).on('resize' + bindSuffix, function () {

			$error404.css('padding-top', 0);

			var ah = $doc.height() - headerHeight - footerHeight;

			$error404.css('padding-top', ((ah / 2) - (eh / 2)) + 'px');

		}).trigger('resize' + bindSuffix);

	});

}); // domReady()
}); // define()
