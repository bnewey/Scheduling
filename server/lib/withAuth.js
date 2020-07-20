import React from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router'

let globalUser = null;

function withAuth(BaseComponent, { loginRequired = true, logoutRequired = false } = {}) {
  class App extends React.Component {
    // specify propTypes and defaultProps

    componentDidMount() {
      const { user, isFromServer } = this.props;

      if (isFromServer) {
        globalUser = user;
      }

      // If login is required and not logged in, redirect to "/login" page
      if (loginRequired && !logoutRequired && !user) {
        Router.push('/login');
        return;
      }

      // If logout is required and user logged in, redirect to "/" page
      if (logoutRequired && user) {
        Router.push('/');
      }
    }

    static async getInitialProps(ctx) {
      const isFromServer = !!ctx.req;
      //console.log("User in withauth",ctx.req.user);
      const user = ctx.req ? ctx.req.user && ctx.req.user : globalUser;
      console.log("Get initial props");
      if (isFromServer && user) {
          console.log("User found...");
        user.id = user.id.toString();
      }

      const props = { user, isFromServer };

      // Call child component's "getInitialProps", if it is defined
      if (BaseComponent.getInitialProps) {
        Object.assign(props, (await BaseComponent.getInitialProps(ctx)) || {});
      }

      return props;
    }

    render() {
        const { user } = this.props;

        if (loginRequired && !logoutRequired && !user) {
          return null;
        }
  
        if (logoutRequired && user) {
          return null;
        }
  
        return <BaseComponent {...this.props} />;
    }
  }

  return App;
}

export default withAuth;