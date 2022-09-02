import { useCallback, useEffect, useState, useReducer } from "react";
import {
    Box,
    TextField,
    Select,
    MenuItem,
    Dialog,
    Stack,
    Button,
    Checkbox,
    ImageList,
    ImageListItem,
    FormControl,
    InputLabel,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Backdrop,
    CircularProgress,
} from "@mui/material";
import axios from "axios";
import { storage } from "fb";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import DaumPostcodeEmbed from "react-daum-postcode";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";

const Loading = ({ loading, setLoading }) => {
    return (
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading} onClick={() => setLoading(false)}>
            <CircularProgress color="inherit" />
        </Backdrop>
    );
};

const TimeDialog = ({ open, setOpen, dispatch, openTimes }) => {
    const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const times = ["operationStart", "operationEnd", "breakStart", "breakEnd"];
    const defaultTime = dayjs(0).set("h", 12);

    return (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
            <Stack p={3} spacing={3}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell align="center">Oper Start</TableCell>
                                <TableCell align="center">Oper End</TableCell>
                                <TableCell align="center">Break Start</TableCell>
                                <TableCell align="center">Break End</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {days.map((day) => {
                                return (
                                    <TableRow key={day}>
                                        <TableCell align="center" padding="checkbox">
                                            <Checkbox
                                                size="small"
                                                checked={openTimes[day] ? true : false}
                                                onChange={(e) => dispatch({ type: "setOpenTimesDay", payload: { checked: e.target.checked, day } })}
                                            />
                                        </TableCell>
                                        {times.map((time) => {
                                            return (
                                                <TableCell align="center" key={time}>
                                                    <TimePicker
                                                        value={openTimes[day] ? openTimes[day][time] : defaultTime}
                                                        onChange={(v) => dispatch({ type: "setOpenTimesTime", payload: { value: v, day, time } })}
                                                        renderInput={(params) => <TextField size="small" {...params} />}
                                                    />
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
        </Dialog>
    );
};

const initialState = {
    name: "",
    categories: [],
    introduction: "",
    wayToGo: "",
    zipcode: "",
    state: "",
    city: "",
    simpleAddress: "",
    detailAddress: "",
    detailAddress2: "",
    latitude: 0,
    longitude: 0,
    tipIds: [],
    images: [],
    openTimes: {},
};

const reducer = (state, { type, payload }) => {
    switch (type) {
        case "setName":
            return { ...state, name: payload };
        case "setCategories":
            const categories = typeof payload === "string" ? payload.split(",") : payload;
            return { ...state, categories };
        case "setIntroduction":
            return { ...state, introduction: payload };
        case "setWayToGo":
            return { ...state, wayToGo: payload };
        case "setAddress":
            const { zonecode: zipcode, address, addressType, bname, buildingName, sido, sigungu: city } = payload;
            let detailAddress = address;
            let extraAddress = "";
            if (addressType === "R") {
                if (bname !== "") extraAddress += bname;
                if (buildingName !== "") extraAddress += extraAddress !== "" ? `, ${buildingName}` : buildingName;
                detailAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
            }

            const kakao = window?.kakao;
            const geocoder = kakao && new kakao.maps.services.Geocoder();
            const geo = geocoder.addressSearch(detailAddress, (result, status) => {
                if (!status) return { latitude: 0, longitude: 0 };
                if (status === kakao.maps.services.Status.OK) return { latitude: result[0].y, longitude: result[0].x };
            });

            return { ...state, detailAddress, zipcode, city, state: sido };

        case "setDetailAddress2":
            return { ...state, detailAddress2: payload };
        case "setSimpleAddress":
            return { ...state, simpleAddress: payload };
        case "setTipIds":
            const tipIds = typeof payload === "string" ? payload.split(",") : payload;
            return { ...state, tipIds };

        case "setOpenTimesDay": {
            const { checked, day } = payload;
            let openTimes = { ...state.openTimes };
            const defaultTime = dayjs(0).set("h", 12);
            if (checked) openTimes[day] = { operationStart: defaultTime, operationEnd: defaultTime, breakStart: defaultTime, breakEnd: defaultTime };
            else delete openTimes[day];
            return { ...state, openTimes };
        }
        case "setOpenTimesTime": {
            const { time, day, value } = payload;
            const newDay = { ...state.openTimes[day], [time]: value };
            const openTimes = { ...state.openTimes, [day]: newDay };
            return { ...state, openTimes };
        }
    }
};

export const Write = () => {
    const [openAddress, setOpenAddress] = useState(false);
    const [openTimeDialog, setOpenTimeDialog] = useState(false);
    const [loading, setLoading] = useState(false);

    const [_state, dispatch] = useReducer(reducer, initialState);
    const { name, introduction, categories, wayToGo, zipcode, simpleAddress, detailAddress, detailAddress2, tipIds, openTimes } = _state;

    const [options, setOptions] = useState([]);
    const [images, setImages] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                axios
                    .all([axios.get("/api/restaurants/categories"), axios.get("/api/restaurants/tips")])
                    .then(axios.spread((categories, tips) => setOptions([categories.data.information, tips.data.information])));
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);

    const handleChangeImages = useCallback((e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file, i) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            return new Promise((resolve) => {
                fileReader.onload = () => {
                    resolve({
                        file,
                        preview: fileReader.result,
                        key: new Date().getTime() + "_" + i,
                    });
                };
            });
        });
        Promise.all(newImages).then((v) => setImages((prev) => [...prev, ...v]));
        e.target.value = "";
    }, []);

    const upload = useCallback(async () => {
        const urls = images.map(async (image) => {
            const storageRef = ref(storage, `/images/${image.key}`);
            await uploadBytes(storageRef, image.file);
            return await getDownloadURL(storageRef);
        });
        const paths = await Promise.all(urls);
        return paths;
    }, [images]);

    const handleComplete = useCallback((data) => {
        dispatch({ type: "setAddress", payload: data });
        setOpenAddress(false);
    }, []);

    const handleClickSubmit = useCallback(async () => {
        setLoading(true);
        const { openTimes, images, detailAddress, detailAddress2, ...rest } = _state;
        const entries = Object.entries(openTimes);
        const openTimesAry = entries.map((v) => {
            const format = "HH:mm:00";
            const times = {
                operationStart: v[1].operationStart.format(format),
                operationEnd: v[1].operationEnd.format(format),
                breakStart: v[1].breakStart.format(format),
                breakEnd: v[1].breakEnd.format(format),
            };
            return { [v[0]]: times };
        });
        // const imagePaths = await upload();
        console.log(`${detailAddress}${detailAddress2 ? " " + detailAddress2 : ""}`);

        return;
        try {
            const response = await axios.post("/api/restaurants", {});
        } catch (error) {
            console.log(error);
        }
    }, [_state]);

    return (
        <>
            <Stack spacing={5}>
                <Stack spacing={3} flex={1}>
                    <TextField label="이름" fullWidth size="small" value={name} onChange={(e) => dispatch({ type: "setName", payload: e.target.value })} />
                    <Stack>
                        <Stack direction="row" spacing={3}>
                            <TextField
                                label="우편번호"
                                fullWidth
                                size="small"
                                value={zipcode}
                                InputProps={{ readOnly: true }}
                                onChange={(e) => dispatch({ type: "setSimpleAdress", payload: e.target.value })}
                            />
                            <Button variant="contained" onClick={() => setOpenAddress(true)}>
                                검색
                            </Button>
                        </Stack>
                    </Stack>
                    <TextField label="주소" fullWidth size="small" InputProps={{ readOnly: true }} value={detailAddress} />
                    <TextField
                        label="상세 주소"
                        fullWidth
                        size="small"
                        value={detailAddress2}
                        onChange={(e) => dispatch({ type: "setDetailAddress2", payload: e.target.value })}
                    />
                    <TextField
                        label="간단한 주소"
                        fullWidth
                        size="small"
                        value={simpleAddress}
                        onChange={(e) => dispatch({ type: "setSimpleAddress", payload: e.target.value })}
                    />
                    <TextField
                        label="소개"
                        fullWidth
                        size="small"
                        value={introduction}
                        onChange={(e) => dispatch({ type: "setIntroduction", payload: e.target.value })}
                    />
                    <FormControl fullWidth size="small">
                        <InputLabel>카테고리</InputLabel>
                        <Select
                            label="카테고리"
                            fullWidth
                            size="small"
                            multiple
                            value={categories}
                            onChange={(e) => dispatch({ type: "setCategories", payload: e.target.value })}
                        >
                            {options[0]?.map((option) => (
                                <MenuItem key={option.name} value={option.name}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                        <InputLabel>이용 팁</InputLabel>
                        <Select
                            label="이용 팁"
                            fullWidth
                            size="small"
                            multiple
                            value={tipIds}
                            onChange={(e) => dispatch({ type: "setTipIds", payload: e.target.value })}
                        >
                            {options[1]?.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.content}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="가는 방법"
                        fullWidth
                        size="small"
                        value={wayToGo}
                        onChange={(e) => dispatch({ type: "setWayToGo", payload: e.target.value })}
                    />
                </Stack>
                <Box display="flex" justifyContent="space-between">
                    <Stack direction="row" spacing={3}>
                        <label>
                            <Button component="span" variant="contained">
                                이미지 추가
                            </Button>
                            <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleChangeImages} />
                        </label>
                        <Button variant="contained" onClick={() => setOpenTimeDialog(true)}>
                            영업시간 추가
                        </Button>
                    </Stack>
                    <Button variant="contained" onClick={handleClickSubmit}>
                        저장
                    </Button>
                </Box>
                <Stack flex={1}>
                    <ImageList cols={4} gap={10}>
                        {images.map((image) => (
                            <ImageListItem key={image.key}>
                                <img src={image.preview} style={{ aspectRatio: 1, borderRadius: 2, objectFit: "cover" }} />
                            </ImageListItem>
                        ))}
                    </ImageList>
                </Stack>
            </Stack>

            <Dialog open={openAddress} onClose={() => setOpenAddress(false)} fullWidth>
                <DaumPostcodeEmbed onComplete={handleComplete} />
            </Dialog>

            <TimeDialog open={openTimeDialog} setOpen={setOpenTimeDialog} dispatch={dispatch} openTimes={openTimes} />

            <Loading loading={loading} setLoading={setLoading} />
        </>
    );
};
