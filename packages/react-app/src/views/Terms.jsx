import { Image } from "antd";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React from "react";
import { Link } from "react-router-dom";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Terms({ yourLocalBalance, readContracts }) {
  return (
    <div>
      <h1 style={{ marginTop: 60, fontSize: 60, fontFamily: "Babylonica" }}>DeathWish</h1>
      <h4>Inheritance and dead-man switches made easy!</h4>
      <h2 style={{ marginTop: 100 }}>Terms & Conditions.</h2>
      <div style={{ marginBottom: 300, marginTop: 50 }}>
        <h3  style={{ marginBottom: 50 }}>By using this dApp you agree to the following:</h3>
        <p>...that the contracts and this dApp are still considered experimental and have not been independently audtied. </p>
        <p>...to hold the developers harmless and free of claim or charge from any consequences<br/> past, present or future while using this website and the contracts associated with it. </p>
        <p>...to use this dApp in accordance with local rules/regulations in your jurisdiction.</p>
      </div>
    </div>
  );
}

export default Terms;
