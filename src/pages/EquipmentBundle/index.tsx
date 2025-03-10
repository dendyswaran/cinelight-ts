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
  EquipmentBundle,
  EquipmentService,
} from "../../services/EquipmentService";
import "./styles.css";

const { Title } = Typography;

const EquipmentBundleList: React.FC = () => {
  const [bundles, setBundles] = useState<EquipmentBundle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const equipmentService = new EquipmentService();

  useEffect(() => {
    fetchBundles();
  }, [currentPage, pageSize, searchTerm]);

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const response = await equipmentService.getAllBundles({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
      });

      setBundles(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      message.error("Failed to fetch equipment bundles");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await equipmentService.deleteBundle(id);
      message.success("Bundle deleted successfully");
      fetchBundles();
    } catch (error) {
      message.error("Failed to delete bundle");
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

  // Format number as IDR
  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: EquipmentBundle) => (
        <a onClick={() => navigate(`/equipment-bundles/${record.id}`)}>
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
      title: "Daily Price",
      dataIndex: "dailyRentalPrice",
      key: "dailyRentalPrice",
      render: (price: number) => formatCurrency(price),
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      render: (discount: number) => `${discount}%`,
    },
    {
      title: "Items",
      key: "itemCount",
      render: (_: any, record: EquipmentBundle) =>
        record.bundleItems?.length || 0,
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
      render: (_: any, record: EquipmentBundle) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`/equipment-bundles/${record.id}`)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/equipment-bundles/edit/${record.id}`)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this bundle?"
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
    <div className="bundle-list-container">
      <Card className="bundle-list-card">
        <div className="bundle-list-header">
          <Title level={2}>Equipment Bundles</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/equipment-bundles/create")}
          >
            Create Bundle
          </Button>
        </div>

        <Card className="filter-card">
          <Form
            form={form}
            name="bundle_filter"
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
          dataSource={bundles}
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

export default EquipmentBundleList;
