/*!
 * Localization module
 *
 * @version r3
 * @author Viacheslav Lotsmanov
 * @license GNU/GPLv3 by Free Software Foundation (https://github.com/unclechu/js-useful-amd-modules/blob/master/GPLv3-LICENSE)
 * @see {@link https://github.com/unclechu/js-useful-amd-modules/|GitHub}
 */

define(['localization'], function (locals) {

	var curLocal;

	/**
	 * @public
	 * @exports
	 * @example getLocalText('FIRST_LEVEL', 'SECOND_LEVEL', 'KEY_OF_VALUE')
	 * @example getLocalText('FIRST_LEVEL', 'SECOND_LEVEL', 'KEY_OF_VALUE', { '#URL#': 'http://domain.org/pathname/' })
	 */
	function getLocalText(/*KEY(_LEVEL_1)[, KEY(_LEVEL_N)][, TO_REPLACE_LIST]*/) {

		var argsSrc = Array.prototype.slice.call(arguments, 0);
		var argsLog = argsSrc.slice(0);
		var cur = locals[curLocal];

		if (argsLog.length > 1) {
			if (typeof argsLog[argsLog.length-1] === 'object') {
				argsLog = argsLog.slice(0, -1);
			}
		}

		function recursive() {

			var args = Array.prototype.slice.call(arguments, 0);
			var arg = args.shift();

			if (typeof arg !== 'string') {

				// object at last argument
				if (args.length < 1 && typeof arg === 'object') {

					for (var key in arg) {
						cur = cur.replace(new RegExp(key, 'g'), arg[key]);
					}

					return cur;

				} else throw new getLocalText.exceptions.IncorrectKeyType(null, typeof arg);

			}

			if (args.length > 0) {

				if (cur[arg]) {

					cur = cur[arg];
					return recursive.apply(this, args);

				} else throw new getLocalText.exceptions.NotFound(null, argsLog.join('.'));

			} else {

				if (typeof cur[arg] === 'undefined') {

					throw new getLocalText.exceptions.NotFound(null, argsLog.join('.'));

				}

				if (typeof cur[arg] === 'string') {

					return cur[arg];

				} else {

					throw new getLocalText.exceptions.IncorrectDestination(null, argsLog.join('.'));

				}

			}

		}

		return recursive.apply(this, argsSrc);

	}

	/** @public */
	getLocalText.setCurLocal =
	function setCurLocal(local) {

		curLocal = local;

		if (!locals[curLocal]) {

			throw new getLocalText.exceptions.UnknownLocalization(null, curLocal);

		}

	};

	getLocalText.setCurLocal( locals.defaultLocal );

	/* exceptions {{{1 */

	/**
	 * @static
	 * @public
	 */
	getLocalText.exceptions = {};

	getLocalText.exceptions.IncorrectKeyType =
	function IncorrectKeyType(message, type) {
		Error.call(this);
		this.name = 'IncorrectKeyType';
		if (message) {
			this.message = message;
		} else {
			this.message = 'Incorrect type of key';
			if (type) this.message += ' ("'+ type +'")';
			this.message += ', must be a string or key-value object (at last argument).';
		}
	};

	getLocalText.exceptions.NotFound =
	function NotFound(message, keyPath) {
		Error.call(this);
		this.name = 'NotFound';
		if (message) {
			this.message = message;
		} else {
			this.message = 'Localized text not found by key-path';
			if (keyPath) this.message += ': "'+ keyPath +'"';
			this.message += '.';
		}
	};

	getLocalText.exceptions.IncorrectDestination =
	function IncorrectDestination(message, keyPath) {
		Error.call(this);
		this.name = 'IncorrectDestination';
		if (message) {
			this.message = message;
		} else {
			this.message = 'Incorrect destination by key-path';
			if (keyPath) this.message += ': "'+ keyPath +'"';
			this.message += '.';
		}
	};

	getLocalText.exceptions.UnknownLocalization =
	function UnknownLocalization(message, local) {
		Error.call(this);
		this.name = 'UnknownLocalization';
		if (message) {
			this.message = message;
		} else {
			this.message = 'Unknown localization';
			if (local) this.message += ': "'+ local +'"';
			this.message += '.';
		}
	};

	function inherit(proto) {
		if (Object.create) return Object.create(proto);
		function F() {}
		F.prototype = proto;
		return new F();
	}

	for (var key in getLocalText.exceptions) {
		getLocalText.exceptions[key].prototype = inherit(Error.prototype);
	}

	/* exceptions }}}1 */

	return getLocalText;

}); // define()

// vim: set noet ts=4 sts=4 sw=4 fenc=utf-8 foldmethod=marker :
