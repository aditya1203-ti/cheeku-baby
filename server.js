const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Latest response
let latestResponse = {
  choice: null,
  selectedDate: null,
  paymentRequired: false,
  time: null
};

app.use(express.json());
app.use(express.static("Public"));

// Test API
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend successfully connected ❤️"
  });
});

// Receive date choice + selected date
app.post("/api/date-response", (req, res) => {

  console.log("Date response received:", req.body);

  const choice = req.body.choice;
  const selectedDate = req.body.selectedDate || null;

  // Payment only for Cafe and Movie
  const paymentRequired =
    choice === "Cafe ☕" ||
    choice === "Movie 🎬";

  latestResponse = {
    choice: choice,
    selectedDate: selectedDate,
    paymentRequired: paymentRequired,
    time: new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata"
    })
  };

  res.json({
    success: true,
    message: "Response received ❤️",
    paymentRequired: paymentRequired
  });
});


// ---------------- ADMIN AUTH ----------------

function adminAuth(req, res, next) {

  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Basic ")) {
    res.setHeader(
      "WWW-Authenticate",
      'Basic realm="Cheeku Admin"'
    );

    return res.status(401).send("Login required");
  }

  const decoded = Buffer
    .from(auth.split(" ")[1], "base64")
    .toString();

  const [username, password] = decoded.split(":");

  if (
    username !== process.env.ADMIN_USER ||
    password !== process.env.ADMIN_PASSWORD
  ) {

    res.setHeader(
      "WWW-Authenticate",
      'Basic realm="Cheeku Admin"'
    );

    return res.status(401).send("Wrong username or password");
  }

  next();
}


// ---------------- ADMIN PAGE ----------------

app.get("/admin", adminAuth, (req, res) => {

  res.send(`
    <!DOCTYPE html>

    <html>

    <head>

      <title>Cheeku Admin ❤️</title>

      <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
      >

      <style>

        body {
          font-family: Arial;
          background: #fff0f5;
          text-align: center;
          padding: 40px 20px;
        }

        .card {
          max-width: 450px;
          margin: auto;
          background: white;
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,.15);
        }

        h1 {
          color: #e6396f;
        }

        .answer {
          font-size: 25px;
          font-weight: bold;
          color: #e6396f;
          margin: 20px 0;
        }

        .date {
          font-size: 18px;
          margin: 15px 0;
        }

        .payment {
          color: #e6396f;
          font-weight: bold;
          margin-top: 15px;
        }

        .time {
          color: #666;
          margin-top: 15px;
        }

      </style>

    </head>

    <body>

      <div class="card">

        <h1>Cheeku's Answer ❤️</h1>

        <div id="result">
          Loading...
        </div>

      </div>


      <script>

        async function loadAnswer() {

          try {

            const response =
              await fetch("/api/admin-response");

            const data =
              await response.json();


            if (data.choice) {

              let paymentText = "";

              if (data.paymentRequired) {

                paymentText =
                  '<div class="payment">' +
                  '💰 Payment required' +
                  '</div>';

              } else {

                paymentText =
                  '<div class="payment">' +
                  '❤️ No payment required' +
                  '</div>';

              }


              document.getElementById("result").innerHTML =

                '<div class="answer">' +
                data.choice +
                '</div>' +

                '<div class="date">' +
                '📅 Date: ' +
                (data.selectedDate || "Not selected") +
                '</div>' +

                paymentText +

                '<div class="time">' +
                'Selected at: ' +
                data.time +
                '</div>';

            }

            else {

              document.getElementById("result").innerHTML =
                "Abhi tak koi answer select nahi hua ❤️";

            }

          }

          catch (error) {

            document.getElementById("result").innerText =
              "Unable to load response.";

          }

        }


        loadAnswer();

        setInterval(loadAnswer, 5000);

      </script>

    </body>

    </html>
  `);

});


// Admin API
app.get("/api/admin-response", adminAuth, (req, res) => {

  res.json(latestResponse);

});


app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});