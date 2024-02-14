import {Col, Row, Content} from 'adminlte-2-react';
import BulletListChip from '../Components/BulletListChip'
import linkPairs from '../StaticData/documentationLinksEnglish.json'

function Documentation() {
    return (
        <Content title="WaTeR Documentation" browserTitle="Selected Public Documents" layout-boxed>
            <Row>
                <Col md={12}>
                    <BulletListChip title="Selected Public Documents" links={linkPairs.linkPairs}/>
                </Col>
            </Row>
        </Content>
    );
}

export default Documentation