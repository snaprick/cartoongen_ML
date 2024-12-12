import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import Config from '../Config';
import History from './pages/History';
import Generator from './generator/Generator';
import Options from './generator/Options';
import GAN from '../utils/GAN';
import Utils from '../utils/Utils';
import './Home.css';
import { generatorAction, generatorConfigAction } from '../_actions';

class Home extends Component {

    constructor() {
        super();
        this.state = {
            gan: {
                loadingProgress: 0,
                isReady: false,
                isRunning: false,
                isCanceled: false,
                isError: false
            },
            rating: 0,
            mode: 'normal',
        };
        this.ganDict = {};
    }

    getModelConfig() {
        return Config.modelConfig[this.props.currentModel];
    }

    setModel(modelName=this.props.currentModel, disableWebgl=this.props.disableWebgl) {
        return new Promise((resolve, reject) => {
            var keyName = modelName + (disableWebgl ? '_nowebgl' : '');

            if (!this.ganDict[keyName]) {
                var gan = new GAN(Config.modelConfig[modelName]);
                var state = {
                    loadingProgress: 0,
                    isReady: false,
                    isRunning: false,
                    isCanceled: false,
                    isError: false
                };
                this.ganDict[keyName] = {
                    gan: gan,
                    state: state
                };
                this.setState({gan: state}, async () => {
                    if (Utils.usingCellularData()) {
                        try {
                            await this.dialog.show();
                        }
                        catch (err) {
                            this.setState({gan: Object.assign(state, {isCanceled: true})});
                            reject();
                        }
                    }
                    try {
                        await this.gan.init((current, total) => this.setState({gan: Object.assign(state, {loadingProgress: current / total * 100})}));
                        this.setState({gan: Object.assign(state, {isReady: true, backendName: this.gan.getBackendName()})});
                        resolve();
                    }
                    catch (err) {
                        this.setState({gan: Object.assign(state, {isError: true})});
                        reject(err);
                    }
                });
            }
            else {
                resolve();
            }
            this.gan = this.ganDict[keyName].gan;
            this.setState({gan: this.ganDict[keyName].state});
        });
    }

    async componentDidMount() {
        try {
            if (window.WebDNN.getBackendAvailability().status.webgl
                    && !window.WebDNN.getBackendAvailability().status.webgpu) {
                this.props.dispatch(
                    generatorConfigAction.setWebGLAvailability(true)
                );
            }

            this.props.dispatch(generatorConfigAction.setCount(1));

            await this.setModel();
        }
        catch (err) {
            console.log(err);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.disableWebgl !== this.props.disableWebgl) {
            this.setModel(this.props.currentModel, nextProps.disableWebgl)
        }
        if (nextProps.currentModel !== this.props.currentModel){
            this.setModel(nextProps.currentModel)
        }
    }

    getRandomOptionValues(originalOptionInputs) {
        var optionInputs = window.$.extend(true, {}, originalOptionInputs);
        this.getModelConfig().options.forEach(option => {
            var optionInput = optionInputs[option.key];

            if (!optionInput || optionInput.random) {
                optionInput = optionInputs[option.key] = {random: true};

                if (option.type === 'multiple') {
                    var value = Array.apply(null, {length: option.options.length}).fill(-1);
                    if (option.isIndependent) {
                        for (var j = 0; j < option.options.length; j++) {
                            value[j] = Math.random() < option.prob[j] ? 1 : -1;
                        }
                    }
                    else {
                        var random = Math.random();
                        for (j = 0; j < option.options.length; j++) {
                            if (random < option.prob[j]) {
                                value[j] = 1;
                                break;
                            }
                            else {
                                random -= option.prob[j];
                            }
                        }
                    }
                    optionInput.value = value;
                }
                else if (option.type === 'continuous') {
                    var min = option.samplingMin || option.min;
                    var max = option.samplingMax || option.max;
                    optionInput.value = Math.floor(Math.random() * ((max - min) / option.step + 1)) * option.step + min;
                }
                else {
                    optionInput.value = Math.random() < option.prob ? 1 : -1;
                }
            }
        });

        if (!optionInputs.noise || optionInputs.noise.random) {
            var value = [];
            optionInputs.noise = {random: true, value: value};
            Array.apply(null, {length: this.getModelConfig().gan.noiseLength}).map(() => Utils.randomNormal((u, v) => value.push([u, v])));
        }

        return optionInputs;
    }

    setGanState(state) {
        this.setState({
            gan: { ...this.state.gan, ...state }
        });
    }

    async generate() {
        this.setGanState({isRunning: true});

        for (var i = 0; i < this.props.count; i++) {
            if (this.gan.getBackendName() === 'webgl') {
                await Utils.promiseTimeout(100, true); // XXX: wait for components to refresh
            }

            var optionInputs = this.getRandomOptionValues(this.props.options);
            var label = Utils.getLabel(optionInputs, this.getModelConfig());
            var noise = Utils.getNoise(optionInputs);
            var result = await this.gan.run(label, noise);

            if (this.props.count > 1 && i === 0) {
                window.location = '#/history';
            }

            optionInputs.modelName=this.props.currentModel;

            this.props.dispatch(
                generatorAction.setGeneratorOptions(optionInputs)
            );
            this.props.dispatch(
                generatorAction.setGeneratorInput({ noise: noise, label: label, noiseOrigin: optionInputs.noise.value })
            );
            this.props.dispatch(
                generatorAction.appendResult(result, optionInputs, true)//, i!==0)
            );

            this.setState({
                rating: 0
            });

            this.setGanState({noise: noise, noiseOrigin: optionInputs.noise.value, input: noise.concat(label)});
        }

        this.setGanState({isRunning: false});
    }

    onOptionChange(key, value) {
        switch (key) {
            case 'mode':
                this.setState({mode: value});
                break;
            default:
                return;
        }
    }

    onOptionOperationClick(operation) {
        switch (operation) {
            case 'json_export':
                return this.onJSONExport();
            default:
                return;
        }
    }

    getOptions() {
        return this.props.options;
    }

    setOptions(options) {
        return this.props.dispatch(generatorAction.setGeneratorOptions(options));
    }

    onJSONExport() {
        this.setState({optionURI: URL.createObjectURL(new Blob([JSON.stringify(this.getOptions())]))}, () => {
            this.refs.jsonDownloader.click();
        });
    }

    getSizeLevel() {
        var modelConfig = this.props.currentIndex !== -1 ?
            Config.modelConfig[this.props.resultsOptions[this.props.currentIndex].modelName] :
            this.getModelConfig();
        var imageWidth = modelConfig.gan.imageWidth;

        if (imageWidth <= 200) {
            return 'small';
        }
        else {
            return 'large';
        }
    }

    getClassGeneratorContainer() {
        var sizeLevel = this.getSizeLevel();

        if (sizeLevel === 'small') {
            return 'col-sm-4 col-xs-12 generator-container';
        }
        else {
            return 'col-md-4 col-sm-5 col-xs-12 generator-container';
        }
    }

    getClassOptionsContainer() {
        var sizeLevel = this.getSizeLevel();

        if (sizeLevel === 'small') {
            return 'col-sm-8 col-xs-12 options-container';
        }
        else {
            return 'col-md-8 col-sm-7 col-xs-12 options-container';
        }
    }

    render() {
        return (
            <div className="home">
                <div className="row main-row" style={{ marginTop: "200px"}}>
                        <div className="row">
                            <div className={this.getClassGeneratorContainer()}>
                                <Generator
                                   gan={this.state.gan}
                                   modelConfig={this.getModelConfig()}
                                   onGenerateClick={() => this.generate()}
                                   rating={this.state.rating}
                                />
                            </div>
                            <div className={this.getClassOptionsContainer()}>
                                <Switch>
                                    <Route exact path="/" render={() =>
                                    <Options
                                      modelConfig={this.getModelConfig()}
                                      onOptionChange={(key, value) => this.onOptionChange(key, value)}
                                      onOperationClick={operation => this.onOptionOperationClick(operation)}
                                      mode={this.state.mode}
                                      //webglAvailable={this.state.webglAvailable}
                                      backendName={this.state.gan.backendName}/>
                                    }/>
                                    <Route path="/history" component={History}/>
                                </Switch>

                                <a href={this.state.optionURI} download="cartoon.json" target="_blank"
                                   ref="jsonDownloader" style={{display: "none"}}>Download JSON</a>

                            </div>
                        </div>
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        disableWebgl: state.generatorConfig.webglDisabled,
        currentModel: state.generator.currentModel,
        options: state.generator.options,
        results: state.generator.results,
        currentIndex:  state.generator.currentIndex,
        resultsOptions: state.generator.resultsOptions,
        count: state.generatorConfig.count,
    };
}

export default connect(mapStateToProps)(Home);