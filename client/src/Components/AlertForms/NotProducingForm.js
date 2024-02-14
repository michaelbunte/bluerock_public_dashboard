import {Inputs, Button} from 'adminlte-2-react';
import alertFormsEng from '../../StaticData/alertFormsEng.json'
import MyCheckBox from '../MyCheckBox'
import { useState } from 'react';
import './form_style.css'
const {Text} = Inputs;

function NotProducingForm() {
    const [formData, setFormData] = useState({
        checkboxes: {
            alerts: new Array(6).fill(false),
            responseDetails: new Array(2).fill(false),
            replacementDetails: new Array(3).fill(false),
            recipientGroups: new Array(alertFormsEng.RecipientGroups1.length).fill(false),
        },
        customDetail: "",
        daysLeft: ""
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

    const alertDetails = alertFormsEng.NotProducing.AlertDetails.map(
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
                disabled={ ! formData.checkboxes.alerts[formData.checkboxes.alerts.length-1]}
                onChange={handleOtherChange}
            />}
        id={`alerts_${alertDetails.length}`}
        key={`alerts_${alertDetails.length}`}
        onChange={handleCheckBoxChange}    
        />
    );

    const replacementDetails = alertFormsEng.NotProducing.ReplacementDetails.map(
        (text, index) => 
            <MyCheckBox 
                text={text}
                id={`replacementDetails_${index}`}
                key={`replacementDetails_${index}`}
                onChange={handleCheckBoxChange}
            />
    );
    const recipientGroups = alertFormsEng.RecipientGroups1.map(
        (text,index) => 
            <MyCheckBox 
                text={text}
                id={`recipientGroups_${index}`}
                key={`recipientGroups_${index}`}
                onChange={handleCheckBoxChange}
            />
    );
    const responseDetails = [
        <MyCheckBox 
            text={
                <div>
                    <div>{alertFormsEng.NotProducing.ResponseDetails[0]}</div>
                        <Text 
                            labelPosition="none" 
                            placeholder="number"
                            id="daysLeft"
                            onChange={handleOtherChange}
                            disabled={ ! formData.checkboxes.responseDetails[0]}
                        />
                    <div>{alertFormsEng.NotProducing.ResponseDetails[1]}</div>
                </div>
            }
            id={`responseDetails_0`}
            key={`responseDetails_0`}
            onChange={handleCheckBoxChange}
            />,
        <MyCheckBox 
            text={alertFormsEng.NotProducing.ResponseDetails[2]}
            id={`responseDetails_1`}    
            key={`responseDetails_1`}    
            onChange={handleCheckBoxChange}
        />
    ];
    return (
        <form className="form_style">
            <h4><b>Alert Details</b></h4>
            {alertDetails}
            <h4><b>Response Details</b></h4>
            {responseDetails}
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

export default NotProducingForm