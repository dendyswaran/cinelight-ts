import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./styles.css";

interface LoadingProps {
  tip?: string;
  size?: "small" | "default" | "large";
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  tip = "Loading...",
  size = "large",
  fullScreen = false,
}) => {
  const antIcon = (
    <LoadingOutlined
      style={{ fontSize: size === "small" ? 24 : size === "large" ? 40 : 32 }}
      spin
    />
  );

  if (fullScreen) {
    return (
      <div className="full-screen-loading">
        <Spin indicator={antIcon} tip={tip} size={size} />
      </div>
    );
  }

  return (
    <div className="loading-container">
      <Spin indicator={antIcon} tip={tip} size={size} />
    </div>
  );
};

export default Loading;
