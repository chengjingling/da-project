import { useState, useEffect } from "react";
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
    const taskStates = ["Open", "To-do", "Doing", "Done", "Closed"];
    const [tasks, setTasks] = useState({});
    const [plans, setPlans] = useState({});
    const [mvpNameInput, setMvpNameInput] = useState("");
    const [startDatePicker, setStartDatePicker] = useState(dayjs());
    const [endDatePicker, setEndDatePicker] = useState(dayjs());
    const [errorMessage, setErrorMessage] = useState("");
    
    const { appAcronym } = useParams();
    const navigate = useNavigate();

    const retrieveTasksAndPlans = async () => {
        const tasksResponse = await axios.get("http://localhost:8080/api/app/retrieveTasks", { params: { appAcronym: appAcronym } });
        const plansResponse = await axios.get("http://localhost:8080/api/app/retrievePlans", { params: { appAcronym: appAcronym } });
        
        const tasksObject = taskStates.reduce((acc, state) => {
            acc[state] = tasksResponse.data.tasks.filter(task => task.task_state === state);
            return acc;
        }, {});

        const plansObject = plansResponse.data.plans.reduce((acc, plan) => {
            acc[plan.plan_mvpName] = plan;
            return acc;
          }, {});
        
        setTasks(tasksObject);
        setPlans(plansObject);
    };

    useEffect(() => {
        retrieveTasksAndPlans();
    }, []);

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

            <NavLink to={"/applications/"} style={{ marginLeft: "10px" }}>Back</NavLink>

            <Typography variant="h4" sx={{ marginLeft: "10px", marginTop: "20px" }}>Task Board - {appAcronym}</Typography>
        
            <div style={{ display: "flex", alignItems: "center", marginLeft: "10px", marginRight: "20px", marginBottom: "10px" }}>
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
                {taskStates.map(state => (
                    <div key={state} style={{ border: "1px solid black", padding: "10px" }}>
                        <Typography variant="h5">{state}</Typography>
                        {tasks[state]?.length === 0 ? (
                            <div style={{ width: "200px", marginTop: "10px" }}>
                                <Typography>No tasks</Typography>
                            </div>
                        ) : (
                            tasks[state]?.map(task => (
                                <div key={task.task_id} onClick={() => navigate(`/applications/${appAcronym}/${task.task_id}`)} style={{ border: task.task_plan ? `1px solid ${plans[task.task_plan].plan_color}` : "1px solid black", padding: "10px", width: "200px", marginTop: "10px", cursor: "pointer" }}>
                                    {task.task_plan ? (
                                        <Typography>{task.task_plan}</Typography>
                                    ) : (
                                        <Typography>No plan</Typography>
                                    )}
                                    <Typography>{task.task_name}</Typography>
                                    <Typography>{task.task_id}</Typography>
                                </div>
                            ))
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskBoard;