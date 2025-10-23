import Nav from "../assets/Nav"
import Result from "../assets/Result"
import Uploader from "../assets/uploader"
import { Outlet } from "react-router-dom"
import Suggest from "../assets/Suggest"
export default function Layouts() {
    return(<div className="">

        <Nav />
        <div className="">
            <Uploader />
        <Result/>
        <Suggest/>
        </div>
    </div>
    )
    
};
