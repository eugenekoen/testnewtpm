function myFunction() {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("tabletwo");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

$(function () {
    $("pre").transpose();

    // Add an ID to the <pre> element for easy targeting
    const preElement = document.getElementById('song-lyrics');

    // Get the slider element
    const scrollSpeedSlider = document.getElementById('scroll-speed');

    // Initialize the interval variable
    let scrollInterval = null;

    // Define scroll speeds (adjust these values as needed)
    const scrollSpeeds = [0, 1, 2, 3]; // 0 for stop, 1 for slow, 2 for medium, 3 for fast

    // Function to handle scroll speed changes
    function handleScrollSpeedChange() {
        // Get the value of the slider
        const speed = parseInt(scrollSpeedSlider.value);

        // Calculate the scroll amount based on the selected speed
        const scrollAmount = scrollSpeeds[speed];

        // If there is an existing scroll interval, clear it
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }

        // Create a new interval to continuously scroll (if not stopped)
        if (scrollAmount > 0) {
            scrollInterval = setInterval(() => {
                preElement.scrollTop += scrollAmount;
            }, 100); // Adjust the interval timing as needed
        }
    }

    // Add an event listener to the slider
    scrollSpeedSlider.addEventListener('input', handleScrollSpeedChange);

    // Add an event listener to stop scrolling when the user manually scrolls up
    preElement.addEventListener('scroll', function () {
        // Check if the user has scrolled up (reached the top of the <pre> element)
        if (preElement.scrollTop === 0) {
            clearInterval(scrollInterval); // Stop the interval
        }
    });

    // Trigger initial scroll speed setup
    handleScrollSpeedChange();

    // Dynamically set the height of the <pre> element to match the device's screen height
    function adjustPreElementHeight() {
        const windowHeight = window.innerHeight;
        preElement.style.height = windowHeight + 'px';

        // Apply overflow: auto to enable scrolling if necessary
        preElement.style.overflow = preElement.scrollHeight > windowHeight ? 'auto' : 'hidden';
    }

    // Call the function to adjust the <pre> element's height initially
    adjustPreElementHeight();

    // Add an event listener to handle window resize events
    window.addEventListener('resize', adjustPreElementHeight);
});

(function ($) {

    $.fn.transpose = function (options) {
        var opts = $.extend({}, $.fn.transpose.defaults, options);

        var currentKey = null;

        var keys = [
            { name: 'Ab', value: 0, type: 'F' },
            { name: 'A', value: 1, type: 'N' },
            { name: 'A#', value: 2, type: 'S' },
            { name: 'Bb', value: 2, type: 'F' },
            { name: 'B', value: 3, type: 'N' },
            { name: 'C', value: 4, type: 'N' },
            { name: 'C#', value: 5, type: 'S' },
            { name: 'Db', value: 5, type: 'F' },
            { name: 'D', value: 6, type: 'N' },
            { name: 'D#', value: 7, type: 'S' },
            { name: 'Eb', value: 7, type: 'F' },
            { name: 'E', value: 8, type: 'N' },
            { name: 'F', value: 9, type: 'N' },
            { name: 'F#', value: 10, type: 'S' },
            { name: 'Gb', value: 10, type: 'F' },
            { name: 'G', value: 11, type: 'N' },
            { name: 'G#', value: 0, type: 'S' }
        ];

        var getKeyByName = function (name) {
            if (name.charAt(name.length - 1) == "m") {
                name = name.substring(0, name.length - 1);
            }
            for (var i = 0; i < keys.length; i++) {
                if (name == keys[i].name) {
                    return keys[i];
                }
            }
        };

        var getChordRoot = function (input) {
            if (input.length > 1 && (input.charAt(1) == "b" || input.charAt(1) == "#"))
                return input.substr(0, 2);
            else
                return input.substr(0, 1);
        };

        var getNewKey = function (oldKey, delta, targetKey) {
            var keyValue = getKeyByName(oldKey).value + delta;

            if (keyValue > 11) {
                keyValue -= 12;
            } else if (keyValue < 0) {
                keyValue += 12;
            }

            var i = 0;
            if (keyValue == 0 || keyValue == 2 || keyValue == 5 || keyValue == 7 || keyValue == 10) {
                // Return the Flat or Sharp Key
                switch (targetKey.name) {
                    case "A":
                    case "A#":
                    case "B":
                    case "C":
                    case "C#":
                    case "D":
                    case "D#":
                    case "E":
                    case "F#":
                    case "G":
                    case "G#":
                        for (; i < keys.length; i++) {
                            if (keys[i].value == keyValue && keys[i].type == "S") {
                                return keys[i];
                            }
                        }
                    default:
                        for (; i < keys.length; i++) {
                            if (keys[i].value == keyValue && keys[i].type == "F") {
                                return keys[i];
                            }
                        }
                }
            }
            else {
                // Return the Natural Key
                for (; i < keys.length; i++) {
                    if (keys[i].value == keyValue) {
                        return keys[i];
                    }
                }
            }
        };

        var getChordType = function (key) {
            switch (key.charAt(key.length - 1)) {
                case "b":
                    return "F";
                case "#":
                    return "S";
                default:
                    return "N";
            }
        };

        var getDelta = function (oldIndex, newIndex) {
            if (oldIndex > newIndex)
                return 0 - (oldIndex - newIndex);
            else if (oldIndex < newIndex)
                return 0 + (newIndex - oldIndex);
            else
                return 0;
        };

        var transposeSong = function (target, key) {
            var newKey = getKeyByName(key);

            if (currentKey.name == newKey.name) {
                return;
            }

            var delta = getDelta(currentKey.value, newKey.value);

            $("span.c", target).each(function (i, el) {
                transposeChord(el, delta, newKey);
            });

            currentKey = newKey;
        };

        var transposeChord = function (selector, delta, targetKey) {
            var el = $(selector);
            var oldChord = el.text();
            var oldChordRoot = getChordRoot(oldChord);
            var newChordRoot = getNewKey(oldChordRoot, delta, targetKey);
            var newChord = newChordRoot.name + oldChord.substr(oldChordRoot.length);
            el.text(newChord);

            var sib = el[0].nextSibling;
            if (sib && sib.nodeType == 3 && sib.nodeValue.length > 0 && sib.nodeValue.charAt(0) != "/") {
                var wsLength = getNewWhiteSpaceLength(oldChord.length, newChord.length, sib.nodeValue.length);
                sib.nodeValue = makeString(" ", wsLength);
            }
        };

        var getNewWhiteSpaceLength = function (a, b, c) {
            if (a > b)
                return (c + (a - b));
            else if (a < b)
                return (c - (b - a));
            else
                return c;
        };

        var makeString = function (s, repeat) {
            var o = [];
            for (var i = 0; i < repeat; i++) o.push(s);
            return o.join("");
        }

        var isChordLine = function (input) {
            var tokens = input.replace(/\s+/, " ").split(" ");

            // Try to find tokens that aren't chords
            // if we find one we know that this line is not a 'chord' line.
            for (var i = 0; i < tokens.length; i++) {
                if (!$.trim(tokens[i]).length == 0 && !tokens[i].match(opts.chordRegex))
                    return false;
            }
            return true;
        };

        var wrapChords = function (input) {
            return input.replace(opts.chordReplaceRegex, "<span class='c'>$1</span>");
        };

        return this.each(function () {

            var startKey = $(this).attr("data-key");
            if (!startKey || $.trim(startKey) == "") {
                startKey = opts.key;
            }

            if (!startKey || $.trim(startKey) == "") {
                throw ("Starting key not defined.");
                return this;
            }

            currentKey = getKeyByName(startKey);

            // Build transpose links ===========================================
            var keyLinks = [];
            $(keys).each(function (i, key) {
                if (currentKey.name == key.name)
                    keyLinks.push("<a href='#' class='selected'>" + key.name + "</a>");
                else
                    keyLinks.push("<a href='#'>" + key.name + "</a>");
            });


            var $this = $(this);
            var keysHtml = $("<div class='transpose-keys'></div>");
            keysHtml.html(keyLinks.join(""));
            $("a", keysHtml).click(function (e) {
                e.preventDefault();
                transposeSong($this, $(this).text());
                $(".transpose-keys a").removeClass("selected");
                $(this).addClass("selected");
                return false;
            });

            $(this).before(keysHtml);

            var output = [];
            var lines = $(this).text().split(/\r\n|\n/g);
            var line, tmp = "";

            for (var i = 0; i < lines.length; i++) {
                line = lines[i];

                if (isChordLine(line))
                    output.push("<span>" + wrapChords(line) + "</span>");
                else
                    output.push("<span>" + line + "</span>");
            };

            $(this).html(output.join("\n"));
        });
    };


    $.fn.transpose.defaults = {
        chordRegex: /^[A-G][b\#]?(2|4|5|6|7|9|11|13|6\/9|7\-5|7\-9|7\#5|7\#9|7\+5|7\+9|b5|#5|#9|7b5|7b9|7sus2|7sus4|add2|add4|add9|aug|dim|dim7|m\/maj7|m6|m7|m7b5|m9|m11|m13|maj7|maj9|maj11|maj13|mb5|m|sus|sus2|sus4)*(\/[A-G][b\#]*)*$/,
        chordReplaceRegex: /([A-G][b\#]?(2|4|5|6|7|9|11|13|6\/9|7\-5|7\-9|7\#5|7\#9|7\+5|7\+9|b5|#5|#9|7b5|7b9|7sus2|7sus4|add2|add4|add9|aug|dim|dim7|m\/maj7|m6|m7|m7b5|m9|m11|m13|maj7|maj9|maj11|maj13|mb5|m|sus|sus2|sus4)*)/g
    };

})(jQuery);
