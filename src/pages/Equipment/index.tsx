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
  Select,
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
  Equipment,
  EquipmentCategory,
  EquipmentFilter,
  EquipmentService,
} from "../../services/EquipmentService";
import "./styles.css";

const { Title } = Typography;
const { Option } = Select;

const EquipmentList: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [filter, setFilter] = useState<EquipmentFilter>({});
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const equipmentService = new EquipmentService();

  useEffect(() => {
    fetchCategories();
    fetchEquipment();
  }, [currentPage, pageSize, filter]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentService.getAllEquipment({
        ...filter,
        page: currentPage,
        limit: pageSize,
      });

      setEquipment(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      message.error("Failed to fetch equipment");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await equipmentService.getAllCategories({ limit: 100 });
      setCategories(response.data);
    } catch (error) {
      message.error("Failed to fetch categories");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await equipmentService.deleteEquipment(id);
      message.success("Equipment deleted successfully");
      fetchEquipment();
    } catch (error) {
      message.error("Failed to delete equipment");
      console.error(error);
    }
  };

  const handleSearch = (values: any) => {
    const newFilter: EquipmentFilter = { ...values };

    // Reset to first page when filtering
    setCurrentPage(1);
    setFilter(newFilter);
  };

  const handleReset = () => {
    form.resetFields();
    setCurrentPage(1);
    setFilter({});
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Equipment) => (
        <a onClick={() => navigate(`/equipment/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (_: any, record: Equipment) => record.category?.name || "-",
    },
    {
      title: "Daily Price",
      dataIndex: "dailyRentalPrice",
      key: "dailyRentalPrice",
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
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
      render: (_: any, record: Equipment) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`/equipment/${record.id}`)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/equipment/edit/${record.id}`)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this equipment?"
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
    <div className="equipment-list-container">
      <Card className="equipment-list-card">
        <div className="equipment-list-header">
          <Title level={2}>Equipment Management</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/equipment/create")}
          >
            Add Equipment
          </Button>
        </div>

        <Card className="filter-card">
          <Form
            form={form}
            name="equipment_filter"
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
                <Form.Item name="categoryId" label="Category">
                  <Select placeholder="Select category" allowClear>
                    {categories.map((category) => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="minPrice" label="Min Price">
                  <Input type="number" placeholder="Min price" min={0} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="maxPrice" label="Max Price">
                  <Input type="number" placeholder="Max price" min={0} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="isActive" label="Status">
                  <Select placeholder="Select status" allowClear>
                    <Option value="true">Active</Option>
                    <Option value="false">Inactive</Option>
                  </Select>
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
          dataSource={equipment}
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

export default EquipmentList;
