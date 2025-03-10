import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Layout as AntLayout,
  Menu,
  Button,
  Avatar,
  Typography,
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
  AppstoreOutlined,
  DatabaseOutlined,
  GiftOutlined,
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
  const [openKeys, setOpenKeys] = useState<string[]>(["masterData"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { token } = useToken();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // Determine which menu keys should be selected based on the current path
  const getSelectedKeys = () => {
    const pathname = location.pathname;

    // For root paths that match exactly
    if (
      pathname === "/" ||
      pathname === "/quotations" ||
      pathname === "/delivery-orders" ||
      pathname === "/invoices" ||
      pathname === "/inventory" ||
      pathname === "/analytics" ||
      pathname === "/settings" ||
      pathname === "/users"
    ) {
      return [pathname];
    }

    // For sub-paths
    if (pathname.startsWith("/equipment")) {
      return ["/equipment"];
    } else if (pathname.startsWith("/equipment-categories")) {
      return ["/equipment-categories"];
    }

    return [pathname];
  };

  // Determine which sub-menu should be open
  const getOpenKeys = () => {
    const pathname = location.pathname;

    if (
      pathname.startsWith("/equipment") ||
      pathname.startsWith("/equipment-categories") ||
      pathname.startsWith("/equipment-bundles")
    ) {
      return ["masterData"];
    }

    return [];
  };

  // Handle submenu open changes
  const onOpenChange: MenuProps["onOpenChange"] = (keys) => {
    setOpenKeys(keys as string[]);
  };

  // Define menu items
  const menuItems: MenuProps["items"] = [
    {
      key: "/",
      label: "Dashboard",
      icon: <DashboardOutlined />,
      onClick: () => navigate("/"),
    },
    {
      key: "masterData",
      label: "Master Data",
      icon: <DatabaseOutlined />,
      children: [
        {
          key: "/equipment",
          label: "Equipment",
          icon: <CameraOutlined />,
          onClick: () => navigate("/equipment"),
        },
        {
          key: "/equipment-categories",
          label: "Categories",
          icon: <AppstoreOutlined />,
          onClick: () => navigate("/equipment-categories"),
        },
        {
          key: "/equipment-bundles",
          label: "Bundles",
          icon: <GiftOutlined />,
          onClick: () => navigate("/equipment-bundles"),
        },
      ],
    },
    {
      key: "/quotations",
      label: "Quotations",
      icon: <FileTextOutlined />,
      onClick: () => navigate("/quotations"),
    },
    {
      key: "/delivery-orders",
      label: "Delivery Orders",
      icon: <CarOutlined />,
      onClick: () => navigate("/delivery-orders"),
    },
    {
      key: "/invoices",
      label: "Invoices",
      icon: <FileDoneOutlined />,
      onClick: () => navigate("/invoices"),
    },
    {
      key: "/inventory",
      label: "Inventory",
      icon: <InboxOutlined />,
      onClick: () => navigate("/inventory"),
    },
    {
      key: "/analytics",
      label: "Analytics",
      icon: <BarChartOutlined />,
      onClick: () => navigate("/analytics"),
    },
    {
      key: "/settings",
      label: "Settings",
      icon: <SettingOutlined />,
      onClick: () => navigate("/settings"),
    },
    {
      key: "/users",
      label: "Users",
      icon: <UserOutlined />,
      onClick: () => navigate("/users"),
    },
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

  // Function to determine the title shown in the header
  const getPageTitle = () => {
    const pathname = location.pathname;

    // First check if it's a root path
    if (pathname === "/") return "Dashboard";

    // For equipment paths
    if (pathname.startsWith("/equipment") && pathname !== "/equipment") {
      return "Equipment Management";
    }

    // For category paths
    if (
      pathname.startsWith("/equipment-categories") &&
      pathname !== "/equipment-categories"
    ) {
      return "Category Management";
    }

    // For bundle paths
    if (
      pathname.startsWith("/equipment-bundles") &&
      pathname !== "/equipment-bundles"
    ) {
      return "Bundle Management";
    }

    // For main routes
    if (pathname === "/equipment") return "Equipment";
    if (pathname === "/equipment-categories") return "Categories";
    if (pathname === "/equipment-bundles") return "Equipment Bundles";
    if (pathname === "/quotations") return "Quotations";
    if (pathname === "/delivery-orders") return "Delivery Orders";
    if (pathname === "/invoices") return "Invoices";
    if (pathname === "/inventory") return "Inventory";
    if (pathname === "/analytics") return "Analytics";
    if (pathname === "/settings") return "Settings";
    if (pathname === "/users") return "Users";

    // Default to showing the path
    return pathname
      .split("/")
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" > ");
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
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={onOpenChange}
          items={menuItems}
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
              {getPageTitle()}
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
