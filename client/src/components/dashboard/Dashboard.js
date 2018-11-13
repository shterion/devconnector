import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getCurrentProfile } from '../../actions/profileActions';

class Dasboard extends React.Component {
    componentDidMount() {
        this.props.getCurrentProfile();
    }

    render() {
        return (
            <div>
            <h1>Dashboard</h1>
            </div>
        )
    }
} 

export default connect(null, { getCurrentProfile })(Dasboard);