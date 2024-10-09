import "./search.css"
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Search(){
    const navigate = useNavigate();
    const [number, setNumber] = useState();
    const [info, setInfo] = useState({
        username : "",
        password : ""
    });

    return <div id="checkDiv">
        <h2>아이디/비밀번호 찾기</h2>
        <p>
            가입 이메일
            <p>
                <input type="button" className="checkBtn" value="전송" onClick={() => {
                    if(document.getElementById("emailCheck").value === "") return;
                    axios.post("/mail", {
                        mail : document.getElementById("emailCheck").value
                    }).then((response) => {

                        if(response.data === -1){
                            alert("존재하지 않는 이메일입니다.")
                        }else{
                            setNumber(response.data.toString());
                        }
                    })
                }}/>
                <input type="text" id="emailCheck"/>
            </p>
        </p>
        <p>
            인증 번호
            <p>
                <input type="button" className="checkBtn" value="확인" onClick={() => {
                    console.log(number)
                    console.log(document.getElementById("codeCheck").value)
                    if(number === undefined) return;
                    if(document.getElementById("codeCheck").value === "") return;
                    
                    console.log(number)
                    if(number === document.getElementById("codeCheck").value){
                        alert("일치");

                        // 서버로부터 해당 이메일 유저 정보를 조회 한뒤 반환
                        // 변경은 여기서 행해지지 않고 메인화면으로 가서 본인이 수정
                        axios.get("/user/search?mail="+document.getElementById("emailCheck").value)
                            .then((response) => {
                                setInfo(response.data)
                            });
                    }else{
                        alert("인증번호가 맞지 않습니다.");
                    }
                }}/>
                <input type="text" id="codeCheck"/>
            </p>
        </p>
        <p style={{"display" : info === null ? "none" : "block"}}>
            아이디 {info === null ? "" : info.username}
        </p>
        <p style={{"display" : info === null ? "none" : "block"}}>
            임시 비밀번호 {info === null ? "" : info.password}
        </p>
        <p>
            <input type="button" id="moveBtn" value="로그인" onClick={() => {
                navigate("/");
            }}/>
        </p>
    </div>
}