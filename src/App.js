import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createTheme, ThemeProvider, Stack, Divider } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Home, Write } from "components/routes";
import { MainLayout } from "components/layouts";
import { CssBaseline } from "@mui/material";
import "swiper/css";

const theme = createTheme({
    palette: {
        primary: {
            main: "#000000",
        },
    },
    typography: {
        fontFamily: "'Noto Sans KR', sans-serif",
        body1: { fontSize: 15 },
        allVariants: { letterSpacing: 2 },
    },
});

function App() {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<MainLayout />}>
                            <Route index element={<Home />} />
                            <Route path="write" element={<Write />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </LocalizationProvider>
    );
}

export default App;
