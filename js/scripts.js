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
		var oneChar = '1';
		var zeroChar = '0';
		var p_zeroChar = '';
		var p_oneChar = '';
		var sfx = new Audio('./data/click.mp3');
		var sfxv = new Audio('./data/victory.mp3');
		var amb = new Audio('./data/ambient.wav');
		var mIsPlaying = true;
		var sfxEn = true;
		var pandaCntr = 5;
		var currentSide;
		var puzzles;
		var progress;
		var currentPzl = {
			dif: "",
			lvl: 0,
			max: 1,
			code: ""
		}

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
		var $spinner = $('#spnrLvl').spinner();
		var $selDif = $('#selDiff');

		// Music		
		amb.addEventListener('ended', function() {
			this.currentTime = 0;
			this.play();
		}, false);
		amb.play();

		// jQuery UI tagging
		$selDif.selectmenu();
		$selDif.on('selectmenuchange', function() {
			// SFX
			if (sfxEn) sfx.play();

			newDifSelMenu();
		});
		$spinner.spinner({
			min: 1,
			max: 100,
			step: 1,
			stop: function(event, ui) {
				// SFX
				if (sfxEn) sfx.play();

				currentPzl.lvl = $spinner.spinner().val() - 1;
				updatePuzzle();
			}
		}).val(1);
		$('.ui-spinner-input').prop('disabled', true);
		$('.btnRndm').button({
			icon: "ui-icon-shuffle",
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

		var newDifSelMenu = function() {
			var nDif = $selDif.val();
			var m;
			var l;
			var c;
			switch (nDif) {
				case 'Easy':
					m = progress.Easy.length;
					l = (currentPzl.lvl > m) ? m - 1 : currentPzl.lvl;
					c = puzzles.Easy[l];
					break;
				case 'Normal':
					m = progress.Normal.length;
					l = (currentPzl.lvl > m) ? m - 1 : currentPzl.lvl;
					c = puzzles.Normal[l];
					break;
				case 'Hard':
					m = progress.Hard.length;
					l = (currentPzl.lvl > m) ? m - 1 : currentPzl.lvl;
					c = puzzles.Hard[l];
					break;
				case 'VHard':
					m = progress.VHard.length;
					l = (currentPzl.lvl > m) ? m - 1 : currentPzl.lvl;
					c = puzzles.VHard[l];
					break;
			}
			selPuzzle(nDif, l, m, c);
		};

		var updatePuzzle = function() {
			// Notify
			console.log('Loaded in puzzle ' + (currentPzl.dif) + " - " + (currentPzl.lvl + 1) + '.');

			// Update the html ellements
			$('.diff').html(currentPzl.dif);
			$('.lvl').html(currentPzl.lvl + 1);
			$spinner.spinner({ max: currentPzl.max }).val(currentPzl.lvl + 1);
			$selDif.val(currentPzl.dif).selectmenu("refresh");

			var code = currentPzl.code;
			var c;
			for (var i = 0; i < $cellTexts.length; i++) {
				c = code.charAt(i);
				$cellTexts.eq(i).html((c === 'e') ? '' : ((c === '0') ? zeroChar : oneChar)).parents('td').toggleClass('editable', (c === 'e') ? true : false).toggleClass('nonEditable', (c === 'e') ? false : true);
			}
			updateTodo();
			checkit();
		};

		var nextPuzzle = function() {
			// Easy
			for (var i = 0; i < progress.Easy.length; i++) {
				if (!progress.Easy[i]) {
					selPuzzle('Easy', i, progress.Easy.length, puzzles.Easy[i]);
					return;
				}
			}

			// Normal
			for (var i = 0; i < progress.Normal.length; i++) {
				if (!progress.Normal[i]) {
					selPuzzle('Normal', i, progress.Normal.length, puzzles.Normal[i]);
					return;
				}
			}

			// Hard
			for (var i = 0; i < progress.Hard.length; i++) {
				if (!progress.Hard[i]) {
					selPuzzle('Hard', i, progress.Hard.length, puzzles.Hard[i]);
					return;
				}
			}

			// VHard
			for (var i = 0; i < progress.VHard.length; i++) {
				if (!progress.VHard[i]) {
					selPuzzle('VHard', i, progress.VHard.length, puzzles.VHard[i]);
					return;
				}
			}
		};

		var selPuzzle = function(d, l, m, c) {
			currentPzl.dif = d;
			currentPzl.lvl = l;
			currentPzl.max = m;
			currentPzl.code = c;
			updatePuzzle();
		};

		var rndPuzzle = function() {
			var d = Math.floor(Math.random() * 4) + 1;
			var m;
			switch (d) {
				case 1:
					m = progress.Easy.length;
					break;
				case 2:
					m = progress.Normal.length;
					break;
				case 3:
					m = progress.Hard.length;
					break;
				case 4:
					m = progress.VHard.length;
					break;
			}
			while (true) {
				var i = Math.floor(Math.random() * m);
				switch (d) {
					case 1:
						if (!progress.Easy[i]) {
							selPuzzle('Easy', i, m, puzzles.Easy[i]);
							return;
						}
						break;
					case 2:
						if (!progress.Normal[i]) {
							selPuzzle('Normal', i, m, puzzles.Normal[i]);
							return;
						}
						break;
					case 3:
						if (!progress.Hard[i]) {
							selPuzzle('Hard', i, m, puzzles.Hard[i]);
							return;
						}
						break;
					case 4:
						if (!progress.VHard[i]) {
							selPuzzle('VHard', i, m, puzzles.VHard[i]);
							return;
						}
						break;
				}
			}
		}

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
				if ($(this).html() === oneChar || $(this).html() === zeroChar) todo--;
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
				if ($cells.eq(i).children('p').html() === oneChar) {
					horCntOne++;
					horStrkOne++;
					horStrkZero = 0;
				} else if ($cells.eq(i).children('p').html() === zeroChar) {
					horCntZero++;
					horStrkZero++;
					horStrkOne = 0;
				} else {
					horStrkZero = horStrkOne = 0;
				}

				// val check (ver)
				if ($cells.eq(j).children('p').html() === oneChar) {
					verCntOne++;
					verStrkOne++;
					verStrkZero = 0;
				} else if ($cells.eq(j).children('p').html() === zeroChar) {
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
				// SFXv
				if (sfxEn) sfxv.play();
				toggleVictory();

				switch (currentPzl.dif) {
					case 'Easy':
						progress.Easy[currentPzl.lvl] = true;
						break;
					case 'Normal':
						progress.Normal[currentPzl.lvl] = true;
						break;
					case 'Hard':
						progress.Hard[currentPzl.lvl] = true;
						break;
					case 'VHard':
						progress.VHard[currentPzl.lvl] = true;
						break;
				}

				localStorage.setItem('completionRate', JSON.stringify(progress));
				updateStats();
			}
		};
		checkit();

		var updateStats = function() {
			// Counter
			var completed = 0;
			var total = 0;

			// Easy
			for (var i = 0; i < progress.Easy.length; i++) {
				if (progress.Easy[i]) completed++;
			}
			completed *= 100;
			completed /= progress.Easy.length;
			total += completed;
			$('#easyStat').html(completed);

			// Normal
			completed = 0;
			for (var i = 0; i < progress.Normal.length; i++) {
				if (progress.Normal[i]) completed++;
			}
			completed *= 100;
			completed /= progress.Normal.length;
			total += completed;
			$('#nrmlStat').html(completed);

			// Hard
			completed = 0;
			for (var i = 0; i < progress.Hard.length; i++) {
				if (progress.Hard[i]) completed++;
			}
			completed *= 100;
			completed /= progress.Hard.length;
			total += completed;
			$('#hrdStat').html(completed);

			// Very Hard
			completed = 0;
			for (var i = 0; i < progress.VHard.length; i++) {
				if (progress.VHard[i]) completed++;
			}
			completed *= 100;
			completed /= progress.VHard.length;
			total += completed;
			$('#vhrdStat').html(completed);

			// Total
			$('#ttlStat').html(total /= 4);
		};

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

					if (JSON.parse(localStorage.getItem('completionRate')) !== 'undefined' && JSON.parse(localStorage.getItem('completionRate')) !== null) {
						console.log('loaded the localStorage');
						var ls = JSON.parse(localStorage.getItem('completionRate'));
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

					localStorage.setItem('completionRate', JSON.stringify(progress));
					updateStats();
					nextPuzzle();
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.log(errorThrown);
				}
			});
		};
		readData();

		var updateChar = function() {
			for (var i = 0; i < $cellTexts.length; i++) {
				$cellTexts.eq(i).html(($cellTexts.eq(i).html() === p_oneChar) ? oneChar : (($cellTexts.eq(i).html() === p_zeroChar) ? zeroChar : ''));
			}
		};

		// **** EVENTS ****
		// Refresh this page!
		$title.on('click', function(e) {
			location.reload();
		});

		$todo.on('click', function(e) {
			pandaCntr--;
			if (pandaCntr === 0) {
				// SFX
				if (sfxEn) sfx.play();

				p_zeroChar = zeroChar;
				p_oneChar = oneChar;
				zeroChar = '🐼';
				oneChar = '🎋';
				updateChar();
			}
		});

		// Random button click
		$('.btnRndm').on('click', function(e) {
			// SFX
			if (sfxEn) sfx.play();

			rndPuzzle();
			updateStats();
		});

		// Puzzle Complete
		$victory.on('click', function(e) {
			// SFX
			if (sfxEn) sfx.play();

			toggleVictory();
			nextPuzzle();
			updateStats();
		});

		// Flip buttons
		$btnsFlip.on('click', function(e) {
			// SFX
			if (sfxEn) sfx.play();

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
			val = (val === zeroChar) ? oneChar : ((val === oneChar) ? '' : zeroChar);
			$(this).children('p').html(val);

			// SFX
			if (sfxEn) sfx.play();

			// Update the todo
			updateTodo();

			// Check
			checkit();
		});

		// Toggle music
		$('#chbxM').on('click', function(e) {
			if (mIsPlaying) amb.pause();
			else amb.play();
			mIsPlaying = !mIsPlaying;
		});

		// Toggle SFX
		$('#chbxS').on('click', function(e) {
			sfxEn = !sfxEn;
		});
	});
})(jQuery);