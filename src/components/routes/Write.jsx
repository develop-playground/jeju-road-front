import { useCallback, useEffect, useState } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Dialog,
  Stack,
  Button,
  Checkbox,
  FormControlLabel,
  ImageList,
  ImageListItem,
  FormControl,
  InputLabel,
  DialogContent,
  Typography,
} from "@mui/material";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "fb";
import DaumPostcodeEmbed from "react-daum-postcode";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const AddOpenTime = ({ openTimes, setOpenTimes }) => {
  const handleChangeCheckbox = useCallback(
    (day) => {
      const some = openTimes.some((v) => v.day === day);
      if (some) setOpenTimes((prev) => prev.filter((v) => v.day !== day));
      else setOpenTimes((prev) => [...prev, { day }]);
    },
    [openTimes]
  );

  const handleChangeTime = useCallback(
    (e, day, time) => {
      const restDays = openTimes.filter((v) => v.day !== day);
      const dayValue = openTimes.filter((v) => v.day === day);
      dayValue[0][time] = e.target.value;
      setOpenTimes([...restDays, ...dayValue]);
    },
    [openTimes]
  );

  return (
    <DialogContent>
      <Stack spacing={3}>
        {DAYS.map((day) => (
          <Stack direction="row" spacing={3} key={day} alignItems="center">
            <Box width={200}>
              <FormControlLabel control={<Checkbox checked={openTimes.some((v) => v.day === day)} onChange={() => handleChangeCheckbox(day)} />} label={day} />
            </Box>
            <TextField
              value={openTimes.filter((v) => v.day === day)?.[0]?.["operationStart"] || ""}
              onChange={(e) => handleChangeTime(e, day, "operationStart")}
              disabled={!openTimes.some((v) => v.day === day)}
              size="small"
            />
            <TextField
              value={openTimes.filter((v) => v.day === day)?.[0]?.["operationEnd"] || ""}
              onChange={(e) => handleChangeTime(e, day, "operationEnd")}
              disabled={!openTimes.some((v) => v.day === day)}
              size="small"
            />
            <TextField
              value={openTimes.filter((v) => v.day === day)?.[0]?.["breakStart"] || ""}
              onChange={(e) => handleChangeTime(e, day, "breakStart")}
              disabled={!openTimes.some((v) => v.day === day)}
              size="small"
            />
            <TextField
              value={openTimes.filter((v) => v.day === day)?.[0]?.["breakEnd"] || ""}
              onChange={(e) => handleChangeTime(e, day, "breakEnd")}
              disabled={!openTimes.some((v) => v.day === day)}
              size="small"
            />
          </Stack>
        ))}
      </Stack>
    </DialogContent>
  );
};

const AddImage = () => {
  return <div></div>;
};

export const Write = () => {
  const [openAddress, setOpenAddress] = useState(false);
  const [openAddOpenTime, setOpenAddOpenTime] = useState(false);
  const [openAddImage, setOpenAddImage] = useState(false);

  const [categoryOption, setCategoryOption] = useState([]);

  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [introduction, setIntroduction] = useState("");
  const [wayToGo, setWayToGo] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [simpleAddress, setSimpleAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [tipIds, setTipIds] = useState([]);
  const [images, setImages] = useState([]);
  const [openTimes, setOpenTimes] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        axios.all([axios.get("/api/restaurants/categories"), axios.get("/api/restaurants/tips")]).then(
          axios.spread((categories, tips) => {
            setCategoryOption(categories.data.information);
            console.log(tips.data.information);
          })
        );
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const handleChangeCategories = useCallback((event) => {
    const {
      target: { value },
    } = event;
    setCategories(typeof value === "string" ? value.split(",") : value);
  }, []);

  const handleChangeTipIds = useCallback((event) => {
    const {
      target: { value },
    } = event;
    setTipIds(typeof value === "string" ? value.split(",") : value);
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
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress += extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    const kakao = window?.kakao;
    const geocoder = kakao && new kakao.maps.services.Geocoder();
    geocoder.addressSearch(fullAddress, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        setLatitude(result[0].y);
        setLongitude(result[0].x);
      }
    });

    setState(data.sido);
    setCity(data.sigungu);
    setZipcode(data.zonecode);
    setDetailAddress(fullAddress);
    setOpenAddress(false);
  }, []);

  const handleClickSubmit = useCallback(async () => {
    const imagePaths = await upload();

    const response = await axios.post("/api/restaurants", {
      name,
      categories,
      introduction,
      wayToGo,
      zipcode,
      state,
      city,
      simpleAddress,
      detailAddress,
      latitude: 11.11,
      longitude: 22.22,
      tipIds: [1, 2],
      images: imagePaths,
      openTimes: [
        {
          day: "MON",
          operationStart: "09:00:00",
          operationEnd: "21:00:00",
          breakStart: "14:00:00",
          breakEnd: "16:00:00",
        },
        {
          day: "TUE",
          operationStart: "09:00:00",
          operationEnd: "21:00:00",
          breakStart: "14:00:00",
          breakEnd: "16:00:00",
        },
        {
          day: "WED",
          operationStart: "09:00:00",
          operationEnd: "21:00:00",
          breakStart: "14:00:00",
          breakEnd: "16:00:00",
        },
        {
          day: "THU",
          operationStart: "09:00:00",
          operationEnd: "21:00:00",
          breakStart: "14:00:00",
          breakEnd: "16:00:00",
        },
        {
          day: "FRI",
          operationStart: "09:00:00",
          operationEnd: "21:00:00",
          breakStart: "14:00:00",
          breakEnd: "16:00:00",
        },
        {
          day: "SAT",
          operationStart: "09:00:00",
          operationEnd: "21:00:00",
          breakStart: "14:00:00",
          // breakEnd: "16:00:00",
        },
      ],
    });
  }, [name, categories, introduction, wayToGo, zipcode, state, city, simpleAddress, detailAddress, latitude, longitude, tipIds, images, openTimes]);

  return (
    <>
      <Stack spacing={5}>
        <Typography variant="h4">식당 등록하기...</Typography>
        <Stack spacing={3} flex={1}>
          <TextField label="이름" fullWidth variant="filled" size="small" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField
            label="주소"
            fullWidth
            variant="filled"
            size="small"
            InputProps={{ readOnly: true }}
            value={detailAddress}
            onClick={() => setOpenAddress(true)}
          />
          <TextField label="간단한 주소" fullWidth variant="filled" size="small" value={simpleAddress} onChange={(e) => setSimpleAddress(e.target.value)} />
          <TextField label="소개" fullWidth variant="filled" size="small" value={introduction} onChange={(e) => setIntroduction(e.target.value)} />
          <FormControl fullWidth>
            <InputLabel>카테고리</InputLabel>
            <Select label="카테고리" fullWidth size="small" multiple variant="filled" value={categories} onChange={handleChangeCategories}>
              {categoryOption.map((category) => (
                <MenuItem key={category.name} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>이용 팁</InputLabel>
            <Select label="이용 팁" fullWidth size="small" variant="filled" multiple value={tipIds} onChange={handleChangeTipIds}>
              <MenuItem value={1}>주차가능</MenuItem>
              <MenuItem value={2}>ㅋㅋ</MenuItem>
            </Select>
          </FormControl>
          <TextField label="가는 방법" fullWidth variant="filled" size="small" value={wayToGo} onChange={(e) => setWayToGo(e.target.value)} />
        </Stack>
        <Box display="flex" justifyContent="space-between">
          <Stack direction="row" spacing={3}>
            <Button variant="contained" onClick={() => setOpenAddOpenTime(true)}>
              영업시간 추가
            </Button>
            <label>
              <Button component="span" variant="contained">
                이미지 추가
              </Button>
              <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleChangeImages} />
            </label>
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
      <Dialog open={openAddOpenTime} onClose={() => setOpenAddOpenTime(false)} fullWidth>
        <AddOpenTime openTimes={openTimes} setOpenTimes={setOpenTimes} />
      </Dialog>
      <Dialog open={openAddImage} onClose={() => setOpenAddImage(false)} fullWidth>
        <AddImage images={images} setOpenAddImage={setOpenAddImage} />
      </Dialog>
    </>
  );
};
