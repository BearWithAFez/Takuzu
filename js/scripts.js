/*
 * Takuzu scripts
 *
 * @author Dwight Van der Velpen <dfr34kz@gmail.com>
 */

;
(function($) {
	// wait till DOM is loaded
	$(window).on('load', function() {
		// Houston we have lift-off
		console.log('Script <scripts.js> loaded.');
		$('body').delay(300).fadeToggle();
		$('#selDiff').selectmenu();
		$('#spnrLvl').spinner({
			min: 1,
			max: 100,
			step: 1
		}).val(1);
		$('.btnRndm').button({
			icon: "ui-icon-shuffle",
			iconPosition: "end"
		});
		$('.btnPlay').button({
			icon: "ui-icon-play",
			iconPosition: "end"
		});
		$('[type="checkbox"]').checkboxradio();



		// Variables
		var currentSide;

		// Shortcuts
		var $btnsFlip = $('.round-button div p');
		var $title = $('h1');
		var $sides = $('.side');
		var $gameSide = $('#game');
		var $helpSide = $('#help');
		var $menuSide = $('#menu');
		var $card = $('#card');

		$sides.toggle(false);
		$card.toggleClass('flipR');
		$helpSide.toggle(true);
		currentSide = $helpSide;

		// Methods
		var toggleBacklayer = function(destination) {
			$sides.toggle(false);
			currentSide.toggle(true);

			setTimeout(function() {
				$sides.toggle(false);
				currentSide.toggle(true);
			}, 1000);

			if (destination === 'M') {
				$menuSide.toggle(true);
				currentSide = $menuSide;
			} else if (destination === 'G') {
				$gameSide.toggle(true);
				currentSide = $gameSide;
			} else if (destination === 'H') {
				$helpSide.toggle(true);
				currentSide = $helpSide;
			}
		};

		var flipLeft = function() {
			if ($card.hasClass('flipR')) {
				$card.toggleClass('flipR', false);
			} else {
				$card.toggleClass('flipL', true);
			}
		};

		var flipRight = function() {
			if ($card.hasClass('flipL')) {
				$card.toggleClass('flipL', false);
			} else {
				$card.toggleClass('flipR', true);
			}
		};

		// **** EVENTS ****
		// Refresh this page!
		$title.on('click', function(e) {
			location.reload();
		});

		// Flip buttons
		$btnsFlip.on('click', function(e) {
			console.log('Click-Event!');
			if ($(e.target).hasClass('flipL')) {
				console.log('FlipL clicked');
				toggleBacklayer(e.target.innerHTML);
				flipLeft();
			} else if ($(e.target).hasClass('flipR')) {
				console.log('FlipR clicked');
				toggleBacklayer(e.target.innerHTML);
				flipRight();
			} else {
				console.log('Unknown flip direction!');
			}
		});
	});
})(jQuery);