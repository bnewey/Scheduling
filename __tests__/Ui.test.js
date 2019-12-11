// MyComponent.test.js
import React from 'react';
import { mount } from 'enzyme';
import Ui from '../components/Machine/Ui';
import { exportAllDeclaration } from '@babel/types';

import socketIOClient from 'socket.io-client';

// No longer necessary for ui, but keeping in case another component needs 
// jest.mock('next/config', () => () => ({ publicRuntimeConfig: {
//   ENDPOINT_PORT: process.env.PORT || "8000"
// } }));


const rows =  [
  {id: 1, name: "Air Compressor", pressure: 123, temp: 113},
  {id: 2, name: "Air Dryer", pressure: 13, temp: 153},
  {id: 3, name: "Tank 1", pressure: 83, temp: 131},
  {id: 4, name: "Tank1_3", pressure: 23, temp: 133},
  {id: 5, name: "Tank2_3", pressure: 153, temp: 153},
  {id: 6, name: "Tank3_3", pressure: 122, temp: 153},
  {id: 7, name: "Generator", pressure: 73, temp: 133},
  {id: 8, name: "Nitrogen Tank", pressure: 35, temp: 163}
];
const endpoint = "10.0.0.109:8000";
const socket = socketIOClient(endpoint);


describe("MyComponent", () => {
  it("should render my component", () => {
    const wrapper = mount(<Ui />);

  });

  it("accepts props", () =>{
    const wrapper = mount(<Ui rows={rows} socket={socket} endpoint={endpoint}/>);
    expect(wrapper.props().endpoint).toEqual(endpoint);
    expect(wrapper.props().rows).toEqual(rows);
    expect(wrapper.props().socket).toEqual(socket);
  })

});
