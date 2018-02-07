
$(function() {
    $('#fullPage')
        .fullpage({

            navigation: true,
            menu: '#main-menu',
            verticalCentered: false,

            afterLoad: function(anchorLink, index) {

            },

            onLeave: function(index, nextIndex, direction){

            }

        });
});


function initializeElements() {
    $( "#geography-slider" ).slider({
        min: 1,
        max: 3,
        step: 1,
        value:1,
        orientation: 'vertical',
        slide: function(event, ui) {
            geographySliderMove();
        },
        stop: function(event, ui) {
            geographySliderMove();
            timeVis.wrangleData();
        }
    });
}