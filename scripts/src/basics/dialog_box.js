/**
 * Dialog box module
 *
 * @module dialog_box
 * @exports DialogBox
 * @requires jquery
 * @requires get_val
 * @version r1
 * @author Viacheslav Lotsmanov
 * @license GNU/GPLv3 by Free Software Foundation (https://github.com/unclechu/js-useful-amd-modules/blob/master/GPLv3-LICENSE)
 * @see {@link https://github.com/unclechu/js-useful-amd-modules/|GitHub}
 */

define(['jquery', 'get_val'], function ($, getVal) {

	/**
	 * @callback DialogBox~callback
	 * @param {Error|Null} err Exception
	 * @this {DialogBox}
	 */

	/**
	 * @name DialogBox
	 * @constructor
	 * @public
	 * @param {DialogBox~params} params
	 * @param {DialogBox~callback} [callback]
	 * @exception {Error} DialogBox~IncorrectArgument
	 * @exception {Error} DialogBox~NoParams
	 * @exception {Error} DialogBox~AnotherIsOpen
	 * @exception {Error} DialogBox~IncorrectParamValue
	 * @exception {Error} DialogBox~NoMessages
	 */
	function DialogBox(params, callback) { // {{{1

		/**
		 * @private
		 * @instance
		 */
		var self = this;

		/** @private */ var key;
		/** @private */ var i;

		/** @private */ self._callback = callback;

		callback = undefined;

		// validate arguments {{{2

		if (typeof self._callback !== 'undefined' && typeof self._callback !== 'function') {
			throw new DialogBox.exceptions.IncorrectArgument(null, 'callback');
		}

		if (typeof params === 'undefined') {
			self.makeError(new DialogBox.exceptions.NoParams());
			return false;
		}

		// validate arguments }}}2

		/**
		 * @private
		 * @instance
		 */
		self._$html = $('html');

		/**
		 * @private
		 * @instance
		 */
		self._$body = $('body');

		// params list {{{2

		/**
		 * @private
		 * @instance
		 */
		self._params = $.extend(true, {

			/**
			 * @typedef DialogBox~params
			 * @type {Object.<*>}
			 * @prop {DialogBox~paramType} [type=DialogBox.type.message]
			 * @prop {Array.<string>} messages
			 * @prop {DialogBox~paramTemplates} [templates]
			 * @prop {string} [htmlClass=dialog_box]
			 * @prop {string} [overflowClass=dialog_box_overflow]
			 * @prop {string} [dialogBoxClass=dialog_box]
			 * @prop {string} [closerClass=closer]
			 * @prop {function} [closeCallback]
			 * @prop {function} [destroyCallback]
			 * @prop {boolean} [closeOutOfBox=false]
			 * @prop {string} [closeOutOfBoxExcludeSelector] Children of "dialogBoxClass"
			 * @prop {string} [bindSuffix=.dialog_box] Suffix for jQuery binds
			 * @prop {Array.<string>|Object.<string>} [buttons] Buttons for "question" type (array of buttons titles (answer is button index) or key-value object (answer is key))
			 */

			/**
			 * @typedef DialogBox~paramTemplates
			 * @type {Object.<string>}
			 * @prop {string} overflow
			 * @prop {string} dialogBox
			 * @prop {string} message
			 * @prop {string} buttons
			 * @prop {string} button
			 */

			type: DialogBox.type.message,
			messages: null,
			htmlClass: 'dialog_box',
			overflowClass: 'dialog_box_overflow',
			dialogBoxClass: 'dialog_box',
			closerClass: 'closer',

			/**
			 * @callback DialogBox~closeCallback
			 * @param {number|string} [answer] Answer for "question" type
			 * @this {DialogBox}
			 */
			closeCallback: function () { return true; },

			destroyCallback: function () {},
			closeOutOfBox: false,
			closeOutOfBoxExcludeSelector: null,
			bindSuffix: '.dialog_box',
			buttons: null

		}, params || {});

		self._params.templates = $.extend(
			{
				overflow: '<div class="#OVERFLOW_CLASS#"></div>',
				dialogBox: '<div class="#DIALOG_BOX_CLASS# #TYPE_NAME#">'+
						'<a class="#CLOSER_CLASS#"></a>'+
						'<div class="messages">#MESSAGES#</div>'+
						'#BUTTONS_BLOCK#'+
					'</div>',
				message: '<p>#MESSAGE#</p>',
				buttons: '<div class="buttons">#BUTTONS#</div>',
				button: '<a class="button" data-answer="#ANSWER_CODE#">#TITLE#</a>'
			},
			((typeof params.templates === 'object') ? params.templates : {})
		);

		// params list }}}2

		if (self._$html.hasClass( self._params.htmlClass )) {
			self.makeError(new DialogBox.exceptions.AnotherIsOpen());
			return false;
		}

		// validation of params {{{2

		var correct = false;
		for (key in DialogBox.type) {
			if (DialogBox.type[key] === self._params.type) {
				correct = true;
			}
		}

		if (!correct) {
			self.makeError(new DialogBox.exceptions.IncorrectParamValue(null, 'type'));
			return false;
		}

		// messages {{{3

		if (self._params.messages === null) {
			self.makeError(new DialogBox.exceptions.NoMessages());
			return false;
		}

		if (!Array.isArray(self._params.messages)) {
			self.makeError(new DialogBox.exceptions.IncorrectParamValue(null, 'messages'));
			return false;
		}

		for (i=0; i<self._params.messages.length; i++) {
			if (typeof self._params.messages[i] !== 'string') {
				self.makeError(new DialogBox.exceptions.IncorrectParamValue(null, 'messages'));
				return false;
			}
		}

		if (self._params.messages.length <= 0) {
			self.makeError(new DialogBox.exceptions.NoMessages());
			return false;
		}

		// messages }}}3

		if (typeof self._params.htmlClass !== 'string') {
			self.makeError(new DialogBox.exceptions.IncorrectParamValue(null, 'htmlClass'));
			return false;
		}

		if (typeof self._params.overflowClass !== 'string') {
			self.makeError(new DialogBox.exceptions.IncorrectParamValue(null, 'overflowClass'));
			return false;
		}

		if (typeof self._params.dialogBoxClass !== 'string') {
			self.makeError(new DialogBox.exceptions.IncorrectParamValue(null, 'dialogBoxClass'));
			return false;
		}

		if (typeof self._params.closerClass !== 'string') {
			self.makeError(new DialogBox.exceptions.IncorrectParamValue(null, 'closerClass'));
			return false;
		}

		if (typeof self._params.closeCallback !== 'function') {
			self.makeError(new DialogBox.exceptions.IncorrectParamValue(null, 'closeCallback'));
			return false;
		}

		if (
			typeof params.templates !== 'undefined' &&
			typeof params.templates !== 'object'
		) {
			self.makeError(new DialogBox.exceptions.IncorrectParamValue(null, 'templates'));
			return false;
		}

		for (key in self._params.templates) {
			if (typeof self._params.templates[key] !== 'string') {
				self.makeError(new DialogBox.exceptions.IncorrectParamValue(null, 'templates'));
				return false;
			}
		}

		if (
			typeof params.buttons !== 'undefined' &&
			params.buttons !== null
		) {
			if ($.isArray(params.buttons)) {
				for (i=0; i<params.buttons.length; i++) {
					if (typeof params.buttons[i] !== 'string') {
						self.makeError(new DialogBox.exceptions.IncorrectParamValue(null, 'buttons'));
						return false;
					}
				}
			} else if ($.isPlainObject(params.buttons)) {
				for (key in params.buttons) {
					if (typeof key !== 'string' || typeof params.buttons[key] !== 'string') {
						self.makeError(new DialogBox.exceptions.IncorrectParamValue(null, 'buttons'));
						return false;
					}
				}
			} else {
				self.makeError(new DialogBox.exceptions.IncorrectParamValue(null, 'buttons'));
				return false;
			}
		}

		// validation of params }}}2

		params = undefined;

		self._$html.addClass( self._params.htmlClass );

		/**
		 * @private
		 * @instance
		 */
		self._readyLevel = 0;

		self._answer = -1;

		// show {{{2

		self._$body.prepend( self.renderTemplate(self._params.templates.overflow) );
		self._$body.prepend( self.renderTemplate(self._params.templates.dialogBox) );

		self._$body.find('.buttons .button').click(function () {

			if (self._closing) return;

			var $b = $(this);
			var answer = $b.attr('data-answer');

			if ($.isArray(self._params.buttons)) {
				answer = parseInt(answer, 10);
			}

			self._answer = answer;
			self.close();

			return false;

		});

		/**
		 * @private
		 * @instance
		 */
		self._$overflow = self._$body.children('.' + self._params.overflowClass);

		/**
		 * @private
		 * @instance
		 */
		self._$dialogBox = self._$body.children('.' + self._params.dialogBoxClass);

		$([self._$overflow.get(0), self._$dialogBox.get(0)])
			.animate({ opacity: 1 }, getVal('animationSpeed'), function () {

				if (this === self._$overflow.get(0)) self._readyLevel++;
				else if (this === self._$dialogBox.get(0)) self._readyLevel++;

				self.initCallback();

			});

		// show }}}2

		self._readyLevel++;
		self.initCallback();

	} // DialogBox() }}}1

	/**
	 * Types of dialog boxes (enum)
	 *
	 * @static
	 * @public
	 */
	DialogBox.type = { // {{{1

		/**
		 * @typedef DialogBox~paramType
		 * @type {Object.<*>}
		 * @prop {enum} message Just message
		 * @prop {enum} question Message and one button
		 */

		message: 0,
		question: 1

	}; // DialogBox.type }}}1

	/**
	 * Throw error or delegate exception to callback
	 *
	 * @memberOf DialogBox
	 * @protected
	 * @static
	 * @param {Error} exception
	 * @returns {boolean} Returns true or throws exception
	 */
	DialogBox.prototype.makeError = // {{{1
	function makeError(exception) {

		var self = this;

		if (this._callback) {
			setTimeout($.proxy(self._callback, self, exception), 1);
			return true;
		}

		throw exception;

	}; // DialogBox.prototype.makeError() }}}1

	/**
	 * @memberOf DialogBox
	 * @protected
	 * @static
	 * @param {string} str
	 * @returns {string} Rendered string
	 */
	DialogBox.prototype.renderTemplate = // {{{1
	function renderTemplate(str) {

		var self = this;

		str = str.replace(/#OVERFLOW_CLASS#/g, self._params.overflowClass);
		str = str.replace(/#DIALOG_BOX_CLASS#/g, self._params.dialogBoxClass);
		str = str.replace(/#CLOSER_CLASS#/g, self._params.closerClass);

		for (var key in DialogBox.type) {
			if (DialogBox.type[key] === self._params.type) {
				str = str.replace(/#TYPE_NAME#/g, key);
			}
		}

		var messages = '';
		$.each(self._params.messages, function (i, msg) {
			messages += self._params.templates.message.replace(/#MESSAGE#/g, msg);
		});
		str = str.replace(/#MESSAGES#/g, messages);

		if (self._params.type === DialogBox.type.message) {
			str = str.replace(/#BUTTONS_BLOCK#/g, '');
		} else if (self._params.type === DialogBox.type.question) {
			var buttonsHTML = self._params.templates.buttons;
			var buttons = [];
			if (self._params.buttons) {
				$.each(self._params.buttons, function (key, val) {
					buttons.push(
						self._params.templates.button
							.replace(/#TITLE#/g, val)
							.replace(/#ANSWER_CODE#/g, key)
					);
				});
			}
			buttonsHTML = buttonsHTML.replace(/#BUTTONS#/g, buttons.join(''));
			str = str.replace(/#BUTTONS_BLOCK#/g, buttonsHTML);
		}

		return str;

	}; // DialogBox.prototype.renderTemplate }}}1

	/**
	 * @memberOf DialogBox
	 * @private
	 * @static
	 */
	DialogBox.prototype.initCallback = // {{{1
	function initCallback() {

		var self = this;

		if (self._readyLevel >= 3) {

			// init interactive {{{2

			/**
			 * @private
			 * @instance
			 */
			self._$closer = self._$dialogBox.find('.' + self._params.closerClass);

			self._$closer.on(
				'click' + self._params.bindSuffix,
				$.proxy(self.close, self)
			);

			if (self._params.closeOutOfBox) { // {{{3
				self._$overflow.on(
					'click' + self._params.bindSuffix,
					$.proxy(self.close, self)
				);
				if (self._params.closeOutOfBoxExcludeSelector) {

					/**
					 * @private
					 * @instance
					 */
					self._$closeOutOfBoxExclude = self._$dialogBox.find( self._params.closeOutOfBoxExcludeSelector );

					$(window).on('click' + self._params.bindSuffix, function (event) {

						var $el = self._$closeOutOfBoxExclude;
						if (!$el) return true;

						var x = $el.offset().left;
						var y = $el.offset().top;
						var w = $el.innerWidth();
						var h = $el.innerHeight();

						w += parseInt($el.css('border-left-width'), 10);
						w += parseInt($el.css('border-right-width'), 10);

						h += parseInt($el.css('border-top-width'), 10);
						h += parseInt($el.css('border-bottom-width'), 10);

						// hell IE
						if (event.pageX < 0 || event.pageY < 0) return true;

						if (
							!(event.pageX >= x && event.pageX <= x+w) ||
							!(event.pageY >= y && event.pageY <= y+h)
						) {

							self.close();
							return false;

						}

						return true;

					});

				}
			} // closeOutOfBox }}}3

			// TODO: buttons triggers

			// init interactive }}}2

			if (self._callback) setTimeout($.proxy(self._callback, self, null), 1);

		}

	}; // DialogBox.prototype.callCallback }}}1

	/**
	 * @memberOf DialogBox
	 * @public
	 * @static
	 */
	DialogBox.prototype.close = // {{{1
	function close() {

		var self = this;
		var finish1 = false;
		var finish2 = false;

		if (self._closing) return; else self._closing = true;

		if (self._params.closeCallback(self._answer) === false) return;

		$([self._$overflow.get(0), self._$dialogBox.get(0)])
			.animate({ opacity: 0 }, getVal('animationSpeed'), function () {

				if (this === self._$overflow.get(0)) finish1 = true;
				else if (this === self._$dialogBox.get(0)) finish2 = true;

				if (finish1 && finish2) self.destroy();

			});

	}; // DialogBox.prototype.close }}}1

	/**
	 * @memberOf DialogBox
	 * @private
	 * @static
	 */
	DialogBox.prototype.destroy = // {{{1
	function destroy() {

		var self = this;

		var cb = self._params.destroyCallback;

		$(window).off('click' + self._params.bindSuffix);
		self._$closer.off('click' + self._params.bindSuffix);
		self._$overflow.off('click' + self._params.bindSuffix);

		self._$dialogBox.remove();
		self._$overflow.remove();

		self._$html.removeClass( self._params.htmlClass );

		self._$dialogBox = undefined;
		self._$overflow = undefined;
		self._$closeOutOfBoxExclude = undefined;
		self._$closer = undefined;
		self._$html = undefined;
		self._$body = undefined;

		self._callback = undefined;
		self._params = undefined;

		self._closing = undefined;
		self._readyLevel = undefined;
		self._answer = undefined;

		setTimeout(cb, 1);

	}; // DialogBox.prototype.destroy }}}1

	// exceptions {{{1

	/**
	 * DialogBox exceptions
	 *
	 * @memberOf DialogBox
	 * @public
	 * @type {Object.<Error>}
	 * @prop {Error} IncorrectArgument
	 * @prop {Error} NoParams
	 * @prop {Error} AnotherIsOpen
	 * @prop {Error} IncorrectParamValue
	 * @prop {Error} NoMessages
	 * @static
	 * @readOnly
	 */

	DialogBox.exceptions = {};

	/** @typedef {Error} DialogBox~IncorrectArgument */
	DialogBox.exceptions.IncorrectArgument =
	function IncorrectArgument(message, argName) {
		Error.call(this);
		this.name = 'IncorrectArgument';
		if (argName) this.argumentName = argName;
		if (message) {
			this.message = message;
		} else {
			this.message = 'Incorrect ';
			if (argName) this.message += '"'+ argName +'" ';
			this.message += 'argument value.';
		}
	};

	/** @typedef {Error} DialogBox~NoParams */
	DialogBox.exceptions.NoParams =
	function NoParams(message) {
		Error.call(this);
		this.name = 'NoParams';
		this.message = message || 'No params.';
	};

	/** @typedef {Error} DialogBox~AnotherIsOpen */
	DialogBox.exceptions.AnotherIsOpen =
	function AnotherIsOpen(message) {
		Error.call(this);
		this.name = 'AnotherIsOpen';
		this.message = message || 'Another dialog box is open.';
	};

	/** @typedef {Error} DialogBox~IncorrectParamValue */
	DialogBox.exceptions.IncorrectParamValue =
	function IncorrectParamValue(message, param) {
		Error.call(this);
		this.name = 'IncorrectParamValue';
		if (param) this.paramName = param;
		if (message) {
			this.message = message;
		} else {
			this.message = 'Incorrect ';
			if (param) this.message += '"'+ param +'" ';
			this.message += 'param value.';
		}
	};

	/** @typedef {Error} DialogBox~NoMessages */
	DialogBox.exceptions.NoMessages =
	function NoMessages(message) {
		Error.call(this);
		this.name = 'NoMessages';
		this.message = message || 'No messages in params.';
	};

	function inherit(proto) {
		if (Object.create) return Object.create(proto);
		function F() {}
		F.prototype = proto;
		return new F();
	}

	for (var key in DialogBox.exceptions) {
		DialogBox.exceptions[key].prototype = inherit(Error.prototype);
	}

	// exceptions }}}1

	return DialogBox;

}); // define()
