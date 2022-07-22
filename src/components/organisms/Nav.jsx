import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Stack, Button } from "@mui/material";

export const Nav = () => {
  const navigate = useNavigate();

  const handleClickNavigate = useCallback((path) => {
    navigate(path);
  }, []);

  return (
    <Stack spacing={5} width={100}>
      <Button onClick={() => handleClickNavigate("/")}>식당목록</Button>
      <Button onClick={() => handleClickNavigate("write")}>식당등록</Button>
    </Stack>
  );
};
