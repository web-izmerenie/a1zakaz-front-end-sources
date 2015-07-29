/**
 * Localization values
 *
 * @author Viacheslav Lotsmanov
 * @encoding utf-8
 */

define(['get_val'], function (getVal) {

	var locals = {

		'ru': {

			'forms': {
				'call_me_later_success': 'Ваша заявка на звонок успешно отправлена.',
				'order': {
					'uploading_cancel': 'Отменить загрузку',
					'remove_uploaded_file': 'Удалить файл',
				},
				'ask': {
					'remove_uploaded_file': 'Удалить загруженный файл «#FILE_NAME#»?',
				},
				'order_wait_for_uploading_files': 'В данный момент загружаются файлы, дождитесь окончания загрузки файлов и отправьте заказ.',
				'order_success': 'Ваш заказ принят.',
				'write_to_director_success': 'Ваше сообщение успешно отправлено.',
			},

			'err': {
				'popup_block': 'Не обнаружено содержимое для всплывающего блока.',
				'dialog_box': 'Произошла непредвиденная ошибка создания диалогового окна.',

				'forms': {
					'ajax_req': 'Ошибка отправки данных формы.',
					'parse': 'Ошибка обработки данных от сервера.',
					'parse_unknown': 'Неизвестная ошибка обработки данных формы.',
					'no_code': 'Отсутствует код ошибки.',
					'unknown_code': 'Неизвестный код ошибки.',
					'no_fields_list': 'Отсутствует список полей.',
					'required_field': 'Это поле обязательно для заполнения',
					'incorrect_field_value': 'Поле заполнено некорректно',
					'required_field_standalone': 'Не заполнено обязательное поле.',
					'incorrect_field_value_standalone': 'Некорректное значение поля.',
				},

				'unsupported_filereader': 'Ваш браузер неполноценно поддерживает работу с загрузкой файлов.',
				'unsupported_feature': 'Вашим браузером не поддерживаются некоторые функции, необходимые для полноценной работы сайта.',
				'may_work_incorrectly': 'Функционал может работать некорректно или неполностью.',
				'recommend_update_browser': 'Рекомендуем обновить ваш браузер до последней версии.',
				'unknown_dragndrop_init_err': 'Неизвестная ошибка инициализации загрузчика файлов.',
				'upload_file': 'Произошла ошибка загрузки файла «#FILE_NAME#».',
				'upload_file_fault': 'Не удалось загрузить файл «#FILE_NAME#».',
				'upload_file_extension': 'Загружаемый файл имеет недопустимое расширение.',
				'add_file_to_upload': 'Произошла ошибка при добавлении файла на загрузку.',
				'remove_uploaded_file': 'Не удалось удалить загруженный файл «#FILE_NAME#».',
			},

			'remove': 'Удалить',
			'ok': 'OK',

		},

		'defaultLocal': getVal('lang'),

	};

	return locals;

}); // define()
