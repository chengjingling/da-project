import { useParams } from "react-router-dom";

const TaskBoard = () => {
    const { acronym } = useParams();
  
    return (
        <div>
            {acronym}
        </div>
    );
};

export default TaskBoard;