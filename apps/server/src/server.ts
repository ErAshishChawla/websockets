import express from "express";
import { env } from "./config/env.js";

const app = express();

app.listen(env.PORT, () => {
  console.log(`Server started at port: ${env.PORT}`);
});
