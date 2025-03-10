import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Divider,
  Table,
  Space,
  Button,
  Row,
  Col,
  Modal,
  message,
  Tabs,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  ArrowLeftOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  Quotation,
  QuotationService,
  QuotationStatus,
  QuotationItem,
  ItemType,
} from "../../services/QuotationService";
import "./styles.css";
import moment from "moment";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const QuotationDetail: React.FC = () => {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusModalVisible, setStatusModalVisible] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<QuotationStatus | null>(
    null
  );

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quotationService = new QuotationService();

  useEffect(() => {
    if (id) {
      fetchQuotation(parseInt(id));
    }
  }, [id]);

  const fetchQuotation = async (quotationId: number) => {
    try {
      setLoading(true);
      const response = await quotationService.getQuotationById(quotationId);
      setQuotation(response.data);
    } catch (error) {
      message.error("Failed to fetch quotation details");
      console.error(error);
      navigate("/quotations");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: QuotationStatus) => {
    try {
      setLoading(true);
      await quotationService.updateQuotationStatus(parseInt(id!), status);
      message.success(`Quotation status updated to ${status}`);
      fetchQuotation(parseInt(id!));
      setStatusModalVisible(false);
    } catch (error) {
      message.error("Failed to update quotation status");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportToPdf = async () => {
    try {
      const blob = await quotationService.exportQuotationToPdf(parseInt(id!));
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

  const handleExportToExcel = async () => {
    try {
      const blob = await quotationService.exportQuotationToExcel(parseInt(id!));
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

  const handleDelete = async () => {
    Modal.confirm({
      title: "Delete Quotation",
      content: "Are you sure you want to delete this quotation?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await quotationService.deleteQuotation(parseInt(id!));
          message.success("Quotation deleted successfully");
          navigate("/quotations");
        } catch (error) {
          message.error("Failed to delete quotation");
          console.error(error);
        }
      },
    });
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

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "Rp 0";
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  const itemColumns = [
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      width: 100,
    },
    {
      title: "Days",
      dataIndex: "days",
      key: "days",
      width: 80,
    },
    {
      title: "Price/Day",
      dataIndex: "pricePerDay",
      key: "pricePerDay",
      render: (price: number) => formatCurrency(price),
      width: 150,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total: number) => formatCurrency(total),
      width: 150,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: ItemType) => {
        let color = "blue";
        if (type === ItemType.SERVICE) color = "purple";
        if (type === ItemType.SALE) color = "green";
        return <Tag color={color}>{type.toUpperCase()}</Tag>;
      },
      width: 100,
    },
  ];

  const showStatusModal = (status: QuotationStatus) => {
    setSelectedStatus(status);
    setStatusModalVisible(true);
  };

  const renderStatusUpdateButtons = () => {
    if (!quotation) return null;

    const { status } = quotation;

    if (status === QuotationStatus.DRAFT) {
      return (
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={() => handleStatusChange(QuotationStatus.SENT)}
        >
          Mark as Sent
        </Button>
      );
    }

    if (status === QuotationStatus.SENT) {
      return (
        <Space>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleStatusChange(QuotationStatus.APPROVED)}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            Mark as Approved
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => handleStatusChange(QuotationStatus.REJECTED)}
          >
            Mark as Rejected
          </Button>
        </Space>
      );
    }

    if (status === QuotationStatus.APPROVED) {
      return (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleStatusChange(QuotationStatus.CONVERTED_TO_DO)}
            style={{ backgroundColor: "#722ed1", borderColor: "#722ed1" }}
          >
            Convert to Delivery Order
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() =>
              handleStatusChange(QuotationStatus.CONVERTED_TO_INVOICE)
            }
            style={{ backgroundColor: "#a0d911", borderColor: "#a0d911" }}
          >
            Convert to Invoice
          </Button>
        </Space>
      );
    }

    return null;
  };

  if (!quotation) {
    return (
      <div className="quotation-detail-container">
        <Card loading={loading} className="quotation-detail-card">
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Title level={3}>Loading quotation details...</Title>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="quotation-detail-container">
      <Card className="quotation-detail-card">
        <div className="quotation-detail-header">
          <div>
            <Title level={2}>Quotation Details</Title>
            <Title level={4}>{quotation.quotationNumber}</Title>
          </div>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/quotations")}
            >
              Back to List
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/quotations/edit/${id}`)}
            >
              Edit
            </Button>
            <Button icon={<FilePdfOutlined />} onClick={handleExportToPdf}>
              Export PDF
            </Button>
            <Button icon={<FileExcelOutlined />} onClick={handleExportToExcel}>
              Export Excel
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              Delete
            </Button>
          </Space>
        </div>

        <Tabs defaultActiveKey="details">
          <TabPane tab="Details" key="details">
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Card
                  title="Client Information"
                  className="quotation-info-section"
                >
                  <Descriptions column={1} size="small" layout="vertical">
                    <Descriptions.Item label="Name">
                      {quotation.clientName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {quotation.clientEmail || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      {quotation.clientPhone || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Address">
                      {quotation.clientAddress || "N/A"}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  title="Project Information"
                  className="quotation-info-section"
                >
                  <Descriptions column={1} size="small" layout="vertical">
                    <Descriptions.Item label="Project Name">
                      {quotation.projectName || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Issue Date">
                      {moment(quotation.issueDate).format("DD MMM YYYY")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Valid Until">
                      {quotation.validUntil
                        ? moment(quotation.validUntil).format("DD MMM YYYY")
                        : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      {renderStatusTag(quotation.status as QuotationStatus)}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            <Card title="Quotation Items" className="quotation-section">
              <Table
                columns={itemColumns}
                dataSource={quotation.items || []}
                rowKey="id"
                pagination={false}
                scroll={{ x: "max-content" }}
              />

              <Row style={{ marginTop: 24 }}>
                <Col span={16}></Col>
                <Col span={8}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text style={{ marginRight: 16 }}>Subtotal:</Text>
                      <Text>{formatCurrency(quotation.subtotal)}</Text>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text style={{ marginRight: 16 }}>
                        Tax ({quotation.tax}%):
                      </Text>
                      <Text>
                        {formatCurrency(
                          (quotation.subtotal || 0) *
                            ((quotation.tax || 0) / 100)
                        )}
                      </Text>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text style={{ marginRight: 16 }}>
                        Discount ({quotation.discount}%):
                      </Text>
                      <Text>
                        {formatCurrency(
                          (quotation.subtotal || 0) *
                            ((quotation.discount || 0) / 100)
                        )}
                      </Text>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ marginRight: 16 }}>
                        Total:
                      </Text>
                      <Text strong>{formatCurrency(quotation.total)}</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            <Card title="Additional Information" className="quotation-section">
              <Title level={5}>Notes</Title>
              <Paragraph>{quotation.notes || "No notes"}</Paragraph>

              <Divider />

              <Title level={5}>Terms and Conditions</Title>
              <Paragraph>
                {quotation.terms || "No terms and conditions"}
              </Paragraph>
            </Card>

            <div className="quotation-actions">
              {renderStatusUpdateButtons()}
            </div>
          </TabPane>

          <TabPane tab="Preview" key="preview">
            <Card>
              <div className="print-document">
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <Title level={3}>QUOTATION</Title>
                  <Title level={4}>{quotation.quotationNumber}</Title>
                </div>

                <Row gutter={24}>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>Client Information</Text>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Name">
                          {quotation.clientName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                          {quotation.clientEmail || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phone">
                          {quotation.clientPhone || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Address">
                          {quotation.clientAddress || "N/A"}
                        </Descriptions.Item>
                      </Descriptions>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>Project Information</Text>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Project">
                          {quotation.projectName || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Issue Date">
                          {moment(quotation.issueDate).format("DD MMM YYYY")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Valid Until">
                          {quotation.validUntil
                            ? moment(quotation.validUntil).format("DD MMM YYYY")
                            : "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                          {renderStatusTag(quotation.status as QuotationStatus)}
                        </Descriptions.Item>
                      </Descriptions>
                    </div>
                  </Col>
                </Row>

                <Divider />

                <Title level={5}>Quotation Items</Title>
                <Table
                  columns={itemColumns}
                  dataSource={quotation.items || []}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ x: "max-content" }}
                />

                <Row style={{ marginTop: 24 }}>
                  <Col span={16}></Col>
                  <Col span={8}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ marginBottom: 8 }}>
                        <Text style={{ marginRight: 16 }}>Subtotal:</Text>
                        <Text>{formatCurrency(quotation.subtotal)}</Text>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Text style={{ marginRight: 16 }}>
                          Tax ({quotation.tax}%):
                        </Text>
                        <Text>
                          {formatCurrency(
                            (quotation.subtotal || 0) *
                              ((quotation.tax || 0) / 100)
                          )}
                        </Text>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Text style={{ marginRight: 16 }}>
                          Discount ({quotation.discount}%):
                        </Text>
                        <Text>
                          {formatCurrency(
                            (quotation.subtotal || 0) *
                              ((quotation.discount || 0) / 100)
                          )}
                        </Text>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ marginRight: 16 }}>
                          Total:
                        </Text>
                        <Text strong>{formatCurrency(quotation.total)}</Text>
                      </div>
                    </div>
                  </Col>
                </Row>

                <Divider />

                <div style={{ marginTop: 16 }}>
                  <Title level={5}>Notes</Title>
                  <Text>{quotation.notes || "No notes"}</Text>

                  <Title level={5} style={{ marginTop: 16 }}>
                    Terms and Conditions
                  </Title>
                  <Text>{quotation.terms || "No terms and conditions"}</Text>
                </div>

                <div style={{ marginTop: 24, textAlign: "center" }}>
                  <Button
                    icon={<PrinterOutlined />}
                    onClick={() => window.print()}
                  >
                    Print
                  </Button>
                </div>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default QuotationDetail;
