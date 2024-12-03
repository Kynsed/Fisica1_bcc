import { AbstractSubject } from '../util/AbstractSubject.js';
import { SimList } from './SimList.js';
import { GenericEvent } from '../util/Observe.js';
import { Util } from '../util/Util.js';
import { VarsList } from './VarsList.js';
export class AbstractODESim extends AbstractSubject {
    constructor(opt_name, opt_simList, opt_varsList) {
        super(opt_name || 'SIM');
        this.initialState_ = null;
        this.recentState_ = null;
        this.terminal_ = null;
        this.simList_ = opt_simList || new SimList();
        this.varsList_ = opt_varsList || new VarsList([], [], this.getName() + '_VARS');
    }
    ;
    toString() {
        return ', varsList_: ' + this.varsList_.toStringShort()
            + ', simList_: ' + this.simList_.toStringShort()
            + super.toString();
    }
    ;
    getTime() {
        return this.varsList_.getTime();
    }
    ;
    getVarsList() {
        return this.varsList_;
    }
    ;
    reset() {
        if (this.initialState_ != null) {
            this.varsList_.setValues(this.initialState_);
        }
        this.simList_.removeTemporary(Infinity);
        this.modifyObjects();
        this.broadcast(new GenericEvent(this, AbstractODESim.RESET));
    }
    ;
    restoreState() {
        if (this.recentState_ != null) {
            this.varsList_.setValues(this.recentState_, true);
        }
    }
    ;
    saveInitialState() {
        this.initialState_ = this.varsList_.getValues();
        this.broadcast(new GenericEvent(this, AbstractODESim.INITIAL_STATE_SAVED));
    }
    ;
    saveState() {
        this.recentState_ = this.varsList_.getValues();
    }
    ;
    getSimList() {
        return this.simList_;
    }
    ;
    setVarsList(varsList) {
        this.varsList_ = varsList;
    }
    ;
    setTerminal(terminal) {
        this.terminal_ = terminal;
    }
}
AbstractODESim.RESET = 'RESET';
AbstractODESim.INITIAL_STATE_SAVED = 'INITIAL_STATE_SAVED';
Util.defineGlobal('lab$model$AbstractODESim', AbstractODESim);
