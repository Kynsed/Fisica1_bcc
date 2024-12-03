import { CHOICES_MODIFIED } from '../util/Observe.js';
import { Util } from '../util/Util.js';
export class ChoiceControlBase {
    constructor(choices, values, getter, setter, opt_label) {
        this.getter_ = getter;
        this.setter_ = setter;
        this.choices = choices;
        this.values_ = values;
        this.currentIndex_ = this.values_.indexOf(getter());
        this.selectMenu_ = document.createElement('select');
        Util.assert(!this.selectMenu_.multiple);
        Util.assert(this.selectMenu_.type == 'select-one');
        this.buildSelectMenu();
        this.label_ = opt_label ?? '';
        let myLabel = null;
        if (this.label_.length > 0) {
            const labelElement = document.createElement('label');
            labelElement.appendChild(document.createTextNode(this.label_));
            labelElement.appendChild(this.selectMenu_);
            myLabel = labelElement;
        }
        this.selectMenu_.selectedIndex = this.currentIndex_;
        this.topElement_ = myLabel !== null ? myLabel : this.selectMenu_;
        this.changeFn_ = this.itemStateChanged.bind(this);
        this.selectMenu_.addEventListener('change', this.changeFn_, true);
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', currentIndex_: ' + this.currentIndex_
            + ', choices.length: ' + this.choices.length
            + ', selected: "' + (this.currentIndex_ > -1 ?
            this.choices[this.currentIndex_] : '(none)')
            + '"}';
    }
    ;
    toStringShort() {
        return this.getClassName() + '{label_: "' + this.label_ + '"}';
    }
    ;
    buildSelectMenu() {
        this.selectMenu_.options.length = 0;
        for (let i = 0, len = this.choices.length; i < len; i++) {
            this.selectMenu_.options[i] = new Option(this.choices[i]);
        }
    }
    ;
    disconnect() {
        this.selectMenu_.removeEventListener('change', this.changeFn_, true);
    }
    ;
    getChoice() {
        return this.currentIndex_;
    }
    ;
    getClassName() {
        return 'ChoiceControlBase';
    }
    ;
    getElement() {
        return this.topElement_;
    }
    ;
    getParameter() {
        return null;
    }
    ;
    itemStateChanged(_event) {
        if (this.selectMenu_.selectedIndex !== this.currentIndex_) {
            this.setChoice(this.selectMenu_.selectedIndex);
        }
    }
    ;
    observe(_event) {
        const index = this.values_.indexOf(this.getter_());
        this.setChoice(index);
    }
    ;
    setChoice(index) {
        if (this.currentIndex_ !== index) {
            const n = this.selectMenu_.options.length;
            if (this.values_.length != n) {
                throw 'ChoiceControl: values_.length=' + this.values_.length +
                    ' but menu.options.length=' + n;
            }
            try {
                if (index < -1) {
                    index = -1;
                }
                else if (index > n - 1) {
                    index = n - 1;
                }
                this.currentIndex_ = index;
                if (index > -1) {
                    this.setter_(this.values_[index]);
                }
            }
            catch (ex) {
                alert(ex);
                this.currentIndex_ = this.values_.indexOf(this.getter_());
            }
            this.selectMenu_.selectedIndex = this.currentIndex_;
        }
    }
    ;
    setChoices(choices, values) {
        if (choices.length != values.length) {
            throw '';
        }
        this.choices = choices;
        this.values_ = values;
        this.currentIndex_ = this.values_.indexOf(this.getter_());
        this.buildSelectMenu();
        this.selectMenu_.selectedIndex = this.currentIndex_;
    }
    ;
    setEnabled(enabled) {
        this.selectMenu_.disabled = !enabled;
    }
    ;
}
Util.defineGlobal('lab$controls$ChoiceControlBase', ChoiceControlBase);
export class ChoiceControl extends ChoiceControlBase {
    constructor(parameter, opt_label, opt_choices, opt_values) {
        const choices = opt_choices ?? parameter.getChoices();
        const values = opt_values ?? parameter.getValues();
        const label = opt_label ?? parameter.getName(true);
        super(choices, values, () => parameter.getAsString(), a => parameter.setFromString(a), label);
        this.parameter_ = parameter;
        this.parameter_.getSubject().addObserver(this);
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', parameter_: ' + this.parameter_.toStringShort() + '}';
    }
    ;
    disconnect() {
        super.disconnect();
        this.parameter_.getSubject().removeObserver(this);
    }
    ;
    getClassName() {
        return 'ChoiceControl';
    }
    ;
    getParameter() {
        return this.parameter_;
    }
    ;
    observe(event) {
        if (event.getValue() == this.parameter_
            && event.nameEquals(CHOICES_MODIFIED)) {
            setTimeout(() => this.rebuildMenu(), 50);
        }
        else if (event == this.parameter_) {
            super.observe(event);
        }
    }
    ;
    rebuildMenu() {
        const newChoices = this.parameter_.getChoices();
        if (!Util.equals(this.choices, newChoices)) {
            this.setChoices(newChoices, this.parameter_.getValues());
        }
    }
    ;
}
Util.defineGlobal('lab$controls$ChoiceControl', ChoiceControl);
