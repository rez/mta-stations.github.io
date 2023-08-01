require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { createClient } = require("mta-realtime-subway-departures");

const app = express();
const port = process.env.PORT || 3000;

const MTA_API_KEY = process.env.MTA_KEY;
const client = createClient(MTA_API_KEY);

app.get("/", cors(), (req, res) => {
  let id = req.query.id;
  let result = [];
  client.departures(id).then((response) => {
    response.lines.forEach((line) => {
      line.departures["S"].forEach((train) =>
        result.push(createObj(response.name, train, "South"))
      );
      line.departures["N"].forEach((train) =>
        result.push(createObj(response.name, train, "North"))
      );
    });

    result.sort((a, b) => a.time - b.time);

    result.forEach(
      (train) => (train.time = new Date(train.time * 1000).toLocaleTimeString())
    );
    res.status(200).json({ status: "success", data: result });
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`MTA app listening on port ${port}`);
});

function createObj(name, train, direction) {
  return {
    name,
    line: train.routeId,
    time: train.time,
    direction,
  };
}
