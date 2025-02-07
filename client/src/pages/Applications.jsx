import Header from "../components/Header";
import { Typography } from "@mui/material";

const Applications = () => {
    return (
        <div style={{ paddingTop: 65 }}>
            <Header />

            <Typography variant="h4" sx={{ marginLeft: "10px", marginTop: "20px" }}>Applications</Typography>
        </div>
    );
};

export default Applications;