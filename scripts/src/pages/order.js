/**
 * "order" page scripts
 *
 * @author Viacheslav Lotsmanov
 * @encoding utf-8
 */

define(['jquery', 'get_val', 'get_local_text'], function ($, getVal, getLocalText) {
$(function domReady() {

	var tplListItem = ''+
		'<li data-upload-id="#UPLOAD_ID#" data-file-name="#FILE_NAME#" data-file-size="#FILE_SIZE#" data-file-type="#FILE_TYPE#">'+
			'<span class="filename">#FILE_NAME#</span>'+
			'<span class="progress_bar"><span class="progress"></span></span>'+
			'<a class="remove" title="#REMOVE_TITLE#"></a>'+
		'</li>';
	var errBindSuffix = '.order_form_err_bind';

	function ajaxReq(url, responseCallback, dataToSend, $form/*optional*/) { // {{{1

		if ($form) {
			if ($form.hasClass('ajax_process')) return false;
			$form.addClass('ajax_process');
		}

		function end() { if ($form) $form.removeClass('ajax_process'); }

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

	} // ajaxReq() }}}1

	$('form.order_form').each(function () {

		var $form = $(this);
		var $files = $form.find('.files');
		var $dragndropArea = $files.find('.dragndrop_area');
		var $list = $files.find('ul.files_list');

		var $inputFile = $('<input/>', { type: 'file', multiple: 'multiple' });
		var $addFileB = $form.find('.add_file_by_button .add');

		var url = '/order/';

		$form.data('dragndrop_object', null);

		$addFileB.append( $inputFile );

		function removeButtonHandler() { // {{{1

			var $rm = $(this);
			var $el = $rm.closest('li');

			var uploadId = parseInt($el.attr('data-upload-id'), 10);
			var filename = $el.attr('data-file-name');
			var uploaded = $el.hasClass('uploaded');

			if (!uploaded) { // aborting

				$form.data('dragndrop_object').abort(uploadId);
				$el.remove();

			} else { // removing

				require(['dialog_box_wrapper'], function (showDialogBox) {
					showDialogBox({
						type: showDialogBox.DialogBox.type.question,
						messages: [ getLocalText('forms', 'ask', 'remove_uploaded_file', { '#FILE_NAME#': filename }) ],
						closeCallback: function (answer) {
							if (answer !== -1) {
								ajaxReq(url, function (err, json, end) {

									if (err) {
										showDialogBox({
											messages: [ getLocalText('err', 'remove_uploaded_file', { '#file_name#': filename }) ],
											closeCallback: function () { end(); },
										});
										return;
									}

									$el.remove();
									end();

								}, {
									action: 'remove_uploaded_file',
									upload_id: uploadId,
								});
							}
						},
						buttons: [ getLocalText('remove') ],
					}); // showDialogBox()
				}); // require(['dialog_box_wrapper']...)

			}

			return false;

		} // removeButtonHandler() }}}1

		require(['dragndrop_file_upload'], function (DragNDropFileUpload) {
			new DragNDropFileUpload({
				dragndropArea: $dragndropArea,
				inputFile: $inputFile,
				uploadUrl: url,
				progressCallback: function (id, progress) { // {{{1

					var $el = $list.find('li[data-upload-id="'+ id +'"]');
					$el.find('.progress_bar .progress').css('width', progress + '%');

				}, // progressCallback }}}1
				addFileCallback: function (err, id, fileName, fileSize, fileType) { // {{{1

					if (err) { // add file to upload error {{{2
						require(['dialog_box_wrapper'], function (showDialogBox) {
							showDialogBox({
								messages: [ getLocalText('err', 'add_file_to_upload') ],
							});
						});
						return;
					} // add file to upload error }}}2

					var html = tplListItem
						.replace(/#UPLOAD_ID#/g, id)
						.replace(/#FILE_NAME#/g, fileName)
						.replace(/#FILE_SIZE#/g, fileSize)
						.replace(/#FILE_TYPE#/g, fileType)
						.replace(/#REMOVE_TITLE#/g, getLocalText('forms', 'order', 'uploading_cancel'));
					$list.append(html);

					var $el = $list.find('li[data-upload-id="'+ id +'"]');
					var $filename = $el.find('.filename');
					var needWidth = parseInt($filename.css('min-width'), 10);
					if ($filename.width() > needWidth) {
						var text = $filename.text();
						while ($filename.width() > needWidth) {
							text = text.slice(0, -1);
							$filename.text(text + '…');
						}
					}

					$el.find('.remove').click(removeButtonHandler);

				}, // addFileCallback }}}1
				endCallback: function (err, id, response) { // {{{1

					var $el = $list.find('li[data-upload-id="'+ id +'"]');

					if (err) { // upload file error {{{2
						require(['dialog_box_wrapper'], function (showDialogBox) {
							showDialogBox({
								messages: [ getLocalText('err', 'upload_file', { '#FILE_NAME#': $el.attr('data-file-name') }) ],
								closeCallback: function () { $el.remove(); },
							});
						});
						return;
					} // upload file error }}}2

					require(['json_answer'], function (jsonAnswer) {
						jsonAnswer.validate(response, function (err, json) {

							if (err) {
								require(['dialog_box_wrapper'], function (showDialogBox) {
									var errMsg = [ getLocalText('err', 'upload_file_fault', { '#FILE_NAME#': $el.attr('data-file-name') }) ];
									if (
										$.isPlainObject(err.json) &&
										'error_code' in err.json &&
										err.json.error_code === 'unsupported_format'
									) errMsg.push( getLocalText('err', 'upload_file_extension') );
									showDialogBox({
										messages: errMsg,
										closeCallback: function () { $el.remove(); },
									});
								});
								return;
							}

							$el.addClass('uploaded');
							$el.find('.remove').attr('title', getLocalText('forms', 'order', 'remove_uploaded_file'));
							$el.find('.progress_bar').remove();

						});
					});

				}, // endCallback }}}1
				postData: {
					action: 'upload_file',
				},
				uploaderInitCallback: function () { // {{{1

					var uploader = this;

					uploader.extendPostData({
						upload_id: uploader.params.id,
					});

				}, // uploaderInitCallback }}}1
			}, function (err) {

				if (err) { // catch init dragndrop errors {{{1
					require(['dialog_box_wrapper'], function (showDialogBox) {
						if (err instanceof DragNDropFileUpload.exceptions.UnsupportedFeature) {
							if (err instanceof DragNDropFileUpload.exceptions.FileReaderIsNotSupported) {
								showDialogBox({ messages: [
									getLocalText('err', 'unsupported_filereader'),
									getLocalText('err', 'may_work_incorrectly'),
									getLocalText('err', 'recommend_update_browser')
								] });
							} else {
								showDialogBox({ messages: [
									getLocalText('err', 'unsupported_feature'),
									getLocalText('err', 'may_work_incorrectly'),
									getLocalText('err', 'recommend_update_browser')
								] });
							}
						} else {
							showDialogBox({ messages: [
								getLocalText('err', 'unknown_dragndrop_init_err'),
								getLocalText('err', 'may_work_incorrectly')
							] });
						}
					});
					return;
				} // catch init dragndrop errors }}}1

				$form.data('dragndrop_object', this);

			}); // new DragNDropFileUpload()
		}); // require(['dragndrop_file_upload']...)

		$form.submit(function () { // {{{1

			if ($form.data('error_msg_init') !== true) {
				$form.find('label.text .field, label.textarea .field').append('<span class="error_msg"></span>');
				$form.data('error_msg_init', true);
			}

			$form.find('.error_msg')
				.stop()
				.animate({ opacity: 0 }, getVal('animationSpeed'), function () {
					$(this).text('');
				});

			$form.find('label .field, .files').removeClass('error_response');

			if ($list.find('li:not(.uploaded)').size() > 0) {
				require(['dialog_box_wrapper'], function (showDialogBox) {
					showDialogBox({
						messages: [ getLocalText('forms', 'order_wait_for_uploading_files') ],
					}); // showDialogBox()
				}); // require(['dialog_box_wrapper']...)
				return false;
			}

			var dataToPost = $form.serializeArray();
			dataToPost.push({ name: 'action', value: 'post_form' });

			var files = [];
			$list.find('>li').each(function () { files.push($(this).attr('data-upload-id')); });
			dataToPost.push({ name: 'files_uploads_id', value: files.join(',') });

			ajaxReq('/netcat/add.php', function (err, json, end) {

				function errBox(msgArr) {
					require(['dialog_box_wrapper'], function (showDialogBox) {
						showDialogBox({
							messages: msgArr,
							closeCallback: function () { end(); },
						}); // showDialogBox()
					}); // require(['dialog_box_wrapper']...)
				}

				if (err && err.json) {
					if (err.json.error_code) {

						if (err.json.error_code === 'required_field' || err.json.error_code === 'incorrect_field_value') {
							if (err.json.fields) {
								$.each(err.json.fields, function (i, field) {

									var $field, $label;

									if (field === 'files') {
										$label = $form.find('.files');
									} else {
										$field = $form.find('input[name="'+ field +'"], textarea[name="'+ field +'"]');
										$label = $field.closest('label').find('.field');
									}

									var $errorMsg = $label.find('.error_msg');

									$errorMsg
										.stop().css('opacity', 0).css('display', 'block')
										.text(((err.json.error_code === 'required_field') ?
											getLocalText('err', 'forms', 'required_field') :
											getLocalText('err', 'forms', 'incorrect_field_value')))
										.animate({ opacity: 1 }, getVal('animationSpeed'));

									$label
										.addClass('error_response')
										.off('click' + errBindSuffix)
										.on(
											'click' + errBindSuffix +
											' dragenter' + errBindSuffix +
											' dragleave' + errBindSuffix +
											' dragover' + errBindSuffix +
											' drop' + errBindSuffix,
											function () {

												$label.off(
													'click' + errBindSuffix +
													' dragenter' + errBindSuffix +
													' dragleave' + errBindSuffix +
													' dragover' + errBindSuffix +
													' drop' + errBindSuffix
												);
												$errorMsg.stop().animate({
													opacity: 0
												}, getVal('animationSpeed'), function () {
													$errorMsg.css('display', 'none');
												});
												$label.removeClass('error_response');
												return true;

											}
										);

								});
								end();
							} else errBox([
								getLocalText('err', 'forms', 'parse'),
								getLocalText('err', 'forms', 'no_fields_list'),
							]);
						} else {
							errBox([ getLocalText('err', 'forms', 'unknown_code') ]);
						}

					} else errBox([
						getLocalText('err', 'forms', 'parse'),
						getLocalText('err', 'forms', 'no_code'),
					]);
					return;
				} else if (err) {
					errBox([ getLocalText('err', 'forms', 'parse_unknown') ]);
					return;
				}

				require(['dialog_box_wrapper'], function (showDialogBox) {
					showDialogBox({
						type: showDialogBox.DialogBox.type.question,
						messages: [ getLocalText('forms', 'order_success') ],
						closeCallback: function (answer) {
							window.location = '/'; // to main page
						},
						buttons: [ getLocalText('ok') ],
					}); // showDialogBox()
				}); // require(['dialog_box_wrapper']...)

			}, dataToPost, $form);

			return false;

		}); // $form.submit() }}}1

	}); // .each()

}); // domReady()
}); // define()
