/**
 * "Main" page behavior (printer)
 *
 * @author Viacheslav Lotsmanov
 */

define(['jquery', 'get_val'], function ($, getVal) {
$(function domReady() {

	var $topSide = $('.top_side');
	var $header = $('header');
	var $footer = $('footer');
	var $document = $(document);
	var $page = $('html,body');
	var $main = $('main');

	var quotationBindSuffix = '.printer_sheet_our_clients_quotation';

	function getWorkspaceHeight() {
		return $document.height() - $header.height() - $footer.height();
	}

	$('.print_stack').each(function () {

		var $stack = $(this);
		var $printer = $stack.find('.printer');
		var $sheets = $stack.find('.sheets');

		var printerHeight = $printer.height();
		var printerMarginTop = parseInt($printer.css('margin-top'), 10);
		var printerMarginBottom = parseInt($printer.css('margin-bottom'), 10);
		var bindSuffix = '.printer_positioning';

		$stack.css('padding-top', 0);

		$sheets.find('.addresses_sheet .map_link').each(function (i) { // init small maps {{{1

			var $wrapper = $(this);
			var $map = $wrapper.find('.map');
			var $address = $wrapper.closest('li').find('address');

			var id = 'interactive_yandex_small_map_n_' + i;

			$map.attr('id', id);

			require(['dynamic_api'], function (dynamicLoadApi) {

				var mapLang = (getVal('lang') === 'ru') ? 'ru-RU' : 'en-US';

				dynamicLoadApi(
					'http://api-maps.yandex.ru/2.0/?load=package.standard&lang=ru-RU',
					'ymaps',
					function (err, ymaps) {

						if (err) throw err;

						ymaps.ready(function () {

							var map = new ymaps.Map(id, {
								center: [
									parseFloat($map.attr('data-coord-y')),
									parseFloat($map.attr('data-coord-x'))
								],
								zoom: parseInt($map.attr('data-zoom'), 10)
							});

							var mark = new ymaps.Placemark([
								$map.attr('data-coord-y'),
								$map.attr('data-coord-x')
							], {
								hintContent: $address.text()
							}, {
								iconImageHref: '/images/sheet_yamap_marker.png',
								iconImageSize: [31, 44],
							});

							map.geoObjects.add(mark);
							map.container.fitToViewport();

						});

					}
				); // dynamicLoadApi()

			}); // require(['dynamic_api']...

		}); // .each() init small maps }}}1

		// repos printer {{{1

		function calcRepos() {
			var workHeight = getWorkspaceHeight();
			var centerPoint = getVal('printerCenterPosPercent') * workHeight / 100;
			var printerPos = centerPoint - (printerHeight / 2) - printerMarginTop;
			var over = workHeight - printerPos - printerMarginTop - printerHeight - printerMarginBottom;

			return ((over < 0) ? printerPos-(over/2) : printerPos);
		}

		$(window).on('resize' + bindSuffix, function () {

			$stack.stop().animate({
				'padding-top': calcRepos() + 'px'
			}, getVal('animationSpeed'));

		}).trigger('resize' + bindSuffix);

		// repos printer }}}1

		(function isolate() { // quotations show when mouseenter {{{1

			var $sheet = $sheets.find('.our_clients_sheet');
			var $liList = $sheet.find('ul.clients_list li');
			var $quotations = $liList.find('blockquote.quotation');

			var speed = getVal('animationSpeed') * 2;
			var qOffsetOffset = getVal('showOffset');
			var qOffset = parseInt($quotations.eq(0).css('bottom'), 10);

			$quotations.css({
				display: 'none',
				opacity: 0,
				bottom: (qOffset + qOffsetOffset) + 'px'
			});

			$liList.each(function () {

				var $li = $(this);
				var $quotation = $li.find('blockquote.quotation');

				if ($quotation.size() <= 0) return;

				$quotation.on('mouseenter' + quotationBindSuffix, function () {
					return false;
				});

				$li.on('mouseenter' + quotationBindSuffix, function () {
					$quotation
						.stop()
						.css('display', 'block')
						.animate({
							opacity: 1,
							bottom: (qOffset) + 'px'
						}, speed);
				});

				$li.on('mouseleave' + quotationBindSuffix, function () {
					$quotation
						.stop()
						.animate({
							opacity: 0,
							bottom: (qOffset + qOffsetOffset) + 'px'
						}, speed, function () {
							$(this).css('display', 'none');
						});
				});

			}); // $liList.each()

		})(); // quotations show when mouseenter }}}1;

		// LET'S MAKE THIS PARTY FUN!

		(function isolate() { // printer behavior {{{1

			var $sheetsList = $sheets.find('>li');

			var sheetsBottomAtStart = parseInt($sheets.css('padding-bottom'), 10);
			var sheetsNewBottom = getVal('printerBottomOverPiece') + sheetsBottomAtStart +
				getVal('printerJitterSize');
			var curSheet = 0;

			var $printFirstButton = $printer.find('.print_first_button');
			var $printSheet = $printer.find('.print_sheet');
			var $topSheet = $sheetsList.eq(0);
			var $curSheet = null;
			var $nextSheet = $sheetsList.eq(-1);

			var startPos = parseInt($topSheet.css('margin-top'), 10); // positioning by margin-top of first sheet
			var interval = parseInt($nextSheet.css('margin-top'), 10); // space between sheets
			var sheetHeight = $nextSheet.innerHeight() + 2;

			var $printButtons = [];
			$printFirstButton.each(function () { $printButtons.push(this); });
			$printSheet.each(function () { $printButtons.push(this); });
			$printButtons = $( $printButtons );

			/* because $sheets has overflow:hidden
			 * and last in stack sheet need to jitter (out of $sheets height) */
			$sheets.css({
				'padding-bottom': sheetsNewBottom + 'px',
				'margin-bottom': (-sheetsNewBottom) + 'px'
			});

			var pieceOffset = null;
			var jitterUp = true;
			var process = false;

			/* update jitter value */
			function newState() { // {{{2

				// if last sheet is printed
				if ($nextSheet.size() < 0) return;

				$printSheet.css('height', (pieceOffset + getVal('printerJitterSize')) + 'px');
				$nextSheet.stop().animate(
					{ top: pieceOffset },
					getVal('animationSpeed')*2,
					$.proxy(jitter, undefined, $nextSheet)
				);

			} // newState() }}}2

			/* mouse over action (change out offset) */
			function over() { // {{{2

				if (process) return false;

				$printFirstButton.addClass('active');
				pieceOffset = getVal('printerBottomOverPiece');
				newState();

			} // over() }}}2

			/* mouse leave action (change out offset) */
			function leave() { // {{{2

				if (process) return false;

				$printFirstButton.removeClass('active');
				pieceOffset = getVal('printerBottomPiece');
				newState();

			} // leave() }}}2

			/* prepare next sheet for jitter and start jitter */
			function initNextSheet() { // {{{2

				$nextSheet.animate({
					top: getVal('printerBottomPiece') + 'px'
				}, getVal('animationSpeed')*2, function () {

					process = false;
					leave(); // init as inactive
					jitter($nextSheet);

				});

			} // initNextSheet() }}}2

			/* printing next sheet */
			function letsPrint() { // {{{2

				if (process) return false; else process = true;
				curSheet++;
				$printFirstButton.removeClass('active');

				var animate = {
					'margin-top': (
						startPos + ((sheetHeight + interval) * curSheet)
					) + 'px'
				};
				var speed = getVal('animationSpeed') * 2;

				$sheetsList.stop();
				$printSheet.css('height', 0);

				// only at first time
				if ($curSheet === null) {

					$(window).off('resize' + bindSuffix);

					$nextSheet.animate({ top: 0 }, speed*4, function () {

						$stack.stop().animate({ 'padding-top': 0 }, speed*2);
						$page.stop().animate({
							scrollTop: $main.offset().top,
						}, speed);

						$sheets.animate({
							'padding-bottom': sheetsBottomAtStart + 'px',
							'margin-bottom': (-sheetsBottomAtStart) + 'px'
						}, speed);

						$printFirstButton.animate({
							opacity: 0
						}, getVal('animationSpeed'), function () {
							$printFirstButton
								.css('z-index', 30)
								.css('margin-top', '-70px')
								.animate(
									{ opacity: 1 },
									getVal('animationSpeed')
								);
						});

					});

				} else {

					// if next sheet is first sheet (need to merge animate params)
					if ($topSheet.get(0) !== $nextSheet.get(0)) {
						$nextSheet.animate({ top: 0 }, speed*2);
					} else {
						animate.top = 0;
						$printFirstButton.animate(
							{ opacity: 0 },
							getVal('animationSpeed'),
							function () {
								$printFirstButton.remove();
							}
						);
					}

				}

				$topSheet.animate(animate, speed*4, function () {

					$curSheet = $nextSheet;
					$nextSheet = $sheetsList.eq(-(curSheet+1));
					initNextSheet();

				});

			} // letsPrint() }}}2

			/* start loop of jittering for next sheet */
			function jitter($sheet) { // {{{2

				function go() {
					var up = jitterUp;
					jitterUp = !jitterUp;
					$sheet.stop().animate({
						top: (up) ?
							-(getVal('printerJitterSize')-pieceOffset) :
							getVal('printerJitterSize')+pieceOffset
					}, getVal('animationSpeed')*6, go);
				}

				go();

			} // jitter() }}}2

			// top is zero by default
			$sheetsList.css('top', 0);

			// bind handlers ot actions
			$printButtons
				.on('mouseenter', over)
				.on('mouseleave', leave)
				.on('click', letsPrint);

			// prepare for the party!
			initNextSheet();

		})(); // printer behavior }}}1

	}); // $('.print_stack').each()

}); // domReady()
}); // define()
