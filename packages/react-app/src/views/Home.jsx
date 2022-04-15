import { Card } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import { FaTwitter, FaMediumM } from "react-icons/fa";
/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home() {

  return (
    <div>
      <h1 style={{ marginTop: 60, fontSize: 60, fontFamily: "Babylonica" }}>DeathWish</h1>
      <h4>Death Wish solves the problem of trustless asset inheritance.<br/> Assign benefactors to your assets which are unlocked at a set time.</h4>
      <a href="https://t.co/LWCj0Z2rZK"><img style={{marginTop:50, width:400}}  src="https://ipfs.infura.io/ipfs/QmTZA5Lu6AoCwUdsDSYXcYxSMoXTLYPCuzNYxwD3bpjzZz"/></a>
      <div
            style={{ marginTop: 30, marginRight: 30, justifyContent: "center", alignItems: "center", display: "flex" }}
          >
            <ul>
              <li>
                <FaTwitter />
                <a
                  style={{ marginLeft: 10 }}
                  href="https://t.co/LWCj0Z2rZK"
                  className="twitter-follow-button"
                  data-show-count="false"
                >
                  Twitter
                </a>
                {/* <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> */}
              </li>
              <li>
                <FaMediumM />
                <a style={{ marginLeft: 10 }} href="https://whalegoddess.medium.com/death-wish-litepaper-39f1bb649a3d">
                  Medium
                </a>
              </li>
            </ul>
          </div>
      <div style={{ margin: "auto", marginTop: 150, justifyContent: "center", alignItems: "center", display: "flex" }}>
        <Card>
          <div
            style={{
              color: "black",
              width: "auto",
              backgroundImage: `url(https://ipfs.infura.io/ipfs/QmW6RpJDZ9JUMBUw5TMRpLTzJCp3snc1nQGSnqYSjmXHzo)`,
              backgroundSize: "cover",
              height: 200
            }}
          >
            <div >
              <br />
              <div style={{ color: "black"}}>
                <span
                  className="highlight"
                  style={{
                    // marginTop: 10,
                    backgroundColor: "#f9f9f9",
                    padding: 4,
                    borderRadius: 4,
                    fontWeight: "bolder",
                  }}
                >
                  1. Choose an asset.
                </span>
              </div>
              <div style={{ color: "black", marginTop: 20 }}>
                <span
                  className="highlight"
                  style={{
                    marginLeft: 4,
                    marginRight: 4,
                    backgroundColor: "#f9f9f9",
                    padding: 4,
                    borderRadius: 4,
                    fontWeight: "bolder",
                  }}
                >
                  2. Choose the benefactors.
                </span>
                
              </div>

              <div style={{ color: "black", marginTop: 25 }}>
                <span
                  className="highlight"
                  style={{
                    marginLeft: 4,
                    marginRight: 4,
                    backgroundColor: "#f9f9f9",
                    padding: 4,
                    borderRadius: 4,
                    fontWeight: "bolder",
                  }}
                >
                  3. Choose the timeframe.
                </span>
              </div>
              <div style={{fontFamily: "Babylonica" }}>
                <p style={{marginTop:2, fontSize: 16}}>Make a</p>
              <p style={{ fontSize:16, marginTop:-28, marginLeft: 9}}>Deathwish</p>
              </div>
              
            </div>
          </div>
        </Card>
        </div>
        
      <div style={{ marginTop: 150 }}>
        <Link to="/nft-switch">
          <h3>NFT Switches</h3>
          <img src="https://ipfs.infura.io/ipfs/QmfVpovY6Fb48yudmGsMTbcQzu999dXuRR9uRUN8SgCF8h" />
        </Link>
      </div>
      <div style={{ marginTop: 150 }}>
        <Link to="/erc20-switch">
          <h3>ERC20 Switches</h3>
          <img src="https://ipfs.infura.io/ipfs/QmZ8r9AmHj4RKmruqFVsUCY55nboe2gtHy9Gz6tiNSy3gL" />
        </Link>
      </div>
      <div style={{ marginBottom: 200 }}></div>
    </div>
  );
}

export default Home;
