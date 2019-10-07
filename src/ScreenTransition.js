/**
 * List of possible transitions to a new screen.  Screens exit with
 * the inverse of the transition that they entered with.
 * @enum {string}
 */
const ScreenTransition = {
    /** No transtiion */
    None: '',
    /** Screen slides in from right to left */
    SlideLeft: 'slide-left',
    /** Screen slides in from left to right */
    SlideRight: 'slide-right',
    /** Screen slides in from bottom to top */
    SlideUp: 'slide-up',
    /** Screen slides in from top to bottom */
    SlideDown: 'slide-down',
    /** Screen grows from the center of the previous screen until it covers the entire viewport */
    Zoom: 'zoom-in',
    /** Screen fades in over top of the previous screen */
    Fade: 'fade-in',
};

Object.freeze(ScreenTransition);

export default ScreenTransition;