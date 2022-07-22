import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createTheme, ThemeProvider, Stack, Divider } from "@mui/material";
import { Header, Nav } from "components/organisms";
import { Home, Write, Restaurant } from "components/routes";

const theme = createTheme({
  palette: {
    primary: {
      main: "#000000",
    },
  },
  typography: {
    fontFamily: "'Noto Sans KR', sans-serif",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Stack alignItems="center" p={10}>
          <Stack width="100%" maxWidth={700} spacing={5}>
            <Header />
            <Stack direction="row" spacing={5}>
              <Nav />
              <Stack flex={1}>
                <Routes>
                  <Route index element={<Home />} />
                  <Route path="restaurant/:id" element={<Restaurant />} />
                  <Route path="write" element={<Write />} />
                </Routes>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
