//#####################
//# Mini Game Machine #
//#####################
//File: index.html
//Created by: Sam Walz <mail[at]samwalz.com> 05. September 2013
//Last changed by: Sam Walz <mail[at]samwalz.com> 03. October 2013


// global variables
var _timeToRespondTimer;
var _maximumTimePerGameTimer;
var _gameTimeCountdownTimer;
var _contentHeight = 800;
var _contentWidth = 450;
var _contentRatio = 1.77777777778;
var _gameRunning = false;
var _gameStartReceived = false;
var _singleGameMode = false;
var _currentGame;
var _selectedGames;
var _selectedGamesAmount;
var _totalScoreCurrentGame = 0;
var _gameTimeCoundown = 0;
var _totalPlayerScore = new Array();
var Player1 = 0;
var Player2 = 1;
var Player3 = 2;
var Player4 = 3;
var _unity; // a possible unity game
var _localStorageAvailable = (typeof(Storage)!=="undefined");

function utf8_to_b64(str) {
    var result = window.btoa(unescape(encodeURIComponent(str)));
    return result.substring(0, result.length - 1);
}

function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}

// sets a game in the list active / inactive
function SetGameActive(game, state)
{
    game.chosen = state;
    if (_localStorageAvailable) {
	    localStorage.setItem(utf8_to_b64(game.path), state);
    }
	
	var currentItem = _games;
	while (currentItem) {
		if (currentItem.path == game.path) {
		    currentItem.chosen = state;
			return;
		}
		currentItem = currentItem.next;
	}
}

// turns the game list into a linked list for convenience
makeLinkedGamesList();
function makeLinkedGamesList()
{
	var linkedGamesList = _g[0];
	var currentItem = linkedGamesList;
	currentItem.chosen = true;
	for (var i = 1; i < _g.length; i++)
	{
		currentItem.next = _g[i];
		currentItem.next.chosen = true;
		currentItem = currentItem.next;
	}
	
	_games = linkedGamesList;
}

// returns a non-linked copy of the linked list (so one can do destructive operations on it)
function gamesCopy()
{
    var gameCounter = 0;		

	// move to the first chosen item in the list
	var currentItem = _games;
	while (currentItem != null && !currentItem.chosen) currentItem = currentItem.next;
	
	// make a copy of the first chosen item
	var copy = new Object();
	copy.first = gameCopy(currentItem);
	if (copy.first) {
		gameCounter++;
	}
	
	var currentItemCopy = copy.first;
	while (currentItem.next)
	{
		if (currentItem.next.chosen)
		{
			currentItemCopy.next = gameCopy(currentItem.next);
			gameCounter++;
			currentItemCopy = currentItemCopy.next;
		}
		currentItem = currentItem.next;
	}
	copy.length = gameCounter;
	return copy;
}
// creates a game copy
function gameCopy(game)
{
	var copy = new Object();
	copy.name = game.name;
	copy.path = game.path;
	copy.type = game.type;
	copy.credits = game.credits;
	copy.instructions = game.instructions;
	return copy;
}

// returns a number - and even if it has to rip it from a string
// worst case it will return a 0
function GetNumber(input)
{
	if (typeof input != "number") {
		var parseResult = parseInt(input);
		if (typeof parseResult != "number") {
		    return 0;
		}
	    return parseResult;
    } else {
		return input;
	}
}


// will do another round of games with the same amount
function AnotherRound()
{
    CompileGamesList(_selectedGamesAmount);
	for (var player = 0; player < 4; player++)
	{
		document.getElementById("totalScorePlayer" + (player + 1)).innerHTML = 0;
		document.getElementById("currentScorePlayer" + (player + 1)).innerHTML = 0;
	}
	StartGames();
}

// compiles a random list of games
function CompileGamesList(amount)
{
	if (_gameRunning) return; // security
	_selectedGamesAmount = amount;
	
	// lets get a nice copy of the games list
	var totalList = new Object();
	totalList = gamesCopy();
	
	// in case there are not enough games, adjust the amount
	if (amount > totalList.length) {
		amount = totalList.length;
	}
	
	
	var selection = cutListItem(totalList, Math.floor((Math.random()*totalList.length)));
	var currentItem = selection;
	
	for (var i = 1; i < amount; i++)
	{
		currentItem.next = cutListItem(totalList, Math.floor((Math.random()*totalList.length)));
		currentItem = currentItem.next;
	}
	currentItem.next = null;
	_selectedGames = selection;
	AddGamesToProgressDisplay();
}

// adds graphical representations of games to the progress display
function AddGamesToProgressDisplay()
{
	var widthList = $("#sideBarRight").width();
	var heightList = $("#sideBarRight").height();
	
	// count number of selected games
	var gameCount = 1;
	var currentItem = _selectedGames;
	while (currentItem.next != null)
	{
		gameCount++;
		currentItem = currentItem.next;
	}
	
	// calculate size for game cubes
	var widthGameCube = _gameCubeMaxSize;
	var problemSolved = false;
	var columnCount = Math.floor(widthList / widthGameCube) - 1;
	while (!problemSolved)
	{
		columnCount++;
		widthGameCube = widthList / columnCount;
		problemSolved = (heightList / widthGameCube) * columnCount > gameCount;
	}
	widthGameCube--;
	
	// add game cubes to the progress display
	$("#sideBarRight").empty();
	var currentItem = _selectedGames;
	while (currentItem != null)
	{
		$("#sideBarRight").append('<div class="gameCube" id="game' + utf8_to_b64(currentItem.path) + '"></div>');
		currentItem = currentItem.next;
	}
	
	// assign css attributes
	$(".gameCube").css("width", widthGameCube - 6).css("height", widthGameCube - 6);
	
}

// colors a game cube according to who has won
function ColorGameCube()
{
    var gameCube = $("#game" + utf8_to_b64(_currentGame.path));
	gameCube.addClass("gameCubeSolved");
	if (_currentGame.score[Player1] > _currentGame.score[Player2]
		&& _currentGame.score[Player1] > _currentGame.score[Player3]
		&& _currentGame.score[Player1] > _currentGame.score[Player4]) {
		gameCube.addClass("gameCubePlayer1");
	} else if (_currentGame.score[Player2] > _currentGame.score[Player1]
		&& _currentGame.score[Player2] > _currentGame.score[Player3]
		&& _currentGame.score[Player2] > _currentGame.score[Player4]) {
		gameCube.addClass("gameCubePlayer2");
	} else if (_currentGame.score[Player3] > _currentGame.score[Player1]
		&& _currentGame.score[Player3] > _currentGame.score[Player2]
		&& _currentGame.score[Player3] > _currentGame.score[Player4]) {
		gameCube.addClass("gameCubePlayer3");
	} else if (_currentGame.score[Player4] > _currentGame.score[Player1]
		&& _currentGame.score[Player4] > _currentGame.score[Player2]
		&& _currentGame.score[Player4] > _currentGame.score[Player3]) {
		gameCube.addClass("gameCubePlayer4");
	}
	
}

// marks a game cube active
function ColorGameCubeActive()
{
    var gameCube = $("#game" + utf8_to_b64(_currentGame.path));
	gameCube.addClass("gameCubeActive");
		
}

// marks a game cube damaged
function ColorGameCubeDamaged()
{
    var gameCube = $("#game" + utf8_to_b64(_currentGame.path));
	gameCube.addClass("gameCubeDamaged");
		
}

// returns a game at a given position (destructive: removes it also from the list -> to make sure no game ends up twice in the new list)
function cutListItem(list, position)
{
	var item = list.first;
	if (position == 0) {list.first = item.next; list.length--; return item;}
	var previousItem;
	for (var i = 0; i < position; i++)
	{
		previousItem = item;
		item = item.next;
	}
	if (item) {
		previousItem.next = item.next;
		list.length--;
	}
	
	return item;
}

// will start the whole game lineup
function StartGames()
{
	if (_gameRunning) return; // security
	_totalPlayerScore[Player1] = 0; _totalPlayerScore[Player2] = 0; _totalPlayerScore[Player3] = 0; _totalPlayerScore[Player4] = 0; // reset total score
	
	
	ShowCountdownToGame();
}

// adds an amount of points to a player
function PlayerPoints(player, amount)
{
    var number = GetNumber(amount);
	if (_totalScoreCurrentGame + number <= _maxPointsPerGame)
	{
		_totalScoreCurrentGame += number;
		_currentGame.score[player] += number;
		_totalPlayerScore[player] += number;
		document.getElementById("totalScorePlayer" + (player + 1)).innerHTML = _totalPlayerScore[player];
		document.getElementById("currentScorePlayer" + (player + 1)).innerHTML = _currentGame.score[player];
	}
}
 
function ShowScoreboard() // will show the score board
{
	if (_gameRunning) return; // security
	LoadHTML5Game("scoreBoard.html");
}

OptimizeDimensions();
function OptimizeDimensions() // will resize everything so it will fit nicely in the window
{
	var screenWidth = $(window).width();
	var screenHeight = $(window).height();
	
	// recalculate content dimensions
	_contentHeight = (screenHeight / 4) * 3;
	_contentWidth = _contentRatio * _contentHeight;
	
	// set new dimensions
    $("#content").css("width", _contentWidth).css("height", _contentHeight);
    $("#unityPlayer").css("width", _contentWidth).css("height", _contentHeight);
	
	if (_contentWidth + 100 < screenWidth)
	{
			
		var sideBarWidth = (screenWidth - _contentWidth) / 2;
		$("#content").css("left", sideBarWidth);
		$("#sideBarLeft").css("width", sideBarWidth).css("height", screenHeight)
		    .css("top", 0).css("left", 0);
		$("#sideBarRight").css("width", sideBarWidth).css("height", screenHeight)
		    .css("top", 0).css("left", _contentWidth + sideBarWidth);
		
		$("#score").css("height", screenHeight/4).css("width", _contentWidth)
		    .css("top", _contentHeight).css("left", sideBarWidth);
		$(".scoreBox").css("width", _contentWidth / 4.1);
	}
	else
	{
	
		var gapSize = (screenWidth - _contentWidth) / 2;	
		var sideBarWidth = (screenHeight / 4);
		$("#content").css("left", gapSize);
		$("#sideBarLeft").css("width", sideBarWidth).css("height", sideBarWidth)
		    .css("top", _contentHeight).css("left", gapSize);
		$("#sideBarRight").css("width", sideBarWidth).css("height", sideBarWidth)
		    .css("top", _contentHeight).css("left", _contentWidth - sideBarWidth + gapSize);
		
		$("#score").css("height", screenHeight/4).css("width", _contentWidth - 2 * sideBarWidth)
		    .css("top", _contentHeight).css("left", sideBarWidth + gapSize);
		$(".scoreBox").css("width", (_contentWidth - 2 * sideBarWidth) / 4.2);
	}
	
	// resize possible existing game content frames / embeds
	var html5Frame = $("#html5PlayeriFrame");
	var flashFrame = $("#flashPlayerEmbed");
	var javaFrame = $("#javaObject");
	var unityFrame = $("#unityEmbed");
	var unityFrameOuter = $("#unityPlayer");
	if (html5Frame) {
		html5Frame.css("width", _contentWidth).css("height", _contentHeight);
	} else if (flashFrame) {
		flashFrame.css("width", _contentWidth).css("height", _contentHeight);
	} else if (javaFrame) {
		javaFrame.css("width", _contentWidth).css("height", _contentHeight);
	} else if (unityFrame) {
		unityFrame.css("width", _contentWidth).css("height", _contentHeight);
		unityFrameOuter.css("width", _contentWidth).css("height", _contentHeight);
	}
	
	
}

function PrepareNextGame()
{
    if (_gameRunning) return; // security
	//_currentGameNumber++
	if (_currentGame == null) _currentGame = _selectedGames;
	else _currentGame = _currentGame.next;
}

function LoadNextGame() // will load the next game in the list
{
	if (_gameRunning) return; // security
	
	
	if (_currentGame == null)
	{
		ShowScoreboard();
	}
	else
	{
		LoadGame(_currentGame, true);
	}
}

function LoadGame(game, useTimers)
{
	if (_gameRunning) return; // security
    _gameStartReceived = false;
	
	// initialize score
	game.score = new Array();
	game.score[0] = 0; // score player 1
	game.score[1] = 0; // score player 2
	game.score[2] = 0; // score player 3
	game.score[3] = 0; // score player 4
	_totalScoreCurrentGame = 0;
	document.getElementById("currentScorePlayer1").innerHTML = 0;
	document.getElementById("currentScorePlayer2").innerHTML = 0;
	document.getElementById("currentScorePlayer3").innerHTML = 0;
	document.getElementById("currentScorePlayer4").innerHTML = 0;
	
	// load according to type
	switch (game.type)
	{
		case "unity":
			LoadUnityGame(_gamesDirectory + "/" + game.path);
		break;
		case "swf":
		case "flash":
			LoadFlashGame(_gamesDirectory + "/" + game.path);
		break;
		case "html":
		case "html5":
			LoadHTML5Game(_gamesDirectory + "/" + game.path);
		break;
		case "java":
			LoadJavaGame(_gamesDirectory + "/" + game.path);
		break;
	}
	
	if (useTimers)
	{
		// timeout for game to respond
		clearTimeout(_timeToRespondTimer);
		_timeToRespondTimer = window.setTimeout("GameDoesNotRespond()", _timeToRespond * 1000);
	}
	
	// now the game is running
	_gameRunning = true;
	
}

// game did not respond within given time
function GameDoesNotRespond()
{
	_gameRunning = false;
	ColorGameCubeDamaged();
	//window.clearInterval(_maximumTimePerGameTimer);
	SetGameActive(_currentGame, false); // deactivate game: does not respond = do not use next time
	ShowCountdownToGame(); // prepare next game
}

// game ran longer than given time
function GameReachedMaximumTime()
{
	_gameRunning = false;
	ColorGameCube();
	ShowCountdownToGame();
}


// prepares the next game
function ShowCountdownToGame()
{
	window.clearInterval(_gameTimeCountdownTimer);	
		
    // reset counter display
    document.getElementById("currentScorePlayer1").innerHTML = 0;
	document.getElementById("currentScorePlayer2").innerHTML = 0;
	document.getElementById("currentScorePlayer3").innerHTML = 0;
	document.getElementById("currentScorePlayer4").innerHTML = 0;
    PrepareNextGame();
	if (_currentGame) {
		TryPreloadGame(_currentGame); // try to preload the game
		ColorGameCubeActive(); // set game cube active
		LoadHTML5Game("countdownBetweenGames.html#7"); // 7 second pause between games
	} else {
		ShowScoreboard();
	}
    
}

// will try any tricks known to mankind to make the browser
// preload the next game
function TryPreloadGame(game)
{
	var idPrerender = "prerenderGame";
	var idPrefetch = "prefetchGame";
	$("#" + idPrerender).remove();
	$("#" + idPrefetch).remove();
	$("head").append('<link rel="prefetch" id="' + idPrefetch + '" href="' + _gamesDirectory + "/" + game.path + '">');
	$("head").append('<link rel="prerender" id="' + idPrerender + '" href="' + _gamesDirectory + "/" + game.path + '">');
}

// will load a HTML5 game
function LoadHTML5Game(path)
{
	if (_gameRunning) return; // security
	
	// hide / show elements
	$("#html5Player").show().empty();
	$("#unityPlayer").hide().empty();
	$("#flashPlayer").hide().empty();
	$("#javaPlayer").hide().empty();
	
	$("#html5Player").append('<iframe id="html5PlayeriFrame" src="' + path + '" width=' + _contentWidth + ' height=' + _contentHeight + ' seamless="true" sandbox="allow-scripts allow-same-origin allow-top-navigation"></iframe>');
	setTimeout(LoadHTML5GameSetFocus, 100);
}

// helper function to set focus on the html5 iFrame
function LoadHTML5GameSetFocus()
{
	var html5iFrame = $("#html5PlayeriFrame")[0];
    html5iFrame.tabIndex = 1235;
    html5iFrame.contentWindow.focus();
}


// will load a Flash game
function LoadFlashGame(path)
{
	if (_gameRunning) return; // security
	
	// hide / show elements
	$("#html5Player").hide().empty();
	$("#unityPlayer").hide().empty();
	$("#flashPlayer").show().empty();
	$("#javaPlayer").hide().empty();
	
	$("#flashPlayer")
		.append('<embed id="flashPlayerEmbed" src="' + path
				+ '" height=' + _contentHeight
				+ ' width=' + _contentWidth
				+ ' wmode="opaque" type="application/x-shockwave-flash"></embed>');
	setTimeout(LoadFlashGameSetFlashFocus, 100);
}

// helper function to set focus on the flash element
function LoadFlashGameSetFlashFocus()
{
	//$("#flashPlayerEmbed").attr("wmode", "opaque");
	var flash = document.getElementById("flashPlayerEmbed");
    flash.tabIndex = 1234;  // This was needed on Chrome 23
    flash.focus();
    // Attention: FireFox needs wmode "opaque"!
}

// will load a Java game
function LoadJavaGame(path)
{
	if (_gameRunning) return; // security
	
	// hide / show elements
	$("#html5Player").hide().empty();
	$("#unityPlayer").hide().empty();
	$("#flashPlayer").hide().empty();
	$("#javaPlayer").show().empty();
	
	$("#javaPlayer").append('<object id="javaObject" type="application/x-java-applet" height=' + _contentHeight + ' width=' + _contentWidth + '>'
							+ '<param name="code" value="ChainJam" />'
							+ '<param name="archive" value="' + path + '" />'
							+ 'Applet failed to run.  No Java plug-in was found.'
							+ '</object>');
}

// will load a Unity3D game
function LoadUnityGame(path)
{
	if (_gameRunning) return; // security
	
	// hide / show elements
	$("#html5Player").hide().empty();
	$("#unityPlayer").show().empty();
	$("#flashPlayer").hide().empty();
	$("#javaPlayer").hide().empty();
	
	var config = {
		width: _contentWidth, 
		height: _contentHeight,
		params: { enableDebugging:"0" }
		
	};
	_unity = new UnityObject2(config);

	jQuery(function() {

		var $missingScreen = jQuery("#unityPlayer").find(".missing");
		var $brokenScreen = jQuery("#unityPlayer").find(".broken");
		$missingScreen.hide();
		$brokenScreen.hide();
		
		_unity.observeProgress(function (progress) {
			switch(progress.pluginStatus) {
				case "broken":
					$brokenScreen.find("a").click(function (e) {
						e.stopPropagation();
						e.preventDefault();
						u.installPlugin();
						return false;
					});
					$brokenScreen.show();
				break;
				case "missing":
					$missingScreen.find("a").click(function (e) {
						e.stopPropagation();
						e.preventDefault();
						u.installPlugin();
						return false;
					});
					$missingScreen.show();
				break;
				case "installed":
					$missingScreen.remove();
				break;
				case "first":
				break;
			}
		});
		_unity.initPlugin(jQuery("#unityPlayer")[0], path);
		//$("#unityPlayer").focus();
	});
}



// counts the amount of seconds left for the current game down
function CountDownGameTime() {
    _gameTimeCoundown--;
	if (_gameTimeCoundown > 0)
	{
		$("#gameTimeCountdown").text(_gameTimeCoundown);
	}
	else
	{
		$("#gameTimeCountdown").text("");
	}
	
	if (_gameTimeCoundown > 9)
	{
		$("#gameTimeCountdown").css("font-size", "3vh");
	}
	else
	{
		$("#gameTimeCountdown").css("font-size", (10 - _gameTimeCoundown + 3) + "vh");
	}
}




