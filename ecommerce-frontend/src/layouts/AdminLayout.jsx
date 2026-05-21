import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import { Outlet } from "react-router-dom";

const AdminLayout = ({ children }) => {
    return (
        <div style={{ display: "flex" }}>
            <AdminSidebar />

            <div style={{ flex: 1 }}>
                <AdminHeader />
                {children || <Outlet />}
            </div>
        </div>
    );
};

export default AdminLayout;