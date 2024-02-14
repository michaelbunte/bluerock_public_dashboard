import {Box, Inputs, Button, SmartTable} from 'adminlte-2-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import CenteredBox from "../Components/CenteredBox";

function UserManagement(){

    const tableColumns = [
        { title: 'User Email', data: 'userEmail' },
        { title: 'User Name', data: 'userName' },
        { title: 'Current Role', data: 'currentRole' },
        { title: 'Status', data: 'status' },
        { title: 'Remove', data: 'remove' }
    ];

    function handleDeletion() {}
    const removeIcon = (
        <FontAwesomeIcon 
            icon={faTrashAlt}
            onClick={handleDeletion}
        />
    );
    const tableData = [
        {
            userName: 'Yoram Cohen',
            userEmail: 'profyc@gmail.com',
            currentRole: 'admin',
            status: 2,
            remove: removeIcon
        },
        {
            userName: 'Yian Chen',
            userEmail: 'yianchen1995@gmail.com',
            currentRole: 'admin',
            status: 2,
            remove: removeIcon
        }
    ];

    return(
        <CenteredBox title="User Management">
            <SmartTable
                data={tableData}
                columns={tableColumns}
            />
        </CenteredBox>
    )
}

export default UserManagement;