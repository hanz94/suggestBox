//global variables for suggestboxCheckKey function
var counter = 0;
var lastKey;
var selectedIndex;
var selectedName;
var selectedDiv;

//global objects / arrays for XML ajax
var wojewodztwa;
var wojewodztwaArr = [];
var powierzchnia;
var jednostka;
var ludnosc;

// show 1 000 000 instead of 1000000
function numberWithSpaces(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

//show only values that match input (in the suggestbox)
function updateSuggestBox(inputText, wojewodztwa, powierzchnia, jednostka, ludnosc) {
    var results = 0;
    $('.suggestbox').empty();

    //search for matching values
    wojewodztwa.each(function (i) {
        if (this.firstChild.nodeValue.indexOf(inputText) == 0) {
            results++;
            var div = $('<div class="select-wojewodztwo">'+this.firstChild.nodeValue+'</div>');
            div.click(function () {
                suggestboxClickHandler(this, i, powierzchnia, jednostka, ludnosc);
            })
            $('.suggestbox').append(div);
        }
    })
    
    //if there are no matching values (no results)
    if (!results) {
        var div = $('<div class="no-results">Brak dopasowań.</div>');
        $('.suggestbox').append(div);
    }
}

//show all values (voivodeships) in the suggestbox
function resetSuggestBox(wojewodztwa, powierzchnia, jednostka, ludnosc) {
    $('.suggestbox').empty();
        wojewodztwa.each(function (i) {
            var div = $('<div class="select-wojewodztwo">'+$(this).text()+'</div>');
            div.click(function () {
                suggestboxClickHandler(this, i, powierzchnia, jednostka, ludnosc);
            })
            $('.suggestbox').append(div);
        });
}

function suggestboxClickHandler(thisDiv, i, powierzchnia, jednostka, ludnosc) {
                $('.suggestbox').hide();
                $('.info').show();
                $('#input-wojewodztwo').val($(thisDiv).text());
                $('#info-nazwa-value').text($(thisDiv).text());
                $('#info-powierzchnia-value').text(powierzchnia[i].firstChild.nodeValue);
                // value of 'jednostka' without last character (km)
                $('#info-jednostka-value').text(jednostka[i].substring(0,jednostka[i].length - 1))
                // last character of 'jednostka' (2) as a text in a <sup></sup> element
                $('#info-jednostka-lastchar').text(jednostka[i].charAt(jednostka[i].length - 1))
                $('#info-ludnosc-value').text(numberWithSpaces(ludnosc[i].firstChild.nodeValue));
                
                $('.img-container').empty().show();
                $('.source-container').show();
                var wojewodztwoImg = new Image();
                wojewodztwoImg.src = window.location.href + 'images/' + i + '.png';
                $('.img-container').prepend(wojewodztwoImg);
}

function suggestboxCheckKey(e) {
    var children = $('.suggestbox').children('.select-wojewodztwo');
    //40 arrow down
    if (e.keyCode == 40 && children.length) {
        if (lastKey == 'arrowup') {
            counter = counter + 2;
        }
        selectedIndex = counter % children.length;
        children.eq(selectedIndex).addClass("select-wojewodztwo-selected");
        selectedName = children.eq(selectedIndex).text();
        selectedDiv = children.eq(selectedIndex);
        lastKey = 'arrowdown';
        counter++;
    }
    //38 arrow up
    else if (e.keyCode == 38 && children.length) {
        if (lastKey == 'arrowdown') {
            counter = counter - 2;
        }
        else if (lastKey == null) {
            counter = children.length - 1;
        }
        selectedIndex = counter % children.length;
        children.eq(selectedIndex).addClass("select-wojewodztwo-selected");
        selectedName = children.eq(selectedIndex).text();
        selectedDiv = children.eq(selectedIndex);
        lastKey = 'arrowup';
        counter--;
    }
    //13 enter
    else if (e.keyCode == 13 && children.length) {
        suggestboxClickHandler(selectedDiv, wojewodztwaArr.indexOf(selectedName), powierzchnia, jednostka, ludnosc);
    }
}

$(document).ready(() => {

    $.ajax({
        type: "GET",
        url: "wojewodztwa.xml",
        dataType: "xml",
        success: function (xmlObj) {
            var xmlRootNode = $('Województwa', xmlObj);
            wojewodztwa = xmlRootNode.find('Województwo > Nazwa');
            wojewodztwa.each(function() {
                wojewodztwaArr.push(this.firstChild.nodeValue);
            })
            powierzchnia = xmlRootNode.find('Województwo > Powierzchnia');

            //get all attributes 'jednostka'
            jednostka = xmlRootNode.find('Województwo > Powierzchnia').map(function () {
                return $(this).attr('jednostka');
            }).get();

            ludnosc = xmlRootNode.find('Województwo > Ludność');
            resetSuggestBox(wojewodztwa, powierzchnia, jednostka, ludnosc);

        },
        error: function () {
            alert('Błąd łączenia z bazą danych.')
        },
        complete: function () {
            //show suggestbox when click on input
            $('#input-wojewodztwo').on('click', function () {
                var inputText = $(this).val().toLowerCase();
                if (inputText.length) {
                    updateSuggestBox(inputText, wojewodztwa, powierzchnia, jednostka, ludnosc);
                    $('.suggestbox').show();
                }
                else {
                    resetSuggestBox(wojewodztwa, powierzchnia, jednostka, ludnosc);
                    $('.suggestbox').show();
                }
                
                //reset counter
                counter = 0;
                lastKey = null
              })

              $('#input-wojewodztwo').on('keyup', function (e) {
                var inputText = $(this).val().toLowerCase();
                if (!inputText.length && e.keyCode != 40 && e.keyCode != 38) {
                    $('.suggestbox').hide();
                    resetSuggestBox(wojewodztwa, powierzchnia, jednostka, ludnosc);
                }
                else {
                    updateSuggestBox(inputText, wojewodztwa, powierzchnia, jednostka, ludnosc);
                    $('.suggestbox').show();
                }

                // NOT: 40-arrowdown 38-arrowup 13-enter = reset counter
                if (e.keyCode != 40 && e.keyCode != 38 && e.keyCode != 13) {
                    counter = 0;
                    lastKey = null;
                }

                //check key function
                suggestboxCheckKey(e);
            })
        }
      });

      //Prevent moving input cursor on pressing arrowdown / arrowup
      $('#input-wojewodztwo').on('keydown',function (e) {
        if (e.keyCode == 40 || e.keyCode == 38) {
            e.preventDefault();
        }
      })

      //hide suggestbox when click outside
      $(document).mouseup(function (e) {
        var container = $(".suggestbox");

        // if the target of the click isn't the container nor a descendant of the container
        if (!container.is(e.target) && container.has(e.target).length === 0) 
        {
            container.hide();
        }

        //reset counter
        counter = 0;
        lastkey = null;
});

})