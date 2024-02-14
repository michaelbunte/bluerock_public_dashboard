import {Box, Inputs, Button, SmartTable} from 'adminlte-2-react';
import { useState } from 'react';


function AlarmUpdateChip() {
    const [data, setData] = useState(Array(8).fill(Array(3).fill(null)));
    const tableData = [
        { sensor: 'Alarm Code',         code: 'alarm'           },
        { sensor: 'Alarm Code',         code: 'alarmCode'       },
        { sensor: 'Delivery Mode',      code: 'deliveryManual'  },
        { sensor: 'Dump Status',        code: 'dumpProduct'     },
        { sensor: 'Flush Status',       code: 'flushManual'     },
        { sensor: 'RO Operation Mode',  code: 'opMode'          },
        { sensor: 'RO Status',          code: 'state'           },
        { sensor: 'Well Pump',          code: 'wellPumpRun'     }
    ];

    const tableColumns = [
        { title: 'Sensor',          data: 'sensor'      },
        { title: 'Code',            data: 'code'        },
        { title: 'Less Than',       data: 'lessThan'    },
        { title: 'Equal To',        data: 'equalTo'     },
        { title: 'Greater Than',    data: 'greaterThan' }
    ];

    function handleChange(e) {
        const {value, name} = e.target;
        if (e.target.validity.valid ) {
            let nameIdxArr = name.split('_');
            setData((prevData) => {
                let newDataArray = prevData.map(row=>[...row]);
                newDataArray[nameIdxArr[0]][nameIdxArr[1]] = value;
                return newDataArray;
            })
        }
    }

    const newTableData = tableData.map((row, index)=>{
        row['lessThan'] = 
        (<input
            type="number"
            name={`${index}_0`}
            key={`${index}_0`}
            style={{width:"6rem"}}
            onChange={ handleChange }
        />)
        row['equalTo'] = 
        (<input
            type="number"
            name={`${index}_1`}
            key={`${index}_1`}
            style={{width:"6rem"}}
            onChange={ handleChange }
        />)
        row['greaterThan'] = 
        (<input
            type="number"
            name={`${index}_2`}
            key={`${index}_2`}
            style={{width:"6rem"}}
            onChange={ handleChange }
        />)
        return row
    })
    return(
        <Box title="Alarm Update">
            <Button text="Update Alarms!" type="primary"/>
            <br/>
            <br/>
            <SmartTable
                data={newTableData}
                columns={tableColumns}
            />

        </Box>
    )
}

export default AlarmUpdateChip;