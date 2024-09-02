import "./login.css"
import axios from "axios";
import { useNavigate } from "react-router-dom"

export default function Login(){
    const navigate = useNavigate();

    return <div>
        <div id="loginDiv">
            <form name="loginForm" id="loginForm" method="POST">
                <div id="loginLogo"></div>
                <input type="text" name="id" id="loginId" placeholder="아이디"/>
                <input type="password" name="password" id="loginPassword" placeholder="비밀번호"/>
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
                        console.log(response)
                        if(response.status !== 200){
                            alert("아이디또는 비밀번호가 잘못되었습니다.");
                            return;
                        }else{
                            console.log(document.cookie)
                            navigate("/main", {
                                
                                state : {
                                    id : id,
                                    check : response.headers.access
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
            </form>
        </div>
        
    </div>
}