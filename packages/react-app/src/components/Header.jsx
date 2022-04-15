import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header({link, title, subTitle}) {
  return (
    <div>
      <PageHeader
        title={title}
        subTitle={subTitle}
        style={{ cursor: "pointer", marginBottom: 100, marginTop:10 }}
        ghost={true}
      />
    </div>
  );
}

Header.defaultProps = {
  title: "💀 Deathwish 🔐",
  subTitle: "On chain mechanism for managing ETH inheritances",
}
