/**
 * Values for "get_val" module
 *
 * @author Viacheslav Lotsmanov
 */

define(function () {

	/** @public */ var exports = {};

	exports.values = {

		animationSpeed: 200, // ms
		cookieExpires: 365, // days
		dynamicApiLoadInterval: 100, // ms
		interactiveMapRatio: [2, 1],

		// dialog boxes
		dialogBoxTpl: '<div class="#DIALOG_BOX_CLASS# #TYPE_NAME#">'+
				'<div class="wrapper"><div class="wrapper_2">'+
					'<a class="#CLOSER_CLASS#"></a>'+
					'<div class="messages">#MESSAGES#</div>'+
					'#BUTTONS_BLOCK#'+
				'</div></div>'+
			'</div>',
		dialogBoxCloseExclude: '.wrapper_2',

		// printer (on main page)
		printerCenterPosPercent: 45, // %
		printerBottomPiece: 50, // px, bottom piece size of sheet out of printer
		printerBottomOverPiece: 80, // px, bottom piece size of sheet when mouse over
		printerJitterSize: 10, // px, +/- of bottom piece of sheet jitter

		showOffset: 50, // px

		writeToDirectorFormHiddenHeight: 76, // px

	};

	/** Required set before "getVal" */
	exports.required = [
		'lang',
		'revision'
	];

	return exports;

}); // define()
