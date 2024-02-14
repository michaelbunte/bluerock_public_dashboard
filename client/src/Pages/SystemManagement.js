import {Col, Row, Content} from 'adminlte-2-react';

import DailyMonitoringForm from "../Components/SystemManagement/DailyMonitoringForm";
import MonitoringSchedule from "../Components/SystemManagement/MonitoringSchedule";
import AlarmUpdateChip from "../Components/SystemManagement/AlarmUpdateChip";
import CommentHistory from '../Components/SystemManagement/CommentHistory';

function SystemManagement(props) {

    return (
        <Content title="System Management" browserTitle="About SVWaterNet">
            <Row>
                <Col sm={12} md={6}>
                    <DailyMonitoringForm/>
                </Col>
                <Col sm={12} md={6}>
                    <MonitoringSchedule/>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <AlarmUpdateChip/>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <CommentHistory/>
                </Col>
            </Row>
        </Content>
    )
}

export default SystemManagement;