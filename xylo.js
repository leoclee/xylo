var title = document.title;
// sounds by NoiseCollector (https://freesound.org/people/NoiseCollector/packs/6829/)
var sounds = [
	new Howl({src: ['sounds/107510__noisecollector__toyxlo1.wav']}),
	new Howl({src: ['sounds/107511__noisecollector__toyxlo2.wav']}),
	new Howl({src: ['sounds/107512__noisecollector__toyxlo3.wav']}),
	new Howl({src: ['sounds/107513__noisecollector__toyxlo4.wav']}),
	new Howl({src: ['sounds/107514__noisecollector__toyxlo5.wav']}),
	new Howl({src: ['sounds/107515__noisecollector__toyxlo6.wav']}),
	new Howl({src: ['sounds/107516__noisecollector__toyxlo7.wav']}),
	new Howl({src: ['sounds/107517__noisecollector__toyxlo8.wav']})]
function playSound(id) {
	if (id < 1 || id > 8) {
		return;
	}
	sounds[id - 1].play();
	let bar = document.getElementById("bar" + id);
	bar.classList.add("played");

	// reset animation (see https://stackoverflow.com/a/45036752)
	bar.style.animation = 'none';
	bar.offsetHeight; /* trigger reflow */
	bar.style.animation = null;
}
function handleKeyPress(e) {
	// do not play sounds if typing in an input (https://stackoverflow.com/a/2167126)
	switch (e.target.tagName) {
		case "INPUT": case "SELECT": case "TEXTAREA": return;
	}
	// TODO charCode is deprecated
	let charCode = e.charCode;
	if (e.charCode >=49 && e.charCode <= 56) {
		// 12345678
		playSound(e.charCode - 48);
	} else if (e.charCode >= 99 && e.charCode <= 103) {
		// cdefg
		playSound(e.charCode - 98);
	} else if (e.charCode == 97 || e.charCode == 98) {
		// ab
		playSound(e.charCode - 91);
	} else if (e.charCode == 67) {
		// C
		playSound(8);
	} else if (e.charCode == 32) {
		// space
		play();
	}
}
function handleKeyDown(e) {
	let key = e.key;
	if (key === "Home") {
		// home cannot be detected by key press
		nextNotesIndexToPlay = 0;
		offsetTime = 0;
		if (id != null) {
			startTime = Date.now();
		}
		updateCursor(0);
	}
}
let notes = document.getElementById("notes");
var songLength;
var id = null;
var offsetTime = 0;
var startTime;
var nextNotesIndexToPlay = 0;
document.addEventListener('keypress', handleKeyPress);
document.addEventListener('keydown', handleKeyDown);
function handleHashChange() {
	let hash = location.hash.substr(1);
	if (!hash) {
		hash = "t=&s=500&m=4&n=";
	}
	let params = new URLSearchParams(hash);
	song.notes = params.get('n').split("").map(x => Number(x) ? Number(x) : null).map(x => x > 0 && x < 9 ? x : null);
	updateNotes();
	// title
	document.getElementById("title").value = params.get('t');
	handleTitleInput(document.getElementById("title").value);
	// measure length
	document.getElementById("measureLength").value = params.get('m');
	handleMeasureLengthChange(document.getElementById("measureLength").value);
	// speed
	document.getElementById("speed").value = 1000-params.get('s');
	handleSpeedInput(document.getElementById("speed").value);
}
window.addEventListener('hashchange', handleHashChange, false);
document.getElementById("volume").addEventListener('input', e => {
	Howler.volume(e.target.value/100);
});
function handleLabelChange() {
	notes.classList.toggle("letter");
	document.getElementById("container").classList.toggle("letter");
}
var radios = document.querySelectorAll('input[type=radio][name="labels"]');
Array.prototype.forEach.call(radios, function(radio) {
	radio.addEventListener('change', handleLabelChange);
});
function handleSpeedInput(val) {
	let oldSpeed = song.speed;
	// maps 0 to 950 of input range to 1000 to 50 millis between notes
	song.speed = 1000-val;
	offsetTime = oldSpeed ? offsetTime * song.speed / oldSpeed : offsetTime;
	if (id != null) {
		// playing
		offsetTime += oldSpeed ? (Date.now()-startTime) * song.speed / oldSpeed : Date.now()-startTime;
		startTime = Date.now();
	} else {
		// not playing
		updateCursor(offsetTime);
	}
}
document.getElementById("speed").addEventListener('input', e => {
	handleSpeedInput(e.target.value);
});
// we use the change event because (at least in Chrome) it only fires on mouse release
document.getElementById("speed").addEventListener('change', () => {
	writeHash();
});
function handleMeasureLengthChange(val) {
	let el = document.getElementById("measureLength");
	song.measureLength = Math.max(Math.min(val, el.max), el.min);
	updateMeasureLength();
}
document.getElementById("measureLength").addEventListener('change', e => {
	handleMeasureLengthChange(e.target.value);
	writeHash();
});
function handleTitleInput(val) {
	song.title = val;
	document.title = (val && val.trim()) ? val.trim() + " - " + title : title;
}
document.getElementById("title").addEventListener('input', e => {
	handleTitleInput(e.target.value);
	writeHash();
});

function writeHash() {
	// TODO IE doesn't support URLSearchParams
	let hash = "#" + new URLSearchParams({
		t: song.title,
		s: song.speed,
		m: song.measureLength,
		// we can get a shorter hash if we can avoid using comma (which URL encodes to %2C)
		n: song.notes.join('-').replaceAll(/-(\d)/g,"$1")
	}).toString();
	// try not to junk up history by using location.replace instead of history.replaceState https://stackoverflow.com/a/6945614
	location.replace(hash);
}

var song = {
	// Mary Had a Little Lamb
	/*
	title: "Mary Had a Little Lamb",
	speed: 400,
	measureLength: 4,
	notes: [3,2,1,2,3,3,3,,2,2,2,,3,5,5,,3,2,1,2,3,3,3,3,2,2,3,2,1]
	*/
	// Row, Row Your Boat
	/*
	title: "Row, Row Your Boat",
	speed: 175,
	measureLength: 6,
	notes: [1,,,1,,,1,,2,3,,,3,,2,3,,4,5,,,,,,8,8,8,5,5,5,3,3,3,1,1,1,5,,4,3,,2,1]
	*/
	// Twinkle Twinkle Little Star
	/*
	title: "Twinkle Twinkle Little Star",
	speed: 300,
	measureLength: 4,
	notes: [1,1,5,5,6,6,5,,4,4,3,3,2,2,1,,5,5,4,4,3,3,2,,5,5,4,4,3,3,2,,1,1,5,5,6,6,5,,4,4,3,3,2,2,1]
	*/
	// Old MacDonald
	/*
	title: "Old MacDonald",
	speed: 150,
	measureLength: 8,
	notes: [5,,5,,5,,2,,3,,3,,2,,,,7,,7,,6,,6,,5,,,,,,2,,
			5,,5,,5,,2,,3,,3,,2,,,,7,,7,,6,,6,,5,,,,,,2,2,
			5,,5,,5,,2,2,5,,5,,5,,,,5,5,5,,5,5,5,, 5,5,5,5,5,,5,,
			5,,5,,5,,2,,3,,3,,2,,,,7,,7,,6,,6,,5]
	*/
	// Sweet Dreams (Goodnight Song) by Super Simple (see https://supersimple.com/downloads/sheet-music-sweet-dreams.pdf)
	/*
	title: "Sweet Dreams (Goodnight Song)",
	speed: 769, // 78 bpm
	measureLength: 3,
	notes: [,,3,
			5,,6,5,,3,2,,3,1,,3,
			5,,6,5,,4,3,,4,2,,1,
			3,,5,6,,7,8,,6,5,,5,
			2,,3,1,,,1]
	*/
	// Do-Re-Mi (The Sound of Music)
	/*
	title: "Do-Re-Mi",
	speed: 200,
	measureLength: 4,
	notes: [1,,,2,3,,,1,3,,1,,3,,,,2,,,3,4,4,3,2,4,,,,
			3,,,4,5,,,3,5,,3,,5,,,,4,,,5,6,6,5,4,6,,,,
			5,,,1,2,3,4,5,6,,,,6,,,2,3,4,5,6,7,,,,
			7,,,3,4,5,6,7,8,,,,,,7,6,5,,4,,7,,5,,8,,,,
			1,,2,,3,,4,,5,,6,,7,,8]
	*/
};
handleHashChange();
/*
// song title
document.getElementById("title").value = song.title;
// measure length
document.getElementById("measureLength").value = song.measureLength;
// maps 50 to 1000 millis between notes to 0 to 950 of input range
document.getElementById("speed").value = 1000-song.speed;
updateMeasureLength();
*/
notes.addEventListener('click', function(e) {
	offsetTime = Math.min((songLength - 1) * song.speed, Math.max(0, e.offsetX - 23) * song.speed / 50);
	nextNotesIndexToPlay = Math.ceil(offsetTime / song.speed);
	if (id != null) {
		startTime = Date.now();
	} else {
		updateCursor(offsetTime);
	}
});
function updateNotes() {
	while (notes.firstChild) {
		notes.firstChild.remove();
	}
	for (const [i, value] of song.notes.entries()) {
		if (value && value > 0) {
			let note = document.createElement("div");
			let span = document.createElement("span");
			note.style.left = i*50 + "px";
			note.className = "note note" + value;
			note.dataset.index = i;
			note.appendChild(span);
			notes.appendChild(note);
		}
	}
}

function updateMeasureLength() {
	// songLength can pad the end of song if necessary (taking measure length into account and filling up the remainder of a measure with rests)
	songLength = (song.measureLength && song.measureLength > 0) ? Math.max(1,Math.ceil(song.notes.length/song.measureLength))*song.measureLength : song.notes.length
	if (song.measureLength && song.measureLength > 0) {
		// draw bar lines
		let width = song.measureLength * 50;
		notes.style.background = "repeating-linear-gradient(to right, rgb(0,0,0,0) 0, rgb(0,0,0,0) " + (width - 4) + "px, grey " + (width - 2) + "px, rgb(0,0,0,0) " + width + "px)";
	} else {
		// remove bar lines
		notes.style.background = "";
	}
	// update notes width
	notes.style.width = songLength * 50 + "px";

	// if the cursor is now past the end, move it back to the end
	if (document.getElementById("cursor").style.left.slice(0,-2) > (songLength-1)*50 + 25 - 2) {
		nextNotesIndexToPlay = songLength;
		offsetTime = (songLength-1)*song.speed;
		if (id != null) {
			startTime = Date.now();
		}
		updateCursor(offsetTime);
	}
}
updateCursor(offsetTime);
function play() {
	if (id != null) {
		// already playing, so pause
		return pause();
	}
	clearInterval(id);
	startTime = Date.now();
	id = setInterval(frame, 20); // 16 is 120 fps, 41 is about 24 fps
	if (nextNotesIndexToPlay >= songLength) {
		offsetTime = 0;
		nextNotesIndexToPlay = 0;
	}
	function frame() {
		let cursor = document.getElementById("cursor");
		let elapsedTime = offsetTime + Date.now() - startTime;
		updateCursor(elapsedTime);
		cursor.scrollIntoView({behavior:'auto',block:'center',inline:'center'});

		if (Math.floor(elapsedTime / song.speed) == nextNotesIndexToPlay) {
			let note = song.notes[nextNotesIndexToPlay];
			if (note) {
				playSound(note);
				let noteElement = document.querySelector('.note[data-index="' + nextNotesIndexToPlay + '"] span');
				noteElement.classList.add("played");

				// reset animation (see https://stackoverflow.com/a/45036752)
				noteElement.style.animation = 'none';
				noteElement.offsetHeight; /* trigger reflow */
				noteElement.style.animation = null;
			}
			nextNotesIndexToPlay++;
		}

		if (nextNotesIndexToPlay >= songLength || elapsedTime > (songLength-1)*song.speed) {
			clearInterval(id);
			id = null;
			offsetTime = (songLength-1)*song.speed;

			// loop/repeat
			if (document.getElementById("loop").checked) {
				setTimeout(play, song.speed);
			}
		}
	}
}

function pause() {
	clearInterval(id);
	id = null;
	// store current time as the offset
	offsetTime += Date.now() - startTime;
}

function updateCursor(millis) {
	// set time
	// inspired by https://stackoverflow.com/a/25279399
	// this will probably start doing weird stuff for anything over an hour (unlikely?)
	document.getElementById("time").innerText = new Date(Math.min((songLength-1) * song.speed, millis)).toISOString().substr(14, 9);
	// set cursor position
	document.getElementById("cursor").style.left = (Math.min((songLength-1)*50, (millis * 50 / song.speed)) + 25 - 2) + "px";
}
