/**
 * Main module
 *
 * @author Viacheslav Lotsmanov
 */

define(['basics/get_val', 'jquery'], function (getVal, $) {
$(function domReady() {

	require.config({
		map: {
			'*': {

				/* short name aliases */

				// outsource modules
				'jquery.cookie': 'libs/jquery.cookie-1.4.0',
				'dragndrop_file_upload': 'libs/dragndrop_file_upload',

				// basics aliases
				'dynamic_api': 'basics/dynamic_api',
				'get_local_text': 'basics/get_local_text',
				'get_val': 'basics/get_val',
				'json_answer': 'basics/json_answer',
				'dialog_box': 'basics/dialog_box',
				'form_placeholder': 'basics/form_placeholder',

			}
		}
	});

	require(['header']);

	if ($('.print_stack').size() > 0) {
		require(['pages/main']);
	}

	if ($('html').hasClass('error_404')) {
		require(['pages/error_404']);
	}

	if ($('.vk_group_widget').size() > 0) {
		require(['vk_group_widget']);
	}

	if ($('.contacts').size() > 0) {
		require(['pages/contacts']);
	}

	if ($('form.order_form').size() > 0) {
		require(['pages/order']);
	}

	require(['popups', 'forms']);

}); // domReady()
}); // define()
