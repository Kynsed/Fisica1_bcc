

import { Parameter } from '../util/Observe.js'
import { Printable } from '../util/Util.js'

/** A user interface control. */
export interface LabControl extends Printable {

/** Remove connections to other objects to facilitate garbage collection.
For example, stops listening for user interface events.
*/
disconnect(): void;

/** Returns the top level Element of this control. For example, this might be a
* label Element that encloses an input Element.
* @return the top level Element of this control
*/
getElement(): HTMLElement;

/** Returns the Parameter that this LabControl is connected to, if any.
* @return the Parameter that this LabControl is connected to, or `null`
*/
getParameter(): null|Parameter;

/** Enables or disables the control.
@param enabled  whether to enable the control
*/
setEnabled(enabled: boolean): void;

}
