/**
 * Dialog Box wrapper (abstraction)
 *
 * @author Viacheslav Lotsmanov
 */

define(['jquery', 'get_val', 'get_local_text', 'dialog_box'], function ($, getVal, getLocalText, DialogBox) {

	function showDialogBox(paramsToExtend, callback) { // {{{1

		callback = callback || function () {};

		$(function domReady() {
			$('html').queue(function (freeQueue) {
				new DialogBox($.extend({

					type: DialogBox.type.message,
					templates: { dialogBox: getVal('dialogBoxTpl') },
					closeOutOfBox: true,
					closeOutOfBoxExcludeSelector: getVal('dialogBoxCloseExclude'),
					destroyCallback: function () { freeQueue(); },

				}, paramsToExtend || {}), function (err) {

					if (err) {
						alert(getLocalText('err', 'dialog_box') +'\n\n'+ err.toString());
					}

					callback.call(this);

				});
			});
		}); // domReady()

	} // showDialogBox() }}}1

	showDialogBox.DialogBox = DialogBox;

	return showDialogBox;

}); // define()
