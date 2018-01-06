var c = document.getElementById("myCanvas");
c.width = window.innerWidth;
c.height = window.innerHeight;
var ctx = c.getContext("2d");

var squarsidelength = 100;
var linethiccness = squarsidelength / (100 / 3);

var bigBox = {
    x: 0,
    y: 0,
    width: squarsidelength,
    height: squarsidelength
};

window.onresize = resize;

function resize() {

    c.width = window.innerWidth;
    c.height = window.innerHeight;

    if (c.width / c.height > 1) {
        squarsidelength = c.height / 1;
    }
    else {
        squarsidelength = c.width / 1;
    }

    bigBox.width = squarsidelength;
    bigBox.height = squarsidelength;

    linethiccness = squarsidelength / (100 / 3);
    bigBox.x = c.width / 2 - bigBox.width / 2;
    bigBox.y = c.height / 2 - bigBox.width / 2;
}

resize();

function gameLoop() {
    ctx.clearRect(0, 0, c.width, c.height); // Clears canvas every loop, before redrawing

    makeRect(bigBox.x + linethiccness / 2, bigBox.y + linethiccness / 2, bigBox.width - linethiccness, bigBox.height - linethiccness);

    makeRect(bigBox.x + bigBox.width / (300 / 101.5), bigBox.y + linethiccness / 2, bigBox.width / (300 / 97), bigBox.height - linethiccness);

    makeRect(bigBox.x + linethiccness / 2, bigBox.y + bigBox.width / (300 / 101.5), bigBox.width - linethiccness, bigBox.height / (300 / 97));

    for (var i = 0; i < 3; i++) {
        makeRect(bigBox.x + bigBox.width / (300 / (227 / 6)) + i * (bigBox.width / (300 / 97)), bigBox.y + bigBox.height / 40, bigBox.width / (300 / (91 / 3)), bigBox.height / (300 / 285), true);
        makeRect(bigBox.x + bigBox.width / 40, bigBox.y + bigBox.height / (300 / (227 / 6)) + i * (bigBox.height / (300 / 97)), bigBox.width / (300 / 285), bigBox.height / (300 / (91 / 3)), true);
    }

    for (var i = 0; i < Xes.length; i++) {
        drawX(Xes[i][0], Xes[i][1]);
    }
    for (var i = 0; i < Os.length; i++) {
        makeCircle(Os[i][0], Os[i][1]);
    }
}

setInterval(gameLoop, 1);

function makeCircle(x, y) {
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.arc(x + (bigBox.height - 4 * linethiccness - linethiccness) / 9 / 2 / 1.3, y + (bigBox.height - 4 * linethiccness - linethiccness) / 9 / 2 / 1.3, (bigBox.width - 4 * linethiccness) / 9 / 2 / 1.3, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
}

function makeRect(x, y, wid, hei, small = false) {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.rect(x, y, wid, hei);
    if (!small) {
        ctx.lineWidth = linethiccness;
    }
    else {
        ctx.lineWidth = linethiccness / 3;
    }
    ctx.stroke();
    ctx.closePath();
}



function drawX(x, y) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = "red";
    ctx.lineTo(x + bigBox.width / (9 + Xpadding), y + bigBox.height / (9 + Xpadding));
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(x, y + bigBox.width / (9 + Xpadding));

    ctx.lineTo(x + bigBox.width / (9 + Xpadding), y);
    ctx.stroke();
    ctx.closePath();
}


var Xes = [];

var Os = [];

var Xpadding = 5;

var AA

document.addEventListener("click", function(evt) {
    var clickedX = evt.clientX;
    var clickedY = evt.clientY;
    var tempCharPos = {
        x: '',
        y: '',
        o: false
    };
    if ((bigBox.x + (bigBox.width / 300 / (27 / 3))) < clickedX < (bigBox.x + (bigBox.width / 300 / (109 / 3)))) {
        tempCharPos.x = 'a';
    }
    else if ((bigBox.x + (bigBox.width / 300 / (118 / 3))) < clickedX < (bigBox.x + (bigBox.width / 300 / (200 / 3)))) {
        tempCharPos.x = 'b';
    }
    else if ((bigBox.x + (bigBox.width / 300 / (209 / 3))) < clickedX < (bigBox.x + (bigBox.width / 300 / (291 / 3)))) {
        tempCharPos.x = 'c';
    }
    else if ((bigBox.x + (bigBox.width / 300 / (318 / 3))) < clickedX < (bigBox.x + (bigBox.width / 300 / (400 / 3)))) {
        tempCharPos.x = 'd';
    }
    else if ((bigBox.x + (bigBox.width / 300 / (409 / 3))) < clickedX < (bigBox.x + (bigBox.width / 300 / (491 / 3)))) {
        tempCharPos.x = 'e';
    }
    else if ((bigBox.x + (bigBox.width / 300 / (500 / 3))) < clickedX < (bigBox.x + (bigBox.width / 300 / (582 / 3)))) {
        tempCharPos.x = 'f';
    }
    else if ((bigBox.x + (bigBox.width / 300 / (609 / 3))) < clickedX < (bigBox.x + (bigBox.width / 300 / (691 / 3)))) {
        tempCharPos.x = 'g';
    }
    else if ((bigBox.x + (bigBox.width / 300 / (700 / 3))) < clickedX < (bigBox.x + (bigBox.width / 300 / (782 / 3)))) {
        tempCharPos.x = 'h';
    }
    else if ((bigBox.x + (bigBox.width / 300 / (791 / 3))) < clickedX < (bigBox.x + (bigBox.width / 300 / (873 / 3)))) {
        tempCharPos.x = 'i';
    }
    if ((bigBox.y + (bigBox.height / 300 / (27 / 3))) < clickedY < (bigBox.y + (bigBox.height / 300 / (109 / 3)))) {
        tempCharPos.y = 'a';
    }
    else if ((bigBox.y + (bigBox.height / 300 / (118 / 3))) < clickedY < (bigBox.y + (bigBox.height / 300 / (200 / 3)))) {
        tempCharPos.y = 'b';
    }
    else if ((bigBox.y + (bigBox.height / 300 / (209 / 3))) < clickedY < (bigBox.y + (bigBox.height / 300 / (291 / 3)))) {
        tempCharPos.y = 'c';
    }
    else if ((bigBox.y + (bigBox.height / 300 / (318 / 3))) < clickedY < (bigBox.y + (bigBox.height / 300 / (400 / 3)))) {
        tempCharPos.y = 'd';
    }
    else if ((bigBox.y + (bigBox.height / 300 / (409 / 3))) < clickedY < (bigBox.y + (bigBox.height / 300 / (491 / 3)))) {  /*I need to figure out out to save to the grid, that way if it does resize, it can easily be pulled and re-drawn in the correct spot*/
        tempCharPos.y = 'e';                                                                                                /*Also need to know how to switch from defining x's, to defineing a o's*/
    }                                                                                                                       /*Once everything is saved to be re-drawn, we need to save/convert everything from grid to fractal positioning*/
    else if ((bigBox.y + (bigBox.height / 300 / (500 / 3))) < clickedY < (bigBox.y + (bigBox.height / 300 / (582 / 3)))) {  /*ie: turning ec (collumn e, row c) into bh (box b, square h).. this will help test for 3 in a row*/
        tempCharPos.y = 'f';                                                                                                /*It would also allow us to limit the next turn to a specific box. last turn = x in (collumn b row f) */
    }                                                                                                                       /*= (box d, square h) = test for all 3 in a row possibilities in box d for x's = force nextplayer (o) play in box h*/
    else if ((bigBox.y + (bigBox.height / 300 / (609 / 3))) < clickedY < (bigBox.y + (bigBox.height / 300 / (691 / 3)))) {  /*if box h full, go anywhere*/
        tempCharPos.y = 'g';
    }
    else if ((bigBox.y + (bigBox.height / 300 / (700 / 3))) < clickedY < (bigBox.y + (bigBox.height / 300 / (782 / 3)))) {
        tempCharPos.y = 'h';
    }
    else if ((bigBox.y + (bigBox.height / 300 / (791 / 3))) < clickedY < (bigBox.y + (bigBox.height / 300 / (873 / 3)))) {
        tempCharPos.y = 'i';
    }
    if (tempCharPos == ('a', 'a')) {
        var aa = 'x';
    }
    if (tempCharPos == ('a', 'b')) {
        var ab = 'x';
    }
    if (tempCharPos == ('a', 'c')) {
        var ac = 'x';
    }
    if (tempCharPos == ('a', 'd')) {
        var ad = 'x';
    }
    if (tempCharPos == ('a', 'e')) {
        var ae = 'x';
    }
    if (tempCharPos == ('a', 'f')) {
        var af = 'x';
    }
    if (tempCharPos == ('a', 'g')) {
        var ag = 'x';
    }
    if (tempCharPos == ('a', 'h')) {
        var ah = 'x';
    }
    if (tempCharPos == ('a', 'i')) {
        var ai = 'x';
    }
    if (tempCharPos == ('b', 'a')) {
        var ba = 'x';
    }
    if (tempCharPos == ('b', 'b')) {
        var bb = 'x';
    }
    if (tempCharPos == ('b', 'c')) {
        var bc = 'x';
    }
    if (tempCharPos == ('b', 'd')) {
        var bd = 'x';
    }

})