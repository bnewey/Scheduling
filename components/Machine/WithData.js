import React from 'react';


import socketIOClient from 'socket.io-client';

import getConfig from 'next/config';
const {publicRuntimeConfig} = getConfig();
const {ENDPOINT_PORT} = publicRuntimeConfig;

function withData(BaseComponent) {
  class App extends React.Component {
    _isMounted = false;

    constructor(props){
      super(props);

      var endpoint = "10.0.0.109:" + ENDPOINT_PORT;

      this.state = {
        rows: "",
        endpoint: endpoint,
        socket: socketIOClient(endpoint)
      };      
    }

    componentDidMount() {
        //_isMounted checks if the component is mounted before calling api to prevent memory leak
      this._isMounted = true;
      const { endpoint,socket } = this.state;
      socket.on("FromC", async data => {
          if(this._isMounted) {
            var json = await JSON.parse(data);
            this.setState({ rows: json.machines });
          }
      }); 
    }

    componentWillUnmount(){
        this._isMounted = false;
        const {socket } = this.state;
        socket.disconnect();
    }

    render() {
      return <BaseComponent {...this.state} />;
    }
  }

  return App;
}

export default withData;