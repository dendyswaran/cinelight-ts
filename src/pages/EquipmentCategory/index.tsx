import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Table,
  Input,
  Space,
  Popconfirm,
  message,
  Tag,
  Form,
  Row,
  Col,
  Typography,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  EquipmentCategory,
  EquipmentService,
} from "../../services/EquipmentService";
import "./styles.css";

const { Title } = Typography;

const EquipmentCategoryList: React.FC = () => {
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const equipmentService = new EquipmentService();

  useEffect(() => {
    fetchCategories();
  }, [currentPage, pageSize, searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await equipmentService.getAllCategories({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
      });

      setCategories(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      message.error("Failed to fetch equipment categories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await equipmentService.deleteCategory(id);
      message.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      message.error("Failed to delete category");
      console.error(error);
    }
  };

  const handleSearch = (values: any) => {
    const { search } = values;
    setSearchTerm(search || "");
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleReset = () => {
    form.resetFields();
    setSearchTerm("");
    setCurrentPage(1);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: EquipmentCategory) => (
        <a onClick={() => navigate(`/equipment-categories/${record.id}`)}>
          {text}
        </a>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text: string) => text || "-",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) =>
        isActive ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: EquipmentCategory) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`/equipment-categories/${record.id}`)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() =>
                navigate(`/equipment-categories/edit/${record.id}`)
              }
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this category?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<DeleteOutlined />} danger size="small" />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="category-list-container">
      <Card className="category-list-card">
        <div className="category-list-header">
          <Title level={2}>Equipment Categories</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/equipment-categories/create")}
          >
            Add Category
          </Button>
        </div>

        <Card className="filter-card">
          <Form
            form={form}
            name="category_filter"
            onFinish={handleSearch}
            layout="vertical"
          >
            <Row gutter={24}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="search" label="Search">
                  <Input
                    placeholder="Search by name"
                    prefix={<SearchOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item label=" " className="filter-buttons">
                  <Space>
                    <Button type="primary" htmlType="submit">
                      Filter
                    </Button>
                    <Button onClick={handleReset}>Reset</Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default EquipmentCategoryList;
