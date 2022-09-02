import { useState, useCallback } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Typography, Stack, Button } from "@mui/material";

const Header = () => {
    return (
        <Stack direction="row" height={80} alignItems="center" px={5}>
            <Typography variant="h6">Jejuroad Admin</Typography>
        </Stack>
    );
};

const Nav = () => {
    const options = [
        { title: "식당 목록", path: "/" },
        { title: "식당 등록", path: "/write" },
    ];

    const location = useLocation();
    const navigate = useNavigate();

    const handleClickNavigate = useCallback((path) => {
        navigate(path);
    }, []);

    return (
        <Stack spacing={5} p={5} width={200}>
            {options.map((option, i) => (
                <Typography key={option.title} onClick={() => handleClickNavigate(option.path)}>
                    {option.title}
                </Typography>
            ))}
        </Stack>
    );
};

const View = () => {
    return (
        <Stack flex={1} p={3} bgcolor="#eeeeee66" sx={{ overflowY: "overlay" }}>
            <Stack bgcolor="#fff" flex={1} borderRadius={1} p={3} maxWidth="md">
                <Outlet />
            </Stack>
        </Stack>
    );
};

export const MainLayout = () => {
    return (
        <Stack width="100vw" height="100vh">
            <Header />
            <Stack direction="row" flex={1} height="calc(100vh - 80px)">
                <Nav />
                <View />
            </Stack>
        </Stack>
    );
};
