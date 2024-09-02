import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Editor from "./Edtior";
import './preview.css'

export default function Preview(){
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state;
    const quillRef = useRef();
    const [range, setRange] = useState();
    const [lastChange, setLastChange] = useState();

    useEffect(() => {
        document.getElementsByClassName("ql-toolbar")[0].classList.add("clearTool");
        document.getElementsByClassName("ql-container")[0].classList.add("clearContainer");
        document.getElementsByClassName("ql-container")[0].style.border = "none";
        quillRef.current.root.innerHTML = state.innerHTML;
        window.print();
        navigate("/create", {
            state : {
                id : state.id,
                check : state.check
            }
        })
        return;
    }, []);

    return <div>
        <Editor
            ref={quillRef}
            readOnly={true}
            onSelectionChange={setRange}
            onTextChange={setLastChange}>
        </Editor>
    </div>

}