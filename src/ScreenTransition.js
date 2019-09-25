


const ScreenTransition = {
    None: {in:'', out:''},
    SlideLeft: {in:'slide-left', out:'slide-right'},
    SlideRight: {in:'slide-right', out:'slide-left'},
    SlideUp: {in:'slide-up', out:'slide-down'},
    SlideDown: {in:'slide-down', out:'slide-up'},
    Zoom: {in:'grow-in', out:'shrink-out'}
};

Object.freeze(ScreenTransition);

export default ScreenTransition;