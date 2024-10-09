import { useEffect } from "react";
import { useNavigate } from "react-router-dom"
export default function NotFound(){
    const navigate = useNavigate();
    useEffect(() => {
        navigate("/");
    }, []);

    return <div>

        <h2>잘못된 페이지 요청입니다</h2>
        

    </div>
}