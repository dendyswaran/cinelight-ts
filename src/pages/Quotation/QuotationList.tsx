import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Card,
  Typography,
  message,
  Space,
  Tag,
  Popconfirm,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Quotation,
  QuotationService,
  QuotationStatus,
  QuotationFilter,
  PaginationMeta,
} from "../../services/QuotationService";
import "./styles.css";
import moment from "moment";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const QuotationList: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [filter, setFilter] = useState<QuotationFilter>({
    page: 1,
    limit: 10,
  });
  const [searchText, setSearchText] = useState<string>("");
  const [filterVisible, setFilterVisible] = useState<boolean>(false);

  const navigate = useNavigate();
  const quotationService = new QuotationService();

  useEffect(() => {
    fetchQuotations();
  }, [filter]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await quotationService.getAllQuotations(filter);
      setQuotations(response.data);
      setPagination(response.meta);
    } catch (error) {
      message.error("Failed to fetch quotations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilter({ ...filter, search: searchText, page: 1 });
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setFilter({
      ...filter,
      page: pagination.current,
      limit: pagination.pageSize,
      sort: sorter.field,
      order: sorter.order === "ascend" ? "ASC" : "DESC",
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await quotationService.deleteQuotation(id);
      message.success("Quotation deleted successfully");
      fetchQuotations();
    } catch (error) {
      message.error("Failed to delete quotation");
      console.error(error);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilter({ ...filter, [key]: value, page: 1 });
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setFilter({
        ...filter,
        startDate: dates[0].format("YYYY-MM-DD"),
        endDate: dates[1].format("YYYY-MM-DD"),
        page: 1,
      });
    } else {
      const { startDate, endDate, ...restFilter } = filter;
      setFilter({ ...restFilter, page: 1 });
    }
  };

  const handleResetFilter = () => {
    setFilter({ page: 1, limit: 10 });
    setSearchText("");
  };

  const handleExportToPdf = async (id: number) => {
    try {
      const blob = await quotationService.exportQuotationToPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quotation-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      message.error("Failed to export quotation to PDF");
      console.error(error);
    }
  };

  const handleExportToExcel = async (id: number) => {
    try {
      const blob = await quotationService.exportQuotationToExcel(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quotation-${id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      message.error("Failed to export quotation to Excel");
      console.error(error);
    }
  };

  const renderStatusTag = (status: QuotationStatus) => {
    let color = "";
    let text = "";

    switch (status) {
      case QuotationStatus.DRAFT:
        color = "blue";
        text = "Draft";
        break;
      case QuotationStatus.SENT:
        color = "orange";
        text = "Sent";
        break;
      case QuotationStatus.APPROVED:
        color = "green";
        text = "Approved";
        break;
      case QuotationStatus.REJECTED:
        color = "red";
        text = "Rejected";
        break;
      case QuotationStatus.CONVERTED_TO_DO:
        color = "purple";
        text = "To D.O.";
        break;
      case QuotationStatus.CONVERTED_TO_INVOICE:
        color = "lime";
        text = "To Invoice";
        break;
      default:
        color = "default";
        text = status;
    }

    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    {
      title: "Quotation #",
      dataIndex: "quotationNumber",
      key: "quotationNumber",
      sorter: true,
    },
    {
      title: "Client",
      dataIndex: "clientName",
      key: "clientName",
      sorter: true,
    },
    {
      title: "Project",
      dataIndex: "projectName",
      key: "projectName",
      sorter: true,
    },
    {
      title: "Issue Date",
      dataIndex: "issueDate",
      key: "issueDate",
      render: (date: string) => moment(date).format("DD MMM YYYY"),
      sorter: true,
    },
    {
      title: "Valid Until",
      dataIndex: "validUntil",
      key: "validUntil",
      render: (date: string) =>
        date ? moment(date).format("DD MMM YYYY") : "N/A",
      sorter: true,
    },
    {
      title: "Total (IDR)",
      dataIndex: "total",
      key: "total",
      render: (total: number) =>
        total ? `Rp ${total.toLocaleString("id-ID")}` : "Rp 0",
      sorter: true,
      align: "right" as "right",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: QuotationStatus) => renderStatusTag(status),
      sorter: true,
    },
    {
      title: "Action",
      key: "action",
      render: (record: Quotation) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/quotations/${record.id}`)}
            title="View Details"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/quotations/edit/${record.id}`)}
            title="Edit"
          />
          <Button
            type="text"
            icon={<FilePdfOutlined />}
            onClick={() => handleExportToPdf(record.id as number)}
            title="Export to PDF"
          />
          <Button
            type="text"
            icon={<FileExcelOutlined />}
            onClick={() => handleExportToExcel(record.id as number)}
            title="Export to Excel"
          />
          <Popconfirm
            title="Are you sure you want to delete this quotation?"
            onConfirm={() => handleDelete(record.id as number)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Delete"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="quotation-list-container">
      <Card className="quotation-list-card">
        <div className="quotation-list-header">
          <Title level={2}>Quotations</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/quotations/create")}
          >
            Create New Quotation
          </Button>
        </div>

        {filterVisible && (
          <Card className="filter-card">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Status"
                  style={{ width: "100%" }}
                  allowClear
                  onChange={(value) => handleFilterChange("status", value)}
                  value={filter.status}
                >
                  {Object.values(QuotationStatus).map((status) => (
                    <Option key={status} value={status}>
                      {status.replace(/_/g, " ").toUpperCase()}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Input
                  placeholder="Client Name"
                  allowClear
                  onChange={(e) =>
                    handleFilterChange("clientName", e.target.value)
                  }
                  value={filter.clientName}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <RangePicker
                  style={{ width: "100%" }}
                  onChange={handleDateRangeChange}
                  value={
                    filter.startDate && filter.endDate
                      ? [moment(filter.startDate), moment(filter.endDate)]
                      : undefined
                  }
                />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <div className="filter-buttons">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleResetFilter}
                    style={{ marginRight: 8 }}
                  >
                    Reset
                  </Button>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Input.Search
            placeholder="Search quotations..."
            onSearch={handleSearch}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Button type="link" onClick={() => setFilterVisible(!filterVisible)}>
            {filterVisible ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={quotations}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default QuotationList;
