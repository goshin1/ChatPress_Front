import "./login.css"
import axios from "axios";
import { useNavigate } from "react-router-dom"
import { Cookies } from "react-cookie";

export default function Login(){
    const navigate = useNavigate();
    const cookies = new Cookies();

    return <div>
        <div id="loginDiv">
            <form name="loginForm" id="loginForm" method="POST">
                <div id="loginLogo">
                    <img src={require("../img/chatpressIcon.png")}/>
                </div>
                <input type="text" name="id" id="loginId" placeholder="아이디"/>
                <input type="password" name="password" id="loginPassword" placeholder="비밀번호" onKeyDown={(event) => {
                    let id = document.querySelector("#loginId").value;
                    let password = document.querySelector("#loginPassword").value;
                    if(id === "" || password === "")
                        return
                    if(event.code === "Enter" && event.nativeEvent.isComposing === false){
                        let formData = new FormData();
                        formData.append("username", id);
                        formData.append("password", password + "")

                        axios.post("/login", formData, {
                            headers : {
                                "Content-Type" : "multipart/form-data"
                            }
                        }).then((response) => {
                            if(response.status !== 200){
                                alert("아이디또는 비밀번호가 잘못되었습니다.");
                                return;
                            }else{
                                navigate("/main", {
                                    
                                    state : {
                                        id : id,
                                        check : response.headers.access
                                    }
                                })
                                
                            }
                        }).catch((error) => {
                            alert("아이디, 비밀번호를 다시한번 확인해주세요.")
                        })
                    }
                }}/>
                <input type="button" id="loginBtn" value="로그인" onClick={()=>{
                    // navigate("/main", {
                    //     state : {
                    //         id : "user",
                    //         check : "checks"
                    //     }
                    // })

                    let id = document.querySelector("#loginId").value;
                    let password = document.querySelector("#loginPassword").value;
                    if(id === "" || password === "")
                        return

                    let formData = new FormData();
                    formData.append("username", id);
                    formData.append("password", password)

                    axios.post("/login", formData, {
                        headers : {
                            "Content-Type" : "multipart/form-data"
                        }
                    }).then((response) => {
                        if(response.status !== 200){
                            alert("아이디또는 비밀번호가 잘못되었습니다.");
                            return;
                        }else{
                            cookies.set("access", response.headers.access)
                            navigate("/main", {
                                
                                state : {
                                    id : id,
                                    
                                }
                            })
                            
                        }
                    })

                    
                }}/>
                <input type="button" id="joinBtn" value="회원가입" onClick={() => {
                    navigate("/join");
                }}/>
                <a href="/search" id="searchLink" onClick={(event) => {
                    event.preventDefault();
                    navigate("/search")
                }}>아이디, 비밀번호를 잊어버리셨나요?</a>
                <p id="loginEmail">
                    문의사항은 chatpressinfo@gmail.com으로 메일 부탁드립니다.
                </p>
            </form>
        </div>
        
    </div>
}