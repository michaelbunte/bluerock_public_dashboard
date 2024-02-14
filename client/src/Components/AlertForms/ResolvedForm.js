import {Inputs, Button} from 'adminlte-2-react';
import alertFormsEng from '../../StaticData/alertFormsEng.json'
import MyCheckBox from '../MyCheckBox'
import { useState } from 'react';
import './form_style.css'
const {Text} = Inputs;

function ResolvedForm() {
    const [formData, setFormData] = useState({
        checkboxes: {
            alerts: new Array(6).fill(false),
            resolutionDetails: new Array(2).fill(false),
            replacementDetails: new Array(3).fill(false),
            recipientGroups: new Array(alertFormsEng.RecipientGroups2.length).fill(false),
        },
        customDetail: "",
        daysLeft: "",
        resolutionDate: ""
    });

    const handleCheckBoxChange = (event) => {
        const {checked, id} = event.target;
        const checkbox_type = id.split('_')[0];
        const checkbox_idx  = parseInt(id.split('_')[1]);
        setFormData(prevState => ({
            ...prevState,
            checkboxes: {
              ...prevState.checkboxes,
              [checkbox_type]: [
                ...prevState.checkboxes[checkbox_type].slice(0, checkbox_idx),
                checked,
                ...prevState.checkboxes[checkbox_type].slice(checkbox_idx + 1)
              ]
            }
        }));
    };

    const handleOtherChange = (event) => {
        setFormData(prevState => ({
            ...prevState,
            [event.target.id]: event.target.value
        }))
    }

    const alertDetails = alertFormsEng.Resolved.AlertDetails.map(
        (text, index) => <MyCheckBox 
            text={text}
            id ={`alerts_${index}`}
            key={`alerts_${index}`}
            onChange={handleCheckBoxChange}
        />
    );
    
    alertDetails.push(<MyCheckBox 
        text= { 
            <Text 
                placeholder="Custom Detail" 
                labelPosition="none" 
                id="customDetail"
                onChange={handleOtherChange}
                disabled={ ! formData.checkboxes.alerts[formData.checkboxes.alerts.length -1 ]}
            />}
        id={`alerts_${alertDetails.length}`}
        key={`alerts_${alertDetails.length}`}
        onChange={handleCheckBoxChange}    
        />
    );

    const replacementDetails = alertFormsEng.Resolved.ReplacementDetails.map(
        (text, index) => 
            <MyCheckBox 
                text={text}
                id={`replacementDetails_${index}`}
                key={`replacementDetails_${index}`}
                onChange={handleCheckBoxChange}
            />
    );
    const recipientGroups = alertFormsEng.RecipientGroups2.map(
        (text,index) => 
            <MyCheckBox 
                text={text}
                id={`recipientGroups_${index}`}
                key={`recipientGroups_${index}`}
                onChange={handleCheckBoxChange}
            />
    );
    const resolutionDetails = [
        <MyCheckBox 
            text={
                <div>
                    <div>{alertFormsEng.Resolved.ResolutionDetails[0]}</div>
                        <Text 
                            labelPosition="none" 
                            placeholder="number"
                            id="daysLeft"
                            onChange={handleOtherChange}
                            disabled={ ! formData.checkboxes.resolutionDetails[0]}
                        />
                    <div>{alertFormsEng.Resolved.ResolutionDetails[1]}</div>
                </div>
            }
            id={`resolutionDetails_0`}
            key={`resolutionDetails_0`}
            onChange={handleCheckBoxChange}
            />,
        <MyCheckBox 
            text={alertFormsEng.Resolved.ResolutionDetails[2]}
            id={`resolutionDetails_1`}    
            key={`resolutionDetails_1`}    
            onChange={handleCheckBoxChange}
        />
    ];
    return (
        <form className="form_style">
            <h4><b>Alert Details</b></h4>
            {alertDetails}
            <h4><b>Resolution Details</b></h4>
            <p>Date:</p>
            <Text
                labelPosition="none"
                id="resolutionDate"
                onChange={handleOtherChange}
            />
            {resolutionDetails}
            <h4><b>Replacement Details</b></h4>
            {replacementDetails}
            <h4><b>Recipient Groups</b></h4>
            {recipientGroups}
            <Button 
                text="submit"
                type="primary"
            />
        </form>
    );
}

export default ResolvedForm