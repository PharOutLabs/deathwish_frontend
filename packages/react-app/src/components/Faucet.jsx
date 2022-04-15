import { Button, Input, message, notification, Tooltip } from "antd";
import React, { useState, useEffect } from "react";
import Blockies from "react-blockies";
import { SendOutlined } from "@ant-design/icons";
import { Transactor } from "../helpers";
import Wallet from "./Wallet";

const { utils } = require("ethers");

// improved a bit by converting address to ens if it exists
// added option to directly input ens name
// added placeholder option

/**
  ~ What it does? ~

  Displays a local faucet to send ETH to given address, also wallet is provided

  ~ How can I use? ~

  <Faucet
    price={price}
    localProvider={localProvider}
    ensProvider={mainnetProvider}
    placeholder={"Send local faucet"}
  />

  ~ Features ~

  - Provide price={price} of ether and convert between USD and ETH in a wallet
  - Provide localProvider={localProvider} to be able to send ETH to given address
  - Provide ensProvider={mainnetProvider} and your address will be replaced by ENS name
              (ex. "0xa870" => "user.eth") or you can enter directly ENS name instead of address
              works both in input field & wallet
  - Provide placeholder="Send local faucet" value for the input
**/

export default function Faucet(
  props
) {
  const [chosenPrice, setPrice] = useState("");

  const validateMessages = {
    required: "${label} is required!",
    types: {
      number: "${label} is not a valid number!",
    },
    number: {
      range: "${label} must be between ${min} and ${max}",
    },
  };

  const sendIt = async () => {
    const result = props.tx({
      to: "0x41538872240ef02d6ed9ac45cf4ff864349d51ed",
      value: utils.parseEther(chosenPrice),
    });
    await result && notification.open({message:"Thanks for the tip!"})
    setPrice("");
  };

  return (
    <span>
      <Input
        size="large"
        placeholder="Tip the creator!"
        onChange={e => setPrice(`${e.target.value}`)}
        validateMessages={validateMessages}
        suffix={
          <Tooltip title="Send gratuity to creator; i.e. 1 ETH">
            <Button
              onClick={() => {
                if (chosenPrice) {
                  sendIt();
                } else {
                  notification.open({ message: "Enter a price!" });
                }
              }}
              shape="circle"
              icon={<SendOutlined />}
            />
          </Tooltip>
        }
      />
    </span>
  );
}
