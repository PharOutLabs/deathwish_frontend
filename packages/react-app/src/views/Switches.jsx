import {
  Button,
  Card,
  DatePicker,
  Divider,
  Image,
  Layout,
  message,
  Modal,
  notification,
  Row,
} from "antd";
import { useContractReader } from "eth-hooks";
import React, { useEffect, useReducer, useState } from "react";
import { FaTwitter, FaMediumM } from "react-icons/fa";
import DeathWish from "../contracts/DeathWish.json";
import axios from "axios";
import { AddressInput } from "../components";
import { Link } from "react-router-dom";
const { Meta } = Card;
const { ethers } = require("ethers");
const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "10px",
    maxWidth: "500px",
    gap: "10px",
  },
};
let initialSwitchState = { switches: [] };

function reducer(state, item) {
  return {
    switches: [item, ...state.switches],
  };
}
function Switches({
  readContracts,
  mainnetProvider,
  address,
  tx,
  userSigner,
  writeContracts,
  gun,
}) {
  const [state, dispatch] = useReducer(reducer, initialSwitchState);
  const [beneState, beneDispatch] = useReducer(reducer, initialSwitchState);
  const [gotSwitches, setGotSwitch] = useState(false);
  const startDateTime = new Date().getTime() / 1000;
  const startDate = new Date().toLocaleDateString();
  const [endDate, setEndDate] = useState();
  const [chosenDate, setChosenDate] = useState();
  const theSwitches = useContractReader(readContracts, "DeathWish", "getOwnedSwitches", [address]);
  const benefactorSwitches = useContractReader(readContracts, "DeathWish", "getBenefactorSwitches", [address]);
  const [id, setID] = useState();
  const [proERC721, setProERC721] = useState(false);
  const [proERC1155, setProERC1155] = useState(false);
  const [proERC20, setProERC20] = useState(false);
  const [gotClaims, setGotClaims] = useState(false);
  const [benefactors, setBenefactors] = useState([]);
  const [theTime, setTheTime] = useState(new Date().getTime());
  const [endTime, setEndTime] = useState();
  const [howManyDays, setHowManyDays] = useState();
  const [editSwitchId, setEditSwitchId] = useState();
  const [handledSwitch, setHandledSwitch] = useState(false);
  const [handledBene, setHandledBene] = useState(false);

  useEffect(() => {
    if (endDate) {
      console.log(new Date().getTime());
      let z = Math.ceil(startDateTime);
      let n = Math.ceil(new Date(endDate).getTime() / 1000);
      let a = n - z;
      setHowManyDays(Math.ceil(a / 86400));
      setEndTime(n);
      console.log(n)
    }
  }, [endDate]);

  async function axiosReservoirFetch(address, tokenId) {
    let response = await axios
      .get(`https://api.reservoir.tools/tokens/details/v2?token=${address}%3A${tokenId}`)
      .then(res => {
        return res.data;
        // console.log(data)
      })
      .catch(e => {
        console.log(e);
      });
    return { response };
  }
  /*
      struct Switch {
        uint64 unlock;
        address user;
        address tokenAddress;
        uint8 tokenType; //1 - ERC20 , 2 - ERC721 - 3 - ERC1155
        uint256 tokenId; //for ERC721/ERC1155
        uint256 amount; //for ERC20/ERC1155
    }
  */
  useEffect(() => {
    const prepare = async () => {
      theSwitches.forEach(async thisId => {
        let theId = thisId.toNumber();
        let prepSwitch = {
          switchId: theId,
          unlock: "",
          address: "",
          type: "",
          id: "",
          amount: "",
          benefactors: [],
          metadata: {},
        };
        let result = await grabSwitch(theId);
        console.log("Unlock, User, TokenAddress, TokenType, TokenID, Amount");
        result.forEach((it,i)=>{
          try{console.log(it.toNumber())}catch{console.log(it)}
        })
        let benefactorAddresses = await grabBenefactors(theId);
        let unlock = await result[0].toNumber();
        let switchType = await result[3].toNumber();
        let id = await result[4].toNumber();
        let tokenAmount = await result[5].toNumber();
        let time = new Date().toLocaleDateString(unlock);
        let theType;
        if (switchType === 1) {
          theType = "ERC20";
          gun
            .get("deathwish_tokens")
            .get(result[2])
            .once(ack => {
              if (ack) {
                prepSwitch.metadata = {
                  name: ack?.name,
                  token_address: ack?.token_address,
                  decimals: ack?.decimals,
                  owned: ack?.owned ? ack.owned : 0,
                  symbol: ack?.symbol,
                  thumbnail: ack?.thumbnail,
                };
              }
            });
        }
        if (switchType === 2) {
          theType = "ERC721";
          gun
            .get("deathwish_nft_database")
            .get(result[2])
            .get("tokens")
            .get(id)
            .once(async ack => {
              if (ack) {
                prepSwitch.metadata = ack;
              } else {
                let metadata = await axiosReservoirFetch(result[2], id);
                prepSwitch.metadata = {
                  amount: metadata?.amount,
                  contract_type: metadata?.contract_type,
                  metadata: metadata?.metadata,
                  name: metadata?.name,
                  owner_of: metadata?.owner_of,
                  symbol: metadata?.symbol,
                  token_address: metadata?.token_address,
                  token_id: metadata?.token_id,
                  token_uri: metadata?.token_uri,
                };
              }
            });
        }
        if (switchType === 3) {
          theType = "ERC1155";
          gun
            .get("deathwish_nft_database")
            .get(result[2])
            .get("tokens")
            .get(id)
            .once(async ack => {
              if (ack) {
                prepSwitch.metadata = ack;
              } else {
                let metadata = await axiosReservoirFetch(result[2], id);
                prepSwitch.metadata = {
                  amount: metadata?.amount,
                  contract_type: metadata?.contract_type,
                  metadata: metadata?.metadata,
                  name: metadata?.name,
                  owner_of: metadata?.owner_of,
                  symbol: metadata?.symbol,
                  token_address: metadata?.token_address,
                  token_id: metadata?.token_id,
                  token_uri: metadata?.token_uri,
                };
              }
            });
        }
        prepSwitch.unlock = time;
        prepSwitch.address = result[2];
        prepSwitch.type = theType;
        prepSwitch.id = id;
        prepSwitch.amount = tokenAmount;
        prepSwitch.benefactors = benefactorAddresses;
        prepSwitch.unix = unlock;
        dispatch(prepSwitch);
      });
      setGotSwitch(true);
      setHandledSwitch(true);
    };
    const prepbene = () => {
      benefactorSwitches?.forEach(async switchId => {
        let prepSwitch = {
          switchId: switchId,
          unlock: "",
          unix: "",
          address: "",
          type: "",
          id: "",
          amount: "",
          benefactors: [],
          metadata: {},
        };
        //[1099511627775,"0x39a79815fA7431434E49757ED4118b873Ca1F580","0x01BE23585060835E02B77ef475b0Cc51aA1e0709",1,0,20]
        let theId = switchId.toNumber();
        let result = await grabSwitch(theId);
        let benefactorAddresses = await grabBenefactors(theId);
        let unlock = result[0].toNumber();
        console.log(unlock);
        let switchType = await result[3].toNumber();
        let id = await result[4].toNumber();
        let tokenAmount = await result[5].toNumber();
        let time = new Date().toLocaleDateString(unlock);
        let tokenAddress = await result[2];
        let theType;
        if (switchType === 1) {
          theType = "ERC20";
          gun
            .get("deathwish_tokens")
            .get(tokenAddress)
            .once(ack => {
              if (ack) {
                prepSwitch.metadata = {
                  name: ack?.name,
                  token_address: ack?.token_address,
                  decimals: ack?.decimals,
                  owned: ack?.owned ? ack.owned : 0,
                  symbol: ack?.symbol,
                  thumbnail: ack?.thumbnail,
                };
              }
            });
        }
        if (switchType === 2) {
          theType = "ERC721";
          gun
            .get("deathwish_nft_database")
            .get(tokenAddress)
            .get("tokens")
            .get(id)
            .once(async ack => {
              if (ack) {
                prepSwitch.metadata = ack;
              } else {
                let metadata = await axiosReservoirFetch(tokenAddress, id);
                prepSwitch.metadata = {
                  amount: metadata?.amount,
                  contract_type: metadata?.contract_type,
                  metadata: metadata?.metadata,
                  name: metadata?.name,
                  owner_of: metadata?.owner_of,
                  symbol: metadata?.symbol,
                  token_address: metadata?.token_address,
                  token_id: metadata?.token_id,
                  token_uri: metadata?.token_uri,
                };
              }
            });
        }
        if (switchType === 3) {
          theType = "ERC1155";
          gun
            .get("deathwish_nft_database")
            .get(tokenAddress)
            .get("tokens")
            .get(id)
            .once(async ack => {
              if (ack) {
                prepSwitch.metadata = ack;
              } else {
                let metadata = await axiosReservoirFetch(tokenAddress, id);
                prepSwitch.metadata = {
                  amount: metadata?.amount,
                  contract_type: metadata?.contract_type,
                  metadata: metadata?.metadata,
                  name: metadata?.name,
                  owner_of: metadata?.owner_of,
                  symbol: metadata?.symbol,
                  token_address: metadata?.token_address,
                  token_id: metadata?.token_id,
                  token_uri: metadata?.token_uri,
                };
              }
            });
        }
        prepSwitch.owner = result[1];
        prepSwitch.unlock = time;
        prepSwitch.unix = unlock;
        prepSwitch.address = tokenAddress;
        prepSwitch.type = theType;
        prepSwitch.id = id;
        prepSwitch.switchId = theId;
        prepSwitch.amount = tokenAmount;
        prepSwitch.benefactors = benefactorAddresses;

        if ((await benefactorAddresses.length) > 1) {
          await benefactorAddresses.forEach((add, index) => {
            if (add === address) {
              prepSwitch.claimTime = index * (86400 * 60);
            }
          });
        } else {
          prepSwitch.claimTime = unlock;
        }
        beneDispatch(prepSwitch);
      });
      setGotClaims(true);
      setHandledBene(true);
    };
    !handledSwitch && theSwitches && theSwitches.length > 0 && prepare();
    !handledBene && benefactorSwitches && benefactorSwitches.length > 0 && prepbene();
  }, [theSwitches, benefactorSwitches]);

  const makeCall = async (callName, contract, args, metadata = {}) => {
    if (contract[callName]) {
      let result;
      if (args) {
        result = await contract[callName](...args, metadata);
      } else {
        result = await contract[callName]();
      }
      return await result;
    }
    console.log("no call of that name!");
    return undefined;
  };

  /*
      function isSwitchClaimableBy(uint256 id, address _user) public view returns (bool) {
        return (block.timestamp > switchClaimableByAt(id, _user));
    }

    function getBenefactorsForSwitch(uint256 id) external view returns (address[] memory) {
        require(id < counter, "Out of range");
        return benefactors[id];
    }

    function getOwnedSwitches(address _user) external view returns (uint256[] memory) {
        return userSwitches[_user];
    }
    function getBenefactorSwitches(address _user) external view returns (uint256[] memory) {
        return userBenefactor[_user];
    }
    function inspectSwitch(uint256 id) external view returns (uint256, address, address, uint256, uint256, uint256) {
        require(id < counter, "Out of range");
        Switch memory _switch = switches[id];
        return (switchClaimableByAt(id, msg.sender), _switch.user, _switch.tokenAddress, _switch.tokenType, _switch.tokenId, _switch.amount);
    }
  */

  const grabBenefactors = async item => {
    let contract = readContracts.DeathWish.address;
    const prepContract = new ethers.Contract(contract, DeathWish, userSigner);
    const addresses = await makeCall("getBenefactorsForSwitch", prepContract, [item]);
    return addresses;
  };

  const grabSwitch = async item => {
    let contract = readContracts.DeathWish.address;
    const prepContract = new ethers.Contract(contract, DeathWish, userSigner);
    const result = await makeCall("inspectSwitch", prepContract, [item]);
    return result;
  };

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
        arr.push(item);
        var ar = [...new Set(arr)];
        setBenefactors(ar);
      } else {
        var arra = [];
        arra.push(item);
        setBenefactors(arra);
      }
    }
  }

  // function updateUnlockTime(uint256 id, uint64 newUnlock)
  async function updateTime(id) {
    console.log("Switch ID: ",id, " Timestamp: ", endTime);
    const result = tx(writeContracts.DeathWish.updateUnlockTime(id, endTime), update => {
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
        notification.open({
          message: "Successfully updated unlock time!",
        });
        setTimeout(function () {
          window.location.reload();
        }, 4000);
      }
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    console.log(await result);
  }

  // function updateBenefactors(uint256 id, address[] memory _benefactors)
  async function updateBenefactors(id, benefacts) {
    console.log("Switch ID: ",id, " Benefactors: ", benefactors);
    const result = tx(writeContracts.DeathWish.updateBenefactors(id, benefacts), update => {
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
        notification.open({
          message: "Successfully updated benefactors!",
        });
        setTimeout(function () {
          window.location.reload();
        }, 4000);
      }
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    console.log(await result);
  }

  // function claimSwitch(uint256 id)
  async function claimSwitch(id) {
    console.log("Switch ID: ",id);
    const result = tx(writeContracts.DeathWish.claimSwitch(id), update => {
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
        notification.open({
          message: "Successfully claimed!",
        });

        setTimeout(function () {
          window.location.reload();
        }, 4000);
      }
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    console.log(await result);
  }

  const makeCards = (data, index) => {
    if (data.type === "ERC721") {
      return (
        <div>
          <div>
            <Card
              style={{ width: 470, border: "2px solid #e7eaf3", margin: 10 }}
              cover={
                <Image
                  preview={false}
                  src={data.image || data?.metadata?.image || data?.metadata?.metadata?.image || null}
                  fallback="data:image/png;base64,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"
                  alt=""
                  style={{
                    sizes: "(max-width: 48rem) 90vw, (max-width: 60rem) 45vw, (max-width: 75rem) 30vw, 25vw",
                  }}
                />
              }
              key={index}
            >
              <h2>Type: ERC721</h2>
              <div style={{ marginTop: 10 }}>
                <h4>Switch Id: {data.switchId}</h4>
              </div>
              <Meta
                title={data.metadata?.name ? `Name: ${data.metadata.name}` : null}
                description={`Token Address: ${data.address}`}
              />
              <h5> Token ID: {data.id}</h5>
              <div style={{ margin: 10 }}>
                <p>This token will unlock at {data.unlock}</p>
              </div>
              <div style={{ margin: 10 }}>
                <p>The benefactors are:</p>
                <div style={{ marginTop: 5 }}>
                  {data.benefactors.map((ben, i) => {
                    return (
                      <div style={{}} key={i}>
                        {i + 1}: {ben}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginTop: 30 }}>
                <Button
                  key={"edit_button" + index}
                  onClick={() => {
                    setTheTime(data.unlock);
                    setEditSwitchId(data.switchId);
                    setProERC721(true);
                  }}
                >
                  ⚙️ Edit Switch!
                </Button>{" "}
              </div>
            </Card>
          </div>
        </div>
      );
    }
    if (data.type === "ERC1155") {
      return (
        <div>
          <div>
            <Card
              style={{ width: 470, border: "2px solid #e7eaf3", margin: 10 }}
              cover={
                <Image
                  preview={false}
                  src={data.image || data.metadata.image || null}
                  fallback="data:image/png;base64,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"
                  alt=""
                  style={{
                    sizes: "(max-width: 48rem) 90vw, (max-width: 60rem) 45vw, (max-width: 75rem) 30vw, 25vw",
                  }}
                />
              }
              key={index}
            >
              <h2>Type: ERC1155</h2>
              <div style={{ marginTop: 10 }}>
                <h4>Switch Id: {data.switchId}</h4>
              </div>
              <Meta
                title={data.metadata?.name ? `Name: ${data.metadata.name}` : null}
                description={`Token Address: ${data.address}`}
              />
              <h5>Token ID: {data.id}</h5>
              <div style={{ margin: 10 }}>
                <p>This token will unlock at {data.unlock}</p>
              </div>
              <div style={{ margin: 10 }}>
                <p>The benefactors are:</p>
                <div style={{ marginTop: 5 }}>
                  {data.benefactors.map((ben, i) => {
                    return (
                      <div key={i}>
                        {i + 1}: {ben}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginTop: 30 }}>
                <Button
                  key={"edit_button" + index}
                  onClick={() => {
                    setTheTime(data.unlock);
                    setEditSwitchId(data.switchId);
                    setProERC1155(true);
                  }}
                >
                  ⚙️ Edit Switch!
                </Button>{" "}
              </div>
            </Card>
          </div>
        </div>
      );
    }
    if (data.type === "ERC20") {
      return (
        <div>
          <div style={styles.NFTs}>
            <Card
              style={{ width: 470, border: "2px solid #e7eaf3", margin: 10 }}
              cover={
                <Image
                  preview={false}
                  src={data?.metadata?.thumbnail}
                  fallback="data:image/png;base64,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"
                  alt=""
                  style={{
                    sizes: "(max-width: 48rem) 90vw, (max-width: 60rem) 45vw, (max-width: 75rem) 30vw, 25vw",
                  }}
                />
              }
              key={index}
            >
              <h2>Type: ERC20</h2>
              <div style={{ marginTop: 10 }}>
                <h4>Switch Id: {data.switchId}</h4>
              </div>
              <Meta
                title={data.metadata?.name ? `Name: ${data.metadata.name}` : null}
                description={`Token Address: ${data.address}`}
              />
              <div style={{ margin: 10 }}>
                <p>This token will unlock at {data.unlock}</p>
              </div>
              <div style={{ margin: 10 }}>
                <p>The benefactors are:</p>
                <div style={{ marginTop: 5 }}>
                  {data.benefactors.map((ben, i) => {
                    return (
                      <div key={i}>
                        {i + 1}: {ben}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginTop: 30 }}>
                <Button
                  key={"edit_button" + index}
                  onClick={() => {
                    setTheTime(data.unlock);
                    setEditSwitchId(data.switchId);
                    setProERC20(true);
                  }}
                >
                  ⚙️ Edit Switch!
                </Button>{" "}
              </div>
            </Card>
          </div>
        </div>
      );
    }
  };

  const makeBeneCards = (data, index) => {
    if (data.type === "ERC721") {
      return (
        <div style={styles.NFTs}>
          <Card
            style={{ width: 470, border: "2px solid #e7eaf3", margin: 10 }}
            cover={
              <Image
                preview={false}
                src={data.image || data?.metadata?.image || null}
                fallback="data:image/png;base64,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"
                alt=""
                style={{
                  sizes: "(max-width: 48rem) 90vw, (max-width: 60rem) 45vw, (max-width: 75rem) 30vw, 25vw",
                }}
              />
            }
            key={index}
          >
            <h2>Type: ERC721</h2>
            <div style={{ marginTop: 10 }}>
              <h4>Switch Id: {data.switchId}</h4>
            </div>
            <Meta title={data.name ? `Name: ${data.name}` : null} description={`Token Address: ${data.address}`} />
            <h5> Token ID: {data.id}</h5>
            <div style={{ margin: 20 }}>
          <h4>The unlock date is {data.unlock}.</h4>
          <h5>The unix timestamp is {data.unix}</h5>
          <div style={{ margin: 20 }}>
            {data.claim <= startDateTime ? (
              <Button key={"claim_button" + index} onClick={() => claimSwitch(data.switchId)}>
                Claim switch!
              </Button>
            ) : (<div>It is not your time to claim!</div>)}
          </div>
          </div>
          </Card>
        </div>
      );
    }
    if (data.type === "ERC1155") {
      return (
        <div style={styles.NFTs}>
          <Card
            style={{ width: 470, border: "2px solid #e7eaf3", margin: 10 }}
            cover={
              <Image
                preview={false}
                src={data.image || data?.metadata?.image || null}
                fallback="data:image/png;base64,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"
                alt=""
                style={{
                  sizes: "(max-width: 48rem) 90vw, (max-width: 60rem) 45vw, (max-width: 75rem) 30vw, 25vw",
                }}
              />
            }
            key={index}
          >
            <h2>Type: ERC1155</h2>
            <div style={{ marginTop: 10 }}>
              <h4>Switch Id: {data.switchId}</h4>
            </div>
            <Meta
              title={data.name ? `Name: ${data.name}` : null}
              description={`Token Address: ${data.token_address} Token ID: ${data.token_id}`}
            />
            <h5> Token ID: {data.id}</h5>
            <div style={{ margin: 20 }}>
          <h4>The unlock date is {data.unlock}.</h4>
          <h5>The unix timestamp is {data.unix}</h5>
          <div style={{ margin: 20 }}>
            {data.claim <= startDateTime ? (
              <Button key={"claim_button" + index} onClick={() => claimSwitch(data.switchId)}>
                Claim switch!
              </Button>
            ) : (<div>It is not your time to claim!</div>)}
          </div>
          </div>
          </Card>
        </div>
      );
    }
    if (data.type === "ERC20") {
      return (
        <div>
          <Card
            style={{ width: 470, border: "2px solid #e7eaf3", margin: 10 }}
            cover={
              <Image
                preview={false}
                src={data.metadata.thumbnail || data?.thumbnail || null}
                fallback="data:image/png;base64,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"
                alt=""
                style={{
                  sizes: "(max-width: 48rem) 90vw, (max-width: 60rem) 45vw, (max-width: 75rem) 30vw, 25vw",
                }}
              />
            }
            key={index}
          >
            <h2>Type: ERC20</h2>
            <div style={{ marginTop: 10 }}>
              <h4>Switch Id: {data.switchId}</h4>
            </div>
            <Meta
              title={data.metadata?.name ? `Name: ${data.metadata.name}` : null}
              description={`Symbol: ${data.metadata.symbol} Token Address: ${data.address}`}
            />
          <div style={{ margin: 20 }}>
          <h4>The unlock date is {data.unlock}.</h4>
          <h5>The unix timestamp is {data.unix}</h5>
          <div style={{ margin: 20 }}>
            {data.claim <= startDateTime ? (
              <Button key={"claim_button" + index} onClick={() => claimSwitch(data.switchId)}>
                Claim switch!
              </Button>
            ) : (<div>It is not your time to claim!</div>)}
          </div>
          </div>
          
          </Card>
        </div>
      );
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

      {gotSwitches && state.switches.length === 0 && (
        <div style={{ marginTop: 150 }}>
          <div style={{ marginTop: 30, justifyContent: "center", alignItems: "center", display: "flex" }}>
            <Card>
              <h3>You currently have no active switches to display!</h3>
            </Card>
          </div>
          <div style={{ marginTop: 100 }}>
            <h3>Secure your Ethereum assets inheritance today!</h3>
            <div>
              <div style={{ marginTop: 100 }}>
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
            </div>
          </div>
        </div>
      )}
      <div>
        <Layout style={{ overflow: "hidden" }}>
          <Row span={5}>
            {state.switches.length > 0 &&
              state.switches.map((data, index) => {
                return <div style={styles.NFTs}>{makeCards(data, index)}</div>;
              })}
          </Row>
        </Layout>
        <Divider />
      </div>
      <Modal
        visible={proERC20}
        onCancel={() => {
          setProERC20(false);
        }}
        onOk={() => {
          // createSwitch();
          setProERC20(false);
        }}
      >
        <div style={{ marginTop: 20 }}>
          <h2>Edit benefactors</h2>
          <h5 style={{ margin: 10 }}>
            The first benefactor entered will be the first to claim, <br /> followed by the proceeding benefactors
            chosen.
          </h5>
          <h4>This will reset the current benefactors!</h4>
          <div style={{ width: 300 }}>
            <AddressInput
              ensProvider={mainnetProvider}
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
            <Button
              style={{ margin: 20 }}
              onClick={() => {
                updateBenefactors(editSwitchId, benefactors);
              }}
            >
              Update Benefactors!
            </Button>
          </div>
        </div>
        <div style={{ marginTop: 30 }}>
          <div style={{ margin: 20 }}>
            <h3>Set a new unlock time!</h3>
            <DatePicker
              dateFormat="MMMM d, yyyy"
              onChange={date => {
                setEndDate(date);
                setChosenDate(new Date(date).toLocaleDateString());
              }}
            />
            <Button
              style={{ margin: 20 }}
              onClick={() => {
                updateTime(editSwitchId);
              }}
            >
              Set New Time!
            </Button>
          </div>
          <div style={{ marginTop: 30 }}>
            <h3 style={{ marginTop: 15 }}>The current unlock date is: {theTime}</h3>

            {endDate && (
              <div>
                <h3 style={{ marginTop: 15 }}>The chosen unlock date is: {chosenDate}</h3>
                <h3 style={{ marginTop: 15 }}>The asset will unlock in {howManyDays} days.</h3>
                {/* <h5 style={{ marginTop: 15 }}>The unix timestamp is: {endTime}</h5> */}
              </div>
            )}
          </div>
        </div>
      </Modal>
      <Modal
        visible={proERC1155}
        onCancel={() => {
          setProERC1155(false);
        }}
        onOk={() => {
          // createSwitch();
          setProERC1155(false);
        }}
      >
        <div style={{ marginTop: 100 }}>
          <h2>Choose benefactors</h2>
          <h5 style={{ margin: 10 }}>
            The first benefactor entered will be the first to claim, <br /> followed by the proceeding benefactors
            chosen.
          </h5>
          <h4>This will reset the current benefactors!</h4>
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
            <Button
              style={{ margin: 20 }}
              onClick={() => {
                updateBenefactors(editSwitchId, benefactors);
              }}
            >
              Update Benefactors!
            </Button>
          </div>
        </div>
        <div style={{ marginTop: 30 }}>
          <div style={{ margin: 20 }}>
            <h3>Set a new unlock time!</h3>
            <DatePicker
              dateFormat="MMMM d, yyyy"
              onChange={date => {
                setEndDate(date);
                setChosenDate(new Date(date).toLocaleDateString());
              }}
            />
            <Button
              style={{ margin: 20 }}
              onClick={() => {
                updateTime(editSwitchId);
              }}
            >
              Set New Time!
            </Button>
          </div>
          <div style={{ marginTop: 30 }}>
            <h3 style={{ marginTop: 15 }}>The current unlock date is: {theTime}</h3>

            {endDate && (
              <div>
                <h3 style={{ marginTop: 15 }}>The chosen unlock date is: {chosenDate}</h3>
                <h3 style={{ marginTop: 15 }}>The asset will unlock in {howManyDays} days.</h3>
                {/* <h5 style={{ marginTop: 15 }}>The unix timestamp is: {endTime}</h5> */}
              </div>
            )}
          </div>
        </div>
      </Modal>
      <Modal
        visible={proERC721}
        onCancel={() => {
          setProERC721(false);
        }}
        onOk={() => {
          // createSwitch();
          setProERC721(false);
        }}
      >
        <div style={{ marginTop: 100 }}>
          <h2>Choose benefactors</h2>
          <h5 style={{ margin: 10 }}>
            The first benefactor entered will be the first to claim, <br /> followed by the proceeding benefactors
            chosen.
          </h5>
          <h4>This will reset the current benefactors!</h4>
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
            <Button
              style={{ margin: 20 }}
              onClick={() => {
                updateBenefactors(editSwitchId, benefactors);
              }}
            >
              Update Benefactors!
            </Button>
          </div>
        </div>
        <div style={{ marginTop: 30 }}>
          <div style={{ margin: 20 }}>
            <h3>Set a new unlock time!</h3>
            <DatePicker
              dateFormat="MMMM d, yyyy"
              onChange={date => {
                setEndDate(date);
                setChosenDate(new Date(date).toLocaleDateString());
              }}
            />
            <Button
              style={{ margin: 20 }}
              onClick={() => {
                updateTime(editSwitchId);
              }}
            >
              Set New Time!
            </Button>
            <div style={{ marginTop: 30 }}>
              <h3 style={{ marginTop: 15 }}>The current unlock date is: {theTime}</h3>

              {endDate && (
                <div>
                  <h3 style={{ marginTop: 15 }}>The chosen unlock date is: {chosenDate}</h3>
                  <h3 style={{ marginTop: 15 }}>The asset will unlock in {howManyDays} days.</h3>
                  {/* <h5 style={{ marginTop: 15 }}>The unix timestamp is: {endTime}</h5> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {!gotClaims && (
        <div style={{ marginTop: 200 }}>
          <h2>You are currently not benefactor to any switches!</h2>
        </div>
      )}
      <div>
        {gotClaims && <h2>Find the switches you are benefactor to below!</h2>}
        <div></div>
        <div>
          <Layout style={{ overflow: "hidden" }}>
            <Row span={5}>
              {beneState.switches.length > 0 &&
                beneState.switches.map((data, index) => {
                  return <div>{makeBeneCards(data, index)}</div>;
                })}
            </Row>
          </Layout>
          <Divider />
        </div>
      </div>

      <div style={{ marginBottom: 200 }}></div>
    </div>
  );
}

export default Switches;
