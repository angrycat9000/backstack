/**
 * Information about what type of call triggered the screen change
 * @readonly
 * @enum {string}
 * @public
 */
const Action = {
  /** {@link Manager#replace} */
  Replace: 'replace',
  /** {@link Manager#set} */
  Set: 'set',
    /** {@link Manager#back} */
  Back: 'back',
    /** {@link Manager#push} */
  Push: 'push',
  /** {@link Manager#setState} */
  State: 'set-state'
};

Object.freeze(Action);

export default Action;
