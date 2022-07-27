import { Stack, Button, Typography } from "@mui/material";
import { useCallback, useState } from "react";

export const Lotto = () => {
  const [nums, setNums] = useState(new Array(45).fill(0).map((v, i) => i + 1));
  const [picks, setPicks] = useState([]);

  const handleClickLotto = useCallback(() => {
    if (picks.length === 6) return;

    const copy = [...nums];
    copy.sort(() => Math.random() - 0.5);
    const first = copy.shift();

    setPicks((prev) => [...prev, first]);
    setNums([...copy]);
  }, [nums, picks]);

  const handleClickReset = () => {
    setNums(new Array(45).fill(0).map((v, i) => i + 1));
    setPicks([]);
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={handleClickLotto}>
          click
        </Button>
        <Button variant="contained" onClick={handleClickReset}>
          reset
        </Button>
      </Stack>

      <Stack direction="row" spacing={2}>
        {picks.map((pick) => (
          <Typography key={pick} variant="h4">
            {pick}
          </Typography>
        ))}
      </Stack>
    </Stack>
  );
};
