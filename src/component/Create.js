import "./create.css";
import { useState, useRef, useEffect } from "react"
import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import { Cookies } from "react-cookie";
import Editor from "./Edtior";
import Quill from "quill";
import React from "react";
import axios from "axios";

const Delta = Quill.import('delta');

export default function Create(){
    const cookies = new Cookies();
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [state, setState] = useState(location.state);
    const quillRef = useRef();
    const toolbarRef = useRef();

    const [range, setRange] = useState();
    const [lastChange, setLastChange] = useState();
    const [readOnly, setReadOnly] = useState(false);
    const [title, setTitle] = useState("");
    const [load, setLoad] = useState("none")
    const [documents, setDocuments] = useState([]); // 문서 목록
    const [imgCheck, setImageCheck] = useState("none");
    const [imgTarget, setImgTarget] = useState();
    const [shareCode, setShareCode] = useState("");
    const [documentInfo, setDocumentInfo] = useState();

    const [toolbarHeight, setToolbarHeight] = useState("0px");

    useEffect(() => {
<<<<<<< HEAD

=======
        
>>>>>>> e19d44668882260d097d58543a1f29822e473ff7
        if(params.documentCode !== undefined){
            axios.get("/share/load/document?code="+params.documentCode)
            .then((response) => {
                if(response.status === 200){
<<<<<<< HEAD

=======
>>>>>>> e19d44668882260d097d58543a1f29822e473ff7
                    if(response.data.password !== "NONE"){
                        while((prompt("비밀번호를 입력해주세요.")) !== response.data.password){

                        }

                    }
                    setTitle(response.data.fileOrgName);
                    quillRef.current.root.innerHTML = response.data.innerHTML;
                    setLoad("none");

                    axios.get("/share/load?documentId="+response.data.document_id).then((response) => {
                        setShareCode(response.data.share_code);
                    });
                }
            })
        }

    }, [])

    useEffect(()=>{
        // 이미지 리사이즈 
        if(document.getElementsByTagName("img").length > 0){
            let imgArr = document.getElementsByTagName("img");
            for(let i = 0; i < imgArr.length; i++){
                imgArr[i].addEventListener("click", (event) => {
                    let temp = document.getElementById("imgResize");
                    temp.style.marginTop = event.pageY + "px ";
                    temp.style.marginLeft = event.pageX + "px";
                    setImageCheck("block")
                    setImgTarget(event.target);
                })

            }
            
        }

        // 편집 에디터 글 작성 영역 높이를 변하는 가로크기에 비례하여 바꾸기
        if(document.getElementsByClassName("ql-toolbar").length > 0 && document.getElementsByClassName("ql-toolbar") !== null){
            document.getElementById("scrollbar").style.marginTop = document.getElementsByClassName("ql-toolbar")[0].offsetHeight + "px";
        }
        if(document.getElementsByClassName("ql-editor").length > 0 && document.getElementsByClassName("ql-editor") !== null){
            document.getElementsByClassName("ql-editor")[0].style.minHeight = (document.getElementsByClassName("ql-editor")[0].offsetWidth * 1.414) + "px";
            document.getElementById("scrollbar").style.minHeight = (document.getElementsByClassName("ql-editor")[0].offsetWidth * 1.414) + "px"
        }

        // 브라우저 가로 비율의 맞추어 A4출력 시 예상 높이를 스크롤바 블럭에 설정
        if(document.getElementsByClassName("scrollblock").length > 0 && document.getElementsByClassName("scrollblock") !== null){
            let blocks = document.getElementsByClassName("scrollblock");
            for(let i = 0; i < blocks.length; i++){
                blocks[i].style.height =  (document.getElementsByClassName("ql-editor")[0].offsetWidth * 1.414) + "px";
            }
        }

        // 현재 문서 길이에 맞추어 스크롤바 블록 개수를 생성
        if(document.getElementsByClassName("ql-editor").length > 0 && document.getElementsByClassName("ql-toolbar") !== null){

            let widthAuto = document.getElementsByClassName("ql-editor")[0].offsetWidth;
            let heightAuto = document.getElementsByClassName("ql-editor")[0].offsetHeight;
            let ratio = heightAuto / widthAuto;

            if(document.getElementById("scrollbar") !== null) {
                let length = document.getElementById("scrollbar").children.length;
                if(length < ratio / 1.414){
                    let scrollBlock = document.createElement("div");
                    scrollBlock.setAttribute("class", "scrollblock");
                    document.getElementById("scrollbar").append(scrollBlock);
                }else if(length > ratio / 1.414){
                    document.getElementById("scrollbar").removeChild(document.getElementById("scrollbar").children[length - 1]);
                }
            }
        }

        // 브라우저 크기에 따라 줄 자 변경
        window.onresize = () => {
            if(document.getElementById("scrollbar") !== null){
                document.getElementById("scrollbar").style.marginTop = document.getElementsByClassName("ql-toolbar")[0].offsetHeight + "px";
            }
        }
    })
    

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
                        axios.post("/document/new", {
                            fileOrgName : document.getElementById("documentTitle").value,
                            innerHTML : quillRef.current.root.innerHTML
                        }, {
                            headers : {
                                "access" : cookies.get("access")
                            }
                        }).then((response) => {
                            if(response.data !== "duplicate"){
                                setTitle(document.getElementById("documentTitle").value)
                                // 공유 엔티티 저장

                                let password = prompt("비밀번호를 입력해주세요(암호 설정을 안하실 경우 NONE을 입력해주세요)");

                                axios.post("/share/new", {
                                    document_id : response.data,
                                    share_password : password
                                }, {
                                    headers : {
                                        "access" : cookies.get("access")
                                    }
                                }).then((response) => {
                                    // 공유 번호 
                                    setShareCode(response.data.share_code);
                                })

                            }else if(response.data === "duplicate"){
                                alert("파일명이 중복됩니다.")
                            }
                        }).catch((error) => {
                            if(error.response.data === "access token expired"){
                                axios.post("/reissue").then((response) => {
                                    let temp = state;
                                    temp.chcek = response.headers.access
                                    setState(temp)
                
                                })
                            }
                        });
                    }else{
                        axios.post("/document/save", {
                            fileOrgName : title,
                            innerHTML : quillRef.current.root.innerHTML
                        }, {
                            headers : {
                                "access" : cookies.get("access")
                            }
                        }).then((response) => {
                            if(response.status === 200){

                            }else{
                                alert("오류")
                            }
                        }).catch((error) => {
                            if(error.response.data === "access token expired"){
                                axios.post("/reissue").then((response) => {
                                    let temp = state;
                                    temp.chcek = response.headers.access
                                    setState(temp)
                
                                })
                            }
                        });
                    }
                    
                }} value="저장"/>
                
                <input className="mainBtn" type="button" style={{display : state === null ? "none" : "inline-block"}} onClick={() => {
                    /*
                        공식 홈페이지를 보면 삽입하는 방식이 있는데 이를 사용하거나
                        단순히 useEffect해서 ql-container.innerHTML에 넣는 방식으로 진행
                    */
                    axios.get("/document/list", {
                        headers : {
                            "access" : cookies.get("access")
                        }
                    }).then((response) => {
                        let temp = [];
                        if(response.status === 200){
                            for(let i = 0; i < response.data.length; i++){
                                temp.push(<div className="documentBlock" onClick={() => {
                                    axios.get("/document/load?document="+response.data[i].document_name, {
                                        headers : {
                                            "access" : cookies.get("access")
                                        }
                                    }).then((res) => {
                                        if(res.status === 200){
                                            setTitle(response.data[i].document_name);
                                            quillRef.current.root.innerHTML = res.data.innerHTML;
                                            setLoad("none");

                                            axios.get("/share/load?documentId="+response.data[i].document_id, {
                                                headers : {
                                                    "access" : cookies.get("access")
                                                }
                                            }).then((response) => {
                                                setShareCode(response.data.share_code);
                                            });

                                        }
                                    }).catch((error) => {
                                        if(error.response.data === "access token expired"){
                                            axios.post("/reissue").then((response) => {
                                                let temp = state;
                                                temp.chcek = response.headers.access
                                                setState(temp)
                            
                                            })
                                        }
                                    });
                                }}>
                                    {response.data[i].document_name}


                                    <input type="button" className="shareBtn" style={{background : "rgb(250,10,10)"}} value="삭제" onClick={() => {
                                        if(window.confirm(`${response.data[i].document_name} 문서를 삭제하실껀가요?`) === false) return
                                        axios.get("/document/delete?documentId="+response.data[i].document_id, {
                                            headers : {
                                                "access" : cookies.get("access")
                                            }
                                        }).then((response) => {
                                            if(response.status === 200){
                                                alert("삭제되었습니다.")
                                                setLoad("none");
                                            }
                                        });

                                    }}/>

                                    <input type="button" className="shareBtn" style={{background : "rgb(84, 216, 84)"}} value="공유" onClick={() => {
                                        axios.get("/share/load?documentId="+response.data[i].document_id, {
                                            headers : {
                                                "access" : cookies.get("access")
                                            }
                                        }).then((response) => {
                                            let addr = "http://211.188.51.27:8080/#/create/"+response.data.share_code;
                                            alert(addr);
                                        });

                                    }}/>


                                    
                                </div>)
                            }
                            setDocuments([...temp]);
                        }
                    }).catch((error) => {
                        if(error.response.data === "access token expired"){
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
                            id : state.id,
                            check : cookies.get("access"),
                            innerHTML : quillRef.current.root.innerHTML
                        }
                    });
                }} value="출력"/>
                

                <span className="documentName">
                    {title === "" ? "새 문서" : title}
                </span>

                <input id="insert-table" className="mainBtn" type="button" value="표 삽입"/>

                <input className="mainBtn" type="button" value="공유" onClick={() => {
                    alert("http://211.188.51.27:8080/#/create/"+shareCode);
                }}/>

                <input className="mainBtn" type="button" value="보고서" onClick={() => {
                    quillRef.current.root.innerHTML = `<p><br></p><div class="quill-better-table-wrapper"><table class="quill-better-table" style="width: 242px; float : right; margin-right : 15px"><colgroup><col width="62"><col width="62"><col width="58"><col width="60"></colgroup><tbody><tr data-row="row-gzl9"><td data-row="row-gzl9" rowspan="1" colspan="1" style="background-color:rgb(200,200,200)"><p class="qlbt-cell-line ql-align-center" data-row="row-gzl9" data-cell="cell-jpuq" data-rowspan="1" data-colspan="1">담 당</p></td><td data-row="row-gzl9" rowspan="1" colspan="1" style="background-color:rgb(200,200,200)"><p class="qlbt-cell-line ql-align-center" data-row="row-gzl9" data-cell="cell-kj1v" data-rowspan="1" data-colspan="1"><br></p></td><td data-row="row-gzl9" rowspan="1" colspan="1" style="background-color:rgb(200,200,200)"><p class="qlbt-cell-line ql-align-center" data-row="row-gzl9" data-cell="cell-leoo" data-rowspan="1" data-colspan="1"><br></p></td><td data-row="row-gzl9" rowspan="1" colspan="1" style="background-color:rgb(200,200,200)"><p class="qlbt-cell-line ql-align-center" data-row="row-gzl9" data-cell="cell-mv6b" data-rowspan="1" data-colspan="1"><br></p></td></tr><tr data-row="row-fq2j"><td data-row="row-fq2j" rowspan="1" colspan="1"><p class="qlbt-cell-line ql-align-center" data-row="row-fq2j" data-cell="cell-q5sc" data-rowspan="1" data-colspan="1"><br></p></td><td data-row="row-fq2j" rowspan="1" colspan="1"><p class="qlbt-cell-line ql-align-center" data-row="row-fq2j" data-cell="cell-2r7l" data-rowspan="1" data-colspan="1"><br></p></td><td data-row="row-fq2j" rowspan="1" colspan="1"><p class="qlbt-cell-line ql-align-center" data-row="row-fq2j" data-cell="cell-yj4b" data-rowspan="1" data-colspan="1"><br></p></td><td data-row="row-fq2j" rowspan="1" colspan="1"><p class="qlbt-cell-line ql-align-center" data-row="row-fq2j" data-cell="cell-y9i4" data-rowspan="1" data-colspan="1"><br></p></td></tr><tr data-row="row-8img"><td data-row="row-8img" rowspan="1" colspan="1"><p class="qlbt-cell-line ql-align-center" data-row="row-8img" data-cell="cell-xubt" data-rowspan="1" data-colspan="1"><br></p></td><td data-row="row-8img" rowspan="1" colspan="1"><p class="qlbt-cell-line ql-align-center" data-row="row-8img" data-cell="cell-duiy" data-rowspan="1" data-colspan="1"><br></p></td><td data-row="row-8img" rowspan="1" colspan="1"><p class="qlbt-cell-line ql-align-center" data-row="row-8img" data-cell="cell-y8t2" data-rowspan="1" data-colspan="1"><br></p></td><td data-row="row-8img" rowspan="1" colspan="1"><p class="qlbt-cell-line ql-align-center" data-row="row-8img" data-cell="cell-6c8i" data-rowspan="1" data-colspan="1"><br></p></td></tr></tbody></table></div><p><br></p><p><br></p><h2 class="ql-align-center">업무보고서</h2><p><br></p><p><br></p><div class="quill-better-table-wrapper"><table class="quill-better-table" style="width: 100%;"><colgroup><col width="109"><col width="109"><col width="98"><col width="106"></colgroup><tbody><tr data-row="row-oksz"><td data-row="row-oksz" rowspan="1" colspan="1" data-cell-bg="yellow" style="background-color: rgb(200,200,200);"><p class="qlbt-cell-line ql-align-center" data-row="row-oksz" data-cell="cell-i35v" data-rowspan="1" data-colspan="1" data-cell-bg="yellow">보고일자</p></td><td data-row="row-oksz" rowspan="1" colspan="1"><p class="qlbt-cell-line" data-row="row-oksz" data-cell="cell-rhvl" data-rowspan="1" data-colspan="1"><br></p></td><td data-row="row-oksz" rowspan="1" colspan="1" data-cell-bg="yellow" style="background-color: rgb(200,200,200);"><p class="qlbt-cell-line ql-align-center" data-row="row-oksz" data-cell="cell-gcfi" data-rowspan="1" data-colspan="1" data-cell-bg="yellow">부 서</p></td><td data-row="row-oksz" rowspan="1" colspan="1"><p class="qlbt-cell-line" data-row="row-oksz" data-cell="cell-rct7" data-rowspan="1" data-colspan="1"><br></p></td></tr><tr data-row="row-rkse"><td data-row="row-rkse" rowspan="1" colspan="1" data-cell-bg="yellow" style="background-color: rgb(200,200,200);"><p class="qlbt-cell-line ql-align-center" data-row="row-rkse" data-cell="cell-7zzj" data-rowspan="1" data-colspan="1" data-cell-bg="yellow">직 급</p></td><td data-row="row-rkse" rowspan="1" colspan="1"><p class="qlbt-cell-line" data-row="row-rkse" data-cell="cell-mdwf" data-rowspan="1" data-colspan="1"><br></p></td><td data-row="row-rkse" rowspan="1" colspan="1" data-cell-bg="yellow" style="background-color: rgb(200,200,200);"><p class="qlbt-cell-line ql-align-center" data-row="row-rkse" data-cell="cell-dpum" data-rowspan="1" data-colspan="1" data-cell-bg="yellow">보고자</p></td><td data-row="row-rkse" rowspan="1" colspan="1"><p class="qlbt-cell-line" data-row="row-rkse" data-cell="cell-7blz" data-rowspan="1" data-colspan="1"><br></p></td></tr><tr data-row="row-mp26"><td data-row="row-mp26" rowspan="1" colspan="2" data-cell-bg="yellow" style="background-color: rgb(200,200,200);"><p class="qlbt-cell-line ql-align-center" data-row="row-mp26" data-cell="cell-qi1i" data-rowspan="1" data-colspan="2" data-cell-bg="yellow">보고안건</p></td><td data-row="row-mp26" rowspan="1" colspan="2" data-cell-bg="yellow" style="background-color: rgb(200,200,200);"><p class="qlbt-cell-line ql-align-center" data-row="row-mp26" data-cell="cell-pbv2" data-rowspan="1" data-colspan="2" data-cell-bg="yellow">진행기간</p></td></tr><tr data-row="row-m1cp"><td data-row="row-m1cp" rowspan="1" colspan="2"><p class="qlbt-cell-line" data-row="row-m1cp" data-cell="cell-ftlo" data-rowspan="1" data-colspan="2"><br></p><p class="qlbt-cell-line" data-row="row-m1cp" data-cell="cell-ftlo" data-rowspan="1" data-colspan="2"><br></p></td><td data-row="row-m1cp" rowspan="1" colspan="2"><p class="qlbt-cell-line" data-row="row-m1cp" data-cell="cell-na0i" data-rowspan="1" data-colspan="2"><br></p><p class="qlbt-cell-line" data-row="row-m1cp" data-cell="cell-na0i" data-rowspan="1" data-colspan="2"><br></p></td></tr><tr data-row="row-poln"><td data-row="row-poln" rowspan="1" colspan="4" data-cell-bg="yellow" style="background-color: rgb(200,200,200)"><p class="qlbt-cell-line ql-align-center" data-row="row-poln" data-cell="cell-s6cg" data-rowspan="1" data-colspan="4" data-cell-bg="yellow">보고목적</p></td></tr><tr data-row="row-yiss"><td data-row="row-yiss" rowspan="1" colspan="4"><p class="qlbt-cell-line" data-row="row-yiss" data-cell="cell-p9nm" data-rowspan="1" data-colspan="4"><br></p><p class="qlbt-cell-line" data-row="row-yiss" data-cell="cell-p9nm" data-rowspan="1" data-colspan="4"><br></p><p class="qlbt-cell-line" data-row="row-yiss" data-cell="cell-p9nm" data-rowspan="1" data-colspan="4"><br></p><p class="qlbt-cell-line" data-row="row-yiss" data-cell="cell-p9nm" data-rowspan="1" data-colspan="4"><br></p><p class="qlbt-cell-line" data-row="row-yiss" data-cell="cell-p9nm" data-rowspan="1" data-colspan="4"><br></p></td></tr><tr data-row="row-l7dc"><td data-row="row-l7dc" rowspan="1" colspan="4" data-cell-bg="yellow" style="background-color: rgb(200,200,200);"><p class="qlbt-cell-line ql-align-center" data-row="row-l7dc" data-cell="cell-ew81" data-rowspan="1" data-colspan="4" data-cell-bg="yellow">진행상황</p></td></tr><tr data-row="row-pin2"><td data-row="row-pin2" rowspan="1" colspan="4"><p class="qlbt-cell-line" data-row="row-pin2" data-cell="cell-2gph" data-rowspan="1" data-colspan="4"><br></p><p class="qlbt-cell-line" data-row="row-pin2" data-cell="cell-2gph" data-rowspan="1" data-colspan="4"><br></p><p class="qlbt-cell-line" data-row="row-pin2" data-cell="cell-2gph" data-rowspan="1" data-colspan="4"><br></p><p class="qlbt-cell-line" data-row="row-pin2" data-cell="cell-2gph" data-rowspan="1" data-colspan="4"><br></p><p class="qlbt-cell-line" data-row="row-pin2" data-cell="cell-2gph" data-rowspan="1" data-colspan="4"><br></p></td></tr><tr data-row="row-1jhk"><td data-row="row-1jhk" rowspan="1" colspan="4" data-cell-bg="yellow" style="background-color: rgb(200,200,200)"><p class="qlbt-cell-line ql-align-center" data-row="row-1jhk" data-cell="cell-yp8o" data-rowspan="1" data-colspan="4" data-cell-bg="yellow">업무결과</p></td></tr><tr data-row="row-hq7w"><td data-row="row-hq7w" rowspan="1" colspan="4"><p class="qlbt-cell-line" data-row="row-hq7w" data-cell="cell-gmru" data-rowspan="1" data-colspan="4"><br></p><p class="qlbt-cell-line" data-row="row-hq7w" data-cell="cell-gmru" data-rowspan="1" data-colspan="4"><br></p><p class="qlbt-cell-line" data-row="row-hq7w" data-cell="cell-gmru" data-rowspan="1" data-colspan="4"><br></p><p class="qlbt-cell-line" data-row="row-hq7w" data-cell="cell-gmru" data-rowspan="1" data-colspan="4"><br></p><p class="qlbt-cell-line" data-row="row-hq7w" data-cell="cell-gmru" data-rowspan="1" data-colspan="4"><br></p></td></tr><tr data-row="row-ntxt"><td data-row="row-ntxt" rowspan="1" colspan="4" data-cell-bg="yellow" style="background-color: rgb(200,200,200)"><p class="qlbt-cell-line ql-align-center" data-row="row-ntxt" data-cell="cell-bmz3" data-rowspan="1" data-colspan="4" data-cell-bg="yellow">첨부자료</p></td></tr><tr data-row="row-dn72"><td data-row="row-dn72" rowspan="1" colspan="4"><p class="qlbt-cell-line" data-row="row-dn72" data-cell="cell-1t5d" data-rowspan="1" data-colspan="4"><br></p><p class="qlbt-cell-line" data-row="row-dn72" data-cell="cell-1t5d" data-rowspan="1" data-colspan="4"><br></p><p class="qlbt-cell-line" data-row="row-dn72" data-cell="cell-1t5d" data-rowspan="1" data-colspan="4"><br></p><p class="qlbt-cell-line" data-row="row-dn72" data-cell="cell-1t5d" data-rowspan="1" data-colspan="4"><br></p><p class="qlbt-cell-line" data-row="row-dn72" data-cell="cell-1t5d" data-rowspan="1" data-colspan="4"><br></p><p class="qlbt-cell-line" data-row="row-dn72" data-cell="cell-1t5d" data-rowspan="1" data-colspan="4"><br></p></td></tr></tbody></table></div><p class="ql-align-center"><br></p><p><br></p>`;
                }}/>
            </div>
            
        </div>
        
        <div id="createBody">
            <div id="imgResize" style={{display : imgCheck}}>
                크기 <input type="text" id="imgValue" placeholder="숫자만 입력해주세요" onKeyDown={(event) => {
                    if(event.code === "Enter" && event.nativeEvent.isComposing === false){
                        if(isNaN(document.getElementById("imgValue").value)) return
                        imgTarget.style.width = document.getElementById("imgValue").value + "%";
                        setImgTarget(null)
                        setImageCheck("none");
                    }
                }}/>%
                <input type="button" className="imgReBtn" value="변경" onClick={() => {
                    if(isNaN(document.getElementById("imgValue").value)) return
                    imgTarget.style.width = document.getElementById("imgValue").value + "%";
                    setImgTarget(null)
                    setImageCheck("none");
                }}/>
                <input type="button" className="imgReBtn" value="닫기" onClick={() => {
                    
                    setImgTarget(null)
                    setImageCheck("none");
                }}/>
            </div>
            <Editor
                ref={quillRef}
                readOnly={readOnly}
                onSelectionChange={setRange}
                lastChange={lastChange}
                onTextChange={setLastChange}>
            </Editor>
            <div id='scrollbar'>
            </div>
        </div>
    </div>
}

/**
 *  에디터의 가로 폭과 세로 높이를 계속해서 확인하면서 세로 / 가로 했을 때 1.414의 몇배인지에 따라
 *  1.414 높이에 scrollBlock를 scrollbar안에 자식태그를 넣음으로써 A4사이즈 임을 알려주는 방식
 * 
 * 아니면 lineHeight를 1.414를 해서 그 때마다 줄을 넣거나 아이콘 등을 넣어 표시한다.
 * 
 */

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



                {/* <div id="editorPadding">
                    <input type="text" id="paddingValue"/>
                    <input className="mainBtn" type="button" value="여백설정" onClick={()=>{
                        document.getElementsByClassName("ql-editor")[0].style.padding = document.getElementById("paddingValue").value + 'px';
                    }}/>
                </div> */}
                {/* <button id="get-table">Get table</button>
                <button id="get-contents">Get contents</button> */}

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
