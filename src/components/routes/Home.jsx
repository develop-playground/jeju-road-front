import { useState, useCallback, useEffect, useReducer } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
    Typography,
    Box,
    Pagination,
    Stack,
    Collapse,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Dialog,
    TextField,
    Backdrop,
    CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FreeMode } from "swiper";
import dayjs from "dayjs";

import PhotoCamera from "@mui/icons-material/PhotoCamera";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const initialState = { price: 0, name: "", image: { file: null, preview: "", key: "" } };

const reducer = (state, { type, payload }) => {
    switch (type) {
        case "setName":
            return { ...state, name: payload };
        case "setPrice":
            return { ...state, price: payload };
        case "setImage":
            return { ...state, image: payload };
    }
};

const AddButton = () => {
    const [open, setOpen] = useState(false);

    const [state, dispatch] = useReducer(reducer, initialState);

    const { name, price, image } = state;

    const handleChangeImage = useCallback((e) => {
        const file = e.target.files[0];
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
            dispatch({
                type: "setImage",
                payload: {
                    file,
                    preview: fileReader.result,
                    key: new Date().getTime(),
                },
            });
        };
    }, []);

    const handleClickSubmit = useCallback(() => {
        console.log(state);
    }, [state]);

    return (
        <>
            <Button size="small" variant="outlined" onClick={() => setOpen(true)}>
                추가
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <Stack p={3} spacing={3} alignItems="center" width={330}>
                    <Stack position="relative">
                        <img src={image.preview} style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: "4px" }} />
                        <Stack position="absolute" left="100%" bottom={0} ml={1}>
                            <IconButton component="label">
                                <input hidden accept="image/*" type="file" onChange={handleChangeImage} />
                                <PhotoCamera />
                            </IconButton>
                        </Stack>
                    </Stack>

                    <TextField size="small" label="이름" value={name} onChange={(e) => dispatch({ type: "setName", payload: e.target.value })} />
                    <TextField size="small" label="가격" value={price} onChange={(e) => dispatch({ type: "setPrice", payload: e.target.value })} />
                    <Stack direction="row" spacing={3} justifyContent="space-between">
                        <Button variant="outlined" size="small" onClick={() => setOpen(false)}>
                            취소
                        </Button>
                        <Button variant="outlined" size="small" onClick={handleClickSubmit}>
                            확인
                        </Button>
                    </Stack>
                </Stack>
            </Dialog>
        </>
    );
};

const MenuButton = ({ menus }) => {
    const [open, setOpen] = useState(false);
    console.log(menus);
    return (
        <>
            <Button size="small" variant="outlined" onClick={() => setOpen(true)}>
                메뉴 {menus?.length || 0}
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <Stack p={3} spacing={3}>
                    <Typography>총 {menus?.length}건</Typography>

                    <Swiper freeMode modules={[FreeMode]} spaceBetween={50} slidesPerView={2}>
                        {menus?.map((menu) => {
                            const { id, price, image, name } = menu;
                            return (
                                <SwiperSlide key={id}>
                                    <Stack spacing={1}>
                                        <Typography>{name}</Typography>
                                        <Typography>{price.toLocaleString()}원</Typography>
                                        <img
                                            src={image}
                                            onLoad={(e) => (e.target.style.opacity = 1)}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                opacity: 0,
                                                transition: "0.3s",
                                                borderRadius: "4px",
                                            }}
                                        />
                                    </Stack>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>

                    <Stack direction="row" justifyContent="flex-end" spacing={3}>
                        <Button variant="outlined" size="small" onClick={() => setOpen(false)}>
                            닫기
                        </Button>
                        <AddButton />
                    </Stack>
                </Stack>
            </Dialog>
        </>
    );
};

const Row = ({ restaurant }) => {
    const { id, name, categories, address, image } = restaurant;
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [data, setData] = useState([]);
    const { detailAddress, openTimes, tips, introduction, menus, wayToGo } = data;

    const handleClickOpen = useCallback(async () => {
        if (open) return setOpen(false);
        try {
            const response = await axios.get(`/api/restaurants/${id}`);
            setData(response.data.information);
            setOpen(true);
        } catch (error) {
            console.log(error);
        }
    }, [open]);

    console.log(openTimes);

    return (
        <>
            <TableRow sx={{ "& > td": { border: 0 } }}>
                <TableCell>
                    <IconButton size="small" onClick={handleClickOpen}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{id}</TableCell>
                <TableCell align="right">
                    <Stack spacing={1}>
                        <Typography variant="body2">{name}</Typography>
                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                            {categories.map((category) => (
                                <Typography key={category} variant="caption">
                                    {category}
                                </Typography>
                            ))}
                        </Stack>
                    </Stack>
                </TableCell>
                <TableCell align="right">{address}</TableCell>
                <TableCell align="right">
                    <img
                        onLoad={(e) => (e.target.style.opacity = 1)}
                        src={image}
                        style={{ width: "100px", height: "100px", objectFit: "cover", opacity: 0, transition: "0.3s", borderRadius: "4px" }}
                    />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell sx={{ p: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto">
                        <Stack p={5} spacing={3}>
                            <Typography>소개 : {introduction}</Typography>
                            <Typography>주소 : {detailAddress}</Typography>
                            <Typography>위치 : {wayToGo}</Typography>
                            <Stack direction="row" spacing={1}>
                                {tips?.map((tip) => (
                                    <Chip key={tip} label={tip} variant="outlined" size="small" />
                                ))}
                            </Stack>
                            <Stack alignItems="flex-end">
                                <Stack direction="row">
                                    <Typography variant="body2" width={40} />
                                    <Typography variant="body2" width={120}>
                                        영업시간
                                    </Typography>
                                    <Typography variant="body2">휴식시간</Typography>
                                </Stack>
                                {openTimes?.map((time) => {
                                    const { day, servingTime, breakTime } = time;
                                    const days = { MON: "월", TUE: "화", WED: "수", THU: "목", FRI: "금", SAT: "토", SUN: "일" };

                                    return (
                                        <Stack key={day} direction="row">
                                            <Typography variant="body2" width={40}>
                                                {days[day]}
                                            </Typography>
                                            <Typography variant="body2" width={120}>
                                                {servingTime}
                                            </Typography>
                                            <Typography variant="body2">{breakTime}</Typography>
                                        </Stack>
                                    );
                                })}
                            </Stack>

                            <Stack maxWidth="sm"></Stack>
                            <Stack direction="row" spacing={3} justifyContent="flex-end">
                                <Button size="small" variant="outlined">
                                    수정
                                </Button>
                                <MenuButton menus={menus} />
                            </Stack>
                        </Stack>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export const Home = () => {
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        getRestaurants();
    }, [page]);

    const getRestaurants = useCallback(async () => {
        const response = await axios.get(`/api/restaurants?page=${page - 1}&size=5&sort=id,DESC`);
        setData(response.data.information.content);
        setPagination(response.data.information.page);
    }, [page]);

    return (
        <Stack spacing={5}>
            <Stack>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ "&>th": { fontWeight: "bold" } }}>
                                <TableCell width={70} />
                                <TableCell width={50}>ID</TableCell>
                                <TableCell align="right">이름</TableCell>
                                <TableCell width={200} align="right">
                                    주소
                                </TableCell>
                                <TableCell width={150} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.map((restaurant) => (
                                <Row key={restaurant.id} restaurant={restaurant} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
            <Box display="flex" justifyContent="flex-end">
                <Pagination count={pagination.totalPages || 1} page={page} onChange={(e, v) => setPage(v)} sx={{ mt: 2 }} />
            </Box>
        </Stack>
    );
};
