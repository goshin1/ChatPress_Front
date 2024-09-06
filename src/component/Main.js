import axios from "axios";
import "./main.css";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SockJS from "sockjs-client";

export default function Main(){
    const navigate = useNavigate();
    const location = useLocation();
    const [state, setState] = useState(location.state);
    const [leftBar, setLeftBar] = useState("0%"); // 옆에 바 활성화
    const [profile, setProfile] = useState();
    const [room, setRoom] = useState([]); // 채팅방 목록
    const [chat, setChat] = useState([]); // 채팅 목록
    const [num, setNum] = useState(0); // 선택한 방의 id
    const [select, setSelect] = useState(""); // 선택한 방의 토큰값
    const [upload, setUpload] = useState("none"); // 파일 업로드 팝업창
    const [popupType, setPopupType] = useState(); // 팝업 창  
    const [memberDict, setMemberDict] = useState({}); // 멤버 정보 목록
    const [leader, setLeader] = useState(false); // 방장일 경우 true    

    // 채팅 블럭 테스트
    // <div key={chat.length + 1} className="chatBlock">
    //     <div className="chatIcon">
    //         <img src={require("../img/menu.png")}/>
    //         테스또
    //     </div>
    //     <div className="chatContent">
    //         <pre>
    //             dddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
    //             dddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
    //             dddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
    //             dddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
    //             dddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
    //             dddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
    //             asdsadsadsada
    //         </pre>
    //     </div>
    // </div>

    // 소켓 연결을 함수화 해서 방을 클릭할 때 해당 토큰 값으로 바로 변경

    // const socketConnect = () => {
    //     let socket = new SockJS("/socket");
    //     socket.onopen = () =>{
    //         socket.send(JSON.stringify({chatRoomId : select, type : "JOIN"}));
    //     }

    //     socket.onmessage = (e) => {
    //         let content = JSON.parse(e.data);
    //         let type = content.type;
    //         if(type == "SEND"){
    //             let temp;
    //             if(content.fileType === "text"){
    //                 temp = <div className="chatContent">
    //                             <pre>
    //                                 {content.message}
    //                             </pre>
    //                         </div>;
    //             }else if(content.fileType === "image"){
    //                 temp = <div className="chatContent">
    //                             <img src={content.message}/>
    //                         </div>;
    //             }else if(content.fileType === "file"){
    //                 temp = <div className="chatContent">
    //                             <a href={"http://localhost:8080"+content.message} download>파일 다운로드</a>
    //                         </div>;
    //             }
                
    //             chat.push(<div key={chat.length + 1} className="chatBlock">
    //                 <div className="chatIcon">
    //                     <img src={memberDict[content.user]}/>
    //                     {content.user}
    //                 </div>
    //                 {temp}
    //             </div>);
                
    //             setChat([...chat]);
                
    //         }
    //     };

    //     socket.onerror = (err) => {
    //         socket.close();
    //         socket = new SockJS("/socket")
    //     }
    // }

    console.log(num + " : " + select)

    let socket = new SockJS("/socket");
    
    useEffect(() => {
        console.log("room Change")
        
        console.log("socket start!")
        

            axios.get("/chat/list?id=" + num, {
                headers : {
                    "access" : state.check
                }
            })
            .then((response) => {
                let res = response.data;
                let tempArr = [];
                for(let i = 0; i < res.length; i++){
                    let temp;
                    if(res[i].chat_type === "text"){
                        temp = <div className="chatContent">
                                    <pre>
                                        {res[i].chat_message}
                                    </pre>
                                </div>;
                    }else if(res[i].chat_type === "image"){
                        temp = <div className="chatContent">
                                    <img src={res[i].chat_message}/>
                                </div>;
                    }else if(res[i].chat_type === "file"){
                        temp = <div className="chatContent">
                                    <a href={"http://localhost:8080"+res[i].chat_message} download>파일 다운로드</a>
                                </div>;
                    }

                    tempArr.push(<div key={i} className="chatBlock">
                        <div className="chatIcon">
                            <img src={memberDict[res[i].chat_user_nickname]}/>
                            {res[i].chat_user_nickname}
                        </div>
                        {temp}
                    </div>);
                }

                setChat([...tempArr]);
                

                // 문제는 위 내용에서 채팅 블럭을 바꿔도 아래에서는 이전 채팅 블럭을 기억하고 있는 것이 문제
                // 그러므로 초기화를 애초에 위로 하면 될 듯
                
                axios.get("/room/depart?id="+num, {
                    headers : {
                        "access" : state.check
                    }
                }).then((response) => {
                    setSelect(response.data)
                })

            })
            .catch((error) => {
                if(error.code === "ERR_BAD_REQUEST"){
                    axios.post("/reissue").then((response) => {
                        let temp = state;
                        temp.chcek = response.headers.access
                        setState(temp)
    
                    })
                }
            });

            

    }, [num])


    useEffect(() => {
        console.log("room change " + num + " : " + select)
        socket.onopen = () =>{
            socket.send(JSON.stringify({chatRoomId : select, type : "JOIN"}));
        }

        socket.onmessage = (e) => {
            console.log("chat!")
            let content = JSON.parse(e.data);
            let type = content.type;
            if(type == "SEND"){
                let temp;
                if(content.fileType === "text"){
                    temp = <div className="chatContent">
                                <pre>
                                    {content.message}
                                </pre>
                            </div>;
                }else if(content.fileType === "image"){
                    temp = <div className="chatContent">
                                <img src={content.message}/>
                            </div>;
                }else if(content.fileType === "file"){
                    temp = <div className="chatContent">
                                <a href={"http://localhost:8080"+content.message} download>파일 다운로드</a>
                            </div>;
                }
                
                chat.push(<div key={chat.length + 1} className="chatBlock">
                    <div className="chatIcon">
                        <img src={memberDict[content.user]}/>
                        {content.user}
                    </div>
                    {temp}
                </div>);
                console.log("소켓 시 채팅 배열 근황")
                console.log(chat)
                setChat([...chat]);
                
            }
        };
    
        socket.onerror = (err) => {
            socket.close();
            socket = new SockJS("/socket")
        }
    }, [select]);

    useEffect(() => {
        console.log("init")
        axios.get("/user/info", {
            headers : {
                "access" : state.check
            }
        }).then((response) => {
            setProfile(response.data)
        }).catch((error) => {
            if(error.code === "ERR_BAD_REQUEST"){
                axios.post("/reissue").then((response) => {
                    let temp = state;
                    temp.chcek = response.headers.access
                    setState(temp)

                })
            }
        });

        // 초대 목록 조회
        axios.get("/invite/list", {
            headers : {
                "access" : state.check
            }
        }).then((response) => {
            console.log(response.data)
            if(response.data.length > 0){
                let temp = [];
                for(let i = 0; i < response.data.length; i++){
                    temp.push(
                        <div className="inviteBlock">
                            {response.data[i].room_name}
                            <input className="entryBtn" type="button" value="입장" onClick={() => {
                                axios.get("/invite/exit?code="+response.data[i].room_token, {
                                    headers : {
                                        "access" : state.check
                                    }
                                }).then((response) => {
                                    if(response.status !== 200){
                                        return;
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
                                
                                console.log("리스트 "+response.data[i].room_token)
                                axios.get("/room/code?code="+response.data[i].room_token, {
                                    headers : {
                                        "access" : state.check
                                    }
                                })
                                .then((response) => {
                                    console.log("결과 " + response.data === "Ok")
                                    if(response.data === "Ok"){
                                        axios.get("/room/ulist", {
                                            headers : {
                                                "access" : state.check
                                            }
                                        })
                                        .then(response => {
                                            let info = response.data;
                                            let block = [];
                                            for(let i = 0; i < info.length; i++){
                                                block.push(
                                                    <div id={"room_" + info[i].room_id} key={"room_" + info[i].room_id}
                                                    className="roomBlock" onClick={(event) => {
                                                        
                                                        setNum(info[i].room_id);
                                                        // 해당 room_id를 서버에 보내 방의 토큰값을 받아와 소켓 연결을 시작
                                                        
                                                    }}>

                                                        <div className="roomName">
                                                            {info[i].room_name}
                                                        </div>
                                                    </div>
                                                );
                                            }
            
                                            setRoom(block);
                                        }).catch((error) => {
                                            if(error.code === "ERR_BAD_REQUEST"){
                                                axios.post("/reissue").then((response) => {
                                                    let temp = state;
                                                    temp.chcek = response.headers.access
                                                    setState(temp)
                                
                                                })
                                            }
                                        });
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

                            }}/>
                        </div>
                    )
                }


                setUpload("block");
                setPopupType(
                    <>
                        <p>받은 초대</p>
                        <div id="inviteList">
                            {temp}
                        </div>
                        <input type="button" id="closeBtn" value="닫기" onClick={() => {
                            setUpload("none");
                            setPopupType();
                        }}/>
                    </>
                )
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


        // 해당 유저에 방을 조회
        axios.get("/room/ulist", {
            headers : {
                "access" : state.check
            }
        })
        .then(response => {
            let info = response.data;
            console.log(info)
            // 초기 정보 설정(초기화 함으로써 처음을 설정)
            if(response.data.length <= 0) return;
            console.log(state.id + " " + info[0].room_leader)
            if(state.id === info[0].room_leader)
                setLeader(true);
            axios.get("/room/members/"+response.data[0].room_token, {
                headers : {
                    "access" : state.check
                }
            }).then((response) => {
                let temp = {};
                for(let i = 0; i < response.data.length; i++){
                    temp[response.data[i].user_nickname]=response.data[i].user_icon_path;
                }
                setMemberDict(temp);
            }).catch((error) => {
                if(error.code === "ERR_BAD_REQUEST"){
                    axios.post("/reissue").then((response) => {
                        let temp = state;
                        temp.chcek = response.headers.access
                        setState(temp)
    
                    })
                }
            });

            // 방 목록 생성
            let block = [];
            for(let i = 0; i < info.length; i++){
                block.push(
                    <div id={"room_" + info[i].room_id} key={"room_" + info[i].room_id}
                        className="roomBlock" onClick={(event) => {
                        
                        setNum(info[i].room_id);
                        axios.get("/room/depart?id="+info[i].room_id, {
                            headers : {
                                "access" : state.check
                            }
                        })
                        .then((response) => {
                            console.log(state.id + " " + info[i].room_leader)
                            if(state.id === info[i].room_leader)
                                setLeader(true);
                            socket.close();
                            socket = new SockJS("/socket");
                            // setChat([]);
                            // 해당 방의 유저 정보
                            axios.get("/room/members/"+response.data, {
                                headers : {
                                    "access" : state.check
                                }
                            }).then((response) => {
                                let temp = {};
                                for(let i = 0; i < response.data.length; i++){
                                    temp[response.data[i].user_nickname]=response.data[i].user_icon_path;
                                }
                                setMemberDict(temp);
                            }).catch((error) => {
                                if(error.code === "ERR_BAD_REQUEST"){
                                    axios.post("/reissue").then((response) => {
                                        let temp = state;
                                        temp.chcek = response.headers.access
                                        setState(temp)
                    
                                    })
                                }
                            });
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
                        
                        <div className="roomName">
                            {info[i].room_name}
                        </div>
                    </div>
                );
            }

            setRoom(block);
        }).catch((error) => {
            if(error.code === "ERR_BAD_REQUEST"){
                axios.post("/reissue").then((response) => {
                    let temp = state;
                    temp.chcek = response.headers.access
                    setState(temp)

                })
            }
        });
        
    },[]);

    let arr = document.getElementsByClassName("roomBlock");
    for(let i = 0; i < arr.length; i++){
        if(arr[i].id === "room_"+num){
            document.getElementById(arr[i].id).style.backgroundColor = "rgb(230,230,230)";
        }else{
            document.getElementById(arr[i].id).style.backgroundColor = "rgba(255,0,0,0)";
        }
    }


    return <div>
        <div id="roomDiv" style={{width : leftBar}}>
            <div className="roomHeader">
                <input type="text" name="roomName" id="roomName" placeholder="방 이름"/>
                <input type="button" id="roomBtn" value="생성" onClick={() => {
                    let roomName = document.getElementById("roomName").value;
                    if(roomName === "") return;
                    if(roomName.length > 12){
                        alert("채팅방 이름은 12자 이내로 입력해주세요.")
                        return;
                    }

                    axios.get(`/room/create?name=`+roomName, {
                        headers : {
                            "access" : state.check
                        }
                    })
                    .then((response) => {
                        if(response.data === "OK"){
                            alert("방이 생성되었습니다");
                            axios.get("/room/ulist", {
                                headers : {
                                    "access" : state.check
                                }
                            })
                            .then(response => {
                                let info = response.data;
                                let block = [];
                                for(let i = 0; i < info.length; i++){
                                    block.push(
                                        <div id={"room_" + info[i].room_id} key={"room_" + info[i].room_id}
                                        className="roomBlock" onClick={(event) => {
                                            
                                            setNum(info[i].room_id);
                                            if(state.id === info[i].room_leader)
                                                setLeader(true);
                                        }}>
                                            
                                            <div className="roomName">
                                                {info[i].room_name}
                                            </div>
                                        </div>
                                    );
                                }

                                setRoom(block);
                            }).catch((error) => {
                                if(error.code === "ERR_BAD_REQUEST"){
                                    axios.post("/reissue").then((response) => {
                                        let temp = state;
                                        temp.chcek = response.headers.access
                                        setState(temp)
                    
                                    })
                                }
                            });
                        }
                    }).catch((error) => {
                        if(error.code === "ERR_BAD_REQUEST"){
                            axios.post("/reissue").then((response) => {
                                let temp = state;
                                temp.chcek = response.headers.access
                                setState(temp)
            
                            }).catch((error) => {
                                if(error.code === "ERR_BAD_REQUEST"){
                                    axios.post("/reissue").then((response) => {
                                        let temp = state;
                                        temp.chcek = response.headers.access
                                        setState(temp)
                    
                                    })
                                }
                            });
                        }
                    });
                }}/>
            </div>
            
            <div id="roomList">
                
                {room}
            </div>
                
            <div id="createBtnDiv">
                <input className="createBtn" type="button" value="제작" onClick={()=>{
                    navigate("/create", {
                        state : state
                    })
                }}/>
                <input className="createBtn" type="button" value="정보수정" onClick={()=>{
                    navigate("/edit", {
                        state : state
                    })
                }}/>
            </div>
        </div>

                {/* test */}
        <div id="mainDiv">
            <div id="uploadPopup" style={{display : upload}}>
                { popupType }
            </div>
            <div id="chatList">
                { chat }
                

                <div id="chatInsert">
                    <input type="text" id="chatText" name="chatText" onKeyDown={(event) => {
                    if(select === "") return;
                        let text = document.getElementById("chatText").value;
                        if(text === "") return;
                        if(event.code === "Enter"){
                            console.log("select : " + select)
                            socket.send(JSON.stringify({
                                chatRoomId : select,
                                type : "SEND",
                                message : text,
                                user : profile.user_nickname,
                                fileType : "text"}));

                            axios.post("/chat/insert", {
                                chat_user_nickname : profile.user_nickname,
                                chat_message : text,
                                chat_type : "text",
                                room_id : num
                            }, {
                                headers : {
                                    "access" : state.check
                                }
                            }).then(() => {

                            }).catch((error) => {
                                if(error.code === "ERR_BAD_REQUEST"){
                                    axios.post("/reissue").then((response) => {
                                        let temp = state;
                                        temp.chcek = response.headers.access
                                        setState(temp)
                    
                                    })
                                }
                            });
                            document.getElementById("chatText").value = "";
                        }
                    }}/>
                    <input type="button" id="chatSend" name="chatSend" value="전송" onClick={() => {
                    if(select === "") return;
                        let text = document.getElementById("chatText").value;
                        if(text === "") return;
                        console.log("select : " + select)
                        socket.send(JSON.stringify({
                            chatRoomId : select,
                            type : "SEND",
                            message : text,
                            user : profile.user_nickname,
                            fileType : "text"}));
                        axios.post("/chat/insert", {
                            chat_user_nickname : profile.user_nickname,
                            chat_message : text,
                            chat_type : "text",
                            room_id : num
                        }, {
                            headers : {
                                "access" : state.check
                            }
                        }).then(() => {

                        }).catch((error) => {
                            if(error.code === "ERR_BAD_REQUEST"){
                                axios.post("/reissue").then((response) => {
                                    let temp = state;
                                    temp.chcek = response.headers.access
                                    setState(temp)
                
                                })
                            }
                        });
                        document.getElementById("chatText").value = "";
                    }}/>
                </div>
            </div>
            <div id="chatRemocon">
                <div className="remoconIcon" onClick={() => {
                    setLeftBar(leftBar === "0%" ? "90%" : "0%")
                }}>
                    <img src={require("../img/menu.png")}/>
                </div>
                <div className="remoconIcon" onClick={() => {
                    if(select === "") return;
                    setUpload("block");
                    setPopupType(
                        <>
                            <div id="fileRadio">
                                <label> 이미지 <input type="radio" name="file_type" value="image" defaultChecked/></label>
                                <label> 파일 <input type="radio" name="file_type" value="file"/></label>
                            </div>
                            
                            <input type="file" id="file" name="file"/>

                            <input type="button" id="uploadBtn" value="업로드" onClick={() => {
                                let formData = new FormData();
                                if(select === "") return;

                                
                                let fileType = document.querySelector('input[name="file_type"]:checked').value;

                                formData.append("file_type", fileType);
                                formData.append("file", document.getElementById("file").files[0]);
                                formData.append("room_id", num);

                                axios.post("/message/upload", formData, {
                                    headers : {
                                        "Content-Type" : "multipart/form-data",
                                        "access" : state.check
                                    }
                                }).then((response) => {
                                    
                                    socket.send(JSON.stringify({
                                        chatRoomId : select,
                                        type : "SEND",
                                        message : response.data,
                                        user : profile.user_nickname,
                                        fileType : fileType}));
                                    axios.post("/chat/insert", {
                                            chat_user_nickname : profile.user_nickname,
                                            chat_message : response.data,
                                            chat_type : fileType,
                                            room_id : num
                                        }, {
                                            headers : {
                                                "access" : state.check
                                            }
                                        }).then(() => {
            
                                        }).catch((error) => {
                                            if(error.code === "ERR_BAD_REQUEST"){
                                                axios.post("/reissue").then((response) => {
                                                    let temp = state;
                                                    temp.chcek = response.headers.access
                                                    setState(temp)
                                
                                                })
                                            }
                                        });
                                }).catch((error) => {
                                    if(error.code === "ERR_BAD_REQUEST"){
                                        axios.post("/reissue").then((response) => {
                                            let temp = state;
                                            temp.chcek = response.headers.access
                                            setState(temp)
                        
                                        })
                                    }
                                });

                                setUpload("none")
                                setPopupType()
                            }}/>
                            <input type="button" id="cancleBtn" value="취소" onClick={() => {
                                setUpload("none")
                                setPopupType()
                            }}/> 
                        </>
                    );
                }}>
                    <img src={require("../img/upload.png")}/>
                </div>
                <div className="remoconIcon" onClick={() => {
                    if(select === "") return;

                    setUpload("block");
                    setPopupType(<>
                        <h3>초대</h3>
                        <div id="inviteId">
                        <input type="text" id="inviteText" placeholder="아이디"/>
                        <input type="button" className="inviteBtn" value="초대" onClick={()=>{

                            let formData = new FormData();
                            formData.append("invite_room_token", select);
                            formData.append("invite_username", document.getElementById("inviteText").value)

                            axios.post("/invite/member", formData , {
                                headers : {
                                    "access" : state.check
                                }
                            }).then((response) => {
                                if(response.status === 200){
                                    setUpload("none");
                                    setPopupType();
                                }else{
                                    alert("오류")
                                    setUpload("none");
                                    setPopupType();
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
                        }}/>
                        </div>
                        <input type="button" id="closeBtn" value="닫기" onClick={() => {
                            setUpload("none");
                            setPopupType();
                        }}/>
                    </>);
                }}>
                    <img src={require("../img/invite.png")}/>
                </div>
                <div className="remoconIcon" onClick={() => {
                    if(select === "") return;
                    // 멤버 확인
                    axios.get("/room/members/"+select, {
                        headers : {
                            "access" : state.check
                        }
                    })
                     .then((response) => {
                        let res = response.data;
                        let temp = [];
                        for(let i = 0; i < res.length; i++){
                            temp.push(
                            <div key={i} className="memberBlock">
                                <img src={res[i].user_icon_path}/>
                                {res[i].user_nickname}
                                {leader ? // 방장일 경우에만 강퇴버튼을 활성화
                                    <input type="button" className="forcedBtn" style={{display : leader ? "block" : "none"}} value="퇴장" onClick={() => {
                                        if(leader){
                                            axios.get("/room/forced?id="+res[i].id+"&code="+select)
                                                .then((response) => {
                                                    if(response.status === 200){
                                                        console.log("sucess")
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
                                        }
                                    }}/> : ""}
                            </div>);
                        }
                        setUpload("block");
                        setPopupType(<>
                            <h3>채팅방 멤버</h3>
                            <div id="memberBox">
                                {temp}
                            </div>
                            <input type="button" id="closeBtn" value="닫기" onClick={() => {
                                setUpload("none");
                                setPopupType();
                            }}/>
                        </>);
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
                    <img src={require("../img/checkMember.png")}/>
                </div>
                <div className="remoconIcon" onClick={() => {
                    if(select === "") return;
                    // alert같은 확인하는 팝업창을 띄워서 동의하면 나가기로
                    // 나가기 버튼
                    if(window.confirm("채팅방을 나가시겠습니까?")){
                        axios.get("/room/exit/"+select, {
                            headers : {
                                "access" : state.check
                            }
                        })
                        .then((response) => {
                            // 방조회 및 select를 초기화
                            if(response.status == 200){
                                axios.get("/room/ulist", {
                                    headers : {
                                        "access" : state.check
                                    }
                                })
                                .then(response => {
                                    let info = response.data;
                                    let block = [];
                                    for(let i = 0; i < info.length; i++){
                                        block.push(
                                            <div id={"room_" + info[i].room_id} key={"room_" + info[i].room_id}
                                            className="roomBlock" onClick={(event) => {
                                                
                                                setNum(info[i].room_id);
                                                // 해당 room_id를 서버에 보내 방의 토큰값을 받아와 소켓 연결을 시작
                                                if(state.id === info[i].room_leader)
                                                    setLeader(true);

                                            }}>
                                                <div className="roomName">
                                                    {info[i].room_name}
                                                </div>
                                            </div>
                                        );
                                    }

                                    setRoom(block);
                                }).catch((error) => {
                                    if(error.code === "ERR_BAD_REQUEST"){
                                        axios.post("/reissue").then((response) => {
                                            let temp = state;
                                            temp.chcek = response.headers.access
                                            setState(temp)
                        
                                        })
                                    }
                                });
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
                        setSelect("");
                    }
                }}>
                    <img src={require("../img/exit.png")}/>
                </div>
            </div>
        </div>
    </div>
}