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


setup();
var my_gradient;

function setup() {
    console.log("setup: Running Setup")
    date = new Date();

    timers.gameRuntime.original = date.getTime();

    window.onresize = onResize; // when resizing, the "resize" function gets called

    onResize(); // called once in the beginning to set all the dimensions right

    switchScreen(game.screens.start);

    window.requestAnimationFrame(gameLoop);
    //setTimeout(gameLoop, 1000 / game.targetFPS) // starts the game loop. Repeats the function "gameLoop"

    if (!game.singleplayer && (game.placeAnywhere != 0 || game.singleMarker)) {
        console.log("Game in DEBUG MODE. Switching to SP")
        game.singleplayer = true;
    }
}


function gameLoop() {
    //setupScreens();
    //console.log(prerenderedId)



    date = new Date();

    timers.gameRuntime.ms = date.getTime() - timers.gameRuntime.original;


    if (game.gradient) {
        ctx.fillStyle = my_gradient;
        ctx.fillRect(0, 0, c.width, c.height);
    }

    ctx.font = ""
    ctx.fillText("No Network Connection");

    draw.all("lightgray");

    switch (game.currentScreen) {
        case game.screens.start:


            break;

    }
    requestAnimationFrame(gameLoop)
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


function condenseMarker(originalMarker) {
    var condensedMarker = {
        x: originalMarker[0] % 3,
        y: originalMarker[1] % 3,
        xOffset: Math.floor(originalMarker[0] / 3),
        yOffset: Math.floor(originalMarker[1] / 3)
    }
    return condensedMarker;
}


function calculateBoxLength(fractals) {
    return bigBox.sidelength / (234 / (7 + ((Math.floor((Math.pow((4 - fractals), 2)) / 4)) * 14) + ((Math.floor((Math.pow((4 - fractals), 2)) / 9)) * 32)))
}

function onResize(factor = 1) {

    c.width = window.innerWidth; //reset the canvas to the new dimensions
    c.height = window.innerHeight; //reset the canvas to the new dimensions

    my_gradient = ctx.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, (c.width / c.height > 1) ? c.width : c.height);
    my_gradient.addColorStop(0, "white");
    my_gradient.addColorStop(1, "grey");

    if (c.width / c.height > 1) {
        bigBox.sidelength = c.height / 1.2 // if portrait, make bigBox as wide as the screen
    }
    else {
        bigBox.sidelength = c.width / 1.2 // if portrait, make bigBox as wide as the screen
    }

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


function switchScreen(newScreen) {
    if (game.singleRendering) {
        refresh();
    }
    console.log("switchScreen: Switching to " + newScreen);
    game.currentScreen = newScreen;
}
