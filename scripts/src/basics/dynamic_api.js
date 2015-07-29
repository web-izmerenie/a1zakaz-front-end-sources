/*!
 * Dynamic loading API
 * Required values by getVal: dynamicApiLoadInterval
 *
 * @version r2
 * @author Viacheslav Lotsmanov
 * @license GNU/GPLv3 by Free Software Foundation (https://github.com/unclechu/js-useful-amd-modules/blob/master/GPLv3-LICENSE)
 * @see {@link https://github.com/unclechu/js-useful-amd-modules/|GitHub}
 */

define(['jquery', 'get_val'], function ($, getVal) {

	var toLoadList = [];

	function getItem(scriptPath) { // {{{1

		var retVal;

		$.each(toLoadList, function (i, item) {

			if (item.scriptPath === scriptPath) {
				retVal = item;
				return false;
			}

		});

		if (!retVal) {
			throw new dynamicLoadApi.exceptions.ItemNotFound(null, scriptPath);
		}

		return retVal;

	} // getItem() }}}1

	/**
	 * @typedef {function} apiLoadedCallback
	 * @prop {Error} err Exception
	 * @prop {*} globalVarValue window[globalVarName]
	 */

	/**
	 * @param {string} scriptPath Path to .js script of API
	 * @param {string} globalVarName Name of global variable to wait
	 * @param {apiLoadedCallback} callback
	 */
	function dynamicLoadApi(scriptPath, globalVarName, callback) { // {{{1

		var alreadyInList = false;
		var item;

		$.each(toLoadList, function (i, item) {

			if (item.scriptPath === scriptPath) {
				alreadyInList = true;
			}

		});

		if (!alreadyInList) {

			toLoadList.push({
				scriptPath: scriptPath,
				loaded: false,
				timerId: null,
				varName: globalVarName,
				cb: []
			});

			var $script = $('<script/>');
			$script.attr('src', scriptPath);
			$('head').append( $script );

		}

		try {

			item = getItem(scriptPath);

		} catch (err) {

			setTimeout( $.proxy(callback, null, err), 1 );
			return;

		}

		function waiter() {

			if (item.varName in window) {

				item.loaded = true;
				item.timerId = null;

				if (item.cb) {
					$.each(item.cb, function (i, cbFunc) {

						cbFunc( null, window[item.varName] );

					});
				}

				item.cb = undefined;

				return;

			}

			setTimeout( waiter, getVal('dynamicApiLoadInterval') );

		}

		if (item.loaded) {

			setTimeout( $.proxy(callback, null, null, window[item.varName]), 1 );

		} else {

			item.cb.push(callback);
			item.timerId = setTimeout(waiter, 1);

		}

	} // dynamicLoadApi() }}}1

	/* exceptions {{{1 */

	/**
	 * @static
	 * @public
	 */
	dynamicLoadApi.exceptions = {};

	dynamicLoadApi.exceptions.ItemNotFound =
	function ItemNotFound(message, scriptPath) {
		Error.call(this);
		this.name = 'ItemNotFound';
		if (this.message) {
			this.message = message;
		} else {
			this.message = 'Cannot get item by script path';
			if (scriptPath) this.message += ': "'+ scriptPath +'"';
			this.message += '.';
		}
	};

	function inherit(proto) {
		if (Object.create) return Object.create(proto);
		function F() {}
		F.prototype = proto;
		return new F();
	}

	for (var key in dynamicLoadApi.exceptions) {
		dynamicLoadApi.exceptions[key].prototype = inherit(Error.prototype);
	}

	/* exceptions }}}1 */

	return dynamicLoadApi;

}); // define

// vim: set noet ts=4 sts=4 sw=4 fenc=utf-8 foldmethod=marker :
