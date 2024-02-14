import { Col, Row, Content, Button, Inputs, Callout} from 'adminlte-2-react';
import TextArea from '../Components/TextArea';
import MyCheckBox from '../Components/MyCheckBox';
import CenteredBox from '../Components/CenteredBox';
import { useState } from 'react';
import { isValidEmail, isValidPhoneNumber } from '../Utility/functions';

const {Text} = Inputs;


function ContactForm(props) {
    const [formData, setFormData] = useState({
        email: "",
        phoneNumber: "",
        message: "",
        updateCheckbox: false,
        file: null
    });

    const [error, setError] = useState("");
    const [hasSubmitted, setHasSubmitted] = useState(false);


    const updateFormData = (event) => {
        setHasSubmitted(false);
        const {value, id} = event.target;
        if (id === "updateCheckbox") {
            setFormData((prevFormData) => ({
                ...prevFormData,
                updateCheckbox: event.target.checked
            }))
            return;
        } else if (id === "upload") {
            setFormData((prevFormData) => ({
                ...prevFormData,
                file: event.target.files[0]
            }))
            return;
        }
        setFormData((prevFormData) => ({
            ...prevFormData,
            [id] : value
        }))
    }

    const handleSubmit = (event) => {
        setHasSubmitted(false);
        const empty_strings = [
                formData.email, 
                formData.phoneNumber, 
                formData.message
            ].filter((str) => str === "");
        if (empty_strings.length !== 0) {
            setError("Please fill out all fields")
            return;
        }
        else if ( ! isValidPhoneNumber(formData.phoneNumber) ) {
            setError("Please enter a valid phone number")
            return;
        }
        else if ( ! isValidEmail(formData.email) ) {
            setError("Please enter a valid email address")
            return;
        }
        
        // TODO: actually submit to API

        setHasSubmitted(true)
        setError("");
    }

    return (
        <CenteredBox title="Contact Form" type="primary">
            <Row>
                <Col xs={12}>
                    <form>
                        <Text
                            labelPosition="none"
                            placeholder="Email"
                            id="email"
                            onChange={updateFormData}
                        />
                        <Text
                            labelPosition="none"
                            placeholder="Phone Number"
                            id="phoneNumber"
                            onChange={updateFormData}
                        />
                        <TextArea
                            placeholder="Message"
                            id="message"
                            onChange={updateFormData}
                        />
                        <div style={{padding: "10px 0px "}}>
                            <input 
                                type="file"
                                id="upload"
                                onChange={updateFormData}
                            />
                            <p style={{color: "grey"}}>
                                You can upload photos
                            </p>
                            <MyCheckBox 
                                text="Send me updates about my inquiry"
                                id="updateCheckbox"
                                onChange={updateFormData}
                            />
                        </div>
                        {error ? <Callout 
                            title={error} 
                            type="danger"
                        />:null}
                        {hasSubmitted ? <Callout 
                            title={"Form has been successfully submitted"}
                            type="success"
                        />:null}
                        <Button
                            text="Submit"
                            onClick={handleSubmit}
                            type="primary"
                        />
                    </form>
                </Col>
            </Row>
        </CenteredBox>
    );
}

function Information() {
    return (
        <Content title="Contact Us" subTitle="Questions & Comments" browserTitle="Contact Us">
            <Row>
                <Col md={12}>
                    <ContactForm/>
                </Col>
            </Row>
        </Content>
    );
}

export default Information