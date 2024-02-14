
import { Box, Col, Row, Content, SmartTable, Inputs, Button } from 'adminlte-2-react';
import MyCheckBox from '../Components/MyCheckBox';

const {
    Text, Date, DateRange, ICheck, Select2, DateTime,
} = Inputs;


function SampleUploadPanel(props) {
    return (
        <Box title="Sample Upload" type="primary" collapsable collapsed>
            <Row>
                <Col xs={12}>
                    <iframe src="https://drive.google.com/embeddedfolderview?id=1evvjAGjJFDC41JbiXa2AKs9T76CLz-l3#list"
                        style={{ width: "100%", height: "600px", border: "0" }}></iframe>
                </Col>
            </Row>
        </Box>
    );
}

function CSVDataDownload(props) {
    const tableColumns = [
        { title: 'Sensor', data: 'sensor' }
    ];
    const tableData = [
        { sensor: '_id' },
        { sensor: 'Alarm' },
        { sensor: 'Alarm' },
        { sensor: 'Alarm' },
        { sensor: 'Alarm' },
    ]
    return (
        <Box title="CSV Data Download" type="primary" collapsable>
            <Row>
                <Col md={4}>
                    <Box>
                        <b>Exclude if true</b>
                        <MyCheckBox text="A" />
                        <MyCheckBox text="A" />
                        <MyCheckBox text="A" />
                        <MyCheckBox text="A" />
                        <br />
                        <b>Exclude if false</b>
                        <MyCheckBox text="B" />
                        <MyCheckBox text="B" />
                        <MyCheckBox text="B" />
                        <MyCheckBox text="B" />
                        <div style={{ marginTop: "20px" }}>
                            <Button text="Get Data!" type="primary" />
                        </div>
                    </Box>
                </Col>
                <Col md={8}>
                    <SmartTable
                        data={tableData}
                        columns={tableColumns}
                    />
                </Col>
            </Row>
        </Box>
    );
}

function DataManagement() {
    return (
        <Content title="Data management" subTitle="View live site data" browserTitle="Data Management">
            <Row>
                <Col md={12}>
                    <SampleUploadPanel />
                    <CSVDataDownload />
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Box title="Daily total flow calculator">
                        <div>
                            Returns a CSV containing daily totalized flow volume for
                            sensors FTF, FT3, FT4, FT5 and FTP
                        </div>
                        <br />
                        <div><b>Date/Time Range</b></div>
                        <Button text="Get Data!" type="primary" />
                    </Box>
                </Col>
                <Col md={6}>
                    <Box title="Report Generator">
                        <div>
                            Returns a CSV containing flow and contaminant
                            reports over a given time period
                        </div>
                        <br />
                        <div><b>Date/Time Range</b></div>
                        <Button text="Get Data!" type="primary" />
                    </Box>
                </Col>
            </Row>
            <Row>
                <Box>
                </Box>
            </Row>
        </Content>
    );
}

export default DataManagement;