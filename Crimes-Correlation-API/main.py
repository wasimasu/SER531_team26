from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rdflib import Graph
from datetime import datetime
import requests

app = FastAPI()

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with the actual origin of your React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Stardog endpoint details
STARDOG_USERNAME = "wsyed4@asu.edu"
STARDOG_PASSWORD = "Wasim@123"
STARDOG_DATABASE = "db2"
STARDOG_ENDPOINT_URL = "https://sd-d18b1c9f.stardog.cloud:5820"

class DateRange(BaseModel):
    fromdate: str
    todate: str
    state: str

@app.get("/api/filter_by_date/")
async def filter_by_date(fromdate: str, todate: str, state: str):
    try:
        # Convert date strings to datetime objects
        from_date = datetime.strptime(fromdate, "%Y-%m-%d").date()
        to_date = datetime.strptime(todate, "%Y-%m-%d").date()

        # Construct SPARQL query for filtering homicide data
        homicide_query = f"""
            PREFIX ns: <http://example.com/ontology#>
            SELECT ?occ_date ?off_age ?off_sex ?off_race ?vict_age ?vict_sex ?vict_race ?file_name WHERE {{
                ?homicide ns:OCC_DATE ?occ_date ;
                          ns:OFF_AGE ?off_age ;
                          ns:OFF_SEX ?off_sex ;
                          ns:OFF_RACE ?off_race ;
                          ns:VICT_AGE ?vict_age ;
                          ns:VICT_SEX ?vict_sex ;
                          ns:VICT_RACE ?vict_race .
                FILTER (?occ_date >= "{from_date}"^^xsd:date && ?occ_date <= "{to_date}"^^xsd:date && ?policekillings/ns:state = "{state}"^^xsd:string && ?policekillings/ns:file_name = "pk"^^xsd:string)
            }}
        """

        # Construct SPARQL query for filtering policekillings data
        policekillings_query = f"""
            PREFIX ns: <http://example.com/ontology#>
            SELECT ?occ_date ?vict_name ?vict_age ?vict_sex ?vict_race ?file_name WHERE {{
                ?policekillings ns:OCC_DATE ?occ_date ;
                                ns:VICT_NAME ?vict_name ;
                                ns:VICT_AGE ?vict_age ;
                                ns:VICT_SEX ?vict_sex ;
                                ns:VICT_RACE ?vict_race .
                FILTER (?policekillings/ns:state = "{state}"^^xsd:string && ?policekillings/ns:file_name = "pk"^^xsd:string)
            }}
        """

        # Execute SPARQL query for homicide data using Stardog HTTP API
        headers = {'Content-Type': 'application/sparql-query', 'Accept': 'application/sparql-results+json'}
        auth = (STARDOG_USERNAME, STARDOG_PASSWORD)
        
        # Execute SPARQL query for homicide data
        params_homicide = {'query': homicide_query}
        response_homicide = requests.get(f"{STARDOG_ENDPOINT_URL}/{STARDOG_DATABASE}/query", headers=headers, auth=auth, params=params_homicide)

        if response_homicide.status_code == 200:
            # Process results if the request was successful
            homicide_results = response_homicide.json()
            # Process the JSON results as needed and create homicide_records

            # Execute SPARQL query for policekillings data
            params_policekillings = {'query': policekillings_query}
            response_policekillings = requests.get(f"{STARDOG_ENDPOINT_URL}/{STARDOG_DATABASE}/query", headers=headers, auth=auth, params=params_policekillings)

            if response_policekillings.status_code == 200:
                # Process results if the request was successful
                policekillings_results = response_policekillings.json()
                # Process the JSON results as needed and create policekillings_records

                return {"success": True, "homicide_data": homicide_results, "policekillings_data": policekillings_results}
            else:
                # Handle error response for policekillings query
                error_message = response_policekillings.text
                raise HTTPException(status_code=response_policekillings.status_code, detail=error_message)
        else:
            # Handle error response for homicide query
            error_message = response_homicide.text
            raise HTTPException(status_code=response_homicide.status_code, detail=error_message)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
