import {Inputs, Button} from 'adminlte-2-react';
import alertFormsEng from '../../StaticData/alertFormsEng.json'
import MyCheckBox from '../MyCheckBox'
import './form_style.css'
import { useState } from 'react';
const {Text} = Inputs;


function BacteriaForm() {
    const [formData, setFormData] = useState({
        recipientGroups: new Array(alertFormsEng.RecipientGroups2.length).fill(false),
        dateOfTest: "",
        dateOfExpectedRepair: ""
    });

    const handleChange = (event) => {
        const {checked, id} = event.target;
        const checkbox_type = id.split('_')[0];
        if (checkbox_type === 'recipientGroups') {
            const checkbox_idx  = parseInt(id.split('_')[1]);
            setFormData(prevState => ({
                ...prevState,
                recipientGroups: prevState.recipientGroups.map((item, index) =>
                    index === checkbox_idx ? checked : item)
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [event.target.id]: event.target.value
            }))
        }
    };

    const recipientGroups = alertFormsEng.RecipientGroups2.map(
        (text,index) => 
            <MyCheckBox 
                text={text}
                id={`recipientGroups_${index}`}
                key={`recipientGroups_${index}`}
                onChange={handleChange}
            />
    );

    return(
        <form className="form_style">
            <h4><b>Above Standard Bacteria Form</b></h4>
            <p>{alertFormsEng.BacteriaForm[0]}</p>
            <Text
                labelPosition="none"
                placeholder="Date of test"
                id="dateOfTest"
                onChange={handleChange}
            />
            <p>{alertFormsEng.BacteriaForm[1]}</p>
            <Text
                labelPosition="none"
                placeholder="Date of expected repair"
                id="dateOfExpectedRepair"
                onChange={handleChange}
            />
            <h4><b>Recipient Groups</b></h4>
            {recipientGroups}
            <Button 
                text="submit"
                type="primary"
            />
        </form>
    )
}

export default BacteriaForm