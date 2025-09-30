import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    Settings,
    BarChart3,
    DollarSign,
    ShoppingCart,
    FolderTree,
    Image as ImageIcon
} from 'lucide-react';

export const salesData = [
    { month: 'Jan', sales: 4200 },
    { month: 'Feb', sales: 3800 },
    { month: 'Mar', sales: 5100 },
    { month: 'Apr', sales: 4600 },
    { month: 'May', sales: 6200 },
    { month: 'Jun', sales: 7100 }
];

export const categoryData = [
    { name: 'T-Shirts', value: 450 },
    { name: 'Jeans', value: 320 },
    { name: 'Dresses', value: 280 },
    { name: 'Shoes', value: 390 }
];

export const recentOrders = [
    { id: '#ORD-001', customer: 'Rahim Ahmed', items: 3, amount: '৳2,450', status: 'Delivered' },
    { id: '#ORD-002', customer: 'Fatima Khan', items: 1, amount: '৳890', status: 'Processing' },
    { id: '#ORD-003', customer: 'Karim Hasan', items: 2, amount: '৳1,650', status: 'Shipped' },
    { id: '#ORD-004', customer: 'Nadia Islam', items: 4, amount: '৳3,200', status: 'Pending' },
    { id: '#ORD-005', customer: 'Shabab Ali', items: 2, amount: '৳1,450', status: 'Delivered' }
];

export const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'banners', icon: ImageIcon, label: 'Banners' },
    { id: 'categories', icon: FolderTree, label: 'Categories',  path: "/admin/categories" },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' }
];

export const stats = [
    { title: 'Total Sales', value: '৳42,580', change: '+12.5%', icon: DollarSign, color: 'bg-blue-500' },
    { title: 'Orders', value: '156', change: '+8.2%', icon: ShoppingCart, color: 'bg-green-500' },
    { title: 'Products', value: '1,234', change: '+3.1%', icon: Package, color: 'bg-purple-500' },
    { title: 'Customers', value: '892', change: '+15.3%', icon: Users, color: 'bg-orange-500' }
];

export const getStatusColor = (status) => {
    switch(status) {
        case 'Delivered': return 'bg-green-100 text-green-800';
        case 'Shipped': return 'bg-blue-100 text-blue-800';
        case 'Processing': return 'bg-yellow-100 text-yellow-800';
        case 'Pending': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};