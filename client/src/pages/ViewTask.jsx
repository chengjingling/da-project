import { useState, useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import { Alert, Typography, TextField, Box, Select, MenuItem, ListItemText, Button } from "@mui/material";

const ViewTask = () => {
    const [permits, setPermits] = useState([]);
    const [hasPermission, setHasPermission] = useState(false);
    const [task, setTask] = useState({});
    const [plans, setPlans] = useState([]);
    const [planSelect, setPlanSelect] = useState("");
    const [notes, setNotes] = useState("");
    const [noteInput, setNoteInput] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    
    const { taskId, appAcronym } = useParams();
    const navigate = useNavigate();

    const checkPermits = async () => {
        const response = await axios.get("http://localhost:8080/api/auth/checkPermits", { params: { appAcronym: appAcronym, taskId: taskId } });
        setPermits(response.data.permits);
        setHasPermission(response.data.hasPermission);
    };

    const retrieveTaskAndPlans = async () => {
        const taskResponse = await axios.get("http://localhost:8080/api/app/retrieveTask", { params: { taskId: taskId } });
        const plansResponse = await axios.get("http://localhost:8080/api/app/retrievePlans", { params: { appAcronym: appAcronym } });

        const taskObject = taskResponse.data.task;
        const plansArray = plansResponse.data.plans;

        const notesArray = JSON.parse(`[${taskObject.task_notes}]`);

        const formatDate = (date) => {
            const d = new Date(date);

            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");

            const hours = String(d.getHours()).padStart(2, "0");
            const minutes = String(d.getMinutes()).padStart(2, "0");
            
            return `${year}/${month}/${day} ${hours}:${minutes}`;
        };
        
        const notesText = notesArray
            .map(note => `${formatDate(note.date_posted)} (${note.creator}): ${note.text}`)
            .join("\n");
        
        setTask(taskObject);
        setPlans(plansArray);
        setPlanSelect(taskObject.task_plan);
        setNotes(notesText);
    };

    useEffect(() => {
        checkPermits();
        retrieveTaskAndPlans();
    }, []);

    const handlePlanChange = (event) => {
        setPlanSelect(event.target.value);
    };

    const handleNoteChange = (event) => {
        setNoteInput(event.target.value);
    };

    const updateTask = async (buttonPressed) => {
        try {
            if (buttonPressed !== "Save changes") {
                const updateStateResponse = await axios.patch("http://localhost:8080/api/app/updateTaskState", { task_id: taskId, buttonPressed: buttonPressed, appAcronym: appAcronym });
            }

            if (task.task_state === "Open" || task.task_state === "Done") {
                const updatePlanResponse = await axios.patch("http://localhost:8080/api/app/updateTaskPlan", { task_id: taskId, task_plan: planSelect, appAcronym: appAcronym });
            }

            if (noteInput !== "") {
                const updateNotesResponse = await axios.patch("http://localhost:8080/api/app/updateTaskNotes", { task_id: taskId, note: noteInput, appAcronym: appAcronym });
            }

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

            <div style={{ display: "flex", marginBottom: "20px" }}>
                <div style={{ width: "800px", marginLeft: "10px", marginRight: "100px" }}>
                    <NavLink to={`/applications/${appAcronym}`}>Back</NavLink><br></br>

                    <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                        <Typography sx={{ marginRight: "10px" }}>Name:</Typography>
                        <TextField value={task.task_name} disabled />
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography>State: {task.task_state}</Typography>
                    </div>

                    <Typography style={{ marginBottom: "10px" }}>App: {appAcronym}</Typography>

                    <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                        <Typography>Plan:</Typography>
                        <Select
                            value={planSelect}
                            onChange={handlePlanChange}
                            sx={{ marginLeft: "10px", width: "150px" }}
                            disabled={
                                !(
                                    (task.task_state === "Open" && permits.includes("Open")) || 
                                    (task.task_state === "Done" && permits.includes("Done"))
                                )
                            }
                        >
                            {plans.map((plan) => (
                                <MenuItem key={plan.plan_mvpName} value={plan.plan_mvpName}>
                                    <ListItemText primary={plan.plan_mvpName} />
                                </MenuItem>
                            ))}
                        </Select>
                    </div>

                    <Typography>Description:</Typography>
                    <textarea value={task.task_description} style={{ width: "800px", height: "300px" }} disabled></textarea>
                </div>

                <div style={{ marginTop: "auto" }}>
                    <Typography>Notes history:</Typography>
                    <textarea value={notes} style={{ width: "600px", height: "320px" }} disabled></textarea>
                    <Typography>Enter note:</Typography>
                    <textarea onChange={handleNoteChange} style={{ width: "600px", height: "100px" }} disabled={!hasPermission}></textarea>
                </div>
            </div>

            <div style={{ display: "flex", width: "1510px" }}>
                {task.task_state === "Open" && permits.includes("Open") &&
                    <Button onClick={() => updateTask("Release task")}>Release task</Button>
                }

                {task.task_state === "To-do" && permits.includes("To-do") &&
                    <Button onClick={() => updateTask("Work on task")}>Work on task</Button>
                }

                {task.task_state === "Doing" && permits.includes("Doing") &&
                    <div>
                        <Button onClick={() => updateTask("Return task to to-do list")}>Return task to to-do list</Button>
                        <Button onClick={() => updateTask("Seek approval")}>Seek approval</Button>
                        <Button onClick={() => updateTask("Request for deadline extension")}>Request for deadline extension</Button>
                    </div>
                }

                {task.task_state === "Done" && permits.includes("Done") &&
                    <div>
                        <Button onClick={() => updateTask("Reject task")}>Reject task</Button>
                        <Button onClick={() => updateTask("Approve task")}>Approve task</Button>
                    </div>
                }

                <Box sx={{ flexGrow: 1 }} />

                <Button onClick={() => updateTask("Save changes")}>Save changes</Button>
            </div>
        </div>
    );
};

export default ViewTask;