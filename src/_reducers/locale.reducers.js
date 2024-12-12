import en_US from '../locale/en_US';
import { localeConstants } from '../_constants';

let locale = 'en';
let localeMessage = en_US;

const initialState = {locale: locale, localeMessage: localeMessage};

export function selectLocale(state = initialState, action) {
    switch (action.type) {
        case localeConstants.CHANGE:
            return {
                ...state,
                locale: action.locale,
                localeMessage: en_US
            };
        default:
            return state
    }
}

export function getlanguageLength(locale) {
    switch(locale){
        default:
            return 'normal';
    }
}