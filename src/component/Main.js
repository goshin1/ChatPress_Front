import axios, { AxiosRequestConfig } from "axios";
import "./main.css";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SockJS from "sockjs-client";
import { Cookies } from "react-cookie";
import moment from "moment";

export default function Main(){

    const navigate = useNavigate();
    const cookies = new Cookies();
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


    let socket = new SockJS("/socket");

    useEffect(() => {

        if(num !== 0){
            axios.get("/chat/list?id=" + num, {
                headers : {
                    "access" : cookies.get("access")
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
                                    <a href={"http://211.188.51.27:8080"+res[i].chat_message} download>파일 다운로드</a>
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
                        "access" : cookies.get("access")
                    }
                }).then((response) => {
                    setSelect(response.data)

                    // 채팅방 멤버 정보 초기화가 늦는 문제를 해결하기 위해 테스트
                    
                })

            })
            .catch((error) => {
                if(error.response.data === "access token expired"){
                    axios.post("/reissue").then((response) => {
                        let temp = state;
                        temp.chcek = response.headers.access
                        cookies.set("access", response.headers.access)
                        setState(temp)
    
                    })
                }
            });
        }

            

    }, [num])


    useEffect(() => {
        if(num !== 0 && select !== ""){
            axios.get("/room/members/"+select, {
                headers : {
                    "access" : cookies.get("access")
                }
            }).then((response) => {
                let temp = {};
                for(let i = 0; i < response.data.length; i++){
                    temp[response.data[i].user_nickname]=response.data[i].user_icon_path;
                }
                setMemberDict(temp);
            }).catch((error) => {
                if(error.response.data === "access token expired"){
                    axios.post("/reissue").then((response) => {
                        let temp = state;
                        temp.chcek = response.headers.access
                        cookies.set("access", response.headers.access)
                        setState(temp)
    
                    })
                }
            });



            socket.onopen = () =>{
                socket.send(JSON.stringify({chatRoomId : select, type : "JOIN"}));
            }
    
            socket.onmessage = (e) => {
                let content = JSON.parse(e.data);
                let type = content.type;
                if(type == "SEND"){
                    let temp;
                    if(content.fileType === "forced"){
                        if(content.message === profile.id){
                            alert("퇴장 당하셨습니다.");
                            
                            setSelect("");
                            setNum(0);
                            setChat([]);
                            return;
                        }

                    }else if(content.fileType === "text"){
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
                                    <a href={"http://211.188.51.27:8080"+content.message} download>파일 다운로드</a>
                                </div>;
                    }
                    
                    chat.push(<div key={chat.length + 1} className="chatBlock">
                        <div className="chatIcon">
                            <img src={memberDict[content.user]}/>
                            {content.user}
                        </div>
                        {temp}
                    </div>);
                    setChat([...chat]);
                    
                }else if(type === "JOIN"){
                    
                }
            };
        
            socket.onerror = (err) => {
                socket.close();
                socket = new SockJS("/socket")
            }
        }
    }, [select]);

    useEffect(() => {
        axios.get("/user/info", {
            headers : {
                "access" : cookies.get("access")
            }
        }).then((response) => {
            setProfile(response.data)
        }).catch((error) => {
            if(error.response.data === "access token expired"){
                axios.post("/reissue").then((response) => {
                    let temp = state;
                    temp.chcek = response.headers.access
                    cookies.set("access", response.headers.access)
                    setState(temp)

                })
            }
        });

        // 초대 목록 조회
        axios.get("/invite/list", {
            headers : {
                "access" : cookies.get("access")
            }
        }).then((response) => {
            if(response.data.length > 0){
                let temp = [];
                for(let i = 0; i < response.data.length; i++){
                    temp.push(
                        <div className="inviteBlock">
                            {response.data[i].room_name}
                            <input className="entryBtn" type="button" value="입장" onClick={() => {
                                axios.get("/invite/exit?code="+response.data[i].room_token, {
                                    headers : {
                                        "access" : cookies.get("access")
                                    }
                                }).then((response) => {
                                    if(response.status !== 200){
                                        return;
                                    }
                                }).catch((error) => {
                                    if(error.response.data === "access token expired"){
                                        axios.post("/reissue").then((response) => {
                                            let temp = state;
                                            temp.chcek = response.headers.access
                                            cookies.set("access", response.headers.access)
                                            setState(temp)
                        
                                        })
                                    }
                                });
                                
                                axios.get("/room/code?code="+response.data[i].room_token, {
                                    headers : {
                                        "access" : cookies.get("access")
                                    }
                                })
                                .then((response) => {
                                    if(response.data === "Ok"){
                                        axios.get("/room/ulist", {
                                            headers : {
                                                "access" : cookies.get("access")
                                            }
                                        })
                                        .then(response => {
                                            let info = response.data;
                                            let block = [];

                                            if(info.length <= 0) return;
                                            axios.get("/room/members/"+info[0].room_token, {
                                                headers : {
                                                    "access" : cookies.get("access")
                                                }
                                            }).then((response) => {
                                                let temp = {};
                                                for(let i = 0; i < response.data.length; i++){
                                                    temp[response.data[i].user_nickname]=response.data[i].user_icon_path;
                                                }
                                                setMemberDict(temp);
                                            }).catch((error) => {
                                                if(error.response.data === "access token expired"){
                                                    axios.post("/reissue").then((response) => {
                                                        let temp = state;
                                                        temp.chcek = response.headers.access
                                                        cookies.set("access", response.headers.access)
                                                        setState(temp)
                                    
                                                    })
                                                }
                                            }); 

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
                                            if(error.response.data === "access token expired"){
                                                axios.post("/reissue").then((response) => {
                                                    let temp = state;
                                                    temp.chcek = response.headers.access
                                                    cookies.set("access", response.headers.access)
                                                    setState(temp)
                                
                                                })
                                            }
                                        });
                                    }
                                }).catch((error) => {
                                    if(error.response.data === "access token expired"){
                                        axios.post("/reissue").then((response) => {
                                            let temp = state;
                                            temp.chcek = response.headers.access
                                            cookies.set("access", response.headers.access)
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
            if(error.response.data === "access token expired"){
                axios.post("/reissue").then((response) => {
                    let temp = state;
                    temp.chcek = response.headers.access
                    cookies.set("access", response.headers.access)
                    setState(temp)

                })
            }
        });


        // 해당 유저에 방을 조회
        axios.get("/room/ulist", {
            headers : {
                "access" : cookies.get("access")
            }
        })
        .then(response => {
            let info = response.data;
            // 초기 정보 설정(초기화 함으로써 처음을 설정)
            if(response.data.length <= 0) return;
            if(state.id === info[0].room_leader)
                setLeader(true);
            axios.get("/room/members/"+info[0].room_token, {
                headers : {
                    "access" : cookies.get("access")
                }
            }).then((response) => {
                let temp = {};
                for(let i = 0; i < response.data.length; i++){
                    temp[response.data[i].user_nickname]=response.data[i].user_icon_path;
                }
                setMemberDict(temp);
            }).catch((error) => {
                if(error.response.data === "access token expired"){
                    axios.post("/reissue").then((response) => {
                        let temp = state;
                        temp.chcek = response.headers.access
                        cookies.set("access", response.headers.access)
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
                                "access" : cookies.get("access")
                            }
                        })
                        .then((response) => {
                            if(state.id === info[i].room_leader)
                                setLeader(true);
                            socket.close();
                            socket = new SockJS("/socket");
                            // setChat([]);
                            // 해당 방의 유저 정보
                            axios.get("/room/members/"+response.data, {
                                headers : {
                                    "access" : cookies.get("access")
                                }
                            }).then((response) => {
                                let temp = {};
                                for(let i = 0; i < response.data.length; i++){
                                    temp[response.data[i].user_nickname]=response.data[i].user_icon_path;
                                }
                                setMemberDict(temp);
                            }).catch((error) => {
                                if(error.response.data === "access token expired"){
                                    axios.post("/reissue").then((response) => {
                                        let temp = state;
                                        temp.chcek = response.headers.access
                                        cookies.set("access", response.headers.access)
                                        setState(temp)
                    
                                    })
                                }
                            });
                        }).catch((error) => {
                            if(error.response.data === "access token expired"){
                                axios.post("/reissue").then((response) => {
                                    let temp = state;
                                    temp.chcek = response.headers.access
                                    cookies.set("access", response.headers.access)
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
            if(error.response.data === "access token expired"){
                axios.post("/reissue").then((response) => {
                    let temp = state;
                    temp.chcek = response.headers.access
                    cookies.set("access", response.headers.access)
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
            document.getElementById(arr[i].id).style.backgroundColor = "rgba(0,0,0,0)";
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
                            "access" : cookies.get("access")
                        }
                    })
                    .then((response) => {
                        if(response.data === "OK"){
                            alert("방이 생성되었습니다");
                            axios.get("/room/ulist", {
                                headers : {
                                    "access" : cookies.get("access")
                                }
                            })
                            .then(response => {
                                let info = response.data;
                                let block = [];

                                // 회원 정보 초기화
                                if(info.length <= 0) return;
                                if(state.id === info[0].room_leader)
                                    setLeader(true);
                                axios.get("/room/members/"+info[0].room_token, {
                                    headers : {
                                        "access" : cookies.get("access")
                                    }
                                }).then((response) => {
                                    let temp = {};
                                    for(let i = 0; i < response.data.length; i++){
                                        temp[response.data[i].user_nickname]=response.data[i].user_icon_path;
                                    }
                                    setMemberDict(temp);
                                }).catch((error) => {
                                    if(error.response.data === "access token expired"){
                                        axios.post("/reissue").then((response) => {
                                            let temp = state;
                                            temp.chcek = response.headers.access
                                            cookies.set("access", response.headers.access)
                                            setState(temp)
                        
                                        })
                                    }
                                }); 


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
                                if(error.response.data === "access token expired"){
                                    axios.post("/reissue").then((response) => {
                                        let temp = state;
                                        temp.chcek = response.headers.access
                                        cookies.set("access", response.headers.access)
                                        setState(temp)
                    
                                    })
                                }
                            });
                        }
                    }).catch((error) => {
                        if(error.response.data === "access token expired"){
                            axios.post("/reissue").then((response) => {
                                let temp = state;
                                temp.chcek = response.headers.access
                                cookies.set("access", response.headers.access)
                                setState(temp)
            
                            })
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
                <p id="emailInfo" style={{color : 'rgb(160,160,160)', fontSize : '10px'}}>
                    문의사항은 chatpressinfo@gmail.com으로 메일 부탁드립니다.
                </p>
            </div>
        </div>

                {/* test */}
        <div id="mainDiv">
            <div id="uploadPopup" style={{display : upload}}>
                { popupType }
            </div>
            <div id="chatList">
                { [...chat].reverse() }
                <div id="chatInsert">
                    <input type="text" id="chatText" name="chatText" onKeyDown={(event) => {
                        if(select === "") return;
                        let text = document.getElementById("chatText").value;
                        if(text === "") return;
                        if(event.code === "Enter" && event.nativeEvent.isComposing === false){
                            
                            axios.post("/chat/insert", {
                                chat_user_nickname : profile.user_nickname,
                                chat_message : text,
                                chat_type : "text",
                                room_id : num
                            }, {
                                headers : {
                                    "access" : cookies.get("access")
                                }
                            }).then(() => {
                                socket.send(JSON.stringify({
                                    chatRoomId : select,
                                    type : "SEND",
                                    message : text,
                                    user : profile.user_nickname,
                                    fileType : "text"}));
                            }).catch((error) => {
                                if(error.response.data === "access token expired"){
                                    axios.post("/reissue").then((response) => {
                                        let temp = state;
                                        temp.chcek = response.headers.access
                                        cookies.set("access", response.headers.access)
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
                        
                        axios.post("/chat/insert", {
                            chat_user_nickname : profile.user_nickname,
                            chat_message : text,
                            chat_type : "text",
                            room_id : num
                        }, {
                            headers : {
                                "access" : cookies.get("access")
                            }
                        }).then(() => {
                            socket.send(JSON.stringify({
                                chatRoomId : select,
                                type : "SEND",
                                message : text,
                                user : profile.user_nickname,
                                fileType : "text"}));
                        }).catch((error) => {
                            if(error.response.data === "access token expired"){
                                axios.post("/reissue").then((response) => {
                                    let temp = state;
                                    temp.chcek = response.headers.access
                                    cookies.set("access", response.headers.access)
                                    setState(temp)
                
                                })
                            }
                        });
                        document.getElementById("chatText").value = "";
                    }}/>
                </div>
            </div>
            <div id="chatRemocon">
                <div className="remoconIcon">
                    <img src={require("../img/chatpressIcon.png")}/>
                </div>
                <div className="remoconIcon" onClick={() => {
                    setLeftBar(leftBar === "0%" ? "92%" : "0%")
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
                                        "access" : cookies.get("access")
                                    }
                                }).then((response) => {
                                    axios.post("/chat/insert", {
                                            chat_user_nickname : profile.user_nickname,
                                            chat_message : response.data,
                                            chat_type : fileType,
                                            room_id : num
                                        }, {
                                            headers : {
                                                "access" : cookies.get("access")
                                            }
                                        }).then(() => {
                                            socket.send(JSON.stringify({
                                                chatRoomId : select,
                                                type : "SEND",
                                                message : response.data,
                                                user : profile.user_nickname,
                                                fileType : fileType}));
                                        }).catch((error) => {
                                            if(error.response.data === "access token expired"){
                                                axios.post("/reissue").then((response) => {
                                                    let temp = state;
                                                    temp.chcek = response.headers.access
                                                    cookies.set("access", response.headers.access)
                                                    setState(temp)
                                
                                                })
                                            }
                                        });
                                }).catch((error) => {
                                    if(error.response.data === "access token expired"){
                                        axios.post("/reissue").then((response) => {
                                            let temp = state;
                                            temp.chcek = response.headers.access
                                            cookies.set("access", response.headers.access)
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
                                    "access" : cookies.get("access")
                                }
                            }).then((response) => {
                                if(response.status === 200){
                                    // check
                                    axios.get("/room/members/"+select, {
                                        headers : {
                                            "access" : cookies.get("access")
                                        }
                                    }).then((response) => {
                                        let temp = {};
                                        for(let i = 0; i < response.data.length; i++){
                                            temp[response.data[i].user_nickname]=response.data[i].user_icon_path;
                                        }
                                        setMemberDict(temp);
                                        setUpload("none");
                                        setPopupType();
                                    })
                                }else{
                                    alert("오류")
                                    setUpload("none");
                                    setPopupType();
                                }
                            }).catch((error) => {
                                if(error.response.data === "access token expired"){
                                    axios.post("/reissue").then((response) => {
                                        let temp = state;
                                        temp.chcek = response.headers.access
                                        cookies.set("access", response.headers.access)
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
                            "access" : cookies.get("access")
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
                                {/* {leader ? // 방장일 경우에만 강퇴버튼을 활성화
                                    <input type="button" className="forcedBtn" style={{display : leader ? "block" : "none"}} value="퇴장" onClick={() => {
                                        if(leader){
                                            axios.get("/room/forced?id="+res[i].id+"&code="+select)
                                                .then((response) => {
                                                    if(response.status === 200){
                                                        console.log("sucess")
                                                    }
                                                }).catch((error) => {
                                                    if(error.response.data === "access token expired"){
                                                        axios.post("/reissue").then((response) => {
                                                            let temp = state;
                                                            temp.chcek = response.headers.access
                                                            cookies.set("access", response.headers.access)
                                                            setState(temp)
                                        
                                                        })
                                                    }
                                                });
                                        }
                                    }}/> : ""} */}
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
                        if(error.response.data === "access token expired"){
                            axios.post("/reissue").then((response) => {
                                let temp = state;
                                temp.chcek = response.headers.access
                                cookies.set("access", response.headers.access)
                                setState(temp)
            
                            })
                        }
                    });
                    
                }}>
                    <img src={require("../img/checkMember.png")}/>
                </div>
                <div className="remoconIcon" onClick={() => {
                    axios.get("/document/list", {
                        headers : {
                            "access" : cookies.get("access")
                        }
                    }).then((response) => {
                        
                        if(response.status === 200){
                            let temp = [];
                            for(let i = 0; i < response.data.length; i++){
                                temp.push(<div className="documentBlock" onClick={() => {
                                    // 해당 문서의 공유 기능 만들기
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
                                                alert("삭제되었습니다.");
                                                setUpload("none");
                                                setPopupType()
                                            }
                                        });

                                    }}/>

                                    <input type="button" className="shareBtn" style={{background : "rgb(84, 216, 84)"}} value="공유" onClick={() => {
                                        axios.get("/share/load?documentId="+response.data[i].document_id, {
                                            headers : {
                                                "access" : cookies.get("access")
                                            }
                                        }).then((response) => {
                                            if(select === "") return;
                                            axios.post("/chat/insert", {
                                                chat_user_nickname : profile.user_nickname,
                                                chat_message : `<a href=${"http://211.188.51.27:8080/#/create/"+response.data.share_code}>문서 공유</a>`,
                                                chat_type : "text",
                                                room_id : num
                                            }, {
                                                headers : {
                                                    "access" : cookies.get("access")
                                                }
                                            }).then(() => {
                                                socket.send(JSON.stringify({
                                                    chatRoomId : select,
                                                    type : "SEND",
                                                    message : `${"http://211.188.51.27:8080/#/create/"+response.data.share_code}`,
                                                    user : profile.user_nickname,
                                                    fileType : "text"}));
                                            }).catch((error) => {
                                                if(error.response.data === "access token expired"){
                                                    axios.post("/reissue").then((response) => {
                                                        let temp = state;
                                                        temp.chcek = response.headers.access
                                                        cookies.set("access", response.headers.access)
                                                        setState(temp)
                                    
                                                    })
                                                }
                                            });
                                        });

                                    }}/>
                                </div>)
                            }
                            setUpload("block");
                            setPopupType(<>
                                <h3>문서 목록</h3>
                                <div className="documentMainBox">
                                    {temp}
                                </div>
                                <input type="button" id="closeBtn" value="닫기" onClick={() => {
                                    setUpload("none");
                                    setPopupType();
                                }}/>
                            </>)
                        }
                    })
                    }}>
                    <img src={require("../img/document.png")}/>
                    </div>
                <div className="remoconIcon" onClick={() => {
                    if(select === "") return;
                    // alert같은 확인하는 팝업창을 띄워서 동의하면 나가기로
                    // 나가기 버튼
                    if(window.confirm("채팅방을 나가시겠습니까?")){
                        axios.get("/room/exit/"+select, {
                            headers : {
                                "access" : cookies.get("access")
                            }
                        })
                        .then((response) => {
                            // 방조회 및 select를 초기화
                            if(response.status == 200){
                                axios.get("/room/ulist", {
                                    headers : {
                                        "access" : cookies.get("access")
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
                                    setChat([]);
                                    setRoom(block);
                                }).catch((error) => {
                                    if(error.response.data === "access token expired"){
                                        axios.post("/reissue").then((response) => {
                                            let temp = state;
                                            temp.chcek = response.headers.access
                                            cookies.set("access", response.headers.access)
                                            setState(temp)
                        
                                        })
                                    }
                                });
                            }
                        }).catch((error) => {
                            if(error.response.data === "access token expired"){
                                axios.post("/reissue").then((response) => {
                                    let temp = state;
                                    temp.chcek = response.headers.access
                                    cookies.set("access", response.headers.access)
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
