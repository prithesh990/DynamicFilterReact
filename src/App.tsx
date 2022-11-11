import * as React from "react";
import "./App.css";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";

import axios from "axios";
import { Box } from "@mui/system";

interface DataFromAPI {
  currentLevel: string;
  currentLevelAccess: boolean;
  nextLevelAccess: boolean;
  nextPage: null | string;
  nextReference?: Object | undefined | null;
  currentValue?: string | undefined;
  regions: Array<any>;
}

interface DropdownSection {
  [key: string]: DataFromAPI;
}

const App: React.FC = () => {
  const BASE_URL = "https://demo.api.satsure.co/";
  const [region, setRegion] = React.useState<string>(
    "105677d6-ae75-4fae-b71b-0c6a53f599c7"
  );
  const [dataFromApi, setDataFromApi] = React.useState<DropdownSection>(Object);
  const calledOnce = React.useRef(true);
  const [graph, setGraph] = React.useState(Object);
  const [head, setHead] = React.useState<string>("State");
  const [GraphMapped, setGraphMapped] = React.useState<any>([]);

  /**
   * {
   * state:[district],
   * district:[Tehsil],
   * village:[Khewat],
   * khewat:[murraba],
   * murabha:[khasara],
   * khasara:null
   * }
   */

  /*


   /**
   * {
   * state:[district],
   * district:[Tehsil],
   * village:[Khewat],
   * khewat:[murraba],
   * murabha:[khasara],
   * khasara:null
   * }
  
  delete (district)
    if(property == null || value is not empty){
      return
    }

    let next =item at 0
    delete its data
    
    pass the next to delete
   return call delete(toDelete) // district
  */

  const dummy: any = {
    state: ["district"],
    district: ["Tehsil"],
    Tehsil: ["village"],
    village: ["Khewat"],
    Khewat: ["murraba"],
    murraba: ["khasara"],
    khasara: null,
  };

  const deleteTry = (region: string): any => {
    if (!region || graph[region] == null) {
      delete graph[region];
      return;
    }
    let next = graph[region];
    delete graph[region];
    console.log(region);

    return deleteTry(next);
  };

  React.useEffect(() => {
    calledOnce.current = false;
    getRegionData();
    // deleteTry("district");

    console.log("useEffect called");
  }, [region]);

  const filterOptions = createFilterOptions({
    matchFrom: "start",
    stringify: (option: any) => option.name,
  });

  const onChangeDropdown = (
    e: React.SyntheticEvent,
    value: any | null,
    item: any
  ) => {
    e.preventDefault();

    // setDataFromApi((prev) => ({
    //   ...prev,
    //   [item.currentLevel]: { ...item, currentValue: value?.id },
    // }));
    if (graph[item?.currentLevel] != null) {
      deleteTry(item?.currentLevel);
      console.log(graph, [...Object.keys(graph), ...Object.values(graph)]);
      let d: any[] = [...Object.keys(graph), ...Object.values(graph)];
      setGraphMapped(d);
    } else {
      if (item?.nextLevelAccess) setRegion(value?.id);
    }
  };

  const getRegionData = async (): Promise<void> => {
    try {
      if (region) {
        const response = await axios.get(BASE_URL + `region/${region}`, {
          headers: {
            "x-api-key": import.meta.env.VITE_API_KEY,
          },
        });

        setDataFromApi((prev) => ({
          ...prev,
          [response?.data?.data?.currentLevel]: response.data.data,
        }));

        if (graph.hasOwnProperty(head)) {
          setGraph((prev: any) => ({
            ...prev,
            [head]: response?.data?.data?.currentLevel,
            [response?.data?.data?.currentLevel]: null,
          }));
          setHead(response?.data?.data?.currentLevel);
        } else {
          setGraph((prev: any) => ({
            ...prev,
            [head]: null,
          }));
        }

        console.log(graph);
      }
    } catch (err) {
      console.log(err);
    }
  };

  /*head=state
if()
head=district
{ state:['district'],
    district:[]
}

property head already exist
then push into that the new region  and create new with empty
else create new one with empty

*/

  return (
    <div className="flex justify-center">
      <div className="flex flex-col justify-center ">
        <h1 className="text-3xl font-bold text-center">Dashboard</h1>
        <div className="mt-4">
          <div className="flex justify-between my-4">
            <span className="font-semibold text-md uppercase">Filters</span>
            <span className="font-semibold text-sm uppercase text-blue-500">
              clear all
            </span>
          </div>

          {Object.keys(dataFromApi).map((item, index) => {
            return (
              <Autocomplete
                className="my-5"
                key={index}
                disablePortal
                id={dataFromApi[item].currentLevel}
                options={dataFromApi[item].regions}
                isOptionEqualToValue={(option: any, value: any) =>
                  option?.id === value?.id
                }
                disableClearable
                filterOptions={(options, state) =>
                  dataFromApi[item].currentLevelAccess
                    ? filterOptions(options, state)
                    : options
                }
                getOptionLabel={(option) => option.name}
                sx={{ width: 300 }}
                onChange={(event: any, newValue: string | null) => {
                  onChangeDropdown(event, newValue, dataFromApi[item]);
                }}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                    {...props}
                  >
                    {option.name}
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label={
                      dataFromApi[item].currentLevel
                        ? dataFromApi[item].currentLevel
                        : "State"
                    }
                  />
                )}
              />
            );
          })}
        </div>
        <div className="my-6 flex justify-center">
          <Button variant="contained" disabled>
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default App;
