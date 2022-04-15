/* eslint-disable prettier/prettier */
import {
  Button,
  Card,
  DatePicker,
  Divider,
  Image,
  Input,
  message,
  Modal,
  notification,
  Skeleton,
  Spin,
  Typography,
} from "antd";
import axios from "axios";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { AddressInput } from "../components";
import ERC721ABI from "../contracts/erc721.json";
import { FaTwitter, FaMediumM } from "react-icons/fa";
import { useVerifyMetadata } from "../hooks/useVerifyMetadata";
import { useNFTBalances } from "react-moralis";
const { Text } = Typography;
const { Meta } = Card;

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    margin: "0 auto",
    maxWidth: "500px",
    width: "100%",
    gap: "10px",
  },
};

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function NFTSwitch({ address, mainnetProvider, tx, userSigner, selectedNetwork, writeContracts, readContracts, gun }) {
  const [data, setData] = useState();
  const [visible, setVisibility] = useState();
  const [benefactors, setBenefactors] = useState([]);
  const [nftToLock, setNftToLock] = useState();
  const startDateTime = new Date().getTime();
  const startDate = new Date().toLocaleDateString();
  const [endDate, setEndDate] = useState();
  const [chosenDate, setChosenDate] = useState();
  const [howManyDays, setHowManyDays] = useState();
  const [buttonIsSet, setButton] = useState(false);
  const [modalReady, setModal] = useState(false);
  const [proSettings, setPro] = useState(false);
  const [endTime, setEndTime] = useState();
  const { data: NFTBalances } = useNFTBalances();
  const { verifyMetadata } = useVerifyMetadata();

  useEffect(() => {
    if (benefactors.length > 0 && nftToLock && nftToLock.allowed_for_transfer && chosenDate) {
      setButton(true);
    }
  }, [benefactors, nftToLock, chosenDate]);

  const fetchedData = add => {

    let url = `https://api.reservoir.tools/users/${add}/tokens/v2?offset=0&limit=20`;
    
    axios.get(url).then(res => {
      setData(res.data.tokens);
    });
  };
  
  useEffect(() => {
    if (address) {
      let lowadd = JSON.stringify(address).toLowerCase();
      fetchedData(JSON.parse(lowadd));
    }
    // console.log(userSigner);
    // console.log(lowadd)
  }, [address]);

  function removeBenefactor(index) {
    if (benefactors.length > 1) {
      setBenefactors(benefactors.splice(index, 1));
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
        arra.push(item);
        setBenefactors(arra);
      }
    }
  }

  async function createSwitch() {
    let time = endTime;
    let token = nftToLock.token_address;
    let id = nftToLock.token_id;
    let factors = benefactors;
    let amount = nftToLock?.trade_amount1155 ? nftToLock.trade_amount1155 : 0;
    console.log("Time: ",time," Token Address: ",token," Token ID: ", id," Benefactors: ", factors);
    if (amount === 0) {
        /*
  function createNewERC721Switch(
      uint64 unlockTimestamp, 
      address tokenAddress, 
      uint256 tokenId, 
      address[] memory _benefactors)
  */
      const result = tx(writeContracts.DeathWish.createNewERC721Switch(time, token, id, factors), update => {
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
          notification.open( <>
            <Text>{`Locked until ${endDate}, transaction: `}</Text>
            <Text copyable>{result.hash}</Text>
          </>);

          setTimeout(function () {
            window.location.reload();
          }, 4000);
        }
      });
      console.log("awaiting metamask/web3 confirm result...", result);
      console.log(await result);
    } else {
      /*
          function createNewERC1155Switch(
              uint64 unlockTimestamp, 
              address tokenAddress, 
              uint256 tokenId, 
              uint256 amount, 
              address[] memory _benefactors)
          */
      const result = tx(
        writeContracts.DeathWish.createNewERC1155Switch(time, token, id, amount, factors),
        update => {
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
            notification.open( <>
              <Text>{`Locked until ${endDate}, transaction: `}</Text>
              <Text copyable>{result.hash}</Text>
            </>);

            setTimeout(function () {
              window.location.reload();
            }, 4000);
          }
        },
      );
      console.log("awaiting metamask/web3 confirm result...", result);
      console.log(await result);
    }
  };

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

  function setNft(kind, item) {
    if (nftToLock) {
      let nft = nftToLock;
      if (kind === "id") {
        nft.token_id = item;
      } 
      if (kind === "address") {
        nft.token_address = item;
      }
      if (kind === "amount") {
        nft.trade_amount1155 = item;
      }
      setNftToLock(nft);
    } else {
      let nft = { token: { token_id: "", token_address: "" } };
      if (kind === "id") {
        nft.token_id = item;
      } 
      if (kind === "address") {
        nft.token_address = item;
      }
      if (kind === "amount") {
        nft.trade_amount1155 = item;
      }
      setNftToLock(nft);
    }
  }
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

  const checkTradeAllowance = async item => {
    console.log(item);
    let contract = item.token_address;
    const approvalContract = new ethers.Contract(contract, ERC721ABI, userSigner);
    const result = await makeCall("isApprovedForAll", approvalContract, [address, writeContracts.DeathWish.address],);
    if (await result) {
      item["allowed_for_transfer"] = true;
    }
    return await result;
  };

  return (
    <div>
      <h1 style={{ marginTop: 60, fontSize: 60, fontFamily: "Babylonica" }}>DeathWish</h1>
      <div style={{
              margin: "auto",
              marginTop: 50,
              marginBottom: 50,
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
            }}>
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
          <div style={{marginTop:30, marginRight: 30, justifyContent: "center", alignItems: "center", display: "flex" }}>
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
                <FaMediumM  />
                <a style={{ marginLeft: 10 }} href="https://whalegoddess.medium.com/death-wish-litepaper-39f1bb649a3d">Medium</a>
              </li>
          </ul>
        </div>
        </Card>
      </div>
      {nftToLock && (
        <div style={{ marginTop: 100 }}>
          <Image style={{ width: 200, height: 200 }} src={nftToLock.image} />
          <h4>NFT to switch.</h4>
          {nftToLock.name && <h5>Name: {nftToLock.name}</h5>}
          <h5>Token ID: {nftToLock.token_id}</h5>
          <h5>Contract: {nftToLock.token_address}</h5>
        </div>
      )}
      <div>
        <div>
          <Button style={{ marginTop: 20, fontWeight: "bold" }} onClick={() => setVisibility(true)}>
            Choose your NFT!
          </Button>
        </div>
        <br />
        ... or ...
        <div style={{ marginTop: 30 }}>
          <Button onClick={() => setPro(true)}>⚙️ Enter Custom Input</Button>{" "}
        </div>
        <Modal
          title={`Select NFT to Trade`}
          visible={visible}
          onCancel={() => setVisibility(false)}
          footer={null}
          okText="Confirm"
        >
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <h1>🖼 NFT Holdings</h1>
            <div style={styles.NFTs}>
            <Skeleton loading={!NFTBalances?.result}>
          {NFTBalances?.result &&
            NFTBalances.result.map((nft, index) => {
                    nft = verifyMetadata(nft);
                    console.log(nft)
                      gun.get("deathwish_nft_database")
                        .get(nft.token_address)
                        .get("tokens")
                        .get(nft.token_id)
                        .put({
                          amount: nft?.amount,
                          block_number: nft?.block_number,
                          block_number_minted: nft?.block_number_minted,
                          contract_type: nft?.contract_type,
                          image: nft.image ? nft.image : nft.metadata.image ? nft.metadata.image : "",
                          metadata: nft.metadata ? JSON.stringify(nft.metadata) : "",
                          name: nft?.name,
                          owner_of: nft?.owner_of,
                          symbol: nft.symbol,
                          token_address: nft.token_address,
                          token_id: nft.token_id,
                          token_uri: nft?.token_uri,
                      });
                    return (
                      <div>
                        <Card
                          hoverable
                          style={{ width: 240, border: "2px solid #e7eaf3", margin: 10 }}
                          cover={
                            <Image
                              preview={false}
                              src={nft?.image || nft?.metadata?.image || null}
                              fallback="data:image/png;base64,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"
                              alt=""
                              style={{
                                sizes:
                                  "(max-width: 48rem) 90vw, (max-width: 60rem) 45vw, (max-width: 75rem) 30vw, 25vw",
                              }}
                            />
                          }
                          key={index}
                        >
                          <Meta
                            title={`Name: ${nft.name}`}
                            description={`Token Address: ${nft.token_address} Token ID: ${nft.token_id}`}
                          />
                          {nft && nft.contract_type === "erc1155" && (
                            <Input
                              placeholder="amount to switch"
                              onChange={e => {
                                nft.trade_amount1155 = e.target.value;
                              }}
                            />
                          )}
                          {nft.allowed_for_transfer ? (
                            <Button
                              style={{ marginTop: 15, fontStyle: "italic" }}
                              onClick={() => {
                                setNftToLock(nft);
                                setVisibility(false);
                              }}
                            >
                              Lock NFT
                            </Button>
                          ) : (
                            <div>
                              <Button
                                style={{ marginTop: 10 }}
                                onClick={async () => {
                                  let isAllowed = await checkTradeAllowance(nft);
                                  if (!isAllowed) {
                                    notification.open({message: "NFT not allowed for contract interaction!"});
                                  } else if (isAllowed) {
                                    nft.allowed_for_transfer = true;
                                    notification.open({message: "Item approved for contract interaction!"});
                                  }
                                }}
                              >
                                Check Allowance
                              </Button>
                              <Divider />
                              {!nft.allowed_for_transfer && (
                                <Button
                                  onClick={async () => {
                                      const tempContract = new ethers.Contract(
                                        nft.token_address,
                                        ERC721ABI,
                                        userSigner,
                                      );
                                      const result = tx(
                                        await makeCall("setApprovalForAll", tempContract, [
                                          readContracts.DeathWish.address,
                                          true,
                                        ]),
                                        update => {
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
                                            // console.log(result);
                                            notification.open("Contract Interaction enabled!");
                                            nft[`allowed_for_transfer`] = true;
                                            return true;
                                          }
                                        },
                                      );
                                      console.log("awaiting metamask/web3 confirm result...", result);
                                      console.log(await result);
                                  }}
                                >
                                  Approve to Send!
                                </Button>
                              )}
                            </div>
                          )}
                        </Card>
                      </div>
                    );
                  })}
              </Skeleton>
            </div>
          </div>
        </Modal>
        <div style={{ marginTop: 100 }}>
          <h2>Choose benefactors</h2>
          <h5 style={{margin:10}}>The first benefactor entered will be the first to claim, <br/> followed by the proceeding benefactors chosen.</h5>
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
                    {i+1}: {ben}
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
              console.log(date);
              setEndDate(date);
              setChosenDate(new Date(date).toLocaleDateString());
            }}
          />
          <div style={{ marginTop: 30 }}>
            <h3 style={{ marginTop: 15 }}>The current date is: {startDate}</h3>

            {endDate && (
              <div>
                <h3 style={{ marginTop: 15 }}>The chosen unlock date is: {chosenDate}</h3>
                <h3 style={{ marginTop: 15 }}>The asset will unlock in {howManyDays} day(s).</h3>
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
            {buttonIsSet && (
              <Button
                onClick={() => {
                  setModal(true);
                }}
              >
                Confirm order!
              </Button>
            )}
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
            <h3 style={{ marginTop: 30 }}>You are about to enter the following switch:</h3>
            <div style={{ marginTop: 15 }}>
              <Image style={{width:200, height:200}} src={nftToLock?.image || nftToLock?.metadata?.image || null} />
              <h4>NFT to switch.</h4>
              <h5>Name: {nftToLock?.name}</h5>
              <h5>Token ID: {nftToLock?.token_id}</h5>
              <h5>Contract: {nftToLock?.token_address}</h5>
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
              <h5 style={{ marginTop: 15 }}>The asset will unlock in {howManyDays} day(s).</h5>
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
            createSwitch();
            // setPro(false);
          }}
        >
          <div style={{ marginTop: 30 }}>
            <Input
              placeholder="Enter contract address..."
              onChange={e => {
                setNft("address", e.target.value);
              }}
            />
          </div>
          <div style={{ marginTop: 30 }}>
            <Input
              width="200"
              placeholder="Enter token id..."
              onChange={e => {
                setNft("id", e.target.value);
              }}
            />
          </div>
          <div style={{ marginTop: 30 }}>
            <h5>If contract is ERC1155, enter an amount of tokens below:</h5>
            <Input
              placeholder="amount to switch"
              onChange={e => {
                setNft("amount", e.target.value);
              }}
            />
          </div>
          {nftToLock?.allowed_for_transfer ? (
            <></>
          ) : (
            <div>
              <Button
                style={{ marginTop: 30 }}
                onClick={async () => {
                  let isAllowed = await checkTradeAllowance(nftToLock);
                  if (!isAllowed) {
                    notification.open({
                      message: `Id: ${nftToLock.token_id}, Address: ${nftToLock.token_address} is not allowed for contract interaction!`,
                      duration: 10,
                    });
                  } else if (isAllowed) {
                    nftToLock.allowed_for_transfer = true;
                    notification.open({ message: "Item approved for trade!" });
                  }
                }}
              >
                Check Allowance
              </Button>
              <Divider />
              {!nftToLock?.allowed_for_transfer && (
                <Button
                  onClick={async () => {
                    try {
                      const tempContract = new ethers.Contract(nftToLock.token_address, ERC721ABI, userSigner);
                      const result = tx(
                        makeCall("setApprovalForAll", tempContract, [writeContracts.DeathWish.address, true]),
                        update => {
                          notification.open("📡 Transaction Update:", update);
                          if (update && (update.status === "confirmed" || update.status === 1)) {
                            notification.open(" 🍾 Transaction " + update.hash + " finished!");
                            notification.open(
                              " ⛽️ " +
                                update.gasUsed +
                                "/" +
                                (update.gasLimit || update.gas) +
                                " @ " +
                                parseFloat(update.gasPrice) / 1000000000 +
                                " gwei",
                            );
                            // console.log(result);
                            result &&
                              notification.open({
                                message: "Contract Interaction enabled!",
                              });
                            nftToLock[`allowed_for_transfer`] = true;
                            return true;
                          }
                        },
                      );
                    } catch (e) {
                      notification.open({
                        message: "Approval unsuccessful",
                        description: `Error: ${e.message}`,
                      });
                    }
                  }}
                >
                  Allow Transfer!
                </Button>
              )}
            </div>
          )}
        </Modal>
      </div>
      <div style={{ marginBottom: 200 }}></div>
    </div>
  );
}

export default NFTSwitch;
