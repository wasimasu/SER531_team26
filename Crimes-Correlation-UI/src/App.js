import React, { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { PieChart } from "@mui/x-charts/PieChart";
import "./App.css";

import homicidesData from "./test/Homcide_2018.json";
import policeKillingsData from "./test/PoliceKillings.json";

const states = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const stateCodeMap = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};

function App() {
  const [selectedState, setSelectedState] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [offRaceData, setOffRaceData] = useState({});
  const [pkVictRaceData, setPkVictRaceData] = useState({});
  const [maxOffRace, setMaxOffRace] = useState("");
  const [maxPkVictRace, setMaxPkVictRace] = useState("");

  useEffect(() => {
    const defaultStartDate = "2018-01-01"; // January 1st, 2018
    const defaultEndDate = "2018-05-28"; // May 28th, 2018

    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
  }, []);

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleSubmit = () => {
    try {
      // const response = await fetch('./test/Homicides_2018.json');
      // const data = await response.json();
      const data = homicidesData;

      // Map selected state name to its corresponding state code
      const selectedStateCode = stateCodeMap[selectedState];

      // Filter the fetched data based on selected state code and date range
      const filtered = data.filter((item) => {
        const itemDate = item.OCC_DATE;
        const formattedItemDate = format(
          parse(itemDate, "dd-MM-yyyy", new Date()),
          "yyyy-MM-dd"
        );

        return (
          (selectedState === "" || item.STATE === selectedStateCode) &&
          (startDate === "" || formattedItemDate >= startDate) &&
          (endDate === "" || formattedItemDate <= endDate)
        );
      });

      // Update the filtered data state
      setFilteredData(filtered);

      const countMap = {};
      filtered.forEach((item) => {
        const { OFF_RACE } = item;
        countMap[OFF_RACE] = (countMap[OFF_RACE] || 0) + 1;
      });

      // Create an array of objects with id, value, and label attributes
      const resultArray = Object.keys(countMap).map((key, index) => ({
        id: index, // Sequential id starting from 1
        value: countMap[key], // Number of occurrences
        label: key, // Unique OFF_RACE value
      }));

      console.log("resultArray", resultArray);
      handlePKData();
      setOffRaceData(resultArray);
      setMaxOffRace(getMaxOccuredRace(resultArray));
    } catch (error) {
      console.error("Error filtering data:", error);
    }
  };

  const handlePKData = () => {
    try {
      // const response = await fetch('./test/Homicides_2018.json');
      // const data = await response.json();

      const data = policeKillingsData;
      const selectedStateCode = stateCodeMap[selectedState];

      const filtered = data.filter((item) => {
        return selectedState === "" || item.STATE === selectedStateCode;
      });

      const countMap = {};
      filtered.forEach((item) => {
        const { VICT_RACE } = item;
        countMap[VICT_RACE] = (countMap[VICT_RACE] || 0) + 1;
      });

      // Create an array of objects with id, value, and label attributes
      const resultArray = Object.keys(countMap).map((key, index) => ({
        id: index, // Sequential id starting from 1
        value: countMap[key], // Number of occurrences
        label: key, // Unique OFF_RACE value
      }));

      console.log("VICT resultArray", resultArray);
      setPkVictRaceData(resultArray);
      setMaxPkVictRace(getMaxOccuredRace(resultArray));
    } catch (error) {
      console.error("Error filtering data:", error);
    }
  };

  const getMaxOccuredRace = (arr) => {
    let res = "";
    let max = Number.MIN_SAFE_INTEGER;
    arr.forEach((item) => {
      if (item.value > max) {
        res = item.label;
        max = item.value;
      }
    });
    return res;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Correlation of Crimes and Police Killings in US</h1>
        <div className="input-container">
          <div className="label-input">
            <label htmlFor="state">State:</label>
            <select
              id="state"
              onChange={handleStateChange}
              value={selectedState}
            >
              <option value="">Select a state</option>
              {states.map((state, index) => (
                <option key={index} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <div className="label-input">
            <label htmlFor="startDate">Period Start Date:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </div>
          <div className="label-input">
            <label htmlFor="endDate">Period End Date:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={handleEndDateChange}
            />
          </div>
          <button onClick={handleSubmit}>Search</button>
        </div>
      </header>
      {filteredData.length > 0 && (
        <div>
          <div className="table-container">
            <div>
              {filteredData.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      {/* <th>OCC_DATE</th>
                      <th>OFF_AGE</th>
                      <th>OFF_SEX</th>
                      <th>OFF_RACE</th>
                      <th>VICT_AGE</th>
                      <th>VICT_SEX</th>
                      <th>VICT_RACE</th> */}
                      <th>Date</th>
                      <th>Perp Age</th>
                      <th>Perp Sex</th>
                      <th>Perp Race</th>
                      <th>Victim Age</th>
                      <th>Victim Sex</th>
                      <th>Victim Race</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.OCC_DATE}</td>
                        <td>{item.OFF_AGE}</td>
                        <td>{item.OFF_SEX}</td>
                        <td>{item.OFF_RACE}</td>
                        <td>{item.VICT_AGE}</td>
                        <td>{item.VICT_SEX}</td>
                        <td>{item.VICT_RACE}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {filteredData.length === 0 && (
                <p>No data found based on the search criteria.</p>
              )}
            </div>
          </div>
          {offRaceData && offRaceData.length > 0 && (
            <div className="pie-chart-container">
              <div className="chart-1">
                <PieChart
                  series={[
                    {
                      data: offRaceData,
                      highlightScope: { faded: "global", highlighted: "item" },
                      faded: {
                        innerRadius: 30,
                        additionalRadius: -30,
                        color: "white",
                      },
                    },
                  ]}
                  height={200}
                  width={550}
                />
                <h3>Perps in {selectedState} by Race</h3>
              </div>

              {pkVictRaceData && pkVictRaceData.length > 0 && (
                <div className="chart-1">
                  <PieChart
                    series={[
                      {
                        data: pkVictRaceData,
                        highlightScope: {
                          faded: "global",
                          highlighted: "item",
                        },
                        faded: {
                          innerRadius: 30,
                          additionalRadius: -30,
                          color: "white",
                        },
                      },
                    ]}
                    height={200}
                    width={550}
                  />
                  <h3>Police Killing Victims in {selectedState} by Race</h3>
                </div>
              )}
            </div>
          )}

          {maxOffRace !== "" && maxPkVictRace !== "" && (
            <div className="conclusion">
              <p>
                {maxOffRace === maxPkVictRace
                  ? `Since the majority of police killings involve individuals of the same race as the perpetrators, there may be an indication of potential racial bias within the police force in ${selectedState}.`
                  : `Considering there's no evident correlation between the race of most police killings victims and that of the perpetrators, it suggests the absence of racial bias within the police force in ${selectedState}.`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
