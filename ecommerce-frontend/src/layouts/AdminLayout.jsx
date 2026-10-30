import AdminSidebar from "../components/admin/AdminSidebar";
import {Outlet} from "react-router-dom";

const AdminLayout = ({children}) => {
    return (
        <div style={{display: "flex"}}>
            <AdminSidebar/>

            {/* minWidth 0 lets wide tables scroll inside the page instead of stretching it on mobile */}
            <div style={{flex: 1, minWidth: 0}}>
                {children || <Outlet/>}
            </div>
        </div>
    );
};

export default AdminLayout;