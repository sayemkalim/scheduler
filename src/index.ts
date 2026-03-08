require("dotenv").config();
import express, { Application, Request, Response } from "express";
import handle_connect_to_mongo from "./config/index";
import email_router from './router/index';

const app: Application = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async () => {
  const mongo_uri = process.env.MONGO_URI;
  if (!mongo_uri) {
    console.error("MONGO_URI is not defined");
    process.exit(1);
  }
  await handle_connect_to_mongo(mongo_uri);
})();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.use("/api", email_router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
