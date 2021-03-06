/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { editApplicationAsync, editAppEditingTagThunkAsync, editAppLiveTagThunkAsync } from '../../../actions/updateActions';
import { bindActionCreators } from 'redux';
import PackageTable from '../../../components/modals/PackageTable'
import { connect } from 'react-redux';
import { State } from '../../../types';
import * as OF from 'office-ui-fabric-react';
import { Expando } from '../../../components/modals'
import { saveAs } from 'file-saver'
import { AppBase, AppDefinition, TrainingStatusCode } from '@conversationlearner/models'
import './Settings.css'
import { fetchAppSourceThunkAsync } from '../../../actions/fetchActions'
import { CL_DEMO_ID } from '../../../types/const'
import { FM } from '../../../react-intl-messages'
import ErrorInjectionEditor from '../../../components/modals/ErrorInjectionEditor'
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl'
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import * as TC from '../../../components/tipComponents/Components'
import * as ToolTip from '../../../components/ToolTips'
import * as util from '../../../util'
import HelpIcon from '../../../components/HelpIcon'

const messages = defineMessages({
    fieldErrorRequired: {
        id: FM.SETTINGS_FIELDERROR_REQUIREDVALUE,
        defaultMessage: 'Required Value'
    },
    fieldErrorAlphanumeric: {
        id: FM.SETTINGS_FIELDERROR_ALPHANUMERIC,
        defaultMessage: 'Application name may only contain alphanumeric characters'
    },
    fieldErrorDistinct: {
        id: FM.SETTINGS_FIELDERROR_DISTINCT,
        defaultMessage: 'Name is already in use.'
    },
    passwordHidden: {
        id: FM.SETTINGS_PASSWORDHIDDEN,
        defaultMessage: 'Show'
    },
    passwordVisible: {
        id: FM.SETTINGS_PASSWORDVISIBLE,
        defaultMessage: 'Hide'
    },
    botFrameworkAppIdFieldLabel: {
        id: FM.SETTINGS_BOTFRAMEWORKAPPIDFIELDLABEL,
        defaultMessage: 'Application ID'
    },
    botFrameworkAddBotButtonText: {
        id: FM.SETTINGS_BOTFRAMEWORKADDBOTBUTTONTEXT,
        defaultMessage: 'Add'
    },
    saveChanges: {
        id: FM.SETTINGS_SAVECHANGES,
        defaultMessage: 'Save Changes'
    },
    discard: {
        id: FM.SETTINGS_DISCARD,
        defaultMessages: 'Discard'
    }
})

interface ComponentState {
    localeVal: string
    appIdVal: string
    appNameVal: string
    selectedEditingTagOptionKey: string | number,
    selectedLiveTagOptionKey: string | number,
    markdownVal: string
    videoVal: string
    edited: boolean
    botFrameworkAppsVal: any[],
    newBotVal: string,
    debugErrorsOpen: boolean
    isLoggingOnVal: boolean,
    isPackageExpandoOpen: boolean,
    isSettingsExpandoOpen: boolean
}

class Settings extends React.Component<Props, ComponentState> {
    constructor(p: Props) {
        super(p)

        this.state = {
            localeVal: '',
            appIdVal: '',
            appNameVal: '',
            selectedEditingTagOptionKey: null,
            selectedLiveTagOptionKey: null,
            markdownVal: '',
            videoVal: '',
            edited: false,
            botFrameworkAppsVal: [],
            newBotVal: '',
            debugErrorsOpen: false,
            isLoggingOnVal: true,
            isPackageExpandoOpen: false,
            isSettingsExpandoOpen: false
        }
    }

    updateAppState(app: AppBase) {
        this.setState({
            localeVal: app.locale,
            appIdVal: app.appId,
            appNameVal: app.appName,
            selectedEditingTagOptionKey: this.props.editingPackageId,
            selectedLiveTagOptionKey: app.livePackageId,
            markdownVal: app.metadata ? app.metadata.markdown : null,
            videoVal: app.metadata ? app.metadata.video : null,
            botFrameworkAppsVal: app.metadata.botFrameworkApps,
            isLoggingOnVal: (app.metadata.isLoggingOn !== false),   // For backward compatibility to cover undefined
            newBotVal: ''
        })
    }
    componentDidMount() {
        this.updateAppState(this.props.app)
    }

    componentDidUpdate() {
        let app = this.props.app
        if (this.state.edited == false && (this.state.localeVal !== app.locale ||
            this.state.appIdVal !== app.appId ||
            this.state.appNameVal !== app.appName ||
            this.state.markdownVal !== app.metadata.markdown ||
            this.state.videoVal !== app.metadata.video ||
            this.state.botFrameworkAppsVal !== app.metadata.botFrameworkApps ||
            this.state.isLoggingOnVal !== (app.metadata.isLoggingOn !== false))) {  // For backward compatibility to cover undefined
            this.updateAppState(this.props.app)
        }
    }

    @autobind
    onChangedName(text: string) {
        this.setState({
            appNameVal: text,
            edited: true
        })
    }

    @autobind
    onChangedBotId(text: string) {
        this.setState({
            newBotVal: text,
            edited: true
        })
    }

    @autobind
    onChangedMarkdown(text: string) {
        this.setState({
            markdownVal: text,
            edited: true
        })
    }

    @autobind
    onChangedVideo(text: string) {
        this.setState({
            videoVal: text,
            edited: true
        })
    }

    @autobind
    onClickAddBot() {
        let newBotApps = this.state.botFrameworkAppsVal.concat(this.state.newBotVal);
        this.setState({
            botFrameworkAppsVal: newBotApps,
            newBotVal: ''
        })
    }

    @autobind
    onToggleLoggingOn() {
        this.setState({
            isLoggingOnVal: !this.state.isLoggingOnVal,
            edited: true
        })
    }

    @autobind
    onRenderBotListRow(item?: any, index?: number) {
        return (
            <div>
                <OF.TextField className={OF.FontClassNames.mediumPlus} disabled={true} value={item} />
            </div>
        )
    }

    @autobind
    onClickDiscard() {
        let app = this.props.app
        this.setState({
            localeVal: app.locale,
            appIdVal: app.appId,
            appNameVal: app.appName,
            markdownVal: app.metadata ? app.metadata.markdown : null,
            videoVal: app.metadata ? app.metadata.video : null,
            botFrameworkAppsVal: app.metadata.botFrameworkApps,
            isLoggingOnVal: app.metadata.isLoggingOn,
            edited: false,
            newBotVal: ''
        })
    }

    @autobind
    onClickSave() {
        let app = this.props.app
        let modifiedApp: AppBase = {
            ...app,
            appName: this.state.appNameVal,
            metadata: {
                botFrameworkApps: this.state.botFrameworkAppsVal,
                markdown: this.state.markdownVal,
                video: this.state.videoVal,
                isLoggingOn: this.state.isLoggingOnVal
            },
            // packageVersions: DON'T SEND
            // devPackageId: DON'T SEND
            trainingFailureMessage: undefined,
            trainingStatus: TrainingStatusCode.Completed,
            datetime: new Date()
        }
        this.props.editApplicationAsync(modifiedApp)
        this.setState({
            localeVal: app.locale,
            appIdVal: app.appId,
            appNameVal: app.appName,
            markdownVal: app.metadata ? app.metadata.markdown : null,
            videoVal: app.metadata ? app.metadata.video : null,
            botFrameworkAppsVal: app.metadata.botFrameworkApps,
            isLoggingOnVal: app.metadata.isLoggingOn,
            edited: false,
            newBotVal: ''
        })
    }

    onGetNameErrorMessage(value: string): string {
        const { intl } = this.props
        if (value.length === 0) {
            return intl.formatMessage(messages.fieldErrorRequired)
        }

        if (!/^[a-zA-Z0-9- ]+$/.test(value)) {
            return intl.formatMessage(messages.fieldErrorAlphanumeric)
        }

        // Check that name isn't in use
        let foundApp = this.props.apps.find(a => (a.appName === value && a.appId !== this.props.app.appId));
        if (foundApp) {
            return intl.formatMessage(messages.fieldErrorDistinct)
        }

        return ''
    }

    onCloseDebugErrors() {
        this.setState({
            debugErrorsOpen: false
        })
    }

    onOpenDebugErrors() {
        this.setState({
            debugErrorsOpen: true
        })
    }

    onChangedEditingTag = (editingOption: OF.IDropdownOption) => {
        this.props.editAppEditingTagThunkAsync(this.props.app.appId, editingOption.key as string)
        this.setState({
            selectedEditingTagOptionKey: editingOption.key,
        })
    }

    onChangedLiveTag = (liveOption: OF.IDropdownOption) => {
        this.props.editAppLiveTagThunkAsync(this.props.app.appId, liveOption.key as string)
        this.setState({
            selectedLiveTagOptionKey: liveOption.key,
        })
    }

    @autobind
    onExport() {
        ((this.props.fetchAppSourceThunkAsync(this.props.app.appId, this.props.editingPackageId, false) as any) as Promise<AppDefinition>)
            .then(appDefinition => {
                let appDefJSON = JSON.stringify(appDefinition)
                let blob = new Blob([appDefJSON], {type: "text/plain;charset=utf-8"});
                saveAs(blob, `${this.props.app.appName}.cl`);
            })
            .catch(error => {
                console.warn(`Error when attempting export application `, error)
            })
    }

    packageOptions() {
        let packageReferences = util.packageReferences(this.props.app);

        return Object.values(packageReferences)
            .map<OF.IDropdownOption>(pr => {
                return {
                    key: pr.packageId,
                    text: pr.packageVersion
                }
            })
    }

    render() {
        const { intl } = this.props
        let options = [{
            key: this.state.localeVal,
            text: this.state.localeVal,
        }]
        let packageOptions = this.packageOptions();
        return (
            <div className="cl-page">
                <span className={OF.FontClassNames.xxLarge}>
                    <FormattedMessage
                        id={FM.SETTINGS_TITLE}
                        defaultMessage="Settings"
                    />
                </span>
                <span className={OF.FontClassNames.mediumPlus}>
                    <FormattedMessage
                        id={FM.SETTINGS_SUBTITLE}
                        defaultMessage="Control your application version tags and other application configuration"
                    />
                </span>
                <div className="cl-settings-fields">
                    <OF.TextField
                        className={OF.FontClassNames.mediumPlus}
                        onChanged={(text) => this.onChangedName(text)}
                        label={intl.formatMessage({
                            id: FM.SETTINGS_FIELDS_NAMELABEL,
                            defaultMessage: 'Name'
                        })}
                        onGetErrorMessage={value => this.onGetNameErrorMessage(value)}
                        value={this.state.appNameVal}
                    />
                    <div className="cl-modal-buttons_primary">
                        <OF.PrimaryButton
                            onClick={this.onExport}
                            ariaDescription={intl.formatMessage({
                                id: FM.SETTINGS_EXPORTBUTTONARIALDESCRIPTION,
                                defaultMessage: 'Export Application to a file'
                            })}
                            text={intl.formatMessage({
                                id: FM.SETTINGS_EXPORTBUTTONTEXT,
                                defaultMessage: 'Export'
                            })}
                        />
                    </div>
                    <OF.TextField
                        className={OF.FontClassNames.mediumPlus}
                        disabled={true}
                        label='CONVERSATION_LEARNER_APP_ID'
                        value={this.state.appIdVal}
                    />
                    <div>
                        <OF.Label className={OF.FontClassNames.mediumPlus}>
                            LUIS_SUBSCRIPTION_KEY
                            <HelpIcon 
                                tipType={ToolTip.TipType.LUIS_SUBSCRIPTION_KEY} 
                            />
                        </OF.Label>
                        <div>
                            <a href={`https://www.luis.ai/applications/${this.props.app.luisAppId}/versions/0.1/publish`} target="_blank">
                                <OF.DefaultButton
                                    iconProps={{ iconName: "OpenInNewWindow" }}
                                    ariaDescription="Go to LUIS"
                                    text="Go to LUIS"
                                />
                            </a>
                        </div>
                    </div>
                    <div className="cl-command-bar">
                        <TC.Dropdown
                            label="Editing Tag"
                            options={packageOptions}
                            onChanged={acionTypeOption => this.onChangedEditingTag(acionTypeOption)}
                            selectedKey={this.state.selectedEditingTagOptionKey}
                            tipType={ToolTip.TipType.TAG_EDITING}
                        />
                        <TC.Dropdown
                            label="Live Tag"
                            options={packageOptions}
                            onChanged={acionTypeOption => this.onChangedLiveTag(acionTypeOption)}
                            selectedKey={this.state.selectedLiveTagOptionKey}
                            tipType={ToolTip.TipType.TAG_LIVE}
                        />
                    </div>


                    <Expando
                        className={'cl-settings-container-header'}
                        isOpen={this.state.isPackageExpandoOpen}
                        text="Version Tags"
                        onToggle={() => this.setState({ isPackageExpandoOpen: !this.state.isPackageExpandoOpen })}
                    />
                    {this.state.isPackageExpandoOpen &&
                        <PackageTable
                            app={this.props.app}
                            editingPackageId={this.props.editingPackageId}
                        />
                    }

                    <div>
                        <OF.Label className={OF.FontClassNames.mediumPlus}>
                            <FormattedMessage
                                id={FM.SETTINGS_BOTFRAMEWORKLOCALELABEL}
                                defaultMessage="Locale"
                            />
                        </OF.Label>
                        <OF.Dropdown
                            className={OF.FontClassNames.mediumPlus}
                            options={options}
                            selectedKey={this.state.localeVal}
                            disabled={true}
                        />
                    </div>
                    <div className="cl-entity-creator-checkbox">
                        <TC.Checkbox
                            label={intl.formatMessage({
                                id: FM.SETTINGS_LOGGINGON_LABEL,
                                defaultMessage: 'Log Conversations'
                            })}
                            checked={this.state.isLoggingOnVal}
                            onChange={this.onToggleLoggingOn}
                            tipType={ToolTip.TipType.LOGGING_TOGGLE}
                        />
                    </div>

                    {this.props.user.id === CL_DEMO_ID &&
                        <React.Fragment>
                            <div>
                                <OF.TextField
                                    className={OF.FontClassNames.mediumPlus}
                                    onChanged={(text) => this.onChangedMarkdown(text)}
                                    label={intl.formatMessage({
                                        id: FM.SETTINGS_FIELDS_MARKDOWNLABEL,
                                        defaultMessage: 'Markdown'
                                    })}
                                    value={this.state.markdownVal}
                                    multiline={true}
                                    rows={5}
                                />
                                <OF.TextField
                                    className={OF.FontClassNames.mediumPlus}
                                    onChanged={(text) => this.onChangedVideo(text)}
                                    label={intl.formatMessage({
                                        id: FM.SETTINGS_FIELDS_VIDEOLABEL,
                                        defaultMessage: 'Video'
                                    })}
                                    value={this.state.videoVal}
                                />
                            </div>
                            <div>
                                <OF.DefaultButton
                                    onClick={() => this.onOpenDebugErrors()}
                                    ariaDescription={intl.formatMessage(messages.discard)}
                                    text={'Inject Errors'}
                                />
                            </div>
                        </React.Fragment>
                    }

                    <div className="cl-modal-buttons_primary">
                        <OF.PrimaryButton
                            disabled={this.state.edited === false || this.onGetNameErrorMessage(this.state.appNameVal) !== ''}
                            onClick={this.onClickSave}
                            ariaDescription={intl.formatMessage(messages.saveChanges)}
                            text={intl.formatMessage(messages.saveChanges)}
                        />
                        <OF.DefaultButton
                            disabled={this.state.edited === false}
                            onClick={this.onClickDiscard}
                            ariaDescription={intl.formatMessage(messages.discard)}
                            text={intl.formatMessage(messages.discard)}
                        />
                    </div>
                    
                    <ErrorInjectionEditor
                        open={this.state.debugErrorsOpen}
                        onClose={() => this.onCloseDebugErrors()}
                    />
                </div>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        editApplicationAsync,
        editAppEditingTagThunkAsync,
        editAppLiveTagThunkAsync,
        fetchAppSourceThunkAsync
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        apps: state.apps.all
    }
}

export interface ReceivedProps {
    app: AppBase,
    editingPackageId: string
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(Settings))