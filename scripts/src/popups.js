/**
 * Popups module
 *
 * @author Viacheslav Lotsmanov
 */

define(['jquery', 'get_val', 'get_local_text'], function ($, getVal, getLocalText) {
$(function domReady() {

	var active = false;
	var bindSuffix = '.popup';

	var $html = $('html');
	var $body = $('body');
	var $topSide = $body.find('.top_side');
	var $page = $('html,body');

	function showPopup($parent, $popup) { // {{{1

		if (active) return;
		active = true;

		if ($popup.size() < 1) {
			alert(getLocalText('err', 'popup_block'));
			active = false;
			return;
		}

		var $overflow = $('<div class="popup_bg_overflow" />');
		var $closer = $popup.find('.closer');

		function closeHandler() {

			$closer.off('click');

			$html.removeClass('popup_mode');
			$body.css('min-height', '');
			$overflow.css('height', $body.height() + 'px');

			var readyLevel = 0;

			function readyCallback() {

				if (readyLevel < 2) return;

				$popup.css('display', 'none');
				$(window).off('resize' + bindSuffix);
				$overflow.remove();
				$overflow = undefined;
				$closer = undefined;
				active = false;

				if ($popup.data('close_callback')) {
					setTimeout(function () {
						$popup.data('close_callback')();
						$popup.removeData('close_callback');
					}, 1);
				}

			}

			$([$popup.get(0), $overflow.get(0)])
				.animate({ opacity: 0 }, getVal('animationSpeed'), function () {
					if (this === $popup.get(0)) readyLevel++;
					else if (this === $overflow.get(0)) readyLevel++;
					readyCallback();
				});

			return false;

		}

		function reposPopup() {
			$popup.css(
				'left',
				(($topSide.width() - $popup.width()) / 2) + 'px'
			);
		}

		function resize() {
			$body.css(
				'min-height',
				(parseInt($popup.css('top'), 10) * 2) +
				$popup.innerHeight() + 'px'
			);
			$overflow.css('height', $body.height() + 'px');
		}

		function update() {
			reposPopup();
			resize();
		}

		$popup
			.css('opacity', 0)
			.css('display', 'block');

		update();

		$overflow
			.css('opacity', 0)
			.css('display', 'block');

		$body.prepend( $overflow );

		if ($closer.size() < 1) {
			$closer = $('<a class="closer" />');
			$popup.prepend( $closer );
		}

		$closer.off('click').on('click', closeHandler);

		$overflow.animate({ opacity: 1 }, getVal('animationSpeed'), function () {
			update();
			$html.addClass('popup_mode');

			var scrollTopValue = $popup.offset().top - 20;

			if ($(window).height() > $popup.height()) {
				scrollTopValue = $popup.offset().top;
				scrollTopValue -= ($(window).height() - $popup.height()) / 2;
			}

			$page.stop().animate({
				scrollTop: scrollTopValue
			}, getVal('animationSpeed') * 4);
		});
		$popup.animate({ opacity: 1 }, getVal('animationSpeed'));

		$(window).on('resize' + bindSuffix, update);

	} // showPopup() }}}1

	function callMeLaterClickHandler() { // .call_me_later {{{1

		var $parent = $(this).closest('.call_me_later');
		var $popup;
		
		if ($(this).data('$popup')) {
			$popup = $(this).data('$popup');
		} else {
			$popup = $parent.find('.popup');
			$popup.addClass('call_me_later_popup');
			$popup.prependTo('body');
			$(this).data('$popup', $popup);
		}

		showPopup($parent, $popup);

		return false;

	} // .call_me_later }}}1

	function feedbackBusyHoursClickHandler() { // .busy_hours {{{1

		var $parent = $(this).closest('.busy_hours');
		var $popup;

		if ($(this).data('$popup')) {
			$popup = $(this).data('$popup');
		} else {
			$popup = $parent.find('.popup');
			$popup.addClass('busy_hours_popup');
			$popup.prependTo('body');
			$(this).data('$popup', $popup);
		}

		showPopup($parent, $popup);

		return false;

	} // .busy_hours }}}1

	$('header .interactive_line .call_me_later .caller').click(callMeLaterClickHandler);
	$('header .feedback .busy_hours .caller').click(feedbackBusyHoursClickHandler);

}); // domReady()
}); // define()
