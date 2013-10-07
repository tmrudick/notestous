var Slider = (function() {
    var photos = [],
        dateEl = $('#date'),
        imgEl = $('#current-image'),
        slider = $('#slider');

    function updateImage(index) {
        imgEl.attr('src', photos[index].url);
        dateEl.text(formatDate(photos[index].date));
    }

    function formatDate(date) {
        var months = {
            1: 'January',
            2: 'February',
            3: 'March',
            4: 'April',
            5: 'May',
            6: 'June',
            7: 'July',
            8: 'August',
            9: 'September',
            10: 'October',
            11: 'November',
            12: 'December'
        };

        var components = date.split('/');

        return months[+components[0]] + ' ' + +components[1] + ', ' + components[2];
    }

    function initWithData(data) {
        // Parse the data into a format we can use
        for (var i = 0; i < data.length; i++) {
            data[i].timestamp = Date.parse(data[i].date);
            photos.push(data[i]);
        }

        // Sort the photos by date
        photos.sort(function(a, b) {
            return a.timestamp > b.timestamp;
        });

        // Draw out the timeline
        drawTimeline();

        // Init the slider
        slider.slider({
            min: photos[0].timestamp,
            max: photos[photos.length - 1].timestamp,
            value: photos[photos.length - 1].timestamp,
            slide: function(event, ui) {
                for (var i = 0; i < photos.length - 1; i++) {
                    if (photos[i].timestamp <= ui.value && photos[i+1].timestamp >= ui.value) {
                         if (ui.value - photos[i].timestamp < (photos[i + 1].timestamp - photos[i].timestamp) / 2) {
                             slider.slider('option', 'value', photos[i].timestamp, ui.value);
                             updateImage(i);
                         } else {
                             slider.slider('option', 'value', photos[i + 1].timestamp, ui.value);
                             updateImage(i + 1);
                         }
                         break;
                     }
                }
                return false;
            }
        });

        // Update the first image
        updateImage(photos.length - 1);
        imgEl.css('visibility', 'visible');
    }

    function drawTimeline() {
        var minDate = photos[0].timestamp,
            maxDate = photos[photos.length - 1].timestamp,
            range = maxDate - minDate,
            width = slider.width();

        // For each data point, add a tick to the slider
        for (var i = 0; i < photos.length; i++) {
            var tick = $('<div class="tick ui-widget-content"></div>').appendTo($('#slider'));

            // Calculate position
            var left = (width / range) * (photos[i].timestamp - minDate);

            tick.css({
                left: left + 'px'
            })
        }

        // When the window is resized, remove all of the ticks and redraw
        $(window).resize(function () {
            $('#slider .tick').remove();
            drawTimeline();
        });
    }

    $.ajax({
        url: '/photos.json',
        dataType: 'json',
        success: initWithData,
        error: function() {
            alert('error');
        }
    });
})();