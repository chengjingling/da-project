import { useState } from "react";
import Header from "../components/Header";
import { Typography, Table, TableHead, TableBody, TableRow, TableCell, TextField } from "@mui/material";

const Applications = () => {
    const [acronymInput, setAcronymInput] = useState("");
    const [rNumberInput, setRNumberInput] = useState("");
    const [descriptionInput, setDescriptionInput] = useState("");

    const handleAcronymChange = (event) => {
      setAcronymInput(event.target.value);
    };

    const handleRNumberChange = (event) => {
      setRNumberInput(event.target.value);
    };

    const handleDescriptionChange = (event) => {
      setDescriptionInput(event.target.value);
    };

    return (
        <div style={{ paddingTop: 65 }}>
            <Header />

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
                        <TableCell><TextField value={acronymInput} onChange={(event) => handleAcronymChange(event)} placeholder="Enter acronym" /></TableCell>
                        <TableCell><TextField value={rNumberInput} onChange={(event) => handleRNumberChange(event)} placeholder="Enter R. number" type="number" /></TableCell>
                        <TableCell><TextField value={descriptionInput} onChange={(event) => handleDescriptionChange(event)} placeholder="Enter description" /></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
};

export default Applications;