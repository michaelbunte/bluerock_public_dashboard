import {Box, Inputs, Button} from 'adminlte-2-react';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import TextArea from '../TextArea';
import MyCheckBox from '../MyCheckBox'
import { useState } from 'react';
const {Text} = Inputs;


function DailyMonitoringForm() {
    const userName = "USERNAME"; // TODO: make this be actual username
    const [date, setDate] = useState(new Date());
    const [comments, setComments] = useState("");
    
    /*
    For some reason, the library's <DateTime/> component didn't seem to be 
    functional, hence why I am using 'react-datetime-picker'.
    This isn't great for consistency, but it doesn't look *too* bad.
    */

    const onSubmit = (event) => {
        // TODO: submit to API
    }

    return(
        <Box title="Daily Monitoring Form">
            <form>
                <h5><b>Name</b></h5>
                <Text
                    labelPosition="none"
                    value={userName}
                    disabled={true}
                />
                <h5><b>Date & Time</b></h5>
                <DateTimePicker 
                    onChange={setDate} value={date} 
                />
                <h5><b>Comments</b></h5>
                <TextArea
                    onChange={(event)=>{setComments(event.target.value)}}
                />
                <div style={{padding:"20px 0px 10px 0px"}}>
                    <Button 
                        text="submit"
                        onClick={onSubmit}
                        type="primary"
                    />
                </div>
            </form>
        </Box>
    )
}

export default DailyMonitoringForm;