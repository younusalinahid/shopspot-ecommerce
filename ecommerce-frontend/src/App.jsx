import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import AppRoutes from "./routes/AppRoutes";
import SiteFavicon from "./components/common/SiteFavicon";

function App() {
    return (
        <ThemeProvider>
            <SiteFavicon />
            <LanguageProvider>
                <CartProvider>
                    <AppRoutes />
                </CartProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;