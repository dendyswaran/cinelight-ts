import React from "react";
import { Row, Col, Card, Typography, Statistic } from "antd";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import "./styles.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const { Title: AntTitle } = Typography;

const Dashboard: React.FC = () => {
  // Mock data for the charts
  const quotationVsInvoice = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Quotations",
        data: [65, 59, 80, 81, 56, 55],
        borderColor: "#ff4d4f",
        backgroundColor: "rgba(255, 77, 79, 0.5)",
      },
      {
        label: "Invoices",
        data: [28, 48, 40, 19, 36, 27],
        borderColor: "#1890ff",
        backgroundColor: "rgba(24, 144, 255, 0.5)",
      },
    ],
  };

  const topItems = {
    labels: ["Cameras", "Lights", "Tripods", "Microphones", "Lenses"],
    datasets: [
      {
        label: "Rental Count",
        data: [12, 19, 3, 5, 2],
        backgroundColor: [
          "rgba(255, 77, 79, 0.6)",
          "rgba(24, 144, 255, 0.6)",
          "rgba(250, 173, 20, 0.6)",
          "rgba(82, 196, 26, 0.6)",
          "rgba(114, 46, 209, 0.6)",
        ],
        borderColor: [
          "rgba(255, 77, 79, 1)",
          "rgba(24, 144, 255, 1)",
          "rgba(250, 173, 20, 1)",
          "rgba(82, 196, 26, 1)",
          "rgba(114, 46, 209, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const inventorySource = {
    labels: ["Internal Stock", "External Vendors"],
    datasets: [
      {
        label: "Inventory Source",
        data: [65, 35],
        backgroundColor: ["rgba(24, 144, 255, 0.6)", "rgba(255, 77, 79, 0.6)"],
        borderColor: ["rgba(24, 144, 255, 1)", "rgba(255, 77, 79, 1)"],
        borderWidth: 1,
      },
    ],
  };

  // Summary cards data
  const summaryData = [
    {
      title: "Total Quotations",
      value: 156,
      prefix: "",
      suffix: "",
      change: 12.5,
      icon: (
        <FileTextOutlined className="card-icon" style={{ color: "#1890ff" }} />
      ),
    },
    {
      title: "Total Orders",
      value: 78,
      prefix: "",
      suffix: "",
      change: 8.2,
      icon: (
        <ShoppingCartOutlined
          className="card-icon"
          style={{ color: "#52c41a" }}
        />
      ),
    },
    {
      title: "Total Revenue",
      value: 24890,
      prefix: "$",
      suffix: "",
      change: -4.3,
      icon: (
        <DollarOutlined className="card-icon" style={{ color: "#faad14" }} />
      ),
    },
    {
      title: "Items Rented",
      value: 152,
      prefix: "",
      suffix: "",
      change: 15.6,
      icon: (
        <InboxOutlined className="card-icon" style={{ color: "#722ed1" }} />
      ),
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="summary-cards">
        {summaryData.map((item, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card className="summary-card">
              <div className="card-title">{item.title}</div>
              <div className="card-content">
                <Typography.Title level={3} className="card-value">
                  {item.prefix}
                  {item.value.toLocaleString()}
                  {item.suffix}
                </Typography.Title>
                {item.icon}
              </div>
              <div className="card-footer">
                {item.change > 0 ? (
                  <ArrowUpOutlined className="trend-up" />
                ) : (
                  <ArrowDownOutlined className="trend-down" />
                )}
                <span
                  className={item.change > 0 ? "trend-up" : "trend-down"}
                  style={{ marginLeft: 4 }}
                >
                  {Math.abs(item.change)}%
                </span>
                <span style={{ marginLeft: 8 }}>vs last month</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Quotations vs Invoices Chart */}
        <Col xs={24} lg={16}>
          <Card title="Quotations vs Paid Invoices" className="chart-card">
            <div className="chart-container">
              <Line
                data={quotationVsInvoice}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top" as const,
                    },
                  },
                }}
              />
            </div>
          </Card>
        </Col>

        {/* Inventory Source Distribution */}
        <Col xs={24} lg={8}>
          <Card title="Inventory Source" className="chart-card">
            <div className="chart-container doughnut-container">
              <Doughnut
                data={inventorySource}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </Card>
        </Col>

        {/* Top Rented Items */}
        <Col xs={24}>
          <Card title="Top Rented Items" className="chart-card">
            <div className="chart-container">
              <Bar
                data={topItems}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
