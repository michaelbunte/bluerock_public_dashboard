import React, { Component, useState, useEffect } from 'react';
import AdminLTE, { Navbar, Sidebar } from 'adminlte-2-react';

import { Route } from 'react-router-dom';

import DashboardPage from './Pages/Dashboard.js';
import DetailedDashPage from './Pages/DetailedDashboard.jsx';
import DataManagement from './Pages/DataManagement.js';
import Information from './Pages/Information.js'
import About from './Pages/About.js'
import Documentation from './Pages/Documentation.js'
import FAQnContact from './Pages/FAQnContact.js'
import AlertForms from './Pages/AlertForms.js'
import SystemManagement from './Pages/SystemManagement.js'
import UserManagement from './Pages/UserManagement.js';
import moment from 'moment';
import { VariableValveIndicator } from './Components/DetailedDash/DetailedDashComponents.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const {
  MessageItem, Entry, NotificationItem, TaskItem,
} = Navbar;

const { Item } = Sidebar;

/* 
navbar usage example at:
https://github.com/sd1337/adminlte-2-react-examples/blob/a263c05df9193264ce08c7b674460d15fd3fe086/src/App.jsx#L4
*/

export const SystemContext = React.createContext({system: "bluerock"});
function App() {
  const [appContext, setAppContext] = useState({system: "bluerock"});
  const sidebar = [
    <Item key="hello" icon="fas-home" text="Home" to="/dashboard" />,
    <Item key="user-management" icon="fas-user" text="User Management" to="/user-management" />,
    <Item key="data-management" icon="fas-database" text="Data Management" to="/data-management" />,
    <Item key="detailed-dashboard" icon="fas-chart-line" text="Detailed Dashboard" to="/detailed-dashboard" />,
    <Item key="system-management" icon="fas-tasks" text="System Management" to="/system-management" />,
    <Item key="alert-forms" icon="fas-flag" text="Alert Forms" to="/alert-forms" />,
    <Item key="documentation" icon="fas-book" text="Documentation" to="/documentation" />,
    <Item key="about" icon="fas-cubes" text="About SVWaterNet" to="/about" />,
    <Item key="faq" icon="fas-question-circle" text="FAQ and Contact" to="/faq" />,
    <Item key="info" icon="fas-info-circle" text="Information" to="/info" />
  ];


  return (
    <SystemContext.Provider value={appContext}>
      <AdminLTE title={["WaTeR", "System"]}
        titleShort={["W", "S"]}
        theme="blue-light"
        sidebar={sidebar}
      >

        <Navbar.Core>
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50px",
            gap: "20px",
            padding: "0px 20px"
          }}>
            <select
              value={appContext["system"]}
              onChange={(e) => { setAppContext((oldData)=>(
                {...oldData,
                system: e.target.value}))}}
              style={{ padding: "1px" }}
            >
              <option value="bluerock">Bluerock</option>
              <option value="santateresa">Santa Teresa</option>
              <option value="pryorfarms">Pryor Farms</option>
              <option value="simulated">Simulated</option>
            </select>
            <div
              style={{ display: "flex", gap: "10px", alignItems: "center" }}
            >
              <FontAwesomeIcon
                icon={faUser}
                color='white'
              />
              <div style={{ color: "white" }}> USERNAME </div>
            </div>
          </div>
        </Navbar.Core>
        <DashboardPage path="/dashboard" />
        <DataManagement path="/data-management" />
        <DetailedDashPage path="/detailed-dashboard" />
        <Information path="/info" />
        <About path="/about" />
        <Documentation path="/documentation" />
        <FAQnContact path="/faq" />
        <AlertForms path="/alert-forms" />
        <SystemManagement path="/system-management" />
        <UserManagement path="/user-management" />
      </AdminLTE>
    </SystemContext.Provider>
  );
}

export default App;
