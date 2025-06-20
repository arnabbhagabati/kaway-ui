import "../../../style.css";
import useHttpReq from "../../../http/request";
import * as constants from '../../../constants';
import { createChart, ColorType } from 'lightweight-charts';
import React, { useEffect, useRef,useState,useMemo } from 'react';
import { KawayContext } from '../../../kawayContext';
import { useContext } from 'react';
import MultiBtn from '../../graph-dur-selector/graph-dur-selector';
import {addToMap, removeFromMap} from '../../../util';
import Typography from '@mui/material/Typography';


export const ChartComponent = props => {
	const {		
		colors: {
			backgroundColor = 'white',
			lineColor = constants.COLORS.normal_blue,
			textColor = 'black',
			areaTopColor = '#2962FF',
			areaBottomColor = 'rgba(41, 98, 255, 0.28)',
		} = {},
	} = props;

	const chartContainerRef = useRef();	
	//const [chartContainerRef, setChartContainerRef] = useState();

	const {duration, allAvlSec, selEx,selectedSec,durChangedFlag,candleChart,apiData } = useContext(KawayContext);
	const [ctxDuration, setCtxDuration] = duration; 	
	const [selectedSecs, setSelectedSecs] = selectedSec;  
	const [durChgFlag, setDurChgFlag] = durChangedFlag;
	const [apiCallData, setApiCalldata] = apiData; 
	const [graphSelDuration, setGraphSelDuration] = useState(-99); 

	let [graphSelFlag,setGraphSelFlag] = useState(false); 
	
	//console.log('graphSelFlag 1 is'+graphSelFlag);
	// To Do - change it to a integer variable
    const ref = useRef(true);	

	useEffect(
		() => {

			
			const firstRender = ref.current;
			//console.log('candleStickGraph props is'+JSON.stringify(props));

			const handleResize = () => {
				chart.applyOptions({ width: chartContainerRef.current.clientWidth });
			};

			const chart = createChart(chartContainerRef.current, {
				layout: {
					background: { type: ColorType.Solid, color: backgroundColor },
					textColor,
				},
				width: chartContainerRef.current.clientWidth,
				height: 250,
			});
			chart.timeScale().fitContent();

			const newSeries = chart.addCandlestickSeries({ lineColor, topColor: areaTopColor, bottomColor: areaBottomColor });
			//console.log('graphDuration in graph =='+graphDuration);
			//console.log('graphSelDuration in graph =='+graphSelDuration);	
			//console.log('ctxDuration in graph =='+ctxDuration);		
			//console.log('firstRender in graph =='+firstRender);	

			if( firstRender){
				ref.current = false;
				setGraphSelDuration(ctxDuration);
			}

			if( (durChgFlag && ctxDuration != graphSelDuration)){
				
				//console.log('ctxDuration in ctxDuration check =='+ctxDuration);
				setGraphSelDuration(ctxDuration);				
				setDurChgFlag(false);					
			}


			if(graphSelDuration){
					
					let graphData = [];
					let tmpDuration = graphSelDuration;					
					//console.log('graphDuration in graphSelDuration check =='+graphDuration);
					//console.log('ctxDuration in graphSelDuration check =='+ctxDuration);
					//console.log('graphSelDuration in graphSelDuration check =='+graphSelDuration);
					const startDate = new Date();
					startDate.setDate(startDate.getDate() - tmpDuration);
					
					//console.log('setGraphData '+JSON.stringify(graphData));
					//console.log('basicGraph  tmpDuration '+tmpDuration);					
					let graphSourceData= [];
					if(tmpDuration<91){
						graphSourceData	= props.gdata.fifMin;
					}else{
						graphSourceData = props.gdata.oneDay;
					}
	
					graphSourceData.forEach(element => {				
						if(element != null && element.time != null && element.time.length>0){
							let parts = element.time.split('-');		
							let currDate = new Date(parts[0], parts[1] - 1, parts[2]); 
							if(currDate>startDate){
								const gPoint = {
									"time" : element.utcTimestamp,
									"open" : element.open,
                                    "close" : element.close,
                                    "high" : element.high,
                                    "low" : element.low,
                                    "volume" : element.volume,
								}
								graphData.push(gPoint);
							}				
						}else{
							//console.log('bad data found '+JSON.stringify(element));
						}				
					});

				//console.log('setGraphData 4 is'+JSON.stringify(graphData));			
				newSeries.setData(graphData);	
				const now = Date.now();
				let key = props.security.exchange+"_"+props.security.id+"_"+props.security.type;		
				if(!apiCallData.get(key) || (apiCallData.get(key) && (now - apiCallData.get(key).time)>3600000)){									
					addToMap(key,{time: now, data:props.gdata},apiCallData, setApiCalldata);
				}	
			}
			
			window.addEventListener('resize', handleResize);			
			
			return () => {
				window.removeEventListener('resize', handleResize);
				chart.remove();
			};
		},
		[graphSelDuration,ctxDuration,selectedSecs,props.gdata]
	);	

	return (
		<div>
			<div class="graph-header">			
			<div class="stock-id"> 
					<p class="stock-id-text"> {props.security.displayId} ({props.security.displayName})</p>
				</div>    
				<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}></Typography>
				<MultiBtn class="range-select" graphDur={graphSelDuration} setGraphDur={setGraphSelDuration} setGraphSelFlag={setGraphSelFlag}/>	
			</div>		
			<div id="chart-container"
				ref={chartContainerRef}
			/>	
		</div>
			
	);
};



export default function App(props) {

	const {apiData } = useContext(KawayContext);
	const [apiCallData, setApiCalldata] = apiData; 	
	
	console.log('candleStickGraph props 1 '+JSON.stringify(props));
	let url = constants.SERVER_BASEURL+"/histData/"+props.security.exchange+"/"+props.security.id+"?type="+props.security.type+"&stDate=1995-05-12&endDate=2005-05-12";	
	
	let httpData = null;
	let key = props.security.exchange+"_"+props.security.id+"_"+props.security.type;
	let existingData = apiCallData.get(key);
	const now = Date.now();
	if(existingData !== null && typeof existingData != "undefined" && (now-existingData.time) > 3600000){
		existingData = null;
	}


	httpData  = useHttpReq(
		existingData,
		url,
		"GET",		
	);	
		
    if (httpData.loaded) {	
		if(httpData.error){
			return (
				<div class="graph-container">		
					<span>Error: {httpData.error}</span>
				</div>
			)
		}else{	
			console.log('candleStickGraph return 1 ');		
			return (

				(	
					<div class="graph-container" id="graph-container-1}">			 				
						<ChartComponent {...props} gdata={httpData.data}></ChartComponent>
					</div>
				)
			)
		}		
	  }

	return (
		<div class="graph-container">
			<p>Loading..</p>			
		</div>		
	);
}