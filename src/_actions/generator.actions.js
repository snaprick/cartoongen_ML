import {webglConstants, generatorConstants} from '../_constants';


export const generatorAction = {
    changeGeneratorModel,
    setGeneratorOptions,
    resetGeneratorOptions,
    fixGeneratorOptions,
    setGeneratorInput,
    appendResult,
    modelOptionChange,
    changeCurrentIndex,
};

export const generatorConfigAction = {
    setWebGLAvailability,
    setCount,
};

function setWebGLAvailability(value){
    return { type: webglConstants.CHANGE_AVAILABILITY, value}
}

function changeGeneratorModel(model){
    return { type: generatorConstants.CHANGE_MODEL, model}
}

function setGeneratorOptions(options){
    return { type: generatorConstants.SET_OPTIONS, options}
}

function resetGeneratorOptions(){
    return { type: generatorConstants.RESET_OPTIONS}
}

function fixGeneratorOptions(){
    return { type: generatorConstants.FIX_OPTIONS}
}

function setGeneratorInput(input) {
    return { type: generatorConstants.SET_INPUT, input}
}


function appendResult(result, options, appendResult=false) {
    return { type: generatorConstants.APPEND_RESULT, result, options, appendResult}
}

function modelOptionChange(key, random, value){
    return { type: generatorConstants.CHANGE_MODEL_OPTION, key, random, value}
}

function changeCurrentIndex(index) {
    return { type: generatorConstants.CHANGE_CURRENT_INDEX, index}
}

function setCount(value) {
    return { type: generatorConstants.SET_COUNT, value}
}