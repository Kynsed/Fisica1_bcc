

import { LabControl } from './LabControl.js';
import { Observer, Parameter, SubjectEvent } from '../util/Observe.js';
import { Util } from '../util/Util.js';

/** A group of LabControls which implements the LabControl interface.

A typical usage is to ensure a group of buttons stays together, such as playback
buttons for rewind, play/pause and step actions. Put the buttons into a single `<div>`
element, and make a GroupControl whose top element is that `<div>`.

Another usage is to insert a `<br>` element to break up long lines of controls into
logical groups. The GroupControl has the `<br>` as its top element and an empty list of
other controls.
*/
export class GroupControl implements LabControl {
  /** the name of the button */
  private name_: string;
  private topElement_: HTMLElement;
  private controls_: LabControl[];

/**
* @param name  name of the group
* @param topElement the top element that contains all the controls
* @param controls the set of controls contained in this
*     GroupControl, can be empty
*/
constructor(name: string, topElement: HTMLElement, controls: LabControl[]) {
  this.name_ = name;
  this.topElement_ = topElement;
  this.controls_ = controls;
};

/** @inheritDoc */
toString() {
  return this.toStringShort().slice(0, -1)
      +', controls_: ['
      + this.controls_.map(a => a.toStringShort())
      +']}';
};

/** @inheritDoc */
toStringShort() {
  return 'GroupControl{name_: "'+this.name_+'"'
      +', controls_.length: '+this.controls_.length
      +'}';
};

/** @inheritDoc */
disconnect(): void {
  this.controls_.forEach(c => c.disconnect());
};

/** Returns the set of controls in this GroupControl.
* @return the set of controls in this GroupControl.
*/
getControls(): LabControl[] {
  return Array.from(this.controls_);
};

/** @inheritDoc */
getElement(): HTMLElement {
  return this.topElement_;
};

/** @inheritDoc */
getParameter(): null|Parameter {
  return null;
};

/** @inheritDoc */
setEnabled(enabled: boolean): void {
  this.controls_.forEach(c => c.setEnabled(enabled));
};

} // end class
Util.defineGlobal('lab$controls$GroupControl', GroupControl);
