// MyComponent.test.js
import React from 'react';
import { mount } from 'enzyme';
import Ui from '../components/Machine/Ui';
import { exportAllDeclaration } from '@babel/types';

jest.mock('next/config', () => () => ({ publicRuntimeConfig: {
  ENDPOINT_PORT: process.env.PORT || "8000"
} }));

describe("MyComponent", () => {
  it("should render my component", () => {
    const wrapper = mount(<Ui />);


  });
  it("should have rows props", () =>{
    const wrapper = mount(<Ui/>);
    console.log(wrapper.state('rows'));
  });

  it("should have endpoint props", () =>{
    const wrapper = mount(<Ui />);
    console.log(wrapper.state('ENDPOINT_PORT'));
  })

});
