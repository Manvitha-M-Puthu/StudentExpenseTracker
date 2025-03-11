import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import categoryRoutes from "./routes/categoryRoutes.js";
import transactionRoutes from './routes/transactionRoutes.js';
import debtRoutes from './routes/debtRoutes.js';


const app = express();
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Credentials",true);
    next();
})

app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true 
}));

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api', budgetRoutes);
app.use("/api", categoryRoutes);
app.use('/api', transactionRoutes);
app.use('/api', debtRoutes);


app.listen(8800,()=>{
    console.log("Server is running on port 8080");
})

export default app;