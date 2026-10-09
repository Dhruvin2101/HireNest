import mongoose from "mongoose";

// One shared connection per process. On Vercel each function instance is reused across
// requests, so we connect once (lazily) and reuse it; a failed attempt is retried next time.
let connection = null;

const connectDB = () => {
  if (!connection) {
    connection = mongoose
      .connect(process.env.MONGO_URI)
      .then((instance) => {
        console.log(`mongodb connected sucuessfully`);
        return instance;
      })
      .catch((error) => {
        connection = null;
        console.error(`MongoDB connection failed: ${error.message}`);
        console.error("Check MONGO_URI in Backend/.env");
        throw error;
      });
  }
  return connection;
};

export default connectDB;
