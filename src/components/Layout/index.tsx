import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Layout as AntLayout,
  Menu,
  Button,
  Avatar,
  Typography,
  Divider,
  Dropdown,
  Badge,
  Space,
  theme,
} from "antd";
import type { MenuProps } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  FileTextOutlined,
  CarOutlined,
  FileDoneOutlined,
  InboxOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
  UserSwitchOutlined,
  QuestionCircleOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "../Logo";
import "./styles.css";

const { Header, Sider, Content, Footer } = AntLayout;
const { useToken } = theme;

// Types for dropdown menu items
type MenuItem = Required<MenuProps>["items"][number];

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { token } = useToken();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    { key: "/", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "/equipment", label: "Equipment", icon: <CameraOutlined /> },
    { key: "/quotations", label: "Quotations", icon: <FileTextOutlined /> },
    {
      key: "/delivery-orders",
      label: "Delivery Orders",
      icon: <CarOutlined />,
    },
    { key: "/invoices", label: "Invoices", icon: <FileDoneOutlined /> },
    { key: "/inventory", label: "Inventory", icon: <InboxOutlined /> },
    { key: "/analytics", label: "Analytics", icon: <BarChartOutlined /> },
    { key: "/settings", label: "Settings", icon: <SettingOutlined /> },
    { key: "/users", label: "Users", icon: <UserOutlined /> },
  ];

  const userMenuItems: MenuItem[] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "account",
      icon: <UserSwitchOutlined />,
      label: "Account Settings",
      onClick: () => navigate("/settings/account"),
    },
    {
      key: "help",
      icon: <QuestionCircleOutlined />,
      label: "Help & Support",
      onClick: () => navigate("/help"),
    },
    {
      type: "divider",
    } as MenuItem,
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => logout(),
    },
  ];

  // Format user's name from firstName and lastName or use username as fallback
  const getUserDisplayName = () => {
    if (user) {
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      } else if (user.firstName) {
        return user.firstName;
      } else {
        return user.username;
      }
    }
    return "User";
  };

  return (
    <AntLayout className="app-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth="80"
        width={256}
        className="app-sider"
        theme="light"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
      >
        <div className="logo-container">
          <Logo collapsed={collapsed} />
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="app-menu"
        />
        <div className="sider-footer">
          {!collapsed && (
            <Typography.Text
              type="secondary"
              style={{ fontSize: "12px", padding: "0 24px" }}
            >
              Cinelight v1.0.0
            </Typography.Text>
          )}
        </div>
      </Sider>
      <AntLayout>
        <Header className="app-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleCollapsed}
              className="trigger-button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            />
            <Typography.Title level={4} className="page-title">
              {menuItems.find((item) => item.key === location.pathname)
                ?.label || "Dashboard"}
            </Typography.Title>
          </div>
          <div className="header-right">
            <Space size={16}>
              <Badge count={5} dot>
                <Button
                  type="text"
                  shape="circle"
                  icon={<BellOutlined />}
                  size="large"
                  aria-label="Notifications"
                  onClick={() => navigate("/notifications")}
                />
              </Badge>
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <Button type="text" className="user-profile-button">
                  <Space>
                    <Avatar
                      icon={<UserOutlined />}
                      style={{ backgroundColor: token.colorPrimary }}
                    >
                      {user?.firstName
                        ? user.firstName.charAt(0).toUpperCase()
                        : user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    {!collapsed && (
                      <div className="user-info">
                        <Typography.Text strong>
                          {getUserDisplayName()}
                        </Typography.Text>
                        <Typography.Text type="secondary">
                          {user?.role || "User"}
                        </Typography.Text>
                      </div>
                    )}
                  </Space>
                </Button>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content className="app-content">
          <div className="content-container">
            <Outlet />
          </div>
        </Content>
        <Footer className="app-footer">
          <Typography.Text type="secondary">
            Cinelight © {new Date().getFullYear()} - All Rights Reserved
          </Typography.Text>
        </Footer>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
