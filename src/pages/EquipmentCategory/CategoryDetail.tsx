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
  Badge,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  EquipmentCategory,
  EquipmentService,
} from "../../services/EquipmentService";
import "./styles.css";

const { Title, Text } = Typography;

const CategoryDetail: React.FC = () => {
  const [category, setCategory] = useState<EquipmentCategory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [equipmentCount, setEquipmentCount] = useState<number>(0); // Count of equipment in this category

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const equipmentService = new EquipmentService();

  useEffect(() => {
    if (id) {
      fetchCategoryDetails(parseInt(id));
    } else {
      navigate("/equipment-categories");
    }
  }, [id]);

  const fetchCategoryDetails = async (categoryId: number) => {
    try {
      setLoading(true);
      const response = await equipmentService.getCategoryById(categoryId);
      setCategory(response.data);

      // Get count of equipment in this category
      const equipmentResponse = await equipmentService.getEquipmentByCategory(
        categoryId,
        { limit: 1 }
      );
      setEquipmentCount(equipmentResponse.meta.total);
    } catch (error) {
      message.error("Failed to fetch category details");
      console.error(error);
      navigate("/equipment-categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await equipmentService.deleteCategory(parseInt(id));
      message.success("Category deleted successfully");
      navigate("/equipment-categories");
    } catch (error) {
      message.error("Failed to delete category");
      console.error(error);
    }
  };

  const handleViewEquipment = () => {
    navigate(`/equipment?categoryId=${id}`);
  };

  if (loading) {
    return (
      <div
        className="category-detail-container"
        style={{ textAlign: "center", padding: "50px" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div className="category-detail-container">
      <Card className="category-detail-card">
        <div className="category-detail-header">
          <Title level={2}>Category Details</Title>
          <Space>
            <Button
              icon={<RollbackOutlined />}
              onClick={() => navigate("/equipment-categories")}
            >
              Back to List
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/equipment-categories/edit/${id}`)}
            >
              Edit
            </Button>
            <Popconfirm
              title="Are you sure you want to delete this category?"
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

        <div className="category-detail-info">
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Name">{category.name}</Descriptions.Item>
            <Descriptions.Item label="Status">
              {category.isActive ? (
                <Tag color="green">Active</Tag>
              ) : (
                <Tag color="red">Inactive</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Equipment Count">
              <Badge count={equipmentCount} showZero color="#1890ff" />
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={3}>
              {category.description || "No description provided"}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <div className="category-detail-actions">
          <Button type="primary" onClick={handleViewEquipment}>
            View Equipment in this Category
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CategoryDetail;
