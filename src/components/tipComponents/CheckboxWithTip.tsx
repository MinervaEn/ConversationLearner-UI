/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { connect } from 'react-redux';
import { TipType } from '../../components/ToolTips';
import HelpIcon from '../HelpIcon'
import * as OF from 'office-ui-fabric-react';

class CheckboxWithTip extends OF.BaseComponent<ICheckboxWithTipProps, OF.ICheckboxState> {
    constructor(props: ICheckboxWithTipProps) {
        super(props)
    }
    render() {
        return (
            <div
                data-testid={this.props['data-testid']}
            >
                <OF.Checkbox
                    className="cl-tip"
                    checked={this.props.checked}
                    onChange={this.props.onChange}
                    style={{ marginTop: '1em', display: 'inline-block' }}
                    disabled={this.props.disabled}
                    label={this.props.label}
                />
                <HelpIcon tipType={this.props.tipType} />
            </div>
        )
    }
}

export interface ICheckboxWithTipProps extends OF.ICheckboxProps {
    tipType: TipType
}

export default connect<ICheckboxWithTipProps>(null, null)(CheckboxWithTip);