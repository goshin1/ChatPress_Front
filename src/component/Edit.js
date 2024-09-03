import "./edit.css"
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Edit(){
    const navigate = useNavigate();
    const location = useLocation();
    const [state, setState] = useState(location.state);

    useEffect(()=>{
        // 현재 유저 정보를 불러와 초기화
        console.log(document.cookie)
    }, []);


    return <div id="joinDiv">
        <div id="joinLogo">정보 수정</div>
        <label>
            아이디 <input type="text" id="user_loginId" name="user_loginId" placeholder="아이디"/>
        </label>
        <label>
            기존 비밀번호 <input type="password" id="user_exists_password" name="user_exists_password" placeholder="새로운 비밀번호"/>
        </label>
        <label>
            새로운 비밀번호 <input type="password" id="user_password" name="user_password" placeholder="새로운 비밀번호"/>
        </label>
        <label>
            비밀번호 확인<input type="password" id="check_password" name="check_password" placeholder="비밀번호 확인"/>
        </label>
        <label>
            사용자 이름<input type="text" id="user_nickname" name="user_nickname" placeholder="사용자이름"/>
        </label>
        <label>
            이메일 <input type="text" id="user_email" name="user_email" placeholder="이메일"/>
        </label>
        <label className="iconLabel">
            <div id="iconExample">
                <img id="iconPreview" src=""/>
            </div>

            <input type="button" id="iconBtn" value="아이콘 업로드" onClick={() => {
                document.getElementById("join_file").click();
            }}/>
            <input type="file" id="join_file" name="file" onChange={(event) => {
                console.log(event)
                if (event.target.files && event.target.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function(e) {
                      document.getElementById('iconPreview').src = e.target.result;
                    };
                    reader.readAsDataURL(event.target.files[0]);
                  } else {
                    document.getElementById('iconPreview').src = "";
                  }
            }}/>
        </label>
        <input type="file" id="join_file" name="file"/>
        <input type="button" id="editSubmit" value="정보수정" onClick={()=>{
            let user_loginId = document.getElementById("user_loginId").value;
            let user_exists_password = document.getElementById("user_exists_password").value;
            let user_password = document.getElementById("user_password").value;
            let check_password = document.getElementById("check_password").value;
            let user_nickname = document.getElementById("user_nickname").value;
            let user_email = document.getElementById("user_email").value;

            if(user_loginId === "" || user_password === "" || user_email === "" || user_nickname === "" || user_exists_password === ""){
                alert("전부 입력해주세요")
                return;
            }

            if(check_password !== user_password){
                alert("비밀번호가 일치하지 않습니다.")
                return;
            }

            if(user_email.indexOf("@") === -1 || user_email.indexOf(".") === -1 || user_email.indexOf(".") < user_email.indexOf("@")){
                alert("이메일을 다시 입력해주세요.");
                return;
            }


            let formData = new FormData();
            formData.append("username", user_loginId);
            formData.append("password", user_password);
            formData.append("user_nickname", user_nickname);
            formData.append("user_email", user_email);
            formData.append("file", document.getElementById("join_file").files[0]);



            axios.post("/user/check", {
                id : user_loginId,
                email : user_email,
                password : user_exists_password
            },{
                headers : {
                    "access" : state.check
                }
            })
            .then((response) => {
                console.log(response.data)
                if(response.data === "ok"){
                    axios.post("/user/edit", formData, {
                        headers : {
                            "Content-Type" : "multipart/form-data",
                            "access" : state.check
                        }
                    }).then((response) => {
                        console.log(response.data)
                        if(response.data === "ok"){
                            navigate("/main", {
                                state : state
                            });
                        } else{
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
                    });
                }else if(response.data === "id"){
                    alert("중복 된 아이디입니다.");
                    return
                }else if(response.data === "password"){
                    alert("비밀번호가 틀립니다..");
                    return  
                }else if(response.data === "email"){
                    alert("중복 된 이메일입니다.");
                    return
                }else if(response.data === "no"){
                    alert("존재 하지 않는 유저입니다.");
                    return
                }else{
                    alert("오류2");
                    return
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
}