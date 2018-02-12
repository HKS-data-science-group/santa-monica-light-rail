
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