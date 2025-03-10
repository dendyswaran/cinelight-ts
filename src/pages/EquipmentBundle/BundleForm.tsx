import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  InputNumber,
  Card,
  Typography,
  message,
  Switch,
  Space,
  Select,
  Divider,
  Table,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  Equipment,
  EquipmentBundle,
  EquipmentBundleItem,
  EquipmentService,
} from "../../services/EquipmentService";
import "./styles.css";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface BundleFormProps {
  mode: "create" | "edit";
}

const BundleForm: React.FC<BundleFormProps> = ({ mode }) => {
  const [form] = Form.useForm();
  const [itemsForm] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [bundle, setBundle] = useState<EquipmentBundle | null>(null);
  const [bundleItems, setBundleItems] = useState<EquipmentBundleItem[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<number | null>(
    null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const equipmentService = new EquipmentService();

  useEffect(() => {
    fetchEquipment();

    if (mode === "edit" && id) {
      fetchBundle(parseInt(id));
    }
  }, [mode, id]);

  // Calculate the bundle price automatically
  useEffect(() => {
    calculateBundlePrice();
  }, [bundleItems]);

  const fetchEquipment = async () => {
    try {
      const response = await equipmentService.getAllEquipment({ limit: 100 });
      setEquipment(response.data);
    } catch (error) {
      message.error("Failed to fetch equipment");
      console.error(error);
    }
  };

  const fetchBundle = async (bundleId: number) => {
    try {
      setLoading(true);
      const response = await equipmentService.getBundleById(bundleId);
      const bundleData = response.data;
      setBundle(bundleData);

      // Set bundle items
      if (bundleData.bundleItems) {
        setBundleItems(bundleData.bundleItems);
      }

      // Set form values
      form.setFieldsValue({
        name: bundleData.name,
        description: bundleData.description,
        dailyRentalPrice: bundleData.dailyRentalPrice,
        discount: bundleData.discount,
        isActive: bundleData.isActive,
      });
    } catch (error) {
      message.error("Failed to fetch bundle details");
      console.error(error);
      navigate("/equipment-bundles");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (bundleItems.length === 0) {
        message.error("Bundle must have at least one item");
        return;
      }

      setLoading(true);

      // Prepare bundle data
      const bundleData = {
        ...values,
        bundleItems: bundleItems.map((item) => ({
          equipmentId: item.equipmentId,
          quantity: item.quantity,
        })),
      };

      if (mode === "create") {
        await equipmentService.createBundle(bundleData);
        message.success("Bundle created successfully");
      } else if (mode === "edit" && id) {
        await equipmentService.updateBundle(parseInt(id), bundleData);
        message.success("Bundle updated successfully");
      }

      navigate("/equipment-bundles");
    } catch (error) {
      message.error(
        mode === "create"
          ? "Failed to create bundle"
          : "Failed to update bundle"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!selectedEquipment) {
      message.error("Please select equipment");
      return;
    }

    if (quantity <= 0) {
      message.error("Quantity must be greater than 0");
      return;
    }

    // Check if this equipment is already in the bundle
    const existingItem = bundleItems.find(
      (item) => item.equipmentId === selectedEquipment
    );
    if (existingItem) {
      // Update quantity
      const updatedItems = bundleItems.map((item) => {
        if (item.equipmentId === selectedEquipment) {
          return { ...item, quantity: item.quantity + quantity };
        }
        return item;
      });
      setBundleItems(updatedItems);
    } else {
      // Find the selected equipment
      const selectedEquipmentItem = equipment.find(
        (e) => e.id === selectedEquipment
      );

      // Add new item
      const newItem: EquipmentBundleItem = {
        id: Date.now(), // Temporary ID for UI
        bundleId: bundle?.id || 0,
        equipmentId: selectedEquipment,
        quantity: quantity,
        equipment: selectedEquipmentItem,
      };

      setBundleItems([...bundleItems, newItem]);
    }

    // Reset selection
    setSelectedEquipment(null);
    setQuantity(1);
    itemsForm.resetFields();
  };

  const handleRemoveItem = (equipmentId: number) => {
    setBundleItems(
      bundleItems.filter((item) => item.equipmentId !== equipmentId)
    );
  };

  const calculateBundlePrice = () => {
    let totalPrice = 0;

    bundleItems.forEach((item) => {
      const equip = equipment.find((e) => e.id === item.equipmentId);
      if (equip) {
        totalPrice += equip.dailyRentalPrice * item.quantity;
      }
    });

    setCalculatedPrice(totalPrice);

    // Update price in form if this is a create operation
    if (mode === "create") {
      // Apply discount if set
      const discount = form.getFieldValue("discount") || 0;
      const discountedPrice = totalPrice * (1 - discount / 100);

      form.setFieldsValue({
        dailyRentalPrice: discountedPrice,
      });
    }
  };

  const handleDiscountChange = (value: number | null) => {
    if (value === null) return;

    // Recalculate price with new discount
    const discountedPrice = calculatedPrice * (1 - value / 100);
    form.setFieldsValue({
      dailyRentalPrice: discountedPrice,
    });
  };

  // Format number as IDR
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "";
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  // Parse IDR string to number
  const parseCurrency = (value: string | undefined) => {
    if (!value || value === "Rp ") return 0;
    return Number(value.replace(/[^\d]/g, ""));
  };

  const bundleItemsColumns = [
    {
      title: "Equipment",
      dataIndex: "equipment",
      key: "equipment",
      render: (equipment: Equipment) => equipment?.name || "Unknown",
    },
    {
      title: "Daily Price",
      dataIndex: "equipment",
      key: "price",
      render: (equipment: Equipment) =>
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
    {
      title: "Action",
      key: "action",
      render: (record: EquipmentBundleItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.equipmentId)}
        />
      ),
    },
  ];

  return (
    <div className="equipment-form-container">
      <Card className="equipment-form-card">
        <Title level={2}>
          {mode === "create"
            ? "Create Equipment Bundle"
            : "Edit Equipment Bundle"}
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
            discount: 0,
          }}
        >
          <Form.Item
            name="name"
            label="Bundle Name"
            rules={[{ required: true, message: "Please enter bundle name" }]}
          >
            <Input placeholder="Enter bundle name, e.g. Camera Bundle" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={4}
              placeholder="Enter bundle description, e.g. Complete camera kit with lens, battery, etc."
            />
          </Form.Item>

          <div className="bundle-items-section">
            <Title level={4}>Bundle Items</Title>
            <Text type="secondary">Add equipment items to this bundle</Text>

            <Form
              form={itemsForm}
              layout="vertical"
              className="bundle-item-form"
              style={{ marginTop: 16 }}
            >
              <div className="bundle-item-row">
                <Space align="baseline" style={{ width: "100%" }}>
                  <Form.Item
                    name="equipmentId"
                    label="Equipment"
                    style={{ minWidth: 300 }}
                  >
                    <Select
                      placeholder="Select equipment"
                      onChange={(value) => setSelectedEquipment(value)}
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      {equipment.map((item) => (
                        <Option key={item.id} value={item.id}>
                          {item.name} - {formatCurrency(item.dailyRentalPrice)}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="quantity"
                    label="Quantity"
                    style={{ width: 150 }}
                  >
                    <InputNumber
                      min={1}
                      defaultValue={1}
                      onChange={(value) => setQuantity(value || 1)}
                    />
                  </Form.Item>

                  <Form.Item label=" " style={{ marginBottom: 0 }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddItem}
                    >
                      Add Item
                    </Button>
                  </Form.Item>
                </Space>
              </div>
            </Form>

            <Table
              dataSource={bundleItems}
              columns={bundleItemsColumns}
              rowKey="id"
              pagination={false}
              size="small"
              style={{ marginTop: 16 }}
            />

            <Divider />

            <div style={{ textAlign: "right" }}>
              <Text strong style={{ marginRight: 8 }}>
                Total List Price:
              </Text>
              <Text strong>{formatCurrency(calculatedPrice)}</Text>
            </div>
          </div>

          <Form.Item
            name="discount"
            label="Discount (%)"
            rules={[
              {
                type: "number",
                min: 0,
                max: 100,
                message: "Discount must be between 0-100%",
              },
            ]}
          >
            <InputNumber
              min={0}
              max={100}
              style={{ width: "100%" }}
              onChange={handleDiscountChange}
            />
          </Form.Item>

          <Form.Item
            name="dailyRentalPrice"
            label="Daily Rental Price (IDR)"
            rules={[
              { required: true, message: "Please enter daily rental price" },
              { type: "number", min: 0, message: "Price cannot be negative" },
            ]}
            tooltip="Set manually or calculate from items"
          >
            <InputNumber
              min={0}
              step={1000}
              style={{ width: "100%" }}
              placeholder="0"
              formatter={(value) => formatCurrency(value)}
              // @ts-ignore
              parser={(value) => parseCurrency(value)}
              addonAfter={
                <Tooltip title="Calculate from items">
                  <CalculatorOutlined onClick={calculateBundlePrice} />
                </Tooltip>
              }
            />
          </Form.Item>

          <Form.Item name="isActive" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item className="form-actions">
            <Space>
              <Button onClick={() => navigate("/equipment-bundles")}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {mode === "create" ? "Create" : "Update"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BundleForm;
