import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Card,
  Typography,
  message,
  Switch,
  Space,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  Equipment,
  EquipmentCategory,
  EquipmentService,
} from "../../services/EquipmentService";
import "./styles.css";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface EquipmentFormProps {
  mode: "create" | "edit";
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ mode }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [equipment, setEquipment] = useState<Equipment | null>(null);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const equipmentService = new EquipmentService();

  useEffect(() => {
    fetchCategories();

    if (mode === "edit" && id) {
      fetchEquipment(parseInt(id));
    }
  }, [mode, id]);

  const fetchCategories = async () => {
    try {
      const response = await equipmentService.getAllCategories({ limit: 100 });
      setCategories(response.data);
    } catch (error) {
      message.error("Failed to fetch categories");
      console.error(error);
    }
  };

  const fetchEquipment = async (equipmentId: number) => {
    try {
      setLoading(true);
      const response = await equipmentService.getEquipmentById(equipmentId);
      setEquipment(response.data);

      // Set form values
      form.setFieldsValue({
        name: response.data.name,
        description: response.data.description,
        dailyRentalPrice: response.data.dailyRentalPrice,
        quantity: response.data.quantity,
        categoryId: response.data.categoryId,
        isActive: response.data.isActive,
      });
    } catch (error) {
      message.error("Failed to fetch equipment details");
      console.error(error);
      navigate("/equipment");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      if (mode === "create") {
        await equipmentService.createEquipment(values);
        message.success("Equipment created successfully");
      } else if (mode === "edit" && id) {
        await equipmentService.updateEquipment(parseInt(id), values);
        message.success("Equipment updated successfully");
      }

      navigate("/equipment");
    } catch (error) {
      message.error(
        mode === "create"
          ? "Failed to create equipment"
          : "Failed to update equipment"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Format number as IDR
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "";
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  // Parse IDR string to number
  const parseCurrency = (value: string | undefined) => {
    if (!value || value === "Rp ") return undefined;
    return Number(value.replace(/[^\d]/g, ""));
  };

  return (
    <div className="equipment-form-container">
      <Card className="equipment-form-card">
        <Title level={2}>
          {mode === "create" ? "Create New Equipment" : "Edit Equipment"}
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
            quantity: 1,
          }}
        >
          <Form.Item
            name="name"
            label="Equipment Name"
            rules={[{ required: true, message: "Please enter equipment name" }]}
          >
            <Input placeholder="Enter equipment name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Enter equipment description" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select placeholder="Select category">
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="dailyRentalPrice"
            label="Daily Rental Price (IDR)"
            rules={[
              { required: true, message: "Please enter daily rental price" },
              { type: "number", min: 0, message: "Price cannot be negative" },
            ]}
          >
            <InputNumber
              min={0}
              step={1000}
              style={{ width: "100%" }}
              placeholder="0"
              formatter={(value) => formatCurrency(value)}
              // @ts-ignore
              parser={(value) => parseCurrency(value)}
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[
              { required: true, message: "Please enter quantity" },
              {
                type: "number",
                min: 0,
                message: "Quantity cannot be negative",
              },
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Enter quantity"
            />
          </Form.Item>

          <Form.Item name="isActive" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item className="form-actions">
            <Space>
              <Button onClick={() => navigate("/equipment")}>Cancel</Button>
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

export default EquipmentForm;
