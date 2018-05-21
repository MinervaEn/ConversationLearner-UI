/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { getLuisApplicationCultures } from '../../epics/apiHelpers'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import * as OF from 'office-ui-fabric-react'
import { State } from '../../types'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl'
import { AppInput } from '../../types/models';

const messages = defineMessages({
    fieldErrorRequired: {
        id: FM.APPCREATOR_FIELDERROR_REQUIREDVALUE,
        defaultMessage: "Required Value"
    },
    fieldErrorAlphanumeric: {
        id: FM.APPCREATOR_FIELDERROR_ALPHANUMERIC,
        defaultMessage: 'Application name may only contain alphanumeric characters'
    },
    fieldErrorDistinct: {
        id: FM.APPCREATOR_FIELDERROR_DISTINCT,
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
})

interface ComponentState {
    appNameVal: string
    localeVal: string
    localeOptions: OF.IDropdownOption[],
}

class AppCreator extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        appNameVal: '',
        localeVal: '',
        localeOptions: [],
    }

    constructor(p: Props) {
        super(p)

        this.onKeyDown = this.onKeyDown.bind(this)
        this.localeChanged = this.localeChanged.bind(this)
        this.onClickCreate = this.onClickCreate.bind(this)
        this.onClickCancel = this.onClickCancel.bind(this)
    }

    componentDidMount() {
        getLuisApplicationCultures()
            .then(cultures => {
                const cultureOptions = cultures.map<OF.IDropdownOption>(c =>
                    ({
                        key: c.cultureCode,
                        text: c.cultureCode,
                    }))

                this.setState({
                    localeOptions: cultureOptions,
                    localeVal: cultureOptions[0].text
                })
            })
    }

    componentWillReceiveProps(nextProps: Props) {
        // Reset when opening modal
        if (this.props.open === false && nextProps.open === true) {
            let firstValue = this.state.localeOptions[0].text
            this.setState({
                appNameVal: '',
                localeVal: firstValue,
            })
        }
    }

    nameChanged(text: string) {
        this.setState({
            appNameVal: text
        })
    }
    localeChanged(obj: OF.IDropdownOption) {
        this.setState({
            localeVal: obj.text
        })
    }

    onClickCancel() {
        this.props.onCancel()
    }

    onClickCreate() {
        const appToAdd: AppInput = {
            appName: this.state.appNameVal,
            locale: this.state.localeVal,
            metadata: {
                botFrameworkApps: [],
                markdown: null,
                video: null,
                isLoggingOn: true
            }
        }

        this.props.onSubmit(appToAdd)
    }

    // TODO: Refactor to use default form submission instead of manually listening for keys
    // Also has benefit of native browser validation for required fields
    onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
        // On enter attempt to create the app if required fields are set
        if (event.keyCode === 13 && this.state.appNameVal) {
            this.onClickCreate();
        }
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
        let foundApp = this.props.apps.find(a => a.appName == value)
        if (foundApp) {
            return intl.formatMessage(messages.fieldErrorDistinct)
        }

        return ""
    }

    onGetPasswordErrorMessage(value: string): string {
        return value ? "" : this.props.intl.formatMessage(messages.fieldErrorRequired);
    }

    render() {
        const { intl } = this.props
        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={() => this.onClickCancel()}
                isBlocking={false}
                containerClassName='cl-modal cl-modal--small'
            >
                <div className='cl-modal_header'>
                    <span className={OF.FontClassNames.xxLarge}>
                        <FormattedMessage
                            id={FM.APPCREATOR_TITLE}
                            defaultMessage="Create a Conversation Learner App"
                        />
                    </span>
                </div>
                <div>
                    <OF.TextField
                        data-testid="app-create-input-name"
                        onGetErrorMessage={value => this.onGetNameErrorMessage(value)}
                        onChanged={text => this.nameChanged(text)}
                        label={intl.formatMessage({
                            id: FM.APPCREATOR_FIELDS_NAME_LABEL,
                            defaultMessage: "Name"
                        })}
                        placeholder={intl.formatMessage({
                            id: FM.APPCREATOR_FIELDS_NAME_PLACEHOLDER,
                            defaultMessage: "Application Name..."
                        })}
                        onKeyDown={key => this.onKeyDown(key)}
                        value={this.state.appNameVal} />
                    <OF.Dropdown
                        label={intl.formatMessage({
                            id: FM.APPCREATOR_FIELDS_LOCALE_LABEL,
                            defaultMessage: 'Locale'
                        })}
                        defaultSelectedKey={this.state.localeVal}
                        options={this.state.localeOptions}
                        onChanged={this.localeChanged}
                        disabled={true}
                        /* Disabled until trainer can support more than english */
                    />
                </div>
                <div className='cl-modal_footer'>
                    <div className="cl-modal-buttons">
                        <div className="cl-modal-buttons_primary">
                            <OF.PrimaryButton
                                data-testid="app-create-button-submit"
                                disabled={!this.state.appNameVal}
                                onClick={this.onClickCreate}
                                ariaDescription={intl.formatMessage({
                                    id: FM.APPCREATOR_CREATEBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Create'
                                })}
                                text={intl.formatMessage({
                                    id: FM.APPCREATOR_CREATEBUTTON_TEXT,
                                    defaultMessage: 'Create'
                                })}
                            />
                            <OF.DefaultButton
                                onClick={this.onClickCancel}
                                ariaDescription={intl.formatMessage({
                                    id: FM.APPCREATOR_CANCELBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Cancel'
                                })}
                                text={intl.formatMessage({
                                    id: FM.APPCREATOR_CANCELBUTTON_TEXT,
                                    defaultMessage: 'Cancel'
                                })}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        apps: state.apps.all
    }
}

export interface ReceivedProps {
    open: boolean
    onSubmit: (app: AppInput) => void
    onCancel: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(AppCreator))