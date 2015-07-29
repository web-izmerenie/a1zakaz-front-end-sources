/**
 * Forms logic module
 *
 * @author Viacheslav Lotsmanov
 */

define(['jquery', 'get_val', 'get_local_text', 'form_placeholder'],
function ($, getVal, getLocalText, formPlaceholder) {
$(function domReady() {

	var $page = $('html,body');
	var $body = $('body');
	var $main = $('main');
	var $footer = $('footer');

	$('header .call_me_later form').each(function () {
		$(this).find('label.text').each( formPlaceholder );
	});

	// formatting {{{1

	$('header .call_me_later form').each(function () {

		var $form = $(this);
		var $hours = $form.find('input[name=f_HOURS]');
		var $minutes = $form.find('input[name=f_MINUTS]');

		function handler(type) {

			var $input = $(this);
			var val = $input.val();
			var intVal = parseInt(val, 10);

			var newVal = null;

			if (!/^[0-9]+$/g.test(val)) {
				val = val.replace(/[^0-9]+/g, '');
				if (!/^[0-9]+$/g.test(val)) {
					val = 0;
					intVal = parseInt(val, 10);
				} else {
					intVal = parseInt(val, 10);
				}
				newVal = intVal;
			}

			if (isNaN(intVal)) {
				val = 0;
				intVal = parseInt(val, 10);
				newVal = intVal;
			}

			if (
				intVal < 0 ||
				intVal > (
					(type === 'h') ? 23 : 59
				)
			) {
				if (intVal < 0) {
					newVal = 0;
				} else {
					newVal = ((type === 'h') ? 23 : 59);
				}
			}

			if (newVal !== null && $input.val() !== '') {
				$input.val(newVal);
			}

		}

		$hours.on('change keyup', function () { handler.call(this, 'h'); }).trigger('change');
		$minutes.on('change keyup', function () { handler.call(this, 'm'); }).trigger('change');

	});

	// formatting }}}1

	// posting {{{1

	function ajaxReq(url, $form, responseCallback, dataToSend) { // {{{2

		if ($form.hasClass('ajax_process')) return false;
		$form.addClass('ajax_process');

		function end() { $form.removeClass('ajax_process'); }

		$.ajax({
			url: url,
			type: 'POST',
			cache: false,
			dataType: 'text',
			data: dataToSend,
			success: function (data) {
				require(['json_answer'], function (jsonAnswer) {

					jsonAnswer.validate(data, function (err, json) {

						if (err) {
							responseCallback(err, null, end, jsonAnswer);
						} else {
							responseCallback(null, json, end, jsonAnswer);
						}

					});

				});
			},
			error: function () {
				require(['dialog_box_wrapper'], function (showDialogBox) {
					showDialogBox({
						messages: [ getLocalText('err', 'forms', 'ajax_req') ],
						closeCallback: function () { end(); }
					});
				});
			}
		});

	} // ajaxReq() }}}2

	function errorCallback($form, err, json, end, showDialogBox, nameReplace) { // {{{2

		var errBindSuffix = '.form_error_messages';
		var errArr = [];

		if (err.json) {

			if (err.json.error_code && err.json.field_names) {

				if (
					err.json.error_code === 'required_field' ||
					err.json.error_code === 'incorrect_field_value'
				) {

					$.each(err.json.field_names, function (i, fieldName) {

						if (nameReplace) {
							$.each(nameReplace, function (key, val) {
								if (fieldName === key) {
									fieldName = val;
									return false;
								}
							});
						}

						var $field = $form.find('input[name="'+ fieldName +'"]');
						if ($field.size() < 1) $field = $form.find('textarea[name="'+ fieldName +'"]');

						if ($field.size() < 1) {
							errArr = [((err.json.error_code === 'required_field') ?
								getLocalText('err', 'forms', 'required_field_standalone') :
								getLocalText('err', 'forms', 'incorrect_field_value_standalone'))];
							return;
						}

						$field.each(function () {

							var $field = $(this);
							var $label = $field.closest('label');
							var $errorMsg = $label.find('.error_msg');

							if ($label.size() < 1) $label = $field.closest('.hours');
							if ($label.size() < 1) $label = $field.closest('.minutes');
							if ($label.size() < 1) return;

							$errorMsg
								.stop().css('opacity', 0).css('display', 'block')
								.text(((err.json.error_code === 'required_field') ?
									getLocalText('err', 'forms', 'required_field') :
									getLocalText('err', 'forms', 'incorrect_field_value')))
								.animate({ opacity: 1 }, getVal('animationSpeed'));

							$label
								.addClass('error_response')
								.off('click' + errBindSuffix)
								.on('click' + errBindSuffix, function () {

									$label.off('click' + errBindSuffix);
									$errorMsg.stop().animate({
										opacity: 0
									}, getVal('animationSpeed'), function () {
										$errorMsg.css('display', 'none');
									});
									$label.removeClass('error_response');
									return true;

								});

						}); // $field.each()

					}); // $.each(err.json.field_names,

					if (errArr.length > 0) {
						showDialogBox({
							messages: errArr,
							closeCallback: function () { end(); }
						});
					} else {
						setTimeout(end, 1);
					}

					return;

				} else {
					errArr.push( getLocalText('err', 'forms', 'unknown_code') );
				}

			} else {
				errArr.push( getLocalText('err', 'forms', 'parse_unknown') );
			}

		} else {
			errArr.push( err.toString() );
		}

		showDialogBox({
			messages: errArr,
			closeCallback: function () { end(); }
		});

	} // errorCallback() }}}2

	function initErrMsg($form) { // {{{2

		if ($form.data('error_msg_init') !== true) {
			$form.find('label.text, div.text label, label.textarea').append('<span class="error_msg"></span>');
			$form.data('error_msg_init', true);
		}

		$form.find('.error_msg')
			.stop()
			.animate({ opacity: 0 }, getVal('animationSpeed'), function () {
				$(this).text('');
			});

		$form.find('label').removeClass('error_response');

	} // initErrMsg() }}}2

	$('header .call_me_later form').submit(function () { // {{{2

		var $form = $(this);

		initErrMsg( $form );

		function successCallback(json, end, showDialogBox) { // {{{3

			showDialogBox({
				messages: [ getLocalText('forms', 'call_me_later_success') ],
				closeCallback: function () {
					$form.data('close_callback', function () { end(); });
					$form.find('.closer').trigger('click');
				}
			});

		} // successCallback() }}}3

		ajaxReq($form.attr('action'), $form, function (err, json, end) {

			require(['dialog_box_wrapper'], function (showDialogBox) {

				if (err) errorCallback($form, err, json, end, showDialogBox, {
					'name': 'f_NAME',
					'phone': 'f_PHONE',
					'time': 'f_RECALL',
					'hours': 'f_HOURS',
					'minutes': 'f_MINUTS',
				});
				else successCallback(json, end, showDialogBox);

			});

		}, $form.serializeArray());

		return false;

	}); // .call_me_later form }}}2

	function writeToDirectorSubmitHandler() { // {{{2

		var $form = $(this);

		initErrMsg( $form );

		function successCallback(json, end, showDialogBox) { // {{{3

			showDialogBox({
				messages: [ getLocalText('forms', 'write_to_director_success') ],
				closeCallback: function () {
					$form.find('input[type=text], textarea').val('').trigger('blur').each(function () {
						if ($(this).data('blur')) $(this).data('blur')(true);
					});
					if (!$body.hasClass('write_to_director_form_hidden')) {
						$form.closest('.write_to_director').find('>.opener').trigger('click');
					}
					setTimeout(end, getVal('animationSpeed'));
				}
			});

		} // successCallback() }}}3

		var data = $form.serializeArray();
		data.push({
			name: 'action',
			value: 'write_to_director',
		});

		ajaxReq($form.attr('action'), $form, function (err, json, end) {

			require(['dialog_box_wrapper'], function (showDialogBox) {

				if (err) errorCallback($form, err, json, end, showDialogBox);
				else successCallback(json, end, showDialogBox);

			});

		}, data);

		return false;

	} // writeToDirectorFormHiddenHeight() }}}2

	// posting }}}1

	$('footer .write_to_director').each(function () { // {{{1

		var $formWrap = $(this);
		var $formOpener = $formWrap.find('>.opener');
		var $form = $formWrap.find('>form');

		// source sizes
		var formWrapHeight = $formWrap.height();
		var footerHeight = parseInt($footer.height(), 10);
		var footerWithoutFormWrapHeight = parseInt($footer.height(), 10) - formWrapHeight;
		var mainPaddOffset = parseInt($main.css('padding-bottom'), 10) - footerHeight;

		var hiddenHeight = getVal('writeToDirectorFormHiddenHeight');
		var hiddenFooterHeight = footerWithoutFormWrapHeight + hiddenHeight;

		var process = false;
		var speed = getVal('animationSpeed') * 2;

		$formOpener.click(function () { // {{{2
			if (process) return false; else process = true;

			var className = 'write_to_director_form_hidden';

			// show
			if ($body.hasClass(className)) {

				$body.removeClass(className);

				$footer.animate({
					height: footerHeight + 'px',
					'margin-top': (-( footerHeight )) + 'px',
				}, speed);

				$formWrap.animate({
					height: formWrapHeight + 'px',
				}, speed);

				$form.slideDown(speed);

				$main.animate({
					'padding-bottom': ( footerHeight + mainPaddOffset ) + 'px',
				}, speed, function () {
					process = false;
					$page.stop().animate({
						scrollTop: $formOpener.offset().top - 20,
					}, speed);
				});

			// hide
			} else {

				$form.slideUp(speed);

				$formWrap.animate({
					height: hiddenHeight + 'px',
				}, speed);

				$footer.animate({
					height: hiddenFooterHeight + 'px',
					'margin-top': (-( hiddenFooterHeight )) + 'px',
				}, speed);

				$main.animate({
					'padding-bottom': ( hiddenFooterHeight + mainPaddOffset ) + 'px',
				}, speed, function () {
					$body.addClass(className);
					process = false;
				});

			} // if

			return false;
		}); // form opener logic }}}2

		$formOpener.trigger('click');

		$form.each(function () {

			var $form = $(this);

			$form.find('label.text, div.text > label, label.textarea').each( formPlaceholder );

			$form.on('submit', writeToDirectorSubmitHandler);

			$form.find('div.text.with_select').each(function () { // {{{2

				var $wrap = $(this);
				var $label = $wrap.find('>label');
				var $input = $label.find('>input');
				var $opener = $wrap.find('>.opener');
				var $list = $wrap.find('ul.select_list');

				$input.prop('autocomplete', 'off');

				$input.data('blur', function (placeholderTrigger) {
					$list.stop().slideUp(getVal('animationSpeed'), function () {
						$wrap.removeClass('select_opened');
					});
					if (placeholderTrigger === true)
						$input.data('form_placeholder').blurHandler.call( $input.get(0) );
				});

				$list.find('>li').on('click', function () {
					$input
						.val($(this).text())
						.data('blur')(true);
					return false;
				});

				$input.on('focus', function () {
					if ($wrap.hasClass('select_opened')) return;
					$wrap.addClass('select_opened');
					$list.stop().slideDown(getVal('animationSpeed'));
				});

				$input.off('blur.form_placeholder');

				$(document).on('click', function (e) {
					// hell IE
					if (e.pageX < 0 || e.pageY < 0) return;

					var offsetX = $label.offset().left;
					var offsetY = $label.offset().top;
					var bottomOffsetX = offsetX + $label.innerWidth() + 2;
					var bottomOffsetY = offsetY + $label.innerHeight() + 2;

					if ($wrap.hasClass('select_opened'))
						bottomOffsetY += $list.innerHeight() + 1;

					if (
						e.pageX < offsetX || e.pageY < offsetY ||
						e.pageX > bottomOffsetX || e.pageY > bottomOffsetY
					) $input.data('blur')(true);
				});

				$opener.on('click', function () {
					if ($wrap.hasClass('select_opened')) {
						$input.data('blur')();
						$input.focus();
					} else $input.focus();
					return false;
				});

			}); // div.text.with_select $.each }}}2

			var $allInputs = $form.find('input, textarea');

			$allInputs.on('focus', function () {
				var thisInput = this;

				$allInputs.each(function () {
					if (thisInput === this) return;
					if ($(this).data('blur')) $(this).data('blur')(true);
				});
			});

		}); // $form.each()

	}); // "write to director" form }}}1

}); // domReady()
}); // define()
