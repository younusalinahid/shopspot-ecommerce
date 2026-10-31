import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <CartProvider>
                    <AppRoutes />
                </CartProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;