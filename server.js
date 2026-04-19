import cors from "cors";
import mongoose from "mongoose";
import { PORT, MONGO_URI } from "./src/config/db.js";
import { app } from "./app.js";
import testRoutes from "./src/routes/testRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import { protect } from "./src/middleware/authmiddleware.js";

app.use(cors());

mongoose.connect(MONGO_URI)
.then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/test', protect, testRoutes);
app.use("/api/auth", authRoutes);