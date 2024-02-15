import { Modal, Button } from 'react-bootstrap';
import { Box, Col, Row, Content, SimpleTable } from 'adminlte-2-react';
import React, { useState } from 'react';
import {ReactComponent as SpinnerSVG} from "../Assets/spinner.svg";

let base_x_style = {
    "padding":"0px 10px",
    "borderRadius": "20px",
    "userSelect":"none"
};

let hover_x_style = {
    "padding":"0px 10px",
    "borderRadius": "20px",
    "userSelect":"none",
    "fontWeight":"bold"
};

// onHide is a callback function that is called whenever the modal is closed
function WideModal({header="", body="", onHide=()=>{}, isOn, isLoading=false}) {
    const [ x_style, set_x_style ] = useState(base_x_style);
    const loadingSymbol = 
        <div style={{display: "flex", justifyContent: "center", opacity: "0.3", width: "100%", height: "70%"}}>
            <SpinnerSVG style={{width: "100px", height: "100%"}}/>;
        </div>

    return(
        <>
            { isOn && <div 
                style={{
                    "position" : "fixed",
                    "width" : "100%",
                    "height" : "100%",
                    "left" : "0",
                    "top" : "0",
                    "background" : "rgba(0,0,0,0.5)",
                    "zIndex": 10000,
                    "display" : "flex",
                    "justifyContent" : "center",
                    "alignItems" : "center",
                    "flexDirection" : "column"
                }}
                onClick={(e) => onHide()}
                >
                <div 
                    style={{"background" : "rgba(0,0,0,0)", "height" : "50px"}}
                />
                <div
                    style={{
                        "background" : "white",
                        "maxHeight" : "60%",
                        "height" : "800px",
                        "width" : "900px",
                        "maxWidth" : "90%",
                        "padding" : "0px 20px 20px 20px",
                        "overflowY" : "scroll"
                    }}
                    onClick={(e)=>e.stopPropagation()}
                    id="innermodal"
                    >
                        <div 
                            style={{
                                "display" : "flex",
                                "justifyContent" : "space-between"
                            }}
                        >
                            <h3>{header}</h3>
                            <h3 
                                style={x_style}
                                onClick={onHide}
                                onMouseEnter={()=>{set_x_style(hover_x_style)}}
                                onMouseLeave={()=>{set_x_style(base_x_style)}}
                            >×</h3>
                        </div>
                        <hr style={{"borderColor": "lightgrey"}}/>
                        { ! isLoading && body}
                        {isLoading && 
                            loadingSymbol
                        }
                    </div>
            </div>}
        </>
    );
}

export {WideModal};

