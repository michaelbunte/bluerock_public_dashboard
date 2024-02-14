import { Box, Col, Row, Content, SimpleTable} from 'adminlte-2-react';


function MonitoringSchedule(props) {

    const data = [
        { day: 'Monday',    name: 'Ruben'   },
        { day: 'Tuesday',   name: 'Yakubu'  },
        { day: 'Wednesday', name: 'Nora'    },
        { day: 'Thursday',  name: 'James'   },
        { day: 'Friday',    name: 'Maria'   },
        { day: 'Saturday',  name: 'Kenny'   },
        { day: 'Sunday',    name: 'Gloria'  },
    ];
      
    const columns = [
        { data: 'day' },
        { data: 'name'}
    ];

    return (
        <Box title="Monitoring Schedule">
            <SimpleTable
                data={data}
                columns={columns}
                width="20px"
                border
                responsive
            />
            <a href={"https://docs.google.com/spreadsheets/d/16cMrGvK6HrxccpT3dzsp02u3CJoG5b9FWj-LH24GKzM"}>
                Monitoring Logging Spreadsheet
            </a>
        </Box>
        
    )
}

export default MonitoringSchedule;