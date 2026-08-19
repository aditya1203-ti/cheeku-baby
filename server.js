const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.get("/api/test", (req, res) => {
    res.json({
        message: "Backend successfully connected ❤️"
    });
});

app.post("/api/date-response", (req, res) => {
    console.log("Date choice received:", req.body);

    res.json({
        success: true,
        message: "Response received ❤️"
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});