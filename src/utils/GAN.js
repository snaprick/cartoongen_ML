import Config from '../Config';
import Utils from '../utils/Utils';
import { store } from '../_helpers/store';

class GAN {

    constructor(modelConfig, options) {
        this.runner = null;
        this.currentNoise = null;
        this.input = null;
        this.modelConfig = modelConfig;
        this.options = options || {};
    }

    async getWeightFilePrefix() {
        var servers = this.modelConfig.gan.modelServers;
        var index = Math.floor(Math.random());
        var modelPath = Config.modelCompression ? this.modelConfig.gan.model + '_8bit' : this.modelConfig.gan.model;
        return window.location.protocol + '//' + servers[index] + modelPath;
    }

    getBackendOrder() {
        let order = ['webgpu', 'webassembly'];
        let state = store.getState();
        if (!state.generatorConfig.webglDisabled) {
            order.splice(1, 0, 'webgl')
        }

        return order;
    }

    async init(onInitProgress) {
        var modelPath = Config.modelCompression ? this.modelConfig.gan.model + '_8bit' : this.modelConfig.gan.model;
        this.runner = await window.WebDNN.load(modelPath, {progressCallback: onInitProgress, weightDirectory: await this.getWeightFilePrefix(), backendOrder: this.getBackendOrder()});
    }

    async run(label, noise) {
        this.currentNoise = noise || Array.apply(null, {length: this.modelConfig.gan.noiseLength}).map(() => Utils.randomNormal());
        let input = this.currentNoise.concat(label);
        this.currentInput = input;
        this.runner.getInputViews()[0].set(input);
        await this.runner.run();
        let output = this.runner.getOutputViews()[0].toActual().slice();
        return output;
    }

    getBackendName() {
        return this.runner.backendName;
    }

    getCurrentNoise() {
        return this.currentNoise;
    }

    getCurrentInput() {
        return this.currentInput;
    }
}

export default GAN;
