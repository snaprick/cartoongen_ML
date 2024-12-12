import { combineReducers } from 'redux';
import { selectLocale } from './locale.reducers';
import { generator, generatorConfig } from './generator.reducers';

const rootReducer = combineReducers({
    selectLocale,
    generator,
    generatorConfig,
});

export default rootReducer;