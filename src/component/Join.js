import "./join.css"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import axios from "axios";

export default function Join(){
    const navigate = useNavigate();
    const [number, setNumber] = useState();
    const [emailCheck, setEmailCheck] = useState(false);
    const [popup, setPopup] = useState(""); // 약관동의 팝업
    
    const agreeContent = {
        "email" : <>
            <h2>이메일 이용 약관</h2>
            <hr/>
            <p>
                이메일은 회원 가입 시 중복 사용과 아이디, 비밀번호 분실 시<br/>
                본인 확인을 위해 수집되며, 문의 답변, 공지사항 등을 위해서만 사용됩니다.
            </p>
        </>,
        "info" : <>
            <h2>개인정보 이용 동의</h2>
            <hr/>
            <p>
                이용자에게 원활한 서비스를 제공하기 위해 개인정보를 수집합니다.<br/>
                수집한 개인정보는 중복 가입을 방지하기 위해 사용하며,
                그외에 용도로 사용되지 않음을 알려드립니다.
            </p>
        </>,
        "" : ""
    }

    return <div id="joinDiv">

        <div id="agreePopup" style={{display : popup === "" ? "none" : "block"}}>
            {agreeContent[popup]}
            <input type="button" value="닫기" onClick={() => {
                setPopup("");
            }}/>
        </div>

        <div id="joinLogo">회원가입</div>
        <label>
            아이디 <input type="text" id="user_loginId" name="user_loginId" placeholder="아이디"/>
        </label>
        <label>
            비밀번호 <input type="password" id="user_password" name="user_password" placeholder="비밀번호"/>
        </label>
        <label>
            비밀번호 확인<input type="password" id="check_password" name="check_password" placeholder="비밀번호 확인"/>
        </label>
        <label>
            사용자 이름<input type="text" id="user_nickname" name="user_nickname" placeholder="사용자이름"/>
        </label>
        <label>
            이메일 
            <p>
                <input type="button" className="emailBtn" value="전송" onClick={() => {
                    if(document.getElementById("user_email").value === "") return;
                    axios.post("/mail", {
                        mail : document.getElementById("user_email").value
                    }).then((response) => {

                        if(response.data === -1){
                            alert("존재하지 않는 이메일입니다.")
                        }else{
                            alert("전송 되었습니다.")
                            setNumber(response.data.toString());
                        }
                    })
                }}/>
                <input type="text" id="user_email" name="user_email" placeholder="이메일" style={{width:'70%'}}/>
            </p>
        </label>
        <label>
            인증 번호 
            <p>
                <input type="button" className="emailBtn" value="확인" onClick={() => {
                    
                    if(number === undefined) return;
                    if(document.getElementById("codeCheck").value === "") return;
                    
                    if(number === document.getElementById("codeCheck").value){
                        alert("인증번호가 일치합니다.");
                        setEmailCheck(true);
                        
                    }else{
                        alert("인증번호가 틀립니다.");
                        setEmailCheck(false);
                    }
                }}/>
                <input type="text" id="codeCheck" placeholder="인증번호를 입력해주세요" style={{width:'70%'}}/>
            </p>
        </label>
        <label className="iconLabel">
            <div id="iconExample">
                <img id="iconPreview" src=""/>
            </div>

            <input type="button" id="iconBtn" value="아이콘 업로드" onClick={() => {
                document.getElementById("join_file").click();
            }}/>
            <input type="file" id="join_file" name="file" accept=".jpg, .jpeg, .png, .gif" onChange={(event) => {

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
        <label>
            <label style={{fontSize : "90%"}} className="checkLabel">
                <input type="checkbox" id="infoCheck" className="agreeBtn" name="info"/>
                <a href="" onClick={(event) => {
                    event.preventDefault();
                    setPopup("info");
                }}>개인정보 이용약관</a>
            </label>
            <label style={{fontSize : "90%"}} className="checkLabel">
                <input type="checkbox" id="emailCheck" className="agreeBtn" name="email"/>
                <a href="" onClick={(event) => {
                    event.preventDefault();
                    setPopup("email");
                }}>이메일 이용약관</a>
            </label>
        </label>
        
        <input type="button" id="joinSubmit" value="회원가입" onClick={()=>{
            let user_loginId = document.getElementById("user_loginId").value;
            let user_password = document.getElementById("user_password").value;
            let check_password = document.getElementById("check_password").value;
            let user_nickname = document.getElementById("user_nickname").value;
            let user_email = document.getElementById("user_email").value;


            if(!document.getElementById("emailCheck").checked || !document.getElementById("infoCheck").checked){
                alert("약관을 동의를 해야 회원가입이 가능합니다.")
                return
            }

            if(user_loginId === "" || user_password === "" || user_email === "" || user_nickname === ""){
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

            if(!emailCheck){
                alert("이메일 인증을 해야합니다.")
                return
            }


            if(document.getElementById("join_file").files.length <= 0){
                alert("아이콘을 설정해주세요.")
                return
            }
            


            let formData = new FormData();
            formData.append("username", user_loginId);
            formData.append("password", user_password);
            formData.append("user_nickname", user_nickname);
            formData.append("user_email", user_email);
            formData.append("file", document.getElementById("join_file").files[0]);

            axios.get("/user/id?id="+user_loginId+"&email="+user_email)
                .then((response) => {
                    if(response.data === "ok"){
                        axios.post("/user/join", formData, {
                            headers : {
                                "Content-Type" : "multipart/form-data"
                            }
                        }).then((response) => {
                            if(response.data === "Ok"){
                                let today = new Date();
                                axios.post("/agree/join", {
                                    agree_time : today,
                                    agree_email : 1,
                                    agree_info : 1,
                                    agree_username : user_loginId
                                })
                                .then((response) => {
                                    if(response.status === 200){
                                        navigate("/");
                                    }else{
                                        alert("오류")
                                    }
                                })
                            }else{
                                alert("오류")
                            }
                        })
                    }else if(response.data === "id"){
                        alert("중복 된 아이디입니다.");
                        return
                    }else{
                        alert("가입 된 이메일입니다.");
                        return
                    }
                })
        }}/>
    </div>
}
