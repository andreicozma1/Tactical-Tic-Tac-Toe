var c = document.getElementById("myCanvas"); // GETS THE canvas ELEMENTS FROM HTML AND PUTS IT IN VARIABLE c
c.width = window.innerWidth; // SETS THE CANVAS WIDTH TO THE INNER WIDTH OF THE WINDOW
c.height = window.innerHeight; // SETS THE CANVAS HEIGHT TO THE INNER HEIGHT OF THE WINDOW
var ctx = c.getContext("2d"); // THE CONTEXT OF THE CANVAS IS WHAT WE'LL USE TO DRAW SHAPES

var game = {
    hasStarted: false,
}
var bigBox = {
    x: 0,
    y: 0,
    width: squarsidelength,
    height: squarsidelength
};

var database = firebase.database();

var squarsidelength = 100; // Default value. Gets updated based on the width or height of the window
var linethiccness = squarsidelength / (100 / 3);
// TODO: PUT THESE IN bigBox, INSTEAD OF SEPARATE VARIABLES

var boxCoordsX = []; //contains X coordinates for each of the 9 boxes (top left corner of box)
var boxCoordsY = []; //contains Y coordinates for each of the 9 boxes (top left corner of box)

var highlighter = [];
var lastMove = [];
var blocksWon = [];
var Xes = []; // contains the indices for each X, for example, [0,0] means top left, [8,8] means bottom right
var Os = []; // contains the indices for each X, for example, [0,0] means top left, [8,8] means bottom right
var isXTurn = true; // Used to switch between X and O. X is the starting mark.
var Xpadding = linethiccness / 3; // padding used for X and O marks.
var player = 0;

setup();

function setup() {
    window.onresize = onResize; // when resizing, the "resize" function gets called
    document.addEventListener("click", onClick);

    onResize(); // called once in the beginning to set all the dimensions right

    setInterval(gameLoop, 1) // starts the game loop. Repeats the function "gameLoop" every 1ms
    setInterval(sync, 1000);
    setInterval(quitTimeout, 1500);


    /*
      database.ref("game/players/1").once("value").then(function(snapshot) {
            if (snapshot.val() == null) {
                writeDb("X", "game/players/1");
                player = 1;
                console.log("I'm X")
            }
            else {
                writeDb("O", "game/players/2");
                player = 2;
                console.log("I'm O")
            }
        })
    */
}

var highlightRuntime = 0;
var runtime = 0;

var pl1Time;
var pl2Time;

function quitTimeout() {
    if (game.hasStarted) {
        database.ref("game/players/1millis").once("value").then(function(snapshot) {
            if (pl1Time === snapshot.val()) {
                player = 1;
                writeDb("", "game/players/2");
                writeDb("", "game/players/2millis");
                console.log("You are now X!");
            }
            pl1Time = snapshot.val();
        });
    }

}

function sync() {
    if (game.hasStarted) {
        switch (player) {
            case 1:
                writeDb(runtime, "game/players/1millis");
                //console.log("X " + runtime)
                break;

            case 2:
                writeDb(runtime, "game/players/2millis");
                //console.log("O " + runtime)
                break;
        }
    }

}

var textSize = 30;

function drawText() {

    if (!game.hasStarted) {
        ctx.font = "bold " + textSize + "px Comic Sans MS";
        ctx.textAlign = "center";
        ctx.fillText("Start", c.width / 2, c.height / 2);
    }


}

function drawHUD() {

    if (game.hasStarted) {
        ctx.font = "bold " + textSize + "px Comic Sans MS";
        ctx.textAlign = "center";
        ctx.fillText("MENU", c.width / 2, c.height - c.height / 30);
    }
}

function gameLoop() {

    highlightRuntime++;
    runtime++;
    //console.log(runtime);

    ctx.globalAlpha = 1;

    ctx.clearRect(0, 0, c.width, c.height);
    // ^^ Clears canvas every loop, before redrawing
    drawText();

    if (game.hasStarted) {
        drawHUD();
        drawRect(bigBox.x + linethiccness / 2, bigBox.y + linethiccness / 2, bigBox.width - linethiccness, bigBox.height - linethiccness);
        // ^^ Draws the bigBox

        drawRect(bigBox.x + bigBox.width / (300 / 101.5), bigBox.y + linethiccness / 2, bigBox.width / (300 / 97), bigBox.height - linethiccness);
        drawRect(bigBox.x + linethiccness / 2, bigBox.y + bigBox.width / (300 / 101.5), bigBox.width - linethiccness, bigBox.height / (300 / 97));
        // ^^ Draws two rectangles, to create 9 total quadrants within the bigBox

        for (var i = 0; i < 3; i++) {
            drawRect(bigBox.x + bigBox.width / (300 / (227 / 6)) + i * (bigBox.width / (300 / 97)), bigBox.y + bigBox.height / 40, bigBox.width / (300 / (91 / 3)), bigBox.height / (300 / 285), true);
            drawRect(bigBox.x + bigBox.width / 40, bigBox.y + bigBox.height / (300 / (227 / 6)) + i * (bigBox.height / (300 / 97)), bigBox.width / (300 / 285), bigBox.height / (300 / (91 / 3)), true);
        }
        //^^ Draws 3 vertical rectangles and 3 horizontal rectangles, to create 9 more boxes within each of the 9 big quadrants




        for (var i = 0; i < Xes.length; i++) {
            drawX(boxCoordsX[Xes[i][0]], boxCoordsY[Xes[i][1]]);
        }
        for (var i = 0; i < Os.length; i++) {
            drawCircle(boxCoordsX[Os[i][0]], boxCoordsY[Os[i][1]]);
        }
        //^^ Draws all Xes and Os to screen by looping through the arrays that contain their coordinates
        // and calls the specific function to draw a marker at those coordinates

        for (var i = 0; i < blocksWon.length; i++) {

            if (blocksWon[i][0] === "X") {
                drawX(boxCoordsX[blocksWon[i][1]], boxCoordsY[blocksWon[i][2]], 3);
            }
            else {
                drawCircle(boxCoordsX[blocksWon[i][1] + 1], boxCoordsY[blocksWon[i][2] + 1], 3.5);
            }
        }

        drawRect(boxCoordsX[highlighter[0] * 3] - linethiccness / 3, boxCoordsY[highlighter[1] * 3] - linethiccness / 3, squarsidelength / 3 - linethiccness / 1.5, squarsidelength / 3 - linethiccness / 1.5, true, true);

    }
}


function drawX(x, y, size = 1) {
    ctx.beginPath();
    ctx.moveTo(x + Xpadding, y + Xpadding);
    ctx.strokeStyle = "red";
    ctx.lineWidth = linethiccness / 3 * size;
    ctx.lineTo((x + (bigBox.width - (4 * linethiccness)) * size / (9) - Xpadding), y + (bigBox.height - (4 * linethiccness)) * size / (9) - Xpadding);
    ctx.stroke()
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo((x + Xpadding), y + (bigBox.height - (4 * linethiccness)) * size / (9) - Xpadding);

    ctx.lineTo((x + (bigBox.width - (4 * linethiccness)) * size / (9) - Xpadding), y + Xpadding);
    ctx.stroke();
    ctx.closePath();
}

function drawCircle(x, y, size = 1) {
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = linethiccness / 3 * size;
    ctx.arc(x + (bigBox.height - 4 * linethiccness) / 9 / 2, y + (bigBox.height - 4 * linethiccness) / 9 / 2, ((bigBox.width - 4 * linethiccness) / 9 / 2 - Xpadding) * size, 0, 2 * Math.PI);

    ctx.stroke();
    ctx.closePath();
}



function drawRect(x, y, wid, hei, small = false, isHighlighter = false) {
    ctx.beginPath();
    if (isHighlighter) {
        ctx.globalAlpha = (Math.sin(highlightRuntime / 40) + 1) / 2;
        ctx.strokeStyle = "yellow";
    }
    else {
        ctx.strokeStyle = "black";
    }

    ctx.rect(x, y, wid, hei);
    if (!small) {
        ctx.lineWidth = linethiccness;
    }
    else {
        ctx.lineWidth = linethiccness / 3;
    }
    ctx.stroke()
    ctx.closePath();
}


function onClick(evt = 0) {
    var clickedX = evt.clientX; // saves the X coordinate of where you clicked in a variable
    var clickedY = evt.clientY; // saves the Y coordinate of where you clicked in a variable

    if (clickedX > c.width / 2 - 30 && clickedX < c.width / 2 + 30 && clickedY > c.height / 2 - 15 && clickedY < c.height / 2 + 15) {
        game.hasStarted = true;

        console.log("Clicked start");
        return;
    }

    if (clickedX > c.width / 2 - 50 && clickedX < c.width / 2 + 50 && clickedY > c.height - c.height / 30 - 25 && clickedY < c.height - c.height / 30 + 10) {
        console.log("Clicked menu")
        game.hasStarted = false;
        return;
    }

    if (game.hasStarted && clickedX > bigBox.x + linethiccness && clickedX < c.width - bigBox.x - linethiccness && clickedY > bigBox.y + linethiccness && clickedY < c.height - bigBox.y - linethiccness) {
        // ^^ IF statement checks if you are clicking within the play area, and ignores clicks outside of the black lines// saves the X coordinate of where you clicked in a variable

        var newMarker = [0, 0]; // contains indices for the position of the marker. [8,8] is bottom right. [0,0] is top left
        // The values [0, 0] are just set as a default. They should be changed down below to what the actual values should be

        for (var y = 0; y < 9; y++) {
            if (clickedX >= boxCoordsX[y]) {
                newMarker[0] = y;
            }
        }

        for (var z = 0; z < 9; z++) {
            if (clickedY >= boxCoordsY[z]) {
                newMarker[1] = z;
            }
        }


        var alreadyExists = false; // Used to detect whether a marker already exists for a position. By default it's set to "false"
        // A series of checks is run to determine if there is already a marker, and the value is set to "true" if so.

        for (var i = 0; i < Xes.length; i++) {
            if (Xes[i][0] === newMarker[0] && Xes[i][1] === newMarker[1]) {
                alreadyExists = true;
            }
        }
        for (var i = 0; i < Os.length; i++) {
            if (Os[i][0] === newMarker[0] && Os[i][1] === newMarker[1]) {
                alreadyExists = true;
            }
        }
        for (i = 0; i < blocksWon.length; i++) {
            if (newMarker[0] < blocksWon[i][1] || newMarker[0] > blocksWon[i][1] + 2 || newMarker[1] < blocksWon[i][2] || newMarker[1] > blocksWon[i][2] + 2) {}
            else {
                alreadyExists = true;
            }
        }
        // ^^ Check whether the marker exists. This is done by looping through all the Xes and Os, getting their [X,Y] coordinates,
        // and determining if the newMarker has the same exact coordinates


        var condensedMarker = [];
        condensedMarker[0] = newMarker[0];
        condensedMarker[1] = newMarker[1];
        var Xoffset = 0;
        var Yoffset = 0;
        while (condensedMarker[0] > 2) {
            condensedMarker[0] -= 3;
            Xoffset++;
        }
        while (condensedMarker[1] > 2) {
            condensedMarker[1] -= 3;
            Yoffset++;
        }


        if (!alreadyExists) {
            if (Xoffset === lastMove[0] && Yoffset === lastMove[1] || lastMove == 0) {

                lastMove = condensedMarker;
                highlighter = [lastMove[0], lastMove[1]];
                highlightRuntime = 0;
            }
            else {
                alreadyExists = true;
            }
        }


        if (isXTurn) { //  means IF isXTurn === true
            if (!alreadyExists && boxCoordsX[newMarker[0]] != 0 && boxCoordsY[newMarker[1]] != 0) {
                Xes.push(newMarker); // adds the new marker to the Xes array, and will get drawn to screen
                isXTurn = false; // next marker should be an O
            }
        }
        else { // means IF isXTurn === false
            if (!alreadyExists && boxCoordsX[newMarker[0]] != 0 && boxCoordsY[newMarker[1]] != 0) {
                Os.push(newMarker); // adds the new marker to the Os array, and will get drawn to screen
                isXTurn = true; // next marker should be an X
            }
        }
        // The IF ELSE structure makes it so that if an X is placed, the next marker will be an O
        // isXTurn is "true" by default, so if an X is placed it gets set to "false"
        // The next time, an O is placed, and isXTurn gets set back to "true"







        var middleMarker = [1, 1];

        var wonMarker = [];

        if (indexOf(isXTurn ? Os : Xes, [middleMarker[0] + 3 * Xoffset, middleMarker[1] + 3 * Yoffset]) != -1 && indexOf(isXTurn ? Os : Xes, [middleMarker[0] + 3 * Xoffset + 1, middleMarker[1] + 3 * Yoffset - 1]) != -1 && indexOf(isXTurn ? Os : Xes, [middleMarker[0] + 3 * Xoffset - 1, middleMarker[1] + 3 * Yoffset + 1]) != -1) {
            console.log("/");
            wonMarker = [isXTurn ? "O" : "X", 3 * Xoffset, 3 * Yoffset];
            blocksWon.push(wonMarker);
        }
        if (indexOf(isXTurn ? Os : Xes, [middleMarker[0] + 3 * Xoffset, middleMarker[1] + 3 * Yoffset]) != -1 && indexOf(isXTurn ? Os : Xes, [middleMarker[0] + 3 * Xoffset - 1, middleMarker[1] + 3 * Yoffset - 1]) != -1 && indexOf(isXTurn ? Os : Xes, [middleMarker[0] + 3 * Xoffset + 1, middleMarker[1] + 3 * Yoffset + 1]) != -1) {
            console.log("\\");
            wonMarker = [isXTurn ? "O" : "X", 3 * Xoffset, 3 * Yoffset];
            blocksWon.push(wonMarker);
        }


        if (condensedMarker[0] == 0) {
            if (indexOf(isXTurn ? Os : Xes, [newMarker[0] + 1, newMarker[1]]) != -1 && indexOf(isXTurn ? Os : Xes, [newMarker[0] + 2, newMarker[1]]) != -1) {
                console.log("-");
                wonMarker = [isXTurn ? "O" : "X", 3 * Xoffset, 3 * Yoffset];
                blocksWon.push(wonMarker);
            }
        }
        if (condensedMarker[0] == 2) {
            if (indexOf(isXTurn ? Os : Xes, [newMarker[0] - 1, newMarker[1]]) != -1 && indexOf(isXTurn ? Os : Xes, [newMarker[0] - 2, newMarker[1]]) != -1) {
                console.log("-");
                wonMarker = [isXTurn ? "O" : "X", 3 * Xoffset, 3 * Yoffset];
                blocksWon.push(wonMarker);
            }
        }

        if (condensedMarker[1] == 0) {
            if (indexOf(isXTurn ? Os : Xes, [newMarker[0], newMarker[1] + 1]) != -1 && indexOf(isXTurn ? Os : Xes, [newMarker[0], newMarker[1] + 2]) != -1) {
                console.log("|");
                wonMarker = [isXTurn ? "O" : "X", 3 * Xoffset, 3 * Yoffset];
                blocksWon.push(wonMarker);
            }
        }
        if (condensedMarker[1] == 2) {
            if (indexOf(isXTurn ? Os : Xes, [newMarker[0], newMarker[1] - 1]) != -1 && indexOf(isXTurn ? Os : Xes, [newMarker[0], newMarker[1] - 2]) != -1) {
                console.log("|");
                wonMarker = [isXTurn ? "O" : "X", 3 * Xoffset, 3 * Yoffset];
                blocksWon.push(wonMarker);
            }
        }


        for (i = 0; i < blocksWon.length; i++) {
            if (!alreadyExists && blocksWon[i][1] === condensedMarker[0] * 3 && blocksWon[i][2] === condensedMarker[1] * 3) {
                lastMove = 0;
                highlighter = 0;
            }
        }
        updateDb();
    }

}



function onResize() {
    c.width = window.innerWidth; //reset the canvas to the new dimensions
    c.height = window.innerHeight; //reset the canvas to the new dimensions


    if (c.width / c.height > 1) {
        squarsidelength = c.height / 1.2; // if landscape, make the bigBox as tall as the screen
    }
    else {
        squarsidelength = c.width / 1.2; // if portrait, make bigBox as wide as the screen
    }
    highlighter = [lastMove[0], lastMove[1], squarsidelength / 3 - linethiccness / 1.5, squarsidelength / 3 - linethiccness / 1.5, true];

    bigBox.width = squarsidelength; // set the width of the bigBox to equal the length of the side, based on what was set above
    bigBox.height = squarsidelength; // set the height of the bigBox to equal the length of the side, based on what was set above

    linethiccness = squarsidelength / (100 / 3);
    Xpadding = linethiccness / 3;

    bigBox.x = c.width / 2 - bigBox.width / 2; // used to center the bigBox horizontally.
    bigBox.y = c.height / 2 - bigBox.width / 2; // used to center the bigBox vertically.


    boxCoordsX = []; // if resized, empty the array, as values have changed and need to be recalculated.
    boxCoordsY = []; // if resized, empty the array, as values have changed and need to be recalculated.


    // Below ... recalculate all the values for where the markers can be placed based on the new bigBox dimensions after resizing the window
    for (var i = 0; i < 9; i++) { // there are 9 different boxes
        var posX;
        var posY;
        if (i >= 6) {
            posX = bigBox.x + i * (bigBox.width - (4 * linethiccness)) / (9) + 3 * linethiccness;
            posY = bigBox.y + i * (bigBox.height - (4 * linethiccness)) / (9) + 3 * linethiccness;
        }
        else if (i >= 3) {
            posX = bigBox.x + i * (bigBox.width - (4 * linethiccness)) / (9) + 2 * linethiccness;
            posY = bigBox.y + i * (bigBox.height - (4 * linethiccness)) / (9) + 2 * linethiccness;
        }
        else {
            posX = bigBox.x + i * (bigBox.width - (4 * linethiccness)) / (9) + linethiccness;
            posY = bigBox.y + i * (bigBox.height - (4 * linethiccness)) / (9) + linethiccness;
        }
        //^^ Calculating posX and posY. The 2 coordinates basically are the top left corner of the box where the marker should be placed

        boxCoordsX.push(posX); //add the calculated value to the end of the array
        boxCoordsY.push(posY); //add the calculated value to the end of the array
    }


}


function indexOf(array, item) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].toString() === item.toString()) return i;
    }
    return -1;
}



var dbXes = database.ref("game/board/Xes");
var dbOs = database.ref("game/board/Os");
var dbHighlighter = database.ref("game/board/highlighter");
var dbisXTurn = database.ref("game/board/isXturn");
var dbLastMove = database.ref("game/board/lastMove");
var dbBlocksWon = database.ref("game/board/blocksWon");


function updateDb() {
    writeDb(Xes, "game/board/Xes");
    writeDb(Os, "game/board/Os");
    writeDb(highlighter, "game/board/highlighter");
    writeDb(isXTurn, "game/board/isXturn");
    writeDb(lastMove, "game/board/lastMove");
    writeDb(blocksWon, "game/board/blocksWon");
}

dbXes.on('value', function(snapshot) {

    if (game.hasStarted && snapshot.val() != Xes && snapshot.val() != null) {
        Xes = snapshot.val();
        console.log("Updating Xes");
    }
});
dbOs.on('value', function(snapshot) {

    if (game.hasStarted && snapshot.val() != Os && snapshot.val() != null) {
        Os = snapshot.val();
        console.log("Updating Os");
    }
});
dbHighlighter.on('value', function(snapshot) {

    if (game.hasStarted && snapshot.val() != highlighter && snapshot.val() != null) {
        highlighter[0] = snapshot.val()[0];
        highlighter[1] = snapshot.val()[1];
        console.log("Updating highlighter");
    }
});
dbisXTurn.on('value', function(snapshot) {

    if (game.hasStarted && snapshot.val() != isXTurn && snapshot.val() != null) {
        isXTurn = snapshot.val();
        console.log("Updating isXTurn;");
    }
});
dbLastMove.on('value', function(snapshot) {

    if (game.hasStarted && snapshot.val() != lastMove && snapshot.val() != null) {
        lastMove = snapshot.val();
        console.log("Updating lastMove;");
    }
});
dbBlocksWon.on('value', function(snapshot) {

    if (game.hasStarted && snapshot.val() != blocksWon && snapshot.val() != null) {
        blocksWon = snapshot.val();
        console.log("Updating blocksWon;");
    }
});

function writeDb(object, location) {
    database.ref(location).set(object);

}

function readDb(location) {
    database.ref(location).once("value").then(function(snapshot) {
        return snapshot.val();
    })
}
