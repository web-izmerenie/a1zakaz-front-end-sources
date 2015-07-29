/*!
 * Placeholder logic handler
 *
 * @version r2
 * @author Viacheslav Lotsmanov
 * @license GNU/GPLv3 by Free Software Foundation (https://github.com/unclechu/js-useful-amd-modules/blob/master/GPLv3-LICENSE)
 * @see {@link https://github.com/unclechu/js-useful-amd-modules/|GitHub}
 */

define(['jquery', 'get_val'], function ($, getVal) {

	var bindSuffix = '.form_placeholder';

	/**
	 * Handler
	 *
	 * @this {DOM} - <label> that has <span> and <input> (or <textarea>)
	 */
	return function () {

		var $label = $(this);
		var $placeholder = $label.find('span');

		function blurHandler() {
			if ($(this).val() === '') {
				$placeholder.stop().fadeIn(getVal('animationSpeed'));
			} else {
				$placeholder.stop().fadeOut(getVal('animationSpeed'));
			}
		}

		function focusHandler() {
			$placeholder.stop().fadeOut(getVal('animationSpeed'));
		}

		$label.find('input, textarea')
			.on('focus' + bindSuffix, focusHandler)
			.on('blur' + bindSuffix, blurHandler)
			.trigger('blur' + bindSuffix)
			.each(function () {
				$(this).data('form_placeholder', {
					focusHandler: focusHandler,
					blurHandler: blurHandler
				});
			});

	}; // return ()

}); // define()
