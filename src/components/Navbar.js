import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { FormattedMessage } from "react-intl";
import Config from '../Config';
import './Navbar.css';

class Navbar extends Component {

    renderLink(title, path, newTab=false) {
        let currentLocation = this.props.location.pathname;
        return (
            <li className={currentLocation === path ? 'active': ''}>
                {!newTab ? <Link to={path}><FormattedMessage id={title} /></Link>: <a href={path} target="_blank" rel="noopener noreferrer"><FormattedMessage id={title} /></a>}
            </li>
        );
    }
    render() {
        return (
            <nav className="navbar navbar-default">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar" />
                        </button>
                    </div>

                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        <ul className="nav navbar-nav">
                            {this.renderLink('Home', '/')}
                            {this.renderLink('History', '/history')}
                        </ul>
                    </div>

                    <Link className="navbar-brand" to="/">
                        <span style={{color: Config.colors.theme}}>
                            Cartoon Generator
                        </span>
                    </Link>
                </div>
            </nav>
        );
    }
}

function mapStateToProps(state) {
    return {
        locale: state.selectLocale.locale,
    };
}

export default connect(mapStateToProps)(Navbar);
