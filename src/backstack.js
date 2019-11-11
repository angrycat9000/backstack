/**
 * Copyright (c) 2019 Mark Dane
 * backstack
 * https://backstack.netlify.com/
 * 
 * Licensed under the terms of the MIT License
 * https://github.com/angrycat9000/backstack/blob/master/LICENSE
 * 
 * @license @nocompile
 */

import Manager from './Manager';
import ScreenTransition from './ScreenTransition'

export {Manager, ScreenTransition}

window.customElements.define('backstack-manager', Manager);
