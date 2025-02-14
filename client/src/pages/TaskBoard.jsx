import { useState } from "react";
import dayjs from "dayjs";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import { Alert, Typography, TextField, Button, Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const TaskBoard = () => {
    const [mvpNameInput, setMvpNameInput] = useState("");
    const [startDatePicker, setStartDatePicker] = useState(dayjs());
    const [endDatePicker, setEndDatePicker] = useState(dayjs());
    const [errorMessage, setErrorMessage] = useState("");
    
    const { appAcronym } = useParams();
    const navigate = useNavigate();

    const handleMvpNameChange = (event) => {
        setMvpNameInput(event.target.value);
    };

    const createPlan = async () => {
        try {
            const response = await axios.post("http://localhost:8080/api/app/createPlan", { plan_appAcronym: appAcronym, plan_mvpName: mvpNameInput, plan_startDate: startDatePicker.toISOString().split("T")[0], plan_endDate: endDatePicker.toISOString().split("T")[0] });
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

            <Typography variant="h4" sx={{ marginLeft: "10px", marginTop: "20px" }}>Task Board - {appAcronym}</Typography>
        
            <div style={{ display: "flex", alignItems: "center", marginLeft: "10px", marginBottom: "10px" }}>
                Plan:
                <TextField value={mvpNameInput} onChange={handleMvpNameChange} label="MVP name" sx={{ marginLeft: "10px" }} />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={["DatePicker"]} sx={{ marginBottom: "8px" }}>
                        <DatePicker value={startDatePicker} onChange={(value) => setStartDatePicker(value)} label="Start date" />
                    </DemoContainer>
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={["DatePicker"]} sx={{ marginBottom: "8px" }}>
                        <DatePicker value={endDatePicker} onChange={(value) => setEndDatePicker(value)} label="End date" />
                    </DemoContainer>
                </LocalizationProvider>
                <Button onClick={createPlan}>Create</Button>
                <Box sx={{ flexGrow: 1 }} />
                <NavLink to={`/applications/${appAcronym}/createTask`}>Create task</NavLink>
            </div>

            <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                <div style={{ border: "1px solid black", padding: "10px" }}>
                    <Typography variant="h5">OPEN</Typography>
                </div>

                <div style={{ border: "1px solid black", padding: "10px" }}>
                    <Typography variant="h5">TO-DO</Typography>
                </div>

                <div style={{ border: "1px solid black", padding: "10px" }}>
                    <Typography variant="h5">DOING</Typography>
                </div>

                <div style={{ border: "1px solid black", padding: "10px" }}>
                    <Typography variant="h5">DONE</Typography>
                </div>

                <div style={{ border: "1px solid black", padding: "10px" }}>
                    <Typography variant="h5">CLOSED</Typography>
                </div>
            </div>
        </div>
    );
};

export default TaskBoard;