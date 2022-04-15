/* eslint-disable prettier/prettier */
import { Button, Card, DatePicker, Divider, Input, message, Modal, notification, Select, Typography } from "antd";
import axios from "axios";
import { BigNumber, ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { AddressInput } from "../components";
import ERC20ABI from "../contracts/erc20.json";
import { useERC20Balances } from "react-moralis";
import { FaTwitter, FaMediumM } from "react-icons/fa";
const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address _spender, uint256 _value) public returns (bool success)",
  "function allowance(address _owner, address _spender) public view returns (uint256 remaining)",
];

const { Text } = Typography;
const { Option } = Select;

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function ERC20Switch({
  mainnetProvider,
  writeContracts,
  readContracts,
  tx,
  userSigner,
  mainnetContracts,
  address,
  gun,
}) {
  const [benefactors, setBenefactors] = useState([]);
  const [tokenToLock, setTokenToLock] = useState();
  const [tokenAmount, setTokenAmount] = useState();
  const startDateTime = new Date().getTime();
  const startDate = new Date().toLocaleDateString();
  const [endDate, setEndDate] = useState();
  const [chosenDate, setChosenDate] = useState();
  const [howManyDays, setHowManyDays] = useState();
  const [endTime, setEndTime] = useState();
  const { data: assets } = useERC20Balances();
  const [buttonIsSet, setButton] = useState(false);
  const [modalReady, setModal] = useState(false);
  const [proSettings, setPro] = useState(false);
  const [theList, setList] = useState();
  const [allowed, setAllowed] = useState(false);
  const [proToken, setProToken] = useState(false);

  useEffect(() => {
    const loadList = async () => {
      // https://tokens.coingecko.com/uniswap/all.json
      const res = await axios.get("https://tokens.coingecko.com/uniswap/all.json");
      const { tokens } = res.data;
      setList(tokens);
    };
    loadList();
  }, []);

  useEffect(() => {
    if (benefactors && benefactors.length > 0 && tokenToLock && chosenDate) {
      setButton(true);
    }
  }, [benefactors, tokenToLock, chosenDate]);

  useEffect(() => {
    const loadToken = async () => {
      let { name, symbol, decimals, formedAmount } = await loadERC20(tokenToLock.token_address, userSigner);
      if ((await symbol) && (await name) && (await decimals)) {
        let token = {
          name: name ? name : "",
          token_address: tokenToLock.token_address,
          decimals: decimals ? decimals : tokenToLock.decimals,
          owned: formedAmount ? formedAmount : 0,
          symbol: symbol,
          thumbnail: "",
        };
        theList.map(toke => {
          if (toke.address === tokenToLock.token_address) {
            token.thumbnail = toke.logoURI;
            gun.get("deathwish_tokens").get(tokenToLock.token_address).put(toke); 
          } else {
            gun.get("deathwish_tokens").get(tokenToLock.token_address).put(toke);
          }
        });
        gun.get("deathwish_tokens").get(tokenToLock.token_address).put(token);
        setTokenToLock(token);
      }
    };
    if (proToken) {
      try {
        loadToken();
      } catch {}
    }
  }, [proToken]);

  function removeBenefactor(index) {
    if (benefactors.length > 1) {
      let ben = benefactors.splice(index, 1);
      setBenefactors(ben);
    } else {
      setBenefactors([]);
    }
  }

  function setBenefactor(item) {
    if (item.includes("0x")) {
      if (benefactors.length > 0) {
        var arr = benefactors;
        arr.push(item.toLowerCase());
        var ar = [...new Set(arr)];
        setBenefactors(ar);
      } else {
        var arra = [];
        arra.push(item.toLowerCase());
        setBenefactors(arra);
      }
    }
  }

  /*
  function createNewERC721Switch(
      uint64 unlockTimestamp, 
      address tokenAddress, 
      uint256 tokenId, 
      address[] memory _benefactors)

  function createNewERC1155Switch(
      uint64 unlockTimestamp, 
      address tokenAddress, 
      uint256 tokenId, 
      uint256 amount, 
      address[] memory _benefactors)
  */
  useEffect(() => {
    if (endDate) {
      console.log(new Date().getTime());
      let z = Math.ceil(startDateTime/1000);
      let n = Math.ceil(new Date(endDate).getTime()/1000);
      let a = n - z;
      setHowManyDays(Math.ceil(a / 86400));
      setEndTime(n);
    }
  }, [endDate]);

  /* 
    createNewERC20Switch(
      uint64 unlockTimestamp, 
      address tokenAddress, 
      uint256 amount, 
      address[] memory _benefactors)
  */
  async function createSwitch() {
    
    let time = endTime;
    let token = tokenToLock.token_address;
    let amount = tokenAmount;
    let factors = benefactors;
    console.log("Time: ",time," Token Address: ",token," Token Amount: ", amount," Benefactors: ", factors);
    const result = tx(writeContracts.DeathWish.createNewERC20Switch(time, token, amount, factors), update => {
      message.info("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        message.info(" 🍾 Transaction " + update.hash + " finished!");
        message.info(
          " ⛽️ " +
            update.gasUsed +
            "/" +
            (update.gasLimit || update.gas) +
            " @ " +
            parseFloat(update.gasPrice) / 1000000000 +
            " gwei",
        );
        notification.open(
          <>
            <Text>{`Locked until ${endDate}, transaction: `}</Text>
            <Text copyable>{result.hash}</Text>
          </>,
        );

        setTimeout(function () {
          window.location.reload();
        }, 4000);
      }
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    console.log(await result);
  }

  const loadERC20 = async (theAddress, p) => {
    try {
      const r = new ethers.Contract(theAddress, ERC20ABI, p);
      const name = await r.name?.();
      const symbol = await r.symbol?.();
      const decimals = await r.decimals?.();
      const amount = await makeCall("balanceOf", r, [address]);
      const big = BigNumber.from(amount);
      const formedAmount = ethers.utils.formatUnits(big, decimals);
      
      return { name, symbol, decimals, formedAmount };
    } catch (error) {
      console.log(error);
    }
  };

  const makeCall = async (callName, contract, args, metadata = {}) => {
    if (contract[callName]) {
      let result;
      if (args) {
        result = await contract[callName](...args, metadata);
      } else {
        result = await contract[callName]();
      }
      return result;
    }
    console.log("no call of that name!");
    return undefined;
  };

  const updateRouterAllowance = async newAllowance => {
    try {
      const tempContract = new ethers.Contract(tokenToLock.token_address, erc20Abi, userSigner);
      const result = await makeCall("approve", tempContract, [readContracts.DeathWish.address, newAllowance]);
      console.log(result);
      return true;
    } catch (e) {
      notification.open({
        message: "Approval unsuccessful",
        description: `Error: ${e.message}`,
      });
    }
  };

  const approveRouter = async () => {
    const approvalAmount = ethers.utils.hexlify(ethers.utils.parseUnits(tokenAmount.toString(), tokenToLock.decimals));
    const approval = updateRouterAllowance(approvalAmount);
    if (await approval) {
      setAllowed(true);
      notification.open({
        message: "Token transfer approved",
        description: `You can now lock up to ${tokenAmount} ${tokenToLock.name}`,
      });
    }
  };

  return (
    <div>
      <h1 style={{ marginTop: 60, fontSize: 60, fontFamily: "Babylonica" }}>DeathWish</h1>
      <div
        style={{
          margin: "auto",
          marginTop: 50,
          marginBottom: 50,
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      >
        <Card>
          <h4>
            Death Wish solves the problem of trustless asset inheritance.
            <br /> Assign benefactors to your assets which are unlocked at a set time.
          </h4>
          <div
            style={{
              margin: "auto",
              marginTop: 50,
              marginBottom: 50,
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
            }}
          >
            <Card>
              <div
                style={{
                  color: "black",
                  width: "auto",
                  backgroundImage: `url(https://ipfs.infura.io/ipfs/QmW6RpJDZ9JUMBUw5TMRpLTzJCp3snc1nQGSnqYSjmXHzo)`,
                  backgroundSize: "cover",
                  height: 200,
                }}
              >
                <div>
                  <br />
                  <div style={{ color: "black" }}>
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
                  <div style={{ fontFamily: "Babylonica" }}>
                    <p style={{ marginTop: 2, fontSize: 16 }}>Make a</p>
                    <p style={{ fontSize: 16, marginTop: -28, marginLeft: 9 }}>Deathwish</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
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
        </Card>
      </div>
      <div style={{ marginTop: 50 }}>
        <h2 style={{ marginTop: 20, fontWeight: "bold" }}>Choose your ERC20 Token!</h2>
        <div style={{ alignContent: "center", justifyContent: "center", display: "flex", marginTop: 50 }}>
          <Select key={"shopping-cart-offers-coin-select"} defaultValue="No Data" style={{ width: 200 }}>
            {assets &&
              assets.map(asset => {
                return (
                  <Option key={asset.token_address} value={asset.token_address}>
                    <div
                      onClick={() => {
                        setTokenToLock(asset);
                        setProToken(true);
                      }}
                    >
                      <img height={15} style={{ marginBottom: 3, marginRigh: 3 }} src={asset.thumbnail} />
                      {parseFloat(asset.balance / 10 ** asset.decimals).toFixed(2)} : {asset.name}
                    </div>
                  </Option>
                );
              })}
          </Select>
        </div>
        <Input
          style={{ margin: 10, width: 150 }}
          placeholder="Amount..."
          allowClear={true}
          onChange={e => {
            setTokenAmount(e.target.value);
          }}
        />
        <div style={{ marginTop: 10 }}>
          ... or ...
          <div style={{ marginTop: 10 }}>
            <Button onClick={() => setPro(true)}>⚙️ Enter Custom Input</Button>{" "}
          </div>
        </div>

        <div style={{ marginTop: 30 }}>
          {!allowed && <Button onClick={() => approveRouter()}>Allow Transfer!</Button>}
        </div>
        {tokenToLock && (
          <div style={{ marginTop: 50 }}>
            <h3>Token to switch.</h3>
            {tokenToLock?.thumbnail && <img src={tokenToLock.thumbnail} height={30} />}
            {tokenToLock?.name && <h5>Name: {tokenToLock?.name}</h5>}
            <h4>Contract: {tokenToLock.token_address}</h4>
            <h4>Decimals: {tokenToLock?.decimals}</h4>
            <h4>Amount Owned: {tokenToLock?.owned}</h4>
            <h4>Amount to switch: {tokenAmount}</h4>
          </div>
        )}
        <div style={{ marginTop: 100 }}>
          <h2>Choose benefactors</h2>
          <h5 style={{ margin: 10 }}>
            The first benefactor entered will be the first to claim, <br /> followed by the proceeding benefactors
            chosen.
          </h5>
          <div style={{ alignContent: "center", justifyContent: "center", display: "flex" }}>
            <AddressInput
              ensProvider={mainnetProvider}
              style={{ width: 300 }}
              placeholder="enter an eth address..."
              allowClear={true}
              onChange={e => {
                if (e.includes("0x") && e.length === 42) {
                  setBenefactor(e);
                }
              }}
            />
          </div>
          <p>Type in an ENS name to resolve the address...</p>
          <div style={{ marginTop: 30 }}>
            {benefactors &&
              benefactors.length > 0 &&
              benefactors.map((ben, i) => {
                return (
                  <div key={i}>
                    {i + 1}: {ben}
                    <Button
                      onClick={() => {
                        removeBenefactor(i);
                      }}
                    >
                      x
                    </Button>
                  </div>
                );
              })}
          </div>
        </div>

        <div style={{ marginTop: 100 }}>
          <h2>Choose unlock Timestamp</h2>
          <DatePicker
            dateFormat="MMMM d, yyyy"
            onChange={date => {
              setEndDate(date);
              setChosenDate(new Date(date).toLocaleDateString());
            }}
          />
          <div style={{ marginTop: 30 }}>
            <h3 style={{ marginTop: 15 }}>The current date is: {startDate}</h3>

            {endDate && (
              <div>
                <h3 style={{ marginTop: 15 }}>The chosen unlock date is: {chosenDate}</h3>
                <h3 style={{ marginTop: 15 }}>The asset will unlock in {howManyDays} days.</h3>
                <h5 style={{ marginTop: 15 }}>The unix timestamp is: {endTime}</h5>
              </div>
            )}
          </div>
          <div style={{ marginTop: 75 }}>
            {!buttonIsSet && (
              <div>
                <h2>Select your asset, benefactor(s) and unlock time.</h2>
                <p>A button to confirm will appear below when items are selected and approved.</p>
              </div>
            )}
          </div>
          {buttonIsSet && <div>
            <Button onClick={()=>setModal(true)}>Confirm order!</Button>
          </div>}
        </div>
      </div>
      <Modal
        visible={modalReady}
        onCancel={() => {
          setModal(false);
        }}
        onOk={() => {
          createSwitch();
          // notification.open({ message: "Almost ready!" });
        }}
      >
        <div>
          <h3>You are about to enter the following switch:</h3>
          <div style={{ marginTop: 15 }}>
            <h3>Token to switch.</h3>
            {tokenToLock?.thumbnail && <img src={tokenToLock?.thumbnail} height={30} />}
            {tokenToLock?.name && <h5>Name: {tokenToLock?.name}</h5>}
            <h5>Contract: {tokenToLock?.token_address}</h5>
            <h5>Decimals: {tokenToLock?.decimals}</h5>
            <h5>Amount to switch: {tokenAmount}</h5>
          </div>
          <br />
          <div>
            <h3>For the following benefactors:</h3>
          </div>
          {benefactors.map((ben, i) => {
            return <div key={i}>{ben}</div>;
          })}
          <br />
          <div>
            <h5 style={{ marginTop: 15 }}>The chosen unlock date is: {chosenDate}</h5>
            <h5 style={{ marginTop: 15 }}>The asset will unlock in {howManyDays} days.</h5>
            <h5 style={{ marginTop: 15 }}>The unix timestamp is: {endTime}</h5>
          </div>
        </div>
      </Modal>
      <Modal
        visible={proSettings}
        onCancel={() => {
          setPro(false);
        }}
        onOk={() => {
          // createSwitch();
          setPro(false);
          setProToken(true);
        }}
      >
        <div style={{ marginTop: 30 }}>
          <Input
            placeholder="Enter contract address..."
            onChange={e => {
              let token = e.target.value;
              if (tokenToLock) {
                tokenToLock.token_address = token;
                setTokenToLock(tokenToLock);
              } else {
                let tokenToLock = { token_address: token, decimals: "" };
                setTokenToLock(tokenToLock);
              }
            }}
          />
        </div>
        <div style={{ marginTop: 30 }}>
          <Input
            width="200"
            placeholder="Enter token decimals..."
            onChange={e => {
              let decimals = e.target.value;
              if (tokenToLock) {
                tokenToLock.decimals = decimals;
                setTokenToLock(tokenToLock);
              } else {
                let tokenToLock = { token_address: "", decimals: decimals };
                setTokenToLock(tokenToLock);
              }
            }}
          />
        </div>
        {allowed && (
          <div>
            <Divider />
            <Button onClick={() => approveRouter()}>Allow Transfer!</Button>
          </div>
        )}
      </Modal>
      <div style={{ marginBottom: 200 }}></div>
    </div>
  );
}

export default ERC20Switch;
