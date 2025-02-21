import { useState, useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import { Alert, Typography, TextField, Box, Select, MenuItem, ListItemText, Button } from "@mui/material";

const CreateTask = () => {
    const [plans, setPlans] = useState([]);
    const [taskNameInput, setTaskNameInput] = useState("");
    const [planSelect, setPlanSelect] = useState("");
    const [taskDescriptionInput, setTaskDescriptionInput] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    
    const { appAcronym } = useParams();
    const navigate = useNavigate();

    const retrievePlans = async () => {
        const response = await axios.get("http://localhost:8080/api/app/retrievePlans", { params: { appAcronym: appAcronym } });
        setPlans(response.data.plans);
    };

    useEffect(() => {
        retrievePlans();
    }, []);

    const handleTaskNameChange = (event) => {
        setTaskNameInput(event.target.value);
    };

    const handlePlanChange = (event) => {
        setPlanSelect(event.target.value);
    };

    const handleTaskDescriptionChange = (event) => {
        setTaskDescriptionInput(event.target.value);
    };

    const createTask = async () => {
        try {
            const response = await axios.post("http://localhost:8080/api/app/createTask", { task_appAcronym: appAcronym, task_plan: planSelect, task_name: taskNameInput, task_description: taskDescriptionInput });
            navigate(`/applications/${appAcronym}`);
        } catch (error) {
            setErrorMessage(error.response.data.message);
        }
    };

    return (
        <div style={{ paddingTop: 65 }}>
            <Header />
            
            {errorMessage &&
                <Alert severity="error" sx={{ display: "flex", alignItems: "center", height: "60px" }}>{errorMessage}</Alert>
            }

            <div style={{ display: "flex", marginBottom: "20px" }}>
                <div style={{ width: "800px", marginLeft: "10px", marginRight: "100px" }}>
                    <NavLink to={`/applications/${appAcronym}`}>Back</NavLink><br></br>

                    <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                        <Typography sx={{ marginRight: "10px" }}>Name:</Typography>
                        <TextField value={taskNameInput} onChange={handleTaskNameChange} />
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography>State: Open</Typography>
                    </div>

                    <Typography style={{ marginBottom: "10px" }}>App: {appAcronym}</Typography>

                    <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                        <Typography>Plan:</Typography>
                        <Select
                            value={planSelect}
                            onChange={handlePlanChange}
                            sx={{ marginLeft: "10px", width: "150px" }}
                        >
                            {plans.map((plan) => (
                                <MenuItem key={plan.plan_mvpName} value={plan.plan_mvpName}>
                                    <ListItemText primary={plan.plan_mvpName} />
                                </MenuItem>
                            ))}
                        </Select>
                    </div>

                    <Typography>Description:</Typography>
                    <textarea value={taskDescriptionInput} onChange={handleTaskDescriptionChange} style={{ width: "800px", height: "300px" }}></textarea>
                </div>

                <div style={{ marginTop: "auto" }}>
                    <Typography>Notes history:</Typography>
                    <textarea style={{ width: "600px", height: "320px" }} disabled></textarea>
                    <Typography>Enter note:</Typography>
                    <textarea style={{ width: "600px", height: "100px" }} disabled></textarea>
                </div>
            </div>

            <div style={{ display: "flex", width: "1510px" }}>
                <Box sx={{ flexGrow: 1 }} />
                <Button onClick={createTask}>Create</Button>
            </div>
        </div>
    );
};

export default CreateTask;