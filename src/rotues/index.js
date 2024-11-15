import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import RegisterPage from "../pages/RegisterPage";
import CheckEmailPage from "../pages/CheckEmailPage";
import CheckPasswordPage from "../pages/CheckPasswordPage";
import Home from "../pages/Home";
import MessagePage from "../components/MessagePage";
import AuthLayouts from "../layout";
import Forgotpassword from "../pages/Forgotpassword";
import SendEmail from "../pages/SendEmail";
import SendSms from "../pages/SendSms";
import GroupMessagePage from "../components/GroupMessagePage";
// import Groups from "../pages/Groups";
// import GroupMessagePage from "../components/GroupMessagePage";

const router = createBrowserRouter([
{
    path : "/",
    element : <App/>,
    children : [
        {
            path : "register",
            element : <AuthLayouts><RegisterPage/></AuthLayouts>
        },
        {
            path : 'email',
            element : <AuthLayouts><CheckEmailPage/></AuthLayouts>
        },
        {
            path : 'password',
            element : <AuthLayouts><CheckPasswordPage/></AuthLayouts>
        },
        {
            path : 'forgot-password',
            element : <AuthLayouts><Forgotpassword/></AuthLayouts>
        },
        {
            path : 'sendEmail',
            element : <AuthLayouts><SendEmail/></AuthLayouts>
        },
        {
            path : 'sendSms',
            element : <AuthLayouts><SendSms/></AuthLayouts>
        },
        {
            path : "",
            element : <Home/>,
            children : [
                {
                    path : ':userId',
                    element : <MessagePage/>
                }
            ]
        },
        {
            path: "Groups",
            element: <Home />,
            children: [
              {
                path: ":userId/:groupId", // Nested route for userId and groupId
                element: <GroupMessagePage/>,
              },
            ],
          }
          
        
    ]
}
])

export default router