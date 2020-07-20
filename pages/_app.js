import React from "react";
import App, { Container } from "next/app";
import Head from "next/head";
import Header from '../components/UI/Header';
import { StylesProvider, ThemeProvider } from "@material-ui/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import getPageContext from "../src/getPageContext";
import Router from 'next/router';
import NProgress from 'nprogress';

Router.onRouteChangeStart = () => NProgress.start();
Router.onRouteChangeComplete = () => NProgress.done();
Router.onRouteChangeError = () => NProgress.done();

class MyApp extends App {
  constructor() {
    super();
    this.pageContext = getPageContext();
  }

  // static async getInitialProps({ Component, router, ctx }) {
  //   let pageProps = {}
  
  //   if (Component.getInitialProps) {
  //     pageProps = await Component.getInitialProps(ctx)
  //   }
  
  //   return { pageProps }
  // }

  static async getInitialProps({ Component, ctx }) {
    const pageProps = {};
    if (Component.getInitialProps) {
      let  tmp = await Component.getInitialProps(ctx);
      Object.assign(pageProps,tmp);
    }
  
    return { pageProps };
  }

  componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <React.Fragment>
        <Head>
          <title>My page</title>
        </Head>
        {/* Wrap every page in Styles and Theme providers */}
        <StylesProvider
          generateClassName={this.pageContext.generateClassName}
          sheetsRegistry={this.pageContext.sheetsRegistry}
          sheetsManager={this.pageContext.sheetsManager}
        >
          {/* ThemeProvider makes the theme available down the React
              tree thanks to React context. */}
          <ThemeProvider theme={this.pageContext.theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            {/* Pass pageContext to the _document though the renderPage enhancer
                to render collected styles on server-side. */}
            <Header {...pageProps}/>
            <Component pageContext={this.pageContext} {...pageProps} />
          </ThemeProvider>
        </StylesProvider>
      </React.Fragment>
    );
  }
}

export default MyApp;
