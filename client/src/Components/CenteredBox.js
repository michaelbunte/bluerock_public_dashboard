import {Box} from 'adminlte-2-react';

const CenteredBox = (props) => {
    return <Box style={{maxWidth: '1000px', margin: 'auto'}} {...props} />;
}

export default CenteredBox;