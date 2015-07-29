/**
 * Header behavior
 *
 * @author Viacheslav Lotsmanov
 */

define(['get_val', 'jquery'], function (getVal, $) {
$(function domReady() {

	var $document = $(document);

	$('header').each(function () {

		var $header = $(this);
		var $fixedPart = $header.find('.fixed_part');

		$header.find('.interactive_line .online_support').each(function () { // marva {{{1
			var $marva = $(this).find('#marvaChatButton');
			$(this).find('.caller').on('click', function () {
				$marva.trigger('click');
				return false;
			});
		}); // marva }}}1

		function fixedHorizontalScroll() {
			$fixedPart.css('left', -($document.scrollLeft()) + 'px');
		}

		$(window).on('resize scroll', fixedHorizontalScroll);
		fixedHorizontalScroll();
		setTimeout(fixedHorizontalScroll, 1);

	}); // <header> $.each()

}); // domReady()
}); // define()
