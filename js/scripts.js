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

		// Variables
		var currentSide;
		var puzzles;
		var progress;

		// Shortcuts
		var $btnsFlip = $('.round-button div p');
		var $title = $('h1');
		var $sides = $('.side');
		var $gameSide = $('#game');
		var $helpSide = $('#help');
		var $menuSide = $('#menu');
		var $card = $('#card');
		var $cells = $('td');
		var $cellTexts = $('td p');
		var $todo = $('#numEmptyCells');
		var $rows = $('tr');
		var $gCard = $('.thegamecard');
		var $victory = $('#victory');

		// jQuery UI tagging
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

		// Show game		
		$('body').delay(300).fadeToggle();
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

		var nextPuzzle = function() {
			console.log('NEXT PUZZLE');
		};

		var toggleVictory = function() {
			$gCard.toggleClass('blurred');
			$victory.toggle('puff');
		}

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

		var updateTodo = function() {
			var todo = 36;

			$cellTexts.each(function() {
				if ($(this).html() === '1' || $(this).html() === '0') todo--;
			});

			$todo.html(todo);
		};
		updateTodo();

		var checkit = function() {
			// result container
			var hor_status = [];
			var ver_status = [];
			var errs = 0;

			// Reset all cell classnames            
			$cells.each(function() {
				$(this).toggleClass('error', false);
			});

			// Rule checking
			var horCntZero, horCntOne, horStrkZero, horStrkOne, verCntZero, verCntOne, verStrkZero, verStrkOne;
			horCntZero = horCntOne = horStrkZero = horStrkOne = verCntZero = verCntOne = verStrkZero = verStrkOne = 0;

			for (var i = 0; i < $cells.length + 1; i++) {
				// Over-Complicating shit. (vertical jmping)
				var j = ((i * $rows.length) % $cells.length) + parseInt((i * $rows.length) / $cells.length);

				// new line
				if (i % $rows.length === 0) {
					// Count detection Hor & Ver
					if ((horCntZero !== $rows.length / 2) && (horCntOne + horCntZero === $rows.length)) hor_status[parseInt(i / $rows.length) - 1] = false;
					if ((verCntZero !== $rows.length / 2) && (verCntOne + verCntZero === $rows.length)) ver_status[parseInt(i / $rows.length) - 1] = false;
					if (i === $cells.length) break;
					// reset
					horCntZero = horCntOne = horStrkZero = horStrkOne = verCntZero = verCntOne = verStrkZero = verStrkOne = 0;
				}

				// val check (hor)
				if ($cells.eq(i).children('p').html() === '1') {
					horCntOne++;
					horStrkOne++;
					horStrkZero = 0;
				} else if ($cells.eq(i).children('p').html() === '0') {
					horCntZero++;
					horStrkZero++;
					horStrkOne = 0;
				} else {
					horStrkZero = horStrkOne = 0;
				}

				// val check (ver)
				if ($cells.eq(j).children('p').html() === '1') {
					verCntOne++;
					verStrkOne++;
					verStrkZero = 0;
				} else if ($cells.eq(j).children('p').html() === '0') {
					verCntZero++;
					verStrkZero++;
					verStrkOne = 0;
				} else {
					verStrkZero = verStrkOne = 0;
				}

				// Streak detection
				if (horStrkOne === $rows.length / 2 || horStrkZero === $rows.length / 2) hor_status[parseInt(i / $rows.length)] = true;
				if (verStrkOne === $rows.length / 2 || verStrkZero === $rows.length / 2) ver_status[parseInt(i / $rows.length)] = true;
			}

			// duplicate entries
			var rowVals = [];
			var colVals = [];

			for (var i = 0; i < $rows.length; i++) {
				var row = '';
				var col = '';

				for (var j = 0; j < $rows.length; j++) {
					row += $cells.eq((i * $rows.length) + j).children('p').html();
					col += $cells.eq((j * $rows.length) + i).children('p').html();
				}

				rowVals[i] = (row.length === $rows.length) ? row : 'invalid';
				colVals[i] = (col.length === $rows.length) ? col : 'invalid';
			}

			for (var i = 0; i < $rows.length; i++) {
				for (var j = i + 1; j < $rows.length; j++) {
					if (rowVals[i] === rowVals[j] && rowVals[i] !== 'invalid') hor_status[i] = hor_status[j] = 'duplicate';
					if (colVals[i] === colVals[j] && colVals[i] !== 'invalid') ver_status[i] = ver_status[j] = 'duplicate';
				}
			}

			// setting invalid (horizontal)
			for (var i = 0; i < hor_status.length; i++) {
				// Undefined entry ==> skip!
				if (hor_status[i] === undefined) continue;
				for (var j = 0; j < $rows.length; j++) $cells.eq(j + i * 6).toggleClass('error', true);
				errs++;
			}

			// setting invalid (Vertical)
			for (var i = 0; i < ver_status.length; i++) {
				// Undefined entry ==> skip!
				if (ver_status[i] === undefined) continue;
				for (var j = 0; j < $rows.length; j++) $cells.eq(i + j * 6).toggleClass('error', true);
				errs++;
			}

			// Endgame?
			if ((errs === 0) && ($todo.html() === '0')) {
				toggleVictory();
			}
		};
		checkit();

		var readData = function() {
			$.ajax({
				dataType: 'json',
				url: './data/puzzles.json',
				type: 'get',
				success: function(data, textStatus, jqXHR) {
					console.log("Successfully loaded the puzzles!")
					puzzles = {
						Easy: [],
						Normal: [],
						Hard: [],
						VHard: []
					};
					progress = {
						Easy: [],
						Normal: [],
						Hard: [],
						VHard: []
					};
					for (var i = 0; i < data.Easy.length; i++) {
						progress.Easy[i] = false;
						puzzles.Easy[i] = data.Easy[i].code;
					}
					for (var i = 0; i < data.Normal.length; i++) {
						progress.Normal[i] = false;
						puzzles.Normal[i] = data.Normal[i].code;
					}
					for (var i = 0; i < data.Hard.length; i++) {
						progress.Hard[i] = false;
						puzzles.Hard[i] = data.Hard[i].code;
					}
					for (var i = 0; i < data.VHard.length; i++) {
						progress.VHard[i] = false;
						puzzles.VHard[i] = data.VHard[i].code;
					}

					if (localStorage.getItem('completionRate') !== 'undefined') {
						console.log('loaded the localStorage');
						var ls = localStorage.getItem('completionRate');
						if ((ls.Easy.length === progress.Easy.length) &&
							(ls.Normal.length === progress.Normal.length) &&
							(ls.Hard.length === progress.Hard.length) &&
							(ls.VHard.length === progress.VHard.length)) progress = ls;
						else {
							if (ls.Easy.length !== progress.Easy.length) {
								if (ls.Easy.length > progress.Easy.length) {
									console.log('Puzzles removed from EASY?');
								} else {
									var diff = progress.Easy.length;
									progress.Easy = ls.Easy;
									for (var i = progress.Easy.length; i < diff; i++) {
										progress.Easy[i] = false;
									}
								}
							}
							if (ls.Normal.length !== progress.Normal.length) {
								if (ls.Normal.length > progress.Normal.length) {
									console.log('Puzzles removed from EASY?');
								} else {
									var diff = progress.Normal.length;
									progress.Normal = ls.Normal;
									for (var i = progress.Normal.length; i < diff; i++) {
										progress.Normal[i] = false;
									}
								}
							}
							if (ls.Hard.length !== progress.Hard.length) {
								if (ls.Hard.length > progress.Hard.length) {
									console.log('Puzzles removed from EASY?');
								} else {
									var diff = progress.Hard.length;
									progress.Hard = ls.Hard;
									for (var i = progress.Hard.length; i < diff; i++) {
										progress.Hard[i] = false;
									}
								}
							}
							if (ls.VHard.length !== progress.VHard.length) {
								if (ls.VHard.length > progress.VHard.length) {
									console.log('Puzzles removed from EASY?');
								} else {
									var diff = progress.VHard.length;
									progress.VHard = ls.VHard;
									for (var i = progress.VHard.length; i < diff; i++) {
										progress.VHard[i] = false;
									}
								}
							}
						}
					}
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.log(errorThrown);
				}
			});
		};
		readData();

		var saveProgress = function() {
			localStorage.setItem('completionRate', progress);
		}
		saveProgress();

		// **** EVENTS ****
		// Refresh this page!
		$title.on('click', function(e) {
			location.reload();
		});

		// Puzzle Complete
		$victory.on('click', function(e) {
			toggleVictory();
		});

		// Flip buttons
		$btnsFlip.on('click', function(e) {
			// On a Left flip
			if ($(e.target).hasClass('flipL')) {
				toggleBacklayer(e.target.innerHTML);
				flipLeft();
			}
			// On a Right flip
			else if ($(e.target).hasClass('flipR')) {
				toggleBacklayer(e.target.innerHTML);
				flipRight();
			}
			// Unknown flip
			else {
				console.log('Unknown flip direction!');
			}
		});

		// Toggle the value of a cell
		$cells.on('click', function(e) {
			// Only editable cells pls
			if (!$(this).hasClass('editable')) return;

			// Change value
			var val = $(this).children('p').html();
			val = (val === '0') ? '1' : ((val === '1') ? '' : '0');
			$(this).children('p').html(val);

			// Update the todo
			updateTodo();

			// Check
			checkit();
		});
	});
})(jQuery);