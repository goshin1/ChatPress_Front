import "./create.css";
import { useState, useRef } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom";
import Editor from "./Edtior";
import Quill from "quill";
import React from "react";
import axios from "axios";

const Delta = Quill.import('delta');

export default function Create(){
    const navigate = useNavigate();
    const location = useLocation();
    const [state, setState] = useState(location.state);
    console.log(state)
    const quillRef = useRef();
    const toolbarRef = useRef();
    

    const [range, setRange] = useState();
    const [lastChange, setLastChange] = useState();
    const [readOnly, setReadOnly] = useState(false);
    const [title, setTitle] = useState("");
    const [load, setLoad] = useState("none")
    const [documents, setDocuments] = useState([]); // 문서 목록
    const [edit, setEdit] = useState(); // 제작 중인 문서 정보
        


    return <div id="createDiv">
        <div className="documentList" style={{display : load}}>
            <div className="documentBox">
                {documents}
            </div>
            <input type="button" className="loadCancle" value="닫기" onClick={() =>{
                setLoad("none")
            }}/>
        </div>

        <div id="createHeader">
            <div id="createMainMenu">
                <input type="text" id="documentTitle" placeholder="새 문서 이름" style={{display : state === null ? "none" : "inline-block"}}/>
                <input className="mainBtn" type="button" style={{display : state === null ? "none" : "inline-block"}} onClick={() => {
                    if(title === ""){
                        console.log("새 문서 저장")
                        axios.post("/document/new", {
                            fileOrgName : document.getElementById("documentTitle").value,
                            innerHTML : quillRef.current.root.innerHTML
                        }, {
                            headers : {
                                "access" : state.check
                            }
                        }).then((response) => {
                            if(response.data !== "duplicate"){
                                setTitle(document.getElementById("documentTitle").value)

                            }else if(response.data === "duplicate"){
                                alert("파일명이 중복됩니다.")
                            }
                        }).catch((error) => {
                            if(error.code === "ERR_BAD_REQUEST"){
                                axios.post("/reissue").then((response) => {
                                    let temp = state;
                                    temp.chcek = response.headers.access
                                    setState(temp)
                
                                })
                            }
                        });
                    }else{
                        console.log("기존 문서 저장")
                        axios.post("/document/save", {
                            fileOrgName : title,
                            innerHTML : quillRef.current.root.innerHTML
                        }, {
                            headers : {
                                "access" : state.check
                            }
                        }).then((response) => {
                            if(response.status === 200){
                                
                            }else{
                                alert("오류")
                            }
                        }).catch((error) => {
                            if(error.code === "ERR_BAD_REQUEST"){
                                axios.post("/reissue").then((response) => {
                                    let temp = state;
                                    temp.chcek = response.headers.access
                                    setState(temp)
                
                                })
                            }
                        });;
                    }
                    
                }} value="저장"/>
                
                <input className="mainBtn" type="button" style={{display : state === null ? "none" : "inline-block"}} onClick={() => {
                    /*
                        공식 홈페이지를 보면 삽입하는 방식이 있는데 이를 사용하거나
                        단순히 useEffect해서 ql-container.innerHTML에 넣는 방식으로 진행
                    */
                    axios.get("/document/list", {
                        headers : {
                            "access" : state.check
                        }
                    }).then((response) => {
                        let temp = [];
                        if(response.status === 200){
                            console.log("==== File List ====")
                            console.log(response.data)
                            for(let i = 0; i < response.data.length; i++){
                                temp.push(<div className="documentBlock" onClick={() => {
                                    axios.get("/document/load?document="+response.data[i].document_name, {
                                        headers : {
                                            "access" : state.check
                                        }
                                    }).then((res) => {
                                        if(res.status === 200){
                                            setTitle(response.data[i].document_name);
                                            console.log("==== File Info ====")
                                            console.log(res.data);
                                            quillRef.current.root.innerHTML = res.data.innerHTML;
                                            setEdit(res.data);
                                            setLoad("none");
                                        }
                                    }).catch((error) => {
                                        if(error.code === "ERR_BAD_REQUEST"){
                                            axios.post("/reissue").then((response) => {
                                                let temp = state;
                                                temp.chcek = response.headers.access
                                                setState(temp)
                            
                                            })
                                        }
                                    });
                                }}>
                                    {response.data[i].document_name}
                                </div>)
                            }
                            setDocuments([...temp]);
                        }
                    }).catch((error) => {
                        if(error.code === "ERR_BAD_REQUEST"){
                            axios.post("/reissue").then((response) => {
                                let temp = state;
                                temp.chcek = response.headers.access
                                setState(temp)
            
                            })
                        }
                    });


                   setLoad("block")
                }} value="불러오기"/>

                <input className="mainBtn" type="button" onClick={() => {
                    quillRef.current.root.innerHTML = "";
                   document.getElementById("documentTitle").value = "";
                   setTitle("");
                }} value="새로 만들기"/>

                <input className="mainBtn" type="button" onClick={() => {
                    navigate("/preview", {
                        state : {
                            innerHTML : quillRef.current.root.innerHTML,
                            // id : state.id,
                            // check : state.check
                            // 비회원기능 땜에 추후 고려
                        }
                    });
                }} value="출력"/>
                

                <span className="documentName">
                    {title === "" ? "새 문서" : title}
                </span>
            </div>
            
        </div>
        
        <div id="createBody">
            <Editor
                ref={quillRef}
                readOnly={readOnly}
                onSelectionChange={setRange}
                onTextChange={setLastChange}>
            </Editor>
            
        </div>
    </div>
}


{/* <div className="controls">
    <label>
        Read Only:{' '}
        <input
            type="checkbox"
            value={readOnly}
            onChange={(e) => setReadOnly(e.target.checked)}
        />
    </label>
    <button
        className="controls-right"
        type="button"
        onClick={() => {
            alert(quillRef.current?.getLength());
        }}
    >
        Get Content Length
    </button>
</div>
<div className="state">
    <div className="state-title">Current Range:</div>
    {range ? JSON.stringify(range) : 'Empty'}
</div>
<div className="state">
    <div className="state-title">Last Change:</div>
    {lastChange ? JSON.stringify(lastChange.ops) : 'Empty'}
</div> */}