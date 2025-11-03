import * as React from 'react';
import { useState, useEffect} from 'react';
import { useContext } from 'react';
import { KawayContext } from '../../kawayContext';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import * as Constants from '../../constants';
import * as httpReq from "../../http/httpReq";


export default function FilterSecurity() {

  const {duration, allAvlSec, selEx,selectedSec,durChangedFlag,candleChart,apiData,usrProf,selectedFilter } = useContext(KawayContext);
  const [selectedFil, setSelectedFil] = selectedFilter; 
  const [selectedSecs, setSelectedSecs] = selectedSec;  
  const [filteredSecs, setFilteredSecs] = useState([]);  
  let tkn = "";//profileData.userData.stsTokenManager.accessToken;

  const handleChange = (event) => {
    console.log('handleChange ...');
    setSelectedFil(event.target.value);
    
    let url = Constants.SERVER_BASEURL+"/filter?filterType="+event.target.value+"&volPercent=7";
    console.log('tmaking apiCall');

    let httpData  = httpReq.sendHttpReq(
      null,
      url,
      "POST",		
      selectedSecs,
      setFilteredSecs,
      tkn
    );	

    console.log("data from api call "+filteredSecs);
  };

  useEffect(() => {
    if(filteredSecs){
        console.log('filteredSecs is '+JSON.stringify(filteredSecs));    
        if(filteredSecs && filteredSecs.length != 0){
          setSelectedSecs(filteredSecs);
        }           
    }   
  }, [filteredSecs]); 

  
  return (
    <div>
     <Select
        labelId="selectedFil"
        id="selectedFil"
        value={selectedFil}
        label="Filter"
        onChange={handleChange}
        style={{ width: 200 }}
    >
        <MenuItem value='ALL'>ALL</MenuItem>
        <MenuItem value='STABLE_9_MON'>STABLE_9_MON</MenuItem>
        <MenuItem value='UNDERVALUED'>UNDERVALUED</MenuItem>
        <MenuItem value='ALWAYS_INCR'>ALWAYS_INCR</MenuItem>
        <MenuItem value='OFFSET_COVID_SPIKE'>OFFSET_COVID_SPIKE</MenuItem>
    </Select>
    </div>
  );
}