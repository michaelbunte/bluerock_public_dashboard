import { useState } from 'react';
import {Box, Col, Row, Content, Inputs, Button, Callout } from 'adminlte-2-react';
import TextArea from '../Components/TextArea';
import CenteredBox from '../Components/CenteredBox';
import { isValidEmail } from '../Utility/functions';
const {Text} = Inputs;

function ContactForm() {
    const [info, setInfo] = useState({
        name: "",
        email: "",
        subject: "",
        inquiry: ""
    })
    const [error, setError] = useState("");
    const [hasSubmitted, setHasSubmitted] = useState(false);

    function handleChange(event) {
        setInfo({
            ...info,
            [event.target.name]: event.target.value
          });
        setHasSubmitted(false);
    }

    function handleSubmit(event) {
        setHasSubmitted(false);
        const isEmptyStringPresent = Object.values(info).includes("");
        if (isEmptyStringPresent) {
            setError("Please fill all fields");
            return;
        }

        if ( ! isValidEmail(info["email"])) {
            setError("invalid email");
            return;
        }

        // TODO: SUBMIT TO API
        
        setError("");
        setHasSubmitted(true);
    }

    return (
        <CenteredBox title="Submit Inquiry?" closeable collapsable type="primary">
            <Row>
                <Col xs={12}>
                    <form>
                        <Text 
                            name="name" 
                            labelPosition="none" 
                            placeholder="Name"
                            onChange={handleChange}
                        />
                        <Text 
                            name="email" 
                            labelPosition="none" 
                            placeholder="Email"
                            onChange={handleChange}
                        />
                        <Text 
                            name="subject" 
                            labelPosition="none" 
                            placeholder="Subject"
                            onChange={handleChange}
                        />
                        <TextArea 
                            name="inquiry" 
                            placeholder="Your Inquiry"
                            onChange={handleChange}
                        />
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
                            type="primary" 
                            value="Submit"
                            onClick={handleSubmit}
                        />
                    </form>
                </Col>
            </Row>
        </CenteredBox>
    )
}

function FAQnContact() {
    return (
        <Content title="Frequently Asked Questions" browserTitle="About SVWaterNet" >
            <Row>
                <Col md={12}>
                    <ContactForm/>
                </Col>
            </Row>
        </Content>
    );
}

export default FAQnContact