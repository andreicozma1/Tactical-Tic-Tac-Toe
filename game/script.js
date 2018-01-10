Raven.config('https://05373eceed834e15b460e059268094a6@sentry.io/265995').install()

var database = {
    main: firebase.database(),
    dbPlayers: 0,
    dbReset: 0,
    db: 0,
    db1: 0,
    db3: 0,
    db4: 0,
    db5: 0,
    db6: 0
}

var c = document.getElementById("myCanvas"); // GETS THE canvas ELEMENTS FROM HTML AND PUTS IT IN VARIABLE c
c.width = window.innerWidth; // SETS THE CANVAS WIDTH TO THE INNER WIDTH OF THE WINDOW
c.height = window.innerHeight; // SETS THE CANVAS HEIGHT TO THE INNER HEIGHT OF THE WINDOW
var ctx = c.getContext("2d"); // THE CONTEXT OF THE CANVAS IS WHAT WE'LL USE TO DRAW SHAPES

var date = new Date();
var draw = {};

var mouseX = 0;
var mouseY = 0;

var isTouch = false;

var blockCount;

var textSize;

var notYourTurn = false;

var overwriteFPSsaver = false;
var reduceMotionCt = 0;
var avgFps = [];

var timers = {
    gameRuntime: [],
    notYourTurnRuntime: [],
    highlightRuntime: [],
    waitingRuntime: [],
    playingRuntime: [],
}

var lobbySearchInterval;
var pingDbWithPlayerRuntimeInterval;

var game = {
    singleRendering: false,
    reduceMotion: false,
    gradient: true,
    targetFPS: 0,
    actualFPS: 0,
    pingDbWithPlayerRuntimeTime: 700,
    cleanupDatabaseTime: 4000,
    availableLobbies: [],
    currentScreen: null,
    screens: {
        start: 0,
        join: 1,
        game: 2,
        options: 3,
    },
    style: 1,
    singleplayer: false,
    placeAnywhere: false,
    singleMarker: 0,
    debug: false,
    Xcolor: "#f80713",
    Ocolor: "#00a2e8",
    textHighlightColor: "#00a2e8"
};

var gameBoard = {
    player: "",
    fractals: 2,
    isPaused: true,
    number: null,
    highlighter: [],
    lastMove: [],
    Xes: [], // contains the indices for each X, for example, [0,0] means top left, [8,8] means bottom right
    Os: [], // contains the indices for each X, for example, [0,0] means top left, [8,8] means bottom right
    isXTurn: true, // Used to switch between X and O. X is the starting mark.
    pendingReset: 0,
    blocksWon: []
}

var bigBox = {
    x: 0,
    y: 0,
    sidelength: 0,
    width: 0,
    height: 0,
    linethiccness: 0,
    markerPadding: 0, // padding used for X and O marks.
    boxCoords: {
        x: [],
        y: [],
    },
    smallBoxLength: 0
};

var elements = [];
var prerenderedId = [];
var prerendered = [];
var alreadyRendered = []

function Element() {
    this.x = c.width / 2;
    this.y = c.height / 2;
    this.text = "TEXT";
    this.size = textSize;
    this.weight = "normal";
    this.bold = false;
    this.italic = false;
    this.color = "";
    this.textAlign = "center";
    this.font = "Arial";
    this.highlightColor = game.textHighlightColor;
    this.static = true;
    this.angle = 0;

    var isHovering = false;

    this.onClick = function() {}
    this.onHover = function() {}

    this.show = function() {

        var id = this.text + this.x + this.y + this.size;

        ctx.font = (this.italic ? "italic " : "") + (this.bold ? "bold " : (this.weight + " ")) + this.size + "px " + this.font;
        var textWidth = ctx.measureText(this.text).width;

        try {
            if (mouseX > this.x - textWidth / 2 && mouseX < this.x + textWidth / 2 && mouseY > this.y - this.size && mouseY < this.y) {
                this.onHover();
                isHovering = true;
            }
        }

        catch (e) {}

        var texts = this.text.toString().split("\n");
        var longestStr = {};
        longestStr.text = "";
        for (var i = 0; i < texts.length; i++) {
            if (longestStr.text.length < texts[i].length) {
                longestStr.text = texts[i];
            }
        }
        longestStr.width = ctx.measureText(longestStr.text).width;

        if (!this.static || !game.singleRendering) {
            if (this.static == false && game.singleRendering) {
                ctx.clearRect(this.x - ((this.textAlign == "center") ? (longestStr.width / 2) : ((this.textAlign == "right") ? (longestStr.width) : 0)), this.y - this.size * .8, longestStr.width, this.size * texts.length)
            }

            if (isHovering && this.onClick.toString().length > 20) {
                ctx.fillStyle = this.highlightColor;
            }
            else {
                ctx.fillStyle = (this.color != "") ? this.color : "#000000";
            }

            ctx.textAlign = this.textAlign;

            if (this.angle != 0) {
                ctx.save();
                ctx.translate(c.width / 2, c.height / 2);
                ctx.rotate(this.angle) //+ timers.playingRuntime.ms / 1000);
                ctx.translate(-c.width / 2, -c.height / 2);
            }
            if (game.debug) {
                draw.rectangle(this.x - ((this.textAlign == "center") ? ((textWidth) / 2) : ((this.textAlign == "right") ? ((this.size / 1.5 * this.text.length)) : 0)), this.y - this.size * .75, longestStr.width, (texts.length > 1) ? ((this.size) * texts.length) : (this.size * .8), 1, false, "red");
            }

            for (var i = 0; i < texts.length; i++) {
                ctx.fillText(texts[i], this.x, this.y + this.size * i);
            }


            if (this.angle != 0) {
                ctx.restore();
            }
        }
        else {
            if (prerenderedId.indexOf(id) == -1) {
                var preRender = document.createElement('canvas');
                var context = preRender.getContext('2d');
                preRender.width = c.width;
                preRender.height = c.height;
                context.textAlign = this.textAlign;

                context.fillStyle = (this.color != "") ? this.color : "#000000";
                context.font = (this.italic ? "italic " : "") + (this.bold ? "bold " : (this.weight + " ")) + this.size + "px " + this.font;
                for (var i = 0; i < texts.length; i++) {
                    context.fillText(texts[i], this.x, this.y + this.size * i);
                }
                prerenderedId.push(id);
                prerendered.push(preRender);
            }
            else {
                if (prerendered[prerenderedId.indexOf(id)] != null && (alreadyRendered.indexOf(id, 0) == -1 || !game.singleRendering)) {
                    ctx.drawImage(prerendered[prerenderedId.indexOf(id)], 0, 0)
                    alreadyRendered.push(id);
                }
            }
        }
        elements.push(this);
    }
}

setup();
var my_gradient;

function setup() {
    console.log("setup: Running Setup")
    date = new Date();
    window.onbeforeunload = function(e) {
        if (game.currentScreen == game.screens.game) {
            menuAction();
            var msg = "Are you sure you want to quit?";
            return msg;
        }
    };
    document.body.addEventListener('touchmove', function(event) {
        isTouch = true;
        mouseX = event.touches[0].pageX;
        mouseY = event.touches[0].pageY;
        event.preventDefault();
    }, false);
    document.body.addEventListener('touchstart', function(event) {
        isTouch = true;
        mouseX = event.touches[0].pageX;
        mouseY = event.touches[0].pageY;
    }, false);
    document.body.addEventListener('touchend', function(event) {
        isTouch = true;
        onClick();
        mouseX = 0;
        mouseY = 0;
    }, false);

    document.addEventListener("click", function(event) {
        if (!isTouch) {
            onClick(event);
        }
        isTouch = false
    });
    document.addEventListener("mousemove", function(event) {
        if (!isTouch) {
            onMouseMove(event)
        }
    });

    timers.gameRuntime.original = date.getTime();

    window.onresize = onResize; // when resizing, the "resize" function gets called

    onResize(); // called once in the beginning to set all the dimensions right

    switchScreen(game.screens.start);

    window.requestAnimationFrame(gameLoop);
    //setTimeout(gameLoop, 1000 / game.targetFPS) // starts the game loop. Repeats the function "gameLoop"

    timers.playingRuntime.original = date.getTime();


    if (!navigator.onLine) {
        game.singleplayer = true;
    }

    setInterval(cleanupDatabase, game.cleanupDatabaseTime);

    if (!game.singleplayer && (game.placeAnywhere != 0 || game.singleMarker)) {
        console.log("Game in DEBUG MODE. Switching to SP")
        game.singleplayer = true;
    }
}


function gameLoop() {
    //setupScreens();
    //console.log(prerenderedId)

    if (!game.singleRendering) {
        elements = [];
    }

    date = new Date();

    timers.playingRuntime.frameTime = date.getTime() - timers.playingRuntime.endOfLoop;
    game.actualFPS = Math.round(1000 / timers.playingRuntime.frameTime);

    timers.gameRuntime.ms = date.getTime() - timers.gameRuntime.original;

    if (game.singleRendering) {
        game.reduceMotion = true;
        game.gradient = false;
    }

    if (game.gradient) {
        ctx.fillStyle = my_gradient;
        ctx.fillRect(0, 0, c.width, c.height);
    }
    else {
        if (!game.singleRendering) {
            ctx.clearRect(0, 0, c.width, c.height);
        }
    }

    if (avgFps.length > 100) {
        avgFps.splice(0, 1);
    }
    var sum;
    if (avgFps.length > 1) {
        sum = avgFps.reduce(function(a, b) {
            return a + b;
        });
    }


    if (game.currentScreen != game.screens.game && !game.reduceMotion) {
        ctx.save();
        ctx.translate(c.width / 2, c.height / 2);
        ctx.rotate(timers.gameRuntime.ms / 10000) //+ timers.playingRuntime.ms / 1000);
        ctx.translate(-c.width / 2, -c.height / 2);
        draw.all("lightgray");
        ctx.restore();
    }

    switch (game.currentScreen) {
        case game.screens.start:
            ctx.filter = 'blur(0px)';

            var modeText = new Element();
            modeText.text = game.singleplayer ? "-singleplayer-" : "-multiplayer-";
            modeText.y = 30 + textSize * 3.5;
            modeText.font = "Courier New"
            modeText.onClick = function() {
                if (game.singleplayer) {
                    game.singleplayer = false;
                    game.placeAnywhere = false;
                    game.singleMarker = 0;
                }
                else {
                    game.singleplayer = true;
                }
            }
            modeText.show();

            var tacticalText = new Element();
            tacticalText.size = textSize * 2;
            tacticalText.text = "TACTICAL";
            tacticalText.y = 30 + textSize * 1.5;
            tacticalText.bold = true;
            tacticalText.show();

            var ticTacToeText = new Element();
            ticTacToeText.size = textSize * 1.5;
            ticTacToeText.text = "Tic-Tac-Toe";
            ticTacToeText.y = 30 + textSize * 2.47;
            ticTacToeText.show();


            var newBtn = new Element();
            newBtn.text = "NEW";
            newBtn.y = c.height / 2 - textSize / 2
            newBtn.size = textSize * 1.5
            newBtn.bold = true;
            newBtn.onClick = function() {
                startAction();
            }
            newBtn.show();

            var optionsBtn = new Element();
            optionsBtn.text = "OPTIONS";
            optionsBtn.y = c.height - 30;
            optionsBtn.onClick = function() {
                switchScreen(game.screens.options);
            }
            optionsBtn.show();

            var joinBtn = new Element();
            joinBtn.text = "JOIN";
            joinBtn.y = c.height / 2 + textSize;
            joinBtn.onClick = function() {
                if (navigator.onLine) {
                    switchScreen(game.screens.join);
                    searchForLobbies();
                    lobbySearchInterval = setInterval(searchForLobbies, 1000);
                }
                else {
                    alert("No Internet Connection. Cannot search for online lobbies")
                }
            }
            joinBtn.show();

            break;
        case game.screens.join:
            var joinText = new Element();
            joinText.size = textSize * 1.5;
            joinText.text = "JOIN GAME";
            joinText.y = 30 + textSize;
            joinText.bold = true;
            joinText.show();

            var searchingText = new Element();
            var gamesAvailableCt;
            try {
                gamesAvailableCt = game.availableLobbies[0].length + game.availableLobbies[1].length + game.availableLobbies[2].length
            }
            catch (e) {}
            searchingText.static = false;
            if (gamesAvailableCt == 0 || gamesAvailableCt == null) {
                searchingText.text = "Searching...";
            }
            else {
                searchingText.text = gamesAvailableCt + ((gamesAvailableCt == 1) ? " game" : " games") + " available"
            }

            searchingText.size = textSize * .8
            searchingText.y = 30 + textSize * 2;
            searchingText.show();

            for (i = 0; i < game.availableLobbies.length; i++) {
                if (game.availableLobbies[i].length != 0) {
                    var fractText = new Element();
                    fractText.size = textSize * 1.2
                    fractText.text = i + 1;
                    fractText.y = textSize * 3.5 + 30;
                    fractText.x = c.width / 2 + (i - 1) * c.width / 6;
                    fractText.bold = true;
                    fractText.show();
                }

                for (var z = 0; z < game.availableLobbies[i].length; z++) {
                    var lobby = new Element();
                    lobby.text = "#" + game.availableLobbies[i][z];
                    lobby.y = 30 + textSize * 3 + textSize * (z + 2);
                    lobby.x = c.width / 2 + (i - 1) * c.width / 6;
                    lobby.var = game.availableLobbies[i][z]
                    lobby.onClick = function() {
                        game.singleplayer = false;
                        game.placeAnywhere = false;
                        game.singleMarker = 0;

                        joinLobby(lobby.var);
                    }
                    lobby.show();
                }
            }

            var randomBtn = new Element();
            randomBtn.bold = true;
            randomBtn.text = "(JOIN RANDOM)";
            randomBtn.y = c.height - textSize * 1.5 - 30;
            randomBtn.size = textSize
            randomBtn.onClick = function() {
                if (gamesAvailableCt > 0) {
                    var randomFractal = Math.floor(Math.random() * (2 - 0 + 1)) + 0;
                    while (game.availableLobbies[randomFractal].length == 0) {
                        randomFractal = Math.floor(Math.random() * (2 - 0 + 1)) + 0;
                    }
                    game.singleplayer = false;
                    game.placeAnywhere = false;
                    game.singleMarker = 0;
                    joinLobby(game.availableLobbies[randomFractal][0]); // TODO RANDOM FRACTALS
                }
            }
            randomBtn.show();

            var cancelBtn = new Element();
            cancelBtn.text = "CANCEL";
            cancelBtn.y = c.height - 30;
            cancelBtn.onClick = function() {
                switchScreen(game.screens.start);
                clearInterval(lobbySearchInterval);
            }
            cancelBtn.show();


            break;
        case game.screens.options:
            var optionsTxt = new Element();
            optionsTxt.text = "OPTIONS";
            optionsTxt.size = textSize * 1.5;
            optionsTxt.y = textSize + 30;
            optionsTxt.bold = true;
            optionsTxt.show();

            var graphicsOption = new Element();
            graphicsOption.text = "Graphics: " + ((game.singleRendering) ? "PERFORMANCE" : "QUALITY");
            graphicsOption.size = textSize * .8
            graphicsOption.y = c.height / 2 - textSize * 4;
            graphicsOption.onClick = function() {

                if (game.singleRendering) {
                    game.singleRendering = false;
                    game.gradient = true;
                    game.reduceMotion = false;
                }
                else {
                    game.singleRendering = true;
                    game.gradient = false;
                    game.reduceMotion = true;
                }
                overwriteFPSsaver = true;
            }
            graphicsOption.show();


            var reduceMotionOption = new Element();
            reduceMotionOption.text = "Reduce Motion: " + ((game.reduceMotion) ? "ON" : "OFF");
            reduceMotionOption.size = textSize * .8
            reduceMotionOption.y = c.height / 2 - textSize * 3;
            reduceMotionOption.color = ((game.singleRendering) ? "red" : "")
            reduceMotionOption.onClick = function() {
                game.reduceMotion = !game.reduceMotion
            }
            reduceMotionOption.show();

            var gradientOption = new Element();
            gradientOption.text = "Gradient: " + ((game.gradient) ? "ON" : "OFF");
            gradientOption.size = textSize * .8
            gradientOption.y = c.height / 2 - textSize * 2
            gradientOption.color = ((game.singleRendering) ? "red" : "")
            gradientOption.onClick = function() {
                game.gradient = !game.gradient
            }
            gradientOption.show();


            var singleplayerOption = new Element();
            singleplayerOption.text = "Singleplayer: " + (game.singleplayer ? "ON" : "OFF");
            singleplayerOption.y = c.height / 2 - textSize;
            singleplayerOption.size = textSize * .8
            singleplayerOption.color = navigator.onLine ? "" : "red";
            singleplayerOption.onClick = function() {
                if (game.singleplayer) {
                    if (navigator.onLine) {
                        game.singleplayer = false;
                        game.placeAnywhere = false;
                        game.singleMarker = 0;
                    }
                }
                else {
                    game.singleplayer = true;
                }
            }
            singleplayerOption.show();

            var styleBtn = new Element();
            styleBtn.text = "Style: " + ((game.style) ? "MODERN" : "CLASSIC");
            styleBtn.size = textSize * .8;
            styleBtn.onClick = function() {
                game.style = !game.style;
            }
            styleBtn.y = c.height / 2 + textSize;
            styleBtn.show();

            var placeAnyBtn = new Element();
            placeAnyBtn.text = "Place Anywhere: " + (game.placeAnywhere ? "ON" : "OFF");
            placeAnyBtn.size = textSize * .8;
            placeAnyBtn.onClick = function() {
                game.placeAnywhere = !game.placeAnywhere;
                game.singleplayer = true;
            }
            placeAnyBtn.y = c.height / 2 + textSize * 2;
            placeAnyBtn.show();

            var singleMarkerBtn = new Element();
            switch (game.singleMarker) {
                case 0:
                    singleMarkerBtn.text = "Single Marker: OFF";
                    break;
                case 1:
                    singleMarkerBtn.text = "Single Marker: RED";
                    break;
                case 2:
                    singleMarkerBtn.text = "Single Marker: BLUE"
                    break;
            }
            singleMarkerBtn.size = textSize * .8;
            singleMarkerBtn.onClick = function() {

                game.singleMarker++
                    game.singleplayer = true;

                if (game.singleMarker > 2) {
                    game.singleMarker = 0;
                }
            }
            singleMarkerBtn.y = c.height / 2 + textSize * 3;
            singleMarkerBtn.show();

            var fractalBtn = new Element();
            fractalBtn.text = "Fractals: " + gameBoard.fractals;
            fractalBtn.size = textSize * .8;
            fractalBtn.onClick = function() {
                gameBoard.fractals++;
                if (gameBoard.fractals > 3) {
                    gameBoard.fractals = 1;
                }
            }
            fractalBtn.y = c.height / 2;
            fractalBtn.show();


            var fpsBtn = new Element();
            fpsBtn.text = "FPS: " + ((game.targetFPS == 0) ? "AUTO" : game.targetFPS);
            fpsBtn.size = textSize * .8;
            fpsBtn.onClick = function() {
                game.targetFPS += 15;
                if (game.targetFPS > 60) {
                    game.targetFPS = 0;
                }
            }
            fpsBtn.y = c.height / 2 + textSize * 4;
            fpsBtn.show();


            var debugBtn = new Element;
            debugBtn.text = "DEBUG: " + ((game.debug) ? "ON" : "OFF");
            debugBtn.size = textSize * .8;
            debugBtn.onClick = function() {
                game.debug = !game.debug;
            }
            debugBtn.y = c.height / 2 + textSize * 5;
            debugBtn.show();


            var menuBtn = new Element();
            menuBtn.text = "MENU";
            menuBtn.y = c.height - 30;
            menuBtn.onClick = function() {
                switchScreen(game.screens.start);
            }
            menuBtn.show();

            break;
        case game.screens.game:


            ctx.globalAlpha = 1;

            timers.playingRuntime.ms = date.getTime() - timers.playingRuntime.original;
            if (game.singleplayer) {
                gameBoard.isPaused = false;
                gameBoard.number = "SP";
            }
            if (!game.reduceMotion) {
                timers.highlightRuntime.ms = date.getTime() - timers.highlightRuntime.original;
            }


            if (!gameBoard.isPaused) {
                var smallHighlighter = [];
                for (var i = 0; i < bigBox.boxCoords.x.length; i++) {
                    if (mouseX > bigBox.boxCoords.x[i]) {
                        smallHighlighter[0] = bigBox.boxCoords.x[i];
                    }
                }
                for (var i = 0; i < bigBox.boxCoords.y.length; i++) {
                    if (mouseY > bigBox.boxCoords.y[i]) {
                        smallHighlighter[1] = bigBox.boxCoords.y[i];
                    }
                }
                draw.rectangle(smallHighlighter[0], smallHighlighter[1], bigBox.smallBoxLength, bigBox.smallBoxLength, bigBox.linethiccness / (3 * (gameBoard.fractals - 1)), false, gameBoard.isXTurn ? game.Xcolor : game.Ocolor)
            }


            //^^ Draws 3 vertical rectangles and 3 horizontal rectangles, to create 9 more boxes within each of the 9 big quadrants
            //********************************************

            for (var i = 0; i < gameBoard.Xes.length; i++) {
                draw.marker(bigBox.boxCoords.x[gameBoard.Xes[i][0]], bigBox.boxCoords.y[gameBoard.Xes[i][1]], 1);
            }
            for (var i = 0; i < gameBoard.Os.length; i++) {
                draw.marker(bigBox.boxCoords.x[gameBoard.Os[i][0]], bigBox.boxCoords.y[gameBoard.Os[i][1]], 0);
            }
            //^^ Draws all gameBoard.Xes and gameBoard.Os to screen by looping through the arrays that contain their coordinates
            // and calls the specific function to draw a marker at those coordinates

            draw.fractal3(gameBoard.isPaused ? (game.singleRendering ? "lightgray" : "black") : "black");

            if (gameBoard.fractals == 3) {
                drawWinningMarkers();
            }

            draw.fractal2(gameBoard.isPaused ? (game.singleRendering ? "lightgray" : "black") : "black");

            if (gameBoard.fractals == 2) {
                drawWinningMarkers();
            }

            draw.fractal1(gameBoard.isPaused ? (game.singleRendering ? "lightgray" : "black") : "black");

            if (gameBoard.fractals == 1) {
                drawWinningMarkers();
            }

            draw.outline(gameBoard.isPaused ? (game.singleRendering ? "lightgray" : "black") : "black");

            draw.rectangle(bigBox.boxCoords.x[gameBoard.highlighter[0]], bigBox.boxCoords.y[gameBoard.highlighter[1]], bigBox.smallBoxLength * 3 + 2 * (bigBox.linethiccness / (3 * gameBoard.fractals)), bigBox.smallBoxLength * 3 + 2 * (bigBox.linethiccness / (3 * gameBoard.fractals)), bigBox.linethiccness / (3 * (gameBoard.fractals - 1)), true);

            draw.hud();

            if (game.debug) {
                for (var i = 0; i < bigBox.boxCoords.x.length; i++) {
                    for (var j = 0; j < bigBox.boxCoords.y.length; j++) {
                        draw.rectangle(bigBox.boxCoords.x[i], bigBox.boxCoords.y[j], 1, 1, 2, false, "red");
                    }
                }
            }

            break;
    }

    if (timers.playingRuntime.endOfLoop != null) {
        //console.log(timers.playingRuntime.endOfLoop)
        avgFps.push(game.actualFPS);
    }

    if (game.actualFPS < 13) {
        reduceMotionCt++;
    }
    if (reduceMotionCt > 3 && !overwriteFPSsaver && timers.gameRuntime.ms < 3000) {
        if (!game.singleRendering) {
            console.log("Low FPS. Switching to performance mode")
            refresh();
            game.singleRendering = true;
        }
    }

    if (game.debug) {
        var debugTxt = new Element()
        debugTxt.size = textSize / 3.5;
        debugTxt.textAlign = "left"
        debugTxt.y = 5 + debugTxt.size;
        debugTxt.x = 5;
        debugTxt.color = "red"
        debugTxt.static = false;
        debugTxt.text = "FPS:" + game.actualFPS + " || avg: " + Math.round(sum / avgFps.length) + " || " + "Pointer: (" + Math.round(mouseX) + ", " + Math.round(mouseY) + ")" + " || " + "isTouch: " + isTouch + "\n" + "player: " + gameBoard.player + " || " + "isXturn: " + gameBoard.isXTurn + " || " + "pendingReset: " + gameBoard.pendingReset + "\n" + "isPaused: " + gameBoard.isPaused + " || " + "style: " + game.style;
        debugTxt.show();
    }


    timers.playingRuntime.endOfLoop = date.getTime();

    if (game.targetFPS == 0) {
        window.requestAnimationFrame(gameLoop)
    }
    else {
        setTimeout(gameLoop, 1000 / game.targetFPS);
    }
}

draw.all = function(color = "black") {
    draw.outline(color);
    draw.fractal1(color);
    draw.fractal2(color);
    draw.fractal3(color);
}

draw.outline = function(color = "black") {
    draw.rectangle(bigBox.x + bigBox.linethiccness / 2, bigBox.y + bigBox.linethiccness / 2, bigBox.width - bigBox.linethiccness, bigBox.height - bigBox.linethiccness, bigBox.linethiccness, false, color)

}
draw.fractal1 = function(color = "black") {
    draw.rectangle(bigBox.x + bigBox.width / (234 / 79.5), bigBox.y + bigBox.linethiccness / 2, bigBox.width / (234 / 75), bigBox.height - bigBox.linethiccness, bigBox.linethiccness, false, color);
    draw.rectangle(bigBox.x + bigBox.linethiccness / 2, bigBox.y + bigBox.width / (234 / 79.5), bigBox.width - bigBox.linethiccness, bigBox.height / (234 / 75), bigBox.linethiccness, false, color)

}
draw.fractal2 = function(color = "black") {
    if (gameBoard.fractals != 1) {
        for (var i = 0; i < 3; i++) {
            draw.rectangle(bigBox.x + (bigBox.width / (234 / (30.5 + (i * 75)))), bigBox.y + (bigBox.height / (234 / 7.5)), bigBox.width / (234 / 23), bigBox.height / (234 / 219), bigBox.linethiccness / 3, false, color)
            draw.rectangle(bigBox.x + (bigBox.width / (234 / 7.5)), bigBox.y + (bigBox.height / (234 / (30.5 + (i * 75)))), bigBox.width / (234 / 219), bigBox.height / (234 / 23), bigBox.linethiccness / 3, false, color)
            //^^^   Draws all lines with 1/3rd bigBox.linethiccness using box
        }
    }
}
draw.fractal3 = function(color = "black") {
    if (gameBoard.fractals == 3) {
        for (var i = 0; i < 3; i++) {

            for (var j = 0; j < 3; j++) {
                draw.rectangle(bigBox.x + (bigBox.width / (234 / (15.5 + (i * 75) + (j * 23)))), bigBox.y + (bigBox.height / (234 / 8.5)), bigBox.width / (234 / 7), bigBox.height / (234 / 217), bigBox.linethiccness / 9, false, color)
                draw.rectangle(bigBox.x + (bigBox.width / (234 / 8.5)), bigBox.y + (bigBox.height / (234 / (15.5 + (i * 75) + (j * 23)))), bigBox.width / (234 / 217), bigBox.height / (234 / 7), bigBox.linethiccness / 9, false, color)
                //^^^   Draws all lines with 1/9th bigBox.linethiccness using boxes
            }
        }
    }
}

function drawWinningMarkers() {
    for (var i = 0; i < gameBoard.blocksWon.length; i++) {
        if (gameBoard.blocksWon[i][0] === "X") {
            draw.marker(bigBox.boxCoords.x[gameBoard.blocksWon[i][1]], bigBox.boxCoords.y[gameBoard.blocksWon[i][2]], 1, 2);
        }
        else {
            draw.marker(game.style ? bigBox.boxCoords.x[gameBoard.blocksWon[i][1]] : bigBox.boxCoords.x[gameBoard.blocksWon[i][1] + 1], game.style ? bigBox.boxCoords.y[gameBoard.blocksWon[i][2]] : bigBox.boxCoords.y[gameBoard.blocksWon[i][2] + 1], 0, 2);
        }
    }
}


draw.hud = function() {
    if (game.currentScreen == game.screens.game) {
        ctx.globalAlpha = 1;
        ctx.filter = "blur(0px)";

        var menuBtn = new Element();
        menuBtn.text = "MENU";
        menuBtn.y = c.height - 30;
        menuBtn.onClick = function() {
            menuAction();
        }
        menuBtn.show();

        if (gameBoard.pendingReset) {
            ctx.fillStyle = "#f80713"
        }
        else {
            ctx.fillStyle = "black"
        }

        if (gameBoard.isPaused) {

            //nResize(2);
            var pausedTxt = new Element();
            pausedTxt.size = textSize * 1.2;
            pausedTxt.text = "PAUSED";
            pausedTxt.y = textSize + 30;
            pausedTxt.bold = true;
            pausedTxt.show();

            var waitingTxt = new Element();
            waitingTxt.size = textSize * .8;
            waitingTxt.text = "..waiting for opponent..";
            waitingTxt.y = textSize * 2 + 30;
            waitingTxt.bold = true;
            waitingTxt.show();



            var gameNumberTxt = new Element();
            gameNumberTxt.y = c.height / 2
            gameNumberTxt.size = textSize * 2;
            gameNumberTxt.text = "#" + gameBoard.number;
            gameNumberTxt.bold = true;
            gameNumberTxt.show();


            timers.waitingRuntime.ms = date.getTime() - timers.waitingRuntime.original;
            var waitingTimeTxt = new Element();
            waitingTimeTxt.size = textSize * .65;
            waitingTimeTxt.text = (timers.waitingRuntime.ms / 1000).toFixed(1) + "s"
            waitingTimeTxt.y = textSize * 3 + 30;
            waitingTimeTxt.static = false;
            waitingTimeTxt.show();
            ctx.font = "bold " + textSize * .6 + "px Arial";


            if (!game.singleRendering) {
                ctx.filter = 'blur(' + bigBox.sidelength / 25 + 'px)';
            }

        }
        else {
            ctx.filter = '';

            var resetBtn = new Element();
            resetBtn.text = "RESET";
            resetBtn.y = textSize / 2 + 30;
            resetBtn.onClick = function() {
                resetAction();
                gameBoard.isPaused = false;
            }
            resetBtn.show();

            var gameNumberTxt = new Element();
            gameNumberTxt.y = (c.width / c.height > .8) ? (textSize / 2 + 30) : (textSize * 1.5 + 30)
            gameNumberTxt.text = "#" + gameBoard.number;
            gameNumberTxt.bold = true;
            gameNumberTxt.show();

            if (notYourTurn) {
                var notYourTurnTxt = new Element();
                notYourTurnTxt.y = c.height / 2;
                notYourTurnTxt.text = "WAIT YOUR TURN";
                notYourTurnTxt.bold = true;
                notYourTurnTxt.show();

                timers.notYourTurnRuntime.ms = date.getTime() - timers.notYourTurnRuntime.original;
                if (!game.singleRendering) {
                    ctx.filter = 'blur(' + Math.sin(timers.notYourTurnRuntime.ms / 150.0) * 15 + 'px)';
                }

                if (Math.sin(timers.notYourTurnRuntime.ms / 150.0) * 15 < 0) {
                    notYourTurn = false;
                }
            }

            else {
                timers.notYourTurnRuntime.original = date.getTime();
            }
        }
        ctx.fillStyle = "black"
    }


}

draw.marker = function(x, y, type, size = 1) {

    var id = "" + x + y + type + size;

    if (alreadyRendered.indexOf(id) == -1) {
        var length;
        switch (size) {
            case 1:
                length = calculateBoxLength(gameBoard.fractals)
                break;
            case 2:
                length = (gameBoard.fractals > 1) ? (calculateBoxLength(gameBoard.fractals - 1)) : (bigBox.width / (234 / 217));
                break;
        }

        if (type) {
            if (game.style) {
                ctx.beginPath();
                ctx.fillStyle = game.Xcolor;
                ctx.strokeStyle = game.Xcolor;

                ctx.rect(x, y, length, length);
                ctx.fill();
                ctx.closePath();
            }
            else {
                ctx.beginPath();
                ctx.moveTo(x + bigBox.markerPadding, y + bigBox.markerPadding);
                ctx.strokeStyle = game.Xcolor;
                ctx.lineWidth = (bigBox.linethiccness / (gameBoard.fractals)) * size;
                ctx.lineTo((x + length - bigBox.markerPadding), y + length - bigBox.markerPadding);
                ctx.stroke()
                ctx.closePath();

                ctx.beginPath();
                ctx.moveTo((x + bigBox.markerPadding), y + length - bigBox.markerPadding);
                ctx.lineTo((x + length - bigBox.markerPadding), y + bigBox.markerPadding);
                ctx.stroke();
                ctx.closePath();
            }

        }
        else {
            if (game.style) {
                ctx.beginPath();
                ctx.fillStyle = game.Ocolor;
                ctx.strokeStyle = game.Ocolor;

                ctx.rect(x, y, length, length);
                ctx.fill();

                ctx.closePath();
            }
            else {
                ctx.beginPath();
                ctx.strokeStyle = game.Ocolor;
                ctx.lineWidth = (bigBox.linethiccness / (gameBoard.fractals)) * size;
                ctx.arc(x + ((size != 1) ? length / 7 : (length / 2)), y + ((size != 1) ? length / 7 : (length / 2)), length / 2 - (size * bigBox.markerPadding), 0, 2 * Math.PI);
                ctx.stroke();
                ctx.closePath();
            }
        }


        if (game.singleRendering) {
            alreadyRendered.push(id);
        }
    }
}


draw.rectangle = function(x, y, wid, hei, size = bigBox.linethiccness, isHighlighter = false, color = "black") {

    var id = "" + x + y + wid + hei + size + color;
    //console.log(id);
    if (alreadyRendered.indexOf(id) == -1) {
        ctx.beginPath();
        if (isHighlighter) {
            if (!game.reduceMotion) {
                ctx.globalAlpha = (Math.sin(timers.highlightRuntime.ms / 120) + 1) / 2;
            }
            if (gameBoard.isXTurn) {
                ctx.strokeStyle = game.Xcolor;
            }
            else {
                ctx.strokeStyle = game.Ocolor;
            }
        }
        else {
            ctx.strokeStyle = color;
        }

        ctx.rect(x, y, wid, hei);
        ctx.lineWidth = size;
        ctx.stroke();
        ctx.closePath();

        if (game.singleRendering) {
            alreadyRendered.push(id);
        }
    }
}

function onClick(evt = 0) {
    var clickedX = (evt == 0) ? mouseX : evt.clientX; // saves the X coordinate of where you clicked in a variable
    var clickedY = (evt == 0) ? mouseY : evt.clientY; // saves the Y coordinate of where you clicked in a variable

    console.log("onClick: Clicked at (" + clickedX + ", " + clickedY + ")");

    reduceMotionCt = 0;

    for (var i = 0; i < elements.length; i++) {
        var currentbtn = Object.entries(elements[i]);
        currentbtn = elements[i];
        if (clickedX > currentbtn.x - currentbtn.size / 3 * currentbtn.text.length && clickedX < currentbtn.x + currentbtn.size / 3 * currentbtn.text.length && clickedY > currentbtn.y - currentbtn.size && clickedY < currentbtn.y) {
            console.log("onClick: Clicked btn " + elements[i].text);
            alreadyRendered = []

            elements[i].onClick();
            if (game.singleRendering) {
                refresh();
            }

            return;
        }
    }


    if (!gameBoard.isPaused && clickedX > bigBox.x + bigBox.linethiccness && clickedX < c.width - bigBox.x - bigBox.linethiccness && clickedY > bigBox.y + bigBox.linethiccness && clickedY < c.height - bigBox.y - bigBox.linethiccness) {
        // ^^ IF statement checks if you are clicking within the play area, and ignores clicks outside of the black lines// saves the X coordinate of where you clicked in a variable

        if ((gameBoard.isXTurn && gameBoard.player == "X") || (!gameBoard.isXTurn && gameBoard.player == "O") || game.singleplayer) {
            var newMarker = [0, 0] // contains indices for the position of the marker. [8,8] is bottom right. [0,0] is top left
            // The values [0, 0] are just set as a default. They should be changed down below to what the actual values should be

            for (var y = 0; y < blockCount; y++) {

                if (clickedX >= bigBox.boxCoords.x[y]) {
                    newMarker[0] = y;
                }
            }

            for (var z = 0; z < blockCount; z++) {
                if (clickedY >= bigBox.boxCoords.y[z]) {
                    newMarker[1] = z;
                }
            }

            var alreadyExists = false; // Used to detect whether a marker already exists for a position. By default it's set to "false"
            // A series of checks is run to determine if there is already a marker, and the value is set to "true" if so.

            for (var i = 0; i < gameBoard.Xes.length; i++) {
                if (gameBoard.Xes[i][0] === newMarker[0] && gameBoard.Xes[i][1] === newMarker[1]) {
                    alreadyExists = true;
                }
            }
            for (var i = 0; i < gameBoard.Os.length; i++) {
                if (gameBoard.Os[i][0] === newMarker[0] && gameBoard.Os[i][1] === newMarker[1]) {
                    alreadyExists = true;
                }
            }
            for (i = 0; i < gameBoard.blocksWon.length; i++) {
                if (newMarker[0] < gameBoard.blocksWon[i][1] || newMarker[0] > gameBoard.blocksWon[i][1] + 2 || newMarker[1] < gameBoard.blocksWon[i][2] || newMarker[1] > gameBoard.blocksWon[i][2] + 2) {}
                else {
                    alreadyExists = true;
                }
            }
            // ^^ Check whether the marker exists. This is done by looping through all the gameBoard.Xes and gameBoard.Os, getting their [X,Y] coordinates,
            // and determining if the newMarker has the same exact coordinates


            var condensedMarker = condenseMarker(newMarker);
            var offsetCondensed = condenseMarker([condensedMarker.xOffset, condensedMarker.yOffset]);
            console.log(condensedMarker);
            console.log(offsetCondensed);
            var condensedLastMarker = condenseMarker(gameBoard.lastMove);
            console.log(condensedLastMarker);
            var offsetLastMarkerCondensed = condenseMarker([condensedLastMarker.xOffset, condensedLastMarker.yOffset]);
            console.log(offsetLastMarkerCondensed);
            if (!alreadyExists && !game.placeAnywhere && gameBoard.fractals > 1) {
                if ((condensedLastMarker.x === condensedMarker.xOffset && condensedLastMarker.y === condensedMarker.yOffset && gameBoard.fractals == 2) || (offsetLastMarkerCondensed.xOffset == offsetCondensed.xOffset && offsetLastMarkerCondensed.yOffset == offsetCondensed.yOffset && offsetCondensed.x == condensedLastMarker.x && offsetCondensed.y == condensedLastMarker.y) || gameBoard.lastMove == 0) {
                    //gameBoard.lastMove = [condensedMarker.x, condensedMarker.y];
                    gameBoard.lastMove = [newMarker[0], newMarker[1]];
                    gameBoard.highlighter = [condensedMarker.x * 3 + ((gameBoard.fractals == 3) ? (9 * offsetCondensed.xOffset) : 0), condensedMarker.y * 3 + ((gameBoard.fractals == 3) ? (9 * offsetCondensed.yOffset) : 0)];
                    timers.highlightRuntime.original = date.getTime();
                }
                else {
                    alreadyExists = true;
                }
            }


            if (gameBoard.isXTurn) { //  means IF gameBoard.isXTurn === true
                if (!alreadyExists && bigBox.boxCoords.x[newMarker[0]] != 0 && bigBox.boxCoords.y[newMarker[1]] != 0) {
                    if (gameBoard.player == "X" || game.singleplayer) {
                        gameBoard.Xes.push(newMarker); // adds the new marker to the gameBoard.Xes array, and will get drawn to screen
                    }
                }
            }
            else { // means IF gameBoard.isXTurn === false
                if (!alreadyExists && bigBox.boxCoords.x[newMarker[0]] != 0 && bigBox.boxCoords.y[newMarker[1]] != 0) {
                    if (gameBoard.player == "O" || game.singleplayer) {
                        gameBoard.Os.push(newMarker); // adds the new marker to the gameBoard.Os array, and will get drawn to screen
                    }
                }
            }


            writeDb(gameBoard.Xes, "game/games/" + gameBoard.number + "/board/Xes");
            writeDb(gameBoard.Os, "game/games/" + gameBoard.number + "/board/Os");


            if (!alreadyExists) {
                gameBoard.isXTurn = !gameBoard.isXTurn;
            }
            // The IF ELSE structure makes it so that if an X is placed, the next marker will be an O
            // gameBoard.isXTurn is "true" by default, so if an X is placed it gets set to "false"
            // The next time, an O is placed, and gameBoard.isXTurn gets set back to "true"


            var blockWon = checkBlocksWon(newMarker);
            if (blockWon.length != 0) {
                gameBoard.blocksWon.push(blockWon);
            }


            if (gameBoard.fractals == 2) {
                for (i = 0; i < gameBoard.blocksWon.length; i++) {
                    if (!alreadyExists && gameBoard.blocksWon[i][1] === condensedMarker.x * 3 && gameBoard.blocksWon[i][2] === condensedMarker.y * 3) {
                        gameBoard.lastMove = 0;
                        gameBoard.highlighter = 0;
                    }
                }
            }

            if (gameBoard.fractals > 1) {
                writeDb(gameBoard.highlighter, "game/games/" + gameBoard.number + "/board/highlighter");
            }

            writeDb(gameBoard.lastMove, "game/games/" + gameBoard.number + "/board/lastMove");

            if (game.singleMarker != 0 && !alreadyExists) {
                gameBoard.isXTurn = !gameBoard.isXTurn;
            }

            writeDb(gameBoard.isXTurn, "game/games/" + gameBoard.number + "/board/isXturn");

        }
        else {
            notYourTurn = true;
        }

        if (game.singleRendering) {
            refresh();
        }
    }

}

function condenseMarker(originalMarker) {
    var condensed = {
        x: originalMarker[0] % 3,
        y: originalMarker[1] % 3,
        xOffset: Math.floor(originalMarker[0] / 3),
        yOffset: Math.floor(originalMarker[1] / 3)
    }
    return condensed;
}

function checkBlocksWon(marker) {

    var condensedMarker = condenseMarker(marker);
    var wonMarker = [];
    var middleMarker = [1, 1];
    if (indexOf(gameBoard.isXTurn ? gameBoard.Os : gameBoard.Xes, [middleMarker[0] + 3 * condensedMarker.xOffset, middleMarker[1] + 3 * condensedMarker.yOffset]) != -1 && indexOf(gameBoard.isXTurn ? gameBoard.Os : gameBoard.Xes, [middleMarker[0] + 3 * condensedMarker.xOffset + 1, middleMarker[1] + 3 * condensedMarker.yOffset - 1]) != -1 && indexOf(gameBoard.isXTurn ? gameBoard.Os : gameBoard.Xes, [middleMarker[0] + 3 * condensedMarker.xOffset - 1, middleMarker[1] + 3 * condensedMarker.yOffset + 1]) != -1) {
        console.log("/");
        wonMarker = [gameBoard.isXTurn ? "O" : "X", 3 * condensedMarker.xOffset, 3 * condensedMarker.yOffset];
        //output.push(wonMarker);
    }
    if (indexOf(gameBoard.isXTurn ? gameBoard.Os : gameBoard.Xes, [middleMarker[0] + 3 * condensedMarker.xOffset, middleMarker[1] + 3 * condensedMarker.yOffset]) != -1 && indexOf(gameBoard.isXTurn ? gameBoard.Os : gameBoard.Xes, [middleMarker[0] + 3 * condensedMarker.xOffset - 1, middleMarker[1] + 3 * condensedMarker.yOffset - 1]) != -1 && indexOf(gameBoard.isXTurn ? gameBoard.Os : gameBoard.Xes, [middleMarker[0] + 3 * condensedMarker.xOffset + 1, middleMarker[1] + 3 * condensedMarker.yOffset + 1]) != -1) {
        console.log("\\");
        wonMarker = [gameBoard.isXTurn ? "O" : "X", 3 * condensedMarker.xOffset, 3 * condensedMarker.yOffset];
        //output.push(wonMarker);
    }

    if (condensedMarker.x == 0) {
        if (indexOf(gameBoard.isXTurn ? gameBoard.Os : gameBoard.Xes, [marker[0] + 1, marker[1]]) != -1 && indexOf(gameBoard.isXTurn ? gameBoard.Os : gameBoard.Xes, [marker[0] + 2, marker[1]]) != -1) {
            console.log("-");
            wonMarker = [gameBoard.isXTurn ? "O" : "X", 3 * condensedMarker.xOffset, 3 * condensedMarker.yOffset];
            //output.push(wonMarker);
        }
    }
    if (condensedMarker.x == 2) {
        if (indexOf(gameBoard.isXTurn ? gameBoard.Os : gameBoard.Xes, [marker[0] - 1, marker[1]]) != -1 && indexOf(gameBoard.isXTurn ? gameBoard.Os : gameBoard.Xes, [marker[0] - 2, marker[1]]) != -1) {
            console.log("-");
            wonMarker = [gameBoard.isXTurn ? "O" : "X", 3 * condensedMarker.xOffset, 3 * condensedMarker.yOffset];
            //output.push(wonMarker);
        }
    }

    if (condensedMarker.y == 0) {
        if (indexOf(gameBoard.isXTurn ? gameBoard.Os : gameBoard.Xes, [marker[0], marker[1] + 1]) != -1 && indexOf(gameBoard.isXTurn ? gameBoard.Os : gameBoard.Xes, [marker[0], marker[1] + 2]) != -1) {
            console.log("|");
            wonMarker = [gameBoard.isXTurn ? "O" : "X", 3 * condensedMarker.xOffset, 3 * condensedMarker.yOffset];
            //output.push(wonMarker);
        }
    }
    if (condensedMarker.y == 2) {
        if (indexOf(gameBoard.isXTurn ? gameBoard.Os : gameBoard.Xes, [marker[0], marker[1] - 1]) != -1 && indexOf(gameBoard.isXTurn ? gameBoard.Os : gameBoard.Xes, [marker[0], marker[1] - 2]) != -1) {
            console.log("|");
            wonMarker = [gameBoard.isXTurn ? "O" : "X", 3 * condensedMarker.xOffset, 3 * condensedMarker.yOffset];
            //output.push(wonMarker);
        }
    }
    if (condensedMarker.x == 1) {
        if (indexOf(gameBoard.isXTurn ? gameBoard.Os : gameBoard.Xes, [marker[0] - 1, marker[1]]) != -1 && indexOf(gameBoard.isXTurn ? gameBoard.Os : gameBoard.Xes, [marker[0] + 1, marker[1]]) != -1) {
            console.log("-");
            wonMarker = [gameBoard.isXTurn ? "O" : "X", 3 * condensedMarker.xOffset, 3 * condensedMarker.yOffset];
            //output.push(wonMarker);
        }
    }
    if (condensedMarker.y == 1) {
        if (indexOf(gameBoard.isXTurn ? gameBoard.Os : gameBoard.Xes, [marker[0], marker[1] - 1]) != -1 && indexOf(gameBoard.isXTurn ? gameBoard.Os : gameBoard.Xes, [marker[0], marker[1] + 1]) != -1) {
            console.log("|");
            wonMarker = [gameBoard.isXTurn ? "O" : "X", 3 * condensedMarker.xOffset, 3 * condensedMarker.yOffset];
            //output.push(wonMarker);
        }
    }

    return wonMarker;
}

function onMouseMove(evt) {
    mouseX = evt.clientX; // saves the X coordinate of where you clicked in a variable
    mouseY = evt.clientY; // saves the Y coordinate of where you clicked in a variable
}

function calculateBoxLength(fractals) {
    return bigBox.sidelength / (234 / (7 + ((Math.floor((Math.pow((4 - fractals), 2)) / 4)) * 14) + ((Math.floor((Math.pow((4 - fractals), 2)) / 9)) * 32)))
}

function onResize(factor = 1) {

    c.width = window.innerWidth; //reset the canvas to the new dimensions
    c.height = window.innerHeight; //reset the canvas to the new dimensions
    elements = [];
    alreadyRendered = [];

    my_gradient = ctx.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, (c.width / c.height > 1) ? c.width : c.height);
    my_gradient.addColorStop(0, "white");
    my_gradient.addColorStop(1, "grey");

    if (c.width / c.height > 1) {
        bigBox.sidelength = c.height / 1.2 // if portrait, make bigBox as wide as the screen
    }
    else {
        bigBox.sidelength = c.width / 1.2 // if portrait, make bigBox as wide as the screen
    }
    gameBoard.highlighter = [gameBoard.lastMove[0], gameBoard.lastMove[1], bigBox.sidelength / 3 - bigBox.linethiccness / 1.5, bigBox.sidelength / 3 - bigBox.linethiccness / 1.5, true];

    bigBox.width = bigBox.sidelength; // set the width of the bigBox to equal the length of the side, based on what was set above
    bigBox.height = bigBox.sidelength; // set the height of the bigBox to equal the length of the side, based on what was set above

    bigBox.linethiccness = bigBox.sidelength / (234 / 9);
    bigBox.markerPadding = bigBox.linethiccness / (gameBoard.fractals + 1);

    bigBox.x = c.width / 2 - bigBox.width / 2; // used to center the bigBox horizontally.
    bigBox.y = c.height / 2 - bigBox.width / 2; // used to center the bigBox vertically.

    bigBox.smallBoxLength = calculateBoxLength(gameBoard.fractals)

    bigBox.boxCoords.x = []; // if resized, empty the array, as values have changed and need to be recalculated.
    bigBox.boxCoords.y = []; // if resized, empty the array, as values have changed and need to be recalculated.

    blockCount = Math.pow(3, gameBoard.fractals);
    // Below ... recalculate all the values for where the markers can be placed based on the new bigBox dimensions after resizing the window
    for (var i = 0; i < blockCount; i++) { // there are 9 different boxes
        var posX;
        var posY;

        posX = (bigBox.x + (bigBox.width / (234 / (8.5 + (((i) * (27 * (Math.pow((1 / 3), gameBoard.fractals)))) * 7) + ((Math.floor(((i) * (27 * (Math.pow((1 / 3), gameBoard.fractals)))) / 3)) * 2) + ((Math.floor(((i) * (27 * (Math.pow((1 / 3), gameBoard.fractals)))) / 9)) * 6)))))
        posY = (bigBox.y + (bigBox.width / (234 / (8.5 + (((i) * (27 * (Math.pow((1 / 3), gameBoard.fractals)))) * 7) + ((Math.floor(((i) * (27 * (Math.pow((1 / 3), gameBoard.fractals)))) / 3)) * 2) + ((Math.floor(((i) * (27 * (Math.pow((1 / 3), gameBoard.fractals)))) / 9)) * 6)))))

        /*
                switch (gameBoard.fractals) {
                    case 1:
                        posX = bigBox.x + bigBox.linethiccness + (i) * bigBox.linethiccness + i * ((bigBox.width - (2 * gameBoard.fractals + 2) * bigBox.linethiccness) / blockCount);
                        posY = bigBox.y + bigBox.linethiccness + (i) * bigBox.linethiccness + i * ((bigBox.width - (2 * gameBoard.fractals + 2) * bigBox.linethiccness) / blockCount);
                        break;
                    case 2:
                        posX = bigBox.x + bigBox.linethiccness + i * (bigBox.linethiccness / 3) - (i % 3) * bigBox.linethiccness / 5 + i * ((bigBox.width - ((blockCount / 3) + 1) * bigBox.linethiccness) / blockCount);
                        posY = bigBox.y + bigBox.linethiccness + i * (bigBox.linethiccness / 3) - (i % 3) * bigBox.linethiccness / 5 + i * ((bigBox.height - ((blockCount / 3) + 1) * bigBox.linethiccness) / blockCount);
                        break;
                    case 3:
                        break;
                }
        */

        /*
        if (i >= 6) {
            posX = bigBox.x + i * (bigBox.width - (4 * bigBox.linethiccness)) / (9) + 3 * bigBox.linethiccness;
            posY = bigBox.y + i * (bigBox.height - (4 * bigBox.linethiccness)) / (9) + 3 * bigBox.linethiccness;
        }
        else if (i >= 3) {
            posX = bigBox.x + i * (bigBox.width - (4 * bigBox.linethiccness)) / (9) + 2 * bigBox.linethiccness;
            posY = bigBox.y + i * (bigBox.height - (4 * bigBox.linethiccness)) / (9) + 2 * bigBox.linethiccness;
        }
        else {
            posX = bigBox.x + i * (bigBox.width - (4 * bigBox.linethiccness)) / (9) + bigBox.linethiccness;
            posY = bigBox.y + i * (bigBox.height - (4 * bigBox.linethiccness)) / (9) + bigBox.linethiccness;
        }
        */
        //^^ Calculating posX and posY. The 2 coordinates basically are the top left corner of the box where the marker should be placed

        bigBox.boxCoords.x.push(posX); //add the calculated value to the end of the array
        bigBox.boxCoords.y.push(posY); //add the calculated value to the end of the array
    }
    if (c.width / c.height < .7) {
        textSize = c.width / 12;
    }
    else {
        textSize = c.height / 20;
    }
}

function setupSync() {
    if (!game.singleplayer) {
        console.log("setupSync: Setting up DB triggers for #" + gameBoard.number);

        pingDbWithPlayerRuntimeInterval = setInterval(pingDbWithPlayerRuntime, game.pingDbWithPlayerRuntimeTime);

        database.dbPlayers = database.main.ref("game/count/" + gameBoard.number + "/1/");
        database.dbPlayers.on('value', function(snapshot) {
            if (game.currentScreen == game.screens.game) {
                console.log(snapshot.val());
                if (snapshot.val() != null) {
                    var array = snapshot.val().filter(n => n);

                    if (array.length == 1) {
                        timers.waitingRuntime.original = date.getTime();
                        timers.playingRuntime.original = date.getTime();
                        gameBoard.isPaused = true;
                    }
                    else if (array.length == 2) {
                        timers.waitingRuntime.original = date.getTime();
                        gameBoard.isPaused = false;
                    }

                }
                else {
                    console.log("No players left. Going to Main Menu")
                    menuAction();
                }
                refresh();
            }
        });


        database.dbReset = database.main.ref("game/games/" + gameBoard.number + "/players/resetCount");
        database.dbReset.on('value', function(snapshot) {
            if (game.currentScreen == game.screens.game) {
                try {
                    if (snapshot.val()["O"] == "Yes" && snapshot.val()["X"] == "Yes" && gameBoard.pendingReset > 0) {
                        resetBoard();
                        writeDb([], "game/games/" + gameBoard.number + "/")
                        return;
                    }
                }
                catch (e) {}

                if (snapshot.val() != null) {
                    gameBoard.pendingReset = 2;
                }
                else {
                    gameBoard.pendingReset = 0;
                }
            }
        });

        database.db = database.main.ref("game/games/" + gameBoard.number + "/board/Os");
        database.db.on('value', function(snapshot) {
            if (game.currentScreen == game.screens.game) {

                if (snapshot.val() != null & gameBoard.Os != snapshot.val()) {
                    gameBoard.Os = snapshot.val();
                    timers.highlightRuntime.original = date.getTime();
                }

            }
        });

        database.db1 = database.main.ref("game/games/" + gameBoard.number + "/board/Xes");
        database.db1.on('value', function(snapshot) {
            if (game.currentScreen == game.screens.game) {

                if (snapshot.val() != null && gameBoard.Xes != snapshot.val()) {
                    gameBoard.Xes = snapshot.val();
                    timers.highlightRuntime.original = date.getTime();
                }

            }
        });

        database.db3 = database.main.ref("game/games/" + gameBoard.number + "/board/highlighter");

        database.db3.on('value', function(snapshot) {
            if (game.currentScreen == game.screens.game) {


                if (snapshot.val() != null && gameBoard.highlighter != snapshot.val()) {
                    gameBoard.highlighter = snapshot.val();
                }

            }
        });


        database.db4 = database.main.ref("game/games/" + gameBoard.number + "/board/isXturn");
        database.db4.on('value', function(snapshot) {
            if (game.currentScreen == game.screens.game) {

                console.log("hereeeee");
                if (snapshot.val() != null && gameBoard.isXTurn != snapshot.val()) {
                    gameBoard.isXTurn = snapshot.val();
                }
                refresh();

            }
        });

        database.db5 = database.main.ref("game/games/" + gameBoard.number + "/board/lastMove");
        database.db5.on('value', function(snapshot) {
            if (game.currentScreen == game.screens.game) {


                if (snapshot.val() != null && gameBoard.lastMove != snapshot.val()) {
                    gameBoard.lastMove = snapshot.val();
                    console.log(gameBoard.lastMove)
                }

            }
        });

        database.db6 = database.main.ref("game/count/" + gameBoard.number + "/2");
        database.db6.on('value', function(snapshot) {
            if (game.currentScreen == game.screens.game) {

                if (snapshot.val() != null && gameBoard.fractals != snapshot.val()) {
                    gameBoard.fractals = snapshot.val();
                    onResize();
                }

            }
        });
    }
}

function unsyncDb() {
    console.log("unsyncDb: Unsyncing DB triggers")
    clearInterval(pingDbWithPlayerRuntimeInterval)
    database.dbPlayers.off();
    database.dbReset.off();
    database.db.off();
    database.db1.off();
    database.db3.off();
    database.db4.off();
    database.db5.off();
    database.db6.off();
}

function updateDb() {
    if (!game.singleplayer) {}
}

function menuAction() {
    console.log("menuAction: Going to Main Menu")

    game.availableLobbies[0] = [];
    game.availableLobbies[1] = [];
    game.availableLobbies[2] = [];

    if (game.currentScreen == game.screens.game) {
        if (!game.singleplayer) {
            unsyncDb();
            database.main.ref("game/count/" + gameBoard.number).once("value").then(function(snapshot) {
                if (snapshot.val() != null) {
                    if (snapshot.val()[1] != null) {
                        var joinedPlayersArr = snapshot.val()[1];

                        if (gameBoard.player == "O") {
                            joinedPlayersArr.splice(joinedPlayersArr.indexOf("O"), 1);
                            writeDb(joinedPlayersArr, "game/count/" + gameBoard.number + "/1/")
                            writeDb([], "game/games/" + gameBoard.number + "/players/Omillis")
                            console.log("menuAction: gameBoard.player O left")
                        }
                        else if (gameBoard.player == "X") {
                            joinedPlayersArr.splice(joinedPlayersArr.indexOf("X"), 1);
                            writeDb(joinedPlayersArr, "game/count/" + gameBoard.number + "/1/")
                            writeDb([], "game/games/" + gameBoard.number + "/players/Xmillis")
                            console.log("menuAction: gameBoard.player X left")
                        }

                        if (joinedPlayersArr.length == 0) {
                            writeDb(gameBoard.number, "game/games/" + gameBoard.number);
                            writeDb(gameBoard.number, "game/count/" + gameBoard.number);
                            console.log("menuAction: No players left. Clearing #" + gameBoard.number + " in DB")
                        }
                    }
                }

                resetBoard();

            });
        }
        else {
            resetBoard();
        }
    }
    switchScreen(game.screens.start);
}

function resetAction() {
    if (game.singleplayer) {
        resetBoard();
    }
    else {
        switch (gameBoard.pendingReset) {
            case 0:
                writeDb("Yes", "game/games/" + gameBoard.number + "/players/resetCount/" + gameBoard.player)
                gameBoard.pendingReset = 1;
                break;
            case 1:
                writeDb([], "game/games/" + gameBoard.number + "/players/resetCount/" + gameBoard.player)
                gameBoard.pendingReset = 0;
                break;
            case 2:
                writeDb("Yes", "game/games/" + gameBoard.number + "/players/resetCount/" + gameBoard.player)
                gameBoard.pendingReset = 2;
                resetBoard();
                break;
        }
    }
}

function resetBoard() {
    console.log("resetBoard: Locally Clearing # " + gameBoard.number);
    gameBoard = {
        player: "",
        fractals: gameBoard.fractals,
        isPaused: true,
        number: gameBoard.number,
        highlighter: [],
        lastMove: [],
        Xes: [], // contains the indices for each X, for example, [0,0] means top left, [8,8] means bottom right
        Os: [], // contains the indices for each X, for example, [0,0] means top left, [8,8] means bottom right
        isXTurn: true, // Used to switch between X and O. X is the starting mark.
        pendingReset: 0,
        blocksWon: []
    }
    if (game.singleMarker == 2) {
        gameBoard.isXTurn = false;
    }
}

function startAction() {
    onResize();
    if (game.singleplayer) {
        gameBoard.number = "SP"
        gameBoard.isPaused = false;
        console.log("startAction: Starting game " + gameBoard.number)

        switch (game.singleMarker) {
            case 0:
                gameBoard.isXTurn = true;
                break;
            case 1:
                gameBoard.isXTurn = true;
                break;
            case 2:
                gameBoard.isXTurn = false;
                break;
        }
        switchScreen(game.screens.game);
    }
    else if (navigator.onLine) {

        try {
            unsyncDb();
        }
        catch (e) {}

        timers.playingRuntime.original = date.getTime();
        database.main.ref("game/count").once("value").then(function(snapshot) {
            console.log("startAction: Starting multiplayer game...")
            if (snapshot.val() == null) {
                writeDb(0, "game/count/0/0");
                writeDb("X", "game/count/0/1/0");
                gameBoard.number = 0;
            }
            else {
                gameBoard.number = parseInt(snapshot.val()[snapshot.val().length - 1]) + 1;
                writeDb(gameBoard.number, "game/count/" + gameBoard.number + "/0")
                writeDb("X", "game/count/" + gameBoard.number + "/1/0");
            }
            gameBoard.player = "X";

            console.log("startAction: Starting game " + gameBoard.number + " as " + gameBoard.player)

            writeDb(gameBoard.fractals, "game/count/" + gameBoard.number + "/2");
            switchScreen(game.screens.game);
            setupSync();

            //updateDb();
        });
    }
    else {
        alert("No Internet Connection. Switch to Single Player mode")
    }
}

function switchScreen(newScreen) {
    if (game.singleRendering) {
        refresh();
    }
    console.log("switchScreen: Switching to " + newScreen);
    game.currentScreen = newScreen;
}

function refresh() {
    console.log("refresh: Clearing and Rerendering Screen");
    elements = []
    alreadyRendered = []
    ctx.clearRect(0, 0, c.width, c.height);
}

function searchForLobbies() {
    if (game.currentScreen == game.screens.join) {

        database.main.ref("game/count").once("value").then(function(snapshot) {
            console.log("searchForLobbies: Searching...")
            game.availableLobbies[0] = [];
            game.availableLobbies[1] = [];
            game.availableLobbies[2] = [];

            if (snapshot.val() != null) {
                for (var i = 0; i < snapshot.val().length; i++) {
                    if (snapshot.val()[i].length > 1) {
                        var array = snapshot.val()[i][1].filter(n => n);
                        if (array.length === 1) {

                            switch (snapshot.val()[i][2]) {
                                case 1:
                                    game.availableLobbies[0].push(i);
                                    break;
                                case 2:
                                    game.availableLobbies[1].push(i);
                                    break;
                                case 3:
                                    game.availableLobbies[2].push(i);
                                    break;
                            }

                        }
                    }
                }
                refresh();
            }

        });

    }
    else {
        clearInterval(lobbySearchInterval);
        console.log("searchForLobbies: Searching Canceled...")
    }
}

function joinLobby(lobbyNumber) {

    database.main.ref("game/count/" + lobbyNumber).once("value").then(function(snapshot) {
        var joinedPlayersArr = snapshot.val()[1].filter(n => n);

        if (joinedPlayersArr.length == 1) {
            console.log("joinLobby: " + lobbyNumber + " has " + joinedPlayersArr[0])

            gameBoard.number = lobbyNumber;
            if (joinedPlayersArr[0] == "X") {
                joinedPlayersArr.push("O");
                gameBoard.player = "O";

            }
            else if (joinedPlayersArr[0] == "O") {
                joinedPlayersArr.push("X");
                gameBoard.player = "X";

            }
            console.log("joinLobby: Joining " + lobbyNumber + " as " + gameBoard.player);
            timers.playingRuntime.original = date.getTime();
            writeDb(joinedPlayersArr, "game/count/" + gameBoard.number + "/1");
            switchScreen(game.screens.game);
            setupSync();
        }
        else {
            console.log("joinLobby: " + lobbyNumber + " already taken. Searching again..")
            // TODO JOIN ANOTHER LOBBY OF SAME FRACTALS
        }
    });
}

var timesArrayX = []
var timesArrayO = []

function cleanupDatabase() {

    if (game.currentScreen != game.screens.game) {
        database.main.ref("game/count").once("value").then(function(snapshot) {
            var countDb = snapshot.val();

            try {
                database.main.ref("game/games/").once("value").then(function(snapshot) {
                    var gameDb = snapshot.val();
                    if (gameDb != null) {
                        for (var xyz = 0; xyz < countDb.length; xyz++) {
                            try {
                                if (countDb[xyz][1].length > 0) {
                                    try {
                                        if (timesArrayX[xyz] == gameDb[xyz].players.Xmillis && timesArrayO[xyz] == gameDb[xyz].players.Omillis) {
                                            writeDb(xyz, "game/games/" + xyz);
                                            writeDb(xyz, "game/count/" + xyz);
                                        }
                                        else {
                                            if (gameDb[xyz].players.Xmillis != null && timesArrayX[xyz] == gameDb[xyz].players.Xmillis) {
                                                writeDb([], "game/count/" + xyz + "/1/" + indexOf(countDb[xyz][1], "X"))
                                            }
                                            if (gameDb[xyz].players.Omillis != null & timesArrayO[xyz] == gameDb[xyz].players.Omillis) {
                                                writeDb([], "game/count/" + xyz + "/1/" + indexOf(countDb[xyz][1], "O"))
                                            }
                                        }

                                        timesArrayX[xyz] = gameDb[xyz].players.Xmillis;
                                        timesArrayO[xyz] = gameDb[xyz].players.Omillis;
                                    }
                                    catch (e) {

                                    }
                                }
                                else {
                                    writeDb(xyz, "game/games/" + xyz);
                                    writeDb(xyz, "game/count/" + xyz);
                                }

                                if (gameDb[xyz] == null) {
                                    writeDb(xyz, "game/games/" + xyz);
                                    writeDb(xyz, "game/count/" + xyz);
                                }
                            }
                            catch (e) {
                                writeDb(xyz, "game/games/" + xyz);
                                writeDb(xyz, "game/count/" + xyz);
                            }
                        }
                    }

                });
            }
            catch (e) {

            }
        });
    }
}

function pingDbWithPlayerRuntime() {
    console.log("pingDbWithPlayerRuntime: Pinging DB with Current gameBoard.player Runtime")
    if (game.currentScreen == game.screens.game && !game.singleplayer) {
        switch (gameBoard.player) {
            case "X":
                writeDb(timers.playingRuntime.ms, "game/games/" + gameBoard.number + "/players/Xmillis");
                break;
            case "O":
                writeDb(timers.playingRuntime.ms, "game/games/" + gameBoard.number + "/players/Omillis");
                break;
        }
    }
}

function writeDb(object, location) {
    if (!game.singleplayer) {
        database.main.ref(location).set(object);
    }
}

function readDb(location) {
    database.main.ref(location).once("value").then(function(snapshot) {
        return snapshot.val();
    })
}

function indexOf(array, item) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].toString() === item.toString()) return i;
    }
    return -1;
}
