import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
    return (
        <ThemeProvider>
            <CartProvider>
                <AppRoutes />
            </CartProvider>
        </ThemeProvider>
    );
}

export default App;