function MyCheckBox(props){
    const style = {
        display: "flex",
        columnGap: "10px",
        alignItems: "flex-start",
        margin: "2px 0px 2px 0px"
    }
    
    return (
        <div style={style}>
            <input type="checkbox" {...props}/>
            {props.text}
        </div>
    )
}

export default MyCheckBox