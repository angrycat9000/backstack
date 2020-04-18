/**
 * List of possible transitions to a new screen.  Screens exit with
 * the inverse of the transition that they entered with.
 * @readonly
 * @enum {string}
 */
const ScreenTransition = {
    /** No transition */
    None: '',
    /** New screen slides in from right edge moving left */
    SlideLeft: 'slide-left',
    /** New screen slides in from left edge moving right */
    SlideRight: 'slide-right',
    /** New screen slides in from bottom edge moving up*/
    SlideUp: 'slide-up',
    /** New screen slides in from top edge moving down*/
    SlideDown: 'slide-down',
    /** Screen grows from the center of the previous screen until it covers the entire viewport */
    Zoom: 'zoom-in',
    /** Screen fades in over top of the previous screen */
    Fade: 'fade-in',
    /** Both screens move left togethor.  Screen enters from the right */
    PushLeft: 'slide-left/slide-right',
    /** Both screens move right togethor.  Screen enters from the left */
    PushRight: 'slide-right/slide-left',
    /** Both screens move down togethor.  Screen enters from the top */
    PushDown: 'slide-down/slide-up',
    /** Both screens move up togethor.  Screen enters from the bottom */
    PushUp: 'slide-up/slide-down',
    /** Fades in at the same time as sliding partially from the left */
    FadeLeft: 'fade-left',
    /** Fades in at the same time as sliding partially from the right */
    FadeRight: 'fade-right',
    /** Fades in at the same time as sliding partially from the top */
    FadeUp: 'fade-up',
    /** Fades in at the same time as sliding partially from the bottom */
    FadeDown: 'fade-down',
};

Object.freeze(ScreenTransition);

export default ScreenTransition;