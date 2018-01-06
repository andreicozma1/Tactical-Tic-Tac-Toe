var c = document.getElementById("myCanvas"); // GETS THE canvas ELEMENTS FROM HTML AND PUTS IT IN VARIABLE c
c.width = window.innerWidth; // SETS THE CANVAS WIDTH TO THE INNER WIDTH OF THE WINDOW
c.height = window.innerHeight; // SETS THE CANVAS HEIGHT TO THE INNER HEIGHT OF THE WINDOW
var ctx = c.getContext("2d"); // THE CONTEXT OF THE CANVAS IS WHAT WE'LL USE TO DRAW SHAPESct(bigBox.x + linethiccness / 2, bigBox.y + linethiccness / 2, bigBox.width - linethiccness, bigBox.height - linethiccness);


var squarsidelength;
var linethiccness;
var Xpadding;
var bigBox = {
    width: 0,
    height: 0
}

var boxCoordsX = [];
var boxCoordsY = [];

var textSize;

//***************************************************************************************************************************************************************************************************************************************************************************************

function onResize() {

    c.width = window.innerWidth; //reset the canvas to the new dimensions
    c.height = window.innerHeight; //reset the canvas to the new dimensions


    if (c.width / c.height > 1) {
        squarsidelength = c.height / 1.2 //  if landscape, make the bigBox as tall as the screen
    }
    else {
        squarsidelength = c.width / 1.2 // if portrait, make bigBox as wide as the screen
    }

    bigBox.width = squarsidelength; // set the width of the bigBox to equal the length of the side, based on what was set above
    bigBox.height = squarsidelength; // set the height of the bigBox to equal the length of the side, based on what was set above

    linethiccness = squarsidelength / (234 / 9)
    Xpadding = linethiccness / 3;

    bigBox.x = c.width / 2 - bigBox.width / 2; // used to center the bigBox horizontally.
    bigBox.y = c.height / 2 - bigBox.width / 2; // used to center the bigBox vertically.


    boxCoordsX = []; // if resized, empty the array, as values have changed and need to be recalculated.
    boxCoordsY = []; // if resized, empty the array, as values have changed and need to be recalculated.

    //^^^   Resets all playfield values

    //***************************************************************************************************************************************************************************************************************************************************************************************

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



    if (c.width / c.height < .7) {
        textSize = c.width / 10;
    }
    else {
        textSize = c.height / 20;
    }


}

//***************************************************************************************************************************************************************************************************************************************************************************************

var draw = [];
draw.rectangle = function(x, y, wid, hei, lineWidth, isHighlighter = false) {
    ctx.beginPath();
    ctx.rect(x, y, wid, hei);
    ctx.lineWidth = lineWidth;
    ctx.stroke()
    ctx.closePath();
}

//^^^   Creates the draw.rectangle function

//**************************************************************************************************************************************************************************************************************************************************************************************

setup();

function setup() {
    window.onresize = onResize;
    onResize();
    console.log("Setup");
    setInterval(loop, 1);
}

//  This runs the game loop

//****************************************************************************************************************************************************************************************************************************

var i = 18
var j = 18
var fractal = 3
//***************************************************************************************************************************************************************************************************************************************************************************************
ctx.fillStyle = "#00a2e8";
ctx.fillRect((bigBox.x + (bigBox.width / (234 / (8.5 + (((i) * (27 * (Math.pow((1 / 3), fractal)))) * 7) + ((Math.floor(((i) * (27 * (Math.pow((1 / 3), fractal)))) / 3)) * 2) + ((Math.floor(((i) * (27 * (Math.pow((1 / 3), fractal)))) / 9)) * 6))))), (bigBox.y + (bigBox.height / (234 / (8.5 + (((j) * (27 * (Math.pow((1 / 3), fractal)))) * 7) + ((Math.floor(((j) * (27 * (Math.pow((1 / 3), fractal)))) / 3)) * 2) + ((Math.floor(((j) * (27 * (Math.pow((1 / 3), fractal)))) / 9)) * 6))))), bigBox.width / (234 / (7 + ((Math.floor((Math.pow((4 - fractal), 2)) / 4)) * 14) + ((Math.floor((Math.pow((4 - fractal), 2)) / 9)) * 32))), bigBox.height / (234 / (7 + ((Math.floor((Math.pow((4 - fractal), 2)) / 4)) * 14) + ((Math.floor((Math.pow((4 - fractal), 2)) / 9)) * 32))));


function loop() {

    //*************************************************************************************************************************************************************************************************************************************************************************************

    var my_gradient = ctx.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, (c.width / c.height > 1) ? c.width : c.height);
    my_gradient.addColorStop(0, "white");

    my_gradient.addColorStop(1, "grey");

    ctx.fillStyle = my_gradient;
    ctx.fillRect(0, 0, c.width, c.height);

    //^^^   Creates the white to grey background gradient
    var i = 14
    var j = 7
    var fractal = 3
    //***************************************************************************************************************************************************************************************************************************************************************************************
    ctx.fillStyle = "#00a2e8";
    ctx.fillRect((bigBox.x + (bigBox.width / (234 / (8.5 + (((i) * (27 * (Math.pow((1 / 3), fractal)))) * 7) + ((Math.floor(((i) * (27 * (Math.pow((1 / 3), fractal)))) / 3)) * 2) + ((Math.floor(((i) * (27 * (Math.pow((1 / 3), fractal)))) / 9)) * 6))))), (bigBox.y + (bigBox.height / (234 / (8.5 + (((j) * (27 * (Math.pow((1 / 3), fractal)))) * 7) + ((Math.floor(((j) * (27 * (Math.pow((1 / 3), fractal)))) / 3)) * 2) + ((Math.floor(((j) * (27 * (Math.pow((1 / 3), fractal)))) / 9)) * 6))))), bigBox.width / (234 / (7 + ((Math.floor((Math.pow((4 - fractal), 2)) / 4)) * 14) + ((Math.floor((Math.pow((4 - fractal), 2)) / 9)) * 32))), bigBox.height / (234 / (7 + ((Math.floor((Math.pow((4 - fractal), 2)) / 4)) * 14) + ((Math.floor((Math.pow((4 - fractal), 2)) / 9)) * 32))));
    //            ^Center                                   ^(changes the i value relative to fractal 3)
    //ctx.clearRect(0, 0, c.width, c.height);

    //^^^   May be needed at a future point

    //***************************************************************************************************************************************************************************************************************************************************************************************

    draw.rectangle(bigBox.x + linethiccness / 2, bigBox.y + linethiccness / 2, bigBox.width - linethiccness, bigBox.height - linethiccness, linethiccness)
    draw.rectangle(bigBox.x + bigBox.width / (234 / 79.5), bigBox.y + linethiccness / 2, bigBox.width / (234 / 75), bigBox.height - linethiccness, linethiccness);
    draw.rectangle(bigBox.x + linethiccness / 2, bigBox.y + bigBox.width / (234 / 79.5), bigBox.width - linethiccness, bigBox.height / (234 / 75), linethiccness)

    //^^^   Draws all lines with full linethiccness using boxes

    for (var i = 0; i < 3; i++) {
        draw.rectangle(bigBox.x + (bigBox.width / (234 / (30.5 + (i * 75)))), bigBox.y + (bigBox.height / (234 / 7.5)), bigBox.width / (234 / 23), bigBox.height / (234 / 219), linethiccness / 3)
        draw.rectangle(bigBox.x + (bigBox.width / (234 / 7.5)), bigBox.y + (bigBox.height / (234 / (30.5 + (i * 75)))), bigBox.width / (234 / 219), bigBox.height / (234 / 23), linethiccness / 3)

        //^^^   Draws all lines with 1/3rd linethiccness using boxes

        for (var j = 0; j < 3; j++) {
            draw.rectangle(bigBox.x + (bigBox.width / (234 / (15.5 + (i * 75) + (j * 23)))), bigBox.y + (bigBox.height / (234 / 8.5)), bigBox.width / (234 / 7), bigBox.height / (234 / 217), linethiccness / 9)
            draw.rectangle(bigBox.x + (bigBox.width / (234 / 8.5)), bigBox.y + (bigBox.height / (234 / (15.5 + (i * 75) + (j * 23)))), bigBox.width / (234 / 217), bigBox.height / (234 / 7), linethiccness / 9)

            //^^^   Draws all lines with 1/9th linethiccness using boxes

        }

    }

    //^^^   Creates the playfield

    //********************************************************************************************************************************************************************************************************************************************************************************************************

}



//^^^   Game Loop

//*************************************************************************************************************************************************************************************************************************************************************************************************************************
/*

*/
