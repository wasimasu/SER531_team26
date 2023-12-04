from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from stardog import Connection
from datetime import datetime

app = FastAPI()

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with the actual origin of your React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Update with your Stardog connection details
stardog_conn = Connection(
    endpoint='https://sd-d18b1c9f.stardog.cloud:5820',
    username='team26',
    password='qwerty1234567',
    database='db2'
)



class DateRange(BaseModel):
    fromdate: str
    todate: str
    state: str

@app.get("/api/filter_by_date/")
async def filter_by_date(
    fromdate: str = Query(...),
    todate: str = Query(...),
    state: str = Query(...),
):
    print("Hello123")
    try:
        
        # Convert date strings to datetime objects
        from_date = datetime.strptime(fromdate, "%Y-%m-%d").date()
        to_date = datetime.strptime(todate, "%Y-%m-%d").date()
        print("Hello1")
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
                          ns:VICT_RACE ?vict_race ;
                FILTER (?occ_date >= "{from_date}"^^xsd:date && ?occ_date <= "{to_date}"^^xsd:date && ?policekillings/ns:state = "{state}"^^xsd:string && ?policekillings/ns:file_name = "hm"^^xsd:string)
            }}
        """


        # SELECT ?occ_date ?off_age ?off_sex ?off_race ?vict_age ?vict_sex ?vict_race ?file_name WHERE {{
        #         ?homicide ns:OCC_DATE ?occ_date ;
        #                   ns:OFF_AGE ?off_age ;
        #                   ns:OFF_SEX ?off_sex ;
        #                   ns:OFF_RACE ?off_race ;
        #                   ns:VICT_AGE ?vict_age ;
        #                   ns:VICT_SEX ?vict_sex ;
        #                   ns:VICT_RACE ?vict_race ;

        
        # Execute SPARQL query for homicide data
        print(homicide_query)
        try:
            results = stardog_conn.select(homicide_query)
            print(results)
        except e:
            print(e)
        # Process the results
        homicide_records = []
        for result in results:
    # Assuming that result is an iterable (e.g., a list or tuple)
            homicide_record = {
                'occ_date': result[0].value,  # Use the correct index for 'occ_date'
                'off_age': result[1].value,   # Use the correct index for 'off_age'
                'off_sex': result[2].value,   # Use the correct index for 'off_sex'
                'off_race': result[3].value,  # Use the correct index for 'off_race'
                'vict_age': result[4].value,  # Use the correct index for 'vict_age'
                'vict_sex': result[5].value,  # Use the correct index for 'vict_sex'
                'vict_race': result[6].value,  # Use the correct index for 'vict_race'
                'file_name': result[7].value,  # Use the correct index for 'file_name'
            }
            homicide_records.append(homicide_record)

        # Construct SPARQL query for filtering policekillings data
        policekillings_query = f"""
            PREFIX ns: <http://example.com/ontology#>
            SELECT ?occ_date ?vict_name ?vict_age ?vict_sex ?vict_race ?file_name WHERE {{
                ?policekillings ns:OCC_DATE ?occ_date ;
                                ns:VICT_NAME ?vict_name ;
                                ns:VICT_AGE ?vict_age ;
                                ns:VICT_SEX ?vict_sex ;
                                ns:VICT_RACE ?vict_race ;
                FILTER (?policekillings/ns:state = "{state}"^^xsd:string && ?policekillings/ns:file_name = "pk"^^xsd:string)
            }}
        """

        # Execute SPARQL query for policekillings data
        results = stardog_conn.select(policekillings_query)
        print(results)
        # Process the results
        policekillings_records = []
        for result in results:
    # Assuming that result is an iterable (e.g., a list or tuple)
            policekillings_record = {
                'occ_date': result[0].value,  # Use the correct index for 'occ_date'
                'vict_name': result[1].value,  # Use the correct index for 'vict_name'
                'vict_age': result[2].value,  # Use the correct index for 'vict_age'
                'vict_sex': result[3].value,  # Use the correct index for 'vict_sex'
                'vict_race': result[4].value,  # Use the correct index for 'vict_race'
                'file_name': result[5].value,  # Use the correct index for 'file_name'
            }
            policekillings_records.append(policekillings_record)
        
        return {"success": True, "homicide_data": homicide_records, "policekillings_data": policekillings_records}

    except Exception as e:
        
        raise HTTPException(status_code=500, detail=str(e))
