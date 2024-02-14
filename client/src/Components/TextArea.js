import "./TextArea.css"

function TextArea(props) {
    const area_styles = {
        borderRadius: "0px",
        borderColor: "#d2d6de",
        width: "100%",
        padding: "10px",
        "::focus": {
            borderColor: "#3c8cbc",
            borderRadius: "0px"
        }
    }
    return(
        <textarea 
            name={props.name}
            onChange={props.onChange}
            style={area_styles} 
            id={props.id}
            placeholder={props.placeholder}
            className="textarea"
        />
    )
}

export default TextArea