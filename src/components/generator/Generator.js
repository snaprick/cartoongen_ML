import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from "react-intl";
import { CSSTransitionGroup } from 'react-transition-group';
import Config from '../../Config';
import ButtonPrimary from '../generator-widgets/ButtonPrimary';
import ResultCanvas from '../generator-widgets/ResultCanvas';
import './Generator.css';

class Generator extends Component {

    getModelConfig() {
        return this.props.currentIndex !== -1 ?
            Config.modelConfig[this.props.resultsOptions[this.props.currentIndex].modelName] :
            this.props.modelConfig;
    }

    renderResultCanvas(result, index) {
        if(index !== this.props.currentIndex){
            return ;
        }
        return (
            <div key={index} className="result-container" style={{zIndex: 1000 + index}}>
                <ResultCanvas modelConfig={this.getModelConfig()} result={result} />
            </div>
        );
    }

    render() {
        var modelConfig = this.getModelConfig();
        var resultWrapperStyle = {
            height: modelConfig.gan.imageHeight,
            width: modelConfig.gan.imageWidth
        };
        return (

            <div className="generator">
                <div className="result-wrapper" style={resultWrapperStyle}>
                    {this.props.results ? this.props.results.map((result, index) => this.renderResultCanvas(result, index)) : null}
                </div>
                <ButtonPrimary
                    text={this.props.gan.isRunning ? 'Generating': 'Generate' }
                    disabled={this.props.gan.isRunning || !this.props.gan.isReady}
                    onClick={this.props.onGenerateClick}
                />


                <CSSTransitionGroup
                    transitionName="rating-transition"
                    transitionEnterTimeout={600}
                    transitionLeaveTimeout={600}>

                    <div style={{display: this.props.failed ? 'block' : 'none', color:'red'}}>
                        <FormattedMessage id="FailedGenerating"
                                          values={{webgl: <FormattedMessage id="WebGLAcceleration" />,
                                              optionmenu: <FormattedMessage id="OptionsMenu"/>}}
                        />
                    </div>
                </CSSTransitionGroup>

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        locale: state.selectLocale.locale,
        currentIndex:  state.generator.currentIndex,
        results: state.generator.results,
        resultsOptions: state.generator.resultsOptions,
        failed: state.generator.failedGenerating,
    };
}

export default connect(mapStateToProps)(Generator);
