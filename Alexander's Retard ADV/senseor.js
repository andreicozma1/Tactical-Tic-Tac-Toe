document.addEventListener("click", function(evt) {
    var clickedX = evt.clientX;
    var clickedY = evt.clientY;
    var tempCharPos = {
        x: '',
        y: ''
    }
    if  ((bigBox.x + (bigBox.width / 300 / (27 / 3))) < clickedX < (bigBox.x + (bigBox.width / 300 / (109 / 3))))  {
        tempCharPos.x = 'a'
    }
    else if  ((bigBox.x + (bigBox.width / 300 / (118 / 3))) < clickedX < (bigBox.x + (bigBox.width / 300 / (200 / 3))))  {
        tempCharPos.x = 'b'
    }
    else if  ((bigBox.x + (bigBox.width / 300 / (209 / 3))) < clickedX < (bigBox.x + (bigBox.width / 300 / (291 / 3))))  {
        tempCharPos.x = 'c'
    }
    else if  ((bigBox.x + (bigBox.width / 300 / (318 / 3))) < clickedX < (bigBox.x + (bigBox.width / 300 / (400 / 3))))  {
        tempCharPos.x = 'd'
    }
    else if  ((bigBox.x + (bigBox.width / 300 / (409 / 3))) < clickedX < (bigBox.x + (bigBox.width / 300 / (491 / 3))))  {
        tempCharPos.x = 'e'
    }
    else if  ((bigBox.x + (bigBox.width / 300 / (500 / 3))) < clickedX < (bigBox.x + (bigBox.width / 300 / (582 / 3))))  {
        tempCharPos.x = 'f'
    }
    else if  ((bigBox.x + (bigBox.width / 300 / (609 / 3))) < clickedX < (bigBox.x + (bigBox.width / 300 / (691 / 3))))  {
        tempCharPos.x = 'g'
    }
    else if  ((bigBox.x + (bigBox.width / 300 / (700 / 3))) < clickedX < (bigBox.x + (bigBox.width / 300 / (782 / 3))))  {
        tempCharPos.x = 'h'
    }
    else if  ((bigBox.x + (bigBox.width / 300 / (791 / 3))) < clickedX < (bigBox.x + (bigBox.width / 300 / (873 / 3))))  {
        tempCharPos.x = 'i'
    }
    if  ((bigBox.y + (bigBox.height / 300 / (27 / 3))) < clickedX < (bigBox.y + (bigBox.height / 300 / (109 / 3))))  {
        tempCharPos.y = 'a'
    }
    else if  ((bigBox.y + (bigBox.height / 300 / (118 / 3))) < clickedX < (bigBox.y + (bigBox.height / 300 / (200 / 3))))  {
        tempCharPos.y = 'b'
    }
    else if  ((bigBox.y + (bigBox.height / 300 / (209 / 3))) < clickedX < (bigBox.y + (bigBox.height / 300 / (291 / 3))))  {
        tempCharPos.y = 'c'
    }
    else if  ((bigBox.y + (bigBox.height / 300 / (318 / 3))) < clickedX < (bigBox.y + (bigBox.height / 300 / (400 / 3))))  {
        tempCharPos.y = 'd'
    }
    else if  ((bigBox.y + (bigBox.height / 300 / (409 / 3))) < clickedX < (bigBox.y + (bigBox.height / 300 / (491 / 3))))  {
        tempCharPos.y = 'e'
    }
    else if  ((bigBox.y + (bigBox.height / 300 / (500 / 3))) < clickedX < (bigBox.y + (bigBox.height / 300 / (582 / 3))))  {
        tempCharPos.y = 'f'
    }
    else if  ((bigBox.y + (bigBox.height / 300 / (609 / 3))) < clickedX < (bigBox.y + (bigBox.height / 300 / (691 / 3))))  {
        tempCharPos.y = 'g'
    }
    else if  ((bigBox.y + (bigBox.height / 300 / (700 / 3))) < clickedX < (bigBox.y + (bigBox.height / 300 / (782 / 3))))  {
        tempCharPos.y = 'h'
    }
    else if  ((bigBox.y + (bigBox.height / 300 / (791 / 3))) < clickedX < (bigBox.y + (bigBox.height / 300 / (873 / 3))))  {
        tempCharPos.y = 'i'
    }
})