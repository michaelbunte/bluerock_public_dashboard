import { Modal, Button } from 'react-bootstrap';
import { Box, Col, Row, Content, SimpleTable } from 'adminlte-2-react';


// import {Inputs, Button} from 'adminlte-2-react';

function MyModal({header="", body="", show, onHide}) {
    return(
        <Modal
            backdrop
            show={show}
            onHide={onHide}
        >
            <Modal.Header  closeButton={true}>
                <Modal.Title>{header}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            {body}
            </Modal.Body>
        </Modal>
    )
}



export {MyModal};
