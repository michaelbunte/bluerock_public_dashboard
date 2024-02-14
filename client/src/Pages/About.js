import {Col, Row, Content} from 'adminlte-2-react';
import BulletListChip from '../Components/BulletListChip'
import aboutLinks from '../StaticData/aboutLinksEnglish.json'

function About() {
    return (
        <Content title="About SVWaterNet" browserTitle="About SVWaterNet">
            <Row>
                <Col md={12}>
                    <BulletListChip title="Information about this project:" links={aboutLinks.aboutLinks}/>
                </Col>
            </Row>
        </Content>
    );
}

export default About