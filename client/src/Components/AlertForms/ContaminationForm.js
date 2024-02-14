import {Inputs, Button} from 'adminlte-2-react';
import alertFormsEng from '../../StaticData/alertFormsEng.json'
import MyCheckBox from '../MyCheckBox'
import './form_style.css'
import { useState } from 'react';
const {Text} = Inputs;

function ContaminationForm() {
    const [formData, setFormData] = useState({
        recipientGroups: new Array(alertFormsEng.RecipientGroups2.length).fill(false),
        testQuestions: new Array(alertFormsEng.ContaminationForm.Questions.length).fill("")
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
        } else if (checkbox_type === 'testQuestions') {
            const checkbox_idx  = parseInt(id.split('_')[1]);
            setFormData(prevState => ({
                ...prevState,
                testQuestions: prevState.testQuestions.map((item, index) =>
                    index === checkbox_idx ? event.target.value : item)
            }));
        }
    };

    let test_questions = alertFormsEng.ContaminationForm.Questions.map(
        (text, index) => (
            <div>
                <p>{text}</p>
                <Text
                    labelPosition="none"
                    placeholder={alertFormsEng.ContaminationForm.Placeholders[index]}
                    id ={`testQuestions_${index}`}
                    key={`testQuestions_${index}`}
                    onChange={handleChange}
                />
            </div>
        )
    )
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
            <h4><b>Contamination Details</b></h4>
            {test_questions}
            <h4><b>Recipient Groups</b></h4>
            {recipientGroups}
            <Button 
                text="submit"
                type="primary"
            />
        </form>
    )
}

export default ContaminationForm