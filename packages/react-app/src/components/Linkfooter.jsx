/* eslint-disable prettier/prettier */
import { Divider, Image, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";


function LinkFooter() {
    const location = useLocation();
  return (
    <div style={{ marginBottom: 60 }}>
      <Divider />
      <Menu style={{ textAlign: "center", marginTop: 40, color: "green" }} selectedKeys={[location.pathname]} mode="horizontal">
        <Menu.Item key="/">
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="/switches">
          <Link to="/switches">Switches</Link>
        </Menu.Item>
        <Menu.Item key="/contracts">
          <Link to="/contract">Contract</Link>
        </Menu.Item>
        {/* <Menu.Item key="/swap">
          <Link to="/swap">Uniswapper</Link>
        </Menu.Item> */}
      </Menu>
      
      <div style={{marginTop: 100,marginBottom:70}}>
      <Image style={{marginBottom:50}} preview={false} src="https://ipfs.infura.io/ipfs/QmaZSotdfpTyMMmcwTQyNTEzCzNWtRsDaknRJF9rL2wKPq"/>
        <h4>Thank you for visiting!</h4>
        <p>
          By using this dApp you agree to the terms found here:{" "}
          <Link to="/terms">Terms & Conditions</Link>
        </p>
        
      </div>
      <div>
      <div>
          PharOut-Labs 2022 <br />
          Email PharOutLabs: pharoutlabs@protonmail.com
        </div>
        Version: 0.1.7 (last updated: 3:00 PM Friday, April 15th, 2022 Coordinated Universal Time (UTC))
      </div>
    </div>
  );
}

export default LinkFooter;
