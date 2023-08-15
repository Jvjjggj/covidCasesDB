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
//Adding District
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  //https://github.com/Jvjjggj/covidCasesDB.git
  response.send(districtDetails);
});

const formatDistrict = function (i) {
  return {
    districtId: i.district_id,
    districtName: i.district_name,
    stateId: i.state_id,
    cases: i.cases,
    cured: i.cured,
    active: i.active,
    deaths: i.deaths,
  };
};

//API4 Get district with DistrictId
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const query = `select * from district where district_id=${districtId}`;
  const dbresponse = await db.get(query);
  const change = formatDistrict(dbresponse);
  response.send(change);
});

//API5 delecting delect with districtId

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const query = `delete from district where district_id=${districtId}`;
  const dbresponse = await db.run(query);
  response.send("District Removed");
});
