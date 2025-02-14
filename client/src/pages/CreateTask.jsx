import { useState, useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import { Alert, TextField, Typography, Select, MenuItem, ListItemText, Button } from "@mui/material";

const CreateTask = () => {
    const [plans, setPlans] = useState([]);
    const [taskNameInput, setTaskNameInput] = useState("");
    const [planSelect, setPlanSelect] = useState("");
    const [taskDescriptionInput, setTaskDescriptionInput] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    
    const { appAcronym } = useParams();
    const navigate = useNavigate();

    const retrievePlans = async () => {
        const response = await axios.get("http://localhost:8080/api/app/retrievePlans");
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

            <NavLink to={`/applications/${appAcronym}`}>Back</NavLink><br></br>

            Task name:
            <TextField value={taskNameInput} onChange={handleTaskNameChange} />

            <Typography>App acronym: {appAcronym}</Typography>

            Plan:
            <Select
                value={planSelect}
                onChange={handlePlanChange}
                sx={{ width: "150px" }}
            >
                {plans.map((plan) => (
                    <MenuItem key={plan.plan_mvpName} value={plan.plan_mvpName}>
                        <ListItemText primary={plan.plan_mvpName} />
                    </MenuItem>
                ))}
            </Select>

            <Typography>Task description:</Typography>
            <textarea value={taskDescriptionInput} onChange={handleTaskDescriptionChange}></textarea>

            <Button onClick={createTask}>Create</Button>
        </div>
    );
};

export default CreateTask;