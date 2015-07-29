/*!
 * Check JSON data for correct and "status" is "success"
 *
 * @version r2
 * @author Viacheslav Lotsmanov
 * @license GNU/GPLv3 by Free Software Foundation (https://github.com/unclechu/js-useful-amd-modules/blob/master/GPLv3-LICENSE)
 * @see {@link https://github.com/unclechu/js-useful-amd-modules/|GitHub}
 */

define(function () {

	/** @public */
	var exports = {};

	/**
	 * @private
	 * @inner
	 * @static
	 * @param {Error} err
	 */
	function makeError(err, callback) {

		if (callback) {
			callback(err);
		} else {
			throw err;
		}

	}

	/**
	 * @public
	 * @static
	 * @param {string} jsonData JSON string
	 * @param {callback} [callback] Callback for async return value
	 */
	function validate(jsonData, callback) {

		if (
			typeof callback !== 'function' &&
			callback !== null && callback !== undefined
		) {
			throw new exports.exceptions.IncorrectCallbackArgument(null, typeof(callback));
		}

		if (typeof jsonData !== 'string') {
			return makeError(
				new exports.exceptions.IncorrectJSONDataArgument(null, typeof(jsonData)),
				callback
			);
		}

		var parsed;

		try {
			parsed = JSON.parse(jsonData);
		} catch (err) {
			return makeError(new exports.exceptions.ParseJSONError(null, err), callback);
		}

		if (!('status' in parsed)) {
			return makeError(new exports.exceptions.NoStatusKey(), callback);
		}

		if (typeof parsed.status !== 'string') {
			return makeError(
				new exports.exceptions.IncorrectStatusType(null, typeof(parsed.status)),
				callback
			);
		}

		if (parsed.status !== 'error' && parsed.status !== 'success') {
			return makeError(
				new exports.exceptions.UnknownStatusValue(null, parsed.status, parsed),
				callback
			);
		}

		if (parsed.status === 'error') {
			return makeError(
				new exports.exceptions.ErrorStatus(null, parsed),
				callback
			);
		}

		if (callback) {
			setTimeout(function async() {
				callback(null, parsed);
			}, 1);
		} else {
			return parsed;
		}

	}

	/* exceptions {{{1 */

	/**
	 * @public 
	 * @static
	 */
	exports.exceptions = {};

	exports.exceptions.IncorrectJSONDataArgument =
	function IncorrectJSONDataArgument(message, type) {
		Error.call(this);
		this.name = 'IncorrectJSONDataArgument';
		if (message) {
			this.message = message;
		} else {
			this.message = 'Incorrect type of JSON data argument';
			if (type) this.message += ' ("'+ type +'")';
			this.message += ', must be a "string".';
		}
		if (type) this.type = type;
	};

	exports.exceptions.IncorrectCallbackArgument =
	function IncorrectCallbackArgument(message, type) {
		Error.call(this);
		this.name = 'IncorrectCallbackArgument';
		if (message) {
			this.message = message;
		} else {
			this.message = 'Incorrect callback argument';
			if (type) this.message += ' ("'+ type +'")';
			this.message += ', must be a "function".';
		}
		if (type) this.type = type;
	};

	exports.exceptions.ParseJSONError =
	function ParseJSONError(message, err) {
		Error.call(this);
		this.name = 'ParseJSONError';
		this.message = message || 'Parse JSON data error.';
		if (err) {
			this.err = err;
			if (!message) this.message += '\n' + err.toString();
		}
	};

	exports.exceptions.NoStatusKey =
	function NoStatusKey(message) {
		Error.call(this);
		this.name = 'NoStatusKey';
		this.message = message || 'No "status" key in JSON data.';
	};

	exports.exceptions.IncorrectStatusType =
	function IncorrectStatusType(message, type) {
		Error.call(this);
		this.name = 'IncorrectStatusType';
		if (message) {
			this.message = message;
		} else {
			this.message = 'Incorrect type of value of "status" key';
			if (type) this.message += ' ("'+ type +'")';
			this.message += ', must be a "string".';
		}
		if (type) this.type = type;
	};

	exports.exceptions.UnknownStatusValue =
	function UnknownStatusValue(message, val, json) {
		Error.call(this);
		this.name = 'UnknownStatusValue';
		if (message) {
			this.message = message;
		} else {
			this.message = 'Unknown value of "status" key';
			if (val) this.message += ': "'+ val +'"';
			this.message += '.';
		}
		if (val) this.value = val;
		if (json) this.json = json;
	};

	exports.exceptions.ErrorStatus =
	function ErrorStatus(message, json) {
		Error.call(this);
		this.name = 'ErrorStatus';
		this.message = message || 'Value of "status" key is "error".';
		if (json) this.json = json;
	};

	function inherit(proto) {
		if (Object.create) return Object.create(proto);
		function F() {}
		F.prototype = proto;
		return new F();
	}

	for (var key in exports.exceptions) {
		exports.exceptions[key].prototype = inherit(Error.prototype);
	}

	/* exceptions }}}1 */

	exports.validate = validate;

	return exports;

});

// vim: set noet ts=4 sts=4 sw=4 fenc=utf-8 foldmethod=marker :
