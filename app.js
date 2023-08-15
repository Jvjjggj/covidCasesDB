const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "covid19India.db");
let db = null;
const connectDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(4001, () => {
      console.log("Server Is Running");
    });
  } catch (error) {
    console.log(`DB Erroe ${error.message}`);
  }
};

connectDBAndServer();

const format = function (i) {
  return {
    stateId: i.state_id,
    stateName: i.state_name,
    population: i.population,
  };
};

app.get("/states/", async (request, response) => {
  const query = `select * from state
    `;

  const dbresponse = await db.all(query);
  let lst = [];
  for (let i of dbresponse) {
    const change = format(i);
    lst.push(change);
  }
  response.send(lst);
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;

  const query = `select * from state where state_id=${stateId}`;
  const dbresponse = await db.get(query);
  const change = format(dbresponse);
  response.send(change);
});

app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  //https://github.com/Jvjjggj/covidCasesDB.git
  response.send(districtDetails);
});
