/*
 * Takuzu scripts
 *
 * @author Dwight Van der Velpen <dfr34kz@gmail.com>
 */

;
(function($) {
	// wait 'till DOM is loaded
	$(window).on('load', function() {
		// Verify correct load.
		console.log('Script <scripts.js> loaded.');

		/*----   VARIABLES   ----*/
		var version = 1;
		var subVersion = 0;
		console.log('Version ' + version + '.' + subVersion);

		var chars = {
			counter: 4,
			current: 0,
			sets: [
				['0', '1'],
				['🐼', '🎋']
			],
			update: function() {
				// Not yet
				if (this.counter !== 0) return this.counter--;

				// Rotate chars
				this.counter = 4;
				var p = this.sets[this.current];
				this.current = ((this.sets.length - 1) === this.current) ? 0 : this.current + 1;

				// Update table
				for (var i = 0; i < $cellTexts.length; i++) {
					$cellTexts.eq(i).html(($cellTexts.eq(i).html() === p[0]) ? this.sets[this.current][0] : (($cellTexts.eq(i).html() === p[1]) ? this.sets[this.current][1] : ''));
				}
			}
		};

		var warnings = [
			'Are you SURE you want to delete progress?',
			'This is the LAST WARNING, you will DELETE progress!'
		];

		var difficulties = ['Easy', 'Normal', 'Hard', 'VHard'];


		/*----  SHORT-HANDS  ----*/
		// Table
		var $cells = $('td');
		var $cellTexts = $('td p');
		// Cards
		var $card = $('#card');
		var $sides = $('.side');
		var $gameSide = $('#game');
		var $helpSide = $('#help');
		var $menuSide = $('#menu');
		var $victory = $('#victory');
		var $completion = $('#completion');
		// Controls
		var $selDif = $('#selDiff');
		var $spinner = $('#spnrLvl').spinner();
		var $todo = $('#numEmptyCells');
		var $deleteProgress = $('.deleteProgress');


		/*----   JQUERY-UI   ----*/
		$selDif.selectmenu().on('selectmenuchange', function() {
			playSFX();
			newDifSelMenu();
		});

		$spinner.spinner({
			min: 1,
			max: 100,
			step: 1,
			stop: function(event, ui) {
				playSFX();
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


		/*---- HELPERMETHODS ----*/
		var translateDif = function(input) {
			return (typeof input === 'number') ? difficulties[input] : difficulties.indexOf(input);
		};

		var toggleBacklayer = function(destination) {
			var currentSide = $('.side:visible');
			$sides.toggle(false);
			currentSide.toggle(true);

			switch (destination) {
				case 'M':
					$menuSide.toggle(true);
					currentSide = $menuSide;
					break;
				case 'G':
					$gameSide.toggle(true);
					currentSide = $gameSide;
					break;
				case 'H':
					$helpSide.toggle(true);
					currentSide = $helpSide;
					break;
			}
			setTimeout(function() {
				$sides.toggle(false);
				currentSide.toggle(true);
			}, 840);
		};

		var flipLeft = function() {
			($card.hasClass('flipR')) ? $card.toggleClass('flipR', false): $card.toggleClass('flipL', true);
		};

		var flipRight = function() {
			($card.hasClass('flipL')) ? $card.toggleClass('flipL', false): $card.toggleClass('flipR', true);
		};

		var checkIt = function() {
			// Shorthand
			var rows = $('tr').length;

			// Result container
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

			// Fill containers (streaks)
			for (var i = 0; i <= $cells.length; i++) {
				// Vertical jumps
				var j = ((i * rows) % $cells.length) + parseInt((i * rows) / $cells.length);

				// New line
				if (i % rows === 0) {
					// Count detection Hor & Ver
					if ((horCntZero !== rows / 2) && (horCntOne + horCntZero === rows)) hor_status[parseInt(i / rows) - 1] = false;
					if ((verCntZero !== rows / 2) && (verCntOne + verCntZero === rows)) ver_status[parseInt(i / rows) - 1] = false;
					if (i === $cells.length) break;

					// Reset
					horCntZero = horCntOne = horStrkZero = horStrkOne = verCntZero = verCntOne = verStrkZero = verStrkOne = 0;
				}

				// Val check (hor)
				if ($cellTexts.eq(i).html() === chars.sets[chars.current][1]) {
					horCntOne++;
					horStrkOne++;
					horStrkZero = 0;
				} else if ($cellTexts.eq(i).html() === chars.sets[chars.current][0]) {
					horCntZero++;
					horStrkZero++;
					horStrkOne = 0;
				} else {
					horStrkZero = horStrkOne = 0;
				}

				// val check (ver)
				if ($cellTexts.eq(j).html() === chars.sets[chars.current][1]) {
					verCntOne++;
					verStrkOne++;
					verStrkZero = 0;
				} else if ($cellTexts.eq(j).html() === chars.sets[chars.current][0]) {
					verCntZero++;
					verStrkZero++;
					verStrkOne = 0;
				} else {
					verStrkZero = verStrkOne = 0;
				}

				// Streak detection
				if (horStrkOne === rows / 2 || horStrkZero === rows / 2) hor_status[parseInt(i / rows)] = true;
				if (verStrkOne === rows / 2 || verStrkZero === rows / 2) ver_status[parseInt(i / rows)] = true;
			}

			// Duplicate entries checking containers
			var rowVals = [];
			var colVals = [];

			// Fill row strings
			for (var i = 0; i < rows; i++) {
				var row = '';
				var col = '';

				// Go over the row (hor & ver)
				for (var j = 0; j < rows; j++) {
					row += $cellTexts.eq((i * rows) + j).html();
					col += $cellTexts.eq((j * rows) + i).html();
				}

				// Add in container
				rowVals[i] = (row.length === rows) ? row : 'invalid';
				colVals[i] = (col.length === rows) ? col : 'invalid';
			}

			// Now check for duplicates
			for (var i = 0; i < rows; i++) {
				for (var j = i + 1; j < rows; j++) {
					if (rowVals[i] === rowVals[j] && rowVals[i] !== 'invalid') hor_status[i] = hor_status[j] = 'duplicate';
					if (colVals[i] === colVals[j] && colVals[i] !== 'invalid') ver_status[i] = ver_status[j] = 'duplicate';
				}
			}

			// Setting invalid (Horizontal)
			for (var i = 0; i < hor_status.length; i++) {
				if (hor_status[i] === undefined) continue; // Undefined entry ==> skip!
				for (var j = 0; j < rows; j++) $cells.eq(j + i * 6).toggleClass('error', true);
				errs++;
			}

			// Setting invalid (Vertical)
			for (var i = 0; i < ver_status.length; i++) {
				if (ver_status[i] === undefined) continue; // Undefined entry ==> skip!
				for (var j = 0; j < rows; j++) $cells.eq(i + j * 6).toggleClass('error', true);
				errs++;
			}

			// Endgame?
			if ((errs === 0) && ($todo.html() === '0')) {
				if (lclStore.sfxEn) sfxv.play();
				lclStore.progress[translateDif(currentPzl.dif)][currentPzl.lvl] = true;
				toggleVictory();
				saveLclStorage();
				updateStats();
			}
		};

		var updateTodo = function() {
			var todo = 36;

			$cellTexts.each(function() {
				if ($(this).html() === chars.sets[chars.current][1] || $(this).html() === chars.sets[chars.current][0]) todo--;
			});

			$todo.html(todo);
		};

		var toggleVictory = function() {
			$('.thegamecard').toggleClass('blurred');
			$victory.toggle('puff');
		};

		var toggleCompletion = function() {
			$('.thegamecard').toggleClass('blurred');
			$completion.toggle('puff');
		};

		var newDifSelMenu = function() {
			var nDif = $selDif.val();
			currentPzl.dif = nDif;
			var nLvl = (currentPzl.lvl > currentPzl.max()) ? currentPzl.max() - 1 : currentPzl.lvl;
			selPuzzle(translateDif(nDif), nLvl);
		};


		/*----    PUZZLES    ----*/
		var puzzles; // Contains the codes for each puzzle
		var currentPzl = {
			dif: '',
			lvl: 0,
			max: function() {
				return lclStore.progress[translateDif(this.dif)].length;
			},
			code: function() {
				return puzzles[translateDif(this.dif)][this.lvl];
			}
		};

		var updatePuzzle = function() {
			// Notify
			console.log('Loaded in puzzle ' + (currentPzl.dif) + " - " + (currentPzl.lvl + 1));

			// Update visuals
			$('.diff').html(currentPzl.dif);
			$('.lvl').html(currentPzl.lvl + 1);
			$spinner.spinner({ max: currentPzl.max() }).val(currentPzl.lvl + 1);
			$selDif.val(currentPzl.dif).selectmenu('refresh');

			// Update Table
			for (var i = 0; i < $cells.length; i++) {
				// Get char
				var c = currentPzl.code().charAt(i);

				// Update HTML and Classes
				$cellTexts.eq(i).html((c === 'e') ? '' : ((c === '0') ? chars.sets[chars.current][0] : chars.sets[chars.current][1]));
				$cells.eq(i).toggleClass('editable', c === 'e').toggleClass('nonEditable', c !== 'e');
			}

			// Update the Visuals of the Table
			updateTodo();
			checkIt();
		};

		var selPuzzle = function(d, l) {
			currentPzl.dif = translateDif(d);
			currentPzl.lvl = l;
			updatePuzzle();
		};

		var nextPuzzle = function() {
			// Select the next UNCOMPLETED puzzle
			for (var i = 0; i < lclStore.progress.length; i++) {
				for (var j = 0; j < lclStore.progress[i].length; j++) {
					if (!lclStore.progress[i][j]) return selPuzzle(i, j);
				}
			}

			// Completed
			toggleCompletion();
		};

		var rndPuzzle = function() {
			// Choose a random difficulty and level
			var randDif = Math.floor(Math.random() * difficulties.length);
			selPuzzle(randDif, Math.floor(Math.random() * lclStore.progress[randDif].length));
		};


		/*---- LOCAL STORAGE ----*/
		var lclStore = {
			mIsPlaying: true,
			sfxEn: true,
			progress: [
				[], // Easy
				[], // Normal
				[], // Hard
				[] // Very Hard
			]
		};

		var saveLclStorage = function() {
			// Progress Data
			localStorage.setItem('completionRate', JSON.stringify(lclStore.progress));

			// Music Data
			localStorage.setItem('music', lclStore.mIsPlaying);

			// Sfx Data 
			localStorage.setItem('sfx', lclStore.sfxEn);

			// Version Data
			localStorage.setItem('version', version);
		};

		var resetProgress = function() {
			// Loop over each sub-array in progress and set them to false.
			for (var i = 0; i < lclStore.progress.length; i++) {
				for (var j = 0; j < lclStore.progress[i].length; j++) lclStore.progress[i][j] = false;
			}

			// Update visuals
			updateStats();

			// Save
			saveLclStorage();
		};

		var updateStats = function() {
			// Counters
			var completed = 0;
			var totalCompleted = 0;
			var total = 0;

			// Go over each difficulty
			for (var i = 0; i < lclStore.progress.length; i++) {
				// Count the completed
				for (var j = 0; j < lclStore.progress[i].length; j++) {
					if (lclStore.progress[i][j]) completed++; // Check if done
				}

				// Counters
				total += lclStore.progress[i].length;
				totalCompleted += completed;
				completed = (completed * 100) / lclStore.progress[i].length; // To percentage

				// Update the HTML elements
				$('.subStat').eq(i).html(Math.floor(completed));

				// Reset
				completed = 0;
			}

			// Total
			$('#ttlStat').html(Math.floor((totalCompleted * 100) / total));
		};

		var readLclStorage = function() {
			// Version Data
			if (localStorage.getItem('version') !== null) {
				// Version Data
				if (version < localStorage.getItem('version')) return;

				// Music Data
				if (localStorage.getItem('music') !== null) {
					// Check if true
					lclStore.mIsPlaying = (localStorage.getItem('music') === 'true');

					// Play or Pause the music				
					(lclStore.mIsPlaying) ? amb.play(): amb.pause();

					// Update visuals
					$('#chbxM').attr('checked', lclStore.mIsPlaying).button('refresh');
				}

				// Sfx Data 
				if (localStorage.getItem('sfx') !== null) {
					// Check if true
					lclStore.sfxEn = (localStorage.getItem('sfx') === 'true');

					// Update visuals
					$('#chbxS').attr('checked', lclStore.sfxEn).button('refresh');
				}

				// Progress Data
				if (localStorage.getItem('completionRate') !== null) {
					// Get Data				
					lclStore.progress = JSON.parse(localStorage.getItem('completionRate'));
				}
			}
		};

		var readData = function() {
			// Ajax call the JSON file with all puzzles
			$.ajax({
				dataType: 'json',
				url: './data/puzzles.json',
				type: 'get',
				success: function(data, textStatus, jqXHR) {
					// Reset
					puzzles = [];

					// Actual Data filling 
					for (var i = 0; i < data.Diff.length; i++) {
						// Sub array
						var sub = [];

						// Fill sub array and expand the Progress
						for (var j = 0; j < data.Diff[i].Puzzle.length; j++) {
							// Puzzle codes
							sub.push(data.Diff[i].Puzzle[j].Code);

							// Progress expanding
							lclStore.progress[i][j] = lclStore.progress[i][j] || false;
						}

						// Push to main array
						puzzles.push(sub);
					}

					// Save it
					saveLclStorage();

					// Update visuals
					updateStats();

					// Select next puzzle
					nextPuzzle();
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.log(errorThrown);
				}
			});
		};

		/*----     MUSIC     ----*/
		var sfx = new Audio('./data/click.mp3');
		var sfxv = new Audio('./data/victory.mp3');
		var amb = new Audio('./data/ambient.wav');

		// Looping the ambient music
		amb.addEventListener('ended', function() {
			this.currentTime = 0;
			this.play();
		}, false);

		// Play the sfx
		var playSFX = function() {
			if (!lclStore.sfxEn) return;
			sfx.pause();
			sfx.currentTime = 0;
			sfx.play();
		};

		// Play the sfx Victory
		var playSFXV = function() {
			if (!lclStore.sfxEn) return;
			sfxv.pause();
			sfxv.currentTime = 0;
			sfxv.play();
		};


		/*----      INI      ----*/
		// Slowly delay the display
		$('body').delay(300).fadeToggle();

		// Show right side
		$sides.toggle(false);
		$card.toggleClass('flipR');
		$helpSide.toggle(true);

		// Data
		var playPromise = amb.play();
		if (playPromise !== undefined) { playPromise.then(_ => {}).catch(error => {}); }
		readLclStorage();
		readData();
		updateTodo();
		checkIt();


		/*----     EVENT     ----*/
		// Title Refresh Page Event
		$('h1').on('click', function(e) {
			location.reload();
		});

		// Easter Egg Event
		$todo.on('click', function(e) {
			playSFX();
			chars.update();
		});

		// Random Puzzle button click
		$('.btnRndm').on('click', function(e) {
			playSFX();
			rndPuzzle();
		});

		// Puzzle Complete
		$victory.on('click', function(e) {
			playSFX();
			toggleVictory();
			updateStats();
			nextPuzzle();
		});

		// Game Complete
		$completion.on('click', function(e) {
			playSFX();
			toggleCompletion();
			resetProgress();
			nextPuzzle();
		});

		// Delete Progress Event
		$deleteProgress.on('click', function(e) {
			playSFX();

			// Rotate Warnings
			if ($deleteProgress.html() !== warnings[warnings.length - 1]) {
				return $deleteProgress.html(warnings[warnings.indexOf($deleteProgress.html()) + 1]);
			}

			// Delete progress
			resetProgress();
			location.reload();
		});

		// Flip buttons
		$('.round-button div p').on('click', function(e) {
			playSFX();

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

			// ShortHands
			var charZero = chars.sets[chars.current][0];
			var charOne = chars.sets[chars.current][1];

			// Change value
			var val = $(this).children('p').html();
			val = (val === charZero) ? charOne : ((val === charOne) ? '' : charZero);
			$(this).children('p').html(val);

			playSFX();
			updateTodo();
			checkIt();
		});

		// Toggle music
		$('#chbxM').on('click', function(e) {
			playSFX();

			// Play or Pause the music
			(lclStore.mIsPlaying) ? amb.pause(): amb.play();
			lclStore.mIsPlaying = !lclStore.mIsPlaying;
			saveLclStorage();
		});

		// Toggle SFX
		$('#chbxS').on('click', function(e) {
			lclStore.sfxEn = !lclStore.sfxEn;
			saveLclStorage();
			playSFX();
		});
	});
})(jQuery);