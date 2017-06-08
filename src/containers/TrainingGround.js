import React, { Component } from 'react';
import { fetchAllActions, fetchAllEntities, fetchApplications, fetchTrainDialogs } from '../actions/fetch';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import EntitiesHomepage from './EntitiesHomepage';
import TrainDialogsHomepage from './TrainDialogsHomepage';
import ActionResponsesHomepage from './ActionResponsesHomepage';
import BLISAppsHomepage from './BLISAppsHomepage';
import { Nav } from 'office-ui-fabric-react';
class TrainingGround extends Component {
    render() {
        return (
            <div className="trainingGrounds">
                <div className='trainingGroundNavigationArea'>
                    <Nav
                        groups={[{
                            links: [
                                { name: 'Home', key: 'Home' },
                                { name: 'Activity', key: 'Activity', url: '' },
                                { name: 'News', key: 'News', url: '' },
                                { name: 'Documents', key: 'Documents', url: '' },
                            ]
                        }]}
                    />
                </div>
                <div className='trainingGroundArena'>
                </div>

            </div>
        );
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        fetchApplications: fetchApplications,
    }, dispatch);
}
const mapStateToProps = (state) => {
    return {
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TrainingGround);
