import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { ExtractResponse, TrainExtractorStep } from 'blis-models'
import { postExtractorFeedbackAsync, runScorerAsync } from '../actions/teachActions';
import { CommandButton } from 'office-ui-fabric-react';
import EntityCreatorEditor from './EntityCreatorEditor'
import { dummyExtractResponse, dummyTrainExtractorStep } from '../epics/apiHelpers' // TEMP

const initState = {
            entityModalOpen: false
        };

class TeachSessionExtractor extends React.Component<Props, any> {
    constructor(p: Props) {
        super(p);
        this.state = initState;
    }
    handleCloseEntityModal() {
        this.setState({
            entityModalOpen: false
        })
    }
    handleOpenEntityModal() {
        this.setState({
            entityModalOpen: true
        })
    }
    sendFeedback() {
        // TEMP 
        let trainExtractorStep = dummyTrainExtractorStep();
        let appId: string = this.props.apps.current.appId;
        let teachId: string = this.props.teachSession.current.teachId;
        this.props.postExtractorFeedback(this.props.user.key, appId, teachId, trainExtractorStep);
    }
    runScorer() {
        // TEMP
        let dummyER = dummyExtractResponse();
        let extractResponse = dummyER.extractResponse;
        let appId: string = this.props.apps.current.appId;
        let teachId: string = this.props.teachSession.current.teachId;
        this.props.runScorer(this.props.user.key, appId, teachId, extractResponse);
    }
    render() {
        return (
            <div className='content'>
                <div className='ms-font-xl'>Entity Detection</div>
                    <div>{this.props.teachSession.input}</div>
                    <CommandButton
                            data-automation-id='randomID16'
                            disabled={false}
                            onClick={this.sendFeedback.bind(this)}
                            className='ms-font-su goldButton teachSessionHeaderButton'
                            ariaDescription='Send Extract Feedback'
                            text='Send Extract Feedback'
                        />
                    <CommandButton
                            data-automation-id='randomID16'
                            disabled={false}
                            onClick={this.runScorer.bind(this)}
                            className='ms-font-su goldButton teachSessionHeaderButton'
                            ariaDescription='Run Scorer'
                            text='Run Scorer'
                        />
                    <CommandButton
                            data-automation-id='randomID8'
                            className="goldButton teachSessionHeaderButton actionCreatorCreateEntityButton"
                            disabled={false}
                            onClick={this.handleOpenEntityModal.bind(this)}
                            ariaDescription='Cancel'
                            text='Entity'
                            iconProps={{ iconName: 'CirclePlus' }}
                        />
                    <EntityCreatorEditor open={this.state.entityModalOpen} entity={null} handleClose={this.handleCloseEntityModal.bind(this)} />
 
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({     
        postExtractorFeedback: postExtractorFeedbackAsync,
        runScorer: runScorerAsync
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        user: state.user,
        teachSession: state.teachSessions,
        apps: state.apps
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect(mapStateToProps, mapDispatchToProps)(TeachSessionExtractor as React.ComponentClass<any>);