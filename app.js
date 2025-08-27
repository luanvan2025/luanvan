import express from 'express';
import Routes from './routers/index.js';//dường dẫn all router
//khi đăng nhập cần kiểm tra token
import dotenv from 'dotenv';
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());//cho phép tất cả các nguồn truy cập vào API từ phía client
app.use(express.json());



Routes(app);//dường dẫn all router



app.listen(9999, () => {
    console.log('Server running on port 9999');
});
