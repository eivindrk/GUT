$(document).ready(
    function(){
        $(".hamburger-icon").on("click", function(){
            // $(".dropdown-menu").toggleClass("open").stop(true, false).slideToggle(300);
            $(".dropdown-menu").slideToggle(300);
            $(".single-container").slideToggle(300);
            $(".social-media-container").slideToggle(300);

        });

        $(".close-button").on("click", function(){
            $(".dropdown-menu").slideToggle(300);
            $(".single-container").slideToggle(300);
            $(".social-media-container").slideToggle(300);
        })

        
});