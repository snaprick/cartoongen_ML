import React, { Component } from 'react';
import { ReactHintFactory } from 'react-hint';
import { connect } from 'react-redux';
import { FormattedMessage } from "react-intl";
import 'react-hint/css/index.css';
import Config from '../../Config';
import Utils from '../../utils/Utils';
import MultipleSelector from '../generator-widgets/MultipleSelector';
import NoiseSelector from '../generator-widgets/NoiseSelector';
import ButtonGroup from '../generator-widgets/ButtonGroup';
import RandomButtonSimple from '../generator-widgets/RandomButtonSimple';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './Options.css';
import { generatorAction } from '../../_actions';
import { getlanguageLength } from '../../_reducers/locale.reducers';

const ReactHint = ReactHintFactory(React);

class Options extends Component {

    constructor(props) {
        super();
        this.options = Utils.arrayToObject(props.modelConfig.options, item => item.key);
        this.state = {
            perturbRange: 0.01,
            isPerturbing: false,
            previousNoise: [],
        };
    }

    componentWillReceiveProps(newProps) {
        this.options = Utils.arrayToObject(newProps.modelConfig.options, item => item.key);
    }

    renderLabel(key, title, large = true) {
        if (!large) {
            return (
                <h5>
                    <FormattedMessage id={title || Utils.keyToString(key)}/>
                </h5>
            );
        }
        else {
            return (
                <h4>
                    <FormattedMessage id={title || Utils.keyToString(key)}/>
                </h4>
            );
        }
    }

    isBinaryOptionSimple(option) {
        return option.random || option.value === 1 || option.value === -1;
    }

    getClassShortOption() {
        if (getlanguageLength(this.props.locale) === 'long') {
            return "col-xs-12 col-md-6 option";
        }
        else {
            return "col-xs-6 col-md-4 option";
        }
    };

    getClassLongOption() {
        return "col-xs-12 col-md-12 option";
    };

    isMultipleOptionSimple(option) {
        return option.random
            || (option.value.filter(v => v === 1).length === 1
                && option.value.filter(v => v === 1 || v === -1).length === option.value.length)
    }

    renderMultipleSelector(key, options, title) {
        var input = this.props.inputs[key];
        return (
            <div key={key} className={this.getClassShortOption()}>
                {this.renderLabel(key, title)}
                {(this.isMultipleOptionSimple(input) &&
                    <MultipleSelector
                        options={options}
                        value={input.random ? 0 : input.value.indexOf(1) + 1}
                        onChange={(value) => this.props.dispatch(
                            generatorAction.modelOptionChange(
                                key, value === 0, Array.apply(null, {length: options.length}).map((item, index) => index === value - 1 ? 1 : -1)
                            )
                        )} />) ||
                    <span><i>(User-defined)</i></span>}
            </div>
        );
    }

    renderContinuousSelector(key, config, title) {
        var input = this.props.inputs[key];
        return (
            <div key={key} className={this.getClassShortOption()}>
                {this.renderLabel(key, title)}
                <div className="flex">
                    <div>
                        <RandomButtonSimple
                            value={input.random ? 1 : 0}
                            onChange={(value) => this.props.dispatch(generatorAction.modelOptionChange(key, value === 1))}/>
                    </div>
                    <div className="flex-grow continuous-selector-slider">
                        <Slider min={config.min} max={config.max} step={config.step} value={Utils.clamp(input.value, config.min, config.max)}
                              onBeforeChange={() => this.props.dispatch(generatorAction.modelOptionChange(key, false))}
                              onChange={value => this.props.dispatch(generatorAction.modelOptionChange(key, false, value))}/>
                    </div>
                </div>
            </div>
        );
    }

    renderNoiseSelector() {
        return (
            <div className={this.getClassShortOption()}>
                {this.renderLabel('noise')}
                <NoiseSelector value={this.props.inputs.noise.random ? 0 : 1}
                               onChange={(value) => this.props.dispatch(generatorAction.modelOptionChange('noise', value === 0))}
                />
            </div>
        );
    }

    renderSelector(key) {
        var option = this.options[key];
        if (option.type === 'multiple') {
            return this.renderMultipleSelector(key, option.options);
        } else if (option.type === 'continuous') {
            return this.renderContinuousSelector(key, option)
        }
    }

    renderOperations() {
        return (
            <div className={this.getClassShortOption()}>
                {this.renderLabel('Operations', 'Operations')}
                {new ButtonGroup().renderButtonGroup([
                    {name: 'Export', onClick: () => this.props.onOperationClick('json_export')},
                    {name: 'Reset', onClick: () => this.props.dispatch(generatorAction.resetGeneratorOptions())},

                ])}
            </div>
        );
    }

    renderModelName() {
        return (
          <div className={this.getClassLongOption()}>
              <h5 style={{ fontSize: "20px"}}><FormattedMessage id="CurrentModel"/></h5>
              <div style={{ fontSize: "18px", fontWeight: "bold"}}><FormattedMessage id={this.props.currentModel}/></div>
          </div>
        );
    }

    renderAllMultipleOptions(){
        return Object.keys(this.options)
          .filter(item => this.options[item].type === 'multiple')
          .map(item => this.renderSelector(item));
    }

    renderAllContinuousOptions(){
        return Object.keys(this.options)
          .filter(item => this.options[item].type === 'continuous')
          .map(item => this.renderSelector(item));
    }

    render() {
        return (
          <div className="options">
              <div className="row">
                  <h3 className="col-xs-3 col-md-2" style={{color: Config.colors.theme, fontSize: "30px"}}>
                      <FormattedMessage id="Options"/>
                  </h3>
              </div>
              <div className="row" style={{ marginTop:"20px", marginBottom: "20px"}}>
                  {this.renderModelName()}
              </div>
              <div className="row" style={{ marginBottom: "24px" }}>
                {this.renderAllMultipleOptions()}
              </div>
              <div className="row">
                  {this.renderAllContinuousOptions()}
                  {this.renderNoiseSelector()}
                  {this.renderOperations()}
              </div>

              <ReactHint events delay={100}/>
          </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        webglAvailable: state.generatorConfig.webglAvailable,
        webglDisabled: state.generatorConfig.webglDisabled,
        currentModel: state.generator.currentModel,
        locale: state.selectLocale.locale,
        inputs: state.generator.options,
        count: state.generatorConfig.count,
    };
}

export default connect(mapStateToProps)(Options);
export {Options as OptionsClass}
