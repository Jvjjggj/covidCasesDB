const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
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

//API1
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
//API2
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;

  const query = `select * from state where state_id=${stateId}`;
  const dbresponse = await db.get(query);
  const change = format(dbresponse);
  response.send(change);
});
//API3 Adding District
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  //https://github.com/Jvjjggj/covidCasesDB.git
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const query = `
  insert into district (district_name,state_id,cases,cured,active,deaths)
  values("${districtName}",${stateId},${cases},${cured},${active},${deaths})`;
  response.send("District Successfully Added");
});

//API4 Get district with DistrictId
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const query = `
  select * from district where district_id=${districtId};`;
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

//API6

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const query = `update district set 
  district_name="${districtName}",state_id=${stateId},cases=${cases},
  cured=${cured},active=${active},deaths=${deaths}`;
  const dbresponse = await db.run(query);
  response.send("District Details Updated");
});

//API 7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;

  const query = `
  select
    sum(cases) as totalCases,
    sum(cured) as totalCured,
    sum(active) as totalActive,
    sum(deaths) as totalDeaths
  from 
     district
  where 
     state_id=${stateId};
  `;
  const dbresponse = await db.get(query);
  response.send(dbresponse);
});

//API 8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
    select state_id from district
    where district_id = ${districtId};
    `; //With this we will get the state_id using district table
  const getDistrictIdQueryResponse = await db.get(getDistrictIdQuery);
  const getStateNameQuery = `
    select state_name as stateName from state
    where state_id = ${getDistrictIdQueryResponse.state_id};
    `; //With this we will get state_name as stateName using the state_id
  const getStateNameQueryResponse = await db.get(getStateNameQuery);
  response.send(getStateNameQueryResponse);
}); //sending the required response

module.exports = app;
