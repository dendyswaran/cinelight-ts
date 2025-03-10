import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Descriptions,
  Spin,
  Space,
  Tag,
  Popconfirm,
  message,
  Divider,
  Table,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  EquipmentBundle,
  EquipmentBundleItem,
  EquipmentService,
} from "../../services/EquipmentService";
import "./styles.css";

const { Title, Text } = Typography;

const BundleDetail: React.FC = () => {
  const [bundle, setBundle] = useState<EquipmentBundle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const equipmentService = new EquipmentService();

  useEffect(() => {
    if (id) {
      fetchBundleDetails(parseInt(id));
    } else {
      navigate("/equipment-bundles");
    }
  }, [id]);

  const fetchBundleDetails = async (bundleId: number) => {
    try {
      setLoading(true);
      const response = await equipmentService.getBundleById(bundleId);
      setBundle(response.data);
    } catch (error) {
      message.error("Failed to fetch bundle details");
      console.error(error);
      navigate("/equipment-bundles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await equipmentService.deleteBundle(parseInt(id));
      message.success("Bundle deleted successfully");
      navigate("/equipment-bundles");
    } catch (error) {
      message.error("Failed to delete bundle");
      console.error(error);
    }
  };

  // Format number as IDR
  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  // Calculate total price of all items without discount
  const calculateTotalPrice = () => {
    if (!bundle || !bundle.bundleItems) return 0;

    return bundle.bundleItems.reduce((total, item) => {
      const itemPrice = item.equipment?.dailyRentalPrice || 0;
      return total + itemPrice * item.quantity;
    }, 0);
  };

  // Calculate savings from bundle price
  const calculateSavings = () => {
    const totalPrice = calculateTotalPrice();
    if (totalPrice === 0 || !bundle) return 0;

    return totalPrice - bundle.dailyRentalPrice;
  };

  const columns = [
    {
      title: "Equipment",
      dataIndex: "equipment",
      key: "equipment",
      render: (equipment: any) => equipment?.name || "Unknown",
    },
    {
      title: "Daily Price",
      dataIndex: "equipment",
      key: "price",
      render: (equipment: any) =>
        formatCurrency(equipment?.dailyRentalPrice || 0),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Subtotal",
      key: "subtotal",
      render: (record: EquipmentBundleItem) => {
        const price = record.equipment?.dailyRentalPrice || 0;
        return formatCurrency(price * record.quantity);
      },
    },
  ];

  if (loading) {
    return (
      <div
        className="bundle-detail-container"
        style={{ textAlign: "center", padding: "50px" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!bundle) {
    return null;
  }

  return (
    <div className="bundle-detail-container">
      <Card className="bundle-detail-card">
        <div className="bundle-detail-header">
          <Title level={2}>Bundle Details</Title>
          <Space>
            <Button
              icon={<RollbackOutlined />}
              onClick={() => navigate("/equipment-bundles")}
            >
              Back to Bundles
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/equipment-bundles/edit/${id}`)}
            >
              Edit
            </Button>
            <Popconfirm
              title="Are you sure you want to delete this bundle?"
              onConfirm={handleDelete}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        </div>

        <Divider />

        <div className="bundle-detail-info">
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Name" span={3}>
              {bundle.name}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={3}>
              {bundle.description || "No description provided"}
            </Descriptions.Item>

            <Descriptions.Item label="Bundle Price">
              <Text strong>{formatCurrency(bundle.dailyRentalPrice)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Total Items Price">
              <Text>{formatCurrency(calculateTotalPrice())}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="You Save">
              <Text type="success">{formatCurrency(calculateSavings())}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Discount">{`${bundle.discount}%`}</Descriptions.Item>
            <Descriptions.Item label="Status">
              {bundle.isActive ? (
                <Tag color="green">Active</Tag>
              ) : (
                <Tag color="red">Inactive</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Total Items">
              {bundle.bundleItems?.length || 0}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <div className="bundle-items-section">
          <Title level={4}>Bundle Items</Title>

          <Table
            dataSource={bundle.bundleItems || []}
            columns={columns}
            rowKey="id"
            pagination={false}
          />

          <Divider />

          <div style={{ textAlign: "right" }}>
            <Space direction="vertical" align="end">
              <Text>Items Total: {formatCurrency(calculateTotalPrice())}</Text>
              <Text>Discount: {bundle.discount}%</Text>
              <Title level={5} style={{ margin: 0 }}>
                Bundle Price: {formatCurrency(bundle.dailyRentalPrice)}
              </Title>
            </Space>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BundleDetail;
