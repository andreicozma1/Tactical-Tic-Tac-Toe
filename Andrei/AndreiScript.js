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
        squarsidelength = c.height / 1.4;
    }
    else {
        squarsidelength = c.width / 1.4;
    }

    bigBox.width = squarsidelength;
    bigBox.height = squarsidelength;

    linethiccness = squarsidelength / (100 / 3)
    bigBox.x = c.width / 2 - bigBox.width / 2;
    bigBox.y = c.height / 2 - bigBox.width / 2;
}

resize();

function gameLoop() {
    makeRect(bigBox.x + linethiccness / 2, bigBox.y + linethiccness / 2, bigBox.width - linethiccness, bigBox.height - linethiccness);

    makeRect(bigBox.x + bigBox.width / (300 / 101.5), bigBox.y - linethiccness / 2, bigBox.width / 3, bigBox.height + linethiccness);

    makeRect(bigBox.x - linethiccness / 2, bigBox.y + bigBox.width / 3, bigBox.width + linethiccness, bigBox.height / 3);

    for (i = 0; i < 3; i++) {
        makeRect(bigBox.x + bigBox.width / 9 + i * ((bigBox.width / 3) + linethiccness / 3 / 2), bigBox.y - linethiccness / 3 / 2, bigBox.width / 9, bigBox.height + linethiccness / 3, true);
        makeRect(bigBox.x - linethiccness / 3 / 2, bigBox.y + bigBox.height / 9 + i * bigBox.height / 3, bigBox.width + linethiccness / 3, bigBox.height / 9, true);
    }

    for (j = 0; j < 9; j++) {
        drawX(bigBox.x + j * bigBox.width / 9, bigBox.y);
    }
}

setInterval(gameLoop, 1)

function makeCircle(x, y, rad) {
    ctx.beginPath();
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.arc(x, y, rad, 0, 2 * Math.PI);
    ctx.stroke();
    console.log("a");
}

function makeRect(x, y, wid, hei, small = false) {

    ctx.rect(x, y, wid, hei);
    if (!small) {
        ctx.lineWidth = linethiccness;
    }
    else {
        ctx.lineWidth = linethiccness / 3;
    }
    ctx.stroke();
}



function drawX(x, y) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + bigBox.width / (9 + 3), y + bigBox.height / (9 + 3));
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.moveTo(x, y + bigBox.width / (9 + 3));
    ctx.lineTo(x + bigBox.width / (9 + 3), y);
    ctx.stroke();
    ctx.closePath();
}



var Xes = [];

var Os = [];



document.addEventListener("click", function(evt) {
    var clickedX = evt.clientX;
    var clickedY = evt.clientY;

    if (clickedX > bigBox.x && clickedX < c.width - bigBox.x && clickedY > bigBox.y && clickedY < c.height - bigBox.y) {
        console.log(clickedX);
    }

    var boxCoordsX = [];
    var boxCoordsY = [];
    for (i = 0; i < 9; i++) {
        boxCoordsX.push(bigBox.x + i * bigBox.width / 9);
        boxCoordsY.push(bigBox.y + i * bigBox.height / 9);
    }
    
    
    var newX = [0, 0];

    for (y = 0; y < 9; y++) {
        if (clickedX >= boxCoordsX[y]) {
            newX[0] = boxCoordsX[y];
        }
    }

    for (z = 0; z < 9; z++) {
        if (clickedY >= boxCoordsY[z]) {
            newX[1] = boxCoordsY[z];
            console.log(i);
        }
    }
    console.log(newX);

    Xes.push(newX);
})
