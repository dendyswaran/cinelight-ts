import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Divider,
  DatePicker,
  InputNumber,
  Select,
  Table,
  Row,
  Col,
  Tabs,
  Tooltip,
  Descriptions,
  Tag,
  Collapse,
  Empty,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  FileAddOutlined,
  CalculatorOutlined,
  AppstoreOutlined,
  TagsOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useQuotationForm from "./hooks/useQuotationForm";
import {
  QuotationItem,
  QuotationStatus,
  QuotationSection,
  QuotationItemGroup,
  ItemType,
} from "../../services/QuotationService";
import "./styles.css";
import moment from "moment";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

interface QuotationFormProps {
  mode: "create" | "edit";
}

const QuotationForm: React.FC<QuotationFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("details");

  const {
    form,
    itemForm,
    sectionForm,
    groupForm,
    loading,
    submitting,
    quotation,
    items,
    sections,
    groups,
    equipment,
    subtotal,
    tax,
    discount,
    total,
    selectedSectionId,
    selectedGroupId,
    setSelectedSectionId,
    setSelectedGroupId,
    handleSubmit,
    handleAddItem,
    handleRemoveItem,
    handleAddSection,
    handleRemoveSection,
    handleAddGroup,
    handleRemoveGroup,
    formatCurrency,
    parseCurrency,
  } = useQuotationForm({ mode });

  // Table columns for items within a group
  const groupItemColumns = [
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
    },
    {
      title: "Price/Day",
      dataIndex: "pricePerDay",
      key: "pricePerDay",
      render: (price: number) => formatCurrency(price),
      width: 150,
    },
    {
      title: "Days",
      dataIndex: "days",
      key: "days",
      width: 80,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total: number) => formatCurrency(total),
      width: 150,
    },
    {
      title: "Action",
      key: "action",
      render: (record: QuotationItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id as number)}
        />
      ),
      width: 80,
    },
  ];

  // Table columns for standalone items (not in a group)
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
    {
      title: "Action",
      key: "action",
      render: (record: QuotationItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id as number)}
        />
      ),
      width: 80,
    },
  ];

  const handleStatusChange = (value: QuotationStatus) => {
    form.setFieldValue("status", value);
  };

  // Render sections, groups, and items
  const renderSectionsAndGroups = () => {
    if (sections.length === 0) {
      return (
        <Empty
          description="No sections added"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <Collapse
        defaultActiveKey={sections.map((s) => s.id?.toString() || "")}
        expandIconPosition="start"
      >
        {sections.map((section) => (
          <Panel
            key={section.id?.toString() || ""}
            header={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <span>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  {section.name} - {moment(section.date).format("DD MMM YYYY")}
                </span>
                <span>
                  <Tag color="blue">
                    Subtotal: {formatCurrency(section.subtotal)}
                  </Tag>
                </span>
              </div>
            }
            extra={
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  if (section.id) handleRemoveSection(section.id);
                }}
              />
            }
          >
            <div className="section-content">
              {section.description && (
                <p className="section-description">{section.description}</p>
              )}

              {/* Section groups */}
              <div className="section-groups">
                <div className="section-groups-header">
                  <Title level={5}>Groups</Title>
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      if (section.id) setSelectedSectionId(section.id);
                      groupForm.resetFields();
                    }}
                  >
                    Add Group
                  </Button>
                </div>

                {selectedSectionId === section.id && (
                  <Card className="group-form-card">
                    <Form
                      form={groupForm}
                      layout="vertical"
                      onFinish={handleAddGroup}
                    >
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="name"
                            label="Group Name"
                            rules={[
                              {
                                required: true,
                                message: "Please enter group name",
                              },
                            ]}
                          >
                            <Input placeholder="Enter group name, e.g. Camera Package" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="description" label="Description">
                            <Input placeholder="Enter group description" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item>
                        <Button type="primary" htmlType="submit">
                          Add Group
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>
                )}

                {/* Display groups in this section */}
                {groups.filter((group) => group.sectionId === section.id)
                  .length === 0 ? (
                  <Empty
                    description="No groups in this section"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <Collapse>
                    {groups
                      .filter((group) => group.sectionId === section.id)
                      .map((group) => (
                        <Panel
                          key={group.id?.toString() || ""}
                          header={
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                width: "100%",
                              }}
                            >
                              <span>
                                <TagsOutlined style={{ marginRight: 8 }} />
                                {group.name}
                              </span>
                              <span>
                                <Tag color="green">
                                  Total: {formatCurrency(group.total)}
                                </Tag>
                              </span>
                            </div>
                          }
                          extra={
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (group.id) handleRemoveGroup(group.id);
                              }}
                            />
                          }
                        >
                          <div className="group-content">
                            {group.description && (
                              <p className="group-description">
                                {group.description}
                              </p>
                            )}

                            {/* Group items form */}
                            <div className="group-items-header">
                              <Title level={5}>Items in Group</Title>
                              <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                  if (group.id) setSelectedGroupId(group.id);
                                  itemForm.resetFields();
                                }}
                              >
                                Add Item to Group
                              </Button>
                            </div>

                            {selectedGroupId === group.id && renderItemForm()}

                            {/* Group items table */}
                            <Table
                              dataSource={items.filter(
                                (item) => item.groupId === group.id
                              )}
                              columns={groupItemColumns}
                              rowKey="id"
                              pagination={false}
                              size="small"
                            />
                          </div>
                        </Panel>
                      ))}
                  </Collapse>
                )}
              </div>
            </div>
          </Panel>
        ))}
      </Collapse>
    );
  };

  // Render standalone items (not in any group)
  const renderStandaloneItems = () => {
    const standaloneItems = items.filter((item) => !item.groupId);

    return (
      <div>
        <div className="standalone-items-header">
          <Title level={4}>Standalone Items</Title>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedGroupId(undefined);
              itemForm.resetFields();
            }}
          >
            Add Standalone Item
          </Button>
        </div>

        {!selectedGroupId && renderItemForm()}

        {standaloneItems.length > 0 ? (
          <Table
            dataSource={standaloneItems}
            columns={itemColumns}
            rowKey="id"
            pagination={false}
            scroll={{ x: "max-content" }}
          />
        ) : (
          <Empty
            description="No standalone items added"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
    );
  };

  // Render the item form
  const renderItemForm = () => {
    return (
      <Form
        form={itemForm}
        layout="vertical"
        onFinish={handleAddItem}
        initialValues={{
          quantity: 1,
          days: 1,
          unit: "Set",
          type: ItemType.RENTAL,
        }}
        className="item-form-card"
      >
        <Row gutter={16}>
          <Col xs={24} md={6}>
            <Form.Item name="equipmentId" label="Select Equipment">
              <Select
                placeholder="Select equipment"
                allowClear
                showSearch
                optionFilterProp="children"
                onChange={(value) => {
                  const selected = equipment.find((e) => e.id === value);
                  if (selected) {
                    itemForm.setFieldsValue({
                      itemName: selected.name,
                      pricePerDay: selected.dailyRentalPrice,
                    });
                  }
                }}
              >
                {equipment.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.name} - {formatCurrency(item.dailyRentalPrice)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="itemName"
              label="Item Name"
              rules={[{ required: true, message: "Please enter item name" }]}
            >
              <Input placeholder="Enter item name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={3}>
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, message: "Please enter quantity" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={3}>
            <Form.Item name="unit" label="Unit">
              <Input placeholder="Set" />
            </Form.Item>
          </Col>
          <Col xs={24} md={3}>
            <Form.Item
              name="days"
              label="Days"
              rules={[{ required: true, message: "Please enter days" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={3}>
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: "Please select type" }]}
            >
              <Select>
                {Object.values(ItemType).map((type) => (
                  <Option key={type} value={type}>
                    {type.toUpperCase()}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="description" label="Description">
              <TextArea rows={2} placeholder="Enter item description" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="remarks" label="Remarks">
              <Input placeholder="Enter remarks" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="pricePerDay"
              label="Price Per Day"
              rules={[{ required: true, message: "Please enter price" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) => formatCurrency(value as number)}
                parser={(value) => parseCurrency(value)}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button
            type="primary"
            block
            icon={<PlusOutlined />}
            onClick={() => itemForm.submit()}
          >
            Add Item
          </Button>
        </Form.Item>
      </Form>
    );
  };

  return (
    <div className="quotation-form-container">
      <Card className="quotation-form-card">
        <div className="quotation-list-header">
          <Title level={2}>
            {mode === "create" ? "Create Quotation" : "Edit Quotation"}
          </Title>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/quotations")}
            >
              Back to List
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={submitting}
              onClick={() => form.submit()}
            >
              {mode === "create" ? "Create" : "Update"}
            </Button>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
          <TabPane tab="Quotation Details" key="details">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                status: QuotationStatus.DRAFT,
                tax: 11,
                discount: 0,
              }}
              className="quotation-form"
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Card
                    title="Client Information"
                    className="client-info-section"
                  >
                    <Form.Item
                      name="clientName"
                      label="Client Name"
                      rules={[
                        { required: true, message: "Please enter client name" },
                      ]}
                    >
                      <Input placeholder="Enter client name" />
                    </Form.Item>

                    <Form.Item
                      name="clientEmail"
                      label="Client Email"
                      rules={[
                        {
                          type: "email",
                          message: "Please enter a valid email",
                        },
                      ]}
                    >
                      <Input placeholder="Enter client email" />
                    </Form.Item>

                    <Form.Item name="clientPhone" label="Client Phone">
                      <Input placeholder="Enter client phone number" />
                    </Form.Item>

                    <Form.Item name="clientAddress" label="Client Address">
                      <TextArea rows={3} placeholder="Enter client address" />
                    </Form.Item>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card
                    title="Project Details"
                    className="project-info-section"
                  >
                    <Form.Item
                      name="quotationNumber"
                      label="Quotation Number"
                      rules={[
                        {
                          required: true,
                          message: "Quotation number is required",
                        },
                      ]}
                    >
                      <Input disabled />
                    </Form.Item>

                    <Form.Item name="projectName" label="Project Name">
                      <Input placeholder="Enter project name" />
                    </Form.Item>

                    <Form.Item
                      name="projectDescription"
                      label="Project Description"
                    >
                      <TextArea
                        rows={3}
                        placeholder="Enter project description"
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="issueDate"
                          label="Issue Date"
                          rules={[
                            {
                              required: true,
                              message: "Issue date is required",
                            },
                          ]}
                        >
                          <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="validUntil" label="Valid Until">
                          <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name="status" label="Status">
                      <Select onChange={handleStatusChange}>
                        {Object.values(QuotationStatus).map((status) => (
                          <Option key={status} value={status}>
                            {status.replace(/_/g, " ").toUpperCase()}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Card>
                </Col>
              </Row>

              {/* Add Sections */}
              <Card title="Quotation Sections" className="sections-section">
                <div className="sections-header">
                  <div>
                    <Title level={4}>Sections</Title>
                    <Text type="secondary">
                      Create sections for different parts of the quotation
                    </Text>
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      sectionForm.resetFields();
                      // Set initial values
                      sectionForm.setFieldsValue({
                        date: moment(),
                      });
                    }}
                  >
                    Add New Section
                  </Button>
                </div>

                {/* Section form */}
                <Form
                  form={sectionForm}
                  layout="vertical"
                  className="section-form"
                  onFinish={handleAddSection}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="name"
                        label="Section Name"
                        rules={[
                          {
                            required: true,
                            message: "Please enter section name",
                          },
                        ]}
                      >
                        <Input placeholder="Enter section name, e.g. Day 1 - Shooting" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name="date"
                        label="Section Date"
                        rules={[
                          { required: true, message: "Please select a date" },
                        ]}
                      >
                        <DatePicker style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label=" " style={{ marginBottom: 0 }}>
                        <Button
                          onClick={() => sectionForm.submit()}
                          type="primary"
                        >
                          Add Section
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="description" label="Description">
                    <TextArea
                      rows={2}
                      placeholder="Enter section description"
                    />
                  </Form.Item>
                </Form>

                <Divider />

                {/* Display sections and groups */}
                {renderSectionsAndGroups()}

                <Divider />

                {/* Standalone items not in any section/group */}
                {renderStandaloneItems()}

                <Divider />

                <Row>
                  <Col xs={24} md={16}></Col>
                  <Col xs={24} md={8}>
                    <Card className="totals-section">
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text>Subtotal:</Text>
                          <Text>{formatCurrency(subtotal)}</Text>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Form.Item
                            name="tax"
                            label="Tax (%):"
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              precision={2}
                              style={{ width: 70 }}
                            />
                          </Form.Item>
                          <Text>{formatCurrency(subtotal * (tax / 100))}</Text>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Form.Item
                            name="discount"
                            label="Discount (%):"
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              precision={2}
                              style={{ width: 70 }}
                            />
                          </Form.Item>
                          <Text>
                            {formatCurrency(subtotal * (discount / 100))}
                          </Text>
                        </div>

                        <Divider style={{ margin: "8px 0" }} />

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text strong>Total:</Text>
                          <Text strong>{formatCurrency(total)}</Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </Card>

              <Card title="Additional Information" className="form-section">
                <Form.Item name="notes" label="Notes">
                  <TextArea rows={3} placeholder="Enter notes for the client" />
                </Form.Item>

                <Form.Item name="terms" label="Terms and Conditions">
                  <TextArea rows={3} placeholder="Enter terms and conditions" />
                </Form.Item>
              </Card>

              <div className="form-actions">
                <Space>
                  <Button onClick={() => navigate("/quotations")}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit" loading={submitting}>
                    {mode === "create" ? "Create" : "Update"}
                  </Button>
                </Space>
              </div>
            </Form>
          </TabPane>

          <TabPane tab="Preview" key="preview">
            <Card>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <Title level={3}>QUOTATION</Title>
                <Text strong>
                  {form.getFieldValue("quotationNumber") || "DRAFT"}
                </Text>
              </div>

              <Row gutter={24}>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Client Information</Text>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Name">
                        {form.getFieldValue("clientName") || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        {form.getFieldValue("clientEmail") || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Phone">
                        {form.getFieldValue("clientPhone") || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Address">
                        {form.getFieldValue("clientAddress") || "N/A"}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Project Information</Text>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Project">
                        {form.getFieldValue("projectName") || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Issue Date">
                        {form
                          .getFieldValue("issueDate")
                          ?.format("DD MMM YYYY") || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Valid Until">
                        {form
                          .getFieldValue("validUntil")
                          ?.format("DD MMM YYYY") || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Status">
                        {form.getFieldValue("status") || "DRAFT"}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                </Col>
              </Row>

              <Divider />

              {/* Preview Sections */}
              {sections.length > 0 && (
                <>
                  <Title level={5}>Sections</Title>
                  {sections.map((section) => (
                    <div key={section.id} className="preview-section">
                      <Card
                        title={`${section.name} - ${moment(section.date).format(
                          "DD MMM YYYY"
                        )}`}
                      >
                        {section.description && <p>{section.description}</p>}

                        {/* Section's groups */}
                        {groups
                          .filter((group) => group.sectionId === section.id)
                          .map((group) => (
                            <div key={group.id} className="preview-group">
                              <Card
                                type="inner"
                                title={group.name}
                                extra={
                                  <Tag color="green">
                                    Total: {formatCurrency(group.total)}
                                  </Tag>
                                }
                              >
                                {group.description && (
                                  <p>{group.description}</p>
                                )}

                                {/* Group's items */}
                                <Table
                                  dataSource={items.filter(
                                    (item) => item.groupId === group.id
                                  )}
                                  columns={groupItemColumns.filter(
                                    (col) => col.key !== "action"
                                  )}
                                  rowKey="id"
                                  pagination={false}
                                  size="small"
                                />
                              </Card>
                            </div>
                          ))}

                        <div style={{ textAlign: "right", marginTop: 8 }}>
                          <Text strong>
                            Section Total: {formatCurrency(section.subtotal)}
                          </Text>
                        </div>
                      </Card>
                    </div>
                  ))}
                </>
              )}

              {/* Standalone Items */}
              {items.filter((item) => !item.groupId).length > 0 && (
                <>
                  <Title level={5}>Items</Title>
                  <Table
                    columns={itemColumns.filter((col) => col.key !== "action")}
                    dataSource={items.filter((item) => !item.groupId)}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    scroll={{ x: "max-content" }}
                  />
                </>
              )}

              <Row style={{ marginTop: 24 }}>
                <Col span={16}></Col>
                <Col span={8}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text style={{ marginRight: 16 }}>Subtotal:</Text>
                      <Text>{formatCurrency(subtotal)}</Text>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text style={{ marginRight: 16 }}>Tax ({tax}%):</Text>
                      <Text>{formatCurrency(subtotal * (tax / 100))}</Text>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text style={{ marginRight: 16 }}>
                        Discount ({discount}%):
                      </Text>
                      <Text>{formatCurrency(subtotal * (discount / 100))}</Text>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ marginRight: 16 }}>
                        Total:
                      </Text>
                      <Text strong>{formatCurrency(total)}</Text>
                    </div>
                  </div>
                </Col>
              </Row>

              <Divider />

              <div style={{ marginTop: 16 }}>
                <Title level={5}>Notes</Title>
                <Text>{form.getFieldValue("notes") || "No notes"}</Text>

                <Title level={5} style={{ marginTop: 16 }}>
                  Terms and Conditions
                </Title>
                <Text>
                  {form.getFieldValue("terms") || "No terms and conditions"}
                </Text>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default QuotationForm;
