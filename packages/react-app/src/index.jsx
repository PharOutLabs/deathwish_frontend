import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import React from "react";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { BrowserRouter } from "react-router-dom";
import { MoralisProvider } from "react-moralis";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";

const themes = {
  dark: `${process.env.PUBLIC_URL}/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/light-theme.css`,
};

const prevTheme = window.localStorage.getItem("theme");

const subgraphUri = "http://localhost:8000/subgraphs/name/scaffold-eth/your-contract";

const client = new ApolloClient({
  uri: subgraphUri,
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <MoralisProvider
    appId={process.env.REACT_APP_MORALIS_APPLICATION_ID}
    serverUrl={process.env.REACT_APP_MORALIS_SERVER_URL}
  >
    <ApolloProvider client={client}>
      <ThemeSwitcherProvider themeMap={themes} defaultTheme={prevTheme || "light"}>
        <BrowserRouter>
          <App subgraphUri={subgraphUri} />
        </BrowserRouter>
      </ThemeSwitcherProvider>
    </ApolloProvider>
  </MoralisProvider>,
  document.getElementById("root"),
);
