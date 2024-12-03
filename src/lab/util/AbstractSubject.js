import { Util } from "./Util.js";
import { ParameterBoolean, ParameterNumber, ParameterString } from "./Observe.js";
export class AbstractSubject {
    constructor(name) {
        this.observers_ = [];
        this.paramList_ = [];
        this.doBroadcast_ = true;
        this.isBroadcasting_ = false;
        this.commandList_ = [];
        if (!name) {
            throw 'no name';
        }
        this.name_ = Util.validName(Util.toName(name));
    }
    ;
    toString() {
        return ', parameters: ['
            + this.paramList_.map(p => p.toStringShort())
            + '], observers: ['
            + this.observers_.map(p => p.toStringShort())
            + ']}';
    }
    ;
    toStringShort() {
        return this.getClassName()
            + '{name_: "' + this.getName() + '"}';
    }
    ;
    addObserver(observer) {
        const cmd = {
            action: true,
            observer: observer
        };
        this.commandList_.push(cmd);
        this.doCommands();
    }
    ;
    doCommands() {
        if (!this.isBroadcasting_) {
            for (let i = 0, len = this.commandList_.length; i < len; i++) {
                const cmd = this.commandList_[i];
                if (cmd.action) {
                    if (!this.observers_.includes(cmd.observer)) {
                        this.observers_.push(cmd.observer);
                    }
                }
                else {
                    Util.remove(this.observers_, cmd.observer);
                }
            }
            this.commandList_ = [];
        }
    }
    ;
    addParameter(parameter) {
        const name = parameter.getName();
        const p = this.getParam_(name);
        if (p != null) {
            throw 'parameter ' + name + ' already exists: ' + p;
        }
        this.paramList_.push(parameter);
    }
    ;
    broadcast(evt) {
        if (this.doBroadcast_) {
            this.isBroadcasting_ = true;
            try {
                this.observers_.forEach(o => o.observe(evt));
            }
            finally {
                this.isBroadcasting_ = false;
                this.doCommands();
            }
        }
    }
    ;
    broadcastParameter(name) {
        const p = this.getParam_(name);
        if (p == null) {
            throw 'unknown Parameter ' + name;
        }
        this.broadcast(p);
    }
    ;
    getBroadcast() {
        return this.doBroadcast_;
    }
    ;
    getName() {
        return this.name_;
    }
    ;
    getObservers() {
        return Array.from(this.observers_);
    }
    ;
    getParam_(name) {
        name = Util.toName(name);
        return this.paramList_.find(p => p.getName() == name);
    }
    ;
    getParameter(name) {
        const p = this.getParam_(name);
        if (p !== undefined) {
            return p;
        }
        throw 'Parameter not found ' + name;
    }
    ;
    getParameterBoolean(name) {
        const p = this.getParam_(name);
        if (p instanceof ParameterBoolean) {
            return p;
        }
        throw 'ParameterBoolean not found ' + name;
    }
    ;
    getParameterNumber(name) {
        const p = this.getParam_(name);
        if (p instanceof ParameterNumber) {
            return p;
        }
        throw 'ParameterNumber not found ' + name;
    }
    ;
    getParameterString(name) {
        const p = this.getParam_(name);
        if (p instanceof ParameterString) {
            return p;
        }
        throw 'ParameterString not found ' + name;
    }
    ;
    getParameters() {
        return Array.from(this.paramList_);
    }
    ;
    removeObserver(observer) {
        const cmd = {
            action: false,
            observer: observer
        };
        this.commandList_.push(cmd);
        this.doCommands();
    }
    ;
    removeParameter(parameter) {
        Util.remove(this.paramList_, parameter);
    }
    ;
    setBroadcast(value) {
        const saveBroadcast = this.doBroadcast_;
        this.doBroadcast_ = value;
        return saveBroadcast;
    }
    ;
}
Util.defineGlobal('lab$util$AbstractSubject', AbstractSubject);
