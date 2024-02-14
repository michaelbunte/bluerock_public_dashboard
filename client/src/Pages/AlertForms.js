import { Box, Col, Row, Content, Tabs, TabContent, Inputs, Button} from 'adminlte-2-react';
import CenteredBox from '../Components/CenteredBox';
import NotProducingForm from '../Components/AlertForms/NotProducingForm';
import HighNitrates from '../Components/AlertForms/HighNitratesForm';
import BacteriaForm from '../Components/AlertForms/BacteriaForm';
import ContaminationForm from '../Components/AlertForms/ContaminationForm';
import ResolvedForm from '../Components/AlertForms/ResolvedForm';
function AlertForms() {
    console.log(TabContent)
    return (

        <Content 
        title="Alert Forms" 
        browserTitle="Alert Forms"
        >
            <CenteredBox>
                <Row>
                    <Col md={12}>
                        <Tabs defaultActiveKey="tab1">
                            <TabContent eventKey="tab1" title="Not Producing">
                                <NotProducingForm/>
                            </TabContent>
                            <TabContent eventKey="tab2" title="High Nitrates">
                                <HighNitrates/>
                            </TabContent>
                            <TabContent eventKey="tab3" title="Bacteria">
                                <BacteriaForm/>
                            </TabContent>
                            <TabContent eventKey="tab4" title="Contamination">
                                <ContaminationForm/>
                            </TabContent>
                            <TabContent eventKey="tab5" title="Resolved">
                                <ResolvedForm/>
                            </TabContent>
                        </Tabs>
                    </Col>
                </Row>
            </CenteredBox>
        </Content>
    );
}

export default AlertForms