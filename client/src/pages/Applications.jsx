import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import { Alert, Typography, Table, TableHead, TableBody, TableRow, TableCell, TextField, Select, MenuItem, ListItemText, Button } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const Applications = () => {
    const [apps, setApps] = useState([]);
    const [groups, setGroups] = useState([]);
    const [acronymInput, setAcronymInput] = useState("");
    const [rNumberInput, setRNumberInput] = useState("");
    const [descriptionInput, setDescriptionInput] = useState("");
    const [startDatePicker, setStartDatePicker] = useState(dayjs());
    const [endDatePicker, setEndDatePicker] = useState(dayjs());
    const [permitCreateSelect, setPermitCreateSelect] = useState("");
    const [permitOpenSelect, setPermitOpenSelect] = useState("");
    const [permitToDoSelect, setPermitToDoSelect] = useState("");
    const [permitDoingSelect, setPermitDoingSelect] = useState("");
    const [permitDoneSelect, setPermitDoneSelect] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    const retrieveApps = async () => {
        const response = await axios.get("http://localhost:8080/api/app/retrieveApps");
        const appsArray = response.data.apps.map(app => ({ ...app, app_startDate: dayjs(app.app_startDate), app_endDate: dayjs(app.app_endDate) }));
        setApps(appsArray);
    };

    const retrieveGroups = async () => {
        const response = await axios.get("http://localhost:8080/api/user/retrieveGroups");
        setGroups(response.data.all);
    };

    useEffect(() => {
        retrieveApps();
        retrieveGroups();
    }, []);

    const CA_handleAcronymChange = (event) => {
        setAcronymInput(event.target.value);
    };

    const CA_handleRNumberChange = (event) => {
        setRNumberInput(event.target.value);
    };

    const CA_handleDescriptionChange = (event) => {
        setDescriptionInput(event.target.value);
    };

    const CA_handlePermitCreateChange = (event) => {
        setPermitCreateSelect(event.target.value);
    };

    const CA_handlePermitOpenChange = (event) => {
        setPermitOpenSelect(event.target.value);
    };

    const CA_handlePermitToDoChange = (event) => {
        setPermitToDoSelect(event.target.value);
    };

    const CA_handlePermitDoingChange = (event) => {
        setPermitDoingSelect(event.target.value);
    };

    const CA_handlePermitDoneChange = (event) => {
        setPermitDoneSelect(event.target.value);
    };

    const createApp = async () => {
        try {
            const response = await axios.post("http://localhost:8080/api/app/createApp", { app_acronym: acronymInput, app_rNumber: rNumberInput, app_description: descriptionInput, app_startDate: startDatePicker.toISOString().split("T")[0], app_endDate: endDatePicker.toISOString().split("T")[0], app_permitCreate: permitCreateSelect, app_permitOpen: permitOpenSelect, app_permitToDoList: permitToDoSelect, app_permitDoing: permitDoingSelect, app_permitDone: permitDoneSelect });
            navigate(0);
        } catch (error) {
            if (error.response.status === 403) {
                const response = await axios.get("http://localhost:8080/api/auth/logout");
                navigate("/");
            } else {
                setErrorMessage(error.response.data.message);
            }
        }
    };

    const UA_handleDescriptionChange = (index, event) => {
        const newApps = [...apps];
        newApps[index].app_description = event.target.value;
        setApps(newApps);
    };

    const UA_handleStartDateChange = (index, value) => {
        const newApps = [...apps];
        newApps[index].app_startDate = value;
        setApps(newApps);
    };

    const UA_handleEndDateChange = (index, value) => {
        const newApps = [...apps];
        newApps[index].app_endDate = value;
        setApps(newApps);
    };

    const UA_handlePermitCreateChange = (index, event) => {
        const newApps = [...apps];
        newApps[index].app_permitCreate = event.target.value;
        setApps(newApps);
    };

    const UA_handlePermitOpenChange = (index, event) => {
        const newApps = [...apps];
        newApps[index].app_permitOpen = event.target.value;
        setApps(newApps);
    };

    const UA_handlePermitToDoChange = (index, event) => {
        const newApps = [...apps];
        newApps[index].app_permitToDoList = event.target.value;
        setApps(newApps);
    };

    const UA_handlePermitDoingChange = (index, event) => {
        const newApps = [...apps];
        newApps[index].app_permitDoing = event.target.value;
        setApps(newApps);
    };

    const UA_handlePermitDoneChange = (index, event) => {
        const newApps = [...apps];
        newApps[index].app_permitDone = event.target.value;
        setApps(newApps);
    };

    const updateApp = async (index) => {
        try {
            const app = {...apps[index]};

            const startDate = new Date(app.app_startDate);
            const startDateOffset = startDate.getTimezoneOffset();
            startDate.setMinutes(startDate.getMinutes() - startDateOffset);
            app.app_startDate = startDate.toISOString().split("T")[0];
            
            const endDate = new Date(app.app_endDate);
            const endDateOffset = endDate.getTimezoneOffset();
            endDate.setMinutes(endDate.getMinutes() - endDateOffset);
            app.app_endDate = endDate.toISOString().split("T")[0];

            const response = await axios.put("http://localhost:8080/api/app/updateApp", app);
            navigate(0);
        } catch (error) {
            if (error.response.status === 403) {
                const response = await axios.get("http://localhost:8080/api/auth/logout");
                navigate("/");
            } else {
                setErrorMessage(error.response.data.message);
            }
        }
    };

    return (
        <div style={{ paddingTop: 65 }}>
            <Header />
            
            {errorMessage &&
                <Alert severity="error" sx={{ display: "flex", alignItems: "center", height: "60px" }}>{errorMessage}</Alert>
            }

            <Typography variant="h4" sx={{ marginLeft: "10px", marginTop: "20px" }}>Applications</Typography>
        
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Acronym</TableCell>
                        <TableCell>R. Number</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Start date</TableCell>
                        <TableCell>End date</TableCell>
                        <TableCell>Permit create</TableCell>
                        <TableCell>Permit open</TableCell>
                        <TableCell>Permit to-do</TableCell>
                        <TableCell>Permit doing</TableCell>
                        <TableCell>Permit done</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
        
                <TableBody>
                    <TableRow>
                        <TableCell><TextField value={acronymInput} onChange={(event) => CA_handleAcronymChange(event)} placeholder="Enter acronym" /></TableCell>
                        <TableCell><TextField value={rNumberInput} onChange={(event) => CA_handleRNumberChange(event)} placeholder="Enter R. number" type="number" /></TableCell>
                        <TableCell><TextField value={descriptionInput} onChange={(event) => CA_handleDescriptionChange(event)} placeholder="Enter description" /></TableCell>
                        <TableCell>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={["DatePicker"]}>
                                    <DatePicker value={startDatePicker} onChange={(value) => setStartDatePicker(value)} />
                                </DemoContainer>
                            </LocalizationProvider>
                        </TableCell>
                        <TableCell>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={["DatePicker"]}>
                                    <DatePicker value={endDatePicker} onChange={(value) => setEndDatePicker(value)} />
                                </DemoContainer>
                            </LocalizationProvider>
                        </TableCell>
                        <TableCell>
                            <Select
                                value={permitCreateSelect}
                                onChange={(event) => CA_handlePermitCreateChange(event)}
                                sx={{ width: "150px" }}
                            >
                                {groups.map((group) => (
                                    <MenuItem key={group} value={group}>
                                        <ListItemText primary={group} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </TableCell>
                        <TableCell>
                            <Select
                                value={permitOpenSelect}
                                onChange={(event) => CA_handlePermitOpenChange(event)}
                                sx={{ width: "150px" }}
                            >
                                {groups.map((group) => (
                                    <MenuItem key={group} value={group}>
                                        <ListItemText primary={group} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </TableCell>
                        <TableCell>
                            <Select
                                value={permitToDoSelect}
                                onChange={(event) => CA_handlePermitToDoChange(event)}
                                sx={{ width: "150px" }}
                            >
                                {groups.map((group) => (
                                    <MenuItem key={group} value={group}>
                                        <ListItemText primary={group} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </TableCell>
                        <TableCell>
                            <Select
                                value={permitDoingSelect}
                                onChange={(event) => CA_handlePermitDoingChange(event)}
                                sx={{ width: "150px" }}
                            >
                                {groups.map((group) => (
                                    <MenuItem key={group} value={group}>
                                        <ListItemText primary={group} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </TableCell>
                        <TableCell>
                            <Select
                                value={permitDoneSelect}
                                onChange={(event) => CA_handlePermitDoneChange(event)}
                                sx={{ width: "150px" }}
                            >
                                {groups.map((group) => (
                                    <MenuItem key={group} value={group}>
                                        <ListItemText primary={group} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </TableCell>
                        <TableCell><Button onClick={() => createApp()}>Create</Button></TableCell>
                    </TableRow>
                    
                    {apps.map((app, index) => {
                        return (
                            <TableRow key={index}>
                                <TableCell><NavLink to={`/applications/${app.app_acronym}`}>{app.app_acronym}</NavLink></TableCell>
                                <TableCell>{app.app_rNumber}</TableCell>
                                <TableCell><TextField value={app.app_description} onChange={(event) => UA_handleDescriptionChange(index, event)} placeholder="Enter description" /></TableCell>
                                <TableCell>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={["DatePicker"]}>
                                            <DatePicker value={app.app_startDate} onChange={(value) => UA_handleStartDateChange(index, value)} />
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </TableCell>
                                <TableCell>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={["DatePicker"]}>
                                            <DatePicker value={app.app_endDate} onChange={(value) => UA_handleEndDateChange(index, value)} />
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={app.app_permitCreate}
                                        onChange={(event) => UA_handlePermitCreateChange(index, event)}
                                        sx={{ width: "150px" }}
                                    >
                                        {groups.map((group) => (
                                            <MenuItem key={group} value={group}>
                                                <ListItemText primary={group} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={app.app_permitOpen}
                                        onChange={(event) => UA_handlePermitOpenChange(index, event)}
                                        sx={{ width: "150px" }}
                                    >
                                        {groups.map((group) => (
                                            <MenuItem key={group} value={group}>
                                                <ListItemText primary={group} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={app.app_permitToDoList}
                                        onChange={(event) => UA_handlePermitToDoChange(index, event)}
                                        sx={{ width: "150px" }}
                                    >
                                        {groups.map((group) => (
                                            <MenuItem key={group} value={group}>
                                                <ListItemText primary={group} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={app.app_permitDoing}
                                        onChange={(event) => UA_handlePermitDoingChange(index, event)}
                                        sx={{ width: "150px" }}
                                    >
                                        {groups.map((group) => (
                                            <MenuItem key={group} value={group}>
                                                <ListItemText primary={group} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={app.app_permitDone}
                                        onChange={(event) => UA_handlePermitDoneChange(index, event)}
                                        sx={{ width: "150px" }}
                                    >
                                        {groups.map((group) => (
                                            <MenuItem key={group} value={group}>
                                                <ListItemText primary={group} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell><Button onClick={() => updateApp(index)}>Update</Button></TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

export default Applications;