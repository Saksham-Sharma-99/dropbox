
const express = require("express");
const routes = require("./routers/routes");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const bodyParser = require("body-parser")
const cors = require("cors")
const port = process.env.PORT;


app.use(cors())
app.use(bodyParser.urlencoded({ limit: "100mb", extended: false }))
app.use(bodyParser.json())
app.use("/api", routes)

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});