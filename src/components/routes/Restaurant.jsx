import { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { storage } from "fb";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Button,
  Dialog,
  Typography,
  Box,
  Chip,
  Stack,
  ImageList,
  ImageListItem,
  Divider,
  TextField,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

const Menu = () => {
  const params = useParams();
  const { id } = params;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState({});

  const handleChangeImage = useCallback(async (e) => {
    const file = e.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    const preview = await new Promise((resolve) => {
      fileReader.onload = () => resolve(fileReader.result);
    });
    setImage({ key: `${new Date().getTime()}`, file, preview });
  }, []);

  const upload = useCallback(async () => {
    const storageRef = ref(storage, `/images/${image.key}`);
    await uploadBytes(storageRef, image.file);
    return await getDownloadURL(storageRef);
  }, [image]);

  const handleClickSubmit = useCallback(async () => {
    const path = await upload();

    const response = await axios.post(`/api/restaurants/${id}/menus`, {
      name,
      image: path,
      price: Number(price),
    });
    console.log(response);
    console.log(path);
    console.log({ name, price, image });
  }, [name, price, image]);

  return (
    <Box width={250}>
      <Box height={200} display="flex">
        {image?.preview ? (
          <img src={image.preview} style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
        ) : (
          <Box sx={{ flex: 1, justifyContent: "center", alignItems: "center", display: "flex" }}>
            <label>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleChangeImage(e)} />
              <Button variant="outlined" component="span">
                이미지 추가
              </Button>
            </label>
          </Box>
        )}
      </Box>
      <Box>
        <DialogContent>
          <DialogContentText>이름</DialogContentText>
          <TextField variant="standard" size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
          <DialogContentText mt={3}>가격</DialogContentText>
          <TextField variant="standard" size="small" fullWidth value={price} onChange={(e) => setPrice(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" fullWidth onClick={handleClickSubmit}>
            저장
          </Button>
        </DialogActions>
      </Box>
    </Box>
  );
};

export const Restaurant = () => {
  const params = useParams();
  const { id } = params;

  const [data, setData] = useState();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const response = await axios.get(`/api/restaurants/${id}`);
      console.log(response.data.information);
      setData(response.data.information);
    })();
  }, []);

  return (
    data && (
      <>
        <Stack spacing={5}>
          <Typography variant="h4">..........</Typography>

          <Stack flex={1}>
            <Stack spacing={3}>
              <TextField label="이름" fullWidth variant="filled" size="small" value={data.name} InputProps={{ readOnly: true }} />
              <TextField label="주소" fullWidth variant="filled" size="small" value={data.detailAddress} InputProps={{ readOnly: true }} />
              <TextField label="간단한 주소" fullWidth variant="filled" size="small" value={data.simpleAddress} InputProps={{ readOnly: true }} />
              <TextField label="소개" fullWidth variant="filled" size="small" value={data.introduction} InputProps={{ readOnly: true }} />
              <TextField label="가는방법" fullWidth variant="filled" size="small" value={data.wayToGo} InputProps={{ readOnly: true }} />
              <Stack direction="row" spacing={3}>
                {data.tips.map((tip) => (
                  <Chip key={tip} label={tip} />
                ))}
              </Stack>
            </Stack>
          </Stack>

          <Box display="flex" justifyContent="flex-end">
            <Button variant="contained" onClick={() => setOpen(true)}>
              메뉴추가
            </Button>
          </Box>

          {/* <Stack flex={1} maxHeight={500}>
            <ImageList cols={3}>
              {[0, 1, 2, 3, 4, 5, 6].map((image) => (
                <ImageListItem key={image.key}>
                  <img src={"https://picsum.photos/200"} style={{ aspectRatio: 1, borderRadius: 10 }} />
                </ImageListItem>
              ))}
            </ImageList>
          </Stack> */}
        </Stack>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <Menu />
        </Dialog>
      </>
    )
  );
};
