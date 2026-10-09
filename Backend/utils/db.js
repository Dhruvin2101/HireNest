import mongoose from "mongoose";

const connectDB = async () => {
    try {
       await mongoose.connect(process.env.MONGO_URI)
       console.log(`mongodb connected sucuessfully`);
       
    } catch (error) {
        // Without a DB every request would just stall, so fail loudly and stop
        console.error(`MongoDB connection failed: ${error.message}`);
        console.error("Check MONGO_URI in Backend/.env");
        process.exit(1);
    }
}

export default connectDB