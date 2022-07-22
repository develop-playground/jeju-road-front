import { useState, useCallback, useEffect } from "react";
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Pagination, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Home = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getRestaurants();
  }, []);

  const getRestaurants = useCallback(async () => {
    const response = await axios.get(`/api/restaurants?page=${page - 1}&size=5&sort=id,DESC`);
    setData(response.data.information.content);
    setPagination(response.data.information.page);
    console.log(response);
  }, [page]);

  return (
    <Stack spacing={5}>
      <Typography variant="h4">목록...눌눔...</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell align="right">이름</TableCell>
              <TableCell align="right">주소</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((restaurant) => (
              <TableRow key={restaurant.id} onClick={() => navigate(`restaurant/${restaurant.id}`)} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {restaurant.id}
                </TableCell>
                <TableCell align="right">{restaurant.name}</TableCell>
                <TableCell align="right">{restaurant.address}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="flex-end">
        <Pagination count={pagination.totalPages || 1} page={page} onChange={(e, v) => setPage(v)} sx={{ mt: 2 }} />
      </Box>
    </Stack>
  );
};
