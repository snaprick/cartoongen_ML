import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import { IntlProvider, addLocaleData } from "react-intl";
import Navbar from '../components/Navbar';
import Home from '../components/Home';
import './App.css';

import en from "react-intl/locale-data/en";

addLocaleData([...en]);

class App extends Component {

    onTimelineLoad() {
        window.$('.main-content').css('max-width', 1200);
        window.$('.container-fluid').css('max-width', 1200);
    }

    render() {
        return (
            <IntlProvider
                locale={this.props.locale}
                messages={this.props.localeMessage}
            >
                <div className="App">
                    <Navbar location={this.props.location} />
                    <div className="main-content">
                        <Switch>
                            <Route path="/(|history|library)" render={() =>
                                <Home onTimelineLoad={() => this.onTimelineLoad()} />
                            }/>
                        </Switch>
                    </div>
                </div>
            </IntlProvider>
        );
    }
}

function mapStateToProps(state) {
    const { locale, localeMessage } = state.selectLocale;
    return {
        locale: locale,
        localeMessage: localeMessage
    };
}

const connectedApp = connect(
    mapStateToProps
)(App);

export { connectedApp as App };
