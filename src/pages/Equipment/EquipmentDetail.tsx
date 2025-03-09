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
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { Equipment, EquipmentService } from "../../services/EquipmentService";
import "./styles.css";

const { Title } = Typography;

const EquipmentDetail: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const equipmentService = new EquipmentService();

  useEffect(() => {
    if (id) {
      fetchEquipmentDetails(parseInt(id));
    } else {
      navigate("/equipment");
    }
  }, [id]);

  const fetchEquipmentDetails = async (equipmentId: number) => {
    try {
      setLoading(true);
      const response = await equipmentService.getEquipmentById(equipmentId);
      setEquipment(response.data);
    } catch (error) {
      message.error("Failed to fetch equipment details");
      console.error(error);
      navigate("/equipment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await equipmentService.deleteEquipment(parseInt(id));
      message.success("Equipment deleted successfully");
      navigate("/equipment");
    } catch (error) {
      message.error("Failed to delete equipment");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div
        className="equipment-detail-container"
        style={{ textAlign: "center", padding: "50px" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!equipment) {
    return null;
  }

  return (
    <div className="equipment-detail-container">
      <Card className="equipment-detail-card">
        <div className="equipment-detail-header">
          <Title level={2}>Equipment Details</Title>
          <Space>
            <Button
              icon={<RollbackOutlined />}
              onClick={() => navigate("/equipment")}
            >
              Back to List
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/equipment/edit/${id}`)}
            >
              Edit
            </Button>
            <Popconfirm
              title="Are you sure you want to delete this equipment?"
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

        <div className="equipment-detail-info">
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Name">{equipment.name}</Descriptions.Item>
            <Descriptions.Item label="Category">
              {equipment.category?.name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Daily Rental Price">
              ${equipment.dailyRentalPrice.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Quantity">
              {equipment.quantity}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {equipment.isActive ? (
                <Tag color="green">Active</Tag>
              ) : (
                <Tag color="red">Inactive</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {new Date(equipment.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {new Date(equipment.updatedAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={3}>
              {equipment.description || "No description provided"}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Card>
    </div>
  );
};

export default EquipmentDetail;
