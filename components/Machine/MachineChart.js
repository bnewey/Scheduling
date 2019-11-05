import React, {Component} from 'react';
import {Chart, Bar} from 'react-chartjs-2';


//import {render} from 'react-dom';
//import App from './App';

export default class MachineChart extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: {
                labels: ["1","2","3","4","5","6","7","8"],
                datasets:[
                {
                    label: "temperature",
                    backgroundColor: "rgba(255,0,255,0,0.75)",
                    data: []
                },
                {
                    label: "pressure",
                    backgroundColor: "rgba(0,255,0,0.75)",
                    data: []
                }
                ]

            }
        }


    }

    setGradientColor = (canvas, color) =>{
        const ctx = canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(300,100,300,550);//0,10,600,550);
        gradient.addColorStop(0, color);
        let adj_color = color.substring(4, color.length-1)
                            .replace(/ /g, '')
                            .split(',');
        gradient.addColorStop(0.95,"rgba("+ (adj_color[0] > 0 ? adj_color[0]-(adj_color[0]/10) : 0) + "," +(adj_color[1] > 0 ? adj_color[1]-(adj_color[1]/10) : 0) + "," + (adj_color[2] > 0 ? adj_color[2]-(adj_color[2]/10) : 0)+ ",0.2)");
        if(!gradient || gradient == undefined){
            return color;
        }
        return gradient;
    }

    getChartData = canvas => {
        const data = this.state.data;
        const rows = this.props.rows;
        if(data.datasets){
            let colors = ["rgba(51,255,15,0.75)", "rgba(0,155,220,0.65)"];
            data.datasets.forEach((set,i)=>{
                set.backgroundColor = this.setGradientColor(canvas,colors[i]);
                set.borderColor = "blue";
                set.borderWidth = 1;
                if(set.label == "temperature"){
                    set.data = rows.map((item,i)=>{
                        return item.temp;
                    }); 
                }
                if(set.label == "pressure"){
                    set.data = rows.map((item,i)=>{
                        return item.pressure;
                    }); 
                }
            })
        }
        return data;

    }

    render() {
        return (
            <div style={{position: "relative", width: 600, height: 550}}>
                <h2>Charts</h2>
                <Bar 
                    options={{
                        responsive:true,
                        curvature: 5
                    }}
                    data={this.getChartData}
                />
            </div>
        )
    }
}