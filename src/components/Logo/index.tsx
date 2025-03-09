import React from "react";
import { Typography } from "antd";
import "./styles.css";

interface LogoProps {
  collapsed?: boolean;
}

const Logo: React.FC<LogoProps> = ({ collapsed = false }) => {
  return (
    <div className={`logo ${collapsed ? "logo-collapsed" : ""}`}>
      {collapsed ? (
        <div className="logo-icon">C</div>
      ) : (
        <Typography.Title level={4} className="logo-text">
          Cinelight
        </Typography.Title>
      )}
    </div>
  );
};

export default Logo;
