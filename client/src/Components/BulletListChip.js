import { Box, Col, Row, Content} from 'adminlte-2-react';
import CenteredBox from './CenteredBox';

function InfoLinks(props) {
    let linkBullets = props.links.map((webpage_info) => {
        return (
            <li style={{padding: "0px 20px 0px 0px"}}><a 
                href={webpage_info["link"]}
            >
                {webpage_info["text"]}
            </a></li>
        );
    });
    return <ul>{linkBullets}</ul>
}

function BulletListChip(props) {
    return (
        <CenteredBox title={props.title} type="primary">
            <Row>
                <Col xs={12}>
                    <InfoLinks links={props.links}/>
                </Col>
            </Row>
        </CenteredBox>
    );
}

export default BulletListChip