import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Switch,
  Space,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  EquipmentCategory,
  EquipmentService,
} from "../../services/EquipmentService";
import "./styles.css";

const { Title } = Typography;
const { TextArea } = Input;

interface CategoryFormProps {
  mode: "create" | "edit";
}

const CategoryForm: React.FC<CategoryFormProps> = ({ mode }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [category, setCategory] = useState<EquipmentCategory | null>(null);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const equipmentService = new EquipmentService();

  useEffect(() => {
    if (mode === "edit" && id) {
      fetchCategory(parseInt(id));
    }
  }, [mode, id]);

  const fetchCategory = async (categoryId: number) => {
    try {
      setLoading(true);
      const response = await equipmentService.getCategoryById(categoryId);
      setCategory(response.data);

      // Set form values
      form.setFieldsValue({
        name: response.data.name,
        description: response.data.description,
        isActive: response.data.isActive,
      });
    } catch (error) {
      message.error("Failed to fetch category details");
      console.error(error);
      navigate("/equipment-categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      if (mode === "create") {
        await equipmentService.createCategory(values);
        message.success("Category created successfully");
      } else if (mode === "edit" && id) {
        await equipmentService.updateCategory(parseInt(id), values);
        message.success("Category updated successfully");
      }

      navigate("/equipment-categories");
    } catch (error) {
      message.error(
        mode === "create"
          ? "Failed to create category"
          : "Failed to update category"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-form-container">
      <Card className="category-form-card">
        <Title level={2}>
          {mode === "create" ? "Create New Category" : "Edit Category"}
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
          }}
          className="category-form"
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Enter category description" />
          </Form.Item>

          <Form.Item name="isActive" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item className="form-actions">
            <Space>
              <Button onClick={() => navigate("/equipment-categories")}>
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

export default CategoryForm;
